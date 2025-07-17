from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.models.role import Role
from app.schemas.role import RoleRead, RoleCreate, RoleUpdate
from app.core.database import get_session

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("/", response_model=List[RoleRead])
def list_roles(session: Session = Depends(get_session)):
    return session.exec(select(Role)).all()

@router.get("/{role_id}", response_model=RoleRead)
def get_role(role_id: int, session: Session = Depends(get_session)):
    role = session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.post("/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role(role: RoleCreate, session: Session = Depends(get_session)):
    db_role = Role(**role.dict())
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role

@router.put("/{role_id}", response_model=RoleRead)
def update_role(role_id: int, role: RoleUpdate, session: Session = Depends(get_session)):
    db_role = session.get(Role, role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    role_data = role.dict(exclude_unset=True)
    for key, value in role_data.items():
        setattr(db_role, key, value)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, session: Session = Depends(get_session)):
    db_role = session.get(Role, role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    session.delete(db_role)
    session.commit()
    return None 