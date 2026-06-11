"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { wcCountries, confederationColors, type WCCountry } from "@/data/wc-countries"
import { geoPath, geoEquirectangular } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"

type TooltipState = { country: WCCountry; x: number; y: number } | null

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const wcCountryNames = new Set(wcCountries.map((c) => c.name))
const wcCountryByName = new Map(wcCountries.map((c) => [c.name, c]))

// ISO numeric → country name map (subset covering WC nations + major countries)
const isoToName: Record<number, string> = {
  4: "Afghanistan", 8: "Albania", 12: "Algeria", 24: "Angola", 32: "Argentina",
  36: "Australia", 40: "Austria", 50: "Bangladesh", 56: "Belgium", 64: "Bhutan",
  68: "Bolivia", 76: "Brazil", 100: "Bulgaria", 116: "Cambodia", 120: "Cameroon",
  124: "Canada", 144: "Sri Lanka", 152: "Chile", 156: "China", 170: "Colombia",
  180: "DR Congo", 188: "Costa Rica", 191: "Croatia", 192: "Cuba", 196: "Cyprus",
  203: "Czech Republic", 208: "Denmark", 218: "Ecuador", 818: "Egypt",
  222: "El Salvador", 231: "Ethiopia", 246: "Finland", 250: "France",
  266: "Gabon", 276: "Germany", 288: "Ghana", 300: "Greece", 320: "Guatemala",
  324: "Guinea", 332: "Haiti", 340: "Honduras", 348: "Hungary", 356: "India",
  360: "Indonesia", 364: "Iran", 368: "Iraq", 372: "Ireland", 376: "Israel",
  380: "Italy", 388: "Jamaica", 392: "Japan", 400: "Jordan", 404: "Kenya",
  410: "South Korea", 414: "Kuwait", 422: "Lebanon", 430: "Liberia",
  434: "Libya", 484: "Mexico", 504: "Morocco", 516: "Namibia", 524: "Nepal",
  528: "Netherlands", 554: "New Zealand", 566: "Nigeria", 578: "Norway",
  586: "Pakistan", 591: "Panama", 598: "Papua New Guinea", 604: "Peru",
  608: "Philippines", 616: "Poland", 620: "Portugal", 630: "Puerto Rico",
  634: "Qatar", 642: "Romania", 643: "Russia", 682: "Saudi Arabia",
  686: "Senegal", 694: "Sierra Leone", 706: "Somalia", 710: "South Africa",
  724: "Spain", 729: "Sudan", 752: "Sweden", 756: "Switzerland", 760: "Syria",
  762: "Tajikistan", 764: "Thailand", 788: "Tunisia", 792: "Turkey",
  800: "Uganda", 804: "Ukraine", 784: "United Arab Emirates",
  826: "United Kingdom", 840: "United States", 858: "Uruguay",
  860: "Uzbekistan", 862: "Venezuela", 704: "Vietnam", 887: "Yemen",
  894: "Zambia", 716: "Zimbabwe",
  703: "Slovakia", 705: "Slovenia",
  807: "North Macedonia", 499: "Montenegro", 70: "Bosnia and Herzegovina",
  688: "Serbia",
}

async function buildMapTexture(): Promise<THREE.CanvasTexture> {
  const W = 1024
  const H = 512
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!

  // Ocean - deep blue
  ctx.fillStyle = "#4a90d9"
  ctx.fillRect(0, 0, W, H)

  const topo = await fetch(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
  ).then((r) => r.json()) as Topology

  const countries = feature(topo, topo.objects.countries as GeometryCollection)
  const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2])
  const path = geoPath(projection, ctx)

  // Draw all land - warm light grey/beige
  ctx.beginPath()
  path(countries)
  ctx.fillStyle = "#d4cfe8"
  ctx.fill()

  // Highlight WC countries with full confederation color
  for (const f of countries.features) {
    const id = Number(f.id)
    const name = isoToName[id]
    if (!name) continue
    const wcc = wcCountryByName.get(name)
    if (!wcc) continue
    ctx.beginPath()
    path(f)
    ctx.fillStyle = confederationColors[wcc.confederation] + "cc" // 80% opacity
    ctx.fill()
  }

  // Country borders - dark, crisp lines
  ctx.beginPath()
  path(countries)
  ctx.strokeStyle = "#1a1040"
  ctx.lineWidth = 0.6
  ctx.stroke()

  return new THREE.CanvasTexture(canvas)
}

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const hoveredRef = useRef<number | null>(null)

  useEffect(() => {
    hoveredRef.current = hoveredIdx
  }, [hoveredIdx])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight
    const RADIUS = 2.6

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.z = 7.5

    const isMobile = window.innerWidth < 768
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Globe with placeholder color until texture loads
    const sphereSegments = isMobile ? 32 : 48
    const sphereGeo = new THREE.SphereGeometry(RADIUS, sphereSegments, sphereSegments)
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x4a90d9,
      shininess: 8,
      specular: 0x224466,
      transparent: true,
      opacity: 1,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(RADIUS * 1.06, sphereSegments, sphereSegments)
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x9b72ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.1,
    })

    // Country dots
    const dotMeshes: THREE.Mesh[] = []
    const dotGeo = new THREE.SphereGeometry(0.075, isMobile ? 8 : 12, isMobile ? 8 : 12)

    wcCountries.forEach((country, i) => {
      const color = new THREE.Color(confederationColors[country.confederation])
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: country.isHost ? 0.8 : 0.4,
        transparent: true,
        opacity: 1,
      })
      const dot = new THREE.Mesh(dotGeo, mat)
      dot.position.copy(latLngToVec3(country.lat, country.lng, RADIUS + 0.14))
      dot.userData = { countryIdx: i }
      dotMeshes.push(dot)
    })

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)
    const pointLight = new THREE.PointLight(0x9b72ff, 0.4, 20)
    pointLight.position.set(-5, 3, 5)
    scene.add(pointLight)

    // Group
    const group = new THREE.Group()
    group.add(sphere)
    group.add(new THREE.Mesh(atmosGeo, atmosMat))
    dotMeshes.forEach((d) => group.add(d))
    scene.add(group)

    // Load map texture async
    buildMapTexture().then((texture) => {
      sphereMat.map = texture
      sphereMat.color.set(0xffffff)
      sphereMat.needsUpdate = true
    })

    // Rotation state
    let autoRotate = true
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let rotVel = { x: 0, y: 0.003 }

    const raycaster = new THREE.Raycaster()
    raycaster.params.Points = { threshold: 0.1 }
    const mouse = new THREE.Vector2()

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / W) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / H) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(dotMeshes)
      if (hits.length > 0) {
        const idx = hits[0].object.userData.countryIdx as number
        setHoveredIdx(idx)
        hoveredRef.current = idx
        setTooltip({ country: wcCountries[idx], x: e.clientX - rect.left, y: e.clientY - rect.top })
        mount.style.cursor = "pointer"
      } else {
        setHoveredIdx(null)
        hoveredRef.current = null
        setTooltip(null)
        mount.style.cursor = isDragging ? "grabbing" : "grab"
      }

      if (isDragging) {
        const dx = e.clientX - prevMouse.x
        const dy = e.clientY - prevMouse.y
        rotVel.y = dx * 0.005
        rotVel.x = dy * 0.005
        group.rotation.y += rotVel.y
        group.rotation.x += rotVel.x
        prevMouse = { x: e.clientX, y: e.clientY }
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      autoRotate = false
      prevMouse = { x: e.clientX, y: e.clientY }
      mount.style.cursor = "grabbing"
    }

    const onMouseUp = () => {
      isDragging = false
      mount.style.cursor = "grab"
      setTimeout(() => { autoRotate = true }, 2500)
    }

    mount.addEventListener("mousemove", onMouseMove)
    mount.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      autoRotate = false
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const dx = e.touches[0].clientX - prevMouse.x
      rotVel.y = dx * 0.005
      group.rotation.y += rotVel.y
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = () => {
      isDragging = false
      setTimeout(() => { autoRotate = true }, 2000)
    }
    mount.addEventListener("touchstart", onTouchStart, { passive: true })
    mount.addEventListener("touchmove", onTouchMove, { passive: true })
    mount.addEventListener("touchend", onTouchEnd)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (autoRotate && !isDragging) {
        group.rotation.y += 0.003
        rotVel.y *= 0.95
      } else if (!isDragging) {
        rotVel.y *= 0.92
        group.rotation.y += rotVel.y
      }

      const hi = hoveredRef.current
      dotMeshes.forEach((dot, i) => {
        const mat = dot.material as THREE.MeshPhongMaterial
        if (i === hi) {
          mat.emissiveIntensity = 1.2
          dot.scale.setScalar(1.6)
        } else if (wcCountries[i].isHost) {
          mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003 + i) * 0.3
          dot.scale.setScalar(1.3 + Math.sin(Date.now() * 0.003 + i) * 0.15)
        } else {
          mat.emissiveIntensity = 0.4
          dot.scale.setScalar(1.0)
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      mount.removeEventListener("mousemove", onMouseMove)
      mount.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
      mount.removeEventListener("touchstart", onTouchStart)
      mount.removeEventListener("touchmove", onTouchMove)
      mount.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("resize", onResize)
      sphereGeo.dispose()
      atmosGeo.dispose()
      dotGeo.dispose()
      sphereMat.map?.dispose()
      sphereMat.dispose()
      atmosMat.dispose()
      dotMeshes.forEach((d) => (d.material as THREE.MeshPhongMaterial).dispose())
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  const confLabels: Record<string, string> = {
    UEFA: "Europe",
    CONMEBOL: "South America",
    CAF: "Africa",
    AFC: "Asia",
    CONCACAF: "North/Central America",
    OFC: "Oceania",
  }

  return (
    <div className="relative w-full h-[480px] md:h-[800px]">
      <div ref={mountRef} className="w-full h-full cursor-grab" />

      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-white border border-black/[0.08] rounded-xl px-4 py-3 shadow-lg"
          style={{ left: tooltip.x + 16, top: tooltip.y - 40, transform: "translateY(-50%)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tooltip.country.flag}</span>
            <div>
              <p className="font-bold text-[#231645] text-sm leading-tight">{tooltip.country.name}</p>
              <p className="text-xs text-[#615E6E]">{confLabels[tooltip.country.confederation]}</p>
            </div>
            {tooltip.country.isHost && (
              <span className="text-xs bg-[#7E43FF]/10 text-[#7E43FF] font-semibold px-2 py-0.5 rounded-full ml-1">Host</span>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pill text-xs opacity-60 pointer-events-none">
        ↔ drag to rotate
      </div>
    </div>
  )
}
