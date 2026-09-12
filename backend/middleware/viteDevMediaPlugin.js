import { handleMediaApiRequest } from './mediaApiRouter.js';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

export function beastbuckMediaDevPlugin() {
  return {
    name: 'beastbuck-media-dev-api',

    // Vite fires configResolved after it loads all .env files.
    // loadEnv with prefix='' returns ALL vars (including non-VITE_ server vars).
    // We inject them into process.env so b2StorageService.js can read them.
    configResolved(resolvedConfig) {
      const env = loadEnv(resolvedConfig.mode, ROOT, ''); // '' = no prefix filter
      for (const [key, value] of Object.entries(env)) {
        process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/media')) {
          try {
            await handleMediaApiRequest(req, res);
          } catch (err) {
            console.error('[Media Dev API Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal media dev error' }));
          }
        } else {
          next();
        }
      });
    },
  };
}

