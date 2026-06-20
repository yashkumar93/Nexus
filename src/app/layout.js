import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

export const metadata = {
  title: "Continuum — The Organizational Memory Engine",
  description:
    "Every conversation makes your organization permanently smarter. Real-time meeting intelligence fused with a persistent knowledge graph.",
  keywords: [
    "meeting intelligence",
    "organizational memory",
    "knowledge graph",
    "contradiction detection",
    "AI meetings",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Geist:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text-1 font-body antialiased min-h-screen bg-gradient-radial">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
