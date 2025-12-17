from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union

class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role_id: Union[str, int]
    center_id: Optional[str] = None

class CreateUserResponse(BaseModel):
    success: bool
    user_id: Optional[str] = None
    error: Optional[str] = None

