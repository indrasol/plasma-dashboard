from fastapi import APIRouter, HTTPException, Depends
from server_fastapi.schemas import CreateUserRequest, CreateUserResponse
from server_fastapi.dependencies import get_supabase_client, run_supabase_async
from server_fastapi.app.utils.logger import log_info, log_error
from supabase import Client

router = APIRouter()

@router.post("/create-user", response_model=CreateUserResponse)
async def create_user(
    user_data: CreateUserRequest, 
    supabase: Client = Depends(get_supabase_client)
):
    log_info(f"POST /api/create-user {user_data.email}")

    try:
        # Step 1: Create Supabase Auth User
        attributes = {
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True
        }
        
        # Execute blocking auth call in thread pool
        def create_auth_user():
            return supabase.auth.admin.create_user(attributes)
            
        auth_response = await run_supabase_async(create_auth_user)
        
        user = getattr(auth_response, 'user', None)
        
        if not user:
             if hasattr(auth_response, 'id'):
                 user = auth_response
             else:
                log_error(f"Supabase Auth Error: {auth_response}")
                raise HTTPException(status_code=400, detail="Failed to create auth user")

        user_id = user.id

        # Step 2: Insert into users table
        insert_payload = {
            "id": user_id,
            "full_name": user_data.full_name.strip(),
            "email": user_data.email.strip().lower(),
            "role_id": int(user_data.role_id),
            "center_id": user_data.center_id
        }

        # Execute blocking DB insert in thread pool
        def insert_db_user():
            return supabase.table('users').insert(insert_payload).execute()

        await run_supabase_async(insert_db_user)
        
        log_info(f"User created with ID {user_id}")
        return CreateUserResponse(success=True, user_id=user_id)

    except Exception as e:
        log_error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
