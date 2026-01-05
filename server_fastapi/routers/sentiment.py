import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import List, Dict, Any
from server_fastapi.app.utils.logger import log_info, log_error

router = APIRouter()

# Path to the analyzed sentiment data
SENTIMENT_DATA_PATH = Path(__file__).resolve().parent.parent / 'data' / 'analyzed_social_posts.csv'

@router.get("/sentiment/posts")
async def get_analyzed_posts():
    """
    Returns the list of analyzed social media posts with sentiment and tags.
    """
    if not SENTIMENT_DATA_PATH.exists():
        log_error(f"Sentiment data file not found at {SENTIMENT_DATA_PATH}")
        return []

    try:
        df = pd.read_csv(SENTIMENT_DATA_PATH)
        # Convert NaN and Infinity to None for JSON compatibility
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        log_error(f"Error reading sentiment data: {e}")
        raise HTTPException(status_code=500, detail="Error reading sentiment data")

@router.get("/sentiment/summary")
async def get_sentiment_summary():
    """
    Returns a summary of sentiment across all posts.
    """
    if not SENTIMENT_DATA_PATH.exists():
        return {"Positive": 0, "Negative": 0, "Neutral": 0}

    try:
        df = pd.read_csv(SENTIMENT_DATA_PATH)
        summary = df['sentiment_label'].value_counts().to_dict()
        return summary
    except Exception as e:
        log_error(f"Error generating sentiment summary: {e}")
        return {}

