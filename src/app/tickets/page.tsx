import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ticketsFaqs as FAQS } from "@/data/ticketsFaqs"
import MatchTickets from "@/components/MatchTickets"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Tickets - Sale Dates, Prices & Official Buying Guide",
  description:
    "How to buy 2026 FIFA World Cup tickets - official sale phases (Visa Presale, Random Draw, First-Come-First-Served), expected ticket categories and prices, FIFA ID requirement, hospitality packages, and how to avoid fake-ticket scams.",
  keywords: [
    "World Cup 2026 tickets",
    "FIFA World Cup tickets",
    "World Cup tickets",
    "FIFA World Cup 2026 tickets",
    "World Cup tickets 2026",
    "when do World Cup tickets go on sale",
    "World Cup ticket prices",
    "World Cup final tickets",
    "how much are World Cup tickets",
    "FIFA World Cup 2026 ticket",
    "World Cup 2026 ticket sale",
    "Visa presale World Cup",
    "FIFA ID tickets",
    "World Cup hospitality",
  ],
  alternates: alternatesFor(`${SITE}/tickets/`),
  openGraph: {
    title: "World Cup 2026 Tickets - Sale Dates, Prices & Official Buying Guide",
    description:
      "Complete buying guide: sale phases, prices, FIFA ID, hospitality, and how to avoid scams.",
    url: `${SITE}/tickets/`,
    type: "website",
  },
}

const phases = [
  {
    name: "Visa Presale Draw",
    audience: "Visa cardholders only",
    timing: "Phase 1 - earliest window",
    detail:
      "Submit ticket requests for the matches you want; FIFA picks winners by lottery if demand exceeds supply. Must pay with a Visa card. Selected applicants notified by email and given a payment window.",
    tone: "first",
  },
  {
    name: "Random Selection Draw",
    audience: "Anyone with a FIFA ID",
    timing: "Phase 2 - after Visa closes",
    detail:
      "Open to all FIFA ID holders worldwide. Submit requests; lottery decides allocation. The most realistic chance to get tickets to popular matches (Final, openers, host-team games).",
    tone: "best",
  },
  {
    name: "First-Come-First-Served",
    audience: "Anyone with a FIFA ID",
    timing: "Phase 3 - after both draws",
    detail:
      "Remaining tickets go on sale in real time. Fastest applicants get them. Have your FIFA ID logged in, payment card saved, and refresh aggressively when the window opens.",
    tone: "fast",
  },
  {
    name: "Last-Minute Sales",
    audience: "Anyone with a FIFA ID",
    timing: "Phase 4 - days before each match",
    detail:
      "FIFA releases unsold or returned tickets through the FIFA app close to kickoff. Best chance for casual fans to grab a same-day ticket - usually for less popular matches.",
    tone: "last",
  },
  {
    name: "FIFA Resale Hub",
    audience: "Anyone with a FIFA ID",
    timing: "Continuous - throughout tournament",
    detail:
      "Buyers and sellers transact at FIFA-set prices (capped at face value). The only legitimate secondary market. Tickets sold outside the Resale Hub are cancelled.",
    tone: "resale",
  },
]

const phaseColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  first:  { bg: "linear-gradient(135deg,#7E43FF20,#7E43FF08)", border: "#7E43FF", text: "#7E43FF", accent: "#7E43FF" },
  best:   { bg: "linear-gradient(135deg,#10b98120,#10b98108)", border: "#10b981", text: "#10b981", accent: "#10b981" },
  fast:   { bg: "linear-gradient(135deg,#f59e0b20,#f59e0b08)", border: "#f59e0b", text: "#f59e0b", accent: "#f59e0b" },
  last:   { bg: "linear-gradient(135deg,#3b82f620,#3b82f608)", border: "#3b82f6", text: "#3b82f6", accent: "#3b82f6" },
  resale: { bg: "linear-gradient(135deg,#64748b20,#64748b08)", border: "#64748b", text: "#64748b", accent: "#64748b" },
}

const categoryTable = [
  { cat: "Category 1", tier: "Premium",       priceContext: "Best sightlines (sideline lower bowl)",       note: "Highest price tier. Available worldwide.", color: "#eab308", colorTint: "#fef3c7", label: "Top tier" },
  { cat: "Category 2", tier: "Mid-premium",   priceContext: "Sideline upper or end-zone lower",           note: "Common general-availability category.",   color: "#94a3b8", colorTint: "#f1f5f9", label: "Mid-high"  },
  { cat: "Category 3", tier: "Standard",      priceContext: "Upper-bowl end zones, corners",              note: "Most affordable general-availability tier.", color: "#c2410c", colorTint: "#ffedd5", label: "Standard"  },
  { cat: "Category 4", tier: "Resident-only", priceContext: "Restricted-view upper rows",                 note: "Reserved for residents of the host country (USA, Canada, or Mexico depending on match). Significantly cheaper.", color: "#3b82f6", colorTint: "#dbeafe", label: "Locals only" },
]

const matchDayChecklist = [
  { icon: "📱", title: "Phone fully charged", body: "Tickets are mobile-only via the FIFA app. No paper backup is accepted." },
  { icon: "🪪", title: "Government photo ID", body: "Must match the name on your FIFA ID. Stadiums spot-check at entry." },
  { icon: "👜", title: "Clear bag (max 12\"×6\"×12\")", body: "Most US stadiums enforce a clear-bag policy. No backpacks, no opaque bags." },
  { icon: "💵", title: "A little cash", body: "For tips and any cash-only vendors outside the stadium. Inside is cashless." },
  { icon: "🚫", title: "No printed QR backup", body: "FIFA enforces app-only entry. Print-outs will be refused at the gate." },
  { icon: "⏰", title: "Arrive 90 min early", body: "Security lines for World Cup matches are longer than NFL/MLS." },
]

export default function TicketsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "World Cup 2026 Tickets - Sale Dates, Prices & Official Buying Guide",
        url: `${SITE}/tickets/`,
        description: "Complete buying guide for 2026 FIFA World Cup tickets.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tickets", item: `${SITE}/tickets/` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Tickets</span>
        </nav>

        {/* ── HERO with photo backdrop ── */}
        <header className="relative overflow-hidden rounded-3xl mb-10" style={{ minHeight: "420px" }}>
          {/* Background photo */}
          <Image
            src="/images/tickets-hero.jpg"
            alt="Packed soccer stadium at night"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          {/* Dark gradient overlay so text reads */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(35,22,69,0.92) 0%, rgba(126,67,255,0.75) 50%, rgba(35,22,69,0.55) 100%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 px-6 md:px-12 py-14 md:py-20 max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="pill" style={{ background: "#fff", color: "#231645", border: "none" }}>
                Official sale via FIFA only
              </span>
              <span className="pill" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
                June 11 - July 19, 2026
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-[1.05] tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
              World Cup 2026<br />
              <span className="text-gradient-purple" style={{ filter: "brightness(1.4)" }}>Tickets Guide</span>
            </h1>
            <p className="text-white/95 text-base md:text-lg leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              The honest version. Sale phases, ticket categories, FIFA ID, hospitality, and the
              scams that target every World Cup. We are not FIFA, not a ticket seller, and never resell.
              Always buy direct at <span className="font-extrabold text-white">FIFA.com/tickets</span>.
            </p>
          </div>
        </header>

        {/* ── Quick stats strip ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: "104", label: "Matches", sub: "to choose from" },
            { value: "16", label: "Stadiums", sub: "across 3 countries" },
            { value: "5", label: "Sale phases", sub: "Visa to Last-Minute" },
            { value: "$69+", label: "Cheapest seat", sub: "(2022 ref - 2026 higher)" },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-3xl font-extrabold text-[#231645] leading-none">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mt-1.5">{s.label}</p>
              <p className="text-[10px] text-[#615E6E] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </section>

        {/* ── Affordability Index callout ── */}
        <Link
          href="/tickets/affordability/"
          className="block rounded-2xl px-6 py-5 mb-12 group transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#231645,#7E43FF)" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl backdrop-blur-sm" aria-hidden>
              📊
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-1">New · Fan Affordability Index</p>
              <p className="text-white font-extrabold text-lg leading-tight">How many months&apos; salary to follow your team?</p>
              <p className="text-white/85 text-sm leading-relaxed mt-0.5">All 48 nations ranked by the real cost of a group-stage trip, flights, tickets and hotels.</p>
            </div>
            <span className="text-white text-xl font-bold flex-shrink-0 transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </Link>

        {/* ── Critical disclaimer (more striking) ── */}
        <div className="rounded-2xl px-6 py-5 mb-12 flex gap-4 items-start" style={{ background: "linear-gradient(135deg,#fef2f2,#fff)", border: "1px solid #fecaca" }}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-extrabold text-white" style={{ background: "#ef4444" }}>
            !
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#231645] mb-1">Buy from FIFA only.</p>
            <p className="text-sm text-[#615E6E] leading-relaxed">
              Tickets sold by third parties (StubHub, Vivid Seats, eBay, social media, anyone outside the stadium)
              are typically <span className="font-bold text-[#ef4444]">cancelled before kickoff</span>. You will
              be denied entry. The only legitimate secondary market is the FIFA Resale Hub on FIFA.com.
            </p>
          </div>
        </div>

        {/* ── All-matches tracker (filterable list of every match) ── */}
        <MatchTickets />

        {/* ── Sale Phases - visual timeline ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">The Buying Path</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              When do tickets go on sale?
            </h2>
            <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
              FIFA opens sales in five sequential phases. Confirm exact dates at FIFA.com/tickets - we don&apos;t
              list dates FIFA hasn&apos;t officially confirmed.
            </p>
          </div>

          <div className="space-y-4">
            {phases.map((p, i) => {
              const c = phaseColors[p.tone]
              return (
                <div key={p.name} className="relative">
                  {/* connector line */}
                  {i < phases.length - 1 && (
                    <div
                      className="absolute left-6 top-14 bottom-[-1rem] w-px"
                      style={{ background: "linear-gradient(to bottom, " + c.border + "60, transparent)" }}
                      aria-hidden
                    />
                  )}
                  <div
                    className="rounded-2xl p-6 flex gap-5 items-start"
                    style={{ background: c.bg, border: "1px solid " + c.border + "40" }}
                  >
                    {/* numbered circle */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg"
                      style={{ background: c.accent, boxShadow: "0 4px 16px " + c.accent + "40" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                        <h3 className="font-extrabold text-[#231645] text-lg">{p.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.text }}>
                          {p.timing}
                        </span>
                      </div>
                      <p className="text-xs font-bold mb-2" style={{ color: c.text }}>For: {p.audience}</p>
                      <p className="text-[#615E6E] text-sm leading-relaxed">{p.detail}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Categories - visual tier grid ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Pricing Tiers</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              Ticket categories
            </h2>
            <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
              Four price categories per match based on view, location, and resident status. For context,
              2022 Final tickets ranged $605-$1,607. 2026 will run substantially higher.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categoryTable.map((c) => (
              <div
                key={c.cat}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: c.colorTint, border: "1px solid " + c.color + "30" }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: c.color }}
                  aria-hidden
                />
                <p className="text-[10px] font-extrabold uppercase tracking-widest mt-1 mb-1" style={{ color: c.color }}>
                  {c.label}
                </p>
                <h3 className="font-extrabold text-[#231645] text-xl leading-tight mb-0.5">{c.cat}</h3>
                <p className="text-xs font-bold text-[#615E6E] mb-3">{c.tier}</p>
                <p className="text-sm text-[#231645] mb-2 leading-snug font-medium">{c.priceContext}</p>
                <p className="text-xs text-[#615E6E] leading-relaxed">{c.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FIFA ID - 3 step flow with arrows ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Required Setup</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              FIFA ID - the gateway
            </h2>
            <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
              You cannot apply for or own a 2026 World Cup ticket without a FIFA ID. Free, takes 2 minutes,
              tied to your photo and government ID. Each attendee needs their own.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            {[
              { step: "1", title: "Create FIFA ID", body: "Go to FIFA.com - create account, verify email, upload photo and ID document. Do this NOW, before sales open." },
              { step: "2", title: "Apply in your phase", body: "Visa cardholders: Visa Presale Draw. Everyone else: Random Selection Draw. Last resort: First-Come-First-Served." },
              { step: "3", title: "Receive in FIFA app", body: "Tickets are mobile-only. Install the FIFA app, sign in with your FIFA ID, and your tickets appear there closer to match day." },
            ].map((s, i, arr) => (
              <div key={s.step} className="relative">
                <div className="card p-6 h-full">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mb-4"
                    style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
                  >
                    {s.step}
                  </div>
                  <h3 className="font-extrabold text-[#231645] text-base mb-2">{s.title}</h3>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{s.body}</p>
                </div>
                {/* connecting arrow on desktop */}
                {i < arr.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#7E43FF]/30 items-center justify-center text-[#7E43FF] font-bold z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Hospitality - tiered visual ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Premium Path</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              FIFA Hospitality packages
            </h2>
            <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
              FIFA Hospitality (operated by On Location) is the only legitimate way to bundle tickets with
              food, drinks, lounge access, and sometimes hotels. Sold separately at fifaworldcuphospitality.com.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Match-Day",      price: "$1,500-5,000",    subtitle: "Single match",        body: "Premium seat, pre-match lounge, food and drinks. Group stage matches cheapest.",                                color: "#10b981", image: "/images/960px-SoFi_Stadium_2023.jpg",                              imageAlt: "SoFi Stadium - Los Angeles" },
              { label: "Multi-Match",    price: "$5,000-15,000",   subtitle: "Follow a team",       body: "Tickets for all of a chosen team's matches. Travel between cities is your responsibility unless bundled.",     color: "#7E43FF", image: "/images/960px-Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg", imageAlt: "Mercedes-Benz Stadium - Atlanta" },
              { label: "Final",          price: "$10,000-30,000+", subtitle: "MetLife · July 19",   body: "Guaranteed access to the World Cup Final on July 19, 2026. The most expensive ticket of the tournament.",       color: "#f59e0b", image: "/images/960px-Metlife_stadium__Aerial_view_.jpg",                  imageAlt: "MetLife Stadium - hosts the Final" },
            ].map((h) => (
              <div
                key={h.label}
                className="rounded-2xl relative overflow-hidden flex flex-col"
                style={{ background: "linear-gradient(180deg,#fff," + h.color + "08)", border: "1px solid " + h.color + "30" }}
              >
                <div className="relative w-full h-32 overflow-hidden">
                  <Image src={h.image} alt={h.imageAlt} fill className="object-cover" sizes="33vw" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, ${h.color}cc 100%)` }} aria-hidden />
                  <p className="absolute bottom-2 left-3 right-3 text-white text-[10px] font-bold drop-shadow-md truncate">{h.imageAlt}</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: h.color }}>
                    {h.label}
                  </p>
                  <p className="text-xs font-bold text-[#615E6E] mb-3">{h.subtitle}</p>
                  <p className="text-3xl font-extrabold text-[#231645] mb-3 leading-none">{h.price}</p>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Resale - dramatic split ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Resale Reality</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              Two resale markets - one is safe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#10b98115,#fff)", border: "2px solid #10b981" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-lg" style={{ background: "#10b981" }}>
                  ✓
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#10b981]">SAFE</p>
              </div>
              <h3 className="font-extrabold text-[#231645] text-lg mb-3">FIFA Resale Hub</h3>
              <ul className="space-y-2">
                {[
                  "FIFA-operated, capped at face value",
                  "Ticket reissued to your FIFA ID instantly",
                  "Guaranteed entry at the gate",
                  "Open throughout the tournament",
                ].map((x) => (
                  <li key={x} className="text-[#231645] text-sm flex gap-2 leading-relaxed">
                    <span className="text-[#10b981] flex-shrink-0">✓</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#fef2f2,#fff)", border: "2px solid #ef4444" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-lg" style={{ background: "#ef4444" }}>
                  ×
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#ef4444]">UNSAFE</p>
              </div>
              <h3 className="font-extrabold text-[#231645] text-lg mb-3">StubHub, Vivid, eBay, etc.</h3>
              <ul className="space-y-2">
                {[
                  "Not authorized FIFA channels",
                  "Ticket may be cancelled before kickoff",
                  "Denied entry at the gate even if you paid",
                  "Marked-up 3-10x face value, no recourse",
                ].map((x) => (
                  <li key={x} className="text-[#231645] text-sm flex gap-2 leading-relaxed">
                    <span className="text-[#ef4444] flex-shrink-0">×</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Country buying notes - flag cards ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Where you live matters</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              Country-specific buying notes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { iso: "us", flag: "🇺🇸", country: "United States", body: "USMNT matches sell out fastest. US residents qualify for Category 4 tickets at host-country matches (significantly cheaper). Visa Presale is widely accessible since most US fans have Visa cards.", tint: "#3b82f6", image: "/images/960px-Metlife_stadium__Aerial_view_.jpg", caption: "MetLife Stadium - hosts the Final" },
              { iso: "ca", flag: "🇨🇦", country: "Canada",        body: "Canada hosts 13 matches across Toronto and Vancouver. Canada residents qualify for Cat 4 host-country tickets at Canadian-venue matches. Demand for Canada team matches will be heavy in BMO Field's small capacity.", tint: "#ef4444", image: "/images/960px-BC_Place_2015_Women_s_FIFA_World_Cup.jpg", caption: "BC Place - Vancouver" },
              { iso: "mx", flag: "🇲🇽", country: "Mexico",        body: "Mexico hosts the Opening Match (Estadio Azteca, June 11). Mexico residents qualify for Cat 4 at all 13 matches in Mexico. Domestic demand will dwarf supply - apply early in every phase.", tint: "#10b981", image: "/images/960px-Estadio_Azteca_y_sus_alrededores_46.jpg", caption: "Estadio Azteca - hosts the Opener" },
            ].map((c) => (
              <div
                key={c.country}
                className="card relative overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-36 overflow-hidden">
                  <Image src={c.image} alt={c.caption} fill className="object-cover" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" aria-hidden />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2">
                    <span className="text-2xl drop-shadow-md">{c.flag}</span>
                    <p className="text-white text-xs font-bold drop-shadow-md truncate">{c.caption}</p>
                  </div>
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: c.tint }}
                    aria-hidden
                  />
                </div>
                <div className="p-5 flex-1">
                  <h3 className="font-extrabold text-[#231645] text-base mb-2">{c.country}</h3>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[#615E6E] text-xs leading-relaxed mt-5 italic max-w-2xl mx-auto text-center">
            International visitors (anyone outside USA / Canada / Mexico) cannot buy Category 4 tickets. You can apply
            for Categories 1-3 in any phase. On Location packages include guaranteed seats at premium pricing.
          </p>
        </section>

        {/* ── Match day checklist - icon grid ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Game-time</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">
              Match day checklist
            </h2>
            <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
              Six things to have on you walking into a 2026 World Cup match. Skip any of these and you may
              be turned away at the gate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchDayChecklist.map((item) => (
              <div key={item.title} className="card p-5 flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "#f5f4fa" }}
                  aria-hidden
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#231645] text-sm leading-snug mb-1">{item.title}</p>
                  <p className="text-[#615E6E] text-xs leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Common questions</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645]">
              World Cup 2026 Tickets FAQ
            </h2>
          </div>
          <div className="space-y-2.5 max-w-3xl mx-auto">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="card p-5 group transition-all hover:border-[#7E43FF]/30"
              >
                <summary className="font-bold text-[#231645] text-sm cursor-pointer list-none flex items-start justify-between gap-3 group-open:text-[#7E43FF]">
                  <span>{f.question}</span>
                  <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-xl leading-none font-light">+</span>
                </summary>
                <p className="text-[#615E6E] text-sm leading-relaxed mt-3 pt-3 border-t border-black/[0.05]">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Related - call-to-action cards ── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Next steps</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645]">
              Plan your World Cup trip
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { href: "/schedule/", step: "Step 2", title: "Pick your matches", body: "All 104 fixtures with dates, kickoffs and venues." },
              { href: "/cities/",   step: "Step 3", title: "Plan your cities",  body: "All 16 host cities with travel, hotels, food and safety guides." },
              { href: "/stadiums/", step: "Step 4", title: "Stadium guides",    body: "Capacity, layout, and venue details for every World Cup arena." },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="card p-6 block group hover:border-[#7E43FF]/40 transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">{s.step}</p>
                <h3 className="font-extrabold text-[#231645] text-lg mb-1 group-hover:text-[#7E43FF] transition-colors">{s.title}</h3>
                <p className="text-[#615E6E] text-xs leading-relaxed mb-3">{s.body}</p>
                <span className="text-[#7E43FF] text-sm font-bold inline-flex items-center gap-1">
                  Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
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
