import os
import uuid
from datetime import datetime
from pathlib import Path
from PIL import Image
import emoji as emojilib
import pandas as pd
from server_fastapi.app.utils.logger import log_info, log_error

class OCRService:
    def __init__(self, tesseract_cmd: str = None):
        self.tesseract_available = False
        try:
            import pytesseract
            self.pytesseract = pytesseract
            if tesseract_cmd:
                self.pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            # Try to get tesseract version to check if it's installed
            self.pytesseract.get_tesseract_version()
            self.tesseract_available = True
        except ImportError:
            log_error("pytesseract library not installed.")
        except Exception as e:
            log_error(f"Tesseract OCR not found or not configured: {e}")

    def extract_emojis(self, text):
        return [char for char in text if char in emojilib.EMOJI_DATA]

    def translate_emojis(self, emojis_list):
        sentiment_map = {
            '😊': 'positive', 
            '😢': 'sadness', 
            '😡': 'anger',
            '😂': 'humor',   
            '❤️': 'love',     
            '👍': 'approval',
            '👎': 'disapproval',
            '😮': 'surprise',
        }
        return list(set([sentiment_map.get(e, "neutral") for e in emojis_list]))

    def clean_text(self, text):
        lines = text.split("\n")
        clean_lines = [line.strip() for line in lines if line.strip()]
        return " ".join(clean_lines)

    def process_image(self, filepath, platform="Facebook"):
        if not self.tesseract_available:
            log_error("Cannot process image: Tesseract not available.")
            return None

        try:
            img = Image.open(filepath)
            extracted_text = self.pytesseract.image_to_string(img)
            
            emojis_found = self.extract_emojis(extracted_text)
            emoji_tags = self.translate_emojis(emojis_found)
            
            return {
                "id": str(uuid.uuid4()),
                "source_platform": platform,
                "post_text": self.clean_text(extracted_text),
                "user_name": None,
                "timestamp": datetime.utcnow().isoformat(),
                "url": None,
                "inferred_location": None,
                "influencer_mentioned": None,
                "emoji_tags": ", ".join(emoji_tags),
                "raw_emojis": "".join(emojis_found)
            }
        except Exception as e:
            log_error(f"Error processing image {filepath}: {e}")
            return None

    def process_directory(self, image_dir: str, output_csv: str = None):
        image_dir = Path(image_dir)
        if not image_dir.exists():
            log_error(f"Image directory not found: {image_dir}")
            return None

        rows = []
        for image_path in image_dir.iterdir():
            if image_path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                log_info(f"📷 Processing {image_path.name}...")
                platform_guess = "Reddit" if "reddit" in image_path.stem.lower() else "Facebook"
                row_result = self.process_image(image_path, platform=platform_guess)
                if row_result:
                    rows.append(row_result)

        if not rows:
            return None

        df_out = pd.DataFrame(rows)
        if output_csv:
            output_csv = Path(output_csv)
            output_csv.parent.mkdir(parents=True, exist_ok=True)
            df_out.to_csv(output_csv, index=False)
            log_info(f"Saved structured data to {output_csv}")
        
        return df_out

