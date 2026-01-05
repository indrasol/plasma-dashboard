import sqlite3
import csv

def export_table_to_csv(db_file, table_name, csv_file):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    # Get column names
    column_names = [description[0] for description in cursor.description]

    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(column_names)  # write headers
        writer.writerows(rows)         # write data

    conn.close()
    print(f"Exported {table_name} to {csv_file}")

if __name__ == "__main__":
    export_table_to_csv('local_data.db', 'donors', 'donors_with_influencer_flag.csv')
