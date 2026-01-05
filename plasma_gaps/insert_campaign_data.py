import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta

# Load donors with UUIDs
donors = pd.read_csv('donors_rows.csv')

num_donors = len(donors)
np.random.seed(42)  # for reproducibility

# Define possible campaigns and channels
num_campaigns = 10
channels = ['SMS', 'Email', 'Social', 'Phone']

records = []
for _, row in donors.iterrows():
    donor_id = row['donor_id']
    num_engagements = np.random.randint(1, 6)  # 1 to 5 engagements per donor
    for _ in range(num_engagements):
        campaign_num = np.random.randint(1, num_campaigns + 1)
        campaign_name = f'Campaign {campaign_num}'
        channel = np.random.choice(channels)
        clicked = np.random.choice([True, False])
        converted = np.random.choice([True, False])
        days_ago = np.random.randint(0, 730)  # within last 2 years
        engagement_timestamp = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%dT%H:%M:%S')

        records.append({
            'engagement_id': str(uuid.uuid4()),
            'donor_id': donor_id,
            'campaign_name': campaign_name,
            'channel': channel,
            'clicked': clicked,
            'converted': converted,
            'engagement_timestamp': engagement_timestamp
        })

df_engagements = pd.DataFrame(records)
df_engagements.to_csv('campaign_engagement_rows_generated.csv', index=False)
print(f"Generated {len(df_engagements)} campaign engagement records.")
