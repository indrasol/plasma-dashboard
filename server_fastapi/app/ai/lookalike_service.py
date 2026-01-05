import pandas as pd
import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from pathlib import Path
from typing import List, Dict, Any, Optional
from server_fastapi.app.utils.logger import log_info, log_error

class LookalikeService:
    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        else:
            self.data_dir = data_dir
        
        self.vectors_file = self.data_dir / 'donor_vectors_clustered.csv'
        self.centroid_file = self.data_dir / 'perfect_cluster_centroid.json'

    def get_lookalikes(self, donor_id: str, top_n: int = 10, metric: str = 'cosine', cluster_only: bool = False) -> List[Dict[str, Any]]:
        """
        Calculates real-time similarity between a specific donor and all others.
        """
        if not self.vectors_file.exists():
            log_error(f"Vectors file not found at {self.vectors_file}")
            return []

        try:
            df = pd.read_csv(self.vectors_file)
            
            if donor_id not in df['donor_id'].values:
                log_error(f"Donor ID {donor_id} not found in vectors.")
                return []

            # Prepare features
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            exclude = ['donor_id', 'cluster_label', 'cluster']
            feature_cols = [c for c in numeric_cols if c not in exclude]
            
            # Get target donor vector
            target_row = df[df['donor_id'] == donor_id]
            target_vector = target_row[feature_cols].values
            target_cluster = target_row['cluster_label'].values[0] if 'cluster_label' in target_row.columns else None

            # Filter by cluster if requested
            if cluster_only and target_cluster is not None:
                df_pool = df[df['cluster_label'] == target_cluster].copy()
            else:
                df_pool = df.copy()

            # Exclude self
            df_pool = df_pool[df_pool['donor_id'] != donor_id]

            if df_pool.empty:
                return []

            X_pool = df_pool[feature_cols].values
            
            # Handle NaN/Inf
            X_pool = np.nan_to_num(X_pool)
            target_vector = np.nan_to_num(target_vector)

            # Calculate similarity
            if metric == 'cosine':
                sims = cosine_similarity(target_vector, X_pool).flatten()
            else:
                # For Euclidean, we return negative distance so higher is still "better/closer"
                sims = -euclidean_distances(target_vector, X_pool).flatten()

            df_pool['similarity'] = sims
            
            # Sort and take top N
            results_df = df_pool.sort_values('similarity', ascending=False).head(top_n)
            
            # Clean for JSON
            results_df = results_df.replace([np.inf, -np.inf], np.nan)
            results_df = results_df.astype(object).where(pd.notnull(results_df), None)
            
            return results_df.to_dict(orient='records')

        except Exception as e:
            log_error(f"Error calculating lookalikes: {e}")
            import traceback
            log_error(traceback.format_exc())
            return []

    def get_centroid_matches(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Matches all donors against the 'Perfect Cluster Centroid'.
        Matches legacy find_internal_lookalikes.py logic.
        """
        if not self.vectors_file.exists() or not self.centroid_file.exists():
            log_error("Vectors or Centroid file missing.")
            return []

        try:
            with open(self.centroid_file, 'r') as f:
                centroid_data = json.load(f)
            
            centroid_vector = np.array(centroid_data['vector']).reshape(1, -1)
            feature_names = centroid_data['feature_names']
            
            df = pd.read_csv(self.vectors_file)
            
            # Ensure all features exist in df
            available_features = [f for f in feature_names if f in df.columns]
            if len(available_features) < len(feature_names):
                log_error(f"Missing features in donor vectors: {set(feature_names) - set(available_features)}")
            
            X = df[available_features].values
            X = np.nan_to_num(X)
            
            # Calculate cosine similarity against centroid
            sims = cosine_similarity(X, centroid_vector).flatten()
            df['similarity'] = sims
            
            results_df = df.sort_values('similarity', ascending=False).head(top_n)
            results_df = results_df.replace([np.inf, -np.inf], np.nan)
            results_df = results_df.astype(object).where(pd.notnull(results_df), None)
            
            return results_df.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error calculating centroid matches: {e}")
            return []

