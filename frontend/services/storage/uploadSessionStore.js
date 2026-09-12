/**
 * IndexedDB-backed Upload Session Persistence Layer
 * 
 * Stores resumable upload state so that interrupted uploads (network drop, tab refresh, browser restart)
 * can resume seamlessly without losing completed parts.
 * 
 * Includes robust file fingerprinting (filename + size + lastModified + sample hash of start/end bytes)
 * so uploads can never resume against a mismatched or modified file.
 */

const DB_NAME = 'beastbuck_media_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'upload_sessions';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve(null); // Fallback if IndexedDB not supported
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'fingerprint' });
        store.createIndex('uploadId', 'uploadId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => {
      console.warn('[UploadSessionStore] Failed to open IndexedDB:', e);
      resolve(null);
    };
  });

  return dbPromise;
}

/**
 * Generate a strong, collision-resistant fingerprint from file properties and sample byte chunks
 */
export async function computeFileFingerprint(file) {
  if (!file) throw new Error('File is required to compute fingerprint');

  const headerSlice = file.slice(0, Math.min(64 * 1024, file.size));
  const tailSlice = file.size > 128 * 1024 ? file.slice(file.size - 64 * 1024, file.size) : new Blob([]);

  const [headerBuf, tailBuf] = await Promise.all([
    headerSlice.arrayBuffer(),
    tailSlice.arrayBuffer(),
  ]);

  // Combine metadata and sample bytes
  const metaString = `${file.name}|${file.size}|${file.type}|${file.lastModified}`;
  const metaBytes = new TextEncoder().encode(metaString);

  const combined = new Uint8Array(metaBytes.length + headerBuf.byteLength + tailBuf.byteLength);
  combined.set(metaBytes, 0);
  combined.set(new Uint8Array(headerBuf), metaBytes.length);
  combined.set(new Uint8Array(tailBuf), metaBytes.length + headerBuf.byteLength);

  // Compute SHA-256 via SubtleCrypto
  if (window.crypto && window.crypto.subtle) {
    const hashBuf = await window.crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined[i];
    hash |= 0;
  }
  return `fp_${Math.abs(hash)}_${file.size}_${file.lastModified}`;
}

/**
 * Save or update an upload session
 */
export async function saveUploadSession(session) {
  if (!session || !session.fingerprint) return false;

  const sessionData = {
    ...session,
    updatedAt: Date.now(),
  };

  const db = await openDB();
  if (!db) {
    // Fallback to localStorage
    try {
      localStorage.setItem(`bb_upload_${session.fingerprint}`, JSON.stringify(sessionData));
      return true;
    } catch {
      return false;
    }
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(sessionData);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Retrieve an upload session by file fingerprint
 */
export async function getUploadSession(fingerprint) {
  if (!fingerprint) return null;

  const db = await openDB();
  if (!db) {
    try {
      const item = localStorage.getItem(`bb_upload_${fingerprint}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fingerprint);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Remove an upload session after completion or cancellation
 */
export async function deleteUploadSession(fingerprint) {
  if (!fingerprint) return;

  try {
    localStorage.removeItem(`bb_upload_${fingerprint}`);
  } catch {}

  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(fingerprint);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
