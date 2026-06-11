import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How My World Cup Guide handles your data: cookies, analytics, third parties, and your rights.",
  alternates: alternatesFor(`${SITE}/privacy/`),
  robots: { index: true, follow: false },
}

export default function PrivacyPage() {
  const updated = new Date("2026-04-29")
  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Privacy</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">Privacy Policy</h1>
        <p className="text-[#615E6E] text-sm mb-10">
          Last updated: <time dateTime={updated.toISOString().slice(0, 10)}>{updated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
        </p>

        <article className="space-y-6 text-[#231645]">
          <section>
            <h2 className="text-2xl font-extrabold mb-2">Who we are</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">My World Cup Guide is an independent visitor and fan guide for the 2026 FIFA World Cup, operated at <Link href="/" className="text-[#7E43FF] hover:underline">myworldcupguide.com</Link>. We are not affiliated with FIFA. Contact: see the <Link href="/contact/" className="text-[#7E43FF] hover:underline">contact page</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">What data we collect</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">My World Cup Guide is a static informational site. We do not require accounts, do not collect personal information through forms (we have no forms), and do not store any user-submitted data. Standard server logs may record IP addresses for security and traffic analysis purposes; these are kept for no longer than 30 days and are not associated with any personally-identifying information we hold.</p>
            <p className="text-[#615E6E] text-sm leading-relaxed mt-3">The browser-based predictor at <Link href="/predictor/" className="text-[#7E43FF] hover:underline">/predictor/</Link> stores your bracket picks in your own browser&apos;s localStorage. This data never leaves your device and is never transmitted to us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Analytics &amp; advertising</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed mb-3">We use the following third-party services. Each may set cookies or use similar technologies on your device:</p>
            <ul className="space-y-3 text-[#615E6E] text-sm leading-relaxed">
              <li>
                <span className="font-bold text-[#231645]">Google Analytics 4</span> . measures aggregate site usage (page views, referrers, country, browser type). Property ID: <code className="bg-[#f8f7fd] px-1.5 py-0.5 rounded text-xs">G-8GGFHL22FG</code>. IP addresses are anonymised by Google. You can opt out using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </li>
              <li>
                <span className="font-bold text-[#231645]">Google AdSense</span> . serves contextual advertising to support the site. AdSense and its partners may use cookies to serve ads based on your prior visits to this and other websites. You can manage personalised ad preferences at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] hover:underline">Google Ad Settings</a> or opt out of personalised advertising at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] hover:underline">aboutads.info/choices</a>.
              </li>
              <li>
                <span className="font-bold text-[#231645]">Travelpayouts Drive</span> . first-party affiliate-tracking script that records when you click an outbound hotel, flight or tour link from this site so the partner can attribute the resulting sale to us. The script does not collect personal data on its own.
              </li>
            </ul>
            <p className="text-[#615E6E] text-sm leading-relaxed mt-3">If you are in the EU, UK, or California, you have the right to request access, deletion, or correction of any personal data we hold. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Affiliate links</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">When you click a hotel, flight, or tour link from this site (e.g. to Booking.com, Hotels.com, or Klook) and make a purchase, we may earn a commission at no extra cost to you. These partners may set their own cookies on your device when you reach their site. See our <Link href="/affiliate-disclosure/" className="text-[#7E43FF] hover:underline">Affiliate Disclosure</Link> for details on which partners we work with and how attribution works.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Third-party content</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">Pages may include images sourced from Wikimedia Commons (under Creative Commons licensing), country flags from flagcdn.com, official FIFA stadium seat plans (used for editorial reference), and embedded Google Maps. These are loaded by your browser from those services and may be subject to their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">External links</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">We link to external sites including FIFA.com, government immigration sites, city tourism boards, and our affiliate partners (Booking.com, Hotels.com, Klook, and others). We are not responsible for their privacy practices.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Children&apos;s privacy</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">My World Cup Guide is not directed at children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Changes</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">We may update this policy from time to time. Material changes will be reflected in the &ldquo;Last updated&rdquo; date at the top of this page.</p>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
