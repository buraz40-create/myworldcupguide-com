import Link from "next/link"

// "Plan Your Trip" landing block . gives someone who just clicked the
// nav CTA a clear 4-step path. Lives at the top of /cities/.
const STEPS = [
  {
    n: "1",
    title: "Pick the matches",
    body: "Browse all 104 matches by date, team, or stadium. Decide what you want to attend before you book anything else.",
    href: "/schedule/",
    cta: "See the schedule",
  },
  {
    n: "2",
    title: "Choose a host city",
    body: "16 cities across USA, Canada, and Mexico. Pick by your team's group-stage cities, weather, transit, or vibe.",
    href: "#cities-grid",
    cta: "Browse cities below",
  },
  {
    n: "3",
    title: "Get tickets",
    body: "Tickets sell only through FIFA's official portal in lottery rounds. Don't get scammed . here's the exact process.",
    href: "/tickets/",
    cta: "Tickets guide",
  },
  {
    n: "4",
    title: "Book your stay",
    body: "Each city page has a hotel-finder for the tournament window, plus tours and things to do on rest days.",
    href: "#cities-grid",
    cta: "Pick a city first",
  },
] as const

export default function TripPlanner() {
  return (
    <section
      aria-label="Plan your World Cup 2026 trip"
      className="max-w-6xl mx-auto px-6 mb-12"
    >
      <div
        className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f6f4ff 0%, #ede7ff 60%, #ddd0ff 100%)",
          border: "1px solid rgba(126,67,255,0.18)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">
            Plan Your Trip
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] leading-tight">
            First time? Do it in this order
          </h2>
        </div>
        <p className="text-sm text-[#615E6E] mb-6 max-w-2xl">
          A World Cup trip is bigger than a regular holiday . matches, hotels, and flights all
          sell out fast. Use this as your checklist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s) => (
            <Link
              key={s.n}
              href={s.href}
              className="group block rounded-2xl bg-white p-5 border border-black/[0.05] hover:border-[#7E43FF]/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                  style={{ background: "#7E43FF" }}
                  aria-hidden
                >
                  {s.n}
                </span>
                <h3 className="font-extrabold text-[#231645] text-sm leading-tight">{s.title}</h3>
              </div>
              <p className="text-xs text-[#615E6E] leading-relaxed mb-3">{s.body}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {s.cta}
                <span aria-hidden>→</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
