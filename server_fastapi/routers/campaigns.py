from fastapi import APIRouter, Query
from typing import List, Dict, Any
from server_fastapi.app.services.campaign_service import CampaignService

router = APIRouter()
campaign_service = CampaignService()

@router.get("/campaigns/details")
async def get_campaign_details():
    """
    Returns detailed campaign engagement records.
    """
    return campaign_service.get_campaign_details()

@router.get("/campaigns/predict-conversion")
async def predict_campaign_conversion(campaign_name: str = Query(...)):
    """
    Triggers AI prediction for potential donor conversion for a campaign.
    """
    return campaign_service.predict_conversion_probability(campaign_name)

@router.get("/campaigns/summary")
async def get_campaign_summary():
    """
    Returns a summary of campaign performance.
    """
    return campaign_service.get_campaign_summary()

