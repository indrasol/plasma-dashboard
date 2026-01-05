from scipy.stats import pearsonr
from supabase import create_client, Client
import pandas as pd
import numpy as np

# Set up Supabase connection 👇 replace with your real values!
url = "https://hacnyrphweteuobxpzaw.supabase.co"; 
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY255cnBod2V0ZXVvYnhwemF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3MzUyNywiZXhwIjoyMDcxNzQ5NTI3fQ.6qz9pOVyxNtM5qNuVN8JauhnFijTn-wZYNTDfegilu4";

supabase = create_client(url, key)

res = supabase.table("donors").select("donor_id").execute()
df = pd.DataFrame(res.data)

df["elasticity_score"] = np.random.rand(len(df))
df["classification"]   = np.where(df.elasticity_score > 0.5, "elastic", "inelastic")
df["last_updated"]     = pd.Timestamp.now().isoformat()  # ✅ Fix here!

records_to_insert = df.rename(columns={"id": "donor_id"}).to_dict(orient="records")

_ = supabase.table("donor_elasticity").upsert(records_to_insert).execute()
print(f"✅ Upserted {len(records_to_insert)} records.")