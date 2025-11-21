import os
from typing import List

import httpx
from fastapi import HTTPException
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate

from app.schemas import Book


GUTENDEX_BASE_URL = "https://gutendex.com/books/"


class RAGBooksService:
    """
    Encapsulates all RAG logic + Gutendex integration.
    Keeps in-memory state (vectorstore / retriever / rag_chain).
    """

    def __init__(self) -> None:
        # Ensure key is present (optional – you already validate in main, but this is extra safety)
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError("OPENAI_API_KEY not set in environment or .env")

        # Single shared LLM & prompt
        self._llm = ChatOpenAI(model="gpt-4o-mini")
        self._prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "You answer only using the retrieved context."),
                ("human", "Question: {question}\n\nContext:\n{context}"),
            ]
        )

        # RAG state
        self._vectorstore: FAISS | None = None
        self._retriever = None
        self._rag_chain = None

    # ------------- Public API used by routes -------------

    async def search_books(self, search: str = "") -> List[Book]:
        params = {"languages": "en"}
        if search:
            params["search"] = search

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(GUTENDEX_BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("results", [])
        books: list[Book] = []
        for b in results:
            authors = [a["name"] for a in b.get("authors", [])]
            books.append(Book(id=b["id"], title=b["title"], authors=authors))

        return books

    async def load_books(self, ids: List[int]) -> tuple[int, int]:
        """
        Download selected books, chunk them, and build a FAISS vector store.

        Returns:
            (chunk_count, books_loaded)
        """
        texts: list[str] = []
        sources: list[str] = []

        for book_id in ids:
            text = await self._fetch_book_text(book_id)
            texts.append(text)
            sources.append(f"gutenberg_{book_id}")

        chunk_count = self._build_rag_chain_from_texts(texts, sources)
        return chunk_count, len(ids)

    async def ask(self, question: str) -> str:
        """Ask a question about the loaded books."""
        if self._rag_chain is None:
            raise HTTPException(
                status_code=400,
                detail="No books loaded yet. Load some books first.",
            )

        result = await self._rag_chain.ainvoke(question)
        return result.content # type:ignore

    # ------------- Internal helpers -------------

    async def _fetch_book_text(self, book_id: int) -> str:
        """Fetch full text for a Gutenberg book via Gutendex."""
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            # Get metadata
            resp = await client.get(f"{GUTENDEX_BASE_URL}{book_id}/")
            resp.raise_for_status()
            data = resp.json()

            formats = data.get("formats", {})
            text_url = self._pick_plain_text_url(formats)
            if not text_url:
                raise HTTPException(
                    status_code=400,
                    detail=f"No suitable plain-text format found for book {book_id}",
                )

            text_resp = await client.get(text_url)
            text_resp.raise_for_status()
            return text_resp.text

    @staticmethod
    def _pick_plain_text_url(formats: dict) -> str | None:
        """
        Choose a good plain-text URL from Gutendex formats.
        Prefer UTF-8, avoid zips.
        """
        # Best: utf-8 plain text
        for mime, url in formats.items():
            if "text/plain" in mime and "utf-8" in mime and "zip" not in mime:
                return url

        # Fallback: any plain text that's not zip
        for mime, url in formats.items():
            if "text/plain" in mime and "zip" not in mime:
                return url

        return None

    def _build_rag_chain_from_texts(self, texts: list[str], sources: list[str]) -> int:
        """Create FAISS retriever & RAG chain from raw texts and store on the service."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
        )

        all_texts: list[str] = []
        metadatas: list[dict] = []

        for text, source in zip(texts, sources):
            chunks = splitter.split_text(text)
            all_texts.extend(chunks)
            metadatas.extend([{"source": source}] * len(chunks))

        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self._vectorstore = FAISS.from_texts(
            all_texts,
            embeddings,
            metadatas=metadatas,
        )
        self._retriever = self._vectorstore.as_retriever(search_kwargs={"k": 4})

        def format_docs(docs):
            return "\n\n".join(d.page_content for d in docs)

        self._rag_chain = (
            {
                "context": self._retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough(),
            }
            | self._prompt
            | self._llm
        )

        return len(all_texts)
