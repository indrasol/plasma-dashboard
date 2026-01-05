import pandas as pd
import uuid
import random
from datetime import datetime, timedelta

# === Load influencer profiles === #
df_influencers = pd.read_csv("influencer_profiles.csv")
influencer_ids = df_influencers["donor_id"].tolist()

# === Site IDs List === #
site_ids = [
    'ABO001', 'ABO002', 'ABO003', 'ABO004', 'BP001',
    'BP002', 'BP003', 'BP004', 'BP005'
]

donation_types = ['Plasma', 'Whole Blood', 'Platelet']
deferral_reasons = ['Low Hb', 'High BP', 'Illness']

records = []

for donor_id in influencer_ids:
    
    num_donations = random.choice([1, 2, 3])  # keep it low
    
    site_id = random.choice(site_ids)
    
    for _ in range(num_donations):
        
        donation_type = random.choice(donation_types)

        # Very low volumes based on type
        if donation_type == "Plasma":
            quantity_ml = random.randint(400, 500)
        elif donation_type == "Whole Blood":
            quantity_ml = random.randint(250, 350)
        else:  # Platelet
            quantity_ml = random.randint(150, 200)

        eligible = random.choices([True, False], weights=[0.9, 0.1])[0]
        deferral_code = "" if eligible else random.choice(deferral_reasons)

        record = {
            "donation_id": str(uuid.uuid4()),
            "donor_id": donor_id,
            "date_of_donation": (
                datetime.now() - timedelta(days=random.randint(30, 1200))
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "location_id": site_id,
            "donation_type": donation_type,
            "quantity_ml": quantity_ml,
            "eligibility_status": eligible,
            "deferral_reason_code": deferral_code,
        }

        records.append(record)

# Export to CSV matching Supabase structure
df_out = pd.DataFrame(records)
df_out.to_csv("influencer_donations.csv", index=False)

print(f"✅ Generated {len(df_out)} low-volume donations for {len(influencer_ids)} influencers.")
print("📁 File saved: influencer_donations.csv")