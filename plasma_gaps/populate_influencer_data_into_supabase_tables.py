import os
from dotenv import load_dotenv

# Load explicitly from current working directory
load_dotenv(dotenv_path=os.path.join(os.getcwd(), '.env'))

print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_USER:", os.getenv("DB_USER"))

import psycopg2
import psycopg2.extras
import pandas as pd

# Load database credentials from .env file in project root
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_PORT = os.getenv("DB_PORT")

def connect_db():
    return psycopg2.connect(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )

def read_csv_to_df(csv_path):
    df = pd.read_csv(csv_path, dtype=str)
    # Replace NaN with None to avoid DB insertion errors
    df = df.where(pd.notnull(df), None)
    return df

def bulk_insert_donors(conn, df):
    tuples = [tuple(x) for x in df.to_numpy()]
    columns = ','.join(df.columns)
    insert_query = f"""
    INSERT INTO donors ({columns})
    VALUES %s
    ON CONFLICT (donor_id) DO UPDATE SET
    """ + ', '.join(f"{col} = EXCLUDED.{col}" for col in df.columns if col != "donor_id")

    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, insert_query, tuples, page_size=100)
    conn.commit()
    print(f"Bulk inserted/updated {len(tuples)} donor rows")

def main():
    conn = connect_db()
    donors_csv = "donors_rows-1.csv"  # Your CSV file path
    df_donors = read_csv_to_df(donors_csv)
    bulk_insert_donors(conn, df_donors)
    conn.close()

if __name__ == "__main__":
    main()
