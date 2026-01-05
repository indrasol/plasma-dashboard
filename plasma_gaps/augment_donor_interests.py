import pandas as pd
import random

# Load donor list & existing interests
donors_df = pd.read_csv("donors.csv")
interests_df = pd.read_csv("formatted_donor_interests.csv")

new_rows = []

CATEGORIES_TO_INJECT = {
    "Music": "Lifestyle",
    "Running": "Fitness",
    "Strength Training": "Fitness",
    "Cycling": "Fitness",
    "Keto Diet": "Nutrition",
    "Vegan Diet": "Nutrition",
    "Minimalism": "Lifestyle",
    "Digital Detox": "Lifestyle"
}

# Pick ~20 new donor_ids per category and inject interests
for interest, category in CATEGORIES_TO_INJECT.items():
    
    candidate_ids = donors_df["donor_id"].dropna().sample(n=25, random_state=random.randint(0,10000)).tolist()

    for donor_id in candidate_ids:
        new_rows.append({
            'id': f'inj_{random.randint(100000,999999)}',
            'donor_id': donor_id,
            'interest_category': category,
            'interest_name': interest,
        })

augmented_df = pd.concat([interests_df, pd.DataFrame(new_rows)], ignore_index=True)

augmented_file = 'formatted_donor_interests_augmented.csv'
augmented_df.to_csv(augmented_file, index=False)

print(f"✅ Injected {len(new_rows)} synthetic donor_interest records.")
print(f"📁 Saved augmented file → {augmented_file}")