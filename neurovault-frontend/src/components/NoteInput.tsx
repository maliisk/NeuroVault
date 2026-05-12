"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { Send, Loader2, BrainCircuit } from "lucide-react";

export default function NoteInput({
  onNoteAdded,
}: {
  onNoteAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setPolling(true);

    try {
      const initialBrainRes = await api.get("/api/v1/query/my-brain");
      const initialCount = initialBrainRes.data.length;

      await api.post("/api/v1/data/ingest", {
        content: content,
        source: "WEB_APP",
      });

      setContent("");

      let attempts = 0;
      const maxAttempts = 15;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const checkRes = await api.get("/api/v1/query/my-brain");
          const currentCount = checkRes.data.length;

          if (currentCount > initialCount || attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setLoading(false);
            setPolling(false);
            onNoteAdded();
          }
        } catch (err) {
          console.error("Polling hatası:", err);
        }
      }, 2000);
    } catch (error) {
      console.error("Not fırlatılırken hata oluştu:", error);
      setLoading(false);
      setPolling(false);
    }
  };

  return (
    <div className="relative w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-1 shadow-lg mb-8 transition-all duration-500 overflow-hidden">
      {polling && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-[shimmer_2s_infinite] -z-10 pointer-events-none"></div>
      )}

      <div className="bg-zinc-900 p-4 rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aklındakileri buraya dök... "
            className="w-full bg-black/40 text-zinc-200 border border-zinc-800/50 rounded-lg p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-y placeholder:text-zinc-600"
            disabled={loading}
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              {polling ? (
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                  <BrainCircuit className="w-5 h-5" />
                  <span className="text-xs font-semibold tracking-widest uppercase">
                    Nöral Bağlantılar Örülüyor...
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-600 font-medium">
                  Bilişsel Motora Hazır
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all overflow-hidden relative group
                ${
                  loading
                    ? "bg-emerald-600/50 text-emerald-200 cursor-wait"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  İşleniyor
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  Beyne Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
