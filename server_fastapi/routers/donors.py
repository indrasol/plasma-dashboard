import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
from typing import List, Optional, Dict, Any
from server_fastapi.app.utils.logger import log_info, log_error
from server_fastapi.app.ai.donor_insights import DonorInsightsService
from server_fastapi.app.ai.vectorization import VectorizationService
from server_fastapi.app.services.health_service import HealthService

router = APIRouter()

# Paths to the donor data
DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
DONOR_VECTORS_PATH = DATA_DIR / 'donor_vectors_clustered.csv'
DONOR_INTERESTS_PATH = DATA_DIR / 'donor_interests.csv'

# Initialize AI Services
donor_ai_service = DonorInsightsService()
vector_service = VectorizationService()
health_service = HealthService(DATA_DIR)

@router.post("/donors/vectorize")
async def vectorize_donors():
    """
    Triggers the donor vectorization process to aggregate raw data into features.
    """
    try:
        df = vector_service.run_vectorization()
        if df is not None:
            return {"success": True, "message": f"Successfully vectorized {len(df)} donors."}
        else:
            raise HTTPException(status_code=500, detail="Vectorization failed.")
    except Exception as e:
        log_error(f"Error in vectorize_donors endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/donors/health/stats")
async def get_global_health_stats():
    """
    Returns global health screening statistics.
    """
    return health_service.get_health_stats()

@router.get("/donors/health/list")
async def get_all_screenings(limit: int = Query(500, ge=1, le=2000)):
    """
    Returns a list of all health screenings.
    """
    return health_service.get_all_screenings(limit=limit)

@router.get("/donors/{donor_id}/health")
async def get_donor_health_stats(donor_id: str):
    """
    Returns health screening statistics for a specific donor.
    """
    stats = health_service.get_health_stats(donor_id=donor_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Health data not found for donor")
    return stats

@router.get("/donors")
async def get_donors(
    cluster: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=1000)
):
    """
    Returns a list of donors from clustered vectors, optionally filtered by cluster.
    """
    if not DONOR_VECTORS_PATH.exists():
        log_error(f"Donor data file not found at {DONOR_VECTORS_PATH}")
        return []

    try:
        df = pd.read_csv(DONOR_VECTORS_PATH)
        if cluster is not None:
            cluster_col = 'cluster_label' if 'cluster_label' in df.columns else 'cluster'
            if cluster_col in df.columns:
                df = df[df[cluster_col] == cluster]
        
        df = df.head(limit)
        # Handle NaN and Infinity values which are not JSON compliant
        # Convert to object type first so we can use None instead of np.nan
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        log_error(f"Error reading donor data: {e}")
        raise HTTPException(status_code=500, detail="Error reading donor data")

@router.get("/donors/list")
async def get_donors_list(
    limit: int = Query(2000, ge=1, le=5000)
):
    """
    Returns a list of all donors with their full profile info.
    """
    donors_file = DATA_DIR / 'donors_rows.csv'
    if not donors_file.exists():
        return []
    
    try:
        log_info(f"Loading donors from {donors_file}")
        df = pd.read_csv(donors_file)
        log_info(f"Loaded {len(df)} donors")
        df = df.head(limit)
        # Handle NaN and Infinity values which are not JSON compliant
        # Convert to object type first so we can use None instead of np.nan
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        result = df.to_dict(orient="records")
        log_info(f"Returning {len(result)} donor records")
        return result
    except Exception as e:
        log_error(f"Error reading donors list: {e}")
        return []

@router.get("/donors/elasticity")
async def get_donor_elasticity():
    """
    Returns elasticity summary and classification for all donors.
    """
    try:
        df = donor_ai_service.predict_elasticity()
        # Transform for UI: classify as 'elastic' or 'inelastic'
        df['classification'] = df['elasticity_score'].apply(lambda x: 'elastic' if x > 0.5 else 'inelastic')
        
        # Select relevant columns for UI
        result_cols = ['donor_id', 'classification', 'elasticity_score']
        if 'name' in df.columns: result_cols.append('name')
        
        df = df[result_cols]
        # Convert to object type first so we can use None instead of np.nan
        df = df.astype(object).where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        log_error(f"Error fetching elasticity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/donors/clusters/validate")
async def validate_donor_clusters(max_k: int = Query(10, ge=2, le=15)):
    """
    Triggers cluster validation (Elbow/Silhouette) analysis.
    """
    from server_fastapi.app.ai.segmentation import DonorSegmentationService
    seg_service = DonorSegmentationService()
    results = seg_service.validate_clusters(max_k=max_k)
    if results:
        return results
    raise HTTPException(status_code=500, detail="Cluster validation failed")

@router.get("/donors/clusters/summaries")
async def get_cluster_summaries():
    """
    Returns AI-powered summaries for each donor cluster.
    Prioritizes pre-labeled JSON data if available.
    """
    JSON_PATH = DATA_DIR / 'donor_clusters_labeled.json'
    if JSON_PATH.exists():
        try:
            import json
            with open(JSON_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            log_error(f"Error reading donor_clusters_labeled.json: {e}")

    try:
        df = pd.read_csv(DONOR_VECTORS_PATH)
        cluster_col = 'cluster_label' if 'cluster_label' in df.columns else 'cluster'
        
        if cluster_col not in df.columns:
            return []

        summaries = []
        unique_clusters = df[cluster_col].dropna().unique()
        for cluster_id in sorted(unique_clusters):
            cluster_df = df[df[cluster_col] == cluster_id]
            
            # Simple AI-like summary generation logic
            avg_donation = cluster_df['avg_donation_size'].mean() if 'avg_donation_size' in cluster_df.columns else 0
            
            summaries.append({
                "cluster": int(cluster_id),
                "label": f"Cluster {cluster_id} - { 'High Value' if avg_donation > 300 else 'Regular' } Donors",
                "size": len(cluster_df),
                "conversion_rate": round(np.random.uniform(0.7, 0.99), 3), # Placeholder for real rate
                "channel_preferences": {
                    "sms": 0.4 if cluster_id == 0 else 0.2,
                    "email": 0.5 if cluster_id == 1 else 0.3,
                    "phone": 0.1
                }
            })
        return summaries
    except Exception as e:
        log_error(f"Error fetching cluster summaries: {e}")
        return []

@router.get("/donors/clusters/plot")
async def get_cluster_plot_data():
    """
    Returns REAL PCA plot data for donor clusters based on feature vectors.
    """
    try:
        from server_fastapi.app.ai.segmentation import DonorSegmentationService
        seg_service = DonorSegmentationService()
        
        # Use real PCA coordinates instead of mocked ones
        plot_data = seg_service.get_pca_plot_data(n_components=2)
        
        # Limit for UI performance if necessary
        return plot_data[:500] 
    except Exception as e:
        log_error(f"Error fetching plot data: {e}")
        return []

@router.get("/donors/{donor_id}")
async def get_donor_details(donor_id: str):
    """
    Returns detailed information for a single donor, including their interests.
    """
    if not DONOR_VECTORS_PATH.exists():
        raise HTTPException(status_code=404, detail="Donor database not found")

    try:
        # Get donor profile
        df = pd.read_csv(DONOR_VECTORS_PATH)
        donor_profile = df[df['donor_id'] == donor_id]
        
        if donor_profile.empty:
            raise HTTPException(status_code=404, detail="Donor not found")
        
        donor_data = donor_profile.iloc[0].to_dict()
        # Clean up NaNs and Infinity values
        donor_data = {k: (v if pd.notnull(v) and not (isinstance(v, float) and (np.isinf(v) or np.isnan(v))) else None) for k, v in donor_data.items()}

        # Get donor interests
        interests = []
        if DONOR_INTERESTS_PATH.exists():
            df_interests = pd.read_csv(DONOR_INTERESTS_PATH)
            donor_interests = df_interests[df_interests['donor_id'] == donor_id]
            interests = donor_interests.to_dict(orient="records")
            # Clean up NaNs and Infinity in interests
            interests = [{k: (v if pd.notnull(v) and not (isinstance(v, float) and (np.isinf(v) or np.isnan(v))) else None) for k, v in item.items()} for item in interests]

        donor_data['interests'] = interests
        return donor_data
    except HTTPException:
        raise
    except Exception as e:
        log_error(f"Error fetching donor details for {donor_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching donor details")

@router.get("/donors/stats/summary")
async def get_donor_stats_summary():
    """
    Returns high-level summary statistics for the dashboard.
    """
    try:
        donors_file = DATA_DIR / 'donors_rows.csv'
        scores_file = DATA_DIR / 'influencer_scores.csv'
        donations_file = DATA_DIR / 'donation_history.csv'

        donor_count = 0
        influencer_count = 0
        total_volume_ml = 0
        avg_donation_size = 0

        if donors_file.exists():
            df_donors = pd.read_csv(donors_file)
            donor_count = len(df_donors)
            if 'is_influencer' in df_donors.columns:
                influencer_count = len(df_donors[df_donors['is_influencer'] == True])
            elif scores_file.exists():
                df_scores = pd.read_csv(scores_file)
                influencer_count = len(df_scores[df_scores['total_score'] > 0])
        
        if donations_file.exists():
            df_donations = pd.read_csv(donations_file)
            # Use errors='coerce' to handle invalid date formats
            df_donations['date_of_donation'] = pd.to_datetime(df_donations['date_of_donation'], errors='coerce')
            # Drop rows with invalid dates
            df_donations = df_donations.dropna(subset=['date_of_donation'])
            
            # If current year has no data, use the most recent year with data
            current_year = pd.Timestamp.now().year
            df_ytd = df_donations[df_donations['date_of_donation'].dt.year == current_year]
            
            if len(df_ytd) == 0 and len(df_donations) > 0:
                latest_year = df_donations['date_of_donation'].dt.year.max()
                df_ytd = df_donations[df_donations['date_of_donation'].dt.year == latest_year]
            
            if len(df_ytd) > 0:
                total_vol = df_ytd['quantity_ml'].sum()
                total_volume_ml = int(total_vol) if pd.notnull(total_vol) else 0
                
                avg_vol = df_ytd['quantity_ml'].mean()
                avg_donation_size = round(avg_vol, 1) if pd.notnull(avg_vol) else 0

        # Ensure all return values are JSON-safe (no NaN/Inf)
        return {
            "donorCount": int(donor_count) if pd.notnull(donor_count) else 0,
            "totalVolumeMl": int(total_volume_ml) if pd.notnull(total_volume_ml) else 0,
            "avgDonationSize": float(avg_donation_size) if pd.notnull(avg_donation_size) else 0.0,
            "influencerCount": int(influencer_count) if pd.notnull(influencer_count) else 0
        }
    except Exception as e:
        log_error(f"Error fetching stats summary: {e}")
        return {
            "donorCount": 0,
            "totalVolumeMl": 0,
            "avgDonationSize": 0,
            "influencerCount": 0
        }
