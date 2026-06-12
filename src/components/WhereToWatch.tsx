import { getMatchBroadcasters } from "@/lib/broadcasters"

type Props = {
  matchId: string
  fixture: string  // "Mexico vs South Africa" . used for the heading
}

export default function WhereToWatch({ matchId, fixture }: Props) {
  const { countries, notes } = getMatchBroadcasters(matchId)
  return (
    <section id="where-to-watch" className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5 md:p-7 my-8 scroll-mt-8">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645]">Where to watch {fixture}</h2>
        <a
          href="/how-to-watch/"
          className="text-xs font-semibold text-[#7E43FF] hover:underline whitespace-nowrap"
        >
          All countries →
        </a>
      </div>
      <p className="text-sm text-[#615E6E] mb-5">
        Official rights-holders by country. Streaming-only services and free-to-air channels are tagged.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {countries.map((c) => {
          const note = notes[c.countryCode]
          return (
            <div key={c.countryCode} className="rounded-xl border border-black/[0.05] p-3 hover:bg-[#faf9fe] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base" aria-hidden>{c.emoji}</span>
                <span className="text-sm font-extrabold text-[#231645]">{c.countryName}</span>
                {note && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] bg-[#7E43FF]/10 rounded-full px-2 py-0.5">
                    On: {note}
                  </span>
                )}
              </div>
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {c.broadcasters.map((b, i) => (
                  <li key={i} className="text-xs">
                    {b.url ? (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-[#231645] hover:text-[#7E43FF] transition-colors"
                      >
                        {b.name}
                      </a>
                    ) : (
                      <span className="font-semibold text-[#231645]">{b.name}</span>
                    )}
                    <span className="text-[10px] text-[#615E6E] ml-1">
                      ({b.type === "stream" ? "stream" : "TV"}{b.note ? `, ${b.note}` : ""})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-[#615E6E] mt-4">
        Rights and channel assignments verified ahead of the tournament. Live channel for FOX (US English) and
        Telemundo (US Spanish) splits between primary and secondary networks per match . check the rights-holder&apos;s
        schedule on match day for the exact channel.
      </p>
    </section>
  )
}
