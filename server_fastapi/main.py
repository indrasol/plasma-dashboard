import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server_fastapi.routers import users, lookalike, ai_signals
from server_fastapi.app.config.settings import settings

app = FastAPI(title="Plasma Dashboard API")

# Configure CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(users.router, prefix="/api", tags=["Users"])
# app.include_router(proxy.router, prefix="/api", tags=["Lookalike Proxy"]) # Replaced by lookalike
app.include_router(lookalike.router, prefix="/api", tags=["Lookalike"])
app.include_router(ai_signals.router, prefix="/api", tags=["AI Signals"])

@app.get("/")
async def root():
    return {"message": "Plasma Dashboard API is running (FastAPI)"}

if __name__ == "__main__":
    import uvicorn
    # Use port from settings
    print(f"🚀 Starting FastAPI server on http://localhost:{settings.PORT}")
    uvicorn.run("server_fastapi.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
