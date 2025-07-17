from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.models.transfer import Transfer
from app.schemas.transfer import TransferRead, TransferCreate, TransferUpdate
from app.core.database import get_session

router = APIRouter(prefix="/transfers", tags=["Transfers"])

@router.get("/", response_model=List[TransferRead])
def list_transfers(session: Session = Depends(get_session)):
    return session.exec(select(Transfer)).all()

@router.get("/{transfer_id}", response_model=TransferRead)
def get_transfer(transfer_id: int, session: Session = Depends(get_session)):
    transfer = session.get(Transfer, transfer_id)
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer

@router.post("/", response_model=TransferRead, status_code=status.HTTP_201_CREATED)
def create_transfer(transfer: TransferCreate, session: Session = Depends(get_session)):
    db_transfer = Transfer(**transfer.dict())
    session.add(db_transfer)
    session.commit()
    session.refresh(db_transfer)
    return db_transfer

@router.put("/{transfer_id}", response_model=TransferRead)
def update_transfer(transfer_id: int, transfer: TransferUpdate, session: Session = Depends(get_session)):
    db_transfer = session.get(Transfer, transfer_id)
    if not db_transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    transfer_data = transfer.dict(exclude_unset=True)
    for key, value in transfer_data.items():
        setattr(db_transfer, key, value)
    session.add(db_transfer)
    session.commit()
    session.refresh(db_transfer)
    return db_transfer

@router.delete("/{transfer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transfer(transfer_id: int, session: Session = Depends(get_session)):
    db_transfer = session.get(Transfer, transfer_id)
    if not db_transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    session.delete(db_transfer)
    session.commit()
    return None 