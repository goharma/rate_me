from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InteractionBase(BaseModel):
    description: str

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    description: Optional[str] = None

class Interaction(InteractionBase):
    id: int
    uuid: str
    date: datetime
    rates: list["Rate"] = []

    class Config:
        orm_mode = True

class RateBase(BaseModel):
    comment: Optional[str] = None
    rating: int  # New field
    interaction_id: int

class RateCreate(RateBase):
    pass

class Rate(RateBase):
    id: int

    class Config:
        orm_mode = True
        orm_mode = True



Interaction.update_forward_refs()