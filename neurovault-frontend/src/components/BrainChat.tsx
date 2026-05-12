"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function BrainChat() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "Merhaba! Ben senin dijital ikinci beyninim. Kaydettiğin bilgiler hakkında bana her şeyi sorabilirsin.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/query/ask", {
        question: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("Yapay zeka ile iletişim hatası:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Bilişsel motorla bağlantı kurulamadı. Nöral ağlarda bir sorun olabilir.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-110 transition-all group"
        >
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-[90vw] sm:w-96 h-[500px] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-sm tracking-wide">
                Dijital Beyin
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors hover:bg-white/10 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-blue-500/20 border border-blue-500/30"}`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-emerald-500/10 text-emerald-100 border border-emerald-500/20 rounded-tr-none" : "bg-zinc-900/80 text-zinc-300 border border-zinc-800 rounded-tl-none"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-xs text-zinc-500 animate-pulse">
                    Düşünüyor...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/5 bg-black/40">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Bana beynindeki bir şeyi sor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-full transition-colors"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
