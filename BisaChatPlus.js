var BisaChatPlus = (function() {
	var bcplus = null;
	var storage = Storage.getInterface('bcplus');
	var event = {
		chatBlur: $.Callbacks(),
		chatFocus: $.Callbacks(),
		privateRoomAdded: $.Callbacks(),
		privateRoomRemoved: $.Callbacks(),
		messageReceived: $.Callbacks(),
		messageAdded: $.Callbacks(),
		messageSubmit: $.Callbacks(),
		awayStatusChanged: $.Callbacks(),
		optionsOpened: $.Callbacks(),
		optionsClosed: $.Callbacks()
	};
	var privateRoomObservers = { };
	var $optionsDialog = $('<div id="bcplusOptionsDialogContent" class="container containerPadding"></div>').appendTo('body').wcfDialog({
		autoOpen: false,
		title: 'BisaChat Plus – Optionen',
		
		onOpen: function() {
			event.optionsOpened.fire();
		},
		onClose: function() {
			event.optionsClosed.fire();
			
			$('#timsChatInput').focus();
		}
	});
	var awayStatus = {
		isAway: false,
		message: ''
	};
	
	var commandRegex = /^(?:\/)(.*?)(?:\s(.*)|$)/;
	var commands = { };
	
	var infoMessageTemplate = new WCF.Template('<li class="timsChatMessage timsChatMessage8 user{$userID} ownMessage">	\n	<div class="timsChatInnerMessageContainer altLayout">\n		<div class="timsChatAvatarContainer">\n			<div class="userAvatar framed">\n				<span class="icon icon16 icon-info-sign"></span>\n			</div>\n		</div>\n		<div class="timsChatInnerMessage">\n			<time>{$time}</time>\n			<span class="timsChatUsernameContainer">Information:</span>\n			<div class="timsChatTextContainer">\n				<span class="timsChatText">\n					{$text}\n				</span>\n			</div>\n		</div>\n	</div>\n</li>');
	
	var messageTypeRegex = /\btimsChatMessage(\d+)\b/;
	var messageUserIdRegex = /\buser(\d+)\b/;
	
	var messageType = {
		get NORMAL()	{ return  0; },
		get JOIN()	{ return  1; },
		get LEAVE()	{ return  2; },
		get AWAY()	{ return  3; },
		get BACK()	{ return  4; },
		get MODERATE()	{ return  5; },
		get ME()	{ return  6; },
		get WHISPER()	{ return  7; },
		get INFO()	{ return  8; },
		get CLEAR()	{ return  9; },
		get TEAM()	{ return 10; },
		get GLOBAL()	{ return 11; },
		get ATTACH()	{ return 12; }
	};
	
	var messageNodeType = {
		get ALTERNATIVE()	{ return 0; },
		get BUBBLE()		{ return 1; },
		get BUBBLEFOLLOWUP()	{ return 2; }
	};
	
	var getVersion = function() {
		return '{version}';
	};
	
	var init = function() {
		bcplus = {
			getVersion:		getVersion,
			getStorage:		getStorage,
			getAwayStatus:		getAwayStatus,
			sendMessage:		sendMessage,
			showInfoMessage:	showInfoMessage,
			addEventListener:	addEventListener,
			removeEventListener:	removeEventListener,
			addBoolOption:		addBoolOption,
			addTextOption:		addTextOption,
			addCommand:		addCommand,
			
			get messageType() {
				return messageType;
			},
			
			get messageNodeType() {
				return messageNodeType;
			}
		};
		
		initEvents();
		buildUI();
		initModules();
		
		addCommand('mp3', '/me *winamptret*');
	};
	
	var initEvents = function() {
		addStreamObserver($('#timsChatMessageContainer0').find('ul'));
		
		var privateRoomObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length > 0) {
					for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
						var $addedNode = $(mutation.addedNodes[i]);
						
						if ($addedNode.hasClass('timsChatMessageContainer')) {
							var uuid = String.generateUUID()
							
							$addedNode.get(0).setAttribute('data-uuid', uuid);
							privateRoomObservers[uuid] = addStreamObserver($addedNode.find('ul'));
							
							event.privateRoomAdded.fire($addedNode);
						}
					}
				}
				
				if (mutation.removedNodes.length > 0) {
					for (var i = 0, l = mutation.removedNodes.length; i < l; i++) {
						var $removedNode = $(mutation.removedNodes[i]);
						
						if ($removedNode.hasClass('timsChatMessageContainer')) {
							var uuid = $removedNode.data('uuid');
							
							privateRoomObservers[uuid].disconnect();
							delete privateRoomObservers[uuid];
							
							event.privateRoomRemoved.fire($removedNode);
						}
					}
				}
			});
		});
		var privateRoomObserverConfig = {
			childList: true,
			attributes: false,
			characterData: false,
			subtree: false
		};
		privateRoomObserver.observe($('#timsChatMessageTabMenu').get(0), privateRoomObserverConfig);
		
		Window.be.bastelstu.Chat.listener.add('newMessage', function(message) {
			message.plainText = $('<div>' + message.formattedMessage + '</div>').text().trim();
			message.ownMessage = (message.sender === WCF.User.userID);
			
			event.messageReceived.fire(message);
			
			if (message.ownMessage) {
				if (message.type === messageType.AWAY) {
					awayStatus.isAway = true;
					awayStatus.message = (message.plainText.contains(':') ? message.plainText.substring(message.plainText.indexOf(':') + 1).trim() : '');
					
					event.awayStatusChanged.fire(awayStatus);
				}
				else if (awayStatus.isAway) {
					awayStatus.isAway = false;
					awayStatus.message = '';
					
					event.awayStatusChanged.fire(awayStatus);
				}
			}
		});
		
		Window.document.getElementById('timsChatInput').addEventListener('keydown', function(event) {
			if (event.keyCode !== 13) {
				return true;
			}
			
			var messageText = $('#timsChatInput').val().trim();
			
			if (messageText.startsWith('/')) {
				var matchResult = messageText.match(commandRegex)
				var commandName = matchResult[1];
				var commandParameter = matchResult[2];
				
				if (commands.hasOwnProperty(commandName)) {
					event.preventDefault();
					event.stopPropagation();
					$('#timsChatInput').val('');
					
					var returnValue = commands[commandName](commandName, commandParameter);
					
					if ($.type(returnValue) === 'string') {
						sendMessage(returnValue);
					}
					
					return false;
				}
				
				return true;
			}
		}, true);
		
		Window.document.addEventListener('blur', function(e) {
			event.chatBlur.fire(e);
		});
		
		Window.document.addEventListener('focus', function(e) {
			event.chatFocus.fire(e);
		});
	};
	
	var buildUI = function() {
		var $optionsButton = $('<li><a id="bcplusOptions" class="button jsTooltip" title="BisaChat Plus – Optionen"><span class="icon icon16 icon-cog"></span><span class="invisible">BisaChat Plus – Optionen</span></a></li>');
		$optionsButton.find('a').on('click', function() {
			$optionsDialog.wcfDialog('open');
		});
		$optionsButton.appendTo('#timsChatOptions .buttonGroup');
	};
	
	var initModules = function() {
		$.each(Modules, function(moduleName, moduleObject) {
			moduleObject.initialize(bcplus);
		});
	};
	
	var addStreamObserver = function($stream) {
		var stream = $($stream).get(0);
		
		if (stream.nodeName.toLowerCase() !== 'ul') {
			throw new Error('Can\'t observe stream of node type »' + stream.nodeName.toLowerCase() + '«.');
		}
		
		var messageObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
					var $messageNode = $(mutation.addedNodes[i]);
					
					if (($messageNode.get(0).nodeType === 1) && ($messageNode.hasClass('timsChatMessage') || $messageNode.hasClass('timsChatText'))) {
						try {
							var messageNodeEvent = {
								messageNode:		$messageNode,
								messageType:		parseInt($messageNode.attr('class').match(messageTypeRegex)[1], 10),
								sender:			parseInt($messageNode.attr('class').match(messageUserIdRegex)[1], 10),
								senderUsername:		null,
								messageText:		null,
								messageNodeType:	null
							};
							
							if ($messageNode.hasClass('timsChatMessage')) {
								if ($messageNode.find('.bubble').length > 0) {
									messageNodeEvent.messageNodeType = messageNodeType.BUBBLE;
								}
								else {
									messageNodeEvent.messageNodeType = messageNodeType.ALTERNATIVE;
								}
								
								messageNodeEvent.messageText = $messageNode.find('.timsChatText').text().trim();
								messageNodeEvent.senderUsername = $messageNode.find('.timsChatUsernameContainer span').text().trim();
							}
							else if ($messageNode.hasClass('timsChatText')) {
								messageNodeEvent.messageNodeType = messageNodeType.BUBBLEFOLLOWUP;
								
								$messageNode.contents().each(function() {
									if (this.nodeType === 3) {
										messageNodeEvent.messageText += this.nodeValue;
									}
								});
								messageNodeEvent.messageText = messageNodeEvent.messageText.trim();
								messageNodeEvent.senderUsername = $messageNode.closest('.timsChatInnerMessage').find('.timsChatUsernameContainer span').text().trim();
							}
							else {
								throw new Error('Unrecognized message node type added.');
							}
							
							if (messageNodeEvent.messageType === messageType.WHISPER) {
								messageNodeEvent.senderUsername = messageNodeEvent.senderUsername.slice(0, Math.floor(messageNodeEvent.senderUsername.length / 2));
							}
							
							event.messageAdded.fire(messageNodeEvent);
						}
						catch (e) {
							console.log(e);
						}
					}
				}
			});
		});
		var messageObserverConfig = {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false
		};
		messageObserver.observe(stream, messageObserverConfig);
		
		return messageObserver;
	};
	
	var getStorage = function() {
		return storage;
	};
	
	var getAwayStatus = function() {
		return awayStatus;
	};
	
	var sendMessage = function(messageText) {
		new WCF.Action.Proxy({
			autoSend: true,
			data: {
				actionName: 'send',
				className: 'chat\\data\\message\\MessageAction',
				parameters: {
					text: messageText,
					enableSmilies: $('#timsChatSmilies').data('status')
				}
			},
			showLoadingOverlay: false
		});
	};
	
	var showInfoMessage = function(messageText) {
		messageText = $('<div />').text(messageText).html();
		var time = new Date();
		var $infoMessage = $(infoMessageTemplate.fetch({
			userID:		WCF.User.userID,
			time:		((time.getHours() < 10) ? '0' + time.getHours().toString() : time.getHours().toString()) + ':' + ((time.getMinutes() < 10) ? '0' + time.getMinutes().toString() : time.getMinutes().toString()) + ':' + ((time.getSeconds() < 10) ? '0' + time.getSeconds().toString() : time.getSeconds().toString()),
			text:		messageText
		}));
		
		$('.timsChatMessageContainer.active > ul').append($infoMessage);
	};
	
	var addEventListener = function(eventName, callback) {
		if (event[eventName] === null) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		event[eventName].add(callback);
	};
	
	var removeEventListener = function(eventName, callback) {
		if (event[eventName] === null) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		event[eventName].remove(callback);
	};
	
	var addBoolOption = function(optionID, optionText, categoryID, categoryName, defaultValue, onChange) {
		if (!!$('#bcplus-' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		var $category = $($('#bcplus-' + categoryID)[0] || $('<fieldset id="bcplus-' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt></dt><dd><label><input type="checkbox" id="bcplus-' + optionID + '"/> ' + optionText + '</label></dd>');
		var optionValue = storage.getValue(optionID + 'Option', !!defaultValue);
		
		$option.find('input').prop({
			checked: optionValue
		}).on('change', function(event) {
			storage.setValue(optionID + 'Option', $(this).prop('checked'));
			
			if ($.isFunction(onChange)) {
				onChange.call($(event.target), event);
			}
		});
		$category.find('dl').append($option);
	};
	
	var addTextOption = function(optionID, optionText, optionType, categoryID, categoryName, defaultValue, onChange) {
		if (!!$('#bcplus-' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		if (['text', 'email', 'url', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'number', 'range', 'color', 'password'].indexOf(optionType.toLowerCase()) < 0) {
			throw new Error('Invalid option type »' + optionType.toLowerCase() + '« given!');
		}
		
		var $category = $($('#bcplus-' + categoryID)[0] || $('<fieldset id="bcplus-' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt><label for="bcplus-' + optionID + '">' + optionText + '</label></dt><dd><input type="' + optionType.toLowerCase() + '" id="' + optionID + '"/></dd>');
		var optionValue = storage.getValue(optionID + 'Option', defaultValue);
		
		$option.find('input').val(optionValue).on('blur', function(event) {
			storage.setValue(optionID + 'Option', $(this).val());
			
			// TODO: error checking?
			
			if ($.isFunction(onChange)) {
				onChange.call($(event.target), event);
			}
		});
		$category.find('dl').append($option);
		
		// TODO: when to save?
	};
	
	var addCommand = function(commandName, commandAction) {
		if (!commandName) {
			throw new Error('Invalid command name!');
		}
		
		if (!commandAction || !($.isFunction(commandAction) || ($.type(commandAction) === 'string'))) {
			throw new Error('Invalid command action!');
		}
		
		if (commands.hasOwnProperty(commandName)) {
			throw new Error('Command with name »' + commandName + '« already exists!');
		}
		
		if ($.type(commandAction) === 'string') {
			commands[commandName] = (function(commandString) {
				return (function() {
					return commandString;
				});
			})(commandAction);
		}
		else {
			commands[commandName] = commandAction;
		}
	};
	
	init();
	
	return {
		getVersion:		getVersion,
		getStorage:		getStorage,
		getAwayStatus:		getAwayStatus,
		sendMessage:		sendMessage,
		showInfoMessage:	showInfoMessage,
		addEventListener:	addEventListener,
		removeEventListener:	removeEventListener,
		addBoolOption:		addBoolOption,
		addTextOption:		addTextOption,
		addCommand:		addCommand,
		
		get messageType() {
			return messageType;
		},
		
		get messageNodeType() {
			return messageNodeType;
		}
	};
})();

if (Window.com === undefined) {
	Window.com = { };
}

if (Window.com.leon === undefined) {
	Window.com.leon = { };
}

Window.com.leon.BCPlus = BisaChatPlus;
