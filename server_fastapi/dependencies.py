from functools import lru_cache
from supabase import create_client, Client
from fastapi import HTTPException
from typing import Callable, List, TypeVar, Dict, Any
import inspect
import asyncio
from concurrent.futures import ThreadPoolExecutor

from server_fastapi.app.config.settings import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
from server_fastapi.app.utils.logger import log_debugger, log_error, log_info

# Type variable for database records
RecordType = TypeVar('RecordType', bound=Dict[str, Any])


thread_pool = ThreadPoolExecutor()


@lru_cache
def get_supabase_client() -> Client:
    # Validate that values exist and are not empty strings
    missing_config = []
    
    if not SUPABASE_URL or not SUPABASE_URL.strip():
        missing_config.append("SUPABASE_URL_IO")
    
    has_service_key = bool(SUPABASE_SERVICE_KEY and SUPABASE_SERVICE_KEY.strip())
    has_api_key = bool(SUPABASE_ANON_KEY and SUPABASE_ANON_KEY.strip())
    
    if not has_service_key and not has_api_key:
        missing_config.append("SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY")
    
    if missing_config:
        error_msg = f"Supabase configuration missing or empty: {', '.join(missing_config)}"
        log_error(error_msg)
        log_error(f"SUPABASE_URL present: {bool(SUPABASE_URL and SUPABASE_URL.strip())}")
        log_error(f"SUPABASE_SERVICE_KEY present: {has_service_key}")
        log_error(f"SUPABASE_ANON_KEY present: {has_api_key}")
        raise HTTPException(status_code=500, detail=error_msg)
    
    # Prefer service key over API key
    if has_service_key:
        key_to_use = SUPABASE_SERVICE_KEY.strip()
        which_key = "service"
        log_info(f"Using service key")
    else:
        key_to_use = SUPABASE_ANON_KEY.strip()
        which_key = "anon"
        log_info(f"Using anon key")
    
    try:
        log_info(f"Initializing Supabase client with {which_key} key")
        # Ensure we pass options to prevent 'proxy' error if using older lib versions or specific setups
        # But based on your recent fix, straightforward init is likely desired.
        client = create_client(SUPABASE_URL.strip(), key_to_use)
        return client
    except Exception as exc:
        error_msg = f"Failed to create Supabase client: {str(exc)}"
        log_error(error_msg)
        log_error(f"SUPABASE_URL: {SUPABASE_URL[:50] if SUPABASE_URL else 'None'}...")
        log_error(f"Key length: {len(key_to_use) if key_to_use else 0}")
        raise HTTPException(status_code=500, detail=error_msg) from exc


async def run_supabase_async(func):
    return await asyncio.get_event_loop().run_in_executor(thread_pool, func)


async def run_supabase_query(
    builder_factory: Callable[[], List[RecordType]], 
    error_message: str
) -> List[RecordType]:
    """
    Execute a blocking Supabase query in the thread pool, handling errors uniformly.
    """
    try:
        result = await run_supabase_async(builder_factory)
        return result or []
    except HTTPException:
        raise
    except Exception as exc:
        log_error(f"{error_message}: {exc}")
        raise HTTPException(status_code=500, detail=error_message) from exc
