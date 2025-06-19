from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
def create_rate(rate: schemas.RateCreate, db: Session = Depends(get_db)):
    return crud.create_rate(db, rate)

@app.get("/rate/{rate_id}", response_model=schemas.Rate)
def get_rate(rate_id: int, db: Session = Depends(get_db)):
    db_rate = crud.get_rate(db, rate_id)
    if not db_rate:
        raise HTTPException(status_code=404, detail="Rate not found")
    return db_rate

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service.main:app", host="127.0.0.1", port=8000, reload=True)
