"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut, UserCircle, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function Header() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleAuth = async () => {
    setIsLoading(true);
    setError("");
    try {
      const endpoint = isLoginView ? "/auth/login" : "/auth/register";
      const response = await axios.post(
        `http://localhost:8081${endpoint}`,
        isLoginView
          ? { email: formData.email, password: formData.password }
          : formData,
      );

      if (response.data.token) {
        login(response.data.token);
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setError(err.response?.data || "İşlem başarısız oldu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 group">
        <Brain className="w-8 h-8 text-blue-400 group-hover:text-emerald-400 transition-colors" />
        <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          NEUROVAULT
        </span>
      </Link>

      <div className="relative">
        {isAuthenticated ? (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              <UserCircle className="w-5 h-5 text-blue-400" />
              {user?.firstName} {user?.lastName}
            </Link>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(!showAuthModal)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" /> Giriş Yap
          </button>
        )}

        {showAuthModal && (
          <div className="absolute top-12 right-0 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4">
              {isLoginView ? "Tekrar Hoş Geldin" : "Hemen Kayıt Ol"}
            </h3>

            <div className="space-y-3">
              {!isLoginView && (
                <>
                  <input
                    type="text"
                    placeholder="Ad"
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Soyad"
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </>
              )}
              <input
                type="email"
                placeholder="E-posta Adresi"
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Şifre"
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isLoginView ? (
                  "Giriş Yap"
                ) : (
                  "Hesap Oluştur"
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError("");
                }}
                className="text-xs text-zinc-500 hover:text-blue-400"
              >
                {isLoginView
                  ? "Henüz hesabın yok mu? Kayıt Ol"
                  : "Zaten üye misin? Giriş Yap"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
