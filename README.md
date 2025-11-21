# RAG Books

Small full-stack demo app for doing question-answering over public-domain books from [Project Gutenberg](https://www.gutenberg.org/) (via the [Gutendex API](https://gutendex.com/)) using a simple RAG (Retrieval-Augmented Generation) pipeline.

The stack:

- **Backend**: FastAPI + LangChain + OpenAI (chat + embeddings) + FAISS in-memory vector store  
- **Frontend**: React + Vite (SPA talking to the FastAPI API)  
- **Infra**: Docker Compose (backend + frontend)

## How it works

High level flow:

1. **Search books**  
   - The backend calls **Gutendex** to search English books:  
     `GET /books?search=pride`  
   - Response includes Gutenberg IDs, titles and authors.

2. **Load selected books into RAG**  
   - The frontend sends a list of book IDs to:  
     `POST /load_books` with body:
     ```json
     { "ids": [1342, 1661] }
     ```
   - The backend:
     - Fetches full plain-text for each book from Gutendex
     - Splits text into overlapping chunks (size 500, overlap 100)
     - Embeds chunks with `text-embedding-3-small`
     - Stores embeddings in an **in-memory FAISS vector store**
     - Builds a retriever and a RAG chain with `gpt-4o-mini`

3. **Ask questions about the loaded books**  
   - The frontend calls:
     `POST /ask` with body:
     ```json
     { "question": "What is the main conflict in Pride and Prejudice?" }
     ```
   - The backend:
     - Uses the FAISS retriever to pull the most relevant chunks
     - Feeds `question` + `context` into the LLM with this prompt:
       > "You answer only using the retrieved context."
     - Returns the model’s answer.

4. **Stateless API, stateful service**  
   - FastAPI routes use a singleton `RAGBooksService` (via `@lru_cache`)  
   - The FAISS store and RAG chain live in memory for the lifetime of the process  
   - Restarting the backend clears all loaded books and chunks.

## Running the app with Docker

### 1. Prerequisites

* Docker + Docker Compose
* An **OpenAI API key**

### 2. Environment variables

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=sk-...
# Optionally, if you’re using an OpenAI-compatible provider (e.g. Open Router), you might also need:
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

### 3. Start everything

From the project root, run:

```bash
docker compose up --build
```

This will:

* Build and start the **backend** on `http://localhost:8000`
* Build and start the **frontend** on `http://localhost:5173`

### 5. Use the app

* Visit: `http://localhost:5173`
* Flow in the UI (typical):

  1. Search for books.
  2. Select and load books.
  3. Ask questions about their content.

## Limitations & notes

* **In-memory only**: FAISS index is not persisted; restart = lose loaded books.
* **English only**: Gutendex is queried with `languages=en`.
* **Context-only answers**: The LLM is instructed to answer strictly from retrieved context; if relevant text is not retrieved, answers may be incomplete.
* **OpenAI dependency**: Requires an OpenAI API key with access to `gpt-4o-mini` and `text-embedding-3-small`.

## License

MIT – do whatever you like.
