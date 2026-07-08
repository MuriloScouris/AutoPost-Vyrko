import type { Metadata } from "next";
import { Toaster } from 'sonner';
import { Toaster } from 'sonner';
import Sidebar from '@/components/Sidebar';
import "./globals.css";

export const metadata: Metadata = {
  title: "Vyrko - Automação de Instagram",
  description: "Plataforma de criação e agendamento de posts usando IA para Vyrko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <Sidebar />
          {children}
        </div>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </body>
    </html>
  );
}
