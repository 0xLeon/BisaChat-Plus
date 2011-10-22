<?php
require_once('./include/errorHandler.inc.php');
require_once('./include/login.inc.php');

if (isset($_POST['action'])) {
	if ($_POST['action'] === 'createUser') {
		if (isset($_POST['username']) && isset($_POST['password']) && !empty($_POST['username']) && !empty($_POST['password'])) {
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
					file_put_contents('./data/'.$username, serialize(array()));
					@chmod('./login/'.$username, 0777);
					@chmod('./data/'.$username, 0777);
					
					header('HTTP/1.1 200 OK');
					exit(0);
				}
				else {
					throw new AjaxException('User \''.$username.'\' already exists', E_ERROR, 400);
				}
			}
			else {
				throw new AjaxException('Invalid username \''.$username.'\'', E_ERROR, 401);
			}
		}
		else {
			throw new AjaxException('Missing user data', E_ERROR, 400);
		}
	}
	else if ($_POST['action'] === 'alterPassword') {
		if (isset($_POST['username']) && isset($_POST['oldPassword']) && isset($_POST['newPassword']) && !empty($_POST['newPassword'])) {
			checkLogin($_POST['username'], $_POST['oldPassword']);
			
			$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_POST['username']);
			$newPassword = $_POST['newPassword'];
			
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
			throw new AjaxException('Missing user data', E_ERROR, 400);
		}
	}
	else if ($_POST['action'] === 'deleteUser') {
		if (isset($_POST['username']) && isset($_POST['password'])) {
			checkLogin($_POST['username'], $_POST['password']);
			
			$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_POST['username']);
			
			@unlink('./login/'.$username);
			@unlink('./data/'.$username);
		}
		else {
			throw new AjaxException('Missing user data', E_ERROR, 400);
		}
	}
	else {
		throw new AjaxException('Can\'t execute action \''.$_POST['action'].'\'', E_ERROR, 400);
	}
}
else if (isset($_GET['action'])) {
	if ($_GET['action'] === 'checkUserExists') {
		if (isset($_GET['username'])) {
			$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $_GET['username']);
			
			if (file_exists('./login/'.$username)) {
				header('HTTP/1.1 200 OK');
				exit(0);
			}
			else {
				throw new AjaxException('User '.$username.' doesn\'t exist', E_NOTICE, 404);
			}
		}
		else {
			throw new AjaxException('Missing user data', E_ERROR, 400);
		}
	}
	else if ($_GET['action'] === 'checkLoginData') {
		if (isset($_GET['username']) && isset($_GET['password'])) {
			checkLogin($_GET['username'], $_GET['password']);
		}
		else {
			throw new AjaxException('Missing user data', E_ERROR, 400);
		}
	}
	else {
		throw new AjaxException('Can\'t execute action \''.$_GET['action'].'\'', E_ERROR, 400);
	}
}
else {
	throw new AjaxException('No action given', E_ERROR, 400);
}
