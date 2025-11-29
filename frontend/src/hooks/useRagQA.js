import { useState } from "react";
import { loadBooksToRag, askRagQuestion } from "../api/books";

export function useRagQA(setStatusMsg) {
  const [ragReady, setRagReady] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [history, setHistory] = useState([]);

  const loadBooks = async (selectedIds) => {
    if (!selectedIds.length) return;

    setIsLoadingBooks(true);
    setRagReady(false);
    setStatusMsg("Loading books into vector store...");

    try {
      const data = await loadBooksToRag(selectedIds);
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
      const data = await askRagQuestion(question.trim());
      const newEntry = { question: question.trim(), answer: data.answer };
      setHistory((h) => [newEntry, ...h]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Error while asking the model.");
    } finally {
      setIsAsking(false);
    }
  };

  return {
    ragReady,
    isLoadingBooks,
    question,
    setQuestion,
    isAsking,
    history,
    loadBooks,
    askQuestion,
  };
}
