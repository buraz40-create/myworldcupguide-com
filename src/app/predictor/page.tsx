import type { Metadata } from "next"
import PredictorClient from "@/components/PredictorClient"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Predictor - Pick Your Bracket Winner",
  description:
    "Predict every match of the 2026 FIFA World Cup. Pick group standings, fill the bracket through to the Final, and see who you think will lift the trophy. Auto-pick by FIFA ranking or build your own.",
  keywords: [
    "World Cup 2026 predictor",
    "World Cup 2026 bracket",
    "World Cup 2026 simulator",
    "FIFA World Cup bracket",
    "World Cup predictor",
    "World Cup bracket builder",
    "predict World Cup winner",
  ],
  alternates: alternatesFor(`${SITE}/predictor/`),
  openGraph: {
    title: "World Cup 2026 Predictor - Pick Your Bracket Winner",
    description: "Predict every World Cup 2026 match - groups through the Final.",
    url: `${SITE}/predictor/`,
    type: "website",
    images: [{ url: `${SITE}/hero-bg.jpg`, width: 1200, height: 630, alt: "World Cup 2026 Predictor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Predictor - Pick Your Bracket Winner",
    description: "Predict every World Cup 2026 match - groups through the Final.",
    images: [`${SITE}/hero-bg.jpg`],
  },
}

export default function PredictorPage() {
  return (
    <div className="min-h-screen bg-white pt-8 pb-20 px-4">
      <div className="max-w-6xl xl:max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <a href="/" className="hover:text-[#231645] transition-colors font-medium">Home</a>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Predictor</span>
        </nav>

        <header className="text-center mb-10 max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>Predictor</span>
            <span className="pill">48 teams · 104 matches</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            World Cup 2026 Predictor
          </h1>
          <p className="text-[#615E6E] text-base md:text-lg leading-relaxed">
            Pick the finishing order in every group, then fill the bracket through to the Final.
            Your picks save automatically to your browser. Try Auto-pick to seed by FIFA ranking,
            then tweak from there.
          </p>

          {/* Printable bracket PDF download . for office pools and watch parties */}
          <a
            href="/world-cup-2026-bracket.pdf"
            download
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
          >
            📄 Download printable bracket (PDF) <span className="text-xs opacity-80">7 pages, free</span>
          </a>
          <p className="text-[11px] text-[#615E6E] mt-2">Group worksheets, R32, knockout bracket, scoring rules and leaderboard. Print for your office pool or watch party.</p>
        </header>

        <PredictorClient />
      </div>
    </div>
  )
}
