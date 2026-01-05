import sqlite3

conn = sqlite3.connect('local_data.db')
cursor = conn.cursor()

# Create donors table if not exists (simplified)
cursor.execute('''
CREATE TABLE IF NOT EXISTS donors (
    donor_id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    date_of_birth TEXT,
    gender TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    blood_type TEXT,
    registration_date TEXT,
    is_influencer INTEGER DEFAULT 0,
    primary_influencer_id TEXT
)
''')

# Create donor_interests table
cursor.execute('''
CREATE TABLE IF NOT EXISTS donor_interests (
    id TEXT PRIMARY KEY,
    donor_id TEXT,
    interest_category TEXT,
    interest_name TEXT
)
''')

# Create donor_influencer_links table
cursor.execute('''
CREATE TABLE IF NOT EXISTS donor_influencer_links (
    id TEXT PRIMARY KEY,
    donor_id TEXT,
    influencer_id TEXT,
    relationship_type TEXT,
    relationship_weight INTEGER,
    interest_category TEXT,
    created_at TEXT
)
''')

conn.commit()
conn.close()
print("Tables checked/created successfully.")
