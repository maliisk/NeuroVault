"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, ShieldCheck, Save, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        "http://localhost:8081/auth/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            email: user?.email,
          },
        },
      );

      if (response.data.token) {
        const { login } = useAuth();
        login(response.data.token);
        setMessage({
          type: "success",
          text: "Profiliniz başarıyla güncellendi ve nöral ağlar senkronize edildi!",
        });

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data || "Güncelleme başarısız.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Geri Dön
        </Link>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profil Ayarları</h1>
              <p className="text-zinc-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Ad
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Soyad
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                <ShieldCheck className="w-4 h-4" /> Güvenlik ve Şifre
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Mevcut Şifre (Değişiklik İçin Gerekli)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  placeholder="Yeni şifreniz"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Değişiklikleri Kaydet
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
