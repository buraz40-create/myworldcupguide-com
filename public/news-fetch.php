<?php
// Cron-driven news aggregator. Pulls World Cup-related items from public RSS
// feeds and writes them to /data/news.json for the front-end to render.
// Token-protected and self-throttled (skips if last update was recent).

header('Content-Type: text/plain; charset=utf-8');

$TOKEN        = 'cab3417c5a33244e8f9eed2b36a8b6a8';
$MIN_INTERVAL = 30 * 60;                                  // throttle: 30 min
$JSON_PATH    = __DIR__ . '/data/news.json';
$MAX_ITEMS    = 30;

if (!isset($_GET['t']) || !hash_equals($TOKEN, $_GET['t'])) {
    http_response_code(403);
    exit("forbidden\n");
}

if (file_exists($JSON_PATH) && (time() - filemtime($JSON_PATH)) < $MIN_INTERVAL) {
    $age = round((time() - filemtime($JSON_PATH)) / 60);
    echo "skip: news.json updated $age min ago (min interval " . ($MIN_INTERVAL / 60) . " min)\n";
    exit;
}

// Feeds. The World-Cup-specific feeds (BBC, Guardian) are pre-filtered, so
// every item is on-topic. General-football feeds get keyword-filtered to drop
// club-only and other-sport stories.
$FEEDS = [
    ['source' => 'BBC Sport',    'url' => 'https://feeds.bbci.co.uk/sport/football/world-cup/rss.xml', 'wc_only' => true],
    ['source' => 'The Guardian', 'url' => 'https://www.theguardian.com/football/world-cup-2026/rss',   'wc_only' => true],
    ['source' => 'BBC Football', 'url' => 'https://feeds.bbci.co.uk/sport/football/rss.xml',           'wc_only' => false],
    ['source' => 'Sky Sports',   'url' => 'https://www.skysports.com/rss/12040',                       'wc_only' => false],
    ['source' => 'NYT Soccer',   'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/Soccer.xml',   'wc_only' => false],
    ['source' => 'CBS Sports',   'url' => 'https://www.cbssports.com/rss/headlines/soccer/',           'wc_only' => false],
];

// World Cup signal . used to keep stories from general-football feeds.
$KEYWORDS = [
    'world cup', 'fifa world cup', 'fifa', '2026',
    'qualif', 'qualifying', 'qualifier',
    'group stage', 'concacaf', 'conmebol', 'host city', 'host cities',
    'metlife', 'azteca', 'sofi stadium',
];

// Disqualify . even if a keyword matches, drop if any of these appear
// (filters out cricket "T20 World Cup", rugby, F1, golf, etc.).
$EXCLUDE = [
    't20 world cup', 'cricket world cup', 'rugby world cup',
    'cricket', 'rugby', 'formula 1', 'f1 ', 'tennis', 'golf',
    'nba', 'nfl', 'mlb', 'baseball', 'basketball',
    'olympics', 'paralympics',
];

function fetch_url($url, $timeout = 10) {
    if (!function_exists('curl_init')) {
        $ctx = stream_context_create([
            'http' => ['timeout' => $timeout, 'user_agent' => 'MyWorldCupGuide/1.0'],
        ]);
        return @file_get_contents($url, false, $ctx);
    }
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_USERAGENT      => 'MyWorldCupGuide/1.0 (+https://myworldcupguide.com)',
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    return $body !== false ? $body : false;
}

function clean_text($s) {
    $s = strip_tags((string)$s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim(preg_replace('/\s+/', ' ', $s));
}

$all    = [];
$failed = [];

foreach ($FEEDS as $f) {
    $body = fetch_url($f['url']);
    if (!$body) { $failed[] = $f['source']; continue; }

    libxml_use_internal_errors(true);
    $rss = @simplexml_load_string($body);
    libxml_clear_errors();
    if (!$rss || !$rss->channel) { $failed[] = $f['source']; continue; }

    foreach ($rss->channel->item as $item) {
        $title = clean_text((string)$item->title);
        $desc  = clean_text((string)$item->description);
        if ($title === '') continue;

        $hay = mb_strtolower($title . ' ' . $desc);

        // Hard-exclude other-sport "World Cups" and unrelated sports even on WC feeds.
        $blocked = false;
        foreach ($EXCLUDE as $bad) {
            if (mb_strpos($hay, $bad) !== false) { $blocked = true; break; }
        }
        if ($blocked) continue;

        // WC-only feeds skip the include filter; everything is on-topic by source.
        if (empty($f['wc_only'])) {
            $match = false;
            foreach ($KEYWORDS as $k) {
                if (mb_strpos($hay, $k) !== false) { $match = true; break; }
            }
            if (!$match) continue;
        }

        $pubDate = (string)$item->pubDate;
        $ts      = strtotime($pubDate);
        $all[] = [
            'title'       => $title,
            'link'        => (string)$item->link,
            'description' => mb_substr($desc, 0, 220),
            'source'      => $f['source'],
            'date'        => $pubDate,
            'ts'          => $ts ?: time(),
        ];
    }
}

// Fuzzy dedupe . drop near-duplicates from cross-feed mirroring. Two checks:
// (a) character similarity >= 85% catches stopword/casing variants
// (b) significant-word overlap >= 70% catches reworded headlines on the same
//     story (e.g. "Players who cover mouths face red card at WC" vs
//     "WC players who cover mouths or leave pitch in protest may be red carded")
function significantWords($s) {
    static $stop = null;
    if ($stop === null) {
        $stop = array_flip([
            'the','a','an','to','of','for','and','in','on','at','by','is','was',
            'are','were','be','or','but','as','with','who','which','that','may',
            'will','can','after','from','says','said','it','its','their','they',
            'this','these','those','his','her','have','has','had','one','two',
            'world','cup','fifa','2026',
        ]);
    }
    $words = preg_split('/[^a-z0-9]+/', mb_strtolower($s));
    $out = [];
    foreach ($words as $w) {
        if ($w === '' || isset($stop[$w])) continue;
        // crude stem: strip common inflections so "card"/"cards"/"carded" match
        $stem = $w;
        if (strlen($stem) > 4) {
            if (substr($stem, -3) === 'ies') $stem = substr($stem, 0, -3) . 'y';
            elseif (substr($stem, -3) === 'ing') $stem = substr($stem, 0, -3);
            elseif (substr($stem, -2) === 'ed')  $stem = substr($stem, 0, -2);
            elseif (substr($stem, -2) === 'es')  $stem = substr($stem, 0, -2);
            elseif (substr($stem, -1) === 's')   $stem = substr($stem, 0, -1);
        }
        $out[$stem] = true;
    }
    return $out;
}

function isNearDuplicate($title, $existingTitles) {
    $a  = mb_strtolower($title);
    $aw = significantWords($title);
    $aSize = count($aw);
    foreach ($existingTitles as $t) {
        $pct = 0.0;
        similar_text($a, mb_strtolower($t), $pct);
        if ($pct >= 85.0) return true;

        $bw = significantWords($t);
        $bSize = count($bw);
        if ($aSize === 0 || $bSize === 0) continue;
        $common = count(array_intersect_key($aw, $bw));
        $minSize = min($aSize, $bSize);
        if ($minSize >= 4 && $common / $minSize >= 0.7) return true;
    }
    return false;
}

$kept   = [];
$unique = [];
foreach ($all as $it) {
    if (isNearDuplicate($it['title'], $kept)) continue;
    $kept[]   = $it['title'];
    $unique[] = $it;
}

// most recent first
usort($unique, function ($a, $b) { return $b['ts'] - $a['ts']; });
$unique = array_slice($unique, 0, $MAX_ITEMS);

if (!is_dir(dirname($JSON_PATH))) @mkdir(dirname($JSON_PATH), 0755, true);

$out = [
    'updated' => gmdate('c'),
    'count'   => count($unique),
    'failed'  => $failed,
    'items'   => $unique,
];

file_put_contents(
    $JSON_PATH,
    json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo "ok: {$out['count']} items written to data/news.json\n";
if ($failed) echo "failed feeds: " . implode(', ', $failed) . "\n";
echo "updated: {$out['updated']}\n";
