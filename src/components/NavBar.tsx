"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function NavBar() {
  const [open, setOpen] = useState(false)

  // Top nav. Groups was added back once /groups/[letter]/ became 12 deep,
  // unique pages with live odds rather than a single overview.
  const links = [
    { href: "/cities", label: "Cities" },
    { href: "/stadiums", label: "Stadiums" },
    { href: "/schedule", label: "Schedule" },
    { href: "/groups", label: "Groups" },
    { href: "/predictor", label: "Predictor" },
    { href: "/kits", label: "Kits" },
    { href: "/tickets", label: "Tickets" },
    { href: "/blog", label: "Blog" },
  ]

  return (
    <div className="relative z-20 flex justify-center px-4 pt-4">
      <nav
        className="w-full max-w-5xl rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(35,22,69,0.08)",
          boxShadow: "0 2px 16px rgba(35,22,69,0.06)",
        }}
      >
        <div className="px-4 md:px-5 h-16 md:h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="My World Cup Guide - Home">
            <Image
              src="/logos.png"
              alt="My World Cup Guide"
              width={1090}
              height={380}
              priority
              className="h-12 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link href="/cities" className="btn-primary text-sm py-2 px-5">
              Plan Your Trip
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-5 h-0.5 bg-[#231645] rounded-full" />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-black/5 px-5 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors py-1"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/cities" className="btn-primary text-sm text-center mt-1" onClick={() => setOpen(false)}>
              Plan Your Trip
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
