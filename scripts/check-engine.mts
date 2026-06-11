import * as e from "../src/lib/predictorEngine"
console.log("type:", typeof e)
console.log("keys:", Object.keys(e))
console.log("default keys:", Object.keys((e as any).default || {}))
