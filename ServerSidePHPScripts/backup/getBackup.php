<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_GET['username']) && isset($_GET['password'])) {
	checkLogin($_GET['username'], $_GET['password']);
	
	if (isset($_GET['action'])) {
		if (($_GET['action'] === 'getList')) {
			if (file_exists('./data/'.$_GET['username'])) {
				$data = unserialize(file_get_contents('./data/'.$_GET['username']));
				
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
		else if (($_GET['action'] === 'getData') && isset($_GET['index'])) {
			if (file_exists('./data/'.$_GET['username'])) {
				$data = unserialize(file_get_contents('./data/'.$_GET['username']));
				
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
}
else {
	header('HTTP/1.0 401 Unauthorized');
	exit(0);
}
