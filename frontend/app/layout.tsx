import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CyberForge WebShield",
  description: "Defensive payload scanning dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <header className="mb-6 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-semibold">CyberForge WebShield</h1>
            <p className="text-sm text-slate-400">Defensive Web Payload Scanner</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
