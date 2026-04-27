import NeuralMap from "../components/NeuralMap";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 lg:p-24 bg-zinc-950 text-white">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          NeuroVault
        </h1>
        <p className="text-zinc-400 text-lg">Dijital Beynine Hoş Geldin</p>
      </div>

      <div className="w-full max-w-6xl w-full">
        <NeuralMap />
      </div>
    </main>
  );
}
