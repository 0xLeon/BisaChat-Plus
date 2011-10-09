<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_REQUEST['username']) && isset($_REQUEST['password'])) {
	checkLogin($_REQUEST['username'], $_REQUEST['password']);
	
	if (isset($_REQUEST['action'])) {
		if ($_POST['action'] === 'saveData') {
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
		else if ($_GET['action'] === 'getList') {
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
