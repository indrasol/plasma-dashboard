import pandas as pd
import networkx as nx
import webbrowser

from pyvis.network import Network
net = Network(height="750px", width="100%", bgcolor="#ffffff", font_color="black", html='TRUE')

# === CONFIGURATION === #
TOP_N_HUBS = 15                      # Limit to top N influencers by referrals
FILTER_INTEREST = None              # e.g., "Strength Training"
FILTER_CATEGORY = None              # e.g., "Physical Health"

# === LOAD DATA === #
donors_df      = pd.read_csv("donors_rows.csv")
referrals_df   = pd.read_csv("interest_based_referrals.csv")
influencers_df = pd.read_csv("influencer_profiles.csv")

print(f"📊 Loaded {len(donors_df)} donors, {len(referrals_df)} referrals")

# Apply optional filters
if FILTER_INTEREST:
    referrals_df = referrals_df[
        referrals_df['interest_name'].fillna('').str.contains(FILTER_INTEREST, case=False)
    ]
if FILTER_CATEGORY:
    referrals_df = referrals_df[
        referrals_df['interest_category'].fillna('').str.contains(FILTER_CATEGORY, case=False)
    ]

print(f"🔍 Referrals after filters: {len(referrals_df)}")

# Identify top-N influencers by count of outgoing referrals
hub_counts      = referrals_df["referrer_donor_id"].value_counts().head(TOP_N_HUBS)
top_influencers = set(hub_counts.index.tolist())

# Collect all referred donor_ids for those hubs
nodes_to_plot   = set(top_influencers)
for inf_id in top_influencers:
    nodes_to_plot.update(
        referrals_df.loc[referrals_df["referrer_donor_id"] == inf_id, "referred_donor_id"].tolist()
    )

# Filter subgraph data from full referral list
sub_referrals   = referrals_df[
    (referrals_df["referrer_donor_id"].isin(nodes_to_plot)) &
    (referrals_df["referred_donor_id"].isin(nodes_to_plot))
]

G_sub           = nx.DiGraph()
G_sub.add_edges_from([
    (row["referrer_donor_id"], row["referred_donor_id"])
    for _, row in sub_referrals.iterrows()
])

donor_map       = donors_df.set_index('donor_id').to_dict(orient='index')
out_degrees     = dict(G_sub.out_degree())

color_palette   = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
    "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
    "#008080", "#e6beff", "#9a6324"
]
hub_colors      = {inf: color_palette[i % len(color_palette)] for i, inf in enumerate(top_influencers)}

nt              = Network(height="800px", width="100%", directed=True)

for node in G_sub.nodes():
    data     = donor_map.get(node, {})
    
    first    = data.get('first_name') or ""
    last     = data.get('last_name') or ""
    label    = f"{first} {last}".strip() or "Unnamed Donor"

    is_inf   = node in top_influencers
    
    title_html  = f"""
        <b>Name:</b> {label}<br>
        <b>Gender:</b> {data.get('gender', 'N/A')}<br>
        <b>DOB:</b> {data.get('date_of_birth', 'N/A')}<br>
        <b>Zip Code:</b> {data.get('zip_code', '')}<br>
        <b>Loyalty Tier:</b> {data.get('loyalty_tier', '')}
    """
    
    if is_inf:
        title_html += f"<br><b>Total Referrals:</b> {out_degrees.get(node,0)}"
        title_html += "<br><span style='color:green;'><b>[Influencer]</b></span>"
    
    nt.add_node(
        n_id=node,
        label=label,
        title=title_html,
        shape="star" if is_inf else "dot",
        size=22 if is_inf else 10,
        color=hub_colors[node] if is_inf else hub_colors.get(list(G_sub.predecessors(node))[0], '#cccccc'),
    )

# 🛠 FIXED: Properly retrieve interest name/category per edge hover tooltip!
for _, row in sub_referrals.iterrows():
    interest_val_raw1  = row.get("interest_name")
    interest_val_raw2  = row.get("interest_category")
    
    interest_value     = (
        str(interest_val_raw1).strip() if pd.notnull(interest_val_raw1) and str(interest_val_raw1).strip()
        else str(interest_val_raw2).strip() if pd.notnull(interest_val_raw2)
        else "Unknown"
    )

    nt.add_edge(
        row["referrer_donor_id"],
        row["referred_donor_id"],
        title=f"<b>Interest:</b> {interest_value}"
    )

nt.repulsion(node_distance=220)
nt.show_buttons(filter_=['physics'])

output_path     = "network.html"
nt.write_html(output_path)
webbrowser.open(output_path)

print(f"\n✅ Visualization ready → Top {TOP_N_HUBS} influencer hubs rendered.")