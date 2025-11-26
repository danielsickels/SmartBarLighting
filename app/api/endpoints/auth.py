from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest
from app.core.auth import hash_password, verify_password, create_access_token, create_refresh_token, verify_refresh_token
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return access and refresh tokens.
    """
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    
    # Create both access and refresh tokens
    access_token = create_access_token(data={"sub": db_user.username})
    refresh_token = create_refresh_token(data={"sub": db_user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(refresh_request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Use a refresh token to get a new access token and refresh token.
    """
    payload = verify_refresh_token(refresh_request.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
        )
    
    # Verify user still exists
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": username})
    new_refresh_token = create_refresh_token(data={"sub": username})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
