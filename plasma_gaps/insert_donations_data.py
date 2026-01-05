import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta

# Load donors with UUIDs
donors = pd.read_csv('donors_rows.csv')
donor_ids = donors['donor_id'].tolist()

np.random.seed(42)  # for reproducibility

# List of Site IDs
site_ids = [
    'ABO001', 'ABO002', 'ABO003', 'ABO004', 'ABO005', 'ABO006',
    'BP001', 'BP002', 'BP003', 'BP004', 'BP005', 'BP006',
    'BP007', 'BP008', 'BP009', 'BP010', 'BP011', 'BP012'
]

num_donors = len(donor_ids)

# Assign exactly one Site_Id per donor (fixed for all donations)
assigned_sites = np.random.choice(site_ids, size=num_donors, replace=True)

# Donation count distribution
few_ratio = 0.05  # 5% with 2-3 donations
many_ratio = 0.60  # 60% with 20-35 donations
rest_ratio = 0.35  # 35% with 15-20 donations

num_few = int(num_donors * few_ratio)
num_many = int(num_donors * many_ratio)
num_rest = num_donors - num_few - num_many

donations_per_donor = []
donations_per_donor.extend(np.random.randint(2, 4, num_few))      # 2-3 donations
donations_per_donor.extend(np.random.randint(20, 36, num_many))   # 20-35 donations
donations_per_donor.extend(np.random.randint(15, 21, num_rest))   # 15-20 donations
np.random.shuffle(donations_per_donor)

donation_types = ['Plasma', 'Whole Blood', 'Platelet']

records = []

# Generate donations
for donor_id, site_id, num_dons in zip(donor_ids, assigned_sites, donations_per_donor):
    for _ in range(num_dons):
        donation_id = str(uuid.uuid4())
        days_ago = np.random.randint(0, 6*365)  # within last 6 years
        date_of_donation = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        donation_type = np.random.choice(donation_types)
        if donation_type == 'Plasma':
            quantity_ml = np.random.randint(600, 800)
        elif donation_type == 'Whole Blood':
            quantity_ml = np.random.randint(400, 550)
        else:  # Platelet
            quantity_ml = np.random.randint(200, 300)

        eligibility_status = np.random.choice([True, False], p=[0.95, 0.05])
        deferral_reason_code = '' if eligibility_status else np.random.choice(['Low Hb', 'High BP', 'Illness', 'Medications'])

        records.append({
            'donation_id': donation_id,
            'donor_id': donor_id,
            'date_of_donation': date_of_donation,
            'site_id': site_id,
            'donation_type': donation_type,
            'quantity_ml': quantity_ml,
            'eligibility_status': eligibility_status,
            'deferral_reason_code': deferral_reason_code
        })

df_donations = pd.DataFrame(records)
df_donations.to_csv('donation_history_rows_generated.csv', index=False)
print(f"Generated {len(df_donations)} donation history records with one site per donor.")
