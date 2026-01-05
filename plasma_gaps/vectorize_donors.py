import pandas as pd

# === Load source tables === #
donors = pd.read_csv('donors_rows.csv')
donations = pd.read_csv('donation_history_rows.csv')
engagements = pd.read_csv('campaign_engagement_rows.csv')
screenings = pd.read_csv('health_screenings_rows.csv')

# === Feature Engineering === #
donation_sum = donations.groupby('donor_id')['quantity_ml'].sum().reset_index(name='total_donated')
donation_counts = donations.groupby('donor_id').size().reset_index(name='donation_count')

avg_donation_df = donation_sum.merge(donation_counts, on='donor_id')
avg_donation_df['avg_donation_size'] = avg_donation_df['total_donated'] / avg_donation_df['donation_count']

campaign_counts = engagements.groupby('donor_id').size().reset_index(name='campaign_count')
screening_counts = screenings.groupby('donor_id').size().reset_index(name='health_screening_count')

# Merge all into donor base table
vectors_df = donors[['donor_id', 'first_name', 'last_name']].copy()
vectors_df['name'] = vectors_df['first_name'] + " " + vectors_df['last_name']

vectors_df.drop(columns=['first_name', 'last_name'], inplace=True)

vectors_df = vectors_df.merge(donation_sum, on='donor_id', how='left') \
                       .merge(avg_donation_df[['donor_id', 'avg_donation_size']], on='donor_id', how='left') \
                       .merge(donation_counts, on='donor_id', how='left') \
                       .merge(campaign_counts, on='donor_id', how='left') \
                       .merge(screening_counts, on='donor_id', how='left')

# Fill missing activity with zeros so every donor has a complete profile
vectors_df.fillna({
    'total_donated': 0,
    'avg_donation_size': 0,
    'donation_count': 0,
    'campaign_count': 0,
    'health_screening_count': 0
}, inplace=True)

# Save cleaned file
vectors_df.to_csv("donor_vectors.csv", index=False)
print("✅ Donor vector file updated → donor_vectors.csv")