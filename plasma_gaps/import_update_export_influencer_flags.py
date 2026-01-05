import sqlite3
import pandas as pd
import csv

DB_FILE = 'local_data.db'
CSV_FILE = 'donors_rows.csv'
NEW_TABLE = 'new_donors'
EXPORT_CSV = 'new_donors.csv'

def create_new_donors_table(df, conn):
    cursor = conn.cursor()
    cursor.execute(f"DROP TABLE IF EXISTS {NEW_TABLE}")

    cols = df.columns.tolist()
    col_defs = [f"{col} TEXT" for col in cols]

    create_stmt = f"CREATE TABLE {NEW_TABLE} ({', '.join(col_defs)})"
    cursor.execute(create_stmt)
    conn.commit()

def populate_new_donors_table(df, conn):
    df.to_sql(NEW_TABLE, conn, if_exists='append', index=False)

def update_influencer_flags(conn):
    cursor = conn.cursor()

    # Update is_influencer to TRUE for donors who are influencers
    cursor.execute(f"""
        UPDATE {NEW_TABLE}
        SET is_influencer = 'TRUE'
        WHERE donor_id IN (SELECT DISTINCT influencer_id FROM donor_influencer_links)
    """)

    # Update is_influencer to FALSE for those not influencers
    cursor.execute(f"""
        UPDATE {NEW_TABLE}
        SET is_influencer = 'FALSE'
        WHERE is_influencer IS NULL
           OR is_influencer NOT IN ('TRUE', 'FALSE')
    """)

    # Set primary_influencer_id for each donor according to earliest influencer or NULL
    cursor.execute(f"""
        UPDATE {NEW_TABLE}
        SET primary_influencer_id = (
            SELECT influencer_id
            FROM donor_influencer_links
            WHERE donor_id = {NEW_TABLE}.donor_id
            ORDER BY created_at ASC
            LIMIT 1
        )
    """)
    conn.commit()

def export_new_donors(conn):
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {NEW_TABLE}")
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    with open(EXPORT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(rows)

    print(f"Exported {len(rows)} rows from {NEW_TABLE} to {EXPORT_CSV}")

if __name__ == "__main__":
    conn = sqlite3.connect(DB_FILE)
    df = pd.read_csv(CSV_FILE, dtype=str)

    create_new_donors_table(df, conn)
    populate_new_donors_table(df, conn)
    update_influencer_flags(conn)
    export_new_donors(conn)
    conn.close()
