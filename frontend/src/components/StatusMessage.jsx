import React from "react";

export default function StatusMessage({ message }) {
  return (
    <div className="mb-4 rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-2 text-sm text-slate-200">
      {message}
    </div>
  );
}
