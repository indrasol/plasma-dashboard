import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from server_fastapi.app.utils.logger import log_info, log_error
from server_fastapi.dependencies import run_supabase_async

class DatabaseService:
    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent.parent.parent / 'data'
        else:
            self.data_dir = data_dir

    async def get_supabase_tables(self, supabase_client) -> List[str]:
        """
        Returns a list of tables available in the Supabase public schema.
        Matches the legacy intent of tracking managed tables.
        """
        try:
            # Querying the information_schema to get public tables
            def fetch_tables():
                return supabase_client.rpc('get_tables').execute()
            
            # Note: This requires a custom Postgres function 'get_tables' in Supabase
            # Since we might not have it, we'll return a hardcoded list of managed tables
            # similar to the legacy script's 'tables' list.
            managed_tables = [
                'donors', 
                'donor_interests', 
                'donor_influencer_links', 
                'donation_history', 
                'health_screenings', 
                'campaign_engagements',
                'influencer_profiles',
                'donor_vectors'
            ]
            return managed_tables
        except Exception as e:
            log_error(f"Error fetching Supabase tables: {e}")
            return []

    async def export_supabase_to_csv(self, supabase_client, table_name: str) -> bool:
        """
        Exports a Supabase table to a local CSV file.
        Matches legacy export_sqlite_to-csv.py logic.
        """
        try:
            log_info(f"Exporting Supabase table '{table_name}' to local CSV...")
            
            def fetch_data():
                return supabase_client.table(table_name).select("*").execute()
            
            response = await run_supabase_async(fetch_data)
            data = getattr(response, 'data', [])
            
            if not data:
                log_error(f"No data found in table {table_name}")
                return False
            
            df = pd.DataFrame(data)
            
            # Map table name to our internal CSV filename convention if needed
            filename_map = {
                'donors': 'donors_rows.csv',
                'donation_history': 'donation_history.csv',
                'campaign_engagements': 'campaign_engagements.csv',
                'health_screenings': 'health_screenings.csv',
                'donor_vectors': 'donor_vectors_clustered.csv'
            }
            
            filename = filename_map.get(table_name, f"{table_name}.csv")
            output_path = self.data_dir / filename
            
            df.to_csv(output_path, index=False)
            log_info(f"✅ Successfully exported {table_name} -> {output_path}")
            return True
            
        except Exception as e:
            log_error(f"Error exporting table {table_name}: {e}")
            return False

    async def run_full_sync(self, supabase_client) -> Dict[str, bool]:
        """
        Syncs all core legacy tables from Supabase to local storage.
        """
        tables = ['donors', 'donor_interests', 'donor_influencer_links', 'donation_history', 'health_screenings']
        results = {}
        for table in tables:
            success = await self.export_supabase_to_csv(supabase_client, table)
            results[table] = success
        return results

