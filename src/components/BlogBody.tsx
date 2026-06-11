import type { BlogBlock } from "@/data/blogPosts"

function slugifyHeading(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export default function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <article className="space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "p") {
          return (
            <p key={i} className="text-[#231645] text-base leading-relaxed">
              {b.text}
            </p>
          )
        }
        if (b.type === "h2") {
          const id = b.id ?? slugifyHeading(b.text)
          return (
            <h2 key={i} id={id} className="text-2xl md:text-3xl font-extrabold text-[#231645] mt-10 mb-2 scroll-mt-8">
              {b.text}
            </h2>
          )
        }
        if (b.type === "h3") {
          return (
            <h3 key={i} className="text-lg md:text-xl font-extrabold text-[#231645] mt-6 mb-1">
              {b.text}
            </h3>
          )
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {b.items.map((item, j) => (
                <li key={j} className="text-[#231645] text-base leading-relaxed flex gap-3">
                  <span className="text-[#7E43FF] flex-shrink-0 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (b.type === "ol") {
          return (
            <ol key={i} className="space-y-2 pl-1">
              {b.items.map((item, j) => (
                <li key={j} className="text-[#231645] text-base leading-relaxed flex gap-3">
                  <span className="text-[#7E43FF] font-bold flex-shrink-0 mt-0.5 w-6">{j + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          )
        }
        if (b.type === "quote") {
          return (
            <blockquote key={i} className="border-l-4 border-[#7E43FF] pl-5 py-1 italic text-[#615E6E]">
              <p className="text-base leading-relaxed">&ldquo;{b.text}&rdquo;</p>
              {b.cite && <cite className="text-xs not-italic font-semibold text-[#231645] mt-2 block">- {b.cite}</cite>}
            </blockquote>
          )
        }
        if (b.type === "callout") {
          const tone = b.tone === "warning"
            ? { bg: "#fef2f2", border: "#ef4444", icon: "!" }
            : { bg: "#eef2ff", border: "#7E43FF", icon: "i" }
          return (
            <aside
              key={i}
              className="rounded-2xl px-5 py-4 flex gap-4 items-start"
              style={{ background: tone.bg, border: `1px solid ${tone.border}40` }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm"
                style={{ background: tone.border }}
                aria-hidden
              >
                {tone.icon}
              </div>
              <p className="text-[#231645] text-sm leading-relaxed">{b.text}</p>
            </aside>
          )
        }
        if (b.type === "table") {
          return (
            <figure key={i} className="my-3">
              <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8f7fd] border-b border-black/[0.06]">
                      {b.headers.map((h, j) => (
                        <th
                          key={j}
                          className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-[#615E6E] whitespace-nowrap"
                          scope="col"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-black/[0.04] hover:bg-[#f8f7fd]/60">
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`px-3 py-3 align-top ${ci === 0 ? "font-semibold text-[#231645]" : "text-[#615E6E]"}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {b.caption && (
                <figcaption className="text-xs text-[#615E6E] mt-2 px-1">{b.caption}</figcaption>
              )}
            </figure>
          )
        }
        return null
      })}
    </article>
  )
}
