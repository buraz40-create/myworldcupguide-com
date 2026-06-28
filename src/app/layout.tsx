import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import NavBar from "@/components/NavBar"
import LiveStrip from "@/components/LiveStrip"
import { alternatesFor } from "@/lib/hreflang"

const GA_ID = "G-8GGFHL22FG"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

const SITE_URL = "https://myworldcupguide.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "World Cup 2026 Guide - Cities, Stadiums, Schedule & Tickets",
    template: "%s | My World Cup Guide",
  },
  description:
    "Your complete 2026 FIFA World Cup guide: full schedule, all 16 host cities and stadiums across USA, Canada and Mexico, group draw, brackets, and ticket info.",
  keywords: [
    "World Cup 2026",
    "FIFA World Cup 2026",
    "2026 World Cup",
    "World Cup 2026 schedule",
    "World Cup 2026 tickets",
    "World Cup 2026 host cities",
    "World Cup 2026 stadiums",
    "World Cup 2026 groups",
    "World Cup 2026 bracket",
    "FIFA World Cup",
  ],
  alternates: alternatesFor(SITE_URL),
  openGraph: {
    siteName: "My World Cup Guide",
    type: "website",
    url: SITE_URL,
    title: "World Cup 2026 Guide - Cities, Stadiums, Schedule & Tickets",
    description:
      "Your complete 2026 FIFA World Cup guide: full schedule, all 16 host cities and stadiums across USA, Canada and Mexico, group draw, brackets, and ticket info.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Guide - Cities, Stadiums, Schedule & Tickets",
    description:
      "Your complete 2026 FIFA World Cup guide: full schedule, all 16 host cities and stadiums, group draw, brackets, and ticket info.",
  },
  robots: { index: true, follow: true },
}

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "My World Cup Guide",
      description:
        "Visitor and fan guide for the 2026 FIFA World Cup across the USA, Canada, and Mexico.",
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/schedule?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "My World Cup Guide",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logos.png` },
    },
    {
      "@type": "SportsEvent",
      "@id": `${SITE_URL}/#tournament`,
      name: "2026 FIFA World Cup",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      sport: "Soccer",
      organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
      location: [
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "Mexico" },
      ],
      url: SITE_URL,
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        {/* flag-icons (CC0) . provides the `fi fi-<iso2>` classes used on /kits */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
        />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
          }}
        />
        {/* Travelpayouts Drive script was removed 2026-05-27 . it was auto-injecting
            a hardcoded "Anticipating New York City?" affiliate widget on every page
            and the marker wasn't subscribed to its campaign ("marker is not subscribed
            to campaign" error on click). Affiliate commission attribution still works
            via the explicit aid=/marker= params on Booking/Hotels.com/Klook/Skyscanner
            URLs (see src/lib/affiliates.ts). Re-enable only after configuring the
            Travelpayouts dashboard so the injected widget is context-aware and the
            campaign is subscribed. */}
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1378731286940561"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ background: "#ffffff" }} className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <NavBar />
        <LiveStrip />
        <main className="flex-1">{children}</main>
        <footer className="relative z-10 border-t border-black/[0.06] pt-14 pb-8" style={{ background: "#f8f8fb" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">

              {/* Brand column */}
              <div className="col-span-2 md:col-span-4">
                <Link href="/" aria-label="My World Cup Guide - Home" className="inline-block mb-4">
                  <Image
                    src="/logos.png"
                    alt="My World Cup Guide"
                    width={1090}
                    height={380}
                    className="h-14 w-auto"
                  />
                </Link>
                <p className="text-sm text-[#615E6E] leading-relaxed mb-4 max-w-xs">
                  Independent visitor and fan guide for the 2026 FIFA World Cup across the USA, Canada, and Mexico. Not affiliated with FIFA.
                </p>
                <a
                  href="https://buymeacoffee.com/myworldcupguide"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #7E43FF 0%, #4f1ea1 100%)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                  Buy me a coffee
                </a>
                <p className="text-xs text-[#615E6E]/70">
                  © 2026 My World Cup Guide
                </p>
              </div>

              {/* Explore column */}
              <nav className="col-span-1 md:col-span-2" aria-labelledby="footer-explore">
                <h3 id="footer-explore" className="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">
                  Explore
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/cities" className="text-[#615E6E] hover:text-[#231645] transition-colors">Host Cities</Link></li>
                  <li><Link href="/stadiums" className="text-[#615E6E] hover:text-[#231645] transition-colors">Stadiums</Link></li>
                  <li><Link href="/schedule" className="text-[#615E6E] hover:text-[#231645] transition-colors">Match Schedule</Link></li>
                  <li><Link href="/round-of-32" className="text-[#615E6E] hover:text-[#231645] transition-colors">Round of 32</Link></li>
                  <li><Link href="/round-of-16" className="text-[#615E6E] hover:text-[#231645] transition-colors">Round of 16 Odds</Link></li>
                  <li><Link href="/predictor" className="text-[#615E6E] hover:text-[#231645] transition-colors">Bracket Predictor</Link></li>
                  <li><Link href="/groups" className="text-[#615E6E] hover:text-[#231645] transition-colors">Groups &amp; Bracket</Link></li>
                  <li><Link href="/kits" className="text-[#615E6E] hover:text-[#231645] transition-colors">Kits &amp; Jerseys</Link></li>
                  <li><Link href="/globe" className="text-[#615E6E] hover:text-[#231645] transition-colors">Qualified Teams</Link></li>
                </ul>
              </nav>

              {/* Plan column */}
              <nav className="col-span-1 md:col-span-2" aria-labelledby="footer-plan">
                <h3 id="footer-plan" className="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">
                  Plan Your Trip
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/tickets" className="text-[#615E6E] hover:text-[#231645] transition-colors">Tickets Guide</Link></li>
                  <li><Link href="/how-to-watch" className="text-[#615E6E] hover:text-[#231645] transition-colors">Where to Watch</Link></li>
                  <li><Link href="/blog/world-cup-2026-visa-guide" className="text-[#615E6E] hover:text-[#231645] transition-colors">Visa Guide</Link></li>
                  <li><Link href="/blog/best-airports-for-world-cup-2026" className="text-[#615E6E] hover:text-[#231645] transition-colors">Best Airports</Link></li>
                  <li><Link href="/blog/world-cup-2026-weather-guide" className="text-[#615E6E] hover:text-[#231645] transition-colors">Weather Guide</Link></li>
                  <li><Link href="/blog/world-cup-2026-currency-money-guide" className="text-[#615E6E] hover:text-[#231645] transition-colors">Money &amp; Tipping</Link></li>
                  <li><Link href="/blog/world-cup-2026-fan-zones" className="text-[#615E6E] hover:text-[#231645] transition-colors">Fan Zones</Link></li>
                </ul>
              </nav>

              {/* Resources column */}
              <nav className="col-span-1 md:col-span-2" aria-labelledby="footer-resources">
                <h3 id="footer-resources" className="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">
                  Resources
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/blog" className="text-[#615E6E] hover:text-[#231645] transition-colors">Blog</Link></li>
                  <li><Link href="/faq" className="text-[#615E6E] hover:text-[#231645] transition-colors">FAQ</Link></li>
                  <li><Link href="/about" className="text-[#615E6E] hover:text-[#231645] transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-[#615E6E] hover:text-[#231645] transition-colors">Contact</Link></li>
                </ul>
              </nav>

              {/* Save to home screen + tournament dates */}
              <div className="col-span-2 md:col-span-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">
                  Tournament
                </h3>
                <div className="rounded-xl p-4 border border-black/[0.06] bg-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Kickoff</p>
                  <p className="text-sm font-bold text-[#231645] leading-snug mb-2">June 11, 2026</p>
                  <p className="text-xs text-[#615E6E] leading-relaxed">
                    Estadio Azteca · Mexico vs South Africa
                  </p>
                </div>
                <div className="rounded-xl p-4 border border-black/[0.06] bg-white mt-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Final</p>
                  <p className="text-sm font-bold text-[#231645] leading-snug mb-2">July 19, 2026</p>
                  <p className="text-xs text-[#615E6E] leading-relaxed">
                    MetLife Stadium · NY/NJ
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom strip */}
            <div className="mt-12 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-[#615E6E]/80">
              <p>
                FIFA, FIFA World Cup, and host city/stadium names are trademarks of their respective owners. Used for descriptive purposes only.
              </p>
              <div className="flex gap-5 flex-shrink-0 flex-wrap">
                <Link href="/privacy" className="hover:text-[#231645] transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-[#231645] transition-colors">Terms</Link>
                <Link href="/affiliate-disclosure" className="hover:text-[#231645] transition-colors">Affiliate Disclosure</Link>
                <Link href="/contact" className="hover:text-[#231645] transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
