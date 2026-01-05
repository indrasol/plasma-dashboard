import pandas as pd
import numpy as np
import random
import string
from datetime import datetime
import os

# === Configuration === #
INTEREST_CATEGORIES = {
    "Wellness": ["Yoga", "Meditation", "Mindfulness"],
    "Fitness": ["Running", "Strength Training", "Cycling"],
    "Nutrition": ["Vegan Diet", "Keto Diet", "Meal Prep"],
    "Lifestyle": ["Sustainable Living", "Minimalism", "Digital Detox"]
}

NUM_INFLUENCERS = 20

np.random.seed(42)

# === Helper: Generate Random ID String === #
def generate_random_id(length=10):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# === Load Donors CSV === #
donors_path = 'donors_rows.csv'  # Adjust if needed
df_donors = pd.read_csv(donors_path)

# Pick influencers randomly (or use logic to filter real ones)
df_influencers = df_donors.sample(n=NUM_INFLUENCERS).reset_index(drop=True)

interest_records = []

for _, row in df_influencers.iterrows():
    donor_id = row['donor_id']
    
    # Select 1–3 interests per influencer
    num_interests = np.random.randint(1, 4)
    
    chosen_categories = list(np.random.choice(list(INTEREST_CATEGORIES.keys()), size=num_interests, replace=False))
    
    for category in chosen_categories:
        name_options = INTEREST_CATEGORIES[category]
        interest_name = np.random.choice(name_options)

        record = {
            "id": generate_random_id(),          # Random text ID (not UUID)
            "donor_id": donor_id,
            "interest_category": category,
            "interest_name": interest_name       # Specific interest label
        }
        interest_records.append(record)

# Convert to DataFrame and save to CSV
output_file = os.path.join(os.getcwd(), 'formatted_donor_interests.csv')
pd.DataFrame(interest_records).to_csv(output_file, index=False)

print(f"\n✅ Generated {len(interest_records)} interest records.")
print(f"📁 File saved at:\n→ {output_file}")