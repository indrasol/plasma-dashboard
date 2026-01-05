from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from server_fastapi.app.services.influencer_service import InfluencerService

router = APIRouter()
influencer_service = InfluencerService()

@router.post("/influencers/recalculate-scores")
async def recalculate_influencer_scores():
    """
    Triggers recalculation of influencer centrality scores.
    """
    results = influencer_service.recalculate_influencer_scores()
    if results is not None:
        return {"success": True, "count": len(results)}
    return {"success": False, "message": "Recalculation failed"}

@router.get("/influencers/graph")
async def get_influencer_graph(
    top_n: int = Query(15, ge=1, le=100),
    interest: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Returns the influence network graph (nodes and edges).
    """
    return influencer_service.get_influence_graph(
        top_n=top_n,
        filter_interest=interest,
        filter_category=category
    )

@router.get("/influencers/interests")
async def get_influencer_interests():
    """
    Returns unique interest categories and names.
    """
    return influencer_service.get_interest_metadata()

@router.get("/influencers/top")
async def get_top_influencers(
    interest: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Returns top influencers with scores and linked donor counts.
    """
    return influencer_service.get_top_influencers(
        filter_interest=interest,
        filter_category=category
    )

