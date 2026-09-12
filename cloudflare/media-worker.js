/**
 * BeastBuck Cloudflare CDN Media Delivery Worker
 * 
 * Secure, edge-cached media delivery layer connecting client browsers to private Backblaze B2.
 * 
 * Features:
 *  - Authenticates to private B2 using AWS Signature Version 4 (SigV4) via Web Crypto API.
 *  - Uses dedicated read-only CDN credentials (B2_APPLICATION_KEY_ID & B2_APPLICATION_KEY).
 *  - Strict path traversal prevention (blocks '..', '%2e', null bytes, arbitrary bucket listing).
 *  - Restricts delivery to allowed media paths (/media/*).
 *  - HTTP Range Request (RFC 7233) support for seamless video seeking and scrubbing (HTTP 206).
 *  - Granular Cache-Control:
 *      * Public media: edge cached with long immutable TTL
 *      * Private/member media: no-cache, no-store to prevent cross-user leakage
 *  - Preserves Content-Type, Content-Length, Content-Range, ETag, and Last-Modified.
 *  - Zero npm dependencies — runs natively in Cloudflare Workers V8 runtime.
 */

// Configuration Defaults
const DEFAULT_B2_ENDPOINT = 's3.us-east-005.backblazeb2.com';
const DEFAULT_B2_REGION = 'us-east-005';
const DEFAULT_B2_BUCKET = 'beastbuck-media';

/**
 * Path Sanitization and Traversal Defense
 */
function sanitizeAndValidatePath(pathname) {
  // Decode URI components safely
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { valid: false, error: 'Malformed URI encoding' };
  }

  // Prevent directory traversal attacks
  if (
    decoded.includes('..') ||
    decoded.includes('\0') ||
    decoded.includes('\\') ||
    /%2e%2e/i.test(pathname) ||
    /%2f%2f/i.test(pathname)
  ) {
    return { valid: false, error: 'Path traversal disallowed' };
  }

  // Strip leading slash
  const cleanPath = decoded.replace(/^\/+/, '');

  // Prevent bucket root listing
  if (!cleanPath || cleanPath === 'media' || cleanPath === 'media/') {
    return { valid: false, error: 'Direct bucket listing disallowed' };
  }

  // Only allow fetching from the authorized media/ prefix
  if (!cleanPath.startsWith('media/')) {
    return { valid: false, error: 'Access outside /media/ directory is restricted' };
  }

  return { valid: true, objectKey: cleanPath };
}

/**
 * Helper: Convert ArrayBuffer to Hex String
 */
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Helper: SHA-256 Hash
 */
async function sha256(message) {
  const msgUint8 = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return toHex(hashBuffer);
}

/**
 * Helper: HMAC-SHA256
 */
async function hmacSha256(key, message) {
  const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const msgData = typeof message === 'string' ? new TextEncoder().encode(message) : message;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return crypto.subtle.sign('HMAC', cryptoKey, msgData);
}

/**
 * Generate AWS SigV4 Signing Key
 */
async function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = await hmacSha256('AWS4' + key, dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  return hmacSha256(kService, 'aws4_request');
}

/**
 * Construct Signed AWS S3 Request for B2 Origin
 */
async function createSignedB2Request({
  method,
  host,
  region,
  bucket,
  objectKey,
  accessKeyId,
  secretAccessKey,
  rangeHeader = null,
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.substring(0, 8); // YYYYMMDD

  const canonicalUri = `/${bucket}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
  const canonicalQuery = '';

  const headersToSign = {
    'host': host,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    'x-amz-date': amzDate,
  };

  if (rangeHeader) {
    headersToSign['range'] = rangeHeader;
  }

  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(k => `${k}:${headersToSign[k]}\n`)
    .join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const canonicalRequestHash = await sha256(canonicalRequest);

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, 's3');
  const signatureBytes = await hmacSha256(signingKey, stringToSign);
  const signature = toHex(signatureBytes);

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fetchHeaders = new Headers();
  fetchHeaders.set('Host', host);
  fetchHeaders.set('x-amz-content-sha256', 'UNSIGNED-PAYLOAD');
  fetchHeaders.set('x-amz-date', amzDate);
  fetchHeaders.set('Authorization', authorizationHeader);

  if (rangeHeader) {
    fetchHeaders.set('Range', rangeHeader);
  }

  const b2Url = `https://${host}${canonicalUri}`;

  return new Request(b2Url, {
    method,
    headers: fetchHeaders,
  });
}

/**
 * Main Cloudflare Worker Fetch Handler
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET and HEAD requests for media delivery
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/cdn-health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'BeastBuck Media Edge Delivery',
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Validate and Sanitize Requested Object Path
    const validation = sanitizeAndValidatePath(url.pathname);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const objectKey = validation.objectKey;

    // 3. Resolve Environment Secrets
    const accessKeyId = env.B2_APPLICATION_KEY_ID || env.B2_KEY_ID;
    const secretAccessKey = env.B2_APPLICATION_KEY;
    const bucket = env.B2_BUCKET_NAME || env.B2_BUCKET || DEFAULT_B2_BUCKET;
    const endpointHost = (env.B2_ENDPOINT || DEFAULT_B2_ENDPOINT).replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const region = env.B2_REGION || DEFAULT_B2_REGION;

    if (!accessKeyId || !secretAccessKey) {
      return new Response(JSON.stringify({
        error: 'CDN Origin Credentials Not Configured. Please set B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY in Cloudflare Worker Secrets.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Handle HTTP Range Requests (Video Scrubbing / Seeking)
    const rangeHeader = request.headers.get('Range');

    // 5. Build Signed S3 SigV4 Request to Private B2
    const b2Request = await createSignedB2Request({
      method: request.method,
      host: endpointHost,
      region,
      bucket,
      objectKey,
      accessKeyId,
      secretAccessKey,
      rangeHeader,
    });

    // 6. Fetch from Backblaze B2 Origin
    const b2Response = await fetch(b2Request);

    if (!b2Response.ok && b2Response.status !== 206 && b2Response.status !== 304) {
      if (b2Response.status === 404) {
        return new Response(JSON.stringify({ error: 'Media not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `Origin returned HTTP ${b2Response.status}` }), {
        status: b2Response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 7. Prepare Delivery Headers
    const responseHeaders = new Headers();

    // Preserve core headers
    const contentType = b2Response.headers.get('Content-Type') || 'application/octet-stream';
    responseHeaders.set('Content-Type', contentType);

    const contentLength = b2Response.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = b2Response.headers.get('Content-Range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    const etag = b2Response.headers.get('ETag');
    if (etag) responseHeaders.set('ETag', etag);

    const lastModified = b2Response.headers.get('Last-Modified');
    if (lastModified) responseHeaders.set('Last-Modified', lastModified);

    responseHeaders.set('Accept-Ranges', 'bytes');

    // CORS Headers for BeastBuck Web App
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, ETag, Accept-Ranges');

    // 8. Granular Cache Control & Private Media Access Protection
    // Private files (e.g. proof files or explicitly private paths) MUST NEVER be cached across users
    const isPrivateMedia = objectKey.includes('/proof/') || url.searchParams.get('visibility') === 'private';

    if (isPrivateMedia) {
      responseHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');
    } else if (b2Response.status === 206) {
      // Partial content for video playback
      responseHeaders.set('Cache-Control', 'public, max-age=86400');
    } else {
      // Public media with immutable UUID storage keys
      responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return new Response(b2Response.body, {
      status: b2Response.status,
      statusText: b2Response.statusText,
      headers: responseHeaders,
    });
  },
};
