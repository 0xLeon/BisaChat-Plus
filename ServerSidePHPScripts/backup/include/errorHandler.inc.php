<?php
class AjaxException extends Exception {
	protected $httpStatusCode;
	protected $httpStatusMessage;
	protected $httpStatusMessages = array(
		400 => 'Bad Request',
		401 => 'Unauthorized',
		403 => 'Forbidden',
		404 => 'Not Found',
		405 => 'Method Not Allowed',
		406 => 'Not Acceptable',
		418 => 'I\'m a Teapot',
		
		500 => 'Internal Server Error',
		501 => 'Not Implemented',
		503 => 'Service Unavailable'
	);
	
	public function __construct($message = '', $code = 0, $httpStatusCode = 503) {
		parent::__construct($message, $code);
		$this->httpStatusCode = $httpStatusCode;
	}
	
	public function getHttpStatusCode() {
		return $this->httpStatusCode;
	}
	
	public function getHttpStatusMessage() {
		return $this->httpStatusMessages[$this->getHttpStatusCode()];
	}
	
	public function show() {
		@header('HTTP/1.1 '.$this->getHttpStatusCode().' '.$this->getHttpStatusMessage());
		@header('Content-Type: text/xml');
		echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
		echo '<error type="'.intval($this->getCode()).'" line="'.intval($this->getLine()).'">'."\n";
		echo "\t".'<message>'.htmlspecialchars($this->getMessage(), ENT_COMPAT, 'UTF-8').'</message>'."\n";
		echo "\t".'<filename>'.htmlspecialchars($this->getFile(), ENT_COMPAT, 'UTF-8').'</filename>'."\n";
		echo '</error>';
	}
}

set_error_handler(function($errorNo, $message, $filename, $lineNo) {
	$type = 'error';
	switch ($errorNo) {
		case 2: $type = 'warning';
			break;
		case 8: $type = 'notice';
			break;
	}
	
	throw new AjaxException('PHP '.$type.' in file '.$filename.' ('.$lineNo.'): '.$message, $errorNo);
}, E_ALL);

set_exception_handler(function(Exception $e) {
	if ($e instanceof AjaxException) [
		$e->show();
		exit;
	}
	
	print $e;
});
