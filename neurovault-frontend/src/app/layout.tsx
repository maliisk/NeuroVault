import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// YENİ: Context ve Bileşen importları
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// YENİ: Tarayıcı sekmesi başlığını ve açıklamasını güncelledik
export const metadata: Metadata = {
  title: "NeuroVault | Dijital İkinci Beyin",
  description: "Kişisel bilgi ve anılarınızı nöral ağlarla birbirine bağlayın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        {/* Tüm uygulamayı Kimlik (Auth) sistemiyle sarmalıyoruz */}
        <AuthProvider>
          {/* Header her sayfada en üstte sabit (fixed) duracak */}
          <Header />

          {/* Header fixed (sabit) olduğu için altındaki içeriğin üstte kalmaması adına pt-20 (padding-top) veriyoruz */}
          <div className="pt-20 flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
