/**
 * BeastBuck Vercel Serverless Function for Media API
 * Handles all /api/media/* routes in production on Vercel.
 * Reuses the existing backend media service and router logic.
 */

import { handleMediaApiRequest } from '../../backend/middleware/mediaApiRouter.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Serverless control operations only (JSON metadata, presigned URLs, completion)
    },
  },
};

export default async function handler(req, res) {
  return handleMediaApiRequest(req, res);
}
