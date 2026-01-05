import pandas as pd
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from server_fastapi.app.utils.logger import log_info, log_error

class DonorInterestService:
    # Influencer-focused interests + categories
    FOCUS_INTERESTS = {
        'Music': 'Lifestyle',
        'Running': 'Fitness',
        'Cycling': 'Fitness',
        'Yoga': 'Wellness',
        'Meditation': 'Wellness',
        'Keto Diet': 'Nutrition',
        'Vegan Diet': 'Nutrition',
        'Minimalism': 'Lifestyle',
        'Digital Detox': 'Lifestyle',
        "Strength Training": "Fitness",
    }

    ADDITIONAL_INTERESTS = {
        "Gardening": "Hobbies",
        "Meal Prep": "Nutrition",
        "Reading": "Leisure",
        "Volunteering": "Community",
        "Cooking": "Leisure"
    }

    def __init__(self, donors_file: str = None):
        if donors_file is None:
            self.donors_file = Path(__file__).resolve().parent.parent.parent / 'data' / 'donor_vectors_clustered.csv'
        else:
            self.donors_file = Path(donors_file)
        
        self.interest_pool = list(self.FOCUS_INTERESTS.items()) + list(self.ADDITIONAL_INTERESTS.items())
        random.seed(42)

    def generate_interests(self, num_per_donor=(2, 3)):
        """
        Assigns random interests to donors from the pool.
        """
        if not self.donors_file.exists():
            log_error(f"Donors file not found at {self.donors_file}")
            return []

        try:
            df_donors = pd.read_csv(self.donors_file)
            df_donors.columns = df_donors.columns.str.strip().str.lower()
            
            if "donor_id" not in df_donors.columns:
                log_error("donor_id column missing from data")
                return []

            donor_ids = df_donors["donor_id"].dropna().unique().tolist()
            records = []
            seen_pairs = set()

            for donor_id in donor_ids:
                num_interests = random.randint(*num_per_donor)
                sampled_pairs = random.sample(self.interest_pool, min(num_interests, len(self.interest_pool)))
                
                for interest_name, category in sampled_pairs:
                    key_check = (donor_id, interest_name.lower())
                    if key_check not in seen_pairs:
                        records.append({
                            "id": f"gen_{uuid.uuid4()}",
                            "donor_id": donor_id,
                            "interest_category": category,
                            "interest_name": interest_name,
                        })
                        seen_pairs.add(key_check)

            log_info(f"Generated {len(records)} interests for {len(donor_ids)} donors.")
            return records
        except Exception as e:
            log_error(f"Error generating interests: {e}")
            return []

    def save_interests(self, records, output_file: str = None):
        if not records:
            return
        
        if output_file is None:
            output_file = Path(__file__).resolve().parent.parent.parent / 'data' / 'donor_interests.csv'
        else:
            output_file = Path(output_file)
            
        df_out = pd.DataFrame(records)
        df_out.to_csv(output_file, index=False)
        log_info(f"Saved interests to {output_file}")

    def generate_interest_referrals(self):
        """
        Creates synthetic referral links between influencers and donors based on shared interests.
        Matches legacy generate_interest_based_influencers_v2.py logic.
        """
        try:
            log_info("Starting interest-based referral generation...")
            
            interests_file = self.donors_file.parent / 'donor_interests.csv'
            influencers_file = self.donors_file.parent / 'influencer_profiles.csv'
            
            if not interests_file.exists() or not influencers_file.exists():
                log_error("Missing interests or influencer profiles for referral generation.")
                return None

            df_interests = pd.read_csv(interests_file)
            df_influencers = pd.read_csv(influencers_file)
            
            referral_records = []
            
            for _, inf in df_influencers.iterrows():
                inf_id = inf['influencer_id']
                # If influencer has specific interests listed, match them
                # For demo, we'll assume influencers have 'primary_interest' column
                inf_interest = inf.get('primary_interest', random.choice(list(self.FOCUS_INTERESTS.keys())))
                
                # Find donors with matching interest
                matching_donors = df_interests[
                    (df_interests['interest_name'].str.lower() == inf_interest.lower()) |
                    (df_interests['interest_category'].str.lower() == inf_interest.lower())
                ]['donor_id'].unique().tolist()
                
                # Pick a random subset to "refer"
                num_to_refer = random.randint(5, 15)
                referred_donors = random.sample(matching_donors, min(num_to_refer, len(matching_donors)))
                
                for donor_id in referred_donors:
                    referral_records.append({
                        "referral_id": str(uuid.uuid4()),
                        "referrer_donor_id": inf_id, # Influencer acts as referrer
                        "referred_donor_id": donor_id,
                        "referral_date": (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat(),
                        "interest_category": self.FOCUS_INTERESTS.get(inf_interest, "General"),
                        "interest_name": inf_interest
                    })

            df_referrals = pd.DataFrame(referral_records)
            output_file = self.donors_file.parent / 'interest_based_referrals.csv'
            df_referrals.to_csv(output_file, index=False)
            
            log_info(f"✅ Generated {len(referral_records)} interest-based referrals in {output_file}")
            return referral_records

        except Exception as e:
            log_error(f"Error generating interest referrals: {e}")
            return None