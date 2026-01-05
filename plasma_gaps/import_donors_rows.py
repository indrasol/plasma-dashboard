import sqlite3
import pandas as pd

conn = sqlite3.connect('local_data.db')

# Read CSV into pandas DataFrame
df = pd.read_csv('donors_rows.csv', dtype=str)

# Import to SQLite donors table (replace=overwrite existing, append=add) 
df.to_sql('donors', conn, if_exists='replace', index=False)
conn.close()

print(f"Imported {len(df)} rows into donors table in local_data.db.")
