import pandas as pd
import networkx as nx
from datetime import datetime

# === File Paths === #
DONORS_CSV        = "donors.csv"
REFERRALS_CSV     = "referrals.csv"
RULE_BASED_CSV    = "influencer_scores.csv"  # From influencer_scoring.py output
OUTPUT_CSV        = "merged_influencer_scores_upload.csv"

# === Step 1: Load and Normalize Donors & Referrals === #
print("📥 Loading donors and referrals...")

donors_df    = pd.read_csv(DONORS_CSV)
referrals_df = pd.read_csv(REFERRALS_CSV)

donors_df.columns    = donors_df.columns.str.strip().str.lower()
referrals_df.columns = referrals_df.columns.str.strip().str.lower()

required_donor_cols    = {"donor_id", "first_name", "last_name", "total_donated", "graph_eligible"}
required_referral_cols = {"referrer_donor_id", "referred_donor_id", "source_type"}

if not required_donor_cols <= set(donors_df.columns):
    raise ValueError(f"Missing columns in {DONORS_CSV}. Required: {required_donor_cols}")
if not required_referral_cols <= set(referrals_df.columns):
    raise ValueError(f"Missing columns in {REFERRALS_CSV}. Required: {required_referral_cols}")

# Filter eligible donors only
eligible_donors = donors_df[donors_df["graph_eligible"] == True]

# === Step 2: Build Graph and Compute PageRank === #
print("🔗 Building influence graph...")
G = nx.DiGraph()

for _, row in eligible_donors.iterrows():
    name = f"{row['first_name']} {row['last_name']}".strip()
    G.add_node(row["donor_id"], name=name, total_donated=row.get("total_donated", 0))

weights_by_source_type = {"link": 5, "event": 3, "manual": 2}
missing_nodes_count = 0

for _, row in referrals_df.iterrows():
    src, tgt = row["referrer_donor_id"], row["referred_donor_id"]
    
    if src == tgt or pd.isnull(src) or pd.isnull(tgt):
        continue
    
    if src not in G.nodes or tgt not in G.nodes:
        missing_nodes_count += 1
        continue
    
    weight_val = weights_by_source_type.get(str(row.get("source_type")).lower(), 1)
    G.add_edge(src, tgt, weight=weight_val)

print(f"🧠 Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")
if missing_nodes_count > 0:
    print(f"⚠️ Skipped {missing_nodes_count} edges due to missing/mismatched donor nodes.")

print("📊 Computing PageRank (graph_score)...")
pagerank_scores_scaled_ints \
= {k: int(v * 10000) for k, v in nx.pagerank(G, alpha=0.85, weight="weight").items()}

# Convert pagerank result into DataFrame for merging later
graph_score_df       \
= pd.DataFrame([
      {"influencer_id": k,
       "graph_score": v}
      for k, v in pagerank_scores_scaled_ints.items()
])

# === Step 3: Load Rule-Based Scores and Merge === #
print("\n🔀 Merging with rule-based scores...")

rule_score_df        \
= pd.read_csv(RULE_BASED_CSV)
rule_score_df.columns= rule_score_df.columns.str.strip().str.lower()

if 'score' in rule_score_df.columns:
    rule_score_df.rename(columns={'score': 'total_score'}, inplace=True)
if 'id' in rule_score_df.columns:
    rule_score_df.rename(columns={'id': 'influencer_id'}, inplace=True)

merged = pd.merge(rule_score_df,
                  graph_score_df,
                  on='influencer_id',
                  how='left')  # <-- include all rule-based scored rows!
merged["graph_score"] = merged["graph_score"].fillna(0).astype(int)

# Use name from the rule-based file (which came from the scoring engine)
name_column          \
= 'name' if 'name' in merged.columns else None

# === Step 4: Calculate Final Score & Format Output === #
merged["final_score"]   \
   =(0.7 * merged["total_score"] + 
     0.3 * merged["graph_score"]).round(0).astype(int)

merged["updated_at"] \
   =(datetime.utcnow().isoformat())

output_fields_ordered=[
     "influencer_id",
     name_column,
     "total_score",
     "graph_score",
     "final_score",
     "updated_at"
]

output_final            \
= merged[output_fields_ordered].rename(columns={name_column: 'name'}) if name_column else merged

output_final.to_csv(OUTPUT_CSV, index=False)

print(f"\n✅ Saved combined score output to '{OUTPUT_CSV}'")
print("\n🏆 Top Influencers by Final Score:")
top10=output_final.sort_values(by="final_score", ascending=False).head(10)
for _, r in top10.iterrows():
     print(f"{r['name']:<30} | Final Score: {r['final_score']} "
           f"| Rule-Based: {r['total_score']} | Graph: {r['graph_score']}")