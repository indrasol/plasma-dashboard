import pandas as pd
from transformers import pipeline

# === Load Data === #
df = pd.read_csv("donor_sentiment_module/outputs/raw_social_posts.csv")

# === Hugging Face Sentiment Pipeline === #
print("📦 Loading sentiment model...")
sent_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
# Define topic labels for zero-shot classification
topic_labels = [
    "Compensation", "Exploitation", "Wait Time",
    "Trust", "Referral Bonus", "Convenience"
]
zero_shot_pipeline = pipeline("zero-shot-classification")

def analyze_post(text):
    try:
        sent_result = sent_pipeline(text)[0]
        label = sent_result["label"].capitalize()   # e.g., POSITIVE → Positive
        score = round(sent_result["score"], 4)
    except Exception as e:
        label, score = "Neutral", 0.5
    
    try:
        topic_result = zero_shot_pipeline(text, candidate_labels=topic_labels)
        top_topics = topic_result["labels"][:3]  # Top 3 topics/tags
    except Exception as e:
        top_topics = ["General"]
    
    return pd.Series([label, score, ", ".join(top_topics)])

print("🔍 Analyzing posts...")

df[["sentiment_label", "relevance_score", "emotion_tags"]] = df["post_text"].astype(str).apply(analyze_post)

# Save result to new file or overwrite existing one
output_path = "donor_sentiment_module/outputs/analyzed_social_posts.csv"
df.to_csv(output_path, index=False)
print(f"✅ Saved labeled results to:\n{output_path}")