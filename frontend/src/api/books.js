const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function searchBooks(query) {
  const res = await fetch(`${API_URL}/books?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search books");
  return res.json();
}

export async function loadBooksToRag(ids) {
  const res = await fetch(`${API_URL}/load_books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || "Failed to load books");
  }
  return res.json();
}

export async function askRagQuestion(question) {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || "Failed to get answer");
  }
  return res.json();
}
