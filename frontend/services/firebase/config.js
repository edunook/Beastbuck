import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

/** Client SDK config only — never put service account keys here. */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isMissingRealConfig = !firebaseConfig.apiKey || !firebaseConfig.projectId;

/**
 * DEV-ONLY SAFETY NET.
 *
 * Firebase's SDK throws synchronously (at module-eval time, before React
 * even mounts) when `apiKey`/`projectId` are missing or malformed. That
 * crashes the whole app with a blank screen and no way for the
 * ErrorBoundary to catch it (it happens before <App /> renders).
 *
 * When running locally in dev WITHOUT real Firebase credentials configured,
 * swap in a syntactically well-formed but fake placeholder config so the
 * SDK initializes without throwing. This does NOT create working
 * auth/data — any real Firebase Auth/Firestore/RTDB calls will simply fail
 * (network/permission errors) since the project doesn't exist. It only
 * lets the app mount so non-data UI/layout can be inspected and edited.
 *
 * This path is NEVER used in production builds: `import.meta.env.DEV` is
 * `false` in a `vite build` production bundle, and real projects must
 * always set the VITE_FIREBASE_* env vars.
 */
if (isMissingRealConfig && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] VITE_FIREBASE_* env vars are not set. Using a placeholder ' +
      'dev-only config so the app can render — auth and data features will ' +
      'not work until real credentials are added to your environment.',
  );
  firebaseConfig.apiKey = firebaseConfig.apiKey || 'AIzaSyDevPlaceholderKey-000000000000000';
  firebaseConfig.authDomain = firebaseConfig.authDomain || 'dev-placeholder.firebaseapp.com';
  firebaseConfig.databaseURL =
    firebaseConfig.databaseURL || 'https://dev-placeholder-default-rtdb.firebaseio.com';
  firebaseConfig.projectId = firebaseConfig.projectId || 'dev-placeholder';
  firebaseConfig.storageBucket = firebaseConfig.storageBucket || 'dev-placeholder.appspot.com';
  firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || '000000000000';
  firebaseConfig.appId = firebaseConfig.appId || '1:000000000000:web:0000000000000000000000';
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// NOTE: Firebase Storage is NOT used. All file uploads use IPFS via Pinata (free).
// Storage uploads: see frontend/services/storage/ipfs.js
export const rtdb = getDatabase(app);

