import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

# === Config === #
INPUT_CSV = "donor_vectors.csv"
EXPORT_JSON_FILE = "perfect_cluster_centroid.json"
EXPORT_CSV_FILE = "perfect_cluster_centroid.csv"

N_CLUSTERS = 5  # Adjust based on elbow/silhouette analysis

# Features to use in clustering (must be numeric)
VECTOR_FEATURES = [
    'total_donated',
    'avg_donation_size',
    'donation_count',
    'campaign_count',
    'health_screening_count'
]


def main():
    print("🚀 Loading donor vectors...")
    
    df = pd.read_csv(INPUT_CSV)

    # Check if all required columns exist
    for col in VECTOR_FEATURES:
        if col not in df.columns:
            raise ValueError(f"❌ Missing expected feature column: {col}")

    X = df[VECTOR_FEATURES].values.astype(float)

    print(f"📊 Clustering {X.shape[0]} donors using {len(VECTOR_FEATURES)} dimensions...")

    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42).fit(X)

    df['cluster'] = kmeans.labels_

    print("✅ Clustering complete.\n")

    # Identify the top-performing cluster based on total donations
    avg_by_cluster = df.groupby('cluster')['total_donated'].mean().sort_values(ascending=False)

    print("🏆 Avg Total Donated by Cluster:")
    print(avg_by_cluster)

    top_cluster_id = avg_by_cluster.index[0]
    
    print(f"\n🔥 Best cluster is #{top_cluster_id} — extracting centroid...\n")

    centroid_vector = kmeans.cluster_centers_[top_cluster_id]

    # === Export JSON === #
    json_payload = {
        "profile_name": "Top Donor Cluster Centroid",
        "model_version": "v1-metrics-only",
        "feature_names": VECTOR_FEATURES,
        "vector": centroid_vector.tolist()
    }

    with open(EXPORT_JSON_FILE, 'w') as f_json:
        json.dump(json_payload, f_json, indent=2)
    
    print(f"✅ Saved JSON → {EXPORT_JSON_FILE}")

    # === Export CSV === #
    df_out = pd.DataFrame([centroid_vector], columns=VECTOR_FEATURES)
    
    df_out.to_csv(EXPORT_CSV_FILE, index=False)
    
    print(f"✅ Saved CSV → {EXPORT_CSV_FILE}")


if __name__ == "__main__":
     main()