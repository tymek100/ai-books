from pydantic import BaseModel

class Book(BaseModel):
    id: int
    title: str
    authors: list[str]

class SearchBooksResponse(BaseModel):
    books: list[Book]

class LoadBooksRequest(BaseModel):
    ids: list[int]

class LoadBooksResponse(BaseModel):
    chunks: int
    books_loaded: int

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
