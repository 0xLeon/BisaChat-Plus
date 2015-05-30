Modules.Highlighting = (function() {
	var bcplus = null;
	var messageIDs = null;
	var regExp = null;
	var docTitle = null;
	var listenerFunction = null;
	var eventName = null;
	var highlightingConditions = [
		function(message, bcplus) {
			return bcplus.getStorage().getValue('bcplusHighlightingActiveOption', true);
		},
		function(message, bcplus) {
			return (!Window.document.hasFocus() || bcplus.getAwayStatus().isAway);
		},
		function(message, bcplus) {
			return (message.sender !== WCF.User.userID);
		},
		function(message, bcplus) {
			return (bcplus.getStorage().getValue('bcplusHighlightingChatbotOption', true) && (message.sender !== 55518));
		},
		function(message, bcplus) {
			return true || (bcplus.getStorage().getValue('bcplusHighlightingNpOption', true) && !message.message.startsWith('np:'));
		}
	];
	
	var initialize = function(_bcplus) {
		console.log('Modules.Highlighting.initialize()');
		bcplus = _bcplus;
		messageIDs = [];
		docTitle = Window.document.title;
		
		// removeExisting();
		getNotificationPermission();
		buildUI();
		addEventListeners();
	};
	
	var addHighlightingCondition = function(condition) {
		if (!$.isFunction(condition)) {
			throw new Error('Condition must be a function.');
		}
		
		return highlightingConditions.push(condition);
	};
	
	var removeHighlightingCondition = function(condition) {
		if (!$.isFunction(condition)) {
			throw new Error('Invalid parameter!');
		}
		
		var index = highlightingConditions.indexOf(condition);
		
		if (index < 0) {
			throw new Error('Condition not found!');
		}
		
		highlightingConditions.splice(index, 1);
	};
	
	var getNotificationPermission = function() {
		if (bcplus.getStorage().getValue('bcplusHighlightingActiveOption', true) && (Window.Notification.permission !== 'granted')) {
			return Window.Notification.requestPermission(function(permission) {
				var n;
				return (((n = Window.Notification).permission != null) ? n.permission : (n.permission = permission));
			});
		}
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('bcplusHighlightingActive', 'Highlighting aktivieren', 'bcplusHighlighting', 'Highlighting', true, getNotificationPermission);
		bcplus.addTextOption('bcplusHighlightingText', 'Highlighting bei', 'text', 'bcplusHighlighting', null, WCF.User.username, builRegExp);
		bcplus.addBoolOption('bcplusHighlightingChatbot', 'Chatbot-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
		bcplus.addBoolOption('bcplusHighlightingNp', 'NP-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: dynamic, comma separated value
			if (highlightingConditions.every(function(cond) { return cond(message, bcplus); })) {
				if (regExp === null) {
					builRegExp();
				}
				
				if (regExp.test(message.message)) {
					highlight(message);
				}
				
				// TODO: always highlight private messages
			}
		});
	};
	
	var highlight = function(message) {
		messageIDs.push(message.messageID);
		
		new Audio(Media.bing.dataURI).play();
		showNotification(message);
		updateDocTitle();
		
		if (listenerFunction === null) {
			if (bcplus.getAwayStatus().isAway) {
				eventName = 'awayStatusChanged';
			}
			else if (!document.hasFocus()) {
				eventName = 'chatFocus';
			}
			else {
				// TODO: throw error?
				return;
			}
			
			listenerFunction = function(awayStatus) {
				$(messageIDs.map(function(e) {
					return $('span[data-message-id="' + e.toString() + '"]').closest('.timsChatMessage').get();
				})).effect('highlight', {}, 1e3);
				
				messageIDs.length = 0;
				updateDocTitle()
				
				bcplus.removeEventListener(eventName, listenerFunction);
				listenerFunction = null;
				eventName = null;
			};
			bcplus.addEventListener(eventName, listenerFunction);
		}
	};
	
	var updateDocTitle = function() {
		if (messageIDs.length > 0) {
			Window.document.title = '(' + messageIDs.length.toString() + ') ' + docTitle;
		}
		else {
			Window.document.title = docTitle;
		}
	};
	
	var showNotification = function(message) {
		if (Window.Notification.permission === 'granted') {
			var notification = new Window.Notification('(' + $('<div>' + message.formattedTime + '</div>').text() + ') ' + message.username, {
				body: (message.message.length > 50 ? message.message.slice(0, 51) + '\u2026' : message.message),
				icon: $(message.avatar['48']).attr('src'),
				onclick: function() {
					console.log(this);
					notification.close();
				}
			});
			
			Window.setTimeout(function() {
				notification.close();
			});
		}
	};
	
	var builRegExp = function() {
		var highlightingString = bcplus.getStorage().getValue('bcplusHighlightingTextOption', WCF.User.username);
		var regExpString = highlightingString.split(',').map(function(item) {
			// TODO: move to RegExp.escape()
			return item.trim().replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
		}).join('|');
		
		regExp = null;
		regExp = new RegExp('\\b(' + regExpString + ')\\b', 'i');
	};
	
	return {
		initialize:			initialize,
		addHighlightingCondition:	addHighlightingCondition,
		removeHighlightingCondition:	removeHighlightingCondition
	};
})();
