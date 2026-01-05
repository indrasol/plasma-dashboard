import pandas as pd

df_donors = pd.read_csv("donors.csv")
df_interests = pd.read_csv("formatted_donor_interests_boosted.csv")

donor_ids_set = set(df_donors["donor_id"].dropna())
interest_ids_set = set(df_interests["donor_id"].dropna())

unmatched = interest_ids_set - donor_ids_set

print(f"\n🔎 Total interests: {len(interest_ids_set)}")
print(f"✅ Matching donor IDs: {len(interest_ids_set & donor_ids_set)}")
print(f"❌ Donor IDs NOT found in donors.csv: {len(unmatched)} (these will be skipped!)")