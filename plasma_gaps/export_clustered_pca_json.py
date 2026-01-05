import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

INPUT_FILE = "donor_vectors.csv"
OUTPUT_JSON = "plasma-dashboard/public/assets/donor_clusters_reduced.json"

df = pd.read_csv(INPUT_FILE)

if 'name' not in df.columns:
    df['name'] = (
        df.get('first_name', '').fillna('') + ' ' +
        df.get('last_name', '').fillna('')
    ).str.strip().replace('', 'Unknown')

numeric_features = df.select_dtypes(include=[np.number])
numeric_features.fillna(numeric_features.mean(), inplace=True)

scaler = StandardScaler()
scaled = scaler.fit_transform(numeric_features)

pca = PCA(n_components=2)
reduced_2d = pca.fit_transform(scaled)

kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(reduced_2d).astype(int)

df_out = pd.DataFrame({
    "x": reduced_2d[:, 0],
    "y": reduced_2d[:, 1],
    "name": df["name"],
    "cluster": clusters,
})

df_out.to_json(OUTPUT_JSON, orient="records", indent=2)
print("✅ Export complete.")