import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta

# Load donors CSV
donors = pd.read_csv('donors_rows.csv')

np.random.seed(42)  # for reproducibility

records = []
for _, row in donors.iterrows():
    donor_id = row['donor_id']
    screenings_per_donor = np.random.randint(1, 4)  # 1 to 3 screenings per donor
    for _ in range(screenings_per_donor):
        # Random screening date in the last 2 years
        days_ago = np.random.randint(0, 730)
        screening_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        
        # Generate random medical values
        hemoglobin_level = round(np.random.uniform(11.0, 18.0), 1)  # typical range
        systolic_bp = np.random.randint(100, 150)
        diastolic_bp = np.random.randint(60, 100)
        weight_kg = round(np.random.uniform(45.0, 120.0), 1)
        temperature_c = round(np.random.uniform(36.0, 38.5), 1)
        pulse_bpm = np.random.randint(55, 110)
        questionnaire_passed = np.random.choice([True, False])
        disqualified_reason_code = '' if questionnaire_passed else np.random.choice(['BP_HIGH', 'BP_LOW', 'FEVER', 'LOW_HEMO', 'WEIGHT_LOW'])

        records.append({
            'screening_id': str(uuid.uuid4()),
            'donor_id': donor_id,
            'screening_date': screening_date,
            'hemoglobin_level': hemoglobin_level,
            'systolic_bp': systolic_bp,
            'diastolic_bp': diastolic_bp,
            'weight_kg': weight_kg,
            'temperature_c': temperature_c,
            'pulse_bpm': pulse_bpm,
            'questionnaire_passed': questionnaire_passed,
            'disqualified_reason_code': disqualified_reason_code
        })

df_screenings = pd.DataFrame(records)
df_screenings.to_csv('health_screenings_rows_generated.csv', index=False)
print(f"Generated {len(df_screenings)} health screening records in the required format.")
