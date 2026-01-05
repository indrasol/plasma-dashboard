import sqlite3
import csv

DB_FILE = 'local_data.db'
EXPORT_CSV = 'donor_influencer_links_export.csv'

# Connect to the database
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Query all data from donor_influencer_links
cursor.execute("SELECT * FROM donor_influencer_links")
rows = cursor.fetchall()
columns = [desc for desc in cursor.description]

# Write to CSV
with open(EXPORT_CSV, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(columns)
    writer.writerows(rows)

print(f"Exported {len(rows)} rows from donor_influencer_links to {EXPORT_CSV}")

conn.close()
