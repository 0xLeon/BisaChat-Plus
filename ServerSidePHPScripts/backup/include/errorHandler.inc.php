<?php
set_error_handler(function($errorNo, $message, $filename, $lineNo) {
	header('HTTP/1.1 500 Internal Server Error');
	header('Content-Type: text/xml');
	
	echo '<error type="'.intval($errorNo).'" line="'.intval($lineNo).'">'."\n";
	echo "\t".'<message><![CDATA['.$message.']]></message>'."\n";
	echo "\t".'<filename><![CDATA['.$filename.']]></filename>'."\n";
	echo '</error>';
	
	exit(0);
}, E_ALL);
