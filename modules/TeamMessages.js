Modules.TeamMessages = (function() {
	var bcplus = null;
	
	var isReady = false;
	
	var onlineUserRequestProxy = null;
	var teamMemberListRequester = null;

	var publicKeyDescriptor = {
		name: 'RSASSA-PKCS1-v1_5',
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: {
			name: 'SHA-256'
		}
	};
	var publicKeyRaw = {
		alg:		'RS256',
		e:		'AQAB',
		ext:		true,
		key_ops:	['verify'],
		kty:		'RSA',
		n:		'tigWhInIPPJfT0paj9YofXaqcYgXuBzOrILr1-6a_b0cJuy2-4kychlYem2LO1QSe1anYZ86qyj-fSG-eXbsSBDA8nRPcb5tvGsoRnkbJPH767a4sZjl7G-PlKoPrgK_Urun3pHtmWIMGZH5qb9_R3-pvpO6ygwiVtLlFAeHk2sZ1i0_JHAG_g4dG9uJimxTgQ-tewfBaJ32w8EokjipyvPhrUnDoVo_3FpBaFMAk-ENo4v44c_6ofvIxz7GAiarB4um3veSajR2cevXPub8-_LhSeZ39OAnVx1NDDPRzQn4lNf_8Vya_fBxwkm3hNE0bHqugOhyg451niAkv5gYYQ'
	};
	var publicKeyID = null;
	
	var teamMemberList = {};
	var onlineTeamMemberList = {};
	var onlineUserList = {};
	var optOutTeam = {};
	
	var teamMessageRegex = /^#team#(.{8})#(.*)$/;
	var receivedTeamMessages = [];
	var receivedTeamMessagesClearer = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();

		loadKey().then(function() {
			findTeamMembers();
		});
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

		bcplus.addCommand(['teamonline', 'to'], function() {
			if (!isReady) {
				bcplus.showInfoMessage('Der teamdebug-Befehl ist noch nicht einsatzbereit. Warte noch einige Sekunden.');
				
				return null;
			}

			Util.UserCache.getUsers(Object.keys(onlineTeamMemberList)).then(
				function(users) {
					var $teamMembers = $('<span>Anwesende Team-Mitglieder: </span>');
					var first = true;

					for (var userID in users) {
						var user = users[userID];
						
						if (!first) {
							$teamMembers.append(document.createTextNode(', '));
						}

						first = false;

						$('<a />').attr({
							href:	user.profile,
							target:	'_blank'
						}).text(user.username).appendTo($teamMembers);
					}

					bcplus.showInfoMessage($teamMembers.html(), true);
				},
				function(e) {
					console.error(new Error(e));
				}
			);

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
					message.isFollowUp = false;
					message.receiver = Math.floor(1000000 + Math.random() * 1000000);
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
						messageNodeEvent.messageNode.find('.timsChatInnerMessageContainer').removeClass('right');
						messageNodeEvent.messageNode.find('.bubble .bcplusBubbleMessageText, .altLayout .timsChatText').first().html(messageNodeEvent.messageNode.find('.bubble .bcplusBubbleMessageText, .altLayout .timsChatText').first().html().trim().slice(15).trim());
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

	var loadKey = function() {
		return Util.Crypto.loadKey('jwk', publicKeyRaw, publicKeyDescriptor, true, ['verify']).then(function(keyID) {
			return (publicKeyID = keyID);
		});
	};
	
	var findTeamMembers = function() {		
		teamMemberListRequester = new WCF.PeriodicalExecuter(function() {
			requestTeamMemberList().then(function() {
				onlineTeamMemberList = {};
						
				Object.keys(teamMemberList).forEach(function(userID) {
					if (onlineUserList.hasOwnProperty(userID)) {
						onlineTeamMemberList[userID] = onlineUserList[userID];
					}
				});
			});
		}, 3600000);
		
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
					var username = $link.text();
					
					onlineUserList[userID] = username;
					
					if (teamMemberList.hasOwnProperty(userID)) {
						onlineTeamMemberList[userID] = username;
					}
				});
				
				isReady = true;
			}
		});
		
		
		requestTeamMemberList().then(function() {
			onlineUserRequestProxy.sendRequest();
		});
		
		$(document).ready(function() {
			Window.be.bastelstu.wcf.push.onMessage('be.bastelstu.chat.join', onlineUserRequestProxy.sendRequest.bind(onlineUserRequestProxy));
			Window.be.bastelstu.wcf.push.onMessage('be.bastelstu.chat.leave', onlineUserRequestProxy.sendRequest.bind(onlineUserRequestProxy));
		});
	};

	var requestTeamMemberList = function() {
		var tmList = null;
		var promise = new Promise(function(resolve, reject) {
			$.ajax({
				url: 'https://projects.0xleon.com/userscripts/bcplus/resources/team.js',
				dataType: 'json',
				success: function(data, textStatus, xqXHR) {
					if (!!data && !!data.signature && !!data.data) {
						tmList = data;
						
						resolve();
					}
					else {
						var errorMessage = 'Team Messages: Invalid team members data received';

						bcplus.showInfoMessage(errorMessage);
						reject(errorMessage);
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					var errorMessage = 'Team Messages: Couldn\'t load team members - ' + textStatus;

					bcplus.showInfoMessage(errorMessage);
					reject(errorMessage);
				}
			});
		});

		return promise
			.then(function() {
				return Util.Crypto.verify(publicKeyID, tmList);
			})
			.then(function(result) {
				if (result) {
					teamMemberList = JSON.parse(tmList.data);
				}
				else {
					bcplus.showInfoMessage('Team Messages: Couldn\'t verify team members signature');
				}

				return teamMemberList;
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
