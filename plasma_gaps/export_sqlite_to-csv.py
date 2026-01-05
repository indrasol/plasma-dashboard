import sqlite3
import pandas as pd

# Connect to SQLite database file
conn = sqlite3.connect('local_data.db')

# List your table names here
tables = ['donors', 'donor_interests', 'donor_influencer_links']

def export_table_to_csv(table_name):
    query = f"SELECT * FROM {table_name}"
    df = pd.read_sql_query(query, conn)
    csv_file = f"{table_name}.csv"
    df.to_csv(csv_file, index=False)
    print(f"Exported {table_name} to {csv_file}")

def main():
    for table in tables:
        export_table_to_csv(table)
    conn.close()

if __name__ == "__main__":
    main()
