export default function Header() {
  return (
    <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
        📚 RAG on Public Domain Books
      </h1>
      <p className="text-sm text-slate-400">
        Pick books → load into FAISS → ask OpenAI about them.
      </p>
    </header>
  );
}
