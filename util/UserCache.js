Util.UserCache = (function() {
	let __cache = {};
	
	let loadUser = function(userID, resolve, reject, delay) {
		let proxy = new WCF.Action.Proxy({
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
						reject(userID);
					}
				}
			},
			error: function() {
				if ($.isFunction(reject)) {
					reject(userID);
				}
			}
		});
		
		window.setTimeout((function(proxy) {
			proxy.sendRequest();
		})(proxy), delay || 0);
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
			let users = Object.create(Object.prototype, {
				failed: {
					value: [],
					configurable: false,
					enumerable: false,
					writable: false
				}
			});
			
			let finishCounter = 0;
			let endCounter = userIDs.length;
			
			let finisher = function(user) {
				finishCounter++;
				users[user.userID] = user;
				
				if (finishCounter === endCounter) {
					resolve(users);
				}
			};
			let failurerer = function(userID) {
				endCounter--;
				users.failed.push(userID);
				
				if (endCounter === 0) {
					reject();
				}
				
				if (finishCounter === endCounter) {
					resolve(users);
				}
			};
			
			let delay = 0;
			
			userIDs.forEach(function(userID) {
				loadUser(userID, finisher, failurerer, delay);
				delay += 50;
			});
		});
	};
	
	return {
		getUser:	getUser,
		getUsers:	getUsers
	};
})();
