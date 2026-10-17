import express from 'express';
import { createGeminiRouter } from './geminiRouter.js';
import { createSiteRouter } from './siteRouter.js';

// API shared by the local dev server (server.ts) and the Vercel function (api/index.ts)
export function createApiApp() {
  const app = express();
  app.set('trust proxy', true);
  app.use('/api/gemini', express.json(), createGeminiRouter());
  app.use('/api', createSiteRouter());
  return app;
}
