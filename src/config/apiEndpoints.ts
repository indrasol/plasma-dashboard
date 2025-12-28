/// <reference types="vite/client" />
import { env } from "../config/env";

// Select base URL based on build env + optional explicit APP_ENV.
const appEnv = (env.APP_ENV || "").toLowerCase();
let API_BASE_URL = "";

if (appEnv === "stage" && env.STAGE_BASE_API_URL) {
  API_BASE_URL = env.STAGE_BASE_API_URL;
} else if (appEnv === "dev" && env.DEV_BASE_API_URL) {
  // Explicitly set to dev in environment variables
  API_BASE_URL = env.DEV_BASE_API_URL;
} else if (import.meta.env.PROD) {
  // Production builds (includes Netlify preview) use the prod base by default
  // ONLY if not explicitly overridden by APP_ENV=dev
  API_BASE_URL = env.PROD_BASE_API_URL || env.STAGE_BASE_API_URL || "";
} else {
  // Local development
  API_BASE_URL = env.DEV_BASE_API_URL || "";
}

// If still empty, callers can fall back to relative /api for local proxy.

export const API_ENDPOINTS = {
  base: API_BASE_URL,
  lookalike: `${API_BASE_URL || ""}/api/lookalike`,
  createUser: `${API_BASE_URL || ""}/api/create-user`,
  aiSignals: `${API_BASE_URL || ""}/api/ai-signals`,
};
