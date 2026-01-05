import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from supabase import create_client, Client  # pip install supabase

# 🔐 Your Supabase credentials
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-service-role-key"  # NOT the anon key!

# Load donor vector data from local file or Supabase export
df = pd.read_csv("donor_vectors.csv")
print(f"Loaded {len(df)} donors")

# Select only numeric vector features (exclude IDs/labels)
vector_cols = df.select_dtypes(include=[np.number]).columns.tolist()
X = df[vector_cols].copy()

# Normalize and reduce dimensionality with PCA for GMM input 🎯
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=10)
X_pca = pca.fit_transform(X_scaled)

# Fit Gaussian Mixture Model 🤖 
n_clusters = 4  # Start with 4, adjust later if needed!
gmm = GaussianMixture(n_components=n_clusters, random_state=42)
clusters = gmm.fit_predict(X_pca)

df["cluster_label"] = clusters

print("\n✅ Cluster sizes:")
print(df["cluster_label"].value_counts())

# ⬆️ Push updates back to Supabase via Python API ✅ 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

for row in df.itertuples():
    response = supabase.table("donor_vectors").update({
        "cluster_label": int(row.cluster_label)
    }).eq("donor_id", row.donor_id).execute()

print("\n✅ Updated cluster labels successfully.")