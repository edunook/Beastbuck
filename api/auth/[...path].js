/**
 * BeastBuck Vercel Serverless Function for Auth API
 * Handles all /api/auth/* routes in production on Vercel.
 */

import { handleAuthApiRequest } from '../../backend/middleware/authApiRouter.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  return handleAuthApiRequest(req, res);
}
