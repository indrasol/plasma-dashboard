import pandas as pd

# File paths (update as needed)
donors_rows_file = 'donors_rows.csv'
donors_vectors_file = 'donor_vectors.csv'
output_vectors_file = 'donors_vectors_updated.csv'

# Load CSV files
df_donors = pd.read_csv(donors_rows_file)
df_vectors = pd.read_csv(donors_vectors_file)

# Prepare and normalize name columns for matching
df_vectors[['first_name', 'last_name']] = df_vectors['name'].str.split(' ', n=1, expand=True)
df_vectors['first_name'] = df_vectors['first_name'].str.strip().str.lower()
df_vectors['last_name'] = df_vectors['last_name'].str.strip().str.lower()

df_donors['first_name'] = df_donors['first_name'].astype(str).str.strip().str.lower()
df_donors['last_name'] = df_donors['last_name'].astype(str).str.strip().str.lower()

# Debug prints - inspect sample names before merge
print('Donor Vectors sample names:')
print(df_vectors[['first_name', 'last_name']].head())
print('Donors sample names:')
print(df_donors[['first_name', 'last_name']].head())

# Merge on first_name and last_name only
merged_df = pd.merge(
    df_vectors,
    df_donors[['donor_id', 'first_name', 'last_name']],
    on=['first_name', 'last_name'],
    how='left',
    indicator=True  # track merge status
)

print("Merge result counts:")
print(merged_df['_merge'].value_counts())

# Check the columns after merge and assign donor_id correctly
print("Columns after merge:", merged_df.columns.tolist())

if 'donor_id' in merged_df.columns:
    pass  # donor_id present already
elif 'donor_id_y' in merged_df.columns:
    merged_df['donor_id'] = merged_df['donor_id_y']
elif 'donor_id_x' in merged_df.columns:
    merged_df['donor_id'] = merged_df['donor_id_x']
else:
    print("ERROR: donor_id not found after merge. Columns found:", merged_df.columns.tolist())
    exit(1)

# Drop auxiliary columns and merge indicators
drop_cols = [col for col in merged_df.columns if col.endswith('_x') or col.endswith('_y') or col == '_merge' or col == 'first_name' or col == 'last_name']
merged_df.drop(columns=drop_cols, inplace=True)

# Move donor_id column to the front
cols = merged_df.columns.tolist()
cols.insert(0, cols.pop(cols.index('donor_id')))
merged_df = merged_df[cols]

# Save the updated CSV
merged_df.to_csv(output_vectors_file, index=False)
print(f"Updated donor vectors saved to '{output_vectors_file}'")
