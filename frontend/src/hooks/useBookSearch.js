// src/hooks/useBookSearch.js
import { useState } from "react";
import { searchBooks } from "../api/books";

export function useBookSearch(setStatusMsg) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setStatusMsg("");

    try {
      const data = await searchBooks(search.trim());
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

  return {
    search,
    setSearch,
    searchResults,
    selectedIds,
    selectedBooks,
    isSearching,
    runSearch,
    toggleSelectBook,
  };
}
