from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
from . import models, crud
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi import Request

# Use models.Interaction, not db.Interaction
from .models import Interaction
from . import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECAPTCHA_SECRET = "6LfKKWcrAAAAAOO3vpyOm6Zj4etJTicqlmssmrmA"  # Replace with your actual secret key

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/interactions", response_model=list[schemas.Interaction])
def get_all_interactions(db: Session = Depends(get_db)):
    interactions = db.query(Interaction).all()
    return interactions


@app.post("/interaction", response_model=schemas.Interaction)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    return crud.create_interaction(db, interaction)

@app.get("/interaction/{interaction_id}", response_model=schemas.Interaction)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    db_interaction = crud.get_interaction(db, interaction_id)
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.patch("/interaction/{interaction_id}", response_model=schemas.Interaction)
def update_interaction(interaction_id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = crud.update_interaction(db, interaction_id, interaction)
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.get("/interaction/by-uuid/{uuid}", response_model=schemas.Interaction)
def get_interaction_by_uuid(uuid: str, db: Session = Depends(get_db)):
    db_interaction = crud.get_interaction_by_uuid(db, uuid)
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.post("/rate", response_model=schemas.Rate)
async def create_rate(rate: schemas.RateCreate, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    captcha_token = data.get("captcha")
    if not captcha_token:
        raise HTTPException(status_code=400, detail="Captcha is required")
    # Verify captcha with Google
    resp = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={
            "secret": RECAPTCHA_SECRET,
            "response": captcha_token
        }
    )
    result = resp.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail="Invalid captcha")
    return crud.create_rate(db, rate)

@app.get("/rate/{rate_id}", response_model=schemas.Rate)
def get_rate(rate_id: int, db: Session = Depends(get_db)):
    db_rate = crud.get_rate(db, rate_id)
    if not db_rate:
        raise HTTPException(status_code=404, detail="Rate not found")
    return db_rate

@app.delete("/interaction/{interaction_id}", status_code=204)
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    # Delete all rates associated with this interaction first to avoid integrity error
    db.query(models.Rate).filter(models.Rate.interaction_id == interaction_id).delete()
    db.delete(interaction)
    db.commit()
    return


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service.main:app", host="127.0.0.1", port=8000, reload=True)



