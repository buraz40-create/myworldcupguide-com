import type { StadiumGuide } from "@/data/stadiumGuides"

type Props = {
  guide: StadiumGuide
  variant: "compact" | "full"
  stadiumName?: string
}

export default function MatchDayPanel({ guide, variant, stadiumName }: Props) {
  if (variant === "compact") {
    return (
      <section className="card overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-black/[0.05]" style={{ background: "linear-gradient(135deg,#7E43FF15,#7E43FF05)" }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">
            Match-day essentials{stadiumName ? ` - ${stadiumName}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">Gates open</p>
            <p className="text-sm text-[#231645] font-semibold">{guide.gatesOpen}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">Bag policy</p>
            <p className="text-sm text-[#231645] font-semibold">{guide.bagPolicyShort}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">Tickets</p>
            <p className="text-sm text-[#615E6E] leading-relaxed">{guide.ticketDelivery}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">Cash or card</p>
            <p className="text-sm text-[#615E6E] leading-relaxed">{guide.cashOrCard}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">Best way to get there</p>
            <p className="text-sm text-[#231645] font-semibold mb-0.5">{guide.closestTransit[0]?.mode}</p>
            <p className="text-sm text-[#615E6E] leading-relaxed">{guide.closestTransit[0]?.detail}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] mb-1">When to arrive</p>
            <p className="text-sm text-[#615E6E] leading-relaxed">{guide.arrivalRecommendation}</p>
          </div>
        </div>
      </section>
    )
  }

  // Full variant - used on stadium detail pages
  return (
    <div className="space-y-8">
      {/* Gates + Bags + Cash row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Gates open</p>
          <p className="text-sm text-[#231645] font-semibold leading-snug">{guide.gatesOpen}</p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Bag policy</p>
          <p className="text-sm text-[#231645] font-semibold leading-snug">{guide.bagPolicyShort}</p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Cash or card</p>
          <p className="text-sm text-[#231645] font-semibold leading-snug">{guide.cashOrCard.split(".")[0]}</p>
        </div>
      </div>

      {/* Bag policy full */}
      <section>
        <h3 className="text-lg font-extrabold text-[#231645] mb-2">Bag policy in detail</h3>
        <p className="text-[#615E6E] text-sm leading-relaxed">{guide.bagPolicy}</p>
      </section>

      {/* Prohibited items */}
      <section>
        <h3 className="text-lg font-extrabold text-[#231645] mb-3">Prohibited items</h3>
        <div className="card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {guide.prohibitedItems.map((item) => (
              <li key={item} className="text-[#615E6E] text-sm flex gap-2">
                <span className="text-[#ef4444] flex-shrink-0">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Getting there */}
      <section>
        <h3 className="text-lg font-extrabold text-[#231645] mb-3">Getting to the stadium</h3>
        <div className="space-y-2.5">
          {guide.closestTransit.map((t) => (
            <div key={t.mode} className="card p-5">
              <p className="font-bold text-[#231645] text-sm mb-1">{t.mode}</p>
              <p className="text-[#615E6E] text-sm leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parking + Arrival + Exit */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Parking</p>
          <p className="text-2xl font-extrabold text-[#231645] mb-2 leading-none">{guide.parking.cost}</p>
          <p className="text-[#615E6E] text-xs leading-relaxed">{guide.parking.note}</p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">When to arrive</p>
          <p className="text-[#615E6E] text-sm leading-relaxed">{guide.arrivalRecommendation}</p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Post-match exit</p>
          <p className="text-[#615E6E] text-sm leading-relaxed">{guide.postMatchExit}</p>
        </div>
      </section>

      {/* Inside the stadium */}
      <section>
        <h3 className="text-lg font-extrabold text-[#231645] mb-3">Inside the stadium</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Alcohol</p>
            <p className="text-[#615E6E] text-sm leading-relaxed">{guide.alcoholPolicy}</p>
          </div>
          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Smoking</p>
            <p className="text-[#615E6E] text-sm leading-relaxed">{guide.smokingPolicy}</p>
          </div>
          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Re-entry</p>
            <p className="text-[#615E6E] text-sm leading-relaxed">{guide.reentryAllowed}</p>
          </div>
          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Tickets</p>
            <p className="text-[#615E6E] text-sm leading-relaxed">{guide.ticketDelivery}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
