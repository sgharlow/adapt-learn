import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PasswordGate from "@/components/PasswordGate";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AdaptLearn - Voice-First AI Learning",
  description: "Learn AI like you listen to podcasts. Personalized audio lessons that adapt to your knowledge gaps. Powered by ElevenLabs and Google Gemini.",
  keywords: ["AI learning", "voice learning", "ElevenLabs", "machine learning", "adaptive learning", "audio courses"],
  authors: [{ name: "AdaptLearn Team" }],
  openGraph: {
    title: "AdaptLearn - Voice-First AI Learning",
    description: "Learn AI like you listen to podcasts. Personalized audio lessons powered by ElevenLabs.",
    type: "website",
    locale: "en_US",
    siteName: "AdaptLearn",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdaptLearn - Voice-First AI Learning",
    description: "Learn AI like you listen to podcasts. Personalized audio lessons powered by ElevenLabs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`}
      >
        <PasswordGate>
          {children}
        </PasswordGate>
      </body>
    </html>
  );
}
