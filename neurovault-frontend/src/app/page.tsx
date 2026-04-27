"use client";

import { useState } from "react";
import NeuralMap from "../components/NeuralMap";
import NoteInput from "../components/NoteInput";

export default function Home() {
  const [refreshMapKey, setRefreshMapKey] = useState(0);

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

      <div className="w-full max-w-6xl flex flex-col gap-4">
        <NoteInput onNoteAdded={handleNoteAdded} />

        <NeuralMap refreshKey={refreshMapKey} />
      </div>
    </main>
  );
}
