import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "About My World Cup Guide - Independent 2026 FIFA World Cup Visitor Guide",
  description:
    "My World Cup Guide is an independent visitor and fan guide for the 2026 FIFA World Cup. We are not affiliated with FIFA. Here's how we source data, what we won't tell you, and why.",
  keywords: ["About My World Cup Guide", "World Cup 2026 guide", "FIFA World Cup visitor guide"],
  alternates: alternatesFor(`${SITE}/about/`),
  openGraph: {
    title: "About My World Cup Guide",
    description: "Independent visitor guide for the 2026 FIFA World Cup. How we source data, what we won't tell you.",
    url: `${SITE}/about/`,
    type: "website",
  },
}

export default function AboutPage() {
  const lastUpdated = new Date("2026-04-25")
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About My World Cup Guide",
        url: `${SITE}/about/`,
      },
      {
        "@type": "Organization",
        name: "My World Cup Guide",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/logos.png` },
        description: "Independent visitor and fan guide for the 2026 FIFA World Cup.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "About", item: `${SITE}/about/` },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">About</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            About My World Cup Guide
          </h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">
            We are an independent visitor and fan guide for the 2026 FIFA World Cup across the USA, Canada, and
            Mexico. We are not affiliated with FIFA. We do not sell tickets. Our job is to make the practical
            details of attending a World Cup match - getting there, where to stay, what to bring, what to
            expect - easy to find in one place.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-3">What we publish</h2>
          <p className="text-[#615E6E] text-sm leading-relaxed mb-3">
            City guides for all 16 host cities. Stadium guides for all 16 venues. Match pages for all 104 fixtures.
            Team profiles for all 48 qualified nations. A tickets hub. A 176+ question FAQ. A blog with deeper
            visa, travel, and tournament-format guides. Everything is structured for fast lookup and
            indexed by search engines.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How we source information</h2>
          <ul className="space-y-2 mb-3">
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#7E43FF] flex-shrink-0">•</span>
              <span><span className="font-bold text-[#231645]">FIFA's official channels</span> for tickets, schedule, and tournament rules. Confirmed details only - we don&apos;t list dates or prices that haven&apos;t been published.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#7E43FF] flex-shrink-0">•</span>
              <span><span className="font-bold text-[#231645]">Stadium operators</span> (NFL/MLS/MLB venues for the 11 US stadiums) for bag policies, gate procedures, parking, and transit - established norms that are expected to apply for World Cup matches.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#7E43FF] flex-shrink-0">•</span>
              <span><span className="font-bold text-[#231645]">City tourism boards and transit agencies</span> for transport routes, neighborhoods, and visitor logistics.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#7E43FF] flex-shrink-0">•</span>
              <span><span className="font-bold text-[#231645]">Government immigration sites</span> (travel.state.gov, canada.ca, gob.mx) for visa rules.</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-3">What we won&apos;t tell you</h2>
          <ul className="space-y-2">
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#ef4444] flex-shrink-0">×</span>
              <span><span className="font-bold text-[#231645]">Specific FIFA sale dates</span> we can&apos;t confirm. If a date hasn&apos;t been announced on FIFA.com, we say &ldquo;FIFA will confirm&rdquo; rather than guess.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#ef4444] flex-shrink-0">×</span>
              <span><span className="font-bold text-[#231645]">Specific ticket prices</span> for 2026. We give 2022 reference prices and note 2026 will run higher.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#ef4444] flex-shrink-0">×</span>
              <span><span className="font-bold text-[#231645]">Resale ticket links</span> to StubHub, Vivid Seats, or any other unauthorized channel. The only legitimate secondary market is the FIFA Resale Hub.</span>
            </li>
            <li className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
              <span className="text-[#ef4444] flex-shrink-0">×</span>
              <span><span className="font-bold text-[#231645]">Insider FIFA contacts</span>, &ldquo;guaranteed&rdquo; tickets, or anything that requires going outside FIFA&apos;s official process. None of that exists.</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-3">Affiliation and independence</h2>
          <p className="text-[#615E6E] text-sm leading-relaxed">
            My World Cup Guide is independent and not affiliated with, endorsed by, or sponsored by FIFA, the
            host nations, or any official tournament partner. Trademarks (FIFA, FIFA World Cup, host city and
            stadium names) are the property of their respective owners and are used for descriptive purposes only.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-3">Corrections</h2>
          <p className="text-[#615E6E] text-sm leading-relaxed">
            If you see something that&apos;s wrong - a stadium policy that changed, a transit route that&apos;s been
            updated, a price range that&apos;s out of date - we want to know. Reach us through any of the contact
            methods on the home page or via our social channels.
          </p>
        </section>

        <section className="mb-10 card p-6">
          <p className="text-xs text-[#615E6E] mb-1">Last updated:</p>
          <p className="font-bold text-[#231645] text-sm">
            <time dateTime={lastUpdated.toISOString().slice(0, 10)}>
              {lastUpdated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </p>
        </section>

        <div className="pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
