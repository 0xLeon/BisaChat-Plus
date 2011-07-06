<?php
$inputVersion = (isset($_GET['version'])) ? $_GET['version'] : '0.0.0';
$getNonStableReleases = (isset($_GET['getNonStableReleases'])) ? (intval($_GET['getNonStableReleases']) === 1) : false;
$dirs = glob('./releases/*', GLOB_ONLYDIR);
$latest = '0.0.0';
$rawVersion = '';

$dirs = array_map(function($value) {
	return str_replace('./releases/', '', $value);
}, $dirs);

foreach ($dirs as $dir) {
	if (!$getNonStableReleases && preg_match('/dev|a|b|rc/i', $dir) > 0) continue;
	if (version_compare($dir, $latest, '>')) {
		$latest = $rawVersion = $dir;
	}
}

if (strpos($inputVersion, '.') === false) {
	$latest = str_replace('.', '', $latest);
}

header('Content-Type: text/xml');
echo '<?xml version="1.0" encoding="utf-8"?>'."\n";
if (version_compare($inputVersion, $latest, '<')) {
	echo '<update newVersion="true">'."\n";
	echo "\t".'<url>http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/releases/'.rawurlencode($rawVersion).'/BisaChat%20Plus%20'.rawurlencode($rawVersion).'.user.js</url>'."\n";
}
else {
	echo '<update newVersion="false">';
}
echo '</update>';
?>