<?php
$dirs = glob('./releases/*', GLOB_ONLYDIR);
$latest = '0.0.0';
$rawVersion = '';

$dirs = array_map(function($value) {
	return str_replace('./releases/', '', $value);
}, $dirs);

foreach ($dirs as $dir) {
	if (preg_match('/dev|a|b|rc/i', $dir) > 0) continue;
	if (version_compare($dir, $latest, '>')) {
		$latest = $rawVersion = $dir;
	}
}

if (file_exists('./releases/latest.user.js')) unlink('./releases/latest.user.js');
symlink('./'.$latest.'/BisaChat Plus '.$latest.'.user.js', './releases/latest.user.js');
echo readlink('./releases/latest.user.js');
?>
