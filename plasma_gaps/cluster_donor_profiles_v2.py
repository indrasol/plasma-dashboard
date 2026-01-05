import pandas as pd
import json
import numpy as np

# Load clustered donor dataset (must contain 'cluster_label' column)
df = pd.read_csv('donor_vectors_clustered.csv')
df.fillna(0, inplace=True)

print("\n📋 Columns available:", df.columns.tolist())
print(df.head())

# Ensure 'cluster_label' exists and is int type
if 'cluster_label' not in df.columns:
    raise ValueError("❌ Missing required column: 'cluster_label'")
df['cluster_label'] = df['cluster_label'].astype(int)

# Show cluster sizes
print("\n🔎 Cluster sizes:")
print(df['cluster_label'].value_counts())

# Identify relevant columns dynamically
available_cols = df.columns.tolist()
channel_cols = [col for col in available_cols if col.startswith('channel_')]

has_age = 'age' in df.columns
has_converted = 'converted' in df.columns
has_donation_count = 'donation_count' in df.columns

# Inject dummy data if needed for summaries
if not has_age:
    print("⚠️ No age column found — injecting simulated ages.")
    df['age'] = np.random.randint(25, 70, size=len(df))
    has_age = True

if not has_converted:
    print("⚠️ No converted column found — injecting dummy conversions.")
    df['converted'] = (df.get('donation_count', 0) > 2).astype(int)
    has_converted = True

for ch_col in ['channel_sms', 'channel_email', 'channel_phone']:
    if ch_col not in df.columns:
        print(f"⚠️ Missing {ch_col} — injecting zeros.")
        df[ch_col] = 0.0

# Refresh channel columns list after patching missing ones
channel_cols = [col for col in df.columns if col.startswith('channel_')]

# Build aggregation dictionary based on what's available
agg_dict = {}
if has_age:
    agg_dict['age'] = ['mean', 'median']
if has_donation_count:
    agg_dict['donation_count'] = ['mean', 'median']
if has_converted:
    agg_dict['converted'] = ['mean', 'count']
for ch in channel_cols:
    agg_dict[ch] = ['mean']

# Perform group-by and aggregation by cluster label 🧠
grouped = df.groupby('cluster_label').agg(agg_dict)
grouped.columns = ['_'.join(col).strip() for col in grouped.columns.values]
grouped.reset_index(inplace=True)

def get_label_for_cluster(row):
    label_parts = []

    age_val         = row.get('age_median')
    donation_mean   = row.get('donation_count_mean')

    print(f"Labeling cluster {row['cluster_label']} → age={age_val}, donations={donation_mean}")

    # Age label logic 🎂 
    if has_age and pd.notnull(age_val):
        if age_val < 30:
            label_parts.append("Young")
        elif age_val > 50:
            label_parts.append("Older")

    # Donation frequency labels 💸 
    if has_donation_count and pd.notnull(donation_mean):
        if donation_mean >= 10:
            label_parts.append("frequent donors")
        elif donation_mean <= 2:
            label_parts.append("first-time donors")

    # Dominant communication channel 📡 
    dom_channel, max_val = None, -1.0
    for ch_col in channel_cols:
        val = row.get(f"{ch_col}_mean", 0)
        if pd.notnull(val) and val > max_val:
            max_val, dom_channel = val, ch_col

    if dom_channel is not None:
        if dom_channel.endswith('_sms'):
            label_parts.append("prefer SMS")
        elif dom_channel.endswith('_email'):
            label_parts.append("prefer Email")
        elif dom_channel.endswith('_phone'):
            label_parts.append("prefer Phone")
    else:
        label_parts.append("no clear channel preference")

    return " ".join(label_parts).capitalize()

# Generate labels per cluster 👍🏼 
grouped["label"] = grouped.apply(get_label_for_cluster, axis=1)

# Build output JSON list 📦 
output_list=[]
for _, row in grouped.iterrows():
    
    output = {
        "cluster": int(row["cluster_label"]),
        "label": row["label"]
    }

    converted_count     = row.get("converted_count", None)
    converted_mean      = row.get("converted_mean", None)

    output["size"]             = int(converted_count) if pd.notnull(converted_count) else \
                                 df[df.cluster_label == int(row["cluster_label"])].shape[0]
    
    output["conversion_rate"]  = round(float(converted_mean), 3) \
                                 if pd.notnull(converted_mean) else 0.0

    
    # Channel preferences 📡  
channel_data={
        ch.replace('channel_', ''): round(float(row.get(f"{ch}_mean", 0)), 2)
        for ch in channel_cols 
        if f"{ch}_mean" in row and pd.notnull(row[f"{ch}_mean"])
	}
	
output["channel_preferences"]=(channel_data or {})

	# Add to master list ✅  
output_list.append(output)

# Save final summary file to use on frontend 🔽  
with open('donor_clusters_labeled.json','w') as fout:
	json.dump(output_list,fout,indent=2)

print("\n✅ Saved labeled clusters ➜ donor_clusters_labeled.json")
print(f"Clusters generated: {len(output_list)}\n")