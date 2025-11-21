import React, { useState } from "react";
import Header from "./components/Header";
import StatusMessage from "./components/StatusMessage";
import BookChooser from "./components/BookChooser";
import QASection from "./components/QASection";
import Footer from "./components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [ragReady, setRagReady] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [history, setHistory] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setStatusMsg("");

    try {
      const res = await fetch(
        `${API_URL}/books?search=${encodeURIComponent(search.trim())}`
      );
      if (!res.ok) throw new Error("Failed to search books");
      const data = await res.json();
      setSearchResults(data.books || []);
    } catch (err) {
      console.error(err);
      setStatusMsg("Error while searching books.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectBook = (book) => {
    if (selectedIds.includes(book.id)) {
      setSelectedIds((ids) => ids.filter((id) => id !== book.id));
      setSelectedBooks((books) => books.filter((b) => b.id !== book.id));
    } else {
      setSelectedIds((ids) => [...ids, book.id]);
      setSelectedBooks((books) => [...books, book]);
    }
  };

  const loadBooks = async () => {
    if (!selectedIds.length) return;

    setIsLoadingBooks(true);
    setRagReady(false);
    setStatusMsg("Loading books into vector store...");

    try {
      const res = await fetch(`${API_URL}/load_books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Failed to load books");
      }

      const data = await res.json();
      setStatusMsg(
        `Loaded ${data.books_loaded} book(s) into RAG (${data.chunks} chunks).`
      );
      setRagReady(true);
    } catch (err) {
      console.error(err);
      setStatusMsg("Error while loading books.");
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const askQuestion = async (e) => {
    e?.preventDefault();
    if (!question.trim() || !ragReady) return;

    setIsAsking(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Failed to get answer");
      }

      const data = await res.json();
      const newEntry = {
        question: question.trim(),
        answer: data.answer
      };

      setHistory((h) => [newEntry, ...h]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Error while asking the model.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <Header />

        {statusMsg && <StatusMessage message={statusMsg} />}

        <div className="grid gap-6 md:grid-cols-2">
          <BookChooser
            search={search}
            setSearch={setSearch}
            isSearching={isSearching}
            onSearch={runSearch}
            searchResults={searchResults}
            selectedIds={selectedIds}
            selectedBooks={selectedBooks}
            onToggleBook={toggleSelectBook}
            onLoadBooks={loadBooks}
            isLoadingBooks={isLoadingBooks}
          />

          <QASection
            ragReady={ragReady}
            question={question}
            setQuestion={setQuestion}
            isAsking={isAsking}
            onAsk={askQuestion}
            history={history}
          />
        </div>

        <Footer />
      </div>
    </div>
  );
}
