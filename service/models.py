from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import uuid

class Interaction(Base):
    __tablename__ = "interaction"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String, nullable=False)
    rates = relationship("Rate", back_populates="interaction")

class Rate(Base):
    __tablename__ = "rate"
    id = Column(Integer, primary_key=True, index=True)
    comment = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)  # New field
    interaction_id = Column(Integer, ForeignKey("interaction.id"), nullable=False)
    interaction = relationship("Interaction", back_populates="rates")

# Forward reference for the Rate schema
from .schemas import Rate as RateSchema
