from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.models.user import User
from app.schemas.user import UserRead, UserCreate, UserUpdate
from app.core.database import get_session
from app.core.rbac import rbac_deps

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserRead])
def list_users(
    current_user: User = Depends(rbac_deps.require_permission("users:read")),
    session: Session = Depends(get_session)
):
    return session.exec(select(User)).all()

@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    current_user: User = Depends(rbac_deps.require_permission("users:read")),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    current_user: User = Depends(rbac_deps.require_permission("users:create")),
    session: Session = Depends(get_session)
):
    from app.core.security import AuthenticationManager
    
    auth_manager = AuthenticationManager()
    
    # Hash the password
    hashed_password = auth_manager.hash_password(user.password)
    
    # Create user data without password
    user_data = user.dict(exclude={'password'})
    user_data['hashed_password'] = hashed_password
    
    db_user = User(**user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user: UserUpdate,
    current_user: User = Depends(rbac_deps.require_permission("users:update")),
    session: Session = Depends(get_session)
):
    from app.core.security import AuthenticationManager
    
    auth_manager = AuthenticationManager()
    
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user.dict(exclude_unset=True)
    
    # Handle password hashing if password is being updated
    if 'password' in user_data:
        hashed_password = auth_manager.hash_password(user_data['password'])
        user_data['hashed_password'] = hashed_password
        del user_data['password']
    
    for key, value in user_data.items():
        setattr(db_user, key, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(rbac_deps.require_permission("users:delete")),
    session: Session = Depends(get_session)
):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(db_user)
    session.commit()
    return None 