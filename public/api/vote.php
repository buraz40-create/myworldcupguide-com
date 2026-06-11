<?php
// Kit voting endpoint for /kits page.
//
// Accepts: POST {"id": "ARG_home", "direction": "up"|"down"}
// Returns: JSON {"ok": true, "counts": {"up": N, "down": N}}
//
// Storage: public/api/votes.json . single JSON file, atomic file-lock writes.
// Good enough for ~tens-of-thousands of total votes; if traffic blows past that,
// migrate to SQLite or Supabase.
//
// Anti-abuse (minimal):
//  - One vote per (ip, id, direction) tracked in votes.json's `seen` map
//  - 1 vote/sec/IP rate limit via $_SESSION
//  - No login; users can clear cookies to re-vote (acceptable for a soft poll)

header('Content-Type: application/json');
// Echo back the request Origin when it's one of our hosts. The site is reachable
// at both www and non-www, so a hardcoded non-www value silently CORS-blocks every
// vote for visitors on www (counts never load, votes appear to do nothing).
$allowed_origins = ['https://myworldcupguide.com', 'https://www.myworldcupguide.com'];
$req_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($req_origin, $allowed_origins, true) ? $req_origin : 'https://myworldcupguide.com'));
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// GET = read current totals (used by client to hydrate on page load)
$STORE = __DIR__ . '/votes.json';

function load_store($path) {
    if (!file_exists($path)) {
        return ['counts' => new stdClass(), 'seen' => new stdClass()];
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    if (!is_array($data)) return ['counts' => new stdClass(), 'seen' => new stdClass()];
    if (!isset($data['counts'])) $data['counts'] = new stdClass();
    if (!isset($data['seen']))   $data['seen']   = new stdClass();
    return $data;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = load_store($STORE);
    echo json_encode(['ok' => true, 'counts' => $data['counts']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method not allowed']);
    exit;
}

// Parse and validate body
$body = json_decode(file_get_contents('php://input'), true);
$id = isset($body['id']) ? (string)$body['id'] : '';
$dir = isset($body['direction']) ? (string)$body['direction'] : '';

if (!preg_match('/^[A-Z]{3}_(home|away)$/', $id)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid id']);
    exit;
}
if ($dir !== 'up' && $dir !== 'down') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid direction']);
    exit;
}

// Rate limit (1/sec/IP, very loose . just blocks scripted hammer)
session_start();
$now = time();
if (isset($_SESSION['last_vote']) && ($now - $_SESSION['last_vote']) < 1) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'slow down']);
    exit;
}
$_SESSION['last_vote'] = $now;

// IP for the seen-map (helps dedupe same-browser double-clicks)
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = explode(',', $ip)[0];
$seen_key = hash('sha256', $ip . '|' . $id . '|' . $dir);

// Locked read-modify-write of votes.json
$fp = fopen($STORE, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'storage open failed']);
    exit;
}
flock($fp, LOCK_EX);
rewind($fp);
$raw = stream_get_contents($fp);
$data = json_decode($raw, true);
if (!is_array($data)) $data = ['counts' => [], 'seen' => []];
if (!isset($data['counts'])) $data['counts'] = [];
if (!isset($data['seen']))   $data['seen']   = [];

// Already voted? Idempotent return of current counts.
if (isset($data['seen'][$seen_key])) {
    $counts = isset($data['counts'][$id]) ? $data['counts'][$id] : ['up' => 0, 'down' => 0];
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['ok' => true, 'counts' => $counts, 'duplicate' => true]);
    exit;
}

if (!isset($data['counts'][$id])) $data['counts'][$id] = ['up' => 0, 'down' => 0];
$data['counts'][$id][$dir] = (int)$data['counts'][$id][$dir] + 1;
$data['seen'][$seen_key] = $now;

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($data));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['ok' => true, 'counts' => $data['counts'][$id]]);
