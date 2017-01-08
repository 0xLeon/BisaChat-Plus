Util.UserCache = (function() {
	let __cache = {};
	
	let loadUser = function(userID, resolve, reject) {
		(new WCF.Action.Proxy({
			showLoadingOverlay: false,
			data: {
				actionName: 'getUserProfile',
				className: 'wcf\\data\\user\\UserProfileAction',
				objectIDs: [userID]
			},
			success: function(data, textStatus, jqXHR) {
				let $userData = $(data.returnValues.template);
				
				if ($userData.find('.userInformation').length > 0) {				
					__cache[data.returnValues.userID] = {
						userID:		data.returnValues.userID,
						username:	$userData.find('.userInformation .containerHeadline a').text(),
						rank:		$userData.find('.badge.userTitleBadge').text(),
						profile:	$userData.find('.userInformation .containerHeadline a').attr('href'),
						avatar:		$userData.find('.userAvatarImage').attr('src').replace(/(^.*\/\d+-.*?)(?:-\d+)?(\..*$)/, '$1$2'),
						
						rawData:	$userData
					};
					
					if ($.isFunction(resolve)) {
						resolve(__cache[data.returnValues.userID]);
					}
				}
				else {
					if ($.isFunction(reject)) {
						reject();
					}
				}
			},
			error: function() {
				if ($.isFunction(reject)) {
					reject();
				}
			}
		})).sendRequest();
	};
	
	let getUser = function(userID) {
		return new Promise(function(resolve, reject) {
			if (__cache.hasOwnProperty(userID)) {
				resolve(__cache[userID]);
			}
			else {
				loadUser(userID, resolve, reject);
			}
		});
	};
	
	let getUsers = function(userIDs) {
		return new Promise(function(resolve, reject) {
			let users = {};
			
			let finishCounter = 0;
			let endCounter = userIDs.length;
			
			let finisher = function(user) {
				finishCounter++;
				users[user.userID] = user;
				
				if (finishCounter === endCounter) {
					resolve(users);
				}
			};
			let failurerer = function() {
				endCounter--;
				
				if (endCounter === 0) {
					reject();
				}
			};
			
			userIDs.forEach(function(userID) {
				loadUser(userID, finisher, failurerer);
			});
		});
	};
	
	return {
		getUser:	getUser,
		getUsers:	getUsers
	};
})();
