import os
from functools import lru_cache
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    SearchBooksResponse,
    LoadBooksRequest,
    LoadBooksResponse,
    AskRequest,
    AskResponse,
)
from app.services import RAGBooksService

# 0. Env & constants
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment or .env")

# 1. FastAPI app
app = FastAPI(title="RAG Books API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; lock down in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Dependency injection for the service
@lru_cache(maxsize=1)
def get_rag_service() -> RAGBooksService:
    """
    Returns a singleton RAGBooksService instance.

    lru_cache ensures we get one shared instance across requests,
    so the in-memory vectorstore / rag_chain is reused.
    """
    return RAGBooksService()


# 3. Routes

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/books", response_model=SearchBooksResponse)
async def books(
    service: Annotated[RAGBooksService, Depends(get_rag_service)],
    search: str = "",
):
    """
    Search public domain books (Project Gutenberg via Gutendex).
    """
    books = await service.search_books(search)
    return SearchBooksResponse(books=books)


@app.post("/load_books", response_model=LoadBooksResponse)
async def load_books(
    service: Annotated[RAGBooksService, Depends(get_rag_service)],
    req: LoadBooksRequest,
):
    """
    Download selected books, chunk them, and build a FAISS vector store.
    """
    if not req.ids:
        raise HTTPException(status_code=400, detail="No book IDs provided")

    chunks, books_loaded = await service.load_books(req.ids)

    return LoadBooksResponse(
        chunks=chunks,
        books_loaded=books_loaded,
    )


@app.post("/ask", response_model=AskResponse)
async def ask(
    service: Annotated[RAGBooksService, Depends(get_rag_service)],
    req: AskRequest,
):
    """
    Ask a question about the loaded books.
    """
    answer = await service.ask(req.question)
    return AskResponse(answer=answer)
