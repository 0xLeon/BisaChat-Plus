#!/usr/bin/php
<?php
/**
 * Buildscript for BisaChatPlus
 * 
 * @author Tim Düsterhus
 */
if (strtolower(php_sapi_name()) != 'cli') die("The build-script has to be invoked from cli\n");


echo "Welcome to Buildscript for Bisachat-Plus\n";
$options = parseParams($argv);

if (file_exists('builds/.lastversion')) {
	$options['version'] = file_get_contents('builds/.lastversion');
}
else {
	$options['version'] = 'Unknown'; 
}

if ($argc === 1) {
	echo "Which version do you want to build (Last was ".$options['version'].")?\n";
	echo "Version number strings should follow the 'PHP-standarized' version \nnumber string guidline.\n";
	echo "Enter version string and press enter:\n";
	echo "> ";
	$options['version'] = trim(fread(STDIN, 1024));
	echo "I will use ".$options['version']." as version number\n";
	
	do {
		echo "Do you want to include all available modules? (Y/N)\n";
		echo "> ";
		$input = strtoupper(trim(fread(STDIN, 1024)));
		
		if ($input === 'Y') {
			$options['modules'] = array_map(function($item) {
				return basename($item, '.js');
			}, glob('modules/*'));
		}
	} while ($input !== 'Y' && $input !== 'N');
	
	do {
		echo "Do you want a minified version? (Y/N)\n";
		echo "> ";
		$input = strtoupper(trim(fread(STDIN, 1024)));
		
		if ($input == 'Y') {
			$options['minify'] = true;
			echo "I will minify the script\n";
		}
	} while ($input !== 'Y' && $input !== 'N');
	
	echo "I have everything i need, starting build";
	for ($i = 0; $i < 3; $i++) {
		echo ".";
		usleep(1E6/2);
	}
	echo "\n\n";
}

// build
// find namespaces
$namespaces = glob('namespaces/*');
// find ProtoBasic files
$protoBasicFiles = array('Object', 'Function', 'Class', 'Enumerable', 'Array', 'Hash', 'String', 'RegExp', 'Date');
// find tools
$tools = glob('tools/*');
// find media resources
$mediaResources = glob('media/*');

// fileinfo object
$finfo = new finfo(FILEINFO_MIME_TYPE);

// read in header
$result = file_get_contents('header.js')."\n";

// add namespaces
foreach ($namespaces as $namespace) {
	echo "Adding namespace: ".$namespace."\n";
	$result .= file_get_contents($namespace)."\n";
}

// add ProtoBasic files
foreach ($protoBasicFiles as $protoBasicFile) {
	echo "Adding ProtoBasic file: ProtoBasic/".$protoBasicFile.".js\n";
	$result .= file_get_contents('ProtoBasic/'.$protoBasicFile.'.js')."\n";
}

// add tools
foreach ($tools as $tool) {
	echo "Adding tool: ".$tool."\n";
	$result .= file_get_contents($tool)."\n";
}

// add media resources
foreach ($mediaResources as $mediaResource) {
	echo "Adding resource: ".$mediaResource."\n";
	
	$name = substr(basename($mediaResource), 0, strrpos(basename($mediaResource), '.'));
	$mimeType = $finfo->file($mediaResource);
	$base64Content = base64_encode(file_get_contents($mediaResource));
	$result .= <<<MEDIA
Media.$name = {
	mimeType: '$mimeType',
	content: '$base64Content',
	get dataURI() {
		return 'data:'+this.mimeType+';base64,'+this.content;
	}
};


MEDIA;
}

// add modules
foreach ($options['modules'] as $module) {
	if (file_exists('./modules/'.$module.'.js')) {
		echo "Adding module: ".$module."\n";
		$result .= file_get_contents('./modules/'.$module.'.js')."\n";
	}
	else {
		echo "Module ".$module." doesn't exist!\n";
	}
}

$result .= file_get_contents('BisaChatPlus.js');
$result = str_replace('{version}', $options['version'], $result);

if ($options['minify']) {
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
echo "Writing file builds/BisaChat Plus ".$options['version'].' '.$time.".user.js\n";
// Write file
file_put_contents('builds/BisaChat Plus '.$options['version'].' '.$time.'.user.js', $result);
// save version
file_put_contents('builds/.lastversion', $options['version']);
echo "Finished\n";

if ($argc == 1) {
	echo "Press Enter to exit...";
	fread(STDIN, 1024); 
}


function parseParams($argv) {
	$options = array(
		'version' => '',
		'minify' => false,
		'modules' => array('AbstractModule')
	);
	
	for ($i = 1, $length = count($argv); $i < $length; $i++) {
		$command = substr($argv[$i], 2, (((strrpos($argv[$i], '-')-1) > 2) ? (strrpos($argv[$i], '-')-1) : (strlen($argv[$i])-1)));
		
		if (strrpos($command, '-') === (strlen($command)-1)) {
			$command = substr($command, 0, strlen($command)-1);
		}
		
		switch ($command) {
			case 'version':
				$options['version'] = substr($argv[$i], strrpos($argv[$i], '-')+1);
				break;
			case 'minify':
				$options['minify'] = true;
				break;
			case 'with-module':
				$options['modules'][] = substr($argv[$i], strrpos($argv[$i], '-')+1);
				break;
		}
	}
	
	$options['modules'] = array_unique($options['modules']);
	
	return $options;
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
