import csv
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from server_fastapi.dependencies import get_supabase_client, run_supabase_async
from supabase import Client
from server_fastapi.app.utils.logger import log_info, log_error

router = APIRouter()

# Schema for response
class LookalikeResult(BaseModel):
    donor_id: str
    name: str = ""
    cluster_label: Optional[int] = None
    site_id: Optional[str] = None
    total_donated: Optional[float] = None
    avg_donation_size: Optional[float] = None
    donation_count: Optional[int] = None
    campaign_count: Optional[int] = None
    health_screening_count: Optional[int] = None
    similarity: float

# Path to the CSV file
# Assumes structure: server_fastapi/routers/lookalike.py -> server_fastapi/data/internal_lookalike_matches.csv
CSV_PATH = Path(__file__).resolve().parent.parent / 'data' / 'internal_lookalike_matches.csv'
CACHED_MATCHES: List[Dict[str, Any]] = []

def load_matches_from_csv() -> List[Dict[str, Any]]:
    """
    Loads matches from the internal CSV file.
    Cached in memory to avoid reading disk on every request.
    """
    global CACHED_MATCHES
    if CACHED_MATCHES:
        return CACHED_MATCHES

    matches = []
    if not CSV_PATH.exists():
        log_error(f"CSV file not found at: {CSV_PATH}")
        return []

    try:
        with open(CSV_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Expected columns: donor_id, similarity_score, matched_at, source_cluster, model_version
                matches.append({
                    "donor_id": row.get("donor_id", ""),
                    "similarity": float(row.get("similarity_score", 0.0)),
                    "cluster": row.get("source_cluster")
                })
        log_info(f"Loaded {len(matches)} matches from CSV.")
        CACHED_MATCHES = matches
    except Exception as e:
        log_error(f"Error reading CSV: {e}")
        return []

    return CACHED_MATCHES

@router.get("/lookalike", response_model=List[LookalikeResult])
async def get_lookalikes(
    donor_id: str,
    top_n: int = Query(10, ge=1, le=100),
    metric: str = "cosine",  # Kept for interface compatibility
    client: Client = Depends(get_supabase_client)
):
    """
    Returns lookalike donors based on internal CSV matches and Supabase data.
    """
    log_info(f"GET /api/lookalike for donor_id={donor_id} top_n={top_n}")

    # 1. Load matches from CSV
    all_matches = load_matches_from_csv()
    
    if not all_matches:
        log_error("No matches loaded from CSV")
        return []

    # Note: Since the CSV structure provided doesn't have a source_donor_id column,
    # we assume for this implementation that the CSV contains the candidate pool
    # or the matches for the current demo context. 
    # We simply return the top N entries from the file by similarity.
    
    # Sort by similarity descending
    sorted_matches = sorted(all_matches, key=lambda x: x["similarity"], reverse=True)
    
    # Take top N
    top_candidates = sorted_matches[:top_n]
    
    if not top_candidates:
        return []

    candidate_ids = [m["donor_id"] for m in top_candidates]

    # 2. Fetch details from Supabase for these candidates
    try:
        def fetch_details():
            return client.table("donor_vectors") \
                .select("*") \
                .in_("donor_id", candidate_ids) \
                .execute()

        response = await run_supabase_async(fetch_details)
        
        # Handle Supabase response structure
        donors_data = getattr(response, "data", [])
        if not donors_data and hasattr(response, "data"):
             donors_data = response.data
             
        # Map details by donor_id
        donor_map = {d["donor_id"]: d for d in donors_data}
        
        # 3. Build response
        results = []
        for candidate in top_candidates:
            d_id = candidate["donor_id"]
            d_info = donor_map.get(d_id)
            
            if d_info:
                results.append(LookalikeResult(
                    donor_id=d_id,
                    name=d_info.get("name", "Unknown"),
                    cluster_label=d_info.get("cluster_label"),
                    site_id=d_info.get("site_id"),
                    total_donated=d_info.get("total_donated"),
                    avg_donation_size=d_info.get("avg_donation_size"),
                    donation_count=d_info.get("donation_count"),
                    campaign_count=d_info.get("campaign_count"),
                    health_screening_count=d_info.get("health_screening_count"),
                    similarity=candidate["similarity"]
                ))
            else:
                # If Supabase doesn't have the donor, maybe include with minimal info?
                # For now, skip if data is missing to avoid broken UI
                pass
                
        return results

    except Exception as e:
        log_error(f"Error fetching donor details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

