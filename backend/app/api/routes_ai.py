from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter()

# ✅ GLOBAL STORAGE
current_repo = {}

@router.post("/analyze")
def analyze(data: dict):
    global current_repo

    try:
        repo_url = data.get("repo_url")

        if not repo_url:
            raise HTTPException(status_code=400, detail="Repo URL required")

        repo_url = repo_url.strip().replace(".git", "")

        if "github.com" not in repo_url:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")

        repo_path = repo_url.split("github.com/")[-1]
        parts = repo_path.split("/")

        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")

        user = parts[0].strip()
        repo = parts[1].strip()

        api_url = f"https://api.github.com/repos/{user}/{repo}"

        token = os.getenv("GITHUB_TOKEN")

        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "MyApp"
        }

        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.get(api_url, headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Repo not found")

        repo_data = response.json()

        # ✅ STORE REPO
        current_repo = {
            "name": repo_data.get("name"),
            "description": repo_data.get("description"),
            "stars": repo_data.get("stargazers_count")
        }

        return {
            "message": "Repo analyzed successfully",
            **current_repo
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ask")
def ask(data: dict):
    global current_repo

    try:
        question = data.get("q")

        if not current_repo:
            raise HTTPException(status_code=400, detail="No repo analyzed yet")

        if not question:
            raise HTTPException(status_code=400, detail="Question required")

        # ✅ SIMPLE AI RESPONSE
        answer = f"""
Project Name: {current_repo['name']}
Description: {current_repo['description']}
Stars: {current_repo['stars']}

Answer: Based on this repository, {question} relates to this project.
"""

        return {"answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))