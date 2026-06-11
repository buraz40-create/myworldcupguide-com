import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { blogPosts, getBlogPostBySlug } from "@/data/blogPosts"
import BlogBody from "@/components/BlogBody"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: alternatesFor(`${SITE}/blog/${post.slug}/`),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE}/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  }
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()

  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  // Build a Table of Contents from H2 blocks
  const headings = post.body
    .filter((b) => b.type === "h2")
    .map((b) => {
      const text = (b as { text: string }).text
      const id = (b as { id?: string }).id ?? text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      return { id, text }
    })

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "My World Cup Guide", url: SITE },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${post.slug}/` },
    keywords: post.tags.join(", "),
  }
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE}/blog/${post.slug}/` },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/blog" className="hover:text-[#231645] transition-colors font-medium">Blog</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 pb-8 border-b border-black/[0.06]">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#615E6E] mb-4">
            <span className="font-bold text-[#7E43FF] uppercase tracking-widest text-[10px]">{post.category}</span>
            <span className="opacity-40">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.updated && post.updated !== post.date && (
              <>
                <span className="opacity-40">·</span>
                <span>Updated {formatDate(post.updated)}</span>
              </>
            )}
            <span className="opacity-40">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#231645] mb-4 leading-[1.1]">
            {post.title}
          </h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">{post.description}</p>
          <div className="mt-5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
              aria-hidden
            >
              {post.author.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-[#231645] text-sm">{post.author}</p>
              <p className="text-[#615E6E] text-xs leading-snug">{post.authorBio}</p>
            </div>
          </div>
        </header>

        {/* Table of contents */}
        {headings.length > 2 && (
          <nav className="card p-5 mb-8" aria-label="Table of contents">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">In this article</p>
            <ol className="space-y-1.5">
              {headings.map((h, i) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-sm text-[#231645] hover:text-[#7E43FF] transition-colors flex gap-2">
                    <span className="font-bold text-[#7E43FF] w-6 flex-shrink-0">{i + 1}.</span>
                    <span>{h.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body */}
        <BlogBody blocks={post.body} />

        {/* Related posts */}
        {others.length > 0 && (
          <section className="mt-14 pt-8 border-t border-black/[0.06]">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-5">More from the blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="card p-5 block group hover:border-[#7E43FF]/40 transition-all"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">{p.category}</p>
                  <h3 className="font-extrabold text-[#231645] text-sm mb-2 leading-tight group-hover:text-[#7E43FF] transition-colors">{p.title}</h3>
                  <p className="text-[#615E6E] text-xs leading-relaxed line-clamp-3">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 pt-6 border-t border-black/[0.06]">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  )
}
