import csv
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from server_fastapi.dependencies import get_supabase_client, run_supabase_async
from supabase import Client
from server_fastapi.app.utils.logger import log_info, log_error
from server_fastapi.app.ai.lookalike_service import LookalikeService

router = APIRouter()
lookalike_service = LookalikeService()

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
    metric: str = "cosine",
    cluster_only: bool = Query(False),
    client: Client = Depends(get_supabase_client)
):
    """
    Returns REAL-TIME dynamic lookalike donors based on feature similarity.
    """
    log_info(f"GET /api/lookalike for donor_id={donor_id} top_n={top_n} metric={metric} cluster_only={cluster_only}")

    # Calculate real-time lookalikes
    candidates = lookalike_service.get_lookalikes(
        donor_id=donor_id, 
        top_n=top_n, 
        metric=metric, 
        cluster_only=cluster_only
    )
    
    if not candidates:
        return []

    # Map details for response schema
    results = []
    for d_info in candidates:
        # Clean up individual values for JSON compliance
        def clean_val(v):
            if pd.isnull(v) or (isinstance(v, float) and (np.isinf(v) or np.isnan(v))):
                return None
            return v

        results.append(LookalikeResult(
            donor_id=d_info.get("donor_id", "Unknown"),
            name=clean_val(d_info.get("name", "Unknown")),
            cluster_label=clean_val(d_info.get("cluster_label")),
            site_id=clean_val(d_info.get("site_id")),
            total_donated=clean_val(d_info.get("total_donated")),
            avg_donation_size=clean_val(d_info.get("avg_donation_size")),
            donation_count=clean_val(d_info.get("donation_count")),
            campaign_count=clean_val(d_info.get("campaign_count")),
            health_screening_count=clean_val(d_info.get("health_screening_count")),
            similarity=clean_val(d_info.get("similarity", 0.0))
        ))
                
    return results

@router.get("/lookalike/ideal", response_model=List[LookalikeResult])
async def get_ideal_lookalikes(
    top_n: int = Query(10, ge=1, le=100)
):
    """
    Returns donors who most closely match the 'Perfect Cluster Centroid'.
    """
    candidates = lookalike_service.get_centroid_matches(top_n=top_n)
    
    results = []
    for d_info in candidates:
        def clean_val(v):
            if pd.isnull(v) or (isinstance(v, float) and (np.isinf(v) or np.isnan(v))):
                return None
            return v

        results.append(LookalikeResult(
            donor_id=d_info.get("donor_id", "Unknown"),
            name=clean_val(d_info.get("name", "Unknown")),
            cluster_label=clean_val(d_info.get("cluster_label")),
            site_id=clean_val(d_info.get("site_id")),
            total_donated=clean_val(d_info.get("total_donated")),
            avg_donation_size=clean_val(d_info.get("avg_donation_size")),
            donation_count=clean_val(d_info.get("donation_count")),
            campaign_count=clean_val(d_info.get("campaign_count")),
            health_screening_count=clean_val(d_info.get("health_screening_count")),
            similarity=clean_val(d_info.get("similarity", 0.0))
        ))
    return results

@router.get("/lookalike/influencers")
async def get_influencer_lookalikes():
    """
    Returns lookalike matches based on influencer seeds.
    Matches logic from InfluencerLookalikeTable.tsx but fetches from CSV.
    """
    CSV_INF_PATH = Path(__file__).resolve().parent.parent / 'data' / 'influencer_lookalike_matches.csv'
    DONORS_PATH = Path(__file__).resolve().parent.parent / 'data' / 'donors_rows.csv'
    
    if not CSV_INF_PATH.exists() or not DONORS_PATH.exists():
        return []
    
    try:
        matches_df = pd.read_csv(CSV_INF_PATH)
        donors_df = pd.read_csv(DONORS_PATH)
        
        # Handle NaN/Inf in both DataFrames
        matches_df = matches_df.replace([float('inf'), float('-inf')], None)
        donors_df = donors_df.replace([float('inf'), float('-inf')], None)
        
        # Join seed donor info
        merged = matches_df.merge(
            donors_df[['donor_id', 'first_name', 'last_name']].rename(columns={'first_name': 'seed_fname', 'last_name': 'seed_lname'}),
            left_on='seed_influencer_id',
            right_on='donor_id',
            how='left'
        ).drop(columns=['donor_id'])
        
        # Join matched donor info
        merged = merged.merge(
            donors_df[['donor_id', 'first_name', 'last_name']].rename(columns={'first_name': 'match_fname', 'last_name': 'match_lname'}),
            left_on='matched_donor_id',
            right_on='donor_id',
            how='left'
        ).drop(columns=['donor_id'])
        
        merged = merged.sort_values('similarity_score', ascending=False)
        # Handle NaN/Inf in the merged DataFrame
        merged = merged.replace([np.inf, -np.inf], np.nan)
        merged = merged.astype(object).where(pd.notnull(merged), None)
        
        return merged.to_dict(orient='records')
    except Exception as e:
        log_error(f"Error fetching influencer lookalikes: {e}")
        return []

