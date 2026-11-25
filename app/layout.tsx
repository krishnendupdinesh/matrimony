import type { Metadata } from "next";
import { Gloock, Jost } from "next/font/google";
import "./globals.css";

// Merisca (your chosen font) is loaded in globals.css from /public/fonts.
// Gloock is only a stand-in that shows until you add the Merisca file.
const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gloock",
});

// Jost is a clean sans that sits well next to a condensed serif.
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Sammatham | Matrimony for Kerala families",
  description:
    "Verified profiles, horoscope matching and real people to help. Find a match your whole family will love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gloock.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}