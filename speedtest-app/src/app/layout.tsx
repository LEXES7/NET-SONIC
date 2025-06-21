import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "NET SONIC - Network Speed Test",
  description: "Fast and accurate internet speed testing tool",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        {/* Add Geist font CSS links instead of using next/font */}
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased min-h-screen font-sans"
        style={{
          background: '#080808',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          color: '#f8f8f8',
          // Fix the TypeScript error by using the correct syntax
          // for custom CSS properties in TypeScript
          ["--font-geist-sans" as string]: "'Geist', sans-serif",
          ["--font-geist-mono" as string]: "'Geist Mono', monospace",
        }}
      >
        <ThemeProvider>
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Subtle glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 rounded-full blur-[100px] opacity-20"
                style={{ background: 'radial-gradient(circle, var(--theme-primary) 0%, transparent 70%)' }}>
            </div>
          </div>

          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}