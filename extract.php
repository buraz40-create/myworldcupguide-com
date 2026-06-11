<?php
header('Content-Type: text/plain');
$expected = '214fdb3cdfe6e09846b7c9baee444ad9';
if (!isset($_GET['t']) || !hash_equals($expected, $_GET['t'])) { http_response_code(403); exit("forbidden\n"); }
$root = __DIR__;
$report = [];

// Files that MUST be preserved across deploys (accumulated server state).
// If the file already exists with content, we skip extracting it from the zip.
$preserve = ['api/votes.json'];

// Clean up backslash-named files (Windows-zip path quirk)
$deleted = 0;
foreach (scandir($root) as $name) {
    if ($name === '.' || $name === '..') continue;
    if (strpos($name, "\\") !== false) {
        $path = $root . DIRECTORY_SEPARATOR . $name;
        if (is_file($path)) { @unlink($path); $deleted++; }
    }
}
$report[] = "deleted $deleted backslash-named files";

// Wipe directories whose contents are fully regenerated on every build, so
// renamed/removed pages don't linger and serve stale data. ?wipe=matches in
// the URL adds extra directories to the wipe list for one-off migrations.
$wipeDirs = ['matches'];
if (isset($_GET['wipe'])) {
    foreach (explode(',', $_GET['wipe']) as $d) {
        $d = preg_replace('/[^a-z0-9_\\-\\/]/i', '', $d);
        if ($d !== '' && !in_array($d, $wipeDirs, true)) $wipeDirs[] = $d;
    }
}
$wiped = 0;
function rrmdir($dir) {
    global $wiped;
    if (!is_dir($dir)) return;
    foreach (scandir($dir) as $n) {
        if ($n === '.' || $n === '..') continue;
        $p = $dir . DIRECTORY_SEPARATOR . $n;
        if (is_dir($p)) rrmdir($p);
        else { @unlink($p); $wiped++; }
    }
    @rmdir($dir);
}
foreach ($wipeDirs as $d) {
    $p = $root . DIRECTORY_SEPARATOR . $d;
    if (is_dir($p)) rrmdir($p);
}
$report[] = "wiped " . count($wipeDirs) . " dirs (" . implode(',', $wipeDirs) . "), removed $wiped files";

$zipPath = $root . '/site.zip';
if (!file_exists($zipPath)) { $report[] = "site.zip missing"; echo implode("\n", $report) . "\n"; @unlink(__FILE__); exit; }
$zip = new ZipArchive();
$rc = $zip->open($zipPath);
if ($rc !== true) { $report[] = "zip open failed ($rc)"; echo implode("\n", $report) . "\n"; @unlink(__FILE__); exit; }

$total = $zip->numFiles;
$preserved = 0;
$extracted = 0;
$entriesToExtract = [];

for ($i = 0; $i < $total; $i++) {
    $entry = $zip->getNameIndex($i);
    if (!$entry) continue;
    // Normalize the path the way bsdtar emits it ("./foo/bar")
    $relative = preg_replace('#^\./#', '', $entry);
    // Skip preserved files if they already exist with content on the server
    if (in_array($relative, $preserve, true)) {
        $existing = $root . '/' . $relative;
        if (file_exists($existing) && filesize($existing) > 0) {
            $preserved++;
            continue;
        }
    }
    $entriesToExtract[] = $entry;
}

// extractTo with a name list only extracts those entries
$ok = $zip->extractTo($root, $entriesToExtract);
$extracted = $ok ? count($entriesToExtract) : 0;
$zip->close();

$report[] = $ok ? "extracted $extracted entries, preserved $preserved" : "extractTo failed";
@unlink($zipPath);
echo implode("\n", $report) . "\n";
@unlink(__FILE__);
