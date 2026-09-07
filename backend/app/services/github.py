from git import Repo
import os

def clone_repo(url, base="repos"):
    os.makedirs(base, exist_ok=True)
    name = url.split("/")[-1]
    path = os.path.join(base, name)

    if not os.path.exists(path):
        Repo.clone_from(url, path)

    return path