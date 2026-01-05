import pandas as pd
import random
import uuid

DONORS_FILE = "donors.csv"
INTERESTS_FILE = "formatted_donor_interests_clustered.csv"
OUTPUT_FILE = "formatted_donor_interests_boosted.csv"

MIN_DONORS_PER_INTEREST = 120   # desired minimum count per focus interest

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

random.seed(42)

# Load data files
df_donors = pd.read_csv(DONORS_FILE)
df_interests = pd.read_csv(INTERESTS_FILE)

df_donors.columns     = df_donors.columns.str.strip().str.lower()
df_interests.columns  = df_interests.columns.str.strip().str.lower()

all_donor_ids         = set(df_donors["donor_id"].dropna())
existing_links        = set(zip(df_interests['donor_id'], df_interests['interest_name'].str.lower()))

records_to_add        = []

for interest_name, category in FOCUS_INTERESTS.items():
    
    current_count_df   \
        =(df_interests[
            df_interests['interest_name'].str.lower() == interest_name.lower()
        ])
    
    current_count       \
        =(len(current_count_df))

    needed              \
        =(max(0, MIN_DONORS_PER_INTEREST - current_count))
    
    print(f"{interest_name}: {current_count} → Need {needed}")
    
    if needed > 0:
        shuffled_pool = list(all_donor_ids)
        random.shuffle(shuffled_pool)

        added_count = 0
        
        for donor_id in shuffled_pool:
            key_check = (donor_id, interest_name.lower())
            if key_check not in existing_links:
                records_to_add.append({
                    "id": f"boost_{uuid.uuid4()}",
                    "donor_id": donor_id,
                    "interest_category": category,
                    "interest_name": interest_name,
                })
                existing_links.add(key_check)
                added_count +=1
                
            if added_count >= needed:
                break

# Merge and save final output CSV
df_augmented = pd.concat([df_interests, pd.DataFrame(records_to_add)], ignore_index=True)
print(f"\n✅ Added {len(records_to_add)} new entries across all focus interests.")
print(f"📁 Final record count: {len(df_augmented)}")

df_augmented.to_csv(OUTPUT_FILE, index=False)
print(f"📁 Output saved → {OUTPUT_FILE}")