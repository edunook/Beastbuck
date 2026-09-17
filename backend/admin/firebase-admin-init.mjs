/**
 * Server-side Firebase Admin SDK only.
 * Never import this from React/Vite client code.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/firebase-admin-init.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
      // ignore JSON parse error and try file
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      // ignore
    }
  }

  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv && existsSync(fromEnv)) {
    return JSON.parse(readFileSync(resolve(root, fromEnv), 'utf8'));
  }

  const local = resolve(root, 'service-account.json');
  if (existsSync(local)) {
    return JSON.parse(readFileSync(local, 'utf8'));
  }

  // For development with individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'beastbuck-5c42b';
  
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    return {
      type: 'service_account',
      project_id: projectId,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };
  }

  // Development fallback: Use a minimal config (limited functionality)
  console.warn('[Firebase Admin] Using development mode with limited functionality. Some admin operations may not work.');
  return {
    project_id: projectId,
    type: 'service_account',
    // Note: Without private key, auth operations will be limited
  };
}

export async function getAdminApp() {
  const { initializeApp, cert, getApps, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');

  if (getApps().length) {
    const app = getApps()[0];
    return { app, db: getFirestore(app), auth: getAuth(app) };
  }

  const serviceAccount = getServiceAccount();

  // Check if we have a full service account or just project ID
  const hasPrivateKey = serviceAccount.private_key && serviceAccount.private_key.startsWith('-----BEGIN');
  
  let credential;
  if (hasPrivateKey) {
    credential = cert(serviceAccount);
  } else {
    // For development, try application default credentials first
    try {
      credential = applicationDefault();
    } catch (err) {
      // If that fails, create a minimal credential with just project ID
      console.warn('[Firebase Admin] Using minimal credential with project ID only. Some operations may be limited.');
      credential = cert({
        projectId: serviceAccount.project_id,
        client_email: serviceAccount.client_email || 'firebase-adminsdk@system.gserviceaccount.com',
        private_key: serviceAccount.private_key || 'placeholder',
      });
    }
  }

  const app = initializeApp({
    credential,
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'beastbuck-5c42b',
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
      || 'https://beastbuck-5c42b-default-rtdb.asia-southeast1.firebasedatabase.app',
  });

  return { app, db: getFirestore(app), auth: getAuth(app) };
}

// Quick connectivity check when run directly
if (process.argv[1]?.includes('firebase-admin-init')) {
  getAdminApp()
    .then(({ app }) => {
      console.log('[Firebase Admin] Connected to project:', app.options.projectId);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Firebase Admin] Failed:', err.message);
      process.exit(1);
    });
}
