import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from pathlib import Path
from server_fastapi.app.utils.logger import log_info, log_error

class DonorSegmentationService:
    def __init__(self, data_path: str = None):
        if data_path is None:
            self.data_path = Path(__file__).resolve().parent.parent.parent / 'data' / 'donor_vectors_clustered.csv'
        else:
            self.data_path = Path(data_path)

    def perform_segmentation(self, n_clusters=4):
        """
        Performs GMM segmentation on donor vectors.
        """
        if not self.data_path.exists():
            log_error(f"Data file not found at {self.data_path}")
            return None

        try:
            df = pd.read_csv(self.data_path)
            log_info(f"Loaded {len(df)} donors for segmentation")

            # Select only numeric vector features (exclude IDs/labels)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            # Exclude known non-feature numeric cols if any
            exclude = ['donor_id', 'cluster_label', 'cluster']
            feature_cols = [c for c in numeric_cols if c not in exclude]
            
            X = df[feature_cols].copy()
            # Handle NaN and Infinity values
            X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
            
            # Normalize
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # Reduce dimensionality
            pca = PCA(n_components=min(10, X.shape[1]))
            X_pca = pca.fit_transform(X_scaled)

            # Fit Gaussian Mixture Model
            gmm = GaussianMixture(n_components=n_clusters, random_state=42)
            clusters = gmm.fit_predict(X_pca)

            df["cluster_label"] = clusters
            log_info(f"Segmentation complete. Cluster sizes: {df['cluster_label'].value_counts().to_dict()}")
            
            return df
        except Exception as e:
            log_error(f"Error during segmentation: {e}")
            return None

    def get_pca_plot_data(self, n_components=2):
        """
        Returns 2D PCA coordinates for visualization.
        """
        if not self.data_path.exists():
            log_error(f"Data file not found at {self.data_path}")
            return []

        try:
            df = pd.read_csv(self.data_path)
            
            # Select only numeric vector features (exclude IDs/labels)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            exclude = ['donor_id', 'cluster_label', 'cluster']
            feature_cols = [c for c in numeric_cols if c not in exclude]
            
            X = df[feature_cols].copy()
            X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
            
            # Normalize
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # PCA to 2D
            pca = PCA(n_components=n_components)
            X_pca = pca.fit_transform(X_scaled)

            cluster_col = 'cluster_label' if 'cluster_label' in df.columns else 'cluster'
            
            plot_data = []
            for i, (_, row) in enumerate(df.iterrows()):
                c_val = row.get(cluster_col, 0)
                plot_data.append({
                    "x": round(float(X_pca[i, 0]), 4),
                    "y": round(float(X_pca[i, 1]), 4),
                    "name": row.get('name', 'Unknown') if pd.notnull(row.get('name')) else 'Unknown',
                    "cluster": int(c_val) if pd.notnull(c_val) else 0
                })
            
            return plot_data
        except Exception as e:
            log_error(f"Error generating PCA plot data: {e}")
            return []

    def validate_clusters(self, max_k=10):
        """
        Performs Elbow and Silhouette analysis to find optimal K.
        Matches legacy silhouette_clusters.py logic.
        """
        if not self.data_path.exists():
            log_error(f"Data file not found at {self.data_path}")
            return None

        try:
            df = pd.read_csv(self.data_path)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            exclude = ['donor_id', 'cluster_label', 'cluster']
            feature_cols = [c for c in numeric_cols if c not in exclude]
            
            X = df[feature_cols].copy()
            X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
            
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            pca = PCA(n_components=2)
            X_reduced = pca.fit_transform(X_scaled)

            elbow_data = []
            silhouette_data = []

            for k in range(2, max_k + 1):
                kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
                cluster_labels = kmeans.fit_predict(X_reduced)
                
                elbow_data.append({"k": k, "inertia": float(kmeans.inertia_)})
                
                score = silhouette_score(X_reduced, cluster_labels)
                silhouette_data.append({"k": k, "score": float(score)})

            return {
                "elbow": elbow_data,
                "silhouette": silhouette_data
            }
        except Exception as e:
            log_error(f"Error validating clusters: {e}")
            return None

    async def update_supabase_clusters(self, df, supabase_client):
        """
        Updates cluster labels in Supabase.
        """
        if df is None or supabase_client is None:
            return

        log_info("Updating cluster labels in Supabase...")
        count = 0
        for row in df.itertuples():
            try:
                supabase_client.table("donor_vectors").update({
                    "cluster_label": int(row.cluster_label)
                }).eq("donor_id", row.donor_id).execute()
                count += 1
            except Exception as e:
                log_error(f"Failed to update donor {row.donor_id}: {e}")
        
        log_info(f"Successfully updated {count} donors in Supabase.")
