import os
from supabase import create_client, Client  # ✅ CORRECTED IMPORT HERE!
from collections import defaultdict
from datetime import datetime
from dotenv import load_dotenv

# === Load environment variables === #
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ACTIVE_CAMPAIGN_INTEREST = "Yoga"  # Customize for each campaign

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env")

# === Connect to Supabase === #
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Full Relationship Weight Mapping (as per document) === #
RELATIONSHIP_WEIGHTS = {
    "Reported to": 9,
    "Student/teacher": 8,
    "Family - first level": 9,
    "Family - extended": 5,
    "Friends with": 6,
    "Collaborated with": 8,
    "Mentor/Mentee": 8,
    "Advisor/Advisee": 7,
    "Business Partner": 9,
    "Co-founder": 9,
    "Co-author": 7,
    "Co-worker/Colleague": 6,
    "Fellow Board Member": 8,
    "Fellow Committee Member": 5,
    "Fellow Alumni": 3,
    "Fellow Speaker": 3
}

DEFAULT_WEIGHT = 1

print("📥 Fetching data from Supabase...")

donors_resp     = supabase.table("donors").select("*").eq("is_influencer", True).execute()
links_resp      = supabase.table("donor_influencer_links").select("*").execute()
donations_resp  = supabase.table("donation_history").select("*").execute()
engagements_resp= supabase.table("campaign_engagement").select("*").execute()
interests_resp  = supabase.table("donor_interests").select("*").execute()

influencers         = donors_resp.data or []
links               = links_resp.data or []
donations_raw       = donations_resp.data or []
engagements_raw     = engagements_resp.data or []
interests_raw       = interests_resp.data or []

# --- Organize Data by Donor ID --- #
donations_by_donor   = defaultdict(list)
for d in donations_raw:
    donations_by_donor[d["donor_id"]].append(d)

engagements_by_donor = defaultdict(list)
for e in engagements_raw:
    engagements_by_donor[e["donor_id"]].append(e)

interests_map        = defaultdict(list)
for i in interests_raw:
    interests_map[i["donor_id"]].append(i.get("interest_name", "").lower())

links_by_influencer  = defaultdict(list)
for link in links:
    links_by_influencer[link["influencer_id"]].append(link)

# --- Scoring Logic --- #
def compute_score(influencer, influencer_id):
    score_total   = 0
    linked_donors = links_by_influencer.get(influencer_id, [])

    for link in linked_donors:
        rel_type         = link.get('relationship_type')
        donor_linked     = link.get('donor_id')

        if rel_type not in RELATIONSHIP_WEIGHTS:
            print(f"⚠️ Unknown relationship type '{rel_type}' — using default weight {DEFAULT_WEIGHT}")

        weight_rel       = RELATIONSHIP_WEIGHTS.get(rel_type, DEFAULT_WEIGHT)
        donation_count   = len(donations_by_donor.get(donor_linked, []))
        conversion_count = sum(1 for e in engagements_by_donor[donor_linked] if e.get('converted'))

        score_total += weight_rel + (2 * donation_count) + (3 * conversion_count)

    # Interest Bonus for Campaign Match
    interest_names_lowercase   \
        =[i.lower() for i in interests_map[influencer_id]]

    matches_this_campaign      \
        =[i for i in interest_names_lowercase if ACTIVE_CAMPAIGN_INTEREST.lower() in i]

    score_total += len(matches_this_campaign) * 5

    return score_total


# --- Score Influencers --- #
results_to_upsert_into_db_table_scores_list_of_dicts: list[dict]   \
= []

print(f"\n🧮 Scoring influencers (Campaign Theme: {ACTIVE_CAMPAIGN_INTEREST})...\n")

for influencer_record in influencers:
    
    influencer_uuid: str      \
        ={ 'uuid': influencer_record['donor_id'] }['uuid']

    
full_name: str      \
= { 'name': f"{influencer_record.get('first_name', '')} {influencer_record.get('last_name', '')}".strip() }['name']

total_score: int     \
= { 'score': compute_score(influencer_record, influencer_uuid) }['score']

scored_entry: dict[str,str|int] \
= {
       "influencer_id" : influencer_uuid,
       "name"          : full_name or "(Unnamed)",
       "total_score"   : total_score,
       "updated_at"     : datetime.utcnow().isoformat(),
}

print(f">>> {full_name:<30} | Score: {total_score}")
results_to_upsert_into_db_table_scores_list_of_dicts.append(scored_entry)


# --- Upsert Results into Supabase Table --- #
print("\n⬆️ Uploading scores to Supabase...\n")

upsert_result=supabase\
                .table("influencer_scores")\
                .upsert(results_to_upsert_into_db_table_scores_list_of_dicts)\
                .execute()

if upsert_result.data is not None:
     print("\n✅ Influencers scored and uploaded successfully!")
else:
     print("\n❌ Upload failed:", upsert_result)


# Optional Summary Output
print("\n🏆 Top Influencers by Score:")
top_sorted_results=sorted(results_to_upsert_into_db_table_scores_list_of_dicts,key=lambda x:x["total_score"],reverse=True)
for entry in top_sorted_results[:10]:
     print(f"{entry['name']:<30} | Score: {entry['total_score']}")