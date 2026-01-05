import pandas as pd
import numpy as np
from pathlib import Path
from server_fastapi.app.utils.logger import log_info, log_error

class VectorizationService:
    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        else:
            self.data_dir = data_dir
        
        # Source files
        self.donors_file = self.data_dir / 'donors_rows.csv'
        self.donations_file = self.data_dir / 'donation_history.csv'
        self.campaigns_file = self.data_dir / 'campaign_engagements.csv'
        self.screenings_file = self.data_dir / 'health_screenings.csv'
        
        # Output file
        self.output_file = self.data_dir / 'donor_vectors.csv'

    def run_vectorization(self):
        """
        Aggregates raw tables into a single donor vector file.
        Matches legacy plasma_gaps/vectorize_donors.py logic.
        """
        try:
            log_info("Starting donor vectorization process...")
            
            if not all(f.exists() for f in [self.donors_file, self.donations_file, self.campaigns_file, self.screenings_file]):
                missing = [f.name for f in [self.donors_file, self.donations_file, self.campaigns_file, self.screenings_file] if not f.exists()]
                log_error(f"Missing source files for vectorization: {missing}")
                return None

            # Load source tables
            donors = pd.read_csv(self.donors_file)
            donations = pd.read_csv(self.donations_file)
            engagements = pd.read_csv(self.campaigns_file)
            screenings = pd.read_csv(self.screenings_file)

            log_info(f"Loaded {len(donors)} donors, {len(donations)} donations, {len(engagements)} engagements, {len(screenings)} screenings.")

            # Feature Engineering: Donations
            # Use 'quantity_ml' for volume
            donation_sum = donations.groupby('donor_id')['quantity_ml'].sum().reset_index(name='total_donated')
            donation_counts = donations.groupby('donor_id').size().reset_index(name='donation_count')
            
            avg_donation_df = donation_sum.merge(donation_counts, on='donor_id')
            avg_donation_df['avg_donation_size'] = avg_donation_df['total_donated'] / avg_donation_df['donation_count']

            # Feature Engineering: Campaigns
            campaign_counts = engagements.groupby('donor_id').size().reset_index(name='campaign_count')

            # Feature Engineering: Health Screenings
            screening_counts = screenings.groupby('donor_id').size().reset_index(name='health_screening_count')

            # Merge all into donor base table
            # We keep 'first_name', 'last_name' and combine them into 'name' like legacy
            vectors_df = donors[['donor_id', 'first_name', 'last_name']].copy()
            vectors_df['name'] = (vectors_df['first_name'].fillna('') + " " + vectors_df['last_name'].fillna('')).str.strip()
            vectors_df.drop(columns=['first_name', 'last_name'], inplace=True)

            # Join all metrics
            vectors_df = vectors_df.merge(donation_sum, on='donor_id', how='left') \
                                   .merge(avg_donation_df[['donor_id', 'avg_donation_size']], on='donor_id', how='left') \
                                   .merge(donation_counts, on='donor_id', how='left') \
                                   .merge(campaign_counts, on='donor_id', how='left') \
                                   .merge(screening_counts, on='donor_id', how='left')

            # Fill missing activity with zeros
            fill_values = {
                'total_donated': 0,
                'avg_donation_size': 0,
                'donation_count': 0,
                'campaign_count': 0,
                'health_screening_count': 0
            }
            vectors_df.fillna(fill_values, inplace=True)

            # Ensure JSON safety (replace inf/nan)
            vectors_df = vectors_df.replace([np.inf, -np.inf], np.nan).fillna(0)

            # Save cleaned file
            vectors_df.to_csv(self.output_file, index=False)
            log_info(f"✅ Donor vector file created/updated -> {self.output_file}")
            
            return vectors_df

        except Exception as e:
            log_error(f"Error during vectorization: {e}")
            import traceback
            log_error(traceback.format_exc())
            return None

if __name__ == "__main__":
    service = VectorizationService()
    service.run_vectorization()

