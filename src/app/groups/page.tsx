import type { Metadata } from "next"
import Link from "next/link"
import GroupsClient from "@/components/GroupsClient"
import { groups } from "@/data/groups"
import { teams } from "@/data/teams"
import { quickAnswersJsonLd, type QA } from "@/components/QuickAnswers"
import { alternatesFor } from "@/lib/hreflang"

const GROUPS_QA: QA[] = [
  { question: "How many groups are at the 2026 World Cup?", answer: "12 groups (A through L), 4 teams each = 48 teams. The 2026 World Cup is the first to use a 12-group format. Top 2 from each group plus the 8 best third-placed teams advance to the new Round of 32." },
  { question: "Which group has the host nations?", answer: "Mexico is in Group A; United States is in Group D; Canada is in Group B. As hosts, all three were placed in different groups by FIFA's seeded draw." },
  { question: "What is the toughest group at the 2026 World Cup?", answer: "Group rankings are subjective, but groups with multiple top-15 FIFA-ranked teams are commonly called 'groups of death'. Check each group page for full FIFA rankings and team profiles." },
  { question: "How do teams advance from the group stage?", answer: "Top two teams from each group automatically qualify for the Round of 32. Additionally, the 8 best third-placed teams across all 12 groups also advance - 32 teams total into the knockout rounds." },
]

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Groups & Bracket - All 12 Groups, 48 Teams",
  description:
    "World Cup 2026 group draw and full bracket. Every team in Groups A through L, FIFA rankings, fixtures, and standings projections for the 48-team 2026 FIFA World Cup.",
  keywords: [
    "World Cup 2026 groups",
    "World Cup groups",
    "World Cup 2026 bracket",
    "FIFA World Cup brackets",
    "World Cup bracket",
    "World Cup 2026 draw",
    "World Cup draw 2026",
    "World Cup standings",
    "FIFA World Cup standings",
  ],
  alternates: alternatesFor(`${SITE}/groups`),
  openGraph: {
    title: "World Cup 2026 Groups & Bracket - All 12 Groups, 48 Teams",
    description:
      "Every team in Groups A through L of the 2026 FIFA World Cup. Full draw and bracket.",
    url: `${SITE}/groups`,
    type: "website",
  },
}

const groupsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIFA World Cup 2026 Group Stage Draw",
  description: "All 12 groups (A-L) of the 2026 FIFA World Cup, with 48 qualified teams.",
  numberOfItems: teams.length,
  itemListElement: groups.flatMap((g) =>
    g.teams.map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `Group ${g.letter}: ${t.name}`,
    }))
  ),
}

export default function GroupsPage() {
  const faqJsonLd = quickAnswersJsonLd(GROUPS_QA)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(groupsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <GroupsClient quickAnswers={GROUPS_QA} />
      {/* Server-rendered deep links so Google's crawler discovers each group hub. */}
      <nav aria-label="Group hubs" className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-extrabold text-[#231645] mb-3">Open a group hub</h2>
        <p className="text-sm text-[#615E6E] mb-4">Each group has its own page with fixtures, live market projections, team cards and bracket path.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {groups.map((g) => (
            <Link key={g.letter} href={`/groups/${g.letter.toLowerCase()}/`} className="card p-3 hover:-translate-y-0.5 transition-transform">
              <p className="text-xs font-extrabold text-[#7E43FF] uppercase tracking-widest">Group {g.letter}</p>
              <p className="text-[11px] text-[#615E6E] truncate">{g.teams.map((t) => t.name).join(", ")}</p>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
