// server/lookalikeProxy.ts
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

const EXTERNAL_API_URL = 'https://donor-lookalike-api.onrender.com';

router.get('/lookalike', async (req: Request, res: Response) => {
  try {
    console.log("🔄 Proxying lookalike request:", req.query);
    
    // Build query string from request parameters
    const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `${EXTERNAL_API_URL}?${queryParams}`;
    
    console.log("📡 Fetching from:", url);
    
    // Forward request to external API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ Successfully fetched", Array.isArray(data) ? data.length : 0, "results");
    
    // Return the data with CORS headers
    res.json(data);
    
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ 
      error: "Failed to fetch from lookalike API",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

export default router;

