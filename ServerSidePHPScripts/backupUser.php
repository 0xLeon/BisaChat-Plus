<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_REQUEST['action'])) {
	if ($_POST['action'] === 'createUser') {
		if (isset($_POST['username']) && isset($_POST['password'])) {
			$username = $_POST['username'];
			$password = $_POST['password'];
			
			if (preg_match('/^[A-Za-z0-9_\-\.]{3,20}$/', $username)) {
				if (!file_exists('./login/'.$username)) {
					$salt = sha1(microtime().uniqid(mt_rand(), true));
					$data = array(
						'passwordHash' => sha1(sha1($username.$salt).sha1($password.$salt)),
						'salt' => $salt
					);
					file_put_contents('./login/'.$username, serialize($data));
					@chmod('./login/'.$username, 0777);
					
					header('HTTP/1.1 200 OK');
					exit(0);
				}
				else {
					header('HTTP/1.1 400 Bad Request');
					exit(0);
				}
			}
			else {
				trigger_error('Invalid username', E_USER_ERROR);
			}
		}
		else {
			header('HTTP/1.1 400 Bad Request');
			exit(0);
		}
	}
	else if ($_POST['action'] === 'alterPassword') {
		if (isset($_POST['username']) && isset($_POST['oldPassword']) && isset($_POST['newPassword'])) {
			checkLogin($_POST['username'], $_POST['oldPassword']);
			
			$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_POST['username']);
			$newPassword = $_POST['newPassword'];
			
			if (file_exists('./login/'.$username)) {
				$salt = sha1(microtime().uniqid(mt_rand(), true));
				$data = array(
					'passwordHash' => sha1(sha1($username.$salt).sha1($newPassword.$salt)),
					'salt' => $salt
				);
				file_put_contents('./login/'.$username, serialize($data));
				@chmod('./login/'.$username, 0777);
				
				header('HTTP/1.1 200 OK');
				exit(0);
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
	else if ($_POST['action'] === 'deleteUser') {
		if (isset($_POST['username']) && isset($_POST['password'])) {
			checkLogin($_POST['username'], $_POST['password']);
			
			$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_POST['username']);
			
			if (file_exists('./login/'.$username)) {
				@unlink('./login/'.$username);
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
	else if ($_GET['action'] === 'checkUser') {
		
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
