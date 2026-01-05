import sqlite3
import pandas as pd
import csv
import random
from datetime import datetime
import uuid

# === Config === #
DB_FILE = 'local_data.db'
DONORS_CSV = 'donors_rows.csv'
EXPORT_CSV = 'donor_influencer_links_export.csv'
BAD_UUID_CSV = 'bad_uuid_links.csv'

RELATIONSHIPS = [
    ("Reported to", 9),
    ("Student/teacher", 8),
    ("Family - first level", 9),
    ("Family - extended", 5),
    ("Friends with", 6),
    ("Collaborated with", 8),
    ("Mentor/Mentee", 8),
    ("Advisor/Advisee", 7),
    ("Business Partner", 9),
    ("Co-founder", 9),
    ("Co-author", 7),
    ("Co-worker/Colleague", 6),
    ("Fellow Board Member", 8),
    ("Fellow Committee Member", 5),
    ("Fellow Alumni", 3),
    ("Fellow Speaker", 3)
]

INTEREST_LIST = [
	("Travel and Exploration","Visiting new countries and cultures"),
	("Travel and Exploration","Backpacking and adventure travel"),
	("Reading and Literature","Poetry and poetic forms (haiku, sonnets, free verse)"),
	("Outdoor Activities","Camping (tent camping, RV camping)"),
	("Creative Arts","Painting (oil painting, watercolor, acrylics)"),
	("Cooking and Baking","Culinary arts and gourmet cooking"),
	("Technology and Gaming","Video gaming (console gaming, PC gaming)"),
	("Health and Wellness","Yoga retreats and wellness tourism")
]

def is_valid_uuid(val):
	try:
	    uuid.UUID(str(val).strip())
	    return True
	except Exception:
	    return False


def main():
	print("\n🔄 Generating donor-influencer referral links...")

	donors_df = pd.read_csv(DONORS_CSV, dtype=str)

	if 'donor_id' not in donors_df.columns:
	    raise ValueError("'donor_id' column missing in donors CSV!")

	donor_ids = donors_df['donor_id'].dropna().unique().tolist()
	print(f"📥 Loaded {len(donor_ids)} donors")

	num_influencers = max(1, len(donor_ids) // 10)
	influencers = random.sample(donor_ids, num_influencers)

	referrals_list = []
	now_str = datetime.now().isoformat(sep=' ', timespec='seconds')

	for influencer_id in influencers:
	    linked_count = random.randint(1,5)
	    possible_donors = [d for d in donor_ids if d != influencer_id]
	    linked_donors = random.sample(possible_donors, min(linked_count,len(possible_donors)))

	    for donor_id in linked_donors:
	        relationship_type, weight         = random.choice(RELATIONSHIPS)
	        interest_category, interest_name   = random.choice(INTEREST_LIST)

	        referrals_list.append({
	            "donor_id": donor_id.strip(),
	            "influencer_id": influencer_id.strip(),
	            "relationship_type": relationship_type,
	            "relationship_weight": weight,
	            "interest_category": f"{interest_category}: {interest_name}",
	            "created_at": now_str
	        })

	df_referrals = pd.DataFrame(referrals_list)

	print(f"📝 Generated {len(df_referrals)} raw referral rows")

	# Validate UUID columns
	df_referrals["valid_donor"]      = df_referrals["donor_id"].apply(is_valid_uuid)
	df_referrals["valid_influencer"] = df_referrals["influencer_id"].apply(is_valid_uuid)

	valid_df   = df_referrals[df_referrals["valid_donor"] & df_referrals["valid_influencer"]].copy()
	bad_df     = df_referrals[~(df_referrals["valid_donor"] & df_referrals["valid_influencer"])].copy()

	if not bad_df.empty:
	    print(f"⚠️ Found {len(bad_df)} invalid UUID entries — exporting to {BAD_UUID_CSV}")
	    bad_df.to_csv(BAD_UUID_CSV,index=False)

	final_df=valid_df.drop(columns=["valid_donor","valid_influencer"])
	final_row_count=len(final_df)

	print(f"✅ Final valid rows: {final_row_count}")
	final_df.to_csv(EXPORT_CSV,index=False)
	print(f"📤 Exported cleaned file → {EXPORT_CSV}")

	# Optional: insert into local SQLite table too for review/debugging before upload.
	conn=sqlite3.connect(DB_FILE)
	cursor=conn.cursor()

	cursor.execute('DELETE FROM donor_influencer_links')
	conn.commit()

	final_records=[tuple(row)for row in final_df.itertuples(index=False)]
	cursor.executemany("""
	    INSERT INTO donor_influencer_links (
	        donor_id,
	        influencer_id,
	        relationship_type,
	        relationship_weight,
	        interest_category,
	        created_at
	    ) VALUES (?, ?, ?, ?, ?, ?);
	""", final_records)

	conn.commit()
	conn.close()
	print("🗂️ SQLite database updated.")

if __name__ == "__main__":
	main()