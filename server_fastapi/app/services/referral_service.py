import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from server_fastapi.app.utils.logger import log_info, log_error

class ReferralService:
    def __init__(self):
        self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        self.referrals_file = self.data_dir / "referrals_full.csv"
        self.campaigns_file = self.data_dir / "campaign_engagements.csv"
        self.donors_file = self.data_dir / "donors_rows.csv"

    def get_referral_stats(self) -> Dict[str, Any]:
        """
        Returns high-level statistics for the referral system.
        """
        if not self.referrals_file.exists():
            return {"total_referrals": 0, "top_referrers": []}

        try:
            df = pd.read_csv(self.referrals_file)
            
            total_referrals = len(df)
            
            # Identify top referrers
            top_referrers = df['referrer_donor_id'].value_counts().head(10).reset_index()
            top_referrers.columns = ['donor_id', 'referral_count']
            
            # Join with donor names
            if self.donors_file.exists():
                donors_df = pd.read_csv(self.donors_file)
                top_referrers = top_referrers.merge(
                    donors_df[['donor_id', 'first_name', 'last_name']], 
                    on='donor_id', 
                    how='left'
                )
                top_referrers['name'] = top_referrers['first_name'].fillna('') + ' ' + top_referrers['last_name'].fillna('')
            
            return {
                "total_referrals": total_referrals,
                "top_referrers": top_referrers.where(pd.notnull(top_referrers), None).to_dict(orient='records')
            }
        except Exception as e:
            log_error(f"Error fetching referral stats: {e}")
            return {"total_referrals": 0, "top_referrers": []}

    def get_campaign_referral_impact(self) -> List[Dict[str, Any]]:
        """
        Calculates how many campaign conversions were driven by referred donors.
        """
        if not self.referrals_file.exists() or not self.campaigns_file.exists():
            return []

        try:
            ref_df = pd.read_csv(self.referrals_file)
            camp_df = pd.read_csv(self.campaigns_file)
            
            # Only consider successful campaign conversions
            conversions = camp_df[camp_df['converted'] == True]
            
            # Mark donors who were referred
            referred_donor_ids = set(ref_df['referred_donor_id'].unique())
            
            # Link conversions to referral status
            conversions['is_referred'] = conversions['donor_id'].isin(referred_donor_ids)
            
            # Group by campaign to see impact
            impact = conversions.groupby('campaign_name').agg(
                total_conversions=('converted', 'count'),
                referral_conversions=('is_referred', 'sum')
            ).reset_index()
            
            impact['referral_impact_pct'] = (impact['referral_conversions'] / impact['total_conversions'] * 100).round(2)
            
            return impact.where(pd.notnull(impact), None).to_dict(orient='records')
        except Exception as e:
            log_error(f"Error calculating campaign referral impact: {e}")
            return []

