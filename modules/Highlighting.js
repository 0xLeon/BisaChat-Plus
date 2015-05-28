Modules.Highlighting = (function() {
	var bcplus = null;
	var messages = null;
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
		messages = [];
		docTitle = Window.document.title;
		
		// removeExisting();
		getNotificationPermission();
		buildUI();
		addEventListeners();
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
		bcplus.addTextOption('bcplusHighlightingText', 'Highlighting bei', 'text', 'bcplusHighlighting', null, '');
		bcplus.addBoolOption('bcplusHighlightingChatbot', 'Chatbot-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
		bcplus.addBoolOption('bcplusHighlightingNp', 'NP-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: dynamic, comma separated value
			if (highlightingConditions.every(function(cond) { return cond(message, bcplus); })) {
				if (message.message.indexOf('Leon') > -1) {
					highlight(message);
				}
			}
		});
	};
	
	var highlight = function(message) {
		new Audio(Media.bing.dataURI).play();
		showNotification(message);
		messages.push(message.messageID);
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
				$($.map(messages, function(e) {
					return $('#' + e).closest('.timsChatMessage').get();
				})).effect('highlight');
				
				messages.length = 0;
				updateDocTitle()
				
				bcplus.removeEventListener(eventName, listenerFunction);
				listenerFunction = null;
				eventName = null;
			};
			bcplus.addEventListener(eventName, listenerFunction);
		}
	};
	
	var updateDocTitle = function() {
		if (messages.length > 0) {
			Window.document.title = '(' + messages.length.toString() + ') ' + docTitle;
		}
		else {
			Window.document.title = docTitle;
		}
	};
	
	var showNotification = function(message) {
		if (Window.Notification.permission === 'granted') {
			var notification = new Window.Notification('(' + $(message.formattedTime).text() + ') ' + message.username, {
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
	
	return {
		initialize:	initialize
	}
})();
