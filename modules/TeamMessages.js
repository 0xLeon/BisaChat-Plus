Modules.TeamMessages = (function() {
	let bcplus = null;
	
	let isReady = false;
	
	let onlineUserRequestProxy = null;
	let teamMemberListRequester = null;
	
	let publicKeyDescriptor = {
		name: 'RSASSA-PKCS1-v1_5',
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: {
			name: 'SHA-256'
		}
	};
	let publicKeyRaw = {
		alg:		'RS256',
		e:		'AQAB',
		ext:		true,
		key_ops:	['verify'],
		kty:		'RSA',
		n:		'tigWhInIPPJfT0paj9YofXaqcYgXuBzOrILr1-6a_b0cJuy2-4kychlYem2LO1QSe1anYZ86qyj-fSG-eXbsSBDA8nRPcb5tvGsoRnkbJPH767a4sZjl7G-PlKoPrgK_Urun3pHtmWIMGZH5qb9_R3-pvpO6ygwiVtLlFAeHk2sZ1i0_JHAG_g4dG9uJimxTgQ-tewfBaJ32w8EokjipyvPhrUnDoVo_3FpBaFMAk-ENo4v44c_6ofvIxz7GAiarB4um3veSajR2cevXPub8-_LhSeZ39OAnVx1NDDPRzQn4lNf_8Vya_fBxwkm3hNE0bHqugOhyg451niAkv5gYYQ'
	};
	let publicKeyID = null;
	
	let teamMemberList = {};
	let onlineTeamMemberList = {};
	let onlineUserList = {};
	let optOutTeam = {};
	
	let teamMessageRegex = /^#team#(.{8})#(.*)$/;
	let receivedTeamMessages = [];
	let receivedTeamMessagesClearer = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
		
		loadKey().then(function() {
			findTeamMembers();
		});
	};
	
	let addStyles = function() {
		bcplus.addStyle('.timsChatMessage' + bcplus.messageType.TEAM.toString(10) + ' .timsChatUsernameContainer { font-weight: bold; }');
	};
	
	let buildUI = function() {
		bcplus.addBoolOption('teamIgnore', 'Team-Nachrichten ausblenden', 'teamMessages', 'Team-Nachrichten', false, null);
	};
	
	let addEventListeners = function() {
		bcplus.addCommand(['team', 't'], function() {
			if (!isReady) {
				bcplus.showInfoMessage('Der team-Befehl ist noch nicht einsatzbereit. Warte noch einige Sekunden.');
				
				return null;
			}
			
			if (!teamMemberList.hasOwnProperty(WCF.User.userID)) {
				bcplus.showInfoMessage('Du hast nicht die Berechtigung den team-Befehl zu verwenden!');
				
				return null;
			}
			
			let message = '#team#' + String.generateUUID().slice(0, 8) + '# ' + $.makeArray(arguments).join(', ');
			let delay = 0;
			
			Object.keys(onlineTeamMemberList).forEach(function(userID) {
				userID = parseInt(userID, 10);
				
				if ((!optOutTeam.hasOwnProperty(userID)) && (WCF.User.userID !== userID)) {
					window.setTimeout((function(userID, message) {
						return (function() {
							bcplus.sendMessage('/f ' + onlineTeamMemberList[userID] + ', ' + message);
						});
					})(userID, message), delay);
					delay += 50;
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
					let $teamMembers = $('<span>Anwesende Team-Mitglieder: </span>');
					let first = true;
					
					for (let userID in users) {
						let user = users[userID];
						
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
			if ((bcplus.messageType.WHISPER === message.type) && teamMemberList.hasOwnProperty(message.sender)) {
				let match = message.plainText.match(teamMessageRegex);
				
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
			if ((bcplus.messageType.WHISPER === messageNodeEvent.messageType) && teamMemberList.hasOwnProperty(messageNodeEvent.sender)) {
				let match = messageNodeEvent.messageText.match(teamMessageRegex);
				
				if (null !== match) {
					if (bcplus.getOptionValue('teamIgnore', false) || (receivedTeamMessages.indexOf(match[1]) > -1)) {
						messageNodeEvent.messageNode.remove();
						
						return false;
					}
					
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
					messageNodeEvent.messageNode.find('.timsChatUsernameContainer .icon').data('tooltip', 'Schreibt');
					$('<div class="timsChatMessageIcon"><span class="icon icon16 icon-user icon-users" /></div>').insertBefore(messageNodeEvent.messageNode.find('.timsChatInnerMessageContainer'));
				}
			}
		});
		
		receivedTeamMessagesClearer = new WCF.PeriodicalExecuter(function() {
			if (receivedTeamMessages.length > 10) {
				for (let i = receivedTeamMessages.length, m = Math.floor(receivedTeamMessages.length / 2); i > m; i--) {
					receivedTeamMessages.shift();
				}
			}
		}, 600000);
	};
	
	let loadKey = function() {
		return Util.Crypto.loadKey('jwk', publicKeyRaw, publicKeyDescriptor, true, ['verify']).then(function(keyID) {
			return (publicKeyID = keyID);
		});
	};
	
	let findTeamMembers = function() {		
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
					let $link = $(this);
					let userID = $link.data('user-id');
					let username = $link.text();
					
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
	
	let requestTeamMemberList = function() {
		let tmList = null;
		let promise = new Promise(function(resolve, reject) {
			$.ajax({
				url: 'https://projects.0xleon.com/userscripts/bcplus/resources/team.js',
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					if (!!data && !!data.signature && !!data.data) {
						tmList = data;
						
						resolve();
					}
					else {
						let errorMessage = 'Team Messages: Invalid team members data received';
						
						bcplus.showInfoMessage(errorMessage);
						reject(errorMessage);
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					let errorMessage = 'Team Messages: Couldn\'t load team members - ' + textStatus;
					
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
	
	let getAllTeamMembers = function() {
		return teamMemberList;
	};
	
	let getOnlineTeamMembers = function() {
		return onlineTeamMemberList;
	};
	
	return {
		initialize:		initialize,
		getAllTeamMembers:	getAllTeamMembers,
		getOnlineTeamMembers:	getOnlineTeamMembers
	};
})();
