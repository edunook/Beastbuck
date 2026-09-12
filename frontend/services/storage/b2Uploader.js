/**
 * BeastBuck Resumable Direct-to-B2 Multipart Uploader
 * 
 * Slices files into Blobs, uploads parts directly to Backblaze B2 using presigned URLs,
 * tracks completed part ETags, retries failed chunks with exponential backoff & jitter,
 * persists upload state to IndexedDB, and recovers automatically from network interruptions.
 */

import {
  computeFileFingerprint,
  saveUploadSession,
  getUploadSession,
  deleteUploadSession,
} from './uploadSessionStore';

const API_BASE = '/api/media';

/**
 * Helper to call backend Media API
 */
async function callApi(endpoint, body, options = {}) {
  const token = localStorage.getItem('beastbuck_auth_token') || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `API Request failed (${res.status})`);
  }
  return data;
}

export class B2Uploader {
  constructor(file, options = {}) {
    if (!file) throw new Error('A File object is required to initialize B2Uploader');
    this.file = file;
    this.options = {
      concurrency: options.concurrency || 3, // 3 parallel part uploads
      maxRetries: options.maxRetries || 4, // Max retries per chunk
      folder: options.folder || 'uploads',
      visibility: options.visibility || 'public',
      ownerId: options.ownerId || null,
      metadata: options.metadata || {},
      onProgress: options.onProgress || (() => {}),
      onStatusChange: options.onStatusChange || (() => {}),
      ...options,
    };

    this.fingerprint = null;
    this.mediaId = null;
    this.objectKey = null;
    this.uploadId = null;
    this.isMultipart = false;
    this.partSize = 0;
    this.totalParts = 1;
    this.completedParts = []; // [{ PartNumber, ETag }]
    this.activeWorkers = 0;
    this.isPaused = false;
    this.isAborted = false;
    this.status = 'pending'; // 'pending' | 'uploading' | 'paused' | 'verifying' | 'completed' | 'error' | 'aborted'

    // Metrics for progress calculation
    this.partTransferredBytes = {}; // { [partNumber]: bytes }
    this.startTime = null;
    this.lastSpeedCheckTime = null;
    this.lastTransferredBytes = 0;
    this.currentSpeedMBps = 0;

    // AbortController map for active HTTP part requests
    this.activeControllers = new Map();

    // Bound network recovery listener
    this._handleOnline = this._handleOnline.bind(this);
    this._handleOffline = this._handleOffline.bind(this);
  }

  _setStatus(newStatus, detail = null) {
    this.status = newStatus;
    this.options.onStatusChange(newStatus, detail);
  }

  _notifyProgress(extra = {}) {
    const now = Date.now();
    let totalTransferred = 0;

    // Sum all part progress
    for (const pNum in this.partTransferredBytes) {
      totalTransferred += this.partTransferredBytes[pNum] || 0;
    }

    // Clamp to file size
    totalTransferred = Math.min(this.file.size, totalTransferred);
    const percent = Math.min(100, Math.round((totalTransferred / this.file.size) * 100));

    // Calculate moving speed in MB/s
    if (this.lastSpeedCheckTime && now - this.lastSpeedCheckTime >= 500) {
      const elapsedSec = (now - this.lastSpeedCheckTime) / 1000;
      const bytesDelta = totalTransferred - this.lastTransferredBytes;
      const instantSpeedMBps = (bytesDelta / (1024 * 1024)) / elapsedSec;
      // Smooth speed with exponential moving average
      this.currentSpeedMBps = Math.max(0, (this.currentSpeedMBps * 0.7) + (instantSpeedMBps * 0.3));
      this.lastSpeedCheckTime = now;
      this.lastTransferredBytes = totalTransferred;
    } else if (!this.lastSpeedCheckTime) {
      this.lastSpeedCheckTime = now;
      this.lastTransferredBytes = totalTransferred;
    }

    let remainingSeconds = null;
    if (this.currentSpeedMBps > 0 && totalTransferred < this.file.size) {
      const remainingBytes = this.file.size - totalTransferred;
      remainingSeconds = Math.round((remainingBytes / (1024 * 1024)) / this.currentSpeedMBps);
    }

    this.options.onProgress({
      fileName: this.file.name,
      fileSize: this.file.size,
      transferredBytes: totalTransferred,
      percent,
      speedMBps: Number(this.currentSpeedMBps.toFixed(2)),
      remainingSeconds,
      completedChunks: this.completedParts.length,
      totalChunks: this.totalParts,
      isMultipart: this.isMultipart,
      status: this.status,
      isPaused: this.isPaused,
      ...extra,
    });
  }

  /**
   * Start or resume the upload
   */
  async start() {
    this.isPaused = false;
    this.isAborted = false;
    this.startTime = Date.now();
    this.lastSpeedCheckTime = Date.now();
    this.lastTransferredBytes = 0;

    // Attach offline/online listeners
    window.addEventListener('online', this._handleOnline);
    window.addEventListener('offline', this._handleOffline);

    try {
      this._setStatus('uploading');
      this.fingerprint = await computeFileFingerprint(this.file);

      // Check for existing session in IndexedDB
      const existingSession = await getUploadSession(this.fingerprint);

      if (existingSession && existingSession.isMultipart && existingSession.uploadId) {
        // Resume session
        this.mediaId = existingSession.mediaId;
        this.objectKey = existingSession.objectKey;
        this.uploadId = existingSession.uploadId;
        this.isMultipart = true;
        this.partSize = existingSession.partSize;
        this.totalParts = existingSession.totalParts;
        this.completedParts = existingSession.completedParts || [];

        // Mark previously completed parts as 100% transferred
        for (const p of this.completedParts) {
          const pStart = (p.PartNumber - 1) * this.partSize;
          const pEnd = Math.min(this.file.size, pStart + this.partSize);
          this.partTransferredBytes[p.PartNumber] = pEnd - pStart;
        }

        this._notifyProgress({ resumed: true });
        await this._uploadMultipartParts();
      } else {
        // Initiate brand new upload
        const initData = await callApi('/initiate-upload', {
          fileName: this.file.name,
          mimeType: this.file.type || 'application/octet-stream',
          size: this.file.size,
          visibility: this.options.visibility,
          folder: this.options.folder,
          ownerId: this.options.ownerId,
          metadata: this.options.metadata,
        });

        this.mediaId = initData.mediaId;
        this.objectKey = initData.objectKey;
        this.isMultipart = initData.isMultipart;

        if (this.isMultipart) {
          this.uploadId = initData.uploadId;
          this.partSize = initData.partSize;
          this.totalParts = initData.totalParts;
          this.completedParts = [];

          await saveUploadSession({
            fingerprint: this.fingerprint,
            fileName: this.file.name,
            fileSize: this.file.size,
            mediaId: this.mediaId,
            objectKey: this.objectKey,
            uploadId: this.uploadId,
            partSize: this.partSize,
            totalParts: this.totalParts,
            completedParts: this.completedParts,
            isMultipart: true,
            visibility: this.options.visibility,
          });

          await this._uploadMultipartParts();
        } else {
          // Single Part Upload (presigned PUT)
          await this._uploadSinglePart(initData.uploadUrl);
        }
      }

      // Verification & Finalization
      this._setStatus('verifying');
      const finalizeData = await callApi('/complete-upload', {
        mediaId: this.mediaId,
        objectKey: this.objectKey,
        uploadId: this.uploadId,
        parts: this.completedParts,
        expectedSize: this.file.size,
        isMultipart: this.isMultipart,
        visibility: this.options.visibility,
      });

      // Cleanup local session on success
      await deleteUploadSession(this.fingerprint);
      this._setStatus('completed', finalizeData);
      this._cleanupListeners();

      return finalizeData;
    } catch (error) {
      if (this.isPaused) {
        this._setStatus('paused');
        return;
      }
      if (this.isAborted) {
        this._setStatus('aborted');
        return;
      }
      console.error('[B2Uploader Error]', error);
      this._setStatus('error', error);
      this._cleanupListeners();
      throw error;
    }
  }

  /**
   * Upload single small file directly via presigned PUT URL
   */
  async _uploadSinglePart(uploadUrl) {
    const controller = new AbortController();
    this.activeControllers.set(0, controller);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: this.file,
        headers: {
          'Content-Type': this.file.type || 'application/octet-stream',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Storage upload failed with HTTP ${response.status}`);
      }

      this.partTransferredBytes[1] = this.file.size;
      this._notifyProgress();
    } finally {
      this.activeControllers.delete(0);
    }
  }

  /**
   * Coordinate parallel multipart chunk uploads
   */
  async _uploadMultipartParts() {
    const completedSet = new Set(this.completedParts.map(p => p.PartNumber));
    const pendingPartNumbers = [];

    for (let i = 1; i <= this.totalParts; i++) {
      if (!completedSet.has(i)) {
        pendingPartNumbers.push(i);
      }
    }

    if (pendingPartNumbers.length === 0) return;

    // Fetch presigned URLs for pending parts in batches
    const urlBatchSize = 100;
    const presignedUrlsMap = new Map();

    for (let i = 0; i < pendingPartNumbers.length; i += urlBatchSize) {
      const chunk = pendingPartNumbers.slice(i, i + urlBatchSize);
      const urlData = await callApi('/get-part-urls', {
        objectKey: this.objectKey,
        uploadId: this.uploadId,
        partNumbers: chunk,
      });
      for (const p of urlData.parts) {
        presignedUrlsMap.set(p.partNumber, p.uploadUrl);
      }
    }

    // Worker pool for parallel uploads
    const queue = [...pendingPartNumbers];
    const workers = [];

    const worker = async () => {
      while (queue.length > 0 && !this.isPaused && !this.isAborted) {
        const partNumber = queue.shift();
        const uploadUrl = presignedUrlsMap.get(partNumber);
        if (!uploadUrl) continue;

        await this._uploadSinglePartWithRetry(partNumber, uploadUrl);
      }
    };

    const numWorkers = Math.min(this.options.concurrency, pendingPartNumbers.length);
    for (let i = 0; i < numWorkers; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    if (this.isPaused || this.isAborted) {
      return;
    }

    if (this.completedParts.length < this.totalParts) {
      throw new Error(`Upload incomplete: ${this.completedParts.length}/${this.totalParts} parts finished.`);
    }
  }

  /**
   * Slices chunk and uploads with exponential backoff & jitter
   */
  async _uploadSinglePartWithRetry(partNumber, uploadUrl) {
    let attempt = 0;
    const startByte = (partNumber - 1) * this.partSize;
    const endByte = Math.min(this.file.size, startByte + this.partSize);
    const chunkBlob = this.file.slice(startByte, endByte);
    const chunkSize = endByte - startByte;

    while (attempt <= this.options.maxRetries && !this.isPaused && !this.isAborted) {
      attempt++;
      const controller = new AbortController();
      this.activeControllers.set(partNumber, controller);

      try {
        if (attempt > 1) {
          this._notifyProgress({
            activeChunk: partNumber,
            isRetrying: true,
            retryAttempt: attempt - 1,
          });
        }

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: chunkBlob,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Part ${partNumber} upload failed (HTTP ${response.status})`);
        }

        // Extract ETag header
        const rawETag = response.headers.get('ETag') || response.headers.get('etag');
        if (!rawETag) {
          throw new Error(`Part ${partNumber} succeeded but missing ETag header from B2.`);
        }

        const etag = rawETag.replace(/^"|"$/g, '');
        this.completedParts.push({ PartNumber: partNumber, ETag: etag });
        this.partTransferredBytes[partNumber] = chunkSize;

        // Persist updated progress
        await saveUploadSession({
          fingerprint: this.fingerprint,
          fileName: this.file.name,
          fileSize: this.file.size,
          mediaId: this.mediaId,
          objectKey: this.objectKey,
          uploadId: this.uploadId,
          partSize: this.partSize,
          totalParts: this.totalParts,
          completedParts: this.completedParts,
          isMultipart: true,
          visibility: this.options.visibility,
        });

        this._notifyProgress({ activeChunk: partNumber, isRetrying: false });
        return;
      } catch (err) {
        if (this.isPaused || this.isAborted) return;

        if (attempt <= this.options.maxRetries) {
          // Exponential backoff + full jitter
          const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
          const jitter = Math.random() * 500;
          const delay = baseDelay + jitter;
          console.warn(`[B2Uploader] Part ${partNumber} failed (attempt ${attempt}/${this.options.maxRetries}). Retrying in ${Math.round(delay)}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw new Error(`Part ${partNumber} failed after ${this.options.maxRetries} retry attempts: ${err.message}`);
        }
      } finally {
        this.activeControllers.delete(partNumber);
      }
    }
  }

  /**
   * Pause the upload
   */
  pause() {
    this.isPaused = true;
    for (const controller of this.activeControllers.values()) {
      controller.abort();
    }
    this.activeControllers.clear();
    this._setStatus('paused');
  }

  /**
   * Resume paused upload
   */
  async resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    return this.start();
  }

  /**
   * Abort and cancel upload session
   */
  async abort() {
    this.isAborted = true;
    this.isPaused = false;

    for (const controller of this.activeControllers.values()) {
      controller.abort();
    }
    this.activeControllers.clear();

    if (this.uploadId && this.objectKey) {
      try {
        await callApi('/abort-upload', {
          mediaId: this.mediaId,
          objectKey: this.objectKey,
          uploadId: this.uploadId,
        });
      } catch (e) {
        console.warn('Failed to notify backend abort:', e);
      }
    }

    if (this.fingerprint) {
      await deleteUploadSession(this.fingerprint);
    }

    this._setStatus('aborted');
    this._cleanupListeners();
  }

  _handleOffline() {
    console.warn('[B2Uploader] Network disconnected. Pausing upload...');
    this.pause();
  }

  _handleOnline() {
    console.log('[B2Uploader] Network reconnected. Automatically resuming upload...');
    if (this.isPaused && !this.isAborted) {
      this.resume().catch(err => console.error('[B2Uploader Auto-Resume Error]', err));
    }
  }

  _cleanupListeners() {
    window.removeEventListener('online', this._handleOnline);
    window.removeEventListener('offline', this._handleOffline);
  }
}
