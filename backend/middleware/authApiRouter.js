import { verifyRecovery, resetPassword } from '../services/authAdminService.js';

const ALLOWED_ORIGINS = [
  'https://beastbuck.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Simple in-memory rate limiting map for auth recovery requests
const requestRateMap = new Map();

function isRateLimited(key, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const records = requestRateMap.get(key) || [];
  const validRecords = records.filter(time => now - time < windowMs);
  
  if (validRecords.length >= maxRequests) {
    return true;
  }
  
  validRecords.push(now);
  requestRateMap.set(key, validRecords);
  return false;
}

function getCorsOrigin(req) {
  const reqOrigin = req.headers?.['origin'] || req.headers?.['Origin'] || '';
  if (!reqOrigin) return '*';
  if (ALLOWED_ORIGINS.includes(reqOrigin) || reqOrigin.endsWith('.vercel.app')) {
    return reqOrigin;
  }
  return '*';
}

function setCorsHeaders(req, res) {
  const origin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

function sendJson(req, res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  setCorsHeaders(req, res);
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Handle Auth API requests for verification and password reset.
 */
export async function handleAuthApiRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    setCorsHeaders(req, res);
    res.end();
    return;
  }

  // Resolve path
  let pathStr;
  if (req.query?.path) {
    const segments = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    pathStr = '/' + segments;
  } else {
    const parsed = new URL(req.url, 'http://localhost');
    pathStr = parsed.pathname;
  }

  const pathname = pathStr.replace(/^\/api\/auth/, '').replace(/\/+$/, '') || '/';

  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'client';

    // 1. Verify Recovery Credentials (POST /api/auth/verify-recovery)
    if (pathname === '/verify-recovery' && req.method === 'POST') {
      const body = await parseBody(req);
      const { username, phoneNumber } = body;

      if (isRateLimited(`verify_${clientIp}_${username}`, 8, 60000)) {
        return sendJson(req, res, 429, {
          error: 'Too many verification attempts. Please wait a minute and try again.',
        });
      }

      const result = await verifyRecovery(username, phoneNumber);
      return sendJson(req, res, 200, { success: true, ...result });
    }

    // 2. Reset Password (POST /api/auth/reset-password)
    if (pathname === '/reset-password' && req.method === 'POST') {
      const body = await parseBody(req);
      const { username, phoneNumber, newPassword } = body;

      if (isRateLimited(`reset_${clientIp}_${username}`, 5, 60000)) {
        return sendJson(req, res, 429, {
          error: 'Too many reset attempts. Please wait a minute and try again.',
        });
      }

      const result = await resetPassword({ username, phoneNumber, newPassword });
      return sendJson(req, res, 200, result);
    }

    // Health check
    if (pathname === '/health' && req.method === 'GET') {
      return sendJson(req, res, 200, { status: 'ok', service: 'auth-api' });
    }

    return sendJson(req, res, 404, { error: `Auth API route not found: ${pathname}` });
  } catch (error) {
    console.error('[AuthApi Error]', error.message);
    const msg = error.message || '';
    const isClientError = msg.includes('not found') || 
                          msg.includes('not match') || 
                          msg.includes('required') || 
                          msg.includes('at least') ||
                          msg.includes('invalid') ||
                          msg.includes('characters');
    const status = isClientError ? 400 : 500;
    return sendJson(req, res, status, {
      error: msg || 'Internal authentication server error',
    });
  }
}
