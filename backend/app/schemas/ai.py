from fastapi import APIRouter, Depends
from app.services.github import clone_repo
from app.services.rag import build_db, query
from app.core.security import get_user
from openai import OpenAI
from app.db.database import SessionLocal
from app.db.models import History

router = APIRouter()
client = OpenAI()

@router.post("/analyze")
def analyze(repo_url: str):
    path = clone_repo(repo_url)
    build_db(path)
    return {"status": "Repo indexed"}

@router.post("/ask")
def ask(q: str, user=Depends(get_user)):
    res = query(q)
    context = "\n".join([r.page_content for r in res])

    out = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": f"{context}\nQ:{q}"}]
    )

    ans = out.choices[0].message.content

    db = SessionLocal()
    db.add(History(user=user, repo="repo", question=q, answer=ans))
    db.commit()

    return {"answer": ans}

@router.get("/history")
def history(user=Depends(get_user)):
    db = SessionLocal()
    return db.query(History).filter(History.user == user).all()