import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How My World Cup Guide earns commission on hotel and travel partner links, and what that means for you.",
  alternates: alternatesFor(`${SITE}/affiliate-disclosure/`),
  robots: { index: true, follow: true },
}

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Affiliate Disclosure</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            Affiliate Disclosure
          </h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">
            How we keep this guide free, and what it means when you click a partner link.
          </p>
        </header>

        <div className="space-y-6 text-[#231645] leading-relaxed">
          <p>
            My World Cup Guide is an independent visitor guide for the 2026 FIFA World Cup. We are not affiliated with FIFA, any host city, or any team. To keep the site free, we participate in affiliate programs run by hotel, flight, and travel-product partners.
          </p>

          <h2 className="text-2xl font-extrabold text-[#231645] mt-8 mb-2">What this means in practice</h2>
          <p>
            When you follow a link to <span className="font-bold">Booking.com</span>, <span className="font-bold">Skyscanner</span>, or another travel partner from this site and complete a booking, the partner pays us a small commission. <span className="font-bold">You pay the same price you would going directly to that partner.</span> No extra fee, no markup.
          </p>

          <h2 className="text-2xl font-extrabold text-[#231645] mt-8 mb-2">How we choose partners</h2>
          <p>
            We only feature partners we believe offer real value to fans traveling to the World Cup. Recommendations and reviews on this site are our own and are not influenced by partners. If we suggest a hotel area, neighborhood, or transit option, it is because we believe it is the right choice for that scenario - not because of commission rates.
          </p>

          <h2 className="text-2xl font-extrabold text-[#231645] mt-8 mb-2">Disclosure on every link</h2>
          <p>
            Every affiliate link on this site is marked <code className="bg-[#f8f7fd] px-1.5 py-0.5 rounded text-sm">rel=&quot;sponsored&quot;</code> for search engines, and the partner name (e.g. &quot;Powered by Booking.com&quot;) is shown next to or below the link.
          </p>

          <h2 className="text-2xl font-extrabold text-[#231645] mt-8 mb-2">Questions or concerns</h2>
          <p>
            We follow FTC guidelines on affiliate disclosure (USA) and the corresponding rules in the EU and UK. If you have any questions about how we earn from this site, or about a specific link, please <Link href="/contact/" className="text-[#7E43FF] font-bold hover:underline">contact us</Link>.
          </p>

          <p className="text-sm text-[#615E6E] mt-8">
            Last updated: April 2026
          </p>
        </div>
      </div>
    </div>
  )
}
