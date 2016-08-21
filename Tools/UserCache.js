var UserCache = (function() {
	var __cache = {};
	
	var loadUser = function(userID, resolve, reject) {
		(new WCF.Action.Proxy({
			showLoadingOverlay: false,
			data: {
				actionName: 'getUserProfile',
				className: 'wcf\\data\\user\\UserProfileAction',
				objectIDs: [userID]
			},
			success: function(data, textStatus, jqXHR) {
				var $userData = $(data.returnValues.template);
				
				if ($userData.find('.userInformation').length > 0) {				
					__cache[data.returnValues.userID] = {
						userID:		data.returnValues.userID,
						username:	$userData.find('.userInformation .containerHeadline a').text(),
						rank:		$userData.find('.badge.userTitleBadge').text(),
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
	
	var getUser = function(userID) {
		return new Promise(function(resolve, reject) {
			if (__cache.hasOwnProperty(userID)) {
				resolve(__cache[userID]);
			}
			else {
				loadUser(userID, resolve, reject);
			}
		});
	};
	
	var getUsers = function(userIDs) {
		return new Promise(function(resolve, reject) {
			var users = {};
			
			var finishCounter = 0;
			var endCounter = userIDs.length;
			
			var finisher = function(user) {
				finishCounter++;
				users[user.userID] = user;
				
				if (finishCounter === endCounter) {
					resolve(users);
				}
			};
			var failurerer = function() {
				endCounter--;
				
				if (endCounter === 0) {
					reject();
				}
			};
			
			userIDs.forEach(function(userID, index) {
				loadUser(userID, finisher, failurerer);
			});
		});
	};
	
	return {
		getUser:	getUser,
		getUsers:	getUsers
	};
})();
