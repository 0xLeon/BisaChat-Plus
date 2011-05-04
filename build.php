#!/usr/bin/php
<?php
/**
 * Buildscript for BisaChatPlus
 * 
 * @author Tim Düsterhus
 */
if (strtolower(php_sapi_name()) != 'cli') die("The build-script has to be invoked from cli\n");
// configure
echo "Welcome to Buildscript for Bisachat-Plus\n";
if (file_exists('builds/.lastversion')) {
	$lastVersion = file_get_contents('builds/.lastversion');
}
else {
	$lastVersion = 'Unknown'; 
}
if ($argc == 1) {
	echo "Which version do you want to build (Last was ".$lastVersion.")?\n";
	echo "Version number strings should follow the 'PHP-standarized' version number string guidline.\n";
	echo "Enter version string and press enter:\n";
	echo "> ";
	$version = trim(fread(STDIN, 1024));
	if (empty($version)) $version = $lastVersion;
	file_put_contents('builds/.lastversion', $version);
	echo "I will use ".$version." as version number\n";

	do {
		echo "Do you want a minified version? (Y/N)\n";
		echo "> ";
		$input = strtoupper(trim(fread(STDIN, 1024)));
		if ($input == 'Y') $minify = true;
		else if ($input == 'N') $minify = false;
	}
	while ($input != 'Y' && $input != 'N');
	
	if ($minify) {
		echo "I will minify the script\n";
	}
	echo "I have everything i need, starting build";
	for ($i = 0; $i < 3; $i++) {
		echo ".";
		usleep(1E6/2);
	}
	echo "\n\n";
}
else {
	if ($argc == 2) {
		$version = $lastVersion;
		$minify = ($argv[1] == 'Y');
	}
	else {
		$version = $argv[2];
		$minify = ($argv[1] == 'Y');
	}
}

// build
// find the tools
$tools = glob('tools/*');
// find the modules
$modules = glob('modules/*');

$result = file_get_contents('header.js');
$packageList = array();
// Add the tools first
foreach ($tools as $tool) {
	echo "Adding tool: ".$tool."\n";
	$result .= file_get_contents($tool)."\n";
}

// Add all modules
foreach ($modules as $module) {
	echo "Adding module: ".$module."\n";
	$result .= file_get_contents($module)."\n";
	// add classname to packagelist
	$packageList[] = basename($module, '.js');
}

$bcplus = file_get_contents('BisaChatPlus.js');
// Set packagelist
$bcplus = str_replace('/* {packages} */', implode(",\n\t\t", $packageList), $bcplus);
$result .= $bcplus;
$result = str_replace('{version}', $version, $result);

if ($minify) {
	echo "Minifying\n";
	$result = preg_replace_callback("~('.*?')~", 'removeStrings', $result);
	$result = preg_replace_callback("~(// ==UserScript==.*// ==/UserScript==)~s", 'removeHeader', $result);
	$result = preg_replace('~/\\*.*\\*/~Us', '', $result);
	$result = preg_replace('~//.*~', '', $result);
	$result = str_replace(array("\t","\r"), '', $result);
	$result = str_replace("\n\n", "\n", $result);
	$result = StringStack::reinsertStrings($result, 'string');
	$result = StringStack::reinsertStrings($result, 'header');
}
$time = time();
echo "Writing file builds/BisaChat Plus ".$version.' '.$time.".user.js\n";
// Write file
file_put_contents('builds/BisaChat Plus '.$version.' '.$time.'.user.js', $result);
echo "Finished\n";

if ($argc == 1) {
	echo "Press Enter to exit...";
	fread(STDIN, 1024); 
}




function removeStrings($matches) {
	return StringStack::pushToStringStack($matches[1], 'string');
}
function removeHeader($matches) {
	return StringStack::pushToStringStack($matches[1]."\n", 'header');
}

/**
 * Replaces quoted strings in a text.
 * 
 * @author 	Marcel Werk
 * @copyright	2001-2009 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf
 * @subpackage	util
 * @category 	Community Framework
 */
class StringStack {
	protected static $stringStack = array();
	
	/**
	 * Replaces a string with an unique hash value.
	 *
	 * @param 	string 		$string
	 * @param 	string	 	$type
	 * @return	string		$hash
	 */
	public static function pushToStringStack($string, $type = 'default') {
		$hash = '@@'.sha1(uniqid(microtime()).$string).'@@';
		
		if (!isset(self::$stringStack[$type])) {
			self::$stringStack[$type] = array();
		}
		
		self::$stringStack[$type][$hash] = $string;
		
		return $hash;
	}
	
	/**
	 * Reinserts Strings that have been replaced by unique hash values.
	 *
	 * @param 	string 		$string
	 * @param 	string	 	$type
	 * @return 	string 		$string
	 */
	public static function reinsertStrings($string, $type = 'default') {
		if (isset(self::$stringStack[$type])) {
			foreach (self::$stringStack[$type] as $hash => $value) {
				if (strpos($string, $hash) !== false) {
					$string = str_replace($hash, $value, $string);
					unset(self::$stringStack[$type][$hash]);
				}
			}
		}
		
		return $string;
	}
	
	/**
	 * Returns the stack.
	 *
	 * @param 	string		$type
	 * @return	array
	 */
	public static function getStack($type = 'default') {
		if (isset(self::$stringStack[$type])) {
			return self::$stringStack[$type];
		}
		
		return array();
	}
}
