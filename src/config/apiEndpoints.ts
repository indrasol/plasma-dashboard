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
  influencerLookalike: `${API_BASE_URL || ""}/api/lookalike/influencers`,
  createUser: `${API_BASE_URL || ""}/api/create-user`,
  aiSignals: `${API_BASE_URL || ""}/api/ai-signals`,
  donors: `${API_BASE_URL || ""}/api/donors`,
  donorList: `${API_BASE_URL || ""}/api/donors/list`,
  donorStats: `${API_BASE_URL || ""}/api/donors/stats/summary`,
  donorElasticity: `${API_BASE_URL || ""}/api/donors/elasticity`,
  donorHealthStats: `${API_BASE_URL || ""}/api/donors/health/stats`,
  donorHealthList: `${API_BASE_URL || ""}/api/donors/health/list`,
  clusterSummaries: `${API_BASE_URL || ""}/api/donors/clusters/summaries`,
  clusterPlot: `${API_BASE_URL || ""}/api/donors/clusters/plot`,
  sentiment: `${API_BASE_URL || ""}/api/sentiment/posts`,
  sentimentSummary: `${API_BASE_URL || ""}/api/sentiment/summary`,
  influencerGraph: `${API_BASE_URL || ""}/api/influencers/graph`,
  influencerInterests: `${API_BASE_URL || ""}/api/influencers/interests`,
  influencerTop: `${API_BASE_URL || ""}/api/influencers/top`,
  campaignDetails: `${API_BASE_URL || ""}/api/campaigns/details`,
  campaignSummary: `${API_BASE_URL || ""}/api/campaigns/summary`,
  referralStats: `${API_BASE_URL || ""}/api/referrals/stats`,
  referralImpact: `${API_BASE_URL || ""}/api/referrals/campaign-impact`,
  dbTables: `${API_BASE_URL || ""}/api/database/tables`,
  dbSync: `${API_BASE_URL || ""}/api/database/sync`,
  dbExport: (table: string) => `${API_BASE_URL || ""}/api/database/export/${table}`,
};
