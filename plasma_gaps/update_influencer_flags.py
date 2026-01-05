import os
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials missing. Check .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Step 1: Fetch all referral links ---
print("📥 Fetching donor_influencer_links...")
links_resp = supabase.table("donor_influencer_links").select("*").execute()
links = links_resp.data or []

if not links:
    print("⚠️ No referral links found.")
    exit()

# --- Step 2: Update influencers (set is_influencer=True) ---
influencer_ids = list({link["influencer_id"] for link in links})
print(f"🧠 Found {len(influencer_ids)} unique influencers...")

for influencer_id in influencer_ids:
    supabase.table("donors") \
        .update({"is_influencer": True}) \
        .eq("donor_id", influencer_id) \
        .execute()

print(f"✅ Updated 'is_influencer' flag for {len(influencer_ids)} donors.")

# --- Step 3: Set primary_influencer_id on referred donors ---
updates_made = 0
for link in links:
    donor_id = link["donor_id"]
    primary_id = link["influencer_id"]

    supabase.table("donors") \
        .update({"primary_influencer_id": primary_id}) \
        .eq("donor_id", donor_id) \
        .execute()
    
    updates_made += 1

print(f"✅ Set 'primary_influencer_id' for {updates_made} referred donors.")
print("\n🏁 All flags updated successfully!")