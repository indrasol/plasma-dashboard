import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.impute import SimpleImputer
import numpy as np

# Load donor vector data
donor_vectors = pd.read_csv('donor_vectors.csv')

# Select only numeric columns for clustering
numeric_features = donor_vectors.select_dtypes(include=['number'])

# Store feature names for interpretation
feature_names = numeric_features.columns.tolist()

# Impute missing values (NaNs) with column mean
imputer = SimpleImputer(strategy='mean')
features_imputed = imputer.fit_transform(numeric_features)

# Standardize features for PCA and clustering
scaler = StandardScaler()
features_scaled = scaler.fit_transform(features_imputed)

# Apply PCA to reduce dimensions (2 components for visualization)
pca = PCA(n_components=2, random_state=42)
reduced_features = pca.fit_transform(features_scaled)

# Print PCA component loadings for interpretation
print("\nPCA Component Loadings (Feature Contributions):")
for i, component in enumerate(pca.components_):
    contributions = dict(zip(feature_names, component))
    sorted_contributions = dict(sorted(contributions.items(), key=lambda item: abs(item[1]), reverse=True))
    print(f"Component {i+1}:")
    for feature, value in sorted_contributions.items():
        print(f"  {feature:25s}: {value: .4f}")

# Get top 2 features per component for axis labels
component1_sorted = sorted(zip(feature_names, pca.components_[0]), key=lambda x: abs(x[1]), reverse=True)
component2_sorted = sorted(zip(feature_names, pca.components_[1]), key=lambda x: abs(x[1]), reverse=True)

top1_pca1 = f"{component1_sorted[0][0]} ({component1_sorted[0][1]:.2f})"
top2_pca1 = f"{component1_sorted[1][0]} ({component1_sorted[1][1]:.2f})"
top1_pca2 = f"{component2_sorted[0][0]} ({component2_sorted[0][1]:.2f})"
top2_pca2 = f"{component2_sorted[1][0]} ({component2_sorted[1][1]:.2f})"

xlabel = f"PCA Component 1\nTop: {top1_pca1}, {top2_pca1}"
ylabel = f"PCA Component 2\nTop: {top1_pca2}, {top2_pca2}"

# Apply K-Means clustering (adjust n_clusters as needed)
kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(reduced_features)

# Add clusters to donor_vectors dataframe
donor_vectors['cluster_label'] = clusters
donor_vectors.to_csv('donor_vectors_clustered.csv', index=False)
print("\nCluster labels saved to donor_vectors_clustered.csv")

# Plotting clusters with annotated axis labels
plt.figure(figsize=(10, 7))
scatter = plt.scatter(reduced_features[:, 0], reduced_features[:, 1], c=clusters, cmap='viridis')
plt.title('Donor Profile Clusters (PCA reduced)')
plt.xlabel(xlabel)
plt.ylabel(ylabel)
plt.colorbar(scatter, label='Cluster label')
plt.show()
