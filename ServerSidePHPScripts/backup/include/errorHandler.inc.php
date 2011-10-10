<?php
class AjaxException extends Exception {
	protected $httpStatusCode;
	protected $httpStatusMessage;
	
	public function __construct($message = '', $code = 0, $httpStatusCode = 0, $httpStatusMessage = '') {
		parent::__construct($message, $code);
		$this->httpStatusCode = $httpStatusCode;
		$this->httpStatusMessage = $httpStatusMessage;
	}
	
	public function getHttpStatusCode() {
		return $this->httpStatusCode;
	}
	
	public function getHttpStatusMessage() {
		return $this->httpStatusMessage;
	}
	
	public function show() {
		if (($this->getHttpStatusCode() > 0) && ($this->getHttpStatusMessage() !== '')) {
			@header('HTTP/1.1 '.$this->getHttpStatusCode().' '.$this->getHttpStatusMessage());
		}
		else {
			@header('HTTP/1.1 503 Service Unavailable');
		}
		
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
