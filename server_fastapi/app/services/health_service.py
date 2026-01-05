import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from server_fastapi.app.utils.logger import log_info, log_error

class HealthService:
    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        else:
            self.data_dir = data_dir
        
        self.screenings_file = self.data_dir / 'health_screenings.csv'
        self.donors_file = self.data_dir / 'donors_rows.csv'

    def get_health_stats(self, donor_id: str = None) -> Dict[str, Any]:
        """
        Returns aggregated health statistics.
        If donor_id is provided, returns stats for that donor.
        Otherwise, returns global averages/trends.
        """
        if not self.screenings_file.exists():
            log_error(f"Health screenings file not found at {self.screenings_file}")
            return {}

        try:
            df = pd.read_csv(self.screenings_file)
            
            if donor_id:
                df = df[df['donor_id'] == donor_id]
                if df.empty:
                    return {"donor_id": donor_id, "has_data": False}
                
                # Latest screening
                df['screening_date'] = pd.to_datetime(df['screening_date'])
                latest = df.sort_values('screening_date', ascending=False).iloc[0]
                
                return {
                    "donor_id": donor_id,
                    "has_data": True,
                    "last_screening": latest['screening_date'].isoformat(),
                    "hemoglobin": float(latest['hemoglobin_level']),
                    "blood_pressure": f"{int(latest['systolic_bp'])}/{int(latest['diastolic_bp'])}",
                    "weight": float(latest['weight_kg']),
                    "pulse": int(latest['pulse_bpm']),
                    "history": df.sort_values('screening_date').to_dict(orient='records')
                }
            
            # Global stats
            return {
                "avg_hemoglobin": round(float(df['hemoglobin_level'].mean()), 2),
                "avg_systolic": round(float(df['systolic_bp'].mean()), 1),
                "avg_diastolic": round(float(df['diastolic_bp'].mean()), 1),
                "pass_rate": round(float(df['questionnaire_passed'].mean() * 100), 1),
                "total_screenings": len(df),
                "disqualified_counts": df['disqualified_reason_code'].value_counts().to_dict()
            }
        except Exception as e:
            log_error(f"Error fetching health stats: {e}")
            return {}

    def get_all_screenings(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """
        Returns a list of all health screenings.
        """
        if not self.screenings_file.exists():
            return []

        try:
            df = pd.read_csv(self.screenings_file)
            
            # Merge with donor names if possible
            if self.donors_file.exists():
                donors = pd.read_csv(self.donors_file)
                donors['name'] = (donors['first_name'].fillna('') + " " + donors['last_name'].fillna('')).str.strip()
                df = df.merge(donors[['donor_id', 'name']], on='donor_id', how='left')
            
            df = df.head(limit)
            df = df.replace([np.inf, -np.inf], np.nan)
            df = df.astype(object).where(pd.notnull(df), None)
            
            return df.to_dict(orient='records')
        except Exception as e:
            log_error(f"Error fetching all screenings: {e}")
            return []

