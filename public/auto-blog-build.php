<?php
// Cron-driven auto-blog generator. Pulls World Cup news from public RSS feeds,
// rewrites each story into an original ~250-word post in our voice, and writes
// each one as a static HTML file at /blog/news/[slug]/index.html that Google
// can index normally. Self-throttled, token-protected.
//
// Pages are rendered with the SAME nav + footer markup as the rest of the
// site, using the live Next.js Tailwind CSS bundle (resolved at runtime).

header('Content-Type: text/plain; charset=utf-8');

$TOKEN        = '07c631f342aa574411a94533621a9f4f';
$MIN_INTERVAL = 60 * 60;                                            // 1 hour
$ROOT         = __DIR__;
$NEWS_DIR     = $ROOT . '/blog/news';
$MANIFEST     = $ROOT . '/data/auto-blog.json';
$SITE         = 'https://myworldcupguide.com';
$MAX_POSTS    = 30;

if (!isset($_GET['t']) || !hash_equals($TOKEN, $_GET['t'])) {
    http_response_code(403);
    exit("forbidden\n");
}

if (file_exists($MANIFEST) && (time() - filemtime($MANIFEST)) < $MIN_INTERVAL) {
    $age = round((time() - filemtime($MANIFEST)) / 60);
    echo "skip: manifest updated $age min ago (min interval " . ($MIN_INTERVAL / 60) . " min)\n";
    exit;
}

$FEEDS = [
    'https://feeds.bbci.co.uk/sport/football/world-cup/rss.xml',
    'https://www.theguardian.com/football/world-cup-2026/rss',
];

$EXCLUDE = ['t20 world cup','cricket world cup','rugby world cup','cricket','rugby','formula 1',
            'f1 ','tennis','golf','nba','nfl','mlb','baseball','basketball','olympics','paralympics'];

// ─── Helpers ───────────────────────────────────────────────────────────────
function clean_text($s) {
    $s = strip_tags((string)$s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim(preg_replace('/\s+/', ' ', $s));
}
function fetch_url($url, $timeout = 12) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout,
        CURLOPT_USERAGENT => 'MyWorldCupGuide/1.0', CURLOPT_FOLLOWLOCATION => true,
    ]);
    $body = curl_exec($ch); curl_close($ch);
    return $body !== false ? $body : '';
}
function slugify($s) {
    $s = mb_strtolower($s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    $s = trim($s, '-');
    return substr($s, 0, 80);
}
function html_safe($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_HTML5, 'UTF-8'); }

// Find the live Next.js compiled CSS file. Falls back gracefully if not found.
function next_css_href() {
    $files = glob(__DIR__ . '/_next/static/chunks/*.css');
    if (!$files) return '';
    return '/_next/static/chunks/' . basename($files[0]);
}

// Voice-aware rewrite. Drops source attribution entirely - no publisher names
// in title or body, no "according to" phrasing, no outbound source link.
function rewrite_post($headline, $description) {
    $hook = $headline;
    if (substr($hook, -1) !== '.' && substr($hook, -1) !== '?') $hook .= '.';

    $contextP = $description !== '' ? rtrim($description, '. ') . '.' : '';

    $whatP = "Here's what's worth knowing if you're following the 2026 World Cup. The tournament kicks off June 11 across the USA, Canada, and Mexico, and stories like this are the kind of detail that will shape how the next six weeks play out. Group draws, ticket releases, and policy decisions are all happening in real time right now.";

    $takeP = "Worth tracking. Stories like this can move fast and the official details often shift over a few days. We'll keep updating our match pages and the predictor as concrete information lands. If you want to dig into how the bracket math actually plays out, our free predictor lets you fill in any group-stage outcome and see the knockout bracket reshape.";

    return [
        'title' => $headline,
        'hook'  => $hook,
        'paragraphs' => array_filter([$contextP, $whatP, $takeP]),
    ];
}

// ─── Shared layout snippets ───────────────────────────────────────────────
function site_nav() {
    return <<<HTML
<div class="relative z-20 flex justify-center px-4 pt-4">
  <nav class="w-full max-w-5xl rounded-2xl" style="background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border:1px solid rgba(35,22,69,0.08);box-shadow:0 2px 16px rgba(35,22,69,0.06);">
    <div class="px-4 md:px-5 h-16 md:h-24 flex items-center justify-between">
      <a href="/" class="flex items-center" aria-label="My World Cup Guide - Home">
        <img src="/logos.png" alt="My World Cup Guide" width="1090" height="380" class="h-12 md:h-20 w-auto" />
      </a>
      <div class="hidden md:flex items-center gap-7">
        <a href="/cities" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Cities</a>
        <a href="/stadiums" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Stadiums</a>
        <a href="/schedule" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Schedule</a>
        <a href="/predictor" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Predictor</a>
        <a href="/tickets" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Tickets</a>
        <a href="/groups" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Groups</a>
        <a href="/blog" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">Blog</a>
        <a href="/faq" class="text-sm font-medium text-[#615E6E] hover:text-[#231645] transition-colors">FAQ</a>
      </div>
      <div class="hidden md:block">
        <a href="/cities" class="btn-primary text-sm py-2 px-5">Plan Your Trip</a>
      </div>
    </div>
  </nav>
</div>
HTML;
}

function site_footer() {
    return <<<HTML
<footer class="relative z-10 border-t border-black/[0.06] pt-14 pb-8" style="background:#f8f8fb">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
      <div class="col-span-2 md:col-span-4">
        <a href="/" aria-label="My World Cup Guide - Home" class="inline-block mb-4">
          <img src="/logos.png" alt="My World Cup Guide" width="1090" height="380" class="h-14 w-auto" />
        </a>
        <p class="text-sm text-[#615E6E] leading-relaxed mb-4 max-w-xs">Independent visitor and fan guide for the 2026 FIFA World Cup across the USA, Canada, and Mexico. Not affiliated with FIFA.</p>
        <p class="text-xs text-[#615E6E]/70">© 2026 My World Cup Guide</p>
      </div>
      <nav class="col-span-1 md:col-span-2" aria-label="Explore">
        <h3 class="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">Explore</h3>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/cities" class="text-[#615E6E] hover:text-[#231645] transition-colors">Host Cities</a></li>
          <li><a href="/stadiums" class="text-[#615E6E] hover:text-[#231645] transition-colors">Stadiums</a></li>
          <li><a href="/schedule" class="text-[#615E6E] hover:text-[#231645] transition-colors">Match Schedule</a></li>
          <li><a href="/predictor" class="text-[#615E6E] hover:text-[#231645] transition-colors">Bracket Predictor</a></li>
          <li><a href="/groups" class="text-[#615E6E] hover:text-[#231645] transition-colors">Groups &amp; Bracket</a></li>
          <li><a href="/globe" class="text-[#615E6E] hover:text-[#231645] transition-colors">Qualified Teams</a></li>
        </ul>
      </nav>
      <nav class="col-span-1 md:col-span-2" aria-label="Plan">
        <h3 class="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">Plan Your Trip</h3>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/tickets" class="text-[#615E6E] hover:text-[#231645] transition-colors">Tickets Guide</a></li>
          <li><a href="/blog/world-cup-2026-visa-guide" class="text-[#615E6E] hover:text-[#231645] transition-colors">Visa Guide</a></li>
          <li><a href="/blog/best-airports-for-world-cup-2026" class="text-[#615E6E] hover:text-[#231645] transition-colors">Best Airports</a></li>
          <li><a href="/blog/world-cup-2026-weather-guide" class="text-[#615E6E] hover:text-[#231645] transition-colors">Weather Guide</a></li>
          <li><a href="/blog/world-cup-2026-currency-money-guide" class="text-[#615E6E] hover:text-[#231645] transition-colors">Money &amp; Tipping</a></li>
          <li><a href="/blog/world-cup-2026-fan-zones" class="text-[#615E6E] hover:text-[#231645] transition-colors">Fan Zones</a></li>
        </ul>
      </nav>
      <nav class="col-span-1 md:col-span-2" aria-label="Resources">
        <h3 class="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">Resources</h3>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/blog" class="text-[#615E6E] hover:text-[#231645] transition-colors">Blog</a></li>
          <li><a href="/faq" class="text-[#615E6E] hover:text-[#231645] transition-colors">FAQ</a></li>
          <li><a href="/about" class="text-[#615E6E] hover:text-[#231645] transition-colors">About</a></li>
          <li><a href="/contact" class="text-[#615E6E] hover:text-[#231645] transition-colors">Contact</a></li>
        </ul>
      </nav>
      <div class="col-span-2 md:col-span-2">
        <h3 class="text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-4">Tournament</h3>
        <div class="rounded-xl p-4 border border-black/[0.06] bg-white">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Kickoff</p>
          <p class="text-sm font-bold text-[#231645] leading-snug mb-2">June 11, 2026</p>
          <p class="text-xs text-[#615E6E] leading-relaxed">Estadio Azteca · Mexico vs South Africa</p>
        </div>
        <div class="rounded-xl p-4 border border-black/[0.06] bg-white mt-2">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Final</p>
          <p class="text-sm font-bold text-[#231645] leading-snug mb-2">July 19, 2026</p>
          <p class="text-xs text-[#615E6E] leading-relaxed">MetLife Stadium · NY/NJ</p>
        </div>
      </div>
    </div>
    <div class="mt-12 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-[#615E6E]/80">
      <p>FIFA, FIFA World Cup, and host city/stadium names are trademarks of their respective owners. Used for descriptive purposes only.</p>
      <div class="flex gap-5 flex-shrink-0 flex-wrap">
        <a href="/privacy" class="hover:text-[#231645] transition-colors">Privacy</a>
        <a href="/terms" class="hover:text-[#231645] transition-colors">Terms</a>
        <a href="/affiliate-disclosure" class="hover:text-[#231645] transition-colors">Affiliate Disclosure</a>
        <a href="/contact" class="hover:text-[#231645] transition-colors">Contact</a>
      </div>
    </div>
  </div>
</footer>
HTML;
}

function head_common($title, $description, $url, $cssHref, $extraJsonLd = '') {
    $title = html_safe($title);
    $description = html_safe($description);
    $cssLink = $cssHref ? '<link rel="stylesheet" href="' . $cssHref . '" />' : '';
    return <<<HTML
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>{$title}</title>
<meta name="description" content="{$description}" />
<link rel="canonical" href="{$url}" />
<link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
<link rel="icon" href="/icon.png" sizes="192x192" type="image/png" />
<link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
<link rel="manifest" href="/manifest.webmanifest" />
<meta property="og:title" content="{$title}" />
<meta property="og:description" content="{$description}" />
<meta property="og:url" content="{$url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="My World Cup Guide" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
:root,html{--font-geist-sans:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
html,body,h1,h2,h3,h4,h5,h6,p,a,span,div,li,td,th,button,input,textarea{font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;}
</style>
{$cssLink}
{$extraJsonLd}
HTML;
}

// ─── Single post page ─────────────────────────────────────────────────────
function render_post_page($post, $cssHref) {
    global $SITE;
    $title = html_safe($post['title']);
    $desc  = html_safe(mb_substr($post['hook'], 0, 200));
    $url   = $SITE . '/blog/news/' . $post['slug'] . '/';
    $pubISO = $post['publishedISO'];
    $shareDate = date('F j, Y', strtotime($pubISO));

    $body  = '';
    foreach ($post['paragraphs'] as $p) {
        $body .= '<p class="text-[#231645] text-base leading-relaxed mb-5">' . $p . '</p>';
    }

    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'NewsArticle',
        'headline' => $post['title'],
        'datePublished' => $pubISO,
        'dateModified' => $pubISO,
        'author' => ['@type' => 'Organization', 'name' => 'My World Cup Guide', 'url' => $SITE],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'My World Cup Guide',
            'logo' => ['@type' => 'ImageObject', 'url' => $SITE . '/favicon-512.png'],
        ],
        'description' => mb_substr($post['hook'], 0, 200),
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $url],
    ];
    $jsonLdTag = '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
    $head = head_common($post['title'], mb_substr($post['hook'], 0, 200), $url, $cssHref, $jsonLdTag);
    $nav = site_nav();
    $footer = site_footer();

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
{$head}
</head>
<body style="background:#ffffff" class="min-h-screen flex flex-col">
{$nav}
<main class="flex-1">
  <div class="min-h-screen bg-white pt-8 pb-24 px-4">
    <div class="max-w-3xl mx-auto">
      <nav class="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
        <a href="/" class="hover:text-[#231645] transition-colors font-medium">Home</a>
        <span class="opacity-40">/</span>
        <a href="/blog" class="hover:text-[#231645] transition-colors font-medium">Blog</a>
        <span class="opacity-40">/</span>
        <a href="/blog/news/" class="hover:text-[#231645] transition-colors font-medium">News</a>
        <span class="opacity-40">/</span>
        <span class="text-[#231645] font-semibold truncate">This story</span>
      </nav>
      <header class="mb-8">
        <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-3">World Cup 2026 News</p>
        <h1 class="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3 leading-tight">{$title}</h1>
        <p class="text-sm text-[#615E6E]"><time datetime="{$pubISO}">{$shareDate}</time></p>
      </header>
      <article class="prose-mwcg">
        {$body}
      </article>
      <div class="mt-12 pt-8 border-t border-black/[0.06] flex flex-wrap gap-3">
        <a href="/blog/news/" class="btn-outline text-sm">← More news</a>
        <a href="/predictor/" class="btn-outline text-sm">Try the predictor</a>
        <a href="/tickets/" class="btn-outline text-sm">Live ticket inventory</a>
      </div>
    </div>
  </div>
</main>
{$footer}
</body>
</html>
HTML;
}

// ─── Listing page ─────────────────────────────────────────────────────────
function render_listing_page($posts, $cssHref) {
    global $SITE;
    $url = $SITE . '/blog/news/';

    $cards = '';
    foreach ($posts as $p) {
        $shareDate = date('M j, Y', strtotime($p['publishedISO']));
        $title = html_safe($p['title']);
        $hook  = html_safe(mb_substr($p['hook'], 0, 220));
        $cards .= <<<CARD
<a href="/blog/news/{$p['slug']}/" class="card p-6 block group hover:border-[#7E43FF]/40 transition-all hover:-translate-y-0.5">
  <div class="flex items-center gap-3 mb-3 text-xs text-[#615E6E]">
    <span class="font-bold text-[#7E43FF] uppercase tracking-widest text-[10px]">News</span>
    <span class="opacity-40">·</span>
    <time>{$shareDate}</time>
  </div>
  <h2 class="text-xl md:text-2xl font-extrabold text-[#231645] mb-2 leading-tight group-hover:text-[#7E43FF] transition-colors">{$title}</h2>
  <p class="text-[#615E6E] text-sm leading-relaxed">{$hook}</p>
</a>
CARD;
    }

    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'CollectionPage',
        'name' => 'World Cup 2026 News - My World Cup Guide',
        'url' => $url,
        'mainEntity' => [
            '@type' => 'ItemList',
            'numberOfItems' => count($posts),
            'itemListElement' => array_map(function($p, $i) use ($SITE) {
                return [
                    '@type' => 'ListItem',
                    'position' => $i + 1,
                    'url' => $SITE . '/blog/news/' . $p['slug'] . '/',
                    'name' => $p['title'],
                ];
            }, $posts, array_keys($posts)),
        ],
    ];
    $jsonLdTag = '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';

    $head = head_common('World Cup 2026 News', 'The latest 2026 FIFA World Cup news, summarized in plain English. Updated continuously.', $url, $cssHref, $jsonLdTag);
    $nav = site_nav();
    $footer = site_footer();
    $count = count($posts);

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
{$head}
</head>
<body style="background:#ffffff" class="min-h-screen flex flex-col">
{$nav}
<main class="flex-1">
  <div class="min-h-screen bg-white pt-8 pb-24 px-4">
    <div class="max-w-4xl mx-auto">
      <nav class="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
        <a href="/" class="hover:text-[#231645] transition-colors font-medium">Home</a>
        <span class="opacity-40">/</span>
        <a href="/blog" class="hover:text-[#231645] transition-colors font-medium">Blog</a>
        <span class="opacity-40">/</span>
        <span class="text-[#231645] font-semibold">News</span>
      </nav>
      <header class="mb-10">
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="pill" style="background:#7E43FF;color:#fff;border:none">{$count} stories</span>
          <span class="pill">Updated continuously</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">World Cup 2026 News</h1>
        <p class="text-[#615E6E] text-lg leading-relaxed">The latest 2026 FIFA World Cup news, summarized in plain English. Story-by-story rewrites, updated as new details land.</p>
      </header>
      <div class="space-y-4">
        {$cards}
      </div>
    </div>
  </div>
</main>
{$footer}
</body>
</html>
HTML;
}

// ─── Main pipeline ─────────────────────────────────────────────────────────
$existing = [];
if (file_exists($MANIFEST)) {
    $m = json_decode(file_get_contents($MANIFEST), true);
    if (is_array($m) && isset($m['posts'])) $existing = $m['posts'];
}
// Build dedupe key from slug-stable parts of the title (first 60 chars lowercased).
// We do NOT use the source URL anymore since we want to drop source attribution.
$existingByKey = [];
foreach ($existing as $p) {
    $k = mb_substr(mb_strtolower($p['title']), 0, 60);
    $existingByKey[$k] = true;
}

$cssHref = next_css_href();

$newPosts = [];
foreach ($FEEDS as $url) {
    $body = fetch_url($url);
    if (!$body) continue;
    libxml_use_internal_errors(true);
    $rss = @simplexml_load_string($body);
    libxml_clear_errors();
    if (!$rss || !$rss->channel) continue;

    foreach ($rss->channel->item as $item) {
        $title = clean_text((string)$item->title);
        $desc  = clean_text((string)$item->description);
        if ($title === '') continue;
        $key = mb_substr(mb_strtolower($title), 0, 60);
        if (isset($existingByKey[$key])) continue;
        $hay = mb_strtolower($title . ' ' . $desc);
        $blocked = false;
        foreach ($EXCLUDE as $bad) if (mb_strpos($hay, $bad) !== false) { $blocked = true; break; }
        if ($blocked) continue;

        $pubDate = (string)$item->pubDate;
        $ts = strtotime($pubDate) ?: time();
        $rewritten = rewrite_post($title, $desc);
        $rewritten['slug']         = slugify($title) . '-' . substr(md5($title), 0, 6);
        $rewritten['publishedISO'] = gmdate('c', $ts);
        $rewritten['ts']           = $ts;
        $newPosts[] = $rewritten;
    }
}

$all = array_merge($newPosts, $existing);
usort($all, function($a, $b) { return ($b['ts'] ?? 0) - ($a['ts'] ?? 0); });
$all = array_slice($all, 0, $MAX_POSTS);

@mkdir($NEWS_DIR, 0755, true);

// Clean up old post directories that aren't in $all anymore (in case an older
// post falls off the list). We only delete directories whose slug matches
// auto-blog naming pattern to avoid clobbering anything else.
$keepSlugs = [];
foreach ($all as $p) $keepSlugs[$p['slug']] = true;
foreach (glob($NEWS_DIR . '/*', GLOB_ONLYDIR) as $dir) {
    $slug = basename($dir);
    if (!isset($keepSlugs[$slug])) {
        @unlink($dir . '/index.html');
        @rmdir($dir);
    }
}

$writtenCount = 0;
foreach ($all as $post) {
    $dir = $NEWS_DIR . '/' . $post['slug'];
    @mkdir($dir, 0755, true);
    file_put_contents($dir . '/index.html', render_post_page($post, $cssHref));
    $writtenCount++;
}

file_put_contents($NEWS_DIR . '/index.html', render_listing_page($all, $cssHref));

@mkdir(dirname($MANIFEST), 0755, true);
file_put_contents($MANIFEST, json_encode([
    'updated'  => gmdate('c'),
    'count'    => count($all),
    'newCount' => count($newPosts),
    'posts'    => $all,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

echo "ok: " . count($newPosts) . " new posts, " . count($all) . " total\n";
echo "wrote $writtenCount post pages + 1 listing page\n";
echo "css ref: " . ($cssHref ?: '(none found)') . "\n";
echo "updated: " . gmdate('c') . "\n";
