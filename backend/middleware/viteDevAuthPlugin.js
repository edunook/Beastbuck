import { handleAuthApiRequest } from './authApiRouter.js';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

export function beastbuckAuthDevPlugin() {
  return {
    name: 'beastbuck-auth-dev-api',

    configResolved(resolvedConfig) {
      const env = loadEnv(resolvedConfig.mode, ROOT, '');
      for (const [key, value] of Object.entries(env)) {
        process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/auth')) {
          try {
            await handleAuthApiRequest(req, res);
          } catch (err) {
            console.error('[Auth Dev API Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal auth dev error' }));
          }
        } else {
          next();
        }
      });
    },
  };
}
