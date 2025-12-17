from fastapi import APIRouter, Request, HTTPException
import httpx
from server_fastapi.app.config.settings import settings

router = APIRouter()

@router.get("/lookalike")
async def lookalike_proxy(request: Request):
    """
    Proxies the request to the external lookalike API.
    Capture all query parameters and forward them.
    """
    try:
        # Extract query parameters from the request
        params = dict(request.query_params)
        
        print(f"Proxying lookalike request: {params}")
        print(f"Fetching from: {settings.EXTERNAL_API_URL}")

        async with httpx.AsyncClient() as client:
            # Forward the request with a timeout
            response = await client.get(settings.EXTERNAL_API_URL, params=params, timeout=30.0)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"External API returned {response.status_code}: {response.text}"
                )
            
            data = response.json()
            
            results_count = len(data) if isinstance(data, list) else 0
            print(f"Successfully fetched {results_count} results")
            
            return data

    except httpx.RequestError as e:
        print(f"Proxy network error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to external API: {str(e)}")
    except Exception as e:
        print(f"Proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
