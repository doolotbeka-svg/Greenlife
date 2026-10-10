import express from 'express';
import { createGeminiRouter } from '../../src/server/geminiRouter.js';

// Vercel serverless entry for POST /api/gemini/chat (server.ts is used only locally)
const app = express();
app.use(express.json());
app.use('/api/gemini', createGeminiRouter());

export default app;
