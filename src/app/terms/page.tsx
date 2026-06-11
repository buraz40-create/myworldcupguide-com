import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for My World Cup Guide. Disclaimers, accuracy, trademarks, and your responsibilities.",
  alternates: alternatesFor(`${SITE}/terms/`),
  robots: { index: true, follow: false },
}

export default function TermsPage() {
  const updated = new Date("2026-04-25")
  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Terms</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">Terms of Use</h1>
        <p className="text-[#615E6E] text-sm mb-10">
          Last updated: <time dateTime={updated.toISOString().slice(0, 10)}>{updated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
        </p>

        <article className="space-y-6 text-[#231645]">
          <section>
            <h2 className="text-2xl font-extrabold mb-2">Independence</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">My World Cup Guide is an independent visitor and fan guide. We are not affiliated with, endorsed by, or sponsored by FIFA, the host nations of the 2026 FIFA World Cup, or any official tournament partner.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Trademarks</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">FIFA, FIFA World Cup, the names of host cities and stadiums, team names, and related marks are the property of their respective owners. They are used here for descriptive and editorial purposes only.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">No tickets, no resale</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">My World Cup Guide does NOT sell tickets. We do not resell tickets. We are not a ticket marketplace. The only legitimate channels for 2026 World Cup tickets are FIFA.com/tickets, the FIFA app, and the FIFA Resale Hub. We refer readers to those channels exclusively.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Accuracy and limitations</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">We work hard to keep information accurate and up to date. Stadium policies, transit routes, prices, and FIFA-specific procedures change. Always confirm critical details (visa rules, ticket sale dates, stadium policies) on the official sources we link to. We are not liable for decisions made based on outdated or incorrect information here.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">No travel or legal advice</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">Articles on visa requirements, immigration, transport, hotels, and safety are informational. They are not legal, immigration, or financial advice. Consult qualified professionals and the relevant government authorities for your specific situation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">External links</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">We link to third-party sites including FIFA.com, government immigration portals, city tourism boards, and stadium operators. We are not responsible for the content or practices of those sites.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Limitation of liability</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">To the fullest extent permitted by law, My World Cup Guide and its operators are not liable for any direct, indirect, incidental, or consequential damages arising from your use of this site or reliance on its content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-2">Changes</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">We may update these terms from time to time. Material changes will be reflected in the &ldquo;Last updated&rdquo; date.</p>
          </section>
        </article>

        <div className="mt-10 pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
