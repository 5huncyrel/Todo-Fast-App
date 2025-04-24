from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import backend.models as models, backend.schemas as schemas
from database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend from Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173", 
    ],
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

@app.get("/todos/", response_model=list[schemas.TodoInDB])
def get_all_todos(db: Session = Depends(get_db)):
    return db.query(models.TodoApp).all()

@app.get("/todos/{todo_id}", response_model=schemas.TodoInDB)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.TodoApp).filter(models.TodoApp.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.post("/todos/", response_model=schemas.TodoInDB)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    new_todo = models.TodoApp(**todo.dict())
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@app.put("/todos/{todo_id}", response_model=schemas.TodoInDB)
def update_todo(todo_id: int, updated: schemas.TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(models.TodoApp).filter(models.TodoApp.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.title = updated.title
    todo.completed = updated.completed
    db.commit()
    db.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.TodoApp).filter(models.TodoApp.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted"}

@app.get("/todos/filter/{status}", response_model=list[schemas.TodoInDB])
def filter_todos(status: str, db: Session = Depends(get_db)):
    if status.lower() == "completed":
        return db.query(models.TodoApp).filter(models.TodoApp.completed == True).all()
    elif status.lower() == "pending":
        return db.query(models.TodoApp).filter(models.TodoApp.completed == False).all()
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
