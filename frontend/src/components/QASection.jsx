import React from "react";

export default function QASection({
  ragReady,
  question,
  setQuestion,
  isAsking,
  onAsk,
  history
}) {
  return (
    <section className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg shadow-slate-950/40 p-5 flex flex-col">
      <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/80 text-xs font-bold">
          2
        </span>
        Ask the AI about your books
      </h2>

      {!ragReady && (
        <p className="mb-3 text-xs text-amber-400">
          Load at least one book before asking questions.
        </p>
      )}

      <form onSubmit={onAsk} className="mb-4 flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            ragReady
              ? "Ask something about your loaded books..."
              : "Load some books first, then ask your question..."
          }
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Answers are constrained to the retrieved book context.
          </span>
          <button
            type="submit"
            disabled={!ragReady || isAsking || !question.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAsking ? "Thinking..." : "Ask"}
          </button>
        </div>
      </form>

      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-3 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-xs text-slate-500">
            Once you ask a question, the conversation will appear here.
          </p>
        )}
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 text-sm text-slate-50 px-3 py-2">
                  {item.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-800 text-sm text-slate-100 px-3 py-2 whitespace-pre-wrap">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
