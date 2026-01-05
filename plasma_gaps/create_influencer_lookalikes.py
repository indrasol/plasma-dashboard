import pandas as pd
import numpy as np
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
import os

# === CONFIG === #
TOP_N_INFLUENCERS = 10    # how many seed influencers to match from
TOP_MATCHES_PER_SEED = 5  # how many lookalikes per influencer to return
VECTOR_FEATURES = ['total_donated', 'avg_donation_size', 'donation_count',
                   'campaign_count', 'health_screening_count']

# === Load CSVs === #
print("📥 Loading input files...")
vectors_df = pd.read_csv('donor_vectors.csv')
scores_df = pd.read_csv('influencer_scores.csv')
links_df = pd.read_csv('donor_influencer_links.csv')  # optional exclusions

# Get top influencers by score
top_influencers = scores_df.sort_values(by='total_score', ascending=False).head(TOP_N_INFLUENCERS)
print(f"✅ Using {len(top_influencers)} seed influencers")

# Normalize donor vectors for cosine similarity
vector_matrix = vectors_df[VECTOR_FEATURES].fillna(0).values.astype(float)
vector_matrix_normed = normalize(vector_matrix)

# Build lookup dict of donor_id → vector index and vice versa
id_to_index = {did: i for i, did in enumerate(vectors_df['donor_id'])}
index_to_id = {i: did for did, i in id_to_index.items()}

results_list = []

for _, row in top_influencers.iterrows():
    seed_id = row['influencer_id']
    seed_name = row.get('name', '')
    
    if seed_id not in id_to_index:
        print(f"⚠️ Skipping influencer {seed_name} – no vector found.")
        continue
    
    seed_idx = id_to_index[seed_id]
    seed_vec_normed = vector_matrix_normed[seed_idx].reshape(1, -1)

    similarities = cosine_similarity(seed_vec_normed, vector_matrix_normed)[0]
    
    # Exclude self and known referrals if link table is present
    exclude_ids = set([seed_id])
    
    if not links_df.empty:
        referred_ids = links_df.query("influencer_id == @seed_id")['donor_id'].tolist()
        exclude_ids.update(referred_ids)

    filtered_indices_scores = [
        (index_to_id[i], sim)
        for i, sim in enumerate(similarities)
        if index_to_id[i] not in exclude_ids
    ]
    
    top_matches_for_seed = sorted(filtered_indices_scores, key=lambda x: x[1], reverse=True)[:TOP_MATCHES_PER_SEED]

    for matched_donor_id, score in top_matches_for_seed:
        results_list.append({
            "seed_influencer_id": seed_id,
            "seed_name": seed_name,
            "matched_donor_id": matched_donor_id,
            "similarity_score": round(score, 4)
        })

print(f"✅ Total matches generated: {len(results_list)}")

# Save output CSV 🔽 
from datetime import datetime

# Add created_at timestamp + row ID
now_str = datetime.utcnow().isoformat()

for i, row in enumerate(results_list):
    row["id"] = i + 1                     # simple auto-incrementing int4 ID
    row["created_at"] = now_str          # ISO8601 timestamp string

# Convert to DataFrame and export with additional columns
output_df = pd.DataFrame(results_list)

# Reorder columns if desired for consistency with Supabase:
column_order = [
    "id", "seed_influencer_id", "seed_name", "matched_donor_id",
    "similarity_score", "created_at"
]
output_df = output_df[column_order]

export_path = os.path.join(os.getcwd(), "influencer_lookalike_matches_export.csv")
output_df.to_csv(export_path, index=False)

print(f"📤 Saved → {export_path}")
print("📤 Saved → influencer_lookalike_matches_export.csv")