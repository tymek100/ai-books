import Header from "./components/Header";
import StatusMessage from "./components/StatusMessage";
import BookChooser from "./components/BookChooser";
import QASection from "./components/QASection";
import Footer from "./components/Footer";
import { useState } from "react";
import { useBookSearch } from "./hooks/useBookSearch";
import { useRagQA } from "./hooks/useRagQA";

export default function App() {
  const [statusMsg, setStatusMsg] = useState("");

  const {
    search,
    setSearch,
    searchResults,
    selectedIds,
    selectedBooks,
    isSearching,
    runSearch,
    toggleSelectBook,
  } = useBookSearch(setStatusMsg);

  const {
    ragReady,
    isLoadingBooks,
    question,
    setQuestion,
    isAsking,
    history,
    loadBooks,
    askQuestion,
  } = useRagQA(setStatusMsg);

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
            onLoadBooks={() => loadBooks(selectedIds)}
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
