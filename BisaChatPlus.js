var BisaChatPlus = (function() {
	var bcplus = null;
	var storage = Storage.getInterface('bcplus');
	var event = {
		messageAdded: $.Callbacks(),
		messageSubmit: $.Callbacks(),
		awayStatusChanged: $.Callbacks(),
		optionsOpened: $.Callbacks(),
		optionsClosed: $.Callbacks()
	};
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
	}
	
	var init = function() {
		console.log('BisachatPlus.init()');
		bcplus = {
			getStorage:		getStorage,
			getAwayStatus:		getAwayStatus,
			addEventListener:	addEventListener,
			removeEventListener:	removeEventListener,
			addBoolOption:		addBoolOption,
			addTextOption:		addTextOption
		};
		
		initEvents();
		buildUI();
		initModules();
	};
	
	var initEvents = function() {
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
		var messageObserverTarget = $('#timsChatMessageContainer0').find('ul');
		
		messageObserver.observe(messageObserverTarget[0], messageObserverConfig);
		
		
		Window.be.bastelstu.Chat.listener.add('newMessage', function(message) {
			switch (message.type) {
				case 3:
				case 4:
					if (message.sender === WCF.User.userID) {
						if (message.type === 3) {
							awayStatus.isAway = true;
							// TODO: get away status message
							awayStatus.message = '';
						}
						else {
							awayStatus.isAway = false;
							awayStatus.message = '';
						}
						
						event.awayStatusChanged.fire(awayStatus);
					}
					
					break;
			}
		});
	};
	
	var buildUI = function() {
		var $optionsButton = $('<li><a id="bcplusOptions" class="button"><span class="icon icon16 icon-cog"></span><span class="invisible">BisaChat Plus Optionen</span></a></li>');
		$optionsButton.find('a').on('click', function() {
			optionsDialog.wcfDialog('open');
		});
		$optionsButton.appendTo('#timsChatOptions .buttonGroup');
	}
	
	var initModules = function() {
		console.log('BisachatPlus.initModules()');
		$.each(Modules, function(moduleName, moduleObject) {
			moduleObject.initialize(bcplus);
		});
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
	}
	
	var addBoolOption = function(optionID, optionText, categoryID, categoryName, defaultValue, onChange) {
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
	
	var addTextOption = function(optionID, optionText, optionType, categoryID, categoryName, defaultValue) {
		if (!!$('#' + optionID)[0]) {
			throw new Error('Option »' + optionID + '« already exists!');
		}
		
		if (['text', 'email', 'url', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'number', 'range', 'color', 'password'].indexOf(optionType.toLowerCase()) < 0) {
			throw new Error('Invalid option type »' + optionType.toLowerCase() + '« given!');
		}
		
		var $category = $($('#' + categoryID)[0] || $('<fieldset id="' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>').appendTo('#bcplusOptionsDialogContent'));
		var $option = $('<dt><label for="' + optionID + '">' + optionText + '</label></dt><dd><input type="' + optionType.toLowerCase() + '" id="' + optionID + '"/></dd>');
		
		storage.setValue(optionID + 'Option', defaultValue);
		$option.find('input').val(defaultValue);
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
		addTextOption:		addTextOption
	};
})();
