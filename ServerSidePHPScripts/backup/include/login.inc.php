<?php
function checkLogin($username, $password) {
	$username = preg_replace('[^A-Za-z0-9_\-\.]', '', $username);
	
	if (file_exists('./login/'.$username)) {
		$data = unserialize(file_get_contents('./login/'.$username));
		
		if ($data['passwordHash'] === sha1(sha1($username.$data['salt']).sha1($password.$data['salt']))) {
			return true;
		}
		else {
			throw new AjaxException('Wrong password', E_NOTICE, 401);
		}
	}
	else {
		throw new AjaxException('User '.$username.' doesn\'t exist', E_NOTICE, 401);
	}
}
