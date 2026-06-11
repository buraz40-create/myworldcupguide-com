// Smoke test the predictor engine . pure-function checks, no React.
// Run: npx tsx scripts/test-predictor.mts

import * as engineNs from "../src/lib/predictorEngine"
const engine: any = (engineNs as any).default ?? engineNs
const {
  autoPickAll,
  simulateAll,
  buildBracket,
  computeStandings,
  getQualifiers,
  GROUP_LETTERS,
  GROUP_MATCHES,
  rating,
  expectedGoals,
} = engine

let pass = 0, fail = 0
function assert(cond: boolean, msg: string) {
  if (cond) { pass++; console.log("  ok   " + msg) }
  else      { fail++; console.log("  FAIL " + msg) }
}

console.log("\n. Constants & data wiring .")
assert(GROUP_LETTERS.length === 12, `12 group letters (got ${GROUP_LETTERS.length}: ${GROUP_LETTERS.join(",")})`)
assert(GROUP_MATCHES.length === 72, `72 group matches (got ${GROUP_MATCHES.length})`)

console.log("\n. Strength model .")
assert(rating(1) > rating(50) && rating(50) > rating(200), "rating monotonically decreases with rank")
const eg = expectedGoals(rating(1), rating(150))
assert(eg.lA > eg.lB, `top side scores more vs minnow (${eg.lA.toFixed(2)} vs ${eg.lB.toFixed(2)})`)
assert(eg.lA > 1.5 && eg.lA < 3.5, `top λ in plausible range (${eg.lA.toFixed(2)})`)
assert(eg.lA <= 3.0, `top λ capped to <= 3.0 to avoid 5-0 results (${eg.lA.toFixed(2)})`)

console.log("\n. Smart model: confederation + compressed rank .")
const teamRating = engine.teamRating
const rBos = teamRating("Bosnia and Herzegovina")
const rQat = teamRating("Qatar")
const rUSA = teamRating("United States")
const rAus = teamRating("Australia")
console.log(`  Bosnia (rank 70 UEFA): ${rBos}`)
console.log(`  Qatar (rank 55 AFC):   ${rQat}`)
console.log(`  USA (CONCACAF):        ${rUSA}`)
console.log(`  Australia (AFC):       ${rAus}`)
assert(rBos > rQat, `Bosnia rated above Qatar despite worse FIFA rank (UEFA bonus): ${rBos} vs ${rQat}`)
const egBQ = expectedGoals(rBos, rQat)
console.log(`  Bosnia λ=${egBQ.lA.toFixed(2)}, Qatar λ=${egBQ.lB.toFixed(2)}`)
assert(egBQ.lA > egBQ.lB, "Bosnia expected to score more than Qatar")
// Run 200 sims of Bosnia vs Qatar to check Bosnia win rate is reasonable
let bosWins = 0, qatWins = 0, draws = 0, qat4plus = 0
for (let s = 0; s < 200; s++) {
  const rng = engine.mulberry32(s * 17 + 1)
  const r = engine.simulateRegulation("Bosnia and Herzegovina", "Qatar", rng)
  if (r.home > r.away) bosWins++
  else if (r.away > r.home) qatWins++
  else draws++
  if (r.away >= 4) qat4plus++
}
console.log(`  200 sims: Bosnia win=${bosWins}, draw=${draws}, Qatar win=${qatWins}, Qatar 4+goals=${qat4plus}`)
assert(bosWins > qatWins, `Bosnia wins more often than Qatar over 200 sims (${bosWins} vs ${qatWins})`)
assert(qat4plus < 10, `Qatar scoring 4+ should be very rare (<5%): ${qat4plus}/200`)


console.log("\n. Auto-pick produces full tournament .")
const ap = autoPickAll()
assert(Object.keys(ap).filter(k => k.startsWith("m")).length === 72, "all 72 group matches scored")
const apBracket = buildBracket(ap)
assert(!!apBracket, "bracket built")
assert(apBracket!.r32.length === 16, "16 R32 matches")
assert(apBracket!.r16.length === 8,  "8 R16 matches")
assert(apBracket!.qf.length === 4,   "4 QF matches")
assert(apBracket!.sf.length === 2,   "2 SF matches")
assert(!!apBracket!.champion, `champion picked: ${apBracket!.champion}`)
assert(!!apBracket!.thirdPlaceWinner, `3rd place picked: ${apBracket!.thirdPlaceWinner}`)
assert(apBracket!.r32.every(m => !!m.winner), "all R32 have winners")
assert(apBracket!.final.winner === apBracket!.champion, "final winner === champion")

console.log("\n. Simulate produces randomness .")
const s1 = simulateAll(1)
const s2 = simulateAll(2)
const champ1 = buildBracket(s1)!.champion
const champ2 = buildBracket(s2)!.champion
assert(champ1 !== null, `seed1 champion: ${champ1}`)
assert(champ2 !== null, `seed2 champion: ${champ2}`)
const ids = Object.keys(s1).filter(k => k.startsWith("m"))
const diff = ids.filter(id => s1[id].home !== s2[id].home || s1[id].away !== s2[id].away).length
assert(diff > 30, `>30 group matches differ between seeds (got ${diff})`)

console.log("\n. Same seed reproducible .")
const sa = simulateAll(42)
const sb = simulateAll(42)
const same = ids.every(id => sa[id].home === sb[id].home && sa[id].away === sb[id].away)
assert(same, "same seed → identical scores")

console.log("\n. Standings math .")
const groupA = computeStandings("A", ap)
assert(groupA.length === 4, "Group A has 4 teams in standings")
assert(groupA[0].pts >= groupA[3].pts, "sorted by points DESC")
const totalGames = groupA.reduce((n, r) => n + r.played, 0) / 2
assert(totalGames === 6, `total Group A games = 6 (got ${totalGames})`)
const totalPoints = groupA.reduce((n, r) => n + r.pts, 0)
assert(totalPoints >= 12 && totalPoints <= 18, `Group A total points in [12,18]: ${totalPoints}`)

console.log("\n. Qualifiers count .")
const quals = getQualifiers(ap)
assert(quals!.length === 32, `32 qualifiers (12 winners + 12 RU + 8 thirds): ${quals!.length}`)
assert(quals!.filter(q => q.position === 1).length === 12, "12 winners")
assert(quals!.filter(q => q.position === 2).length === 12, "12 runners-up")
assert(quals!.filter(q => q.position === 3).length === 8,  "8 best thirds")
const seeds = quals!.map(q => q.seed).sort((a, b) => a - b)
assert(seeds[0] === 1 && seeds[31] === 32, `seeds 1..32 contiguous: ${seeds[0]}..${seeds[31]}`)

console.log("\n. Knockout ties resolved .")
let totalET = 0, totalPens = 0, simsOk = 0
for (let seed = 100; seed < 110; seed++) {
  const sim = simulateAll(seed)
  const br = buildBracket(sim)!
  const allKO = [...br.r32, ...br.r16, ...br.qf, ...br.sf, br.third, br.final]
  const noWinner = allKO.filter(m => !m.winner)
  if (noWinner.length > 0) {
    console.log(`  seed ${seed}: ${noWinner.length} matches without winner!`)
    fail++
    continue
  }
  simsOk++
  const withET = allKO.filter(m => sim[m.id]?.et).length
  const withPens = allKO.filter(m => sim[m.id]?.pens).length
  totalET += withET; totalPens += withPens
  console.log(`  seed ${seed}: ET=${withET}, pens=${withPens}, champion=${br.champion}`)
}
assert(simsOk === 10, "all 10 sims produce a complete bracket")
assert(totalET > 0, `at least one ET across 10 sims: ${totalET}`)

console.log("\n. Bracket pairings: top seed never plays a top seed in R32 .")
const br0 = buildBracket(ap)!
const upset = br0.r32.find(m => {
  if (!m.home || !m.away) return false
  return m.home.seed <= 8 && m.away.seed <= 8
})
assert(!upset, "no R32 has two top-8 seeds")

console.log("\n. FIFA-official R16/QF feed structure (regs §12.7-12.9) .")
// Verify the engine's source structure constants against FIFA's published
// bracket. If anyone reverts to naive i*2/i*2+1 pairing these fail loudly.
const { R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE } = engine
// R16 M89: per FIFA = W74 v W77 (the redditor's bug report . was W73 v W74)
assert(R16_STRUCTURE[0][0] === 1 && R16_STRUCTURE[0][1] === 4, "R16 M89 = W74 v W77")
// R16 M91: per FIFA = W76 v W78 (was W77 v W78 in the bug)
assert(R16_STRUCTURE[2][0] === 3 && R16_STRUCTURE[2][1] === 5, "R16 M91 = W76 v W78")
// QF M98: per FIFA = W93 v W94 (was W91 v W92 in the bug)
assert(QF_STRUCTURE[1][0] === 4 && QF_STRUCTURE[1][1] === 5, "QF M98 = W93 v W94")
// SF M101 = W97 v W98 (was already correct, pin it down)
assert(SF_STRUCTURE[0][0] === 0 && SF_STRUCTURE[0][1] === 1, "SF M101 = W97 v W98")

console.log(`\n${pass} pass, ${fail} fail`)
process.exit(fail === 0 ? 0 : 1)
