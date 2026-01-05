import pandas as pd
import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

# === File paths === #
CENTROID_JSON = "perfect_cluster_centroid.json"
DONOR_VECTORS_CSV = "donor_vectors.csv"
OUTPUT_FILE = "internal_lookalike_matches.csv"

# === Metadata for export === #
DEFAULT_CLUSTER_ID = 3                   # Replace with your actual top cluster if dynamic
MODEL_VERSION = "v1-metrics-only"

def load_centroid():
    with open(CENTROID_JSON, 'r') as f:
        data = json.load(f)
    return np.array(data['vector']), data['feature_names']

def main():
    print("🚀 Loading centroid...")
    
    centroid_vector, feature_cols = load_centroid()
    
    df_raw = pd.read_csv(DONOR_VECTORS_CSV)

    print(f"🔎 Matching against {len(df_raw)} donors using features: {feature_cols}")

    # Check required vector features exist
    if not all(col in df_raw.columns for col in feature_cols):
        missing = [col for col in feature_cols if col not in df_raw.columns]
        raise ValueError(f"❌ Missing expected features: {missing}")

    X = df_raw[feature_cols].values.astype(float)

    centroid_vector_2d = centroid_vector.reshape(1, -1)
    
    sims = cosine_similarity(X, centroid_vector_2d).flatten()

    matched_at_str = datetime.utcnow().isoformat() + "Z"

    # Build minimal Supabase-compatible DataFrame
    df_out = pd.DataFrame({
        'donor_id': df_raw['donor_id'],
        'similarity_score': sims,
        'matched_at': matched_at_str,
        'source_cluster': DEFAULT_CLUSTER_ID,
        'model_version': MODEL_VERSION
    })

    # Sort by similarity score descending before export (optional)
    df_out.sort_values(by='similarity_score', ascending=False, inplace=True)

    # Write only those exact fields to file
    df_out.to_csv(OUTPUT_FILE, index=False)

    print("\n✅ Sample output:")
    print(df_out.head())

    print(f"\n📁 Exported → {OUTPUT_FILE}")


if __name__ == "__main__":
     main()