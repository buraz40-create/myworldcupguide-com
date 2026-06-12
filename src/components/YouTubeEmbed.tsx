type Props = {
  videoId: string
  title: string
  channel?: string
  heading: string
}

// Generic YouTube card used for stadium walkthroughs, city visitor guides,
// team intros, and match previews. Lazy-loaded iframe, 16:9.
export default function YouTubeEmbed({ videoId, title, channel, heading }: Props) {
  return (
    <section className="rounded-2xl bg-white border border-black/5 shadow-sm p-5 md:p-6 my-8">
      <h2 className="text-xl md:text-2xl font-bold text-[#231645] mb-3">{heading}</h2>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-xl"
          loading="lazy"
        />
      </div>
      <p className="text-sm text-[#615E6E] mt-3">
        {title}
        {channel ? ` (${channel})` : ""}
      </p>
    </section>
  )
}
