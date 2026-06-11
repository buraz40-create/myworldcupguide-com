import Link from "next/link"
import FactRail from "./FactRail"

export type QA = {
  question: string
  // answer can be plain string OR an array of inline parts (for embedded links)
  answer: string | (string | { text: string; href: string })[]
}

type Props = {
  pill?: string
  heading: string
  items: QA[]
  variant?: "stacked" | "compact"
}

function renderAnswer(a: QA["answer"]) {
  if (typeof a === "string") return a
  return a.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <Link key={i} href={part.href} className="text-[#7E43FF] font-semibold hover:underline">
        {part.text}
      </Link>
    )
  )
}

// Try to extract a visual "hook" from the answer to lead the card with.
// Three modes:
//   - 'number' → leading numeric stat (e.g. "16" + "cities")
//   - 'phrase' → leading proper-noun phrase (e.g. "Mexico City", "MetLife Stadium")
//   - null    → no clean hook; card uses the "Quick answer" pill instead
type Hook =
  | { kind: "number"; value: string; label: string }
  | { kind: "phrase"; value: string }
  | null

function extractHook(answer: QA["answer"]): Hook {
  const text = typeof answer === "string"
    ? answer
    : answer.map((p) => (typeof p === "string" ? p : p.text)).join("")

  // 1) Leading number: "16 cities..." / "104 matches..." / "5,300+ km..."
  const numMatch = text.match(/^([\d,]{1,7}\+?)\s+([A-Za-z]\w{0,20})/)
  if (numMatch) {
    return { kind: "number", value: numMatch[1], label: numMatch[2] }
  }

  // 2) Leading proper-noun phrase: walks tokens word-by-word so we can keep
  //    things like "AT&T Stadium" (& not a word char) or "Round of 32"
  //    (lowercase connector). Stop at the first lowercase non-connector or
  //    after 4 words. Trim trailing connectors.
  const skipFirst = new Set([
    "All", "Both", "The", "This", "These", "There",
    "Each", "Every", "Top", "Most", "Some", "Any",
  ])
  const connectors = new Set(["of", "and", "the", "&", "vs", "in"])
  const words = text.split(/\s+/)
  const out: string[] = []
  for (const raw of words) {
    if (out.length >= 3) break
    const w = raw.replace(/[.,;:!?]+$/, "")
    if (w === "") break
    const isCap = /^[A-Z]/.test(w) || /^[A-Z]/.test(w.charAt(0))
    const isConnector = connectors.has(w.toLowerCase())
    const isNumeric = /^\d/.test(w)
    if (out.length === 0) {
      if (!isCap || skipFirst.has(w)) break
      out.push(w)
    } else if (isCap || isConnector || isNumeric) {
      out.push(w)
    } else {
      break
    }
  }
  while (out.length > 0 && connectors.has(out[out.length - 1].toLowerCase())) out.pop()
  const phrase = out.join(" ")
  if (phrase.length >= 2 && phrase.length <= 26) {
    return { kind: "phrase", value: phrase }
  }

  return null
}

export default function QuickAnswers({ pill = "Quick answers", heading, items, variant = "stacked" }: Props) {
  if (variant === "compact") {
    return (
      <section className="py-8 px-6 bg-white border-y border-black/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">{pill}</p>
            <h2 className="text-base md:text-lg font-extrabold text-[#231645] leading-tight">{heading}</h2>
          </div>
          <FactRail>
            {items.map((qa) => {
              const hook = extractHook(qa.answer)
              return (
                <div
                  key={qa.question}
                  className="fact-card relative rounded-2xl bg-white border border-black/[0.06] p-5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#7E43FF]/30 transition-all duration-200 overflow-hidden flex-shrink-0 snap-start w-[280px] sm:w-[320px]"
                >
                  {/* Visual hook */}
                  {hook?.kind === "number" ? (
                    <div className="mb-3">
                      <p className="text-4xl md:text-5xl font-extrabold text-[#7E43FF] leading-none tracking-tight">
                        {hook.value}
                      </p>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">
                        {hook.label}
                      </p>
                    </div>
                  ) : hook?.kind === "phrase" ? (
                    <p className="text-xl md:text-2xl font-extrabold text-[#7E43FF] leading-tight mb-3">
                      {hook.value}
                    </p>
                  ) : (
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-3">
                      Quick answer
                    </p>
                  )}

                  {/* Question + answer */}
                  <h3 className="font-extrabold text-[#231645] text-sm mb-2 leading-snug">
                    {qa.question}
                  </h3>
                  <p className="text-[#615E6E] text-xs leading-relaxed">
                    {renderAnswer(qa.answer)}
                  </p>

                  {/* Subtle corner glow */}
                  <div
                    aria-hidden
                    className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(126,67,255,0.08) 0%, transparent 60%)" }}
                  />
                </div>
              )
            })}
          </FactRail>
        </div>
      </section>
    )
  }
  return (
    <section className="py-10 px-6 bg-white border-y border-black/[0.04]">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-3">{pill}</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#231645] mb-5 leading-tight">{heading}</h2>
        <div className="space-y-5">
          {items.map((qa) => (
            <div key={qa.question}>
              <h3 className="font-extrabold text-[#231645] text-base mb-1.5">{qa.question}</h3>
              <p className="text-[#615E6E] text-sm leading-relaxed">{renderAnswer(qa.answer)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function quickAnswersJsonLd(items: QA[]) {
  const flatten = (a: QA["answer"]): string =>
    typeof a === "string" ? a : a.map((p) => (typeof p === "string" ? p : p.text)).join("")
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: flatten(qa.answer) },
    })),
  }
}
