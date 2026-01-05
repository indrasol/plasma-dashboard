import pandas as pd
import numpy as np
import networkx as nx
from pathlib import Path
from typing import List, Dict, Any, Optional
from server_fastapi.app.utils.logger import log_info, log_error

class InfluencerService:
    def __init__(self):
        self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        self.donors_file = self.data_dir / "donors_rows.csv"
        self.referrals_file = self.data_dir / "interest_based_referrals.csv"
        self.interests_file = self.data_dir / "donor_interests.csv"
        self.influencers_file = self.data_dir / "influencer_profiles.csv"
        self.scores_file = self.data_dir / "influencer_scores.csv"
        self.links_file = self.data_dir / "donor_influencer_links.csv"

    def get_interest_metadata(self):
        """
        Returns unique interest categories and names.
        """
        if not self.interests_file.exists():
            return {"categories": [], "names": []}
        
        try:
            df = pd.read_csv(self.interests_file)
            df.columns = df.columns.str.strip().str.lower()
            
            categories = sorted(df['interest_category'].dropna().unique().tolist())
            names = sorted(df['interest_name'].dropna().unique().tolist())
            
            return {"categories": categories, "names": names}
        except Exception as e:
            log_error(f"Error fetching interest metadata: {e}")
            return {"categories": [], "names": []}

    def get_top_influencers(self, filter_interest=None, filter_category=None):
        """
        Returns enriched top influencer data.
        """
        if not self.scores_file.exists() or not self.links_file.exists():
            return []

        try:
            scores_df = pd.read_csv(self.scores_file)
            links_df = pd.read_csv(self.links_file)
            
            # Filter links by interest if provided
            if filter_interest or filter_category:
                if self.interests_file.exists():
                    interests_df = pd.read_csv(self.interests_file)
                    interests_df.columns = interests_df.columns.str.strip().str.lower()
                    
                    mask = pd.Series([True] * len(interests_df))
                    if filter_interest:
                        mask &= interests_df['interest_name'].fillna('').str.contains(filter_interest, case=False)
                    if filter_category:
                        mask &= interests_df['interest_category'].fillna('').str.contains(filter_category, case=False)
                    
                    valid_donor_ids = set(interests_df[mask]['donor_id'].unique())
                    links_df = links_df[links_df['donor_id'].isin(valid_donor_ids)]

            # Aggregate links per influencer
            counts = links_df.groupby('influencer_id').size().reset_index(name='linkedDonors')
            
            # Merge with scores
            enriched = scores_df.merge(counts, on='influencer_id', how='left')
            enriched['linkedDonors'] = enriched['linkedDonors'].fillna(0).astype(int)
            
            # Filter out zero-donor influencers if filtering is active
            if filter_interest or filter_category:
                enriched = enriched[enriched['linkedDonors'] > 0]
            
            # Add dummy interests for UI compatibility (or join from links if needed)
            enriched['interests'] = enriched['influencer_id'].apply(
                lambda x: [filter_interest] if filter_interest else []
            )

            enriched = enriched.sort_values('total_score', ascending=False)
            
            # Handle NaN/Inf values for JSON compliance
            enriched = enriched.replace([np.inf, -np.inf], np.nan)
            enriched = enriched.astype(object).where(pd.notnull(enriched), None)
            
            return enriched.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error fetching top influencers: {e}")
            return []

    def get_influence_graph(self, top_n=15, filter_interest=None, filter_category=None):
        """
        Generates nodes and edges for the influence network graph.
        """
        if not self.donors_file.exists() or not self.referrals_file.exists():
            log_error("Required data files for influencer graph not found.")
            return {"nodes": [], "edges": []}

        try:
            donors_df = pd.read_csv(self.donors_file)
            referrals_df = pd.read_csv(self.referrals_file)
            
            # Load interests if filtering is needed
            interests_df = None
            if self.interests_file.exists():
                interests_df = pd.read_csv(self.interests_file)
                interests_df.columns = interests_df.columns.str.strip().str.lower()

            # Apply filters via interest mapping
            if (filter_interest or filter_category) and interests_df is not None:
                mask = pd.Series([True] * len(interests_df))
                if filter_interest:
                    mask &= interests_df['interest_name'].fillna('').str.contains(filter_interest, case=False)
                if filter_category:
                    mask &= interests_df['interest_category'].fillna('').str.contains(filter_category, case=False)
                
                matching_donor_ids = set(interests_df[mask]['donor_id'].unique())
                
                # Filter referrals where the referred donor has the matching interest
                referrals_df = referrals_df[referrals_df['referred_donor_id'].isin(matching_donor_ids)]
                log_info(f"Filtered referrals down to {len(referrals_df)} based on interest filters.")

            # Identify top-N influencers by count of outgoing referrals
            hub_counts = referrals_df["referrer_donor_id"].value_counts().head(top_n)
            top_influencers = set(hub_counts.index.tolist())

            if not top_influencers:
                log_info("No influencers found for the given filters.")
                return {"nodes": [], "edges": []}

            # Collect nodes to plot
            nodes_to_plot = set(top_influencers)
            for inf_id in top_influencers:
                nodes_to_plot.update(
                    referrals_df.loc[referrals_df["referrer_donor_id"] == inf_id, "referred_donor_id"].tolist()
                )

            # Filter subgraph
            sub_referrals = referrals_df[
                (referrals_df["referrer_donor_id"].isin(nodes_to_plot)) &
                (referrals_df["referred_donor_id"].isin(nodes_to_plot))
            ]

            G_sub = nx.DiGraph()
            G_sub.add_edges_from([
                (row["referrer_donor_id"], row["referred_donor_id"])
                for _, row in sub_referrals.iterrows()
            ])

            donor_map = donors_df.set_index('donor_id').to_dict(orient='index')
            out_degrees = dict(G_sub.out_degree())

            # Define loyalty-based colors (Using requested influencer theme colors)
            LOYALTY_COLORS = {
                "Platinum": "#4363d8", # Coach Marcus (Blue)
                "Gold": "#4363d8",     # Coach Marcus (Blue)
                "Silver": "#911eb4",   # Chef Antonio (Purple)
                "Bronze": "#008080",   # Trainer Jason (Teal)
                "Unknown": "#008080"   # Trainer Jason (Teal)
            }

            nodes = []
            for node_id in G_sub.nodes():
                data = donor_map.get(node_id, {})
                
                first = data.get('first_name') or ""
                last = data.get('last_name') or ""
                label = f"{first} {last}".strip() or "Unnamed Donor"

                is_inf = node_id in top_influencers
                
                # Normalize loyalty tier
                raw_loyalty = data.get('loyalty_tier')
                loyalty = str(raw_loyalty).strip() if pd.notnull(raw_loyalty) else "Unknown"
                if loyalty.lower() == 'nan' or not loyalty:
                    loyalty = "Unknown"

                # Build tooltip info
                title = f"<b>Name:</b> {label}<br>"
                title += f"<b>Gender:</b> {data.get('gender', 'N/A')}<br>"
                title += f"<b>DOB:</b> {data.get('date_of_birth', 'N/A')}<br>"
                title += f"<b>Loyalty:</b> {loyalty}"
                
                if is_inf:
                    title += f"<br><b>Total Referrals:</b> {out_degrees.get(node_id, 0)}"
                    title += "<br><span style='color:green;'><b>[Influencer]</b></span>"

                # Assign color based on loyalty if influencer, else base on parent influencer
                if is_inf:
                    node_color = LOYALTY_COLORS.get(loyalty, "#008080")
                else:
                    preds = list(G_sub.predecessors(node_id))
                    if preds:
                        # Color based on the referrer's loyalty
                        referrer_data = donor_map.get(preds[0], {})
                        ref_loyalty = str(referrer_data.get('loyalty_tier', 'Unknown')).strip()
                        if not ref_loyalty or ref_loyalty.lower() == 'nan':
                            ref_loyalty = "Unknown"
                        node_color = LOYALTY_COLORS.get(ref_loyalty, "#008080")
                    else:
                        node_color = '#cccccc'

                nodes.append({
                    "id": str(node_id),
                    "label": label,
                    "title": title,
                    "shape": "star" if is_inf else "dot",
                    "size": 22 if is_inf else 10,
                    "color": node_color
                })

            edges = []
            # Create a lookup for interest info to show in edge tooltips
            interest_lookup = {}
            if interests_df is not None:
                for _, row in interests_df.iterrows():
                    d_id = str(row['donor_id'])
                    if d_id not in interest_lookup:
                        interest_lookup[d_id] = []
                    interest_lookup[d_id].append(str(row['interest_name']))

            for _, row in sub_referrals.iterrows():
                referred_id = str(row["referred_donor_id"])
                
                # Use the filtered interest if available, otherwise join from lookup
                interest_value = "Referral"
                if filter_interest:
                    interest_value = filter_interest
                elif referred_id in interest_lookup:
                    interest_value = ", ".join(interest_lookup[referred_id][:2])

                edges.append({
                    "from": str(row["referrer_donor_id"]),
                    "to": referred_id,
                    "title": f"<b>Interest:</b> {interest_value}",
                    "arrows": "to"
                })

            return {"nodes": nodes, "edges": edges}

        except Exception as e:
            log_error(f"Error generating influence graph: {e}")
            import traceback
            log_error(traceback.format_exc())
            return {"nodes": [], "edges": []}

    def recalculate_influencer_scores(self):
        """
        Calculates influencer scores using PageRank and Betweenness Centrality.
        Matches legacy build_donor_influence_graph_v2.py logic.
        """
        if not self.links_file.exists():
            log_error("Donor-influencer links file not found.")
            return None

        try:
            log_info("Recalculating influencer scores using NetworkX...")
            df_links = pd.read_csv(self.links_file)
            
            # Build directed graph
            G = nx.DiGraph()
            for _, row in df_links.iterrows():
                # Use influencer_id as source, donor_id as target
                G.add_edge(
                    row['influencer_id'], 
                    row['donor_id'], 
                    weight=row.get('relationship_weight', 1)
                )

            # Compute centrality metrics
            # PageRank: Importance based on quality and quantity of links
            pagerank_scores = nx.pagerank(G, weight='weight')
            # Betweenness: Importance based on being a bridge in the network
            betweenness_scores = nx.betweenness_centrality(G)

            # Combine scores
            influencer_ids = [k for k in pagerank_scores.keys() if k in betweenness_scores]
            
            results = []
            for inf_id in influencer_ids:
                pr = pagerank_scores[inf_id]
                bw = betweenness_scores[inf_id]
                # Combined score (70% PageRank, 30% Betweenness) - matches legacy
                total = pr * 0.7 + bw * 0.3
                
                results.append({
                    'influencer_id': inf_id,
                    'pagerank_score': pr,
                    'betweenness_score': bw,
                    'total_score': int(total * 10000) # scale up for visibility
                })

            results_df = pd.DataFrame(results)
            
            # Merge with existing profiles if available to keep names
            if self.influencers_file.exists():
                inf_profiles = pd.read_csv(self.influencers_file)
                if 'name' in inf_profiles.columns:
                    results_df = results_df.merge(inf_profiles[['influencer_id', 'name']], on='influencer_id', how='left')

            results_df['updated_at'] = pd.Timestamp.now().isoformat()
            
            # Save to influencer_scores.csv
            results_df.to_csv(self.scores_file, index=False)
            log_info(f"✅ Updated {len(results_df)} influencer scores in {self.scores_file}")
            
            return results_df.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error recalculating influencer scores: {e}")
            return None
