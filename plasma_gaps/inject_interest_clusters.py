import pandas as pd
import random
import uuid

# === Config === #
DONORS_FILE = "donors.csv"
INTERESTS_FILE = "formatted_donor_interests_augmented.csv"
OUTPUT_FILE = "formatted_donor_interests_augmented.csv"

INTEREST_CLUSTERS = {
    "Music": "Lifestyle",
    "Running": "Fitness",
    "Strength Training": "Fitness",
    "Cycling": "Fitness",
    "Keto Diet": "Nutrition",
    "Vegan Diet": "Nutrition",
    "Minimalism": "Lifestyle",
    "Digital Detox": "Lifestyle",
    "Yoga": "Wellness",
    "Meditation": "Wellness"
}

NUM_DONORS_PER_INTEREST = 100
RANDOM_SEED = 42

# === Load Data === #
df_donors = pd.read_csv(DONORS_FILE)
df_interests = pd.read_csv(INTERESTS_FILE)

df_donors.columns     = df_donors.columns.str.strip().str.lower()
df_interests.columns  = df_interests.columns.str.strip().str.lower()

existing_links = set(zip(df_interests['donor_id'], df_interests['interest_name'].str.lower()))

available_donors = set(df_donors["donor_id"].dropna())

random.seed(RANDOM_SEED)

new_rows = []

for interest, category in INTEREST_CLUSTERS.items():
    
    eligible_pool = list(available_donors.copy())
    random.shuffle(eligible_pool)

    injected_count = 0
    
    for donor_id in eligible_pool:
        key_check = (donor_id, interest.lower())
        if key_check not in existing_links:
            new_rows.append({
                'id': f'inj_{uuid.uuid4()}',
                'donor_id': donor_id,
                'interest_category': category,
                'interest_name': interest,
            })
            injected_count += 1
            existing_links.add(key_check)

        if injected_count >= NUM_DONORS_PER_INTEREST:
            break

print(f"\n✅ Injected {len(new_rows)} synthetic rows across {len(INTEREST_CLUSTERS)} interests.")

# Save merged file
augmented_df = pd.concat([df_interests, pd.DataFrame(new_rows)], ignore_index=True)
augmented_df.to_csv(OUTPUT_FILE, index=False)

print(f"📁 Output saved → {OUTPUT_FILE}")