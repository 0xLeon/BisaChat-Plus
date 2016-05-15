Modules.TeamMessages = (function() {
	var bcplus = null;
	var teamMembers = {};
	var optOutTeam = {};
	
	var teamMessageRegex = /^#team#(.*?)#(.*)$/;
	var receivedTeamMessages = [];
	var receivedTeamMessagesClearer = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		getTeamMembers();
		addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('.timsChatMessage' + bcplus.messageType.TEAM.toString(10) + ' .timsChatUsernameContainer { font-weight: bold; }');
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
					if (receivedTeamMessages.indexOf(match[1]) > -1) {
						messageNodeEvent.messageNode.remove();
						
						return false;
					}
					else {
						receivedTeamMessages.push(match[1]);
						
						messageNodeEvent.messageText = messageNodeEvent.messageText.slice(15);
						messageNodeEvent.receiverUsername = 'Team';
						messageNodeEvent.messageType = bcplus.messageType.TEAM;
						
						if (messageNodeEvent.messageNodeType === bcplus.messageNodeType.BUBBLEFOLLOWUP) {
							messageNodeEvent.messageNode.removeClass('timsChatMessage' + bcplus.messageType.WHISPER.toString(10));
							messageNodeEvent.messageNode.addClass('timsChatMessage' + bcplus.messageType.TEAM.toString(10));
							messageNodeEvent.messageNode.html(messageNodeEvent.messageNode.html().trim().slice(15));
						}
						else {
							messageNodeEvent.messageNode.removeClass('timsChatMessage' + bcplus.messageType.WHISPER.toString(10));
							messageNodeEvent.messageNode.addClass('timsChatMessage' + bcplus.messageType.TEAM.toString(10));
							messageNodeEvent.messageNode.find('.timsChatText').html(messageNodeEvent.messageNode.find('.timsChatText').html().trim().slice(15));
							messageNodeEvent.messageNode.find('.receiver').text(messageNodeEvent.receiverUsername);
							messageNodeEvent.messageNode.find('.timsChatUsernameContainer').off('click').on('click', function() {
								Window.be.bastelstu.Chat.insertText('/team ', {
									prepend: false,
									append: false,
									submit: false
								});
							});
							messageNodeEvent.messageNode.find('.timsChatUsernameContainer .icon-double-angle-right').data('tooltip', 'Schreibt');
							$('<div class="timsChatMessageIcon"><span class="icon icon16 icon-user icon-users" /></div>').insertBefore(messageNodeEvent.messageNode.find('.timsChatInnerMessageContainer'));
						}
					}
				}
			}
		});
		
		receivedTeamMessagesClearer = new WCF.PeriodicalExecuter(function() {
			if (receivedTeamMessages.length > 10) {
				for (var i = receivedTeamMessages.length, m = Math.floor(receivedTeamMessages.length / 2); i > m; i--) {
					receivedTeamMessages.shift();
				}
			}
		}, 6000000);
		
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
