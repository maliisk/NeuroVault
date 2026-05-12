"use client";

import { useState } from "react";
import NeuralMap from "../components/NeuralMap";
import NoteInput from "../components/NoteInput";
import BrainChat from "../components/BrainChat";
import {
  BrainCircuit,
  X,
  Search,
  Zap,
  Database,
  Network,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function Home() {
  const [refreshMapKey, setRefreshMapKey] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  const handleNoteAdded = () => {
    setRefreshMapKey((prev) => prev + 1);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm("Bu hafızayı kalıcı olarak silmek istediğinize emin misiniz?"))
      return;
    setDeletingNodeId(nodeId);
    try {
      await api.delete(`/api/v1/query/delete/${nodeId}`);
      setTimeout(() => {
        setDeletingNodeId(null);
        setSelectedNode(null);
        handleNoteAdded();
      }, 1000);
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
      alert("Hafıza silinirken bir hata oluştu.");
      setDeletingNodeId(null);
    }
  };

  const renderWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 lg:p-12 bg-zinc-950 text-white overflow-x-hidden">
      <div className="text-center mb-6 lg:mb-8 mt-16 sm:mt-0">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          NeuroVault
        </h1>
        <p className="text-zinc-400 text-sm sm:text-lg transition-all duration-300">
          {isAuthenticated
            ? `Dijital Beynine Hoş Geldin, ${user?.firstName}`
            : "Dijital Beynine Hoş Geldin"}
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 relative">
        <div className="flex-1 flex flex-col gap-4 transition-all duration-300">
          <NoteInput onNoteAdded={handleNoteAdded} />

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Sinir ağında düğüm ara... (Örn: React)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          <NeuralMap
            refreshKey={refreshMapKey}
            onNodeClick={(node) => setSelectedNode(node)}
            searchQuery={searchQuery}
            deletingNodeId={deletingNodeId}
          />
        </div>

        {selectedNode && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSelectedNode(null)}
            ></div>

            <div
              id="detail-panel"
              className="
                fixed inset-x-0 bottom-0 z-50 h-[80vh] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]
                lg:relative lg:inset-auto lg:h-auto lg:w-96 lg:rounded-xl lg:border lg:shadow-[0_0_30px_rgba(0,0,0,0.5)]
                bg-zinc-950/90 backdrop-blur-xl animate-in slide-in-from-bottom-full lg:slide-in-from-right-8 duration-300
                flex flex-col overflow-hidden
              "
            >
              <div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
                <div className="w-12 h-1.5 bg-zinc-700 rounded-full"></div>
              </div>

              <div className="p-4 lg:p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent to-white/[0.02]">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white tracking-wide text-sm sm:text-base">
                    Sinaps Detayı
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 lg:p-5 flex-1 overflow-y-auto space-y-6 pb-20 lg:pb-5">
                {(selectedNode.originalContent ||
                  selectedNode.rawText ||
                  selectedNode.content) && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                      <Database className="w-3 h-3 text-blue-400" /> Ham Veri
                    </label>
                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-zinc-200 text-sm leading-relaxed shadow-inner">
                      {renderWithLinks(
                        selectedNode.originalContent ||
                          selectedNode.rawText ||
                          selectedNode.content,
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> Nöral Çıktı (AI
                    Özeti)
                  </label>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-emerald-300 text-sm sm:text-base font-medium leading-relaxed italic">
                    {selectedNode.name}
                  </div>
                </div>

                {selectedNode.connections &&
                  selectedNode.connections.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                        <Network className="w-3 h-3 text-purple-400" />{" "}
                        Bağlantılı Sinapslar
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.connections.map(
                          (conn: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 cursor-default"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: conn.color }}
                              ></div>
                              <span className="truncate max-w-[150px] font-medium">
                                {conn.name}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {(selectedNode.isMainNode ||
                  selectedNode.originalContent ||
                  selectedNode.rawText ||
                  selectedNode.content) &&
                  selectedNode.id !== "merkez-kortex" && (
                    <div className="mt-8 pt-4 border-t border-red-500/20">
                      <button
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all font-semibold text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Bu Hafızayı Sil
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </>
        )}
      </div>

      <BrainChat />
    </main>
  );
}
