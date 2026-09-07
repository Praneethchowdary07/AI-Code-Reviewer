import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

db = None

def build_db(path):
    global db
    texts = []

    for root, _, files in os.walk(path):
        for f in files:
            if f.endswith(".py"):
                try:
                    texts.append(open(os.path.join(root, f), encoding="utf-8").read())
                except:
                    pass

    docs = [Document(page_content=t) for t in texts]
    db = Chroma.from_documents(docs, OpenAIEmbeddings())

def query(q):
    global db
    if not db:
        return []
    return db.similarity_search(q, k=3)