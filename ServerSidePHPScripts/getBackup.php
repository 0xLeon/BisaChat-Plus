<?php
set_error_handler(function($errorNo, $message, $filename, $lineNo) {
	header('HTTP/1.1 500 Internal Server Error');
	exit(0);
}, E_ALL);

if (isset($_GET['action'])) {
	if (($_GET['action'] === 'getList') && isset($_GET['userID'])) {
		if (file_exists('./data/'.intval($_GET['userID']))) {
			$data = unserialize(file_get_contents('./data/'.intval($_GET['userID'])));
			
			header('Content-Type: text/xml');
			echo '<?xml version="1.0" encoding="UTF-8" ?>'."\n";
			echo '<settings>'."\n";
			foreach ($data as $key => $entry) {
				echo "\t".'<entry>'."\n";
				echo "\t\t".'<index>'.(string)$key.'</index>'."\n";
				echo "\t\t".'<timestamp>'.$entry['timestamp'].'</timestamp>'."\n";
				echo "\t".'</entry>'."\n";
			}
			echo '</settings>';
		}
		else {
			header('HTTP/1.1 404 Not Found');
			exit(0);
		}
	}
	else if (($_GET['action'] === 'getData') && isset($_GET['userID']) && isset($_GET['index'])) {
		if (file_exists('./data/'.intval($_GET['userID']))) {
			$data = unserialize(file_get_contents('./data/'.intval($_GET['userID'])));
			
			if (isset($data[intval($_GET['index'])])) {
				header('Content-Type: application/json');
				echo json_encode($data[intval($_GET['index'])]['data']);
			}
			else {
				header('HTTP/1.1 404 Not Found');
				exit(0);
			}
		}
		else {
			header('HTTP/1.1 404 Not Found');
			exit(0);
		}
	}
	else {
		header('HTTP/1.1 400 Bad Request');
		exit(0);
	}
}
else {
	header('HTTP/1.1 400 Bad Request');
	exit(0);
}
