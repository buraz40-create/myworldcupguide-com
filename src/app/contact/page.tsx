import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with My World Cup Guide for corrections, partnerships, or general inquiries.",
  alternates: alternatesFor(`${SITE}/contact/`),
}

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact My World Cup Guide",
    url: `${SITE}/contact/`,
  }
  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Contact</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">Contact</h1>
        <p className="text-[#615E6E] text-lg leading-relaxed mb-10">
          We&apos;d love to hear from you - especially if you spot an error, have a city or stadium tip from
          firsthand experience, or want to suggest a topic for the blog.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <div className="card p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Editorial / Corrections</p>
            <h2 className="font-bold text-[#231645] text-base mb-2">Spot a mistake?</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              Stadium policy changed? Transit route updated? Price out of date? Email us and we&apos;ll fix it
              fast. Subject line: &ldquo;Correction: [page URL]&rdquo;.
            </p>
          </div>
          <div className="card p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Tips and Stories</p>
            <h2 className="font-bold text-[#231645] text-base mb-2">Been to a host city?</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              Tell us what was different from what we wrote, what we missed, what your favorite restaurant or
              fan-zone is. We update guides based on reader reports.
            </p>
          </div>
          <div className="card p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Partnerships</p>
            <h2 className="font-bold text-[#231645] text-base mb-2">Hotel / tour operators</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              We don&apos;t accept paid placement in editorial content. We do consider sponsored travel guides
              clearly labeled as such. Reach out for terms.
            </p>
          </div>
          <div className="card p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Press</p>
            <h2 className="font-bold text-[#231645] text-base mb-2">Media inquiries</h2>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              For interviews, statistics, or to request use of our city/stadium guides for editorial purposes.
            </p>
          </div>
        </div>

        <div className="card p-7 mb-10 text-center" style={{ background: "linear-gradient(135deg,#7E43FF15,#fff)" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Email</p>
          <p className="text-2xl font-extrabold text-[#231645] mb-2 break-all">
            <a href="mailto:hello@myworldcupguide.com" className="hover:underline">hello@myworldcupguide.com</a>
          </p>
          <p className="text-[#615E6E] text-xs leading-relaxed">
            We aim to reply within 2-3 business days. Please include your timezone and which page you&apos;re writing about.
          </p>
        </div>

        <div className="pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
