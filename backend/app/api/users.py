from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import MessageResponse
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.patch("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name.strip()
    
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.delete("/me", response_model=MessageResponse)
def delete_user_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Cascades to user's scans through SQLAlchemy model relationship cascade="all, delete-orphan"
    db.delete(current_user)
    db.commit()

    # Clear auth cookie
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE
    )

    return MessageResponse(message="Account and all associated scan history have been permanently deleted.")
