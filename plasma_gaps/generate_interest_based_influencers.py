import pandas as pd
import uuid
import random
from datetime import datetime, timedelta

# === CONFIGURATION === #

INFLUENCERS = [
    {"name": "Pastor Michael",     "interest": "Wellness",           "target": 45},
    {"name": "Coach Tanya",        "interest": "Running",            "target": 38},
    {"name": "DJ Karma",           "interest": "Music",              "target": 42},
    {"name": "Nurse Olivia",       "interest": "Mindfulness",        "target": 36},
    {"name": "Yogi Priya",         "interest": "Yoga",               "target": 40},
    {"name": "Chef Antonio",       "interest": "Meal Prep",          "target": 30},
    {"name": "Dr. Samir Shah",     'interest': 'Keto Diet',          'target': 35},
    {'name': 'Sister Grace',       'interest': 'Meditation',         'target': 32},
    {'name': 'Trainer Jason',      'interest': 'Strength Training',  'target': 34},
    {'name': 'Nutritionist Nina',  'interest': 'Vegan Diet',         'target': 31},
    {'name': 'Counselor Karen',    'interest': 'Digital Detox',      'target': 28},
    {'name': 'Minister Lee',       'interest': 'Minimalism',         'target':33},
    {'name':'Coach Marcus',        'interest':'Cycling',             'target':29},
    {'name':'Priest Emmanuel',     'interest':'Minimalism',          'target':26},
    {'name':'Health Advocate Ana','interest':'Wellness',             'target':39}
]

DONORS_FILE = "./donors.csv"
INTERESTS_FILE = "./formatted_donor_interests_boosted.csv"

OUTPUT_INFLUENCERS_CSV = "./influencer_profiles.csv"
OUTPUT_REFERRALS_CSV   = "./interest_based_referrals.csv"

# === Load Data === #
df_donors     = pd.read_csv(DONORS_FILE)
df_interests  = pd.read_csv(INTERESTS_FILE)

df_donors.columns     = df_donors.columns.str.strip().str.lower()
df_interests.columns  = df_interests.columns.str.strip().str.lower()

all_donor_ids         = set(df_donors["donor_id"].dropna())

used_referred_ids     = set()
referral_records      = []
influencer_profiles   = []

print(f"\n📄 Loaded {len(df_interests)} donor interests.")
print(f"👥 Loaded {len(df_donors)} donors.")

for inf in INFLUENCERS:
    
    inf_name      = inf["name"]
    
    interest_key  = inf["interest"].strip().lower()
    
    target_count  = inf["target"]

    # Match influencer from donors file by first + last name match
    matched_row   = df_donors[
        (df_donors[ "first_name"].str.lower() == inf_name.split()[0].lower()) &
        (df_donors[ "last_name"].str.lower() == inf_name.split()[-1].lower())
    ]

    if not matched_row.empty:
        # Use existing donor ID from donors.csv
        inf_id     = matched_row.iloc[0]["donor_id"]
        first_name = matched_row.iloc[0]["first_name"]
        last_name  = matched_row.iloc[0]["last_name"]

        print(f"\n🟢 Found existing donor for '{inf_name}' → using donor_id: {inf_id}")
        
        # Add to influencer list only once
        if not any(p[ "donor_id"] == inf_id for p in influencer_profiles):
            influencer_profiles.append({
                "donor_id":     inf_id,
                "first_name":   first_name,
                "last_name":    last_name,
                "is_influencer": True,
                # Replace utcnow with timezone-safe now if needed later
                "created_at": datetime.utcnow().isoformat(),
                "notes": f"Seeded influencer interested in {inf[ "interest"]}"
            })
            print(f"✅ Added profile for {inf_name}")

        # === REFERRAL MATCHING LOGIC === #

        matches_df = df_interests[
            df_interests.apply(
                lambda row: (
                    interest_key in str(row.get("interest_category", "")).lower()
                    or interest_key in str(row.get("interest_name", "")).lower()
                ),
                axis=1
            )
        ]

        all_matches_raw_ids = matches_df["donor_id"].dropna().unique().tolist()

        print(f"🔍 Matched {len(all_matches_raw_ids)} total donors by interest '{inf['interest']}'")
        eligible_matches_ids = [
            d for d in all_matches_raw_ids 
            if d != inf_id and d not in used_referred_ids and d in all_donor_ids
        ]

        print(f"🔎 Eligible referrals after filtering: {len(eligible_matches_ids)}")

        final_targets = eligible_matches_ids[:target_count]

        if len(final_targets) == 0:
            print(f"⚠️ No available matches for {inf_name}, skipping.")
            continue

        print(f"🔗 Creating {len(final_targets)} referrals...")

        for referred_id in final_targets:
            referral_records.append({
                 "referrer_donor_id":   inf_id,
                 "referred_donor_id":   referred_id,
                 "referral_type":        "shared_interest",
                 "referral_date":       (datetime.utcnow() - timedelta(days=random.randint(5,180))).isoformat()
            })
            
            used_referred_ids.add(referred_id)

# === Save Outputs === #
pd.DataFrame(influencer_profiles).to_csv(OUTPUT_INFLUENCERS_CSV, index=False)
pd.DataFrame(referral_records).to_csv(OUTPUT_REFERRALS_CSV, index=False)

print(f"\n✅ Created {len(influencer_profiles)} influencer profiles.")
print(f"🔗 Generated {len(referral_records)} total referrals across all hubs.")
print("📁 Files written:")
print(f"- {OUTPUT_INFLUENCERS_CSV}")
print(f"- {OUTPUT_REFERRALS_CSV}")