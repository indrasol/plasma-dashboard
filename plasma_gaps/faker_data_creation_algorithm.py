import pandas as pd
import numpy as np
import uuid
from faker import Faker
import random

fake = Faker()

# Counts
num_donors = 2000
num_donations = 18000
num_referrals = 500
num_screenings = 800
num_engagements = 1500

# Site IDs (Company codes ABO, BP)
site_ids = [
    "ABO001", "ABO002", "ABO003", "ABO004", "ABO005", "ABO006",
    "BP001", "BP002", "BP003", "BP004", "BP005", "BP006",
    "BP007", "BP008", "BP009", "BP010", "BP011", "BP012"
]

# Separate site lists by company prefix
abo_sites = [site for site in site_ids if site.startswith('ABO')]
bp_sites = [site for site in site_ids if site.startswith('BP')]

# Generate donor UUIDs
donor_ids = [str(uuid.uuid4()) for _ in range(num_donors)]

# Assign one location per donor limited to one company only (ABO or BP)
donor_location_map = {}
for donor in donor_ids:
    company_choice = random.choice(['ABO', 'BP'])
    if company_choice == 'ABO':
        donor_location_map[donor] = random.choice(abo_sites)
    else:
        donor_location_map[donor] = random.choice(bp_sites)

# Donors table
donor_data = {
    'donor_id': donor_ids,
    'first_name': [fake.first_name() for _ in range(num_donors)],
    'last_name':  [fake.last_name() for _ in range(num_donors)],
    'date_of_birth': [fake.date_of_birth(minimum_age=18, maximum_age=80).isoformat() for _ in range(num_donors)],
}

# Donation history table (full fields including added columns)
donation_types = ['plasma', 'whole blood', 'platelets']
eligibility_statuses = ['eligible', 'deferred', 'pending']

donation_donor_ids = np.random.choice(donor_ids, num_donations)

donation_data = {
    'donation_id': [str(uuid.uuid4()) for _ in range(num_donations)],
    'donor_id': donation_donor_ids,
    'donation_date': [fake.date_between(start_date='-3y', end_date='today').isoformat() for _ in range(num_donations)],
    'quantity_ml': [random.randint(25, 930) for _ in range(num_donations)],
    # Use mapped site for each donor, ensuring 1 location per company per donor
    'location_id': [donor_location_map[donor] for donor in donation_donor_ids],
    'donation_type': np.random.choice(donation_types, num_donations),
    'eligibility_status': np.random.choice(eligibility_statuses, num_donations),
}

# Referrals table
# Referrals table
source_types = ['link', 'event', 'manual']
referral_ids = [str(uuid.uuid4()) for _ in range(num_referrals)]
referrer_donor_ids = np.random.choice(donor_ids, num_referrals)
# Ensure referred donor is not the same as referrer
referred_donor_ids = [
    random.choice([d for d in donor_ids if d != referrer_donor_ids[i]])
    for i in range(num_referrals)
]
referral_data = {
    'referral_id': referral_ids,
    'referrer_donor_id': referrer_donor_ids,
    'referred_donor_id': referred_donor_ids,
    'referral_date': [fake.date_between(start_date='-2y', end_date='today').isoformat() for _ in range(num_referrals)],
    'source_type': np.random.choice(source_types, num_referrals)
}
referrals_df = pd.DataFrame(referral_data)
referrals_df.to_csv('referrals_rows.csv', index=False)



# Health screenings table
screening_ids = [str(uuid.uuid4()) for _ in range(num_screenings)]
screening_data = {
    'screening_id': screening_ids,
    'donor_id': np.random.choice(donor_ids, num_screenings),
    'screening_date': [fake.date_between(start_date='-1y', end_date='today').isoformat() for _ in range(num_screenings)],
    'hemoglobin': [round(random.uniform(12, 18), 1) for _ in range(num_screenings)],
    'blood_pressure_systolic': [random.randint(90, 140) for _ in range(num_screenings)],
    'blood_pressure_diastolic': [random.randint(60, 90) for _ in range(num_screenings)],
}

# Campaign engagement table (correct fields for Supabase schema)
channels = ['SMS', 'Email', 'Social']
num_campaigns = 10

engagement_ids = [str(uuid.uuid4()) for _ in range(num_engagements)]
engagement_data = {
    'engagement_id': engagement_ids,
    'donor_id': np.random.choice(donor_ids, num_engagements),
    'campaign_name': np.random.choice([f'Campaign {i}' for i in range(1, num_campaigns + 1)], num_engagements),
    'channel': np.random.choice(channels, num_engagements),
    'clicked': np.random.choice([True, False], num_engagements),
    'converted': np.random.choice([True, False], num_engagements),
    'engagement_timestamp': [fake.date_time_between(start_date='-3y', end_date='now').isoformat() for _ in range(num_engagements)]
}

engagements_df = pd.DataFrame(engagement_data)
engagements_df.to_csv('campaign_engagement_rows.csv', index=False)


# Convert to DataFrames
donors_df = pd.DataFrame(donor_data)
donations_df = pd.DataFrame(donation_data)
referrals_df = pd.DataFrame(referral_data)
screenings_df = pd.DataFrame(screening_data)
engagements_df = pd.DataFrame(engagement_data)

# Save CSV files
donors_df.to_csv('donors_rows.csv', index=False)
donations_df.to_csv('donation_history_rows.csv', index=False)
referrals_df.to_csv('referrals_rows.csv', index=False)
screenings_df.to_csv('health_screenings_rows.csv', index=False)
engagements_df.to_csv('campaign_engagement_rows.csv', index=False)

print("All CSV files generated with correct donor-location logic.")
