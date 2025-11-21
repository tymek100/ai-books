import React from "react";

export default function BookChooser({
  search,
  setSearch,
  isSearching,
  onSearch,
  searchResults,
  selectedIds,
  selectedBooks,
  onToggleBook,
  onLoadBooks,
  isLoadingBooks
}) {
  return (
    <section className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg shadow-slate-950/40 p-5 flex flex-col">
      <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/80 text-xs font-bold">
          1
        </span>
        Choose books to load
      </h2>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books (title, author)..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
        />
        <button
          type="submit"
          disabled={isSearching || !search.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-3 overflow-y-auto space-y-2">
        {searchResults.length === 0 && (
          <p className="text-xs text-slate-500">
            Use the search box above to find books.
          </p>
        )}

        {searchResults.map((book) => {
          const selected = selectedIds.includes(book.id);
          return (
            <button
              key={book.id}
              type="button"
              onClick={() => onToggleBook(book)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                selected
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700 bg-slate-900/80 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-50">
                    {book.title}
                  </div>
                  {book.author && (
                    <div className="text-xs text-slate-400">
                      {book.author}
                    </div>
                  )}
                </div>
                {selected && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/80 text-white">
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Selected: {selectedBooks.length}
        </span>
        <button
          type="button"
          disabled={!selectedIds.length || isLoadingBooks}
          onClick={onLoadBooks}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoadingBooks ? "Loading..." : "Load into RAG"}
        </button>
      </div>
    </section>
  );
}
