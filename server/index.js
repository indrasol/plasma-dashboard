// server/index.js

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import createUserRoute from './createUser.js';

const app = express();
const PORT = process.env.PORT || 5001;

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