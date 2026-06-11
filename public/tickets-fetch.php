<?php
// Cron-driven ticket-data fetcher. Pulls live World Cup resale inventory from
// SeatSidekick's open /api/matches endpoint and re-shapes it into a leaner
// JSON our front-end consumes. Token-protected and self-throttled (4 hours).

header('Content-Type: text/plain; charset=utf-8');

$TOKEN        = '627d6821f006a6b31e3259784e6a6afb';
$MIN_INTERVAL = 4 * 60 * 60;                                  // 4 hours
$JSON_PATH    = __DIR__ . '/data/tickets.json';
$SOURCE_URL   = 'https://seatsidekick.com/api/matches';
$FX_URL       = 'https://api.frankfurter.dev/v1/latest?from=CAD&to=USD';
$FX_FALLBACK  = 0.73;                                         // used if FX API fails

if (!isset($_GET['t']) || !hash_equals($TOKEN, $_GET['t'])) {
    http_response_code(403);
    exit("forbidden\n");
}

if (file_exists($JSON_PATH) && (time() - filemtime($JSON_PATH)) < $MIN_INTERVAL) {
    $age = round((time() - filemtime($JSON_PATH)) / 60);
    echo "skip: tickets.json updated $age min ago (min interval " . ($MIN_INTERVAL / 60) . " min)\n";
    exit;
}

function fetch_json($url, $timeout = 15) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_USERAGENT      => 'MyWorldCupGuide/1.0 (+https://myworldcupguide.com)',
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$body, $status];
}

// Live CAD→USD rate. Fall back to a sensible default if the FX API is down so
// we never block the ticket pipeline on an FX failure.
$rate = $FX_FALLBACK;
[$fxBody, $fxStatus] = fetch_json($FX_URL, 8);
if ($fxBody && $fxStatus === 200) {
    $fx = json_decode($fxBody, true);
    if (!empty($fx['rates']['USD'])) {
        $rate = (float)$fx['rates']['USD'];
    }
}

[$body, $status] = fetch_json($SOURCE_URL);
$err = '';

if (!$body || $status !== 200) {
    echo "fetch failed: HTTP $status" . ($err ? " ($err)" : '') . "\n";
    exit;
}

$data = json_decode($body, true);
if (!$data || empty($data['matches'])) {
    echo "parse failed or empty payload\n";
    exit;
}

$convert = function ($cad) use ($rate) {
    if ($cad === null || $cad === '') return null;
    return round((float)$cad * $rate);
};

$matches = [];
foreach ($data['matches'] as $m) {
    $num = (int)($m['matchNumber'] ?? 0);
    if ($num <= 0) continue;
    $matches[$num] = [
        'seats'    => (int)($m['seatCount'] ?? 0),
        'priceMin' => $convert($m['youPayMin'] ?? null),
        'priceMed' => $convert($m['youPayMed'] ?? null),
        'priceMax' => $convert($m['youPayMax'] ?? null),
        'cats'     => $m['cats'] ?? null,
    ];
}

$out = [
    'updated'          => gmdate('c'),
    'currency'         => 'USD',
    'fxRate'           => $rate,
    'totalSeats'       => (int)($data['totalSeats'] ?? 0),
    'totalMatches'     => (int)($data['totalMatches'] ?? 104),
    'matchesWithSeats' => (int)($data['matchesWithSeats'] ?? 0),
    'sourceScannedAt'  => $data['matches'][0]['scannedAt'] ?? null,
    'matches'          => $matches,
];

if (!is_dir(dirname($JSON_PATH))) @mkdir(dirname($JSON_PATH), 0755, true);
file_put_contents($JSON_PATH, json_encode($out, JSON_UNESCAPED_SLASHES));

echo "ok: " . count($matches) . " matches, " . number_format($out['totalSeats']) . " seats\n";
echo "fx rate (CAD->USD): " . $rate . "\n";
echo "updated: " . $out['updated'] . "\n";
