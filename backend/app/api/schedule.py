from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleRead, ScheduleCreate, ScheduleUpdate
from app.core.database import get_session

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("/", response_model=List[ScheduleRead])
def list_schedules(session: Session = Depends(get_session)):
    return session.exec(select(Schedule)).all()

@router.get("/{schedule_id}", response_model=ScheduleRead)
def get_schedule(schedule_id: int, session: Session = Depends(get_session)):
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.post("/", response_model=ScheduleRead, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule: ScheduleCreate, session: Session = Depends(get_session)):
    db_schedule = Schedule(**schedule.dict())
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return db_schedule

@router.put("/{schedule_id}", response_model=ScheduleRead)
def update_schedule(schedule_id: int, schedule: ScheduleUpdate, session: Session = Depends(get_session)):
    db_schedule = session.get(Schedule, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    schedule_data = schedule.dict(exclude_unset=True)
    for key, value in schedule_data.items():
        setattr(db_schedule, key, value)
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return db_schedule

@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, session: Session = Depends(get_session)):
    db_schedule = session.get(Schedule, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    session.delete(db_schedule)
    session.commit()
    return None 