type Props = {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

// Free Google Maps embed - no API key required for basic location display.
export default function StadiumMap({ name, address, coordinates }: Props) {
  const { lat, lng } = coordinates
  // Standard Google Maps embed URL with stadium name as marker
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(name + ", " + address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.06] bg-[#f5f4fa] relative">
      <div className="aspect-[16/9] w-full">
        <iframe
          src={src}
          title={`Map showing the location of ${name}`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="px-5 py-4 bg-white border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-0.5">Address</p>
          <p className="text-sm text-[#231645] font-semibold leading-snug">{address}</p>
        </div>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs whitespace-nowrap flex-shrink-0"
        >
          Get directions →
        </a>
      </div>
    </div>
  )
}
