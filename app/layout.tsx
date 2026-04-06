import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journey Realty Group — AI Automation Tracker",
  description:
    "34-step implementation roadmap for building an autonomous AI business operator for a NYC real estate company.",
  openGraph: {
    title: "Journey Realty Group — AI Automation Tracker",
    description: "34-step roadmap for an autonomous AI business operator.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Realty Group — AI Automation Tracker",
    description: "34-step roadmap for an autonomous AI business operator.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
