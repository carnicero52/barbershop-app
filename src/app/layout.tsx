import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bot Admin - Soluciones Digitales",
  description: "Panel de administración para bot de Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
