import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
import random

# === Load Donors === #
donors_df = pd.read_csv("donors_rows.csv")
donor_ids = donors_df["donor_id"].dropna().unique().tolist()

# === Config === #
NUM_REFERRALS = 75   # Increase or decrease depending on how dense you want the graph

source_types = ["link", "event", "manual"]
np.random.seed(42)

referrals_output = []

for _ in range(NUM_REFERRALS):
    referrer = np.random.choice(donor_ids)
    referred = np.random.choice(donor_ids)

    # Avoid self-referral and duplicates (can add more logic if needed)
    while referred == referrer:
        referred = np.random.choice(donor_ids)

    record = {
        "referral_id": str(uuid.uuid4()),
        "referrer_donor_id": referrer,
        "referred_donor_id": referred,
        "referral_date": (datetime.utcnow() - timedelta(days=np.random.randint(0, 365))).isoformat(),
        "source_type": random.choice(source_types)
    }
    referrals_output.append(record)

# Output to CSV (matching Supabase schema)
output_file = "generated_referrals.csv"
pd.DataFrame(referrals_output).to_csv(output_file, index=False)

print(f"\n✅ Created {len(referrals_output)} fake referral records.")
print(f"📁 File saved at:\n→ {output_file}")