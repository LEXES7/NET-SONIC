import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{
          background: 'linear-gradient(135deg, #121212 0%, #000000 100%)',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          color: '#f8f8f8',
        }}
      >
        {/* Custom background effects */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Grid lines effect */}
          <div className="absolute inset-0" 
               style={{ 
                 background: 'radial-gradient(circle at center, rgba(252, 238, 9, 0.03) 0%, transparent 80%),\
                            repeating-linear-gradient(to right, transparent, transparent 50px, rgba(252, 238, 9, 0.03) 50px, rgba(252, 238, 9, 0.03) 51px),\
                            repeating-linear-gradient(to bottom, transparent, transparent 50px, rgba(252, 238, 9, 0.03) 50px, rgba(252, 238, 9, 0.03) 51px)'
               }}>
          </div>
          
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 rounded-full blur-[100px] opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(252, 238, 9, 0.8) 0%, transparent 70%)' }}>
          </div>
        </div>

        <div className="relative z-10">
          <Header />
          <main>
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-24 py-6 text-center text-xs text-gray-400">
            <div className="container mx-auto">
              <p>© {new Date().getFullYear()} NET SONIC. All rights reserved.</p>
              <p className="mt-2 text-gray-500">Built with Next.js</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}