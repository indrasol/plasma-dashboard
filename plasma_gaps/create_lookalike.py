import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize

class LookalikeSearcher:
    def __init__(self, donor_vectors_df, feature_columns):
        """
        donor_vectors_df: pd.DataFrame including donor_id and feature columns
        feature_columns: list of column names representing numeric vector features
        """
        self.donor_vectors_df = donor_vectors_df.copy()
        self.feature_columns = feature_columns
        # Pre-extract vectors for speed
        self.vectors = self.donor_vectors_df[self.feature_columns].values
        self.donor_ids = self.donor_vectors_df['donor_id'].values

    def find_lookalikes(self, donor_id, metric='cosine', top_n=10):
        """
        Returns list of tuples (donor_id, similarity_score) of top_n lookalikes for donor_id
        
        metric: 'cosine' or 'euclidean'
        """
        if donor_id not in self.donor_ids:
            raise ValueError(f"donor_id {donor_id} not found in donor vectors.")

        # Get index of target donor
        idx = np.where(self.donor_ids == donor_id)[0][0]
        target_vec = self.vectors[idx]

        if metric == 'cosine':
            # Normalize all vectors, including target
            vectors_norm = normalize(self.vectors)
            target_norm = vectors_norm[idx]
            # Compute cosine similarity scores (dot product)
            similarities = vectors_norm @ target_norm
            # Remove self similarity
            similarities[idx] = -1
            # Get top n
            top_indices = np.argsort(similarities)[::-1][:top_n]
            results = [(self.donor_ids[i], similarities[i]) for i in top_indices]

        elif metric == 'euclidean':
            # Compute Euclidean distances
            dists = np.linalg.norm(self.vectors - target_vec, axis=1)
            dists[idx] = np.inf  # exclude self
            top_indices = np.argsort(dists)[:top_n]
            # Convert distances to similarity-like scores by negation (for consistent ordering)
            results = [(self.donor_ids[i], -dists[i]) for i in top_indices]

        else:
            raise ValueError("metric must be 'cosine' or 'euclidean'")

        return results

# Example usage:
if __name__ == "__main__":
    # Load donor vectors CSV
    df = pd.read_csv('donor_vectors.csv')

    # Define numeric feature columns for vectors (adjust as needed)
    feature_cols = ['total_donated', 'avg_donation_size', 'donation_count',
                    'campaign_count', 'health_screening_count']

    searcher = LookalikeSearcher(df, feature_cols)

    # Target a specific donor UUID (replace with actual donor_id)
    target_donor_id = df['donor_id'].iloc[0]

    print("Lookalikes by Cosine Similarity:")
    lookalikes_cosine = searcher.find_lookalikes(target_donor_id, metric='cosine', top_n=5)
    for did, score in lookalikes_cosine:
        print(f"Donor {did} - Similarity: {score:.4f}")

    print("\nLookalikes by Euclidean Distance:")
    lookalikes_euclid = searcher.find_lookalikes(target_donor_id, metric='euclidean', top_n=5)
    for did, score in lookalikes_euclid:
        print(f"Donor {did} - Negative Distance: {score:.4f}")
