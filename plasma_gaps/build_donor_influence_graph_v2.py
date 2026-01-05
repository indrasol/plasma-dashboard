import pandas as pd
import networkx as nx
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# === Supabase Setup ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Pull all influencer links ===
print("📥 Fetching donor_influencer_links...")
response = supabase.table("donor_influencer_links").select("*").execute()
links = response.data
df_links = pd.DataFrame(links)
if df_links.empty:
    raise Exception("❌ No records found in donor_influencer_links")

# Optional: Normalize or map relationship types to weights if needed here

# === Build Graph ===
G = nx.DiGraph()  # Directed graph - because A ➜ B ≠ B ➜ A in influence terms

print(f"🔗 Adding {len(df_links)} influence edges...")
for _, row in df_links.iterrows():
    donor_id = row['donor_id']
    influencer_id = row['influencer_id']
    rel_type = row.get('relationship_type', 'unknown')
    rel_weight = row.get('relationship_weight', 1)

    # Use edge metadata for advanced modeling later if needed!
    G.add_edge(
        influencer_id, donor_id,
        weight=rel_weight,
        type=rel_type,
        interest=row.get('interest_category')
    )

print(f"✅ Built directed graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")

# === Compute Centrality Metrics ===
pagerank_scores = nx.pagerank(G, weight='weight')
betweenness_scores = nx.betweenness_centrality(G)

# Merge scores into one DataFrame (only influencers)
results_df = pd.DataFrame({
    'influencer_id': list(pagerank_scores.keys()),
    'pagerank_score': [pagerank_scores[k] for k in pagerank_scores],
    'betweenness_score': [betweenness_scores[k] for k in betweenness_scores]
})

results_df['total_score'] = results_df['pagerank_score'] * 0.7 + results_df['betweenness_score'] * 0.3

print("\n🏆 Top Influencers:")
print(results_df.sort_values(by="total_score", ascending=False).head(10))

# OPTIONAL Save locally before push:
results_df.to_csv("exported/influencer_network_scores.csv", index=False)

# Push to Supabase table "influencer_scores"
for row in results_df.itertuples():
    supabase.table("influencer_scores").upsert({
        "influencer_id": row.influencer_id,
        "name": None,
        "total_score": int(row.total_score * 10000),  # scaled up for visibility if needed
        "updated_at": pd.Timestamp.now().isoformat()
    }).execute()

print("\n✅ Updated influencer scores in Supabase.")