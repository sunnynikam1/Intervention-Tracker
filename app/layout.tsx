import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Learner Intervention Tracker",
  description: "EdTech mentor workflow for tracking and resolving learner risk interventions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900">
        {children}
        <footer className="mt-auto border-t border-white/30 bg-slate-900/80 px-4 py-4 text-center text-sm text-slate-200 backdrop-blur">
          <span>Sunny Nikam</span>
          {" · "}
          <a
            className="underline text-cyan-200 hover:text-cyan-100"
            href="https://github.com/sunnynikam1/Intervention-Tracker"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {" · "}
          <a
            className="underline text-cyan-200 hover:text-cyan-100"
            href="https://www.linkedin.com/in/sunnynikam"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </footer>
      </body>
    </html>
  );
}
