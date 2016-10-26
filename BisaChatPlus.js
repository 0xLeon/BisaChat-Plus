var BisaChatPlus = (function() {
	var bcplus = null;
	var storage = Util.Storage.getInterface('bcplus');
	var bcplusEvents = {
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
		
		onShow: function() {
			bcplusEvents.optionsOpened.fire();
		},
		onClose: function() {
			bcplusEvents.optionsClosed.fire();
			
			$('#timsChatInput').focus();
		}
	});
	var optionIdentifiers = [];
	var awayStatus = {
		isAway: false,
		message: ''
	};
	
	var commandRegex = /^(?:\/)(.*?)(?:\s(.*)|$)/;
	var commands = { };
	
	var commandParameterRegex = /((?:^,+)|(?:,+$))|(,{2,})/g;
	
	var externalCommandRegex = /(?:!)(.*?)(?:\s(.*)|$)/;
	var externalCommands = { };
	
	// TODO: maybe add bubble version of info template
	var infoMessageTemplate = new WCF.Template('<li class="timsChatMessage timsChatMessage8 user{$userID} ownMessage">	\n	<div class="timsChatInnerMessageContainer altLayout">\n		<div class="timsChatAvatarContainer">\n			<div class="userAvatar framed">\n				<span class="icon icon16 icon-info-sign"></span>\n			</div>\n		</div>\n		<div class="timsChatInnerMessage">\n			<time>{$time}</time>\n			<span class="timsChatUsernameContainer">Information:</span>\n			<div class="timsChatTextContainer">\n				<span class="timsChatText">\n					{@$text}\n				</span>\n			</div>\n		</div>\n	</div>\n</li>');
	
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
		return '/*{version}*/';
	};
	
	var init = function() {
		bcplus = {
			getVersion:		getVersion,
			getStorage:		getStorage,
			getAwayStatus:		getAwayStatus,
			handleStreamScroll:	handleStreamScroll,
			sendMessage:		sendMessage,
			showInfoMessage:	showInfoMessage,
			addEventListener:	addEventListener,
			removeEventListener:	removeEventListener,
			addBoolOption:		addBoolOption,
			addTextOption:		addTextOption,
			getOptionValue:		getOptionValue,
			setOptionValue:		setOptionValue,
			getOptionIDs:		getOptionIDs,
			addCommand:		addCommand,
			addExternalCommand:	addExternalCommand,
			addStyle:		addStyle,
			
			get messageType() {
				return messageType;
			},

			get messageNodeType() {
				return messageNodeType;
			}
		};
		
		if (checkIndexPage()) {
			return;
		}

		checkSecureConnection();
		initEvents();
		buildUI();
		initModules();
		
		addCommand('mp3', '/me *winamptret*');
	};

	var checkIndexPage = function() {
		/** @type {RegExp} */ var indexPageRegex = /^https?:\/\/chat\.bisaboard\.de($|(?:\/index\.php\/Chat\/(?:$|\?s=(\w+$))))/;
		/** @type {Boolean} */ var isIndexPage = indexPageRegex.test(Window.location.href);

		if (isIndexPage && !!Modules.Update) {
			Modules.Update.initialize(bcplus);
			addStyle('#bcplus-updateInfoCloser { display: none !important; visibility: hidden !important; }');
		}

		return isIndexPage;
	};

	var checkSecureConnection = function() {
		if (Window.location.protocol !== 'https:') {
			    window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
			    throw new Error('Reloading chat over secure connection');
		}
	};
	
	var initEvents = function() {
		addStreamObserver($('#timsChatMessageContainer0').find('ul'));
		
		var privateRoomObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var uuid = null;
				
				if (mutation.addedNodes.length > 0) {
					for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
						var $addedNode = $(mutation.addedNodes[i]);
						
						if ($addedNode.hasClass('timsChatMessageContainer')) {
							uuid = String.generateUUID();
							
							$addedNode.get(0).setAttribute('data-uuid', uuid);
							privateRoomObservers[uuid] = addStreamObserver($addedNode.find('ul'));
							
							bcplusEvents.privateRoomAdded.fire($addedNode);
						}
					}
				}
				
				if (mutation.removedNodes.length > 0) {
					for (var j = 0, m = mutation.removedNodes.length; j < m; j++) {
						var $removedNode = $(mutation.removedNodes[j]);
						
						if ($removedNode.hasClass('timsChatMessageContainer')) {
							uuid = $removedNode.data('uuid');
							
							privateRoomObservers[uuid].disconnect();
							delete privateRoomObservers[uuid];
							
							bcplusEvents.privateRoomRemoved.fire($removedNode);
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
			message.plainText = $('<div />').html(message.formattedMessage).text().trim();
			message.ownMessage = (message.sender === WCF.User.userID);
			
			bcplusEvents.messageReceived.fire(message);
			
			if (message.ownMessage) {
				if (messageType.AWAY === message.type) {
					awayStatus.isAway = true;
					awayStatus.message = (message.plainText.includes(':') ? message.plainText.substring(message.plainText.indexOf(':') + 1).trim() : '');
					
					bcplusEvents.awayStatusChanged.fire(awayStatus);
				}
				else if (awayStatus.isAway) {
					awayStatus.isAway = false;
					awayStatus.message = '';
					
					bcplusEvents.awayStatusChanged.fire(awayStatus);
				}
			}
		});
		
		Window.document.getElementById('timsChatInput').addEventListener('keydown', function(event) {
			if (event.keyCode !== 13) {
				return true;
			}
			
			var messageText = $('#timsChatInput').val().trim();
			
			if (messageText.startsWith('/') && ('/' !== messageText[1])) {
				var matchResult = messageText.match(commandRegex);
				var commandName = matchResult[1];
				var commandParameters = (matchResult[2] || '').replace(commandParameterRegex, function() {
					return ((!arguments[2]) ? '' : ',');
				}).trim();
				
				if ('' === commandParameters) {
					commandParameters = [];
				}
				else {
					commandParameters = commandParameters.split(',').map(function(item) {
						return item.trim();
					});
				}
				
				if (commands.hasOwnProperty(commandName)) {
					event.preventDefault();
					event.stopPropagation();
					$('#timsChatInput').val('');
					
					var returnValue = commands[commandName].apply(null, commandParameters);
					
					if ('string' === $.type(returnValue)) {
						sendMessage(returnValue);
					}
					
					return false;
				}
			}
			
			bcplusEvents.messageSubmit.fire({
				messageText:	messageText
			});
			
			return true;
		}, true);
		
		addEventListener('messageReceived', function(message) {
			if (((messageType.NORMAL === message.type) || (messageType.WHISPER === message.type)) && ((WCF.User.userID !== message.sender) || (message.sender === message.receiver)) && message.plainText.startsWith('!')) {
				var matchResult = message.plainText.match(externalCommandRegex);
				var externalCommandName = matchResult[1];
				var externalCommandParameters = (matchResult[2] || '').replace(commandParameterRegex, function() {
					return ((!arguments[2]) ? '' : ',');
				}).trim();
				
				if ('' === externalCommandParameters) {
					externalCommandParameters = [];
				}
				else {
					externalCommandParameters = externalCommandParameters.split(',').map(function(item) {
						return item.trim();
					});
				}
				
				externalCommandParameters.unshift(message);
				
				if (externalCommands.hasOwnProperty(externalCommandName)) {
					if (!!externalCommands[externalCommandName].restricted && (message.sender !== 13391)) {
						return;
					}
					
					var returnValue = externalCommands[externalCommandName].apply(null, externalCommandParameters);
					
					if ('string' === $.type(returnValue)) {
						var _awayStatus = $.extend({}, awayStatus);
						
						if ((messageType.WHISPER === message.type) && !returnValue.startsWith('/')) {
							returnValue = '/whisper ' + message.username + ', ' + returnValue;
						}
						
						sendMessage(returnValue);
						
						if (_awayStatus.isAway) {
							var text = '/away';
							
							if ('' !== _awayStatus.message) {
								text += ' ' + _awayStatus.message;
							}
							
							Window.setTimeout(function() {
								sendMessage(text);
							}, 1000);
						}
					}
				}
			}
		});
		
		Window.addEventListener('blur', function(e) {
			bcplusEvents.chatBlur.fire(e);
		});
		
		Window.addEventListener('focus', function(e) {
			bcplusEvents.chatFocus.fire(e);
		});
	};
	
	var buildUI = function() {
		var $optionsButton = $('<li><a id="bcplusOptions" class="button jsTooltip" title="BisaChat Plus – Optionen"><span class="icon icon16 icon-cog"></span><span class="invisible">BisaChat Plus – Optionen</span></a></li>');
		$optionsButton.find('a').on('click', function() {
			$optionsDialog.wcfDialog('open');
		});
		$optionsButton.appendTo('#timsChatOptions .buttonGroup');
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	var initModules = function() {
		$.each(Modules, function(moduleName, moduleObject) {
			try {
				moduleObject.initialize(bcplus);
			}
			catch (e) {
				console.error(e);
			}
		});
	};
	
	var addStreamObserver = function($stream) {
		var stream = $($stream).get(0);
		
		if ('ul' !== stream.nodeName.toLowerCase()) {
			throw new Error('Can\'t observe stream of node type »' + stream.nodeName.toLowerCase() + '«.');
		}
		
		var messageObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
					var $messageNode = $(mutation.addedNodes[i]);

					if ((Node.ELEMENT_NODE === $messageNode.get(0).nodeType) && ($messageNode.hasClass('timsChatMessage') || $messageNode.hasClass('timsChatText'))) {
						$messageNode.htmlClean();
						
						try {
							var messageNodeEvent = {
								messageNode:		$messageNode,
								messageType:		null,
								messageID:		null,
								ownMessage:		false,
								sender:			null,
								senderUsername:		null,
								receiverUsername:	null,
								messageText:		null,
								messageNodeType:	null
							};

							// TODO: what if one bubble contains several messages of one user?
							if ($messageNode.hasClass('timsChatMessage')) {
								if ($messageNode.find('.bubble').length > 0) {
									messageNodeEvent.messageNodeType = messageNodeType.BUBBLE;

									var $message = $('<span class="bcplusBubbleMessageText" />');
									var $input = $messageNode.find('.timsChatText').find('input').detach();

									$message.html($messageNode.find('.timsChatText').html().trim());
									
									$messageNode.find('.timsChatText').empty()
										.append($message)
										.append($messageNode.find('.timsChatInnerMessage > time').detach())
										.append($input);
									
									messageNodeEvent.messageText = $message.text().trim();
								}
								else {
									messageNodeEvent.messageNodeType = messageNodeType.ALTERNATIVE;
									messageNodeEvent.messageText = $messageNode.find('.timsChatText').text().trim();
								}
								
								messageNodeEvent.messageType = parseInt($messageNode.attr('class').match(messageTypeRegex)[1], 10);
								messageNodeEvent.messageID = $messageNode.find('.timsChatText').data('messageID');
								messageNodeEvent.sender = parseInt($messageNode.attr('class').match(messageUserIdRegex)[1], 10);
								messageNodeEvent.senderUsername = $messageNode.find('.timsChatUsernameContainer span:not(.icon, .receiver)').text().trim();
								
								if (messageType.WHISPER === messageNodeEvent.messageType) {
									messageNodeEvent.receiverUsername = $messageNode.find('.timsChatUsernameContainer .receiver').text().trim();
								}
							}
							else if ($messageNode.hasClass('timsChatText')) {
								messageNodeEvent.messageNodeType = messageNodeType.BUBBLEFOLLOWUP;
								messageNodeEvent.messageType = parseInt($messageNode.closest('.timsChatMessage').attr('class').match(messageTypeRegex)[1], 10);
								messageNodeEvent.messageID = $messageNode.data('messageID');

								var $div = $('<div />');
								var $message = $('<span class="bcplusBubbleMessageText" />');

								$messageNode.find('*').detach().appendTo($div);
								$message.html($messageNode.html().trim());

								$messageNode.empty()
									.append($message)
									.append($div.find('time').detach())
									.append($div.find('input').detach());

								messageNodeEvent.messageText = $message.text().trim();

								messageNodeEvent.sender = parseInt($messageNode.closest('.timsChatMessage').attr('class').match(messageUserIdRegex)[1], 10);
								messageNodeEvent.senderUsername = $messageNode.closest('.timsChatInnerMessage').find('.timsChatUsernameContainer span:not(.icon, .receiver)').text().trim();
								
								if (messageType.WHISPER === messageNodeEvent.messageType) {
									messageNodeEvent.receiverUsername = $messageNode.closest('.timsChatInnerMessage').find('.timsChatUsernameContainer .receiver').text().trim();
								}
							}
							else {
								throw new Error('Unrecognized message node type');
							}
							
							messageNodeEvent.ownMessage = (WCF.User.userID === messageNodeEvent.sender);

							bcplusEvents.messageAdded.fire(messageNodeEvent);
						}
						catch (e) {
							console.error(e);
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
	
	/**
	 * @returns	{Object}
	 */
	var getStorage = function() {
		return storage;
	};
	
	/**
	 * @returns	{Object}
	 */
	var getAwayStatus = function() {
		return awayStatus;
	};

	var handleStreamScroll = function() {
		if (1 === $('#timsChatAutoscroll').data('status')) {
			$('.timsChatMessageContainer.active').scrollTop($('.timsChatMessageContainer.active').prop('scrollHeight'));
		}
	};
	
	/**
	 * @param	{string}	messageText
	 * @param	{boolean}	[fireEvent]
	 */
	var sendMessage = function(messageText, fireEvent) {
		if ((undefined === fireEvent) || !!fireEvent) {
			bcplusEvents.messageSubmit.fire({
				messageText:	messageText
			});
		}
		
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
	
	/**
	 * @param	{string}	messageText
	 * @param	{boolean}	[parseHtml]
	 */
	var showInfoMessage = function(messageText, parseHtml) {
		var messageTextNode = (!!parseHtml) ? $('<div />').html(messageText) : $('<div />').text(messageText);
		var time = new Date();
		var messageObject = {
			additionalData:		null,
			altLayout:		true,
			avatar:			null,
			formattedMessage:	messageTextNode.html(),
			formattedTime:		('00' + time.getHours().toString()).slice(-2) + ':' + ('00' + time.getMinutes().toString()).slice(-2) + ':' + ('00' + time.getSeconds().toString()).slice(-2),
			formattedUsername:	'Information',
			isFollowUp:		false,
			isInPrivateChannel:	false,
			message:		messageTextNode.text(),
			messageID:		0,
			ownMessage:		true,
			plainText:		messageTextNode.text(),
			receiver:		WCF.User.userID,
			roomID:			Window.be.bastelstu.Chat.getRoomList().active.roomID,
			sender:			WCF.User.userID,
			separator:		':',
			time:			Math.floor(time.getTime() / 1000),
			type:			8,
			username:		'Information'
		};

		bcplusEvents.messageReceived.fire(messageObject);

		var $infoMessage = $(infoMessageTemplate.fetch({
			userID:		messageObject.receiver,
			time:		messageObject.formattedTime,
			text:		messageObject.formattedMessage
		}));
		
		$('.timsChatMessageContainer.active > ul').append($infoMessage);
		
		WCF.DOMNodeInsertedHandler.execute();

		handleStreamScroll();
	};
	
	/**
	 * @param	{string}	eventName
	 * @param	{function}	callback
	 */
	var addEventListener = function(eventName, callback) {
		if (!bcplusEvents.hasOwnProperty(eventName)) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		bcplusEvents[eventName].add(callback);
	};
	
	/**
	 * @param	{string}	eventName
	 * @param	{function}	callback
	 */
	var removeEventListener = function(eventName, callback) {
		if (!bcplusEvents.hasOwnProperty(eventName)) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		bcplusEvents[eventName].remove(callback);
	};
	
	/**
	 * @param	{string}	optionID
	 * @param	{string}	optionText
	 * @param	{string}	categoryID
	 * @param	{string}	[categoryName]
	 * @param	{booleanb}	[defaultValue]
	 * @param	{function}	[onChange]
	 */
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
		optionIdentifiers.push(optionID);
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	/**
	 * @param	{string}	optionID
	 * @param	{string}	optionText
	 * @param	{string}	optionType
	 * @param	{string}	categoryID
	 * @param	{string}	[categoryName]
	 * @param	{mixed}		[defaultValue]
	 * @param	{function}	[onChange]
	 */
	var addTextOption = function(optionID, optionText, optionType, categoryID, categoryName, defaultValue, onChange) {
		if (!!$('#bcplus-' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		if (['text', 'email', 'url', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'number', 'range', 'color', 'password'].indexOf(optionType.toLowerCase()) < 0) {
			throw new Error('Invalid option type »' + optionType.toLowerCase() + '« given!');
		}
		
		var $category = $($('#bcplus-' + categoryID)[0] || $('<fieldset id="bcplus-' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt><label for="bcplus-' + optionID + '">' + optionText + '</label></dt><dd><input type="' + optionType.toLowerCase() + '" id=bcplus-"' + optionID + '"/></dd>');
		var optionValue = storage.getValue(optionID + 'Option', defaultValue);
		
		$option.find('input').val(optionValue).on('blur', function(event) {
			storage.setValue(optionID + 'Option', $(this).val());
			
			// TODO: error checking?
			
			if ($.isFunction(onChange)) {
				onChange.call($(event.target), event);
			}
		});
		$category.find('dl').append($option);
		optionIdentifiers.push(optionID);
		
		WCF.DOMNodeInsertedHandler.execute();
		
		// TODO: when to save?
	};
	
	/**
	 * @param	{string}	optionName
	 * @param	{mixed}		[defaultValue]
	 */
	var getOptionValue = function(optionName, defaultValue) {
		return storage.getValue(optionName + 'Option', defaultValue);
	};
	
	/**
	 * @param	{string}	optionName
	 * @param	{mixed}		optionValue
	 */
	var setOptionValue = function(optionName, optionValue) {
		storage.setValue(optionName + 'Option', optionValue);
	};
	
	/**
	 * @returns	{Array.<string>}
	 */
	var getOptionIDs = function() {
		return optionIdentifiers; 
	};
	
	var _addCommandToCommandsObject = function(commandsObject, commandName, commandAction, restricted) {
		if (!commandName) {
			throw new Error('Invalid command name!');
		}
		
		if (!commandAction || !($.isFunction(commandAction) || ($.type(commandAction) === 'string'))) {
			throw new Error('Invalid command action!');
		}
		
		if ('array' !== $.type(commandName)) {
			commandName = [commandName];
		}
		
		if (Object.keys(commandsObject).filter(function(n) { return (-1 !== commandName.indexOf(n)); }).length > 0) {
			throw new Error('Command with name »' + commandName.join(', ') + '« already exists!');
		}
		
		var commandFunction = null;
		
		if ('string' === $.type(commandAction)) {
			commandFunction = (function(commandString) {
				return (function() {
					return commandString;
				});
			})(commandAction);
		}
		else {
			commandFunction = commandAction;
		}
		
		commandFunction.restricted = restricted;
		
		commandName.forEach(function(name) {
			commandsObject[name] = commandFunction;
		});
	};
	
	/**
	 * @param	{string|Array.<string>}		commandName
	 * @param	{function}			commandAction
	 */
	var addCommand = function(commandName, commandAction) {
		_addCommandToCommandsObject(commands, commandName, commandAction, false);
	};
	
	/**
	 * @param	{string|Array.<string>}		commandName
	 * @param	{function|string}		commandAction
	 * @param	{boolean}			[restricted]
	 */
	var addExternalCommand = function(commandName, commandAction, restricted) {
		if (restricted === undefined) {
			restricted = true;
		}
		
		_addCommandToCommandsObject(externalCommands, commandName, commandAction, restricted);
	};
	
	/**
	 * @param	{string}	cssRules
	 * @returns	{jQuery}
	 */
	var addStyle = function(cssRules) {
		return $('<style type="text/css" />').text(cssRules).appendTo('head');
	};
	
	init();
	
	return {
		getVersion:		getVersion,
		getStorage:		getStorage,
		getAwayStatus:		getAwayStatus,
		handleStreamScroll:	handleStreamScroll,
		sendMessage:		sendMessage,
		showInfoMessage:	showInfoMessage,
		addEventListener:	addEventListener,
		removeEventListener:	removeEventListener,
		addBoolOption:		addBoolOption,
		addTextOption:		addTextOption,
		getOptionValue:		getOptionValue,
		setOptionValue:		setOptionValue,
		getOptionIDs:		getOptionIDs,
		addCommand:		addCommand,
		addExternalCommand:	addExternalCommand,
		addStyle:		addStyle,
		
		get messageType() {
			return messageType;
		},

		get messageNodeType() {
			return messageNodeType;
		}
	};
});

if (undefined === Window.com) {
	Window.com = { };
}

if (undefined === Window.com.leon) {
	Window.com.leon = { };
}

Window.com.leon.BCPlus = BisaChatPlus();
Window.com.leon.BCPlus.Modules = Modules;
Window.com.leon.BCPlus.Media = Media;
Window.com.leon.BCPlus.Util = Util;
