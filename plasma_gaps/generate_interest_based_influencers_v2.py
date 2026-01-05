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
    {"name": "Dr. Samir Shah",     "interest": 'Keto Diet',          'target': 35},
    {'name': 'Sister Grace',       'interest': 'Meditation',         'target': 32},
    {'name': 'Trainer Jason',      'interest': 'Strength Training',  'target': 34},
    {'name': 'Nutritionist Nina',  'interest': 'Vegan Diet',         'target': 31},
    {'name': 'Counselor Karen',    'interest': 'Digital Detox',      'target': 28},
    {'name': 'Minister Lee',       'interest': 'Sustainable Living', 'target':33},
    {'name': 'Coach Marcus',       'interest':'Cycling',             'target':29},
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

all_donor_ids         = set(df_donors["donor_id"].dropna().unique())

used_referred_ids     = set()
referral_records      = []
influencer_profiles   = []

for inf in INFLUENCERS:
    
    inf_name      = inf["name"]
    
    interest_key  = inf["interest"].strip().lower()
    
    target_count  = inf["target"]

    # Create new UUID for this influencer
    inf_id        = str(uuid.uuid4())
    
    name_parts           \
        =[w for w in inf_name.split(" ") if w]
    
    first_name, last_name= name_parts[0], name_parts[-1]

    
    # Find donors who match this interest — either by name or category
    
    matches_df   \
        =(df_interests[
            df_interests.apply(
                lambda row: (
                    interest_key in str(row.get("interest_name","")).lower() or 
                    interest_key in str(row.get("interest_category","")).lower()
                ),
                axis=1
            )
        ])
    
        
    
        
    
    
    
    


    
    
    
    
    
    
    

    
    
    
    


# === Save Outputs === #
pd.DataFrame(influencer_profiles).to_csv(OUTPUT_INFLUENCERS_CSV, index=False)
pd.DataFrame(referral_records).to_csv(OUTPUT_REFERRALS_CSV, index=False)

print(f"\n✅ Generated {len(referral_records)} total referrals.")
print(f"🧠 Created {len(influencer_profiles)} influencer profiles.")
print(f"📁 Files written:")
print(f"- {OUTPUT_INFLUENCERS_CSV}")
print(f"- {OUTPUT_REFERRALS_CSV}")