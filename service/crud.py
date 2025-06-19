from sqlalchemy.orm import Session
from . import models, schemas

def create_interaction(db: Session, interaction: schemas.InteractionCreate):
    db_interaction = models.Interaction(description=interaction.description)
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def get_interaction(db: Session, interaction_id: int):
    return db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()

def get_interaction_by_uuid(db: Session, uuid: str):
    return db.query(models.Interaction).filter(models.Interaction.uuid == uuid).first()

def update_interaction(db: Session, interaction_id: int, interaction: schemas.InteractionUpdate):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()
    if not db_interaction:
        return None
    if interaction.description is not None:
        db_interaction.description = interaction.description
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def create_rate(db: Session, rate: schemas.RateCreate):
    db_rate = models.Rate(comment=rate.comment, rating=rate.rating, interaction_id=rate.interaction_id)
    db.add(db_rate)
    db.commit()
    db.refresh(db_rate)
    return db_rate

def get_rate(db: Session, rate_id: int):
    return db.query(models.Rate).filter(models.Rate.id == rate_id).first()
