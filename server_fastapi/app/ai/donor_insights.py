import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from pathlib import Path

class DonorInsightsService:
    def __init__(self, data_path: str = None):
        if data_path is None:
            # Default path relative to this file
            self.data_path = Path(__file__).resolve().parent.parent.parent / 'data' / 'donor_vectors_clustered.csv'
        else:
            self.data_path = Path(data_path)
            
    def load_data(self):
        if not self.data_path.exists():
            raise FileNotFoundError(f"Data file not found at {self.data_path}")
        return pd.read_csv(self.data_path)

    def get_clusters(self, n_clusters=3):
        df = self.load_data()
        
        # Features for clustering (matching donor_vectors_clustered.csv columns)
        features = ['donation_count', 'avg_donation_size', 'campaign_count', 'health_screening_count']
        
        # Ensure columns exist, handle missing columns if necessary
        available_features = [f for f in features if f in df.columns]
        if not available_features:
            return df
            
        x_features = df[available_features]
        # Handle NaN/Inf before scaling
        x_features = x_features.replace([np.inf, -np.inf], np.nan).fillna(0)
        x_scaled = StandardScaler().fit_transform(x_features)
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        df['cluster'] = kmeans.fit_predict(x_scaled)
        
        return df

    def predict_elasticity(self):
        df = self.load_data()
        
        # Features for prediction (matching donor_vectors_clustered.csv columns)
        features = ['donation_count', 'avg_donation_size', 'campaign_count', 'health_screening_count']
        available_features = [f for f in features if f in df.columns]
        
        if 'elastic' not in df.columns:
            # Simple rule-based label if not present for training demonstration
            # Using avg_donation_size and donation_count for rule
            df['elastic'] = ((df['donation_count'] * df['avg_donation_size']) > 5000).astype(int)
            
        # Handle NaN/Inf
        df_clean = df.replace([np.inf, -np.inf], np.nan).fillna(0)
        x = df_clean[available_features]
        y = df_clean['elastic']
        
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=1)
        
        rfc = RandomForestClassifier(n_estimators=100, max_depth=4, class_weight="balanced", random_state=42)
        rfc.fit(x_train, y_train)
        
        # In a real app, we'd return the model or predictions for the whole dataset
        df['elasticity_score'] = rfc.predict_proba(x)[:, 1]
        
        return df

# Example usage
if __name__ == "__main__":
    service = DonorInsightsService()
    try:
        clustered_df = service.get_clusters()
        print("Clusters generated successfully.")
        print(clustered_df['cluster'].value_counts())
    except Exception as e:
        print(f"Error: {e}")
