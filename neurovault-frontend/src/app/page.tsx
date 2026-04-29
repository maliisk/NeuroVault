"use client";

import { useState } from "react";
import NeuralMap from "../components/NeuralMap";
import NoteInput from "../components/NoteInput";
import { BrainCircuit, Hash, X } from "lucide-react";

export default function Home() {
  const [refreshMapKey, setRefreshMapKey] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNoteAdded = () => {
    setRefreshMapKey((prev) => prev + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 lg:p-12 bg-zinc-950 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          NeuroVault
        </h1>
        <p className="text-zinc-400 text-lg">Dijital Beynine Hoş Geldin</p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4 transition-all duration-300">
          <NoteInput onNoteAdded={handleNoteAdded} />
          <NeuralMap
            refreshKey={refreshMapKey}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {selectedNode && (
          <div className="w-full lg:w-96 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl animate-in slide-in-from-right-8 relative">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold border-b border-zinc-800 pb-4 mb-4 flex items-center gap-2">
              {selectedNode.color === "#10b981" ? (
                <BrainCircuit className="text-emerald-500" />
              ) : (
                <Hash className="text-amber-500" />
              )}
              Düğüm Detayı
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  İçerik / Bağlantı Adı
                </label>
                <p className="text-zinc-200 mt-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 leading-relaxed">
                  {selectedNode.name}
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  Düğüm Türü
                </label>
                <div className="mt-1">
                  {selectedNode.color === "#10b981" && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/20">
                      Yapay Zeka Özeti
                    </span>
                  )}
                  {selectedNode.color === "#f59e0b" && (
                    <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm border border-amber-500/20">
                      Anahtar Kelime Kesişimi
                    </span>
                  )}
                  {selectedNode.color === "#3b82f6" && (
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/20">
                      Sistem Merkezi (Kök)
                    </span>
                  )}
                </div>
              </div>

              {/* YENİ EKLENEN BÖLÜM: Orijinal Hafıza Kaydı */}
              {selectedNode.originalContent && (
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                    Orijinal Hafıza Kaydı
                  </label>
                  <p className="text-zinc-300 mt-2 bg-black/50 p-4 rounded-lg border border-zinc-800/80 text-sm leading-relaxed italic shadow-inner">
                    "{selectedNode.originalContent}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
