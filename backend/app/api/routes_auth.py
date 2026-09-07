from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from pydantic import BaseModel

router = APIRouter()

# ✅ Request schema
class UserCreate(BaseModel):
    username: str
    password: str

# ✅ DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🚀 SIGNUP
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    # ✅ Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    try:
        # ✅ Create new user
        new_user = models.User(
            username=user.username,
            password=user.password  # (plain text for now)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "User created successfully"}

    except Exception as e:
        print("Signup Error:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


# 🚀 LOGIN
@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):

    try:
        # ✅ Find user
        db_user = db.query(models.User).filter(models.User.username == user.username).first()

        if not db_user:
            raise HTTPException(status_code=400, detail="User not found")

        if db_user.password != user.password:
            raise HTTPException(status_code=400, detail="Invalid password")

        return {"token": "fake-jwt-token"}

    except Exception as e:
        print("Login Error:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")