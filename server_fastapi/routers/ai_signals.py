from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter()


@router.get("/ai-signals")
async def get_ai_signals():
  """
  Temporary stub endpoint returning dummy AI signals.
  Replace with real model-driven insights later.
  """
  now = datetime.utcnow()
  return [
    {
      "type": "suggestion",
      "message": "Donor Alex Johnson has a 62% likelihood to respond to SMS outreach this week.",
      "timestamp": (now - timedelta(minutes=5)).isoformat() + "Z",
    },
    {
      "type": "alert",
      "message": "Campaign CTR for 'Winter Drive' dropped 8% versus prior week.",
      "timestamp": (now - timedelta(minutes=15)).isoformat() + "Z",
    },
    {
      "type": "info",
      "message": "Top-performing channel today: Email with 3.2% conversion.",
      "timestamp": (now - timedelta(minutes=25)).isoformat() + "Z",
    },
  ]

