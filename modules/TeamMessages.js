Modules.TeamMessages = (function() {
	var bcplus = null;
	
	var isReady = false;
	
	var onlineUserRequestProxy = null;
	var teamMemberListRequester = null;
	
	var teamMemberList = {};
	var onlineTeamMemberList = {};
	var onlineUserList = {};
	var optOutTeam = {};
	
	var teamMessageRegex = /^#team#(.{8})#(.*)$/;
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
		bcplus.addBoolOption('teamIgnore', 'Team-Nachrichten ausblenden', 'teamMessages', 'Team-Nachrichten', false, null);
	};
	
	var addEventListeners = function() {
		bcplus.addCommand(['team', 't'], function() {
			if (!isReady) {
				bcplus.showInfoMessage('Der team-Befehl ist noch nicht einsatzbereit. Warte noch einige Sekunden.');
				
				return null;
			}
			
			if (!teamMemberList.hasOwnProperty(WCF.User.userID)) {
				bcplus.showInfoMessage('Du hast nicht die Berechtigung den team-Befehl zu verwenden!');
				
				return null;
			}
			
			var message = '#team#' + String.generateUUID().slice(0, 8) + '# ' + $.makeArray(arguments).join(', ');
			
			Object.keys(onlineTeamMemberList).forEach(function(userID) {
				if ((!optOutTeam.hasOwnProperty(userID)) && (WCF.User.userID !== userID)) {
					bcplus.sendMessage('/f ' + onlineTeamMemberList[userID] + ', ' + message);
				}
			});
			
			if (Modules.hasOwnProperty('CommandHistory')) {
				Modules.CommandHistory.pushCommand('/team');
			}
			
			return null;
		});
		
		bcplus.addCommand(['teamupdate', 'tu'], function() {
			bcplus.showInfoMessage('Team Messages: Lade die Team-Liste neu');
			
			teamMemberListRequester.restart();
			teamMemberListRequester._execute();
		});
		
		bcplus.addExternalCommand(['teamupdate', 'tu'], function() {
			bcplus.showInfoMessage('Team Messages: Lade die Team-Liste neu');
			
			teamMemberListRequester.restart();
			teamMemberListRequester._execute();
		});
		
		bcplus.addEventListener('messageReceived', function(message) {
			if ((message.type === bcplus.messageType.WHISPER) && teamMemberList.hasOwnProperty(message.sender)) {
				var match = message.plainText.match(teamMessageRegex);

				if (null !== match) {
					message.teamMessage = true;
					message.teamMessageID = match[1];
					message.isInPrivateChannel = false;
					message.plainText = message.plainText.slice(15).trim();
					message.additionalData.receiverUsername = 'Team';
				}
			}
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			if ((messageNodeEvent.messageType === bcplus.messageType.WHISPER) && teamMemberList.hasOwnProperty(messageNodeEvent.sender)) {
				var match = messageNodeEvent.messageText.match(teamMessageRegex);
				
				if (null !== match) {
					if (bcplus.getOptionValue('teamIgnore', false) || (receivedTeamMessages.indexOf(match[1]) > -1)) {
						messageNodeEvent.messageNode.remove();
						
						return false;
					}
					else {
						receivedTeamMessages.push(match[1]);
						
						messageNodeEvent.messageText = messageNodeEvent.messageText.slice(15).trim();
						messageNodeEvent.messageType = bcplus.messageType.TEAM;
						
						messageNodeEvent.messageNode.removeClass('timsChatMessage' + bcplus.messageType.WHISPER.toString(10));
						messageNodeEvent.messageNode.addClass('timsChatMessage' + bcplus.messageType.TEAM.toString(10));
						messageNodeEvent.messageNode.find('.timsChatText').html(messageNodeEvent.messageNode.find('.timsChatText').html().trim().slice(15).trim());
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
		}, 600000);
	};
	
	var findTeamMembers = function() {		
		teamMemberListRequester = new WCF.PeriodicalExecuter(function() {
			$.ajax({
				url: 'https://projects.0xleon.com/userscripts/bcplus/resources/team.js',
				dataType: 'json',
				success: function(data, textStatus, xqXHR) {
					if (!!data && !!data.signature && !!data.data) {
						// TODO: signature check
						teamMemberList = JSON.parse(data.data);
						onlineTeamMemberList = {};
						
						Object.keys(teamMemberList).forEach(function(userID) {
							if (onlineUserList.hasOwnProperty(userID)) {
								onlineTeamMemberList[userID] = onlineUserList[userID];
							}
						});
					}
					else {
						bcplus.showInfoMessage('Team Messages: Couldn\'t load team members');
					}
				}
			});
		}, 600000);
		
		onlineUserRequestProxy = new WCF.Action.Proxy({
			data: {
				actionName: 'getBoxRoomList',
				className: 'chat\\data\\room\\RoomAction',
				parameters: {
					showEmptyRooms: 0
				}
			},
			showLoadingOverlay: false,
			suppressErrors: true,
			success: function(data) {
				onlineUserList = {};
				onlineTeamMemberList = {};
				
				$(data.returnValues.template).find('.userLink').each(function() {
					var $link = $(this);
					var userID = $link.data('user-id');
					var username = $link.text()
					
					onlineUserList[userID] = username;
					
					if (teamMemberList.hasOwnProperty(userID)) {
						onlineTeamMemberList[userID] = username;
					}
				});
				
				isReady = true;
			}
		});
		
		
		(new Promise(function(resolve, reject) {
			$.ajax({
				url: 'https://projects.0xleon.com/userscripts/bcplus/resources/team.js',
				dataType: 'json',
				success: function(data, textStatus, xqXHR) {
					if (!!data && !!data.signature && !!data.data) {
						// TODO: signature check
						teamMemberList = JSON.parse(data.data);
						
						resolve();
					}
					else {
						reject();
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					reject();
				}
			});
		})).then(
			function() {
				onlineUserRequestProxy.sendRequest();
			},
			function() {
				bcplus.showInfoMessage('Team Messages: Couldn\'t load team members');
			}
		);
		
		$(document).ready(function() {
			Window.be.bastelstu.wcf.push.onMessage('be.bastelstu.chat.join', onlineUserRequestProxy.sendRequest.bind(onlineUserRequestProxy));
			Window.be.bastelstu.wcf.push.onMessage('be.bastelstu.chat.leave', onlineUserRequestProxy.sendRequest.bind(onlineUserRequestProxy));
		});
	};
	
	var getAllTeamMembers = function() {
		return teamMemberList;
	};
	
	var getOnlineTeamMembers = function() {
		return onlineTeamMemberList;
	};
	
	return {
		initialize:		initialize,
		getAllTeamMembers:	getAllTeamMembers,
		getOnlineTeamMembers:	getOnlineTeamMembers
	};
})();
