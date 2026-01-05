import os
import uuid
from datetime import datetime

import pytesseract
from PIL import Image
import emoji as emojilib
import pandas as pd
from pathlib import Path

# === SETTINGS === #
BASE_DIR = Path("C:/NuRamDataProcessing/donor_sentiment_module")  # ✅ Update if needed

IMAGE_DIR = BASE_DIR / "images"
OUTPUT_CSV = BASE_DIR / "outputs" / "raw_social_posts.csv"

def extract_emojis(text):
    """Extract emojis from text."""
    return [char for char in text if char in emojilib.EMOJI_DATA]

def translate_emojis(emojis_list):
    """Map emojis to general sentiment categories."""
    sentiment_map = {
        '😊': 'positive', 
        '😢': 'sadness', 
        '😡': 'anger',
        '😂': 'humor',   
        '❤️': 'love',     
        '👍': 'approval',
        '👎': 'disapproval',
        '😮': 'surprise',
        # Add more mappings as needed
    }
    return list(set([sentiment_map.get(e, "neutral") for e in emojis_list]))

def clean_text(text):
    """Clean up OCR output into one paragraph."""
    lines = text.split("\n")
    clean_lines = [line.strip() for line in lines if line.strip()]
    return " ".join(clean_lines)

def process_image(filepath, platform="Facebook"):
    """Run OCR and emoji analysis on image file."""
    img = Image.open(filepath)
    
    # Run OCR using Tesseract:
    extracted_text = pytesseract.image_to_string(img)
    
    # Extract & Translate Emojis:
    emojis_found = extract_emojis(extracted_text)
    emoji_tags   = translate_emojis(emojis_found)
    
    row_data = {
        "id": str(uuid.uuid4()),
        "source_platform": platform,
        "post_text": clean_text(extracted_text),
        "user_name": None,
        "timestamp": datetime.utcnow().isoformat(),
        "url": None,
        "inferred_location": None,
        "influencer_mentioned": None,
        "emoji_tags": ", ".join(emoji_tags),
        "raw_emojis": "".join(emojis_found)
    }
    
    return row_data

# === MAIN EXECUTION === #
if not IMAGE_DIR.exists():
    raise FileNotFoundError(f"❌ Image directory not found: {IMAGE_DIR}")

rows = []

for image_path in IMAGE_DIR.iterdir():
    if image_path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
        
        print(f"📷 Processing {image_path.name}...")
        
        platform_guess = (
            "Reddit" if "reddit" in image_path.stem.lower()
            else "Facebook"
        )
        
        row_result = process_image(image_path, platform=platform_guess)
        
        rows.append(row_result)

# Convert to DataFrame and write CSV output
df_out = pd.DataFrame(rows)

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)  # Ensure outputs/ exists before writing

df_out.to_csv(OUTPUT_CSV, index=False)

print(f"\n✅ Done. Saved structured data to:\n{OUTPUT_CSV}")