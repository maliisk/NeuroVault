"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { Send, Loader2 } from "lucide-react";

export default function NoteInput({
  onNoteAdded,
}: {
  onNoteAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await api.post("/api/v1/data/ingest", {
        userId: "user-999",
        content: content,
        source: "WEB_APP",
      });

      setContent("");

      setTimeout(() => {
        onNoteAdded();
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Not fırlatılırken hata oluştu:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Aklındakileri buraya dök... (Örn: Bugün Kafka'nın asenkron yapısını öğrendim)"
          className="w-full bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
          disabled={loading}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Analiz Ediliyor..." : "Beyne Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
}
