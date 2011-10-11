<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_REQUEST['username']) && isset($_REQUEST['password'])) {
	checkLogin($_REQUEST['username'], $_REQUEST['password']);
	$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_REQUEST['username']);
	
	if (isset($_REQUEST['action'])) {
		if ($_POST['action'] === 'saveData') {
			if (isset($_POST['settings'])) {
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
					@chmod('./data/'.$username, 0777);
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
					@chmod('./data/'.$username, 0777);
					header('HTTP/1.1 200 OK');
				}
			}
			else {
				throw new AjaxException('no settings given', E_NOTICE, 400);
			}
		}
		else if ($_GET['action'] === 'getList') {
			if (file_exists('./data/'.$username)) {
				$data = unserialize(file_get_contents('./data/'.$username));
			}
			else {
				$data = array();
			}
			
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
		else if (($_GET['action'] === 'getData') && isset($_GET['index'])) {
			if (file_exists('./data/'.$username)) {
				$data = unserialize(file_get_contents('./data/'.$username));
			}
			else {
				$data = array();
			}
			
			if (isset($data[intval($_GET['index'])])) {
				header('Content-Type: application/json');
				echo json_encode($data[intval($_GET['index'])]['data']);
			}
			else {
				throw new AjaxException('index \''.intval($_GET['index']).'\' doesn\'t exist', E_NOTICE, 404);
			}
		}
		else if (($_POST['action'] === 'deleteData') && isset($_POST['index'])) {
			if (file_exists('./data/'.$username)) {
				$data = unserialize(file_get_contents('./data/'.$username));
			}
			else {
				$data = array();
			}
			
			if (isset($data[intval($_POST['index'])])) {
				unset($data[intval($_POST['index'])]);
				$data = array_filter($data);
				
				file_put_contents('./data/'.$username, serialize($data));
				@chmod('./data/'.$username, 0777);
				header('HTTP/1.1 200 OK');
			}
			else {
				throw new AjaxException('index \''.intval($_GET['index']).'\' doesn\'t exist', E_NOTICE, 404);
			}
		}
		else {
			throw new AjaxException('Can\'t execute action\''.$_REQUEST['action'].'\'', E_ERROR, 400);
		}
	}
	else {
		throw new AjaxException('no axtion given', E_ERROR, 400);
	}
}
else {
	throw new AjaxException('no login data given', E_ERROR, 401, 'Unauthorized');
}
