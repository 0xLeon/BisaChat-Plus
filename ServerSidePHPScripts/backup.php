<?php
set_error_handler(function($errorNo, $message, $filename, $lineNo) {
	header('HTTP/1.1 500 Internal Server Error');
	exit(0);
}, E_ALL);

if (!empty($_POST['userID']) && !empty($_POST['settings'])) {
	$userID = intval($_POST['userID']);
	
	if (file_exists('./data/'.$userID)) {
		$data = unserialize(file_get_contents('./data/'.$userID));
		
		if (count($data) === 7) {
			array_shift($data);
		}
		
		array_push($data, array(
			'timestamp' => time(),
			'data' => json_decode($_POST['settings'])
		));
		file_put_contents('./data/'.$userID, serialize($data));
		header('HTTP/1.1 200 OK');
	}
	else {
		$data = array(
			array(
				'timestamp' => time(),
				'data' => json_decode($_POST['settings'])
			)
		);
		
		file_put_contents('./data/'.$userID, serialize($data));
		header('HTTP/1.1 200 OK');
	}
}
else {
	header('HTTP/1.1 400 Bad Request');
	exit(0);
}
