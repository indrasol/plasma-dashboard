import pandas as pd
import random
import uuid

# === Configuration === #
DONORS_FILE = "donors.csv"
OUTPUT_FILE = "formatted_donor_interests_clustered.csv"

NUM_INTERESTS_PER_DONOR = (2, 3)  # each donor gets between 2 to 3 interests

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

# Optional filler/extra interests to provide variety
ADDITIONAL_INTERESTS = {
    "Gardening": "Hobbies",
    "Meal Prep": "Nutrition",
    "Reading": "Leisure",
    "Volunteering": "Community",
    "Cooking": "Leisure"
}

random.seed(42)

# === Load Donors === #
df_donors = pd.read_csv(DONORS_FILE)
df_donors.columns = df_donors.columns.str.strip().str.lower()
donor_ids = df_donors["donor_id"].dropna().unique().tolist()

# Create full interest pool with category mapping
all_interest_pool = list(FOCUS_INTERESTS.items()) + list(ADDITIONAL_INTERESTS.items())

records = []
seen_pairs = set()   # to avoid duplicates: (donor_id, interest_name)

for donor_id in donor_ids:
    
    num_interests = random.randint(*NUM_INTERESTS_PER_DONOR)
    
    sampled_pairs = random.sample(all_interest_pool, num_interests)
    
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

print(f"\n✅ Created {len(records)} total donor-interest records across {len(donor_ids)} donors.")

# === Save CSV Output === #
df_out = pd.DataFrame(records)
df_out.to_csv(OUTPUT_FILE, index=False)

print(f"📁 Saved output → {OUTPUT_FILE}")