from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.models.location import Location
from app.schemas.location import LocationRead, LocationCreate, LocationUpdate
from app.core.database import get_session

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/", response_model=List[LocationRead])
def list_locations(session: Session = Depends(get_session)):
    return session.exec(select(Location)).all()

@router.get("/{location_id}", response_model=LocationRead)
def get_location(location_id: int, session: Session = Depends(get_session)):
    location = session.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.post("/", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def create_location(location: LocationCreate, session: Session = Depends(get_session)):
    db_location = Location(**location.dict())
    session.add(db_location)
    session.commit()
    session.refresh(db_location)
    return db_location

@router.put("/{location_id}", response_model=LocationRead)
def update_location(location_id: int, location: LocationUpdate, session: Session = Depends(get_session)):
    db_location = session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    location_data = location.dict(exclude_unset=True)
    for key, value in location_data.items():
        setattr(db_location, key, value)
    session.add(db_location)
    session.commit()
    session.refresh(db_location)
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, session: Session = Depends(get_session)):
    db_location = session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    session.delete(db_location)
    session.commit()
    return None 