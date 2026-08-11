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

function resolveCredentialPath() {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv && existsSync(fromEnv)) return resolve(root, fromEnv);
  const local = resolve(root, 'service-account.json');
  if (existsSync(local)) return local;
  throw new Error(
    'Missing service-account.json. Copy service-account.example.json or set GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

export async function getAdminApp() {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');

  if (getApps().length) {
    const app = getApps()[0];
    return { app, db: getFirestore(app), auth: getAuth(app) };
  }

  const credPath = resolveCredentialPath();
  const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
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
