import type { Metadata } from "next"
import KitsClient from "@/components/KitsClient"
import { alternatesFor } from "@/lib/hreflang"
import { kits } from "@/data/kits"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Kits - Rank Every Home & Away Jersey",
  description:
    "Vote on every World Cup 2026 home and away kit. All 48 qualified teams, side-by-side comparisons, front and back views, and live thumbs-up / thumbs-down rankings.",
  keywords: [
    "World Cup 2026 kits",
    "World Cup 2026 jerseys",
    "best World Cup 2026 kit",
    "worst World Cup 2026 kit",
    "rank World Cup kits",
    "2026 World Cup home kit",
    "2026 World Cup away kit",
  ],
  alternates: alternatesFor(`${SITE}/kits/`),
  openGraph: {
    title: "World Cup 2026 Kits - Rank Every Jersey",
    description: "Vote on every home and away kit. All 48 qualified teams.",
    url: `${SITE}/kits/`,
    type: "website",
    images: [{ url: `${SITE}/kits-og.jpg`, width: 1200, height: 630, alt: "Rank all 96 World Cup 2026 kits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rank All 96 World Cup 2026 Kits",
    description: "Vote on every home and away jersey. 48 qualified teams.",
    images: [`${SITE}/kits-og.jpg`],
  },
}

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIFA World Cup 2026 Kits Ranking",
  description: "Reader-voted ranking of every home and away jersey at the 2026 FIFA World Cup.",
  numberOfItems: kits.length * 2,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: kits.flatMap((k, i) => [
    {
      "@type": "ListItem",
      position: i * 2 + 1,
      name: `${k.team} - 2026 World Cup home kit`,
    },
    {
      "@type": "ListItem",
      position: i * 2 + 2,
      name: `${k.team} - 2026 World Cup away kit`,
    },
  ]),
}

export default function KitsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <KitsClient />
    </>
  )
}
