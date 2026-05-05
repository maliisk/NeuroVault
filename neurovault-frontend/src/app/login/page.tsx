"use client";

import { useState } from "react";
import {
  Brain,
  Zap,
  Fingerprint,
  Network,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        let cleanToken = "";

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          cleanToken = data.token || data.accessToken || data.jwt;
        } else {
          const rawToken = await response.text();
          cleanToken = rawToken.replace(/['"\s]+/g, "");
        }

        if (!cleanToken) {
          throw new Error(
            "Token backend'den alınamadı, JSON formatını kontrol et!",
          );
        }

        localStorage.setItem("neuro_token", cleanToken);

        router.push("/");
      } else {
        alert("Sinaps bağlantısı reddedildi! Kimlik bilgileri hatalı.");
      }
    } catch (error) {
      console.error("Ağ çöküşü:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] border-dashed"></div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-black p-4 rounded-full border border-zinc-800">
              <Network className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            NeuroVault
          </h1>
          <p className="text-zinc-500 mt-2 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Bilişsel Ağa Bağlanılıyor...
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-[-100%] w-[200%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[impulse_2s_linear_infinite]"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-3 h-3 text-emerald-500" />
                Dijital Kimlik (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="nöron@sistem.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" />
                Şifreleme Anahtarı
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-3 transition-all flex items-center justify-center disabled:opacity-50"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 transition-all duration-[400ms] ease-out group-hover:w-full"></div>

              <span className="relative text-white font-medium flex items-center gap-2">
                {isLoading ? (
                  <>Ağ Bağlantısı Kuruluyor...</>
                ) : (
                  <>
                    {isLogin ? "Sinapslara Giriş Yap" : "Yeni Nöron Oluştur"}
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              {isLogin
                ? "Sistemde kaydın yok mu? Yeni ağ oluştur."
                : "Zaten bir dijital beynin var mı? Giriş yap."}
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes impulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </main>
  );
}
