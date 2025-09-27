import pandas as pd
import numpy as np
import json

# === Load clustered donor data ===
df = pd.read_csv('donor_vectors_clustered.csv')
df.fillna(0, inplace=True)

if 'cluster_label' not in df.columns:
    raise ValueError("❌ Missing required column: 'cluster_label'")
df['cluster_label'] = df['cluster_label'].astype(int)

# === Ensure channel columns exist ===
required_channels = ['channel_sms', 'channel_email', 'channel_phone']
for ch_col in required_channels:
    if ch_col not in df.columns:
        print(f"⚠️ Injecting missing channel column: {ch_col}")
        df[ch_col] = 0.0

# Refresh list of actual available channel cols
channel_cols = [col for col in df.columns if col.startswith('channel_')]

# ✅ FIXED: Inject dummy converted BEFORE aggregation dict is built!
if 'converted' not in df.columns:
    print("⚠️ Injecting placeholder 'converted' column based on donation_count > 2")
    df['converted'] = (df.get('donation_count', 0) > 2).astype(int)

# === Build aggregation dictionary dynamically AFTER all columns are ensured ===
agg_dict = {
    'converted': ['mean', 'count']
}
for ch in channel_cols:
    agg_dict[ch] = ['mean']

if 'age' in df.columns:
    agg_dict['age'] = ['mean', 'median']
if 'donation_count' in df.columns:
    agg_dict['donation_count'] = ['mean', 'median']

grouped = df.groupby('cluster_label').agg(agg_dict)
grouped.columns = ['_'.join(col).strip() for col in grouped.columns.values]
grouped.reset_index(inplace=True)


def generate_readable_label(row):
    label_parts = []

    # Age-based label 🎂
    age_median = row.get('age_median')
    if pd.notnull(age_median):
        if age_median < 30:
            label_parts.append("Young")
        elif age_median > 50:
            label_parts.append("Older")

    # Donation frequency 💸
    donation_mean = row.get('donation_count_mean')
    if pd.notnull(donation_mean):
        if donation_mean >= 10:
            label_parts.append("Frequent Donors")
        elif donation_mean <= 2:
            label_parts.append("First-Time Donors")

    # Channel preference 📨📧📞
    dom_channel, max_val = None, -1.0
    for ch_col in channel_cols:
        val = row.get(f"{ch_col}_mean", 0)
        if pd.notnull(val) and val > max_val:
            max_val, dom_channel = val, ch_col

    if dom_channel is not None:
        if dom_channel.endswith('_sms'):
            label_parts.append("Prefer SMS")
        elif dom_channel.endswith('_email'):
            label_parts.append("Prefer Email")
        elif dom_channel.endswith('_phone'):
            label_parts.append("Prefer Phone")

    return " ".join(label_parts).strip().title() or "Unlabeled Segment"


# === Generate final cluster summary JSON structure ===

output_list=[]
for _, row in grouped.iterrows():
    
    output = {
        "cluster": int(row["cluster_label"]),
        "label": generate_readable_label(row),
        "size": int(row.get("converted_count", 
                 df[df.cluster_label == int(row["cluster_label"])].shape[0])),
        "conversion_rate": round(float(row.get("converted_mean", 0)), 3),
        "channel_preferences": {
            ch.replace('channel_', ''): round(float(row.get(f"{ch}_mean", 0)),2)
            for ch in channel_cols 
            if f"{ch}_mean" in row and pd.notnull(row[f"{ch}_mean"])
        }
    }

    output_list.append(output)

with open('donor_clusters_labeled.json','w') as fout:
	json.dump(output_list,fout,indent=2)

print("\n✅ Saved cluster summaries ➜ donor_clusters_labeled.json")
print(f"Clusters summarized: {len(output_list)}\n")