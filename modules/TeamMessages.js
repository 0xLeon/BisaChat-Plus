Modules.TeamMessages = (function() {
	var bcplus = null;
	var teamMembers = {};
	var optOutTeam = {};
	
	var teamMessageRegex = /^#team#(.*?)#(.*)$/;
	var receivedTeamMessages = [];
	var receivedTeamMessagesClearer = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		findTeamMembers();
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('.timsChatMessage' + bcplus.messageType.TEAM.toString(10) + ' .timsChatUsernameContainer { font-weight: bold; }');
	};
	
	var buildUI = function() {
		if (!teamMembers.hasOwnProperty(WCF.User.userID)) {
			return;
		}
		
		bcplus.addBoolOption('teamIgnore', 'Team-Nachrichten ignorieren', 'teamMessages', 'Team-Nachrichten', false, null);
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageAdded', findTeamMembers);
		
		bcplus.addCommand(['team', 't'], function() {
			if (!teamMembers.hasOwnProperty(WCF.User.userID)) {
				bcplus.showInfoMessage('Du hast nicht die Berechtigung den team-Befehl zu verwenden!');
				
				return null;
			}
			
			var message = '#team#' + String.generateUUID().slice(0, 8) + '#' + $.makeArray(arguments).join(', ');
			
			Object.keys(teamMembers).forEach(function(userID) {
				if ((!optOutTeam.hasOwnProperty(userID)) && (WCF.User.userID.toString(10) !== userID)) {
					bcplus.sendMessage('/f ' + teamMembers[userID] + ', ' + message);
				}
			});
			
			if (Modules.hasOwnProperty('CommandHistory')) {
				Modules.CommandHistory.pushCommand('/team');
			}
			
			return null;
		});
		
		bcplus.addEventListener('messageReceived', function(message) {
			if ((message.type === bcplus.messageType.WHISPER) && teamMembers.hasOwnProperty(message.sender) && message.plainText.startsWith('#team#')) {
				message.teamMessage = true;
				message.isInPrivateChannel = false;
				message.plainText = message.plainText.slice(15);
				message.additionalData.receiverUsername = 'Team';
			}
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			if ((messageNodeEvent.messageType === bcplus.messageType.WHISPER) && teamMembers.hasOwnProperty(messageNodeEvent.sender)) {
				var match = messageNodeEvent.messageText.match(teamMessageRegex);
				
				if (null !== match) {
					if (bcplus.getOptionValue('teamIgnore', false) || (receivedTeamMessages.indexOf(match[1]) > -1)) {
						messageNodeEvent.messageNode.remove();
						
						return false;
					}
					else {
						receivedTeamMessages.push(match[1]);
						
						messageNodeEvent.messageText = messageNodeEvent.messageText.slice(15);
						messageNodeEvent.messageType = bcplus.messageType.TEAM;
						
						messageNodeEvent.messageNode.removeClass('timsChatMessage' + bcplus.messageType.WHISPER.toString(10));
						messageNodeEvent.messageNode.addClass('timsChatMessage' + bcplus.messageType.TEAM.toString(10));
						messageNodeEvent.messageNode.find('.timsChatText').html(messageNodeEvent.messageNode.find('.timsChatText').html().trim().slice(15));
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
		});
		
		receivedTeamMessagesClearer = new WCF.PeriodicalExecuter(function() {
			if (receivedTeamMessages.length > 10) {
				for (var i = receivedTeamMessages.length, m = Math.floor(receivedTeamMessages.length / 2); i > m; i--) {
					receivedTeamMessages.shift();
				}
			}
		}, 6000000);
	};
	
	var findTeamMembers = function() {
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
	
	var getTeamMembers = function() {
		return teamMembers;
	};
	
	return {
		initialize:	initialize,
		getTeamMembers:	getTeamMembers
	};
})();
