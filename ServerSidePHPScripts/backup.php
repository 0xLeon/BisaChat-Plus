<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_POST['username']) && isset($_POST['password'])) {
	checkLogin($_POST['username'], $_POST['password']);
	
	if (isset($_POST['settings'])) {
		$username = $_POST['username'];
		
		if (file_exists('./data/'.$username)) {
			$data = unserialize(file_get_contents('./data/'.$username));
			
			if (count($data) === 7) {
				array_shift($data);
			}
			
			array_push($data, array(
				'timestamp' => time(),
				'data' => json_decode($_POST['settings'])
			));
			file_put_contents('./data/'.$username, serialize($data));
			header('HTTP/1.1 200 OK');
		}
		else {
			$data = array(
				array(
					'timestamp' => time(),
					'data' => json_decode($_POST['settings'])
				)
			);
			
			file_put_contents('./data/'.$username, serialize($data));
			header('HTTP/1.1 200 OK');
		}
	}
	else {
		header('HTTP/1.1 400 Bad Request');
		exit(0);
	}
}
else {
	header('HTTP/1.0 401 Unauthorized');
	exit(0);
}
