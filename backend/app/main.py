from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_auth, routes_ai
from app.db.database import Base, engine
import app.db.models  

app = FastAPI()

# ✅ CREATE TABLES
Base.metadata.create_all(bind=engine)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTES
app.include_router(routes_auth.router)
app.include_router(routes_ai.router)

@app.get("/")
def home():
    return {"message": "🚀 AI Code Reviewer Running"}