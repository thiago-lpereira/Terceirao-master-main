import './globals.css';
export const metadata = { title: '3°DS — Terceirão' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}