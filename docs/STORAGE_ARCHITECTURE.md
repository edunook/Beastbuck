# BeastBuck Media Storage Architecture: Backblaze B2 + Cloudflare CDN

## 1. Executive Summary

BeastBuck uses **Backblaze B2 (S3-Compatible API)** as its primary high-speed object storage and **Cloudflare CDN** as its edge caching and video streaming delivery layer. This replaces legacy IPFS/Pinata storage with a robust, direct-to-storage architecture that supports:
- Direct browser-to-B2 presigned single and multipart uploads (no server byte proxying).
- Dynamic part sizing and parallel chunk uploads with controlled browser concurrency.
- Exponential backoff retry on failed chunks without restarting full uploads.
- IndexedDB session persistence with cryptographic file fingerprinting for pause/resume and refresh recovery.
- Cloudflare edge range requests (HTTP 206) for video seeking and scrubbing.
- Strict public vs private media access controls with zero client-side credential exposure.

---

## 2. Target Architecture

```
Client Browser (BeastBuck Web App)
       │
       ├─── 1. Authenticate & Request Upload Session (POST /api/media/initiate-upload) ───► Backend API
       │                                                                                     │
       │◄── 2. Receive Presigned PUT URLs & UploadId (No secret keys exposed) ───────────────┘
       │
       ├─── 3. Upload Parts in Parallel Directly to B2 Storage ──► Backblaze B2
       │
       ├─── 4. Complete & Finalize Upload (POST /api/media/complete-upload) ─────────────► Backend API
       │                                                                                     │
       │                                             Verify & HeadObject Check on B2 ────────┤
       │                                                                                     │
       │◄── 5. Receive Verified Status & Cloudflare CDN Streaming URL ───────────────────────┘
       │
BeastBuck Users ◄─── 6. Fast Edge Caching & Range Playback ─── Cloudflare CDN ◄── Backblaze B2 Origin
```

---

## 3. Environment Configuration

### Backend / Server Environment (Never commit secrets to client builds)

```env
# Backblaze B2 S3-Compatible Configuration
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_BUCKET=beastbuck-media
B2_KEY_ID=your_b2_application_key_id
B2_APPLICATION_KEY=your_b2_application_key

# Cloudflare CDN Delivery
CDN_MEDIA_BASE_URL=https://media.beastbuck.com

# Upload Thresholds & Capacity
MULTIPART_THRESHOLD_MB=50
MAX_UPLOAD_SIZE_GB=50
MAX_VIDEO_SIZE_GB=50
MIN_PART_SIZE_MB=10
```

### Client Frontend Environment (Vite bundle safe)

```env
# Public CDN Hostname for Media Asset Resolution
VITE_CDN_MEDIA_BASE_URL=https://media.beastbuck.com
```

---

## 4. Backblaze B2 Bucket & CORS Configuration

### Bucket Setup
1. Create a Bucket in Backblaze B2:
   - **Bucket Name**: `beastbuck-media`
   - **Bucket Type**: Private or Public (Public files are delivered via Cloudflare CDN; private files are accessed via short-lived presigned GET URLs).
   - **Default Encryption**: Enabled (SSE-B2).
   - **Lifecycle Rules**: Delete incomplete multipart uploads after 1 day.

### CORS Rules (Required for direct browser PUT uploads)
In the Backblaze B2 Console → Buckets → **CORS Rules**, set:

```json
[
  {
    "corsRuleName": "beastbuck-browser-direct-uploads",
    "allowedOrigins": [
      "https://beastbuck.com",
      "https://*.beastbuck.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    "allowedOperations": [
      "s3_put",
      "s3_post",
      "s3_get",
      "s3_head",
      "s3_delete"
    ],
    "allowedHeaders": [
      "*"
    ],
    "exposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type",
      "Last-Modified"
    ],
    "maxAgeSeconds": 3600
  }
]
```

---

## 5. Cloudflare CDN Configuration

### DNS Setup
1. In Cloudflare DNS, add a **CNAME** record:
   - **Name**: `media` (for `media.beastbuck.com`)
   - **Target**: `beastbuck-media.s3.us-east-005.backblazeb2.com` (or your B2 bucket origin)
   - **Proxy status**: Proxied (Orange cloud enabled)

### Cache Rules & HTTP Range Requests
1. **HTTP Range Requests**: Cloudflare automatically proxies `Range: bytes=...` headers to B2, allowing browsers to seek without downloading the full video.
2. **Page / Cache Rules**:
   - Cache Level: Cache Everything for `/media/*`
   - Edge Cache TTL: 1 month for immutable content (unique UUID storage keys).
   - Browser Cache TTL: 1 day.

---

## 6. Storage Key Structure

Deterministic, collision-resistant, and secure against directory traversal:
```
media/{environment}/{ownerId}/{folder}/{mediaType}/{yyyy}/{mm}/{uuid}-{sanitizedName}
```
* Example: `media/prod/usr_981a2f/funflix/video/2026/09/b8f1d392-trailer.mp4`

---

## 7. Resumable Multipart Upload Protocol

1. **File Fingerprinting**:
   The client calculates a SHA-256 fingerprint from `{name}|{size}|{type}|{lastModified}` combined with the first 64KB and last 64KB sample bytes.
2. **Session Persistence**:
   Upload metadata and completed chunk ETags are stored in **IndexedDB** (`beastbuck_media_storage_db`).
3. **Chunk Uploads**:
   - File is sliced into Blobs (`Blob.slice()`) according to dynamic part sizing ($10\text{MB}$ to $50\text{MB}$).
   - Uploads occur in parallel (concurrency limit = 3).
   - Failed chunks retry with exponential backoff + jitter up to 4 times.
4. **Offline Resilience**:
   On network drops (`window.onoffline`), uploads pause safely. On reconnection (`window.ononline`), uploads automatically resume from where they left off.
5. **Verification**:
   On completion, the backend calls `CompleteMultipartUploadCommand` and executes a `HeadObjectCommand` to verify byte size and ETag before marking the Firestore record as `ready`.

---

## 8. Non-Destructive Migration

Run the streaming migration script:

```bash
# 1. Audit / Dry-Run (identifies assets without changing Firestore)
node backend/admin/migrate-pinata-to-b2.mjs --dry-run

# 2. Execute Non-Destructive Migration
node backend/admin/migrate-pinata-to-b2.mjs --execute
```

---

## 9. Automated Testing & Verification

Run the comprehensive test suite:

```bash
node backend/admin/test-storage-lifecycle.mjs
```
