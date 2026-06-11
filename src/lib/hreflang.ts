// English-speaking markets we want Google to consider this site canonical for.
// All variants point to the same URL . no localized content yet, this just tells
// Google "this English page is appropriate for these regions" so it ranks in
// google.co.uk, google.com.au, etc., not just google.com.
const EN_LOCALES = [
  "en-US",
  "en-GB",
  "en-CA",
  "en-AU",
  "en-IE",
  "en-NZ",
  "en-ZA",
  "en-IN",
  "en-NG",
  "en-PH",
] as const

export function alternatesFor(canonical: string) {
  const languages: Record<string, string> = { "x-default": canonical }
  for (const l of EN_LOCALES) languages[l] = canonical
  return { canonical, languages }
}
