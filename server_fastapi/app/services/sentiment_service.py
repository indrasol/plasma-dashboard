import pandas as pd
from pathlib import Path
from server_fastapi.app.utils.logger import log_info, log_error

class SentimentService:
    def __init__(self):
        self.sent_pipeline = None
        self.zero_shot_pipeline = None
        self.topic_labels = [
            "Compensation", "Exploitation", "Wait Time",
            "Trust", "Referral Bonus", "Convenience"
        ]

    def _load_models(self):
        """Lazy load heavy ML models."""
        if self.sent_pipeline is None or self.zero_shot_pipeline is None:
            try:
                from transformers import pipeline
                log_info("📦 Loading sentiment models (this may take a while)...")
                self.sent_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
                self.zero_shot_pipeline = pipeline("zero-shot-classification")
            except ImportError:
                log_error("Transformers library not installed. Sentiment analysis will be limited.")
            except Exception as e:
                log_error(f"Error loading models: {e}")

    def analyze_text(self, text):
        self._load_models()
        
        if self.sent_pipeline is None:
            return "Neutral", 0.5, "General"

        try:
            sent_result = self.sent_pipeline(text)[0]
            label = sent_result["label"].capitalize()
            score = round(sent_result["score"], 4)
        except Exception:
            label, score = "Neutral", 0.5
        
        try:
            topic_result = self.zero_shot_pipeline(text, candidate_labels=self.topic_labels)
            top_topics = topic_result["labels"][:3]
        except Exception:
            top_topics = ["General"]
        
        return label, score, ", ".join(top_topics)

    def process_csv(self, input_path: str, output_path: str = None):
        input_path = Path(input_path)
        if not input_path.exists():
            log_error(f"Input CSV not found: {input_path}")
            return

        df = pd.read_csv(input_path)
        log_info(f"Analyzing {len(df)} posts...")

        def analyze_row(text):
            label, score, topics = self.analyze_text(str(text))
            return pd.Series([label, score, topics])

        df[["sentiment_label", "relevance_score", "emotion_tags"]] = df["post_text"].apply(analyze_row)

        if output_path is None:
            output_path = input_path.parent / f"analyzed_{input_path.name}"
        else:
            output_path = Path(output_path)

        df.to_csv(output_path, index=False)
        log_info(f"Saved results to {output_path}")
        return df
