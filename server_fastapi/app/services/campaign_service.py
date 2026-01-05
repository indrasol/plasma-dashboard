import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from sklearn.ensemble import RandomForestClassifier
from server_fastapi.app.utils.logger import log_info, log_error

class CampaignService:
    def __init__(self):
        self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        self.campaigns_file = self.data_dir / "campaign_engagements.csv"
        self.donors_file = self.data_dir / "donors_rows.csv"
        self.vectors_file = self.data_dir / "donor_vectors_clustered.csv"

    def get_campaign_details(self) -> List[Dict[str, Any]]:
        """
        Returns detailed campaign engagement records joined with donor info.
        Matches the schema expected by CampaignConversionDashboard.tsx
        """
        if not self.campaigns_file.exists() or not self.donors_file.exists():
            log_error("Campaign or Donor data files not found.")
            return []

        try:
            campaigns_df = pd.read_csv(self.campaigns_file)
            donors_df = pd.read_csv(self.donors_file)
            
            # Merge with donor info
            merged_df = campaigns_df.merge(
                donors_df[['donor_id', 'first_name', 'last_name', 'email']], 
                on='donor_id', 
                how='left'
            )
            
            # Add full_name
            merged_df['full_name'] = merged_df['first_name'].fillna('') + ' ' + merged_df['last_name'].fillna('')
            
            # Add dummy/calculated fields for UI compatibility if missing
            # In a real app, these would come from the donor vectors or elasticity logic
            if self.vectors_file.exists():
                vectors_df = pd.read_csv(self.vectors_file)
                # Assume cluster 0/1 might map to elasticity for now as a placeholder
                # or just use a placeholder string
                merged_df = merged_df.merge(
                    vectors_df[['donor_id', 'cluster_label']], 
                    on='donor_id', 
                    how='left'
                )
                merged_df['elasticity_segment'] = merged_df['cluster_label'].apply(
                    lambda x: 'elastic' if x == 0 else 'inelastic'
                )
            else:
                merged_df['elasticity_segment'] = 'unknown'

            # Fill other missing fields with defaults
            merged_df['donation_type'] = 'Plasma'
            merged_df['days_since_last_donation'] = 30 # placeholder
            
            # Sort by timestamp desc
            if 'engagement_timestamp' in merged_df.columns:
                merged_df = merged_df.sort_values('engagement_timestamp', ascending=False)

            # Handle NaN values for JSON compliance
            merged_df = merged_df.replace([np.inf, -np.inf], np.nan)
            merged_df = merged_df.astype(object).where(pd.notnull(merged_df), None)

            return merged_df.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error fetching campaign details: {e}")
            return []

    def predict_conversion_probability(self, campaign_name: str) -> List[Dict[str, Any]]:
        """
        Uses a Random Forest model to predict donor conversion probability for a campaign.
        Matches AI-driven behavioral patterns.
        """
        try:
            log_info(f"Predicting conversion for campaign: {campaign_name}")
            vectors_file = self.data_dir / 'donor_vectors_clustered.csv'
            if not vectors_file.exists():
                return []

            df = pd.read_csv(vectors_file)
            features = ['donation_count', 'avg_donation_size', 'campaign_count', 'health_screening_count']
            
            # Simple synthetic training: high frequency + high volume = high conversion
            # In a real app, you'd train on historic campaign_engagements.csv
            X = df[features].fillna(0)
            
            # Train a quick model on 'dummy' historical truth if not available
            # Let's say history is: donors with > 5 donations usually convert
            dummy_y = (X['donation_count'] > 5).astype(int)
            
            model = RandomForestClassifier(n_estimators=50, max_depth=3, random_state=42)
            model.fit(X, dummy_y)
            
            # Predict probabilities
            probs = model.predict_proba(X)[:, 1]
            
            df['conversion_probability'] = probs
            df['campaign_name'] = campaign_name
            
            # Sort by top potential donors
            top_potentials = df.sort_values('conversion_probability', ascending=False).head(100)
            
            return top_potentials[['donor_id', 'name', 'conversion_probability', 'campaign_name']].to_dict(orient='records')

        except Exception as e:
            log_error(f"Error predicting campaign conversion: {e}")
            return []

    def get_campaign_summary(self) -> List[Dict[str, Any]]:
        """
        Returns a summary of campaign performance.
        Matches the schema expected by get_campaign_conversion_summary RPC.
        """
        if not self.campaigns_file.exists():
            log_error("Campaign data file not found.")
            return []

        try:
            df = pd.read_csv(self.campaigns_file)
            
            summary = df.groupby('campaign_name').agg(
                total_engaged=('engagement_id', 'count'),
                total_converted=('converted', 'sum')
            ).reset_index()
            
            summary['conversion_rate'] = (summary['total_converted'] / summary['total_engaged'] * 100).round(2)
            
            # Sort by total engaged to show most active campaigns
            summary = summary.sort_values('total_engaged', ascending=False)
            
            # Handle NaN values for JSON compliance
            summary = summary.replace([np.inf, -np.inf], np.nan)
            summary = summary.astype(object).where(pd.notnull(summary), None)
            
            return summary.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error fetching campaign summary: {e}")
            return []

