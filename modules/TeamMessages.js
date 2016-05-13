Modules.TeamMessages = (function() {
	var bcplus = null;
	var teamMembers = {};
	var optOutTeam = {};
	
	var teamMessageRegex = /^#team#(.*?)#(.*)$/;
	var receivedTeamMessages = [];
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		getTeamMembers();
		addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('.teamMessage .receiver { color: #0000ff !important; }');
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageAdded', getTeamMembers);
		
		bcplus.addCommand(['team', 't'], function() {
			var message = '#team#' + String.generateUUID().slice(0, 8) + '#' + $.makeArray(arguments).join(', ');
			
			Object.keys(teamMembers).forEach(function(userID) {
				if ((!optOutTeam.hasOwnProperty(userID)) && (WCF.User.userID.toString(10) !== userID)) {
					bcplus.sendMessage('/f ' + teamMembers[userID] + ', ' + message);
				}
			});
			
			return null;
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			if ((messageNodeEvent.messageType === bcplus.messageType.WHISPER) && teamMembers.hasOwnProperty(messageNodeEvent.sender)) {
				var match = messageNodeEvent.messageText.match(teamMessageRegex);
				
				if (null !== match) {
					if (receivedTeamMessages.hasOwnProperty(match[1])) {
						messageNodeEvent.messageNode.remove();
						
						return false;
					}
					else {
						receivedTeamMessages[match[1]] = true;
						
						messageNodeEvent.messageText = messageNodeEvent.messageText.slice(15);
						messageNodeEvent.receiverUsername = 'Team';
						
						if (messageNodeEvent.messageNodeType === bcplus.messageNodeType.BUBBLEFOLLOWUP) {
							// TODO: remove team message indicator
							messageNodeEvent.messageNode.addClass('teamMessage');
						}
						else {
							messageNodeEvent.messageNode.addClass('teamMessage');
							messageNodeEvent.messageNode.find('.timsChatText').html(messageNodeEvent.messageNode.find('.timsChatText').html().trim().slice(15));
							messageNodeEvent.messageNode.find('.receiver').text(messageNodeEvent.receiverUsername);
						}
					}
				}
			}
		});
		
		// bcplus.addExternalCommand();
	};
	
	var getTeamMembers = function() {
		var userList = Window.be.bastelstu.Chat.getUserList().allTime;
		
		Object.keys(userList).forEach(function(userID) {
			if (userList[userID].mod) {
				if (!teamMembers.hasOwnProperty(userID)) {
					teamMembers[userID] = userList[userID].username;
				}
			}
			else if (teamMembers.hasOwnProperty(userID)) {
				delete teamMembers[userID];
			}
		});
		
		teamMembers[13391] = 'Leon';
		teamMembers[114853] = 'BCPlus Test User';
	};
	
	return {
		initialize:	initialize
	};
})();
