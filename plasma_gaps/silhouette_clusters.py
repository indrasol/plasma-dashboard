import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.impute import SimpleImputer
import numpy as np

# Load donor vector data
donor_vectors = pd.read_csv('donor_vectors.csv')

# Select numeric columns only
numeric_features = donor_vectors.select_dtypes(include=['number'])

# Impute missing values (NaN) with column mean
imputer = SimpleImputer(strategy='mean')
features_imputed = imputer.fit_transform(numeric_features)

# Standardize the data
scaler = StandardScaler()
features_scaled = scaler.fit_transform(features_imputed)

# PCA to 2 dimensions for clustering and plotting
pca = PCA(n_components=2, random_state=42)
reduced_features = pca.fit_transform(features_scaled)

# Elbow method
inertias = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(reduced_features)
    inertias.append(kmeans.inertia_)

plt.figure()
plt.plot(range(2, 11), inertias, marker='o')
plt.xlabel('Number of clusters (k)')
plt.ylabel('Inertia')
plt.title('Elbow Method for Optimal k')
plt.show()

# Silhouette analysis
sil_scores = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42)
    cluster_labels = kmeans.fit_predict(reduced_features)
    score = silhouette_score(reduced_features, cluster_labels)
    sil_scores.append(score)

plt.figure()
plt.plot(range(2, 11), sil_scores, marker='o')
plt.xlabel('Number of clusters (k)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Analysis')
plt.show()
