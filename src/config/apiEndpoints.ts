/// <reference types="vite/client" />
// Import environment configuration
import { env } from "../config/env";

// Get the appropriate base URL from the environment configuration
const API_BASE_URL = env.DEV_BASE_API_URL;



export const API_ENDPOINTS = API_BASE_URL;