// server/index.ts

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import createUserRoute from './createUser.js';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

app.use(cors());
app.use(bodyParser.json());

console.log("Loaded environment variables:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SERVICE_ROLE_KEY_EXISTS: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

app.use('/api', createUserRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

