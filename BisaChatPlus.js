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
	var optionsDialog = $('<div id="bcplusOptionsDialogContent" class="container containerPadding"></div>').appendTo('body').wcfDialog({
		autoOpen: false,
		title: 'Optionen',
		
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
	
	var init = function() {
		console.log('BisachatPlus.init()');
		bcplus = {
			getStorage:		getStorage,
			getAwayStatus:		getAwayStatus,
			addEventListener:	addEventListener,
			removeEventListener:	removeEventListener,
			addBoolOption:		addBoolOption,
			addTextOption:		addTextOption,
			
			get messageType() {
				return messageType;
			}
		};
		
		initEvents();
		buildUI();
		initModules();
	};
	
	var initEvents = function() {
		console.log('BisachatPlus.initEvents()');
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
					// TODO: get away status message
					awayStatus.message = '';
					
					event.awayStatusChanged.fire(awayStatus);
				}
				else if (awayStatus.isAway) {
					awayStatus.isAway = false;
					awayStatus.message = '';
					
					event.awayStatusChanged.fire(awayStatus);
				}
			}
		});
		
		
		Window.document.addEventListener('blur', function(e) {
			event.chatBlur.fire(e);
		});
		
		Window.document.addEventListener('focus', function(e) {
			event.chatFocus.fire(e);
		});
	};
	
	var buildUI = function() {
		console.log('BisachatPlus.buildUI()');
		var $optionsButton = $('<li><a id="bcplusOptions" class="button"><span class="icon icon16 icon-cog"></span><span class="invisible">BisaChat Plus Optionen</span></a></li>');
		$optionsButton.find('a').on('click', function() {
			optionsDialog.wcfDialog('open');
		});
		$optionsButton.appendTo('#timsChatOptions .buttonGroup');
	};
	
	var initModules = function() {
		console.log('BisachatPlus.initModules()');
		$.each(Modules, function(moduleName, moduleObject) {
			moduleObject.initialize(bcplus);
		});
	};
	
	var addStreamObserver = function(stream) {
		console.log('BisachatPlus.addStreamObserver()');
		stream = $(stream).get(0);
		
		if (stream.nodeName.toLowerCase() !== 'ul') {
			throw new Error('Can\'t observe stream of node type »' + stream.nodeName.toLowerCase() + '«.');
		}
		
		var messageObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
					var messageNode = $(mutation.addedNodes[i]);
					
					if (messageNode.hasClass('timsChatMessage')) {
						try {
							event.messageAdded.fire(messageNode);
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
	
	var addEventListener = function(eventName, callback) {
		console.log('BisachatPlus.addEventListener()');
		if (event[eventName] === null) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		event[eventName].add(callback);
	};
	
	var removeEventListener = function(eventName, callback) {
		console.log('BisachatPlus.removeEventListener()');
		if (event[eventName] === null) {
			throw new Error('Unknown event »' + eventName + '«.');
		}
		
		event[eventName].remove(callback);
	};
	
	var addBoolOption = function(optionID, optionText, categoryID, categoryName, defaultValue, onChange) {
		console.log('BisachatPlus.addBoolOption()');
		if (!!$('#' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		var $category = $($('#' + categoryID)[0] || $('<fieldset id="' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt></dt><dd><label><input type="checkbox" id="' + optionID + '"/> ' + optionText + '</label></dd>');
		
		storage.setValue(optionID + 'Option', !!defaultValue);
		$option.find('input').prop({
			checked: !!defaultValue
		}).on('change', function(event) {
			storage.setValue(optionID + 'Option', $(this).prop('checked'));
			
			if ($.isFunction(onChange)) {
				onChange.call($(event.target), event);
			}
		});
		$category.find('dl').append($option);
	};
	
	var addTextOption = function(optionID, optionText, optionType, categoryID, categoryName, defaultValue, onChange) {
		console.log('BisachatPlus.addTextOption()');
		if (!!$('#' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		if (['text', 'email', 'url', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'number', 'range', 'color', 'password'].indexOf(optionType.toLowerCase()) < 0) {
			throw new Error('Invalid option type »' + optionType.toLowerCase() + '« given!');
		}
		
		var $category = $($('#' + categoryID)[0] || $('<fieldset id="' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt><label for="' + optionID + '">' + optionText + '</label></dt><dd><input type="' + optionType.toLowerCase() + '" id="' + optionID + '"/></dd>');
		
		storage.setValue(optionID + 'Option', defaultValue);
		$option.find('input').val(defaultValue).on('blur', function(event) {
			storage.setValue(optionID + 'Option', $(this).val());
			
			// TODO: error checking?
			
			if ($.isFunction(onChange)) {
				onChange.call($(event.target), event);
			}
		});
		$category.find('dl').append($option);
		
		// TODO: when to save?
	};
	
	init();
	
	return {
		getStorage:		getStorage,
		getAwayStatus:		getAwayStatus,
		addEventListener:	addEventListener,
		removeEventListener:	removeEventListener,
		addBoolOption:		addBoolOption,
		addTextOption:		addTextOption,
		
		get messageType() {
			return messageType;
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
