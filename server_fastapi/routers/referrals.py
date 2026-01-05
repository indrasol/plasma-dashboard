from fastapi import APIRouter
from typing import List, Dict, Any
from server_fastapi.app.services.referral_service import ReferralService

router = APIRouter()
referral_service = ReferralService()

@router.get("/referrals/stats")
async def get_referral_stats():
    """
    Returns high-level statistics for the referral system.
    """
    return referral_service.get_referral_stats()

@router.get("/referrals/campaign-impact")
async def get_campaign_referral_impact():
    """
    Returns the impact of referrals on campaign conversions.
    """
    return referral_service.get_campaign_referral_impact()

