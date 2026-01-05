from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from server_fastapi.app.services.database_service import DatabaseService
from server_fastapi.dependencies import get_supabase_client
from supabase import Client
from pathlib import Path

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
db_service = DatabaseService(DATA_DIR)

@router.get("/database/tables")
async def list_tables(supabase: Client = Depends(get_supabase_client)):
    """
    Lists managed tables in the database.
    """
    return await db_service.get_supabase_tables(supabase)

@router.post("/database/sync")
async def sync_database(supabase: Client = Depends(get_supabase_client)):
    """
    Syncs all core tables from Supabase to local CSV storage.
    Matches the legacy export_sqlite_to-csv.py functionality.
    """
    results = await db_service.run_full_sync(supabase)
    return {"success": True, "results": results}

@router.post("/database/export/{table_name}")
async def export_table(table_name: str, supabase: Client = Depends(get_supabase_client)):
    """
    Exports a specific table to local CSV.
    """
    success = await db_service.export_supabase_to_csv(supabase, table_name)
    if success:
        return {"success": True, "message": f"Table {table_name} exported successfully."}
    raise HTTPException(status_code=500, detail=f"Failed to export table {table_name}")

