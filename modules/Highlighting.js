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
			return (message.ownMessage);
		},
		function(message, bcplus) {
			return (bcplus.getStorage().getValue('bcplusHighlightingChatbotOption', true) && (message.sender !== 55518));
		},
		function(message, bcplus) {
			return (bcplus.getStorage().getValue('bcplusHighlightingNpOption', true) && !message.plainText.startsWith('np:'));
		}
	];
	
	var initialize = function(_bcplus) {
		console.log('Modules.Highlighting.initialize()');
		bcplus = _bcplus;
		messageIDs = [];
		docTitle = Window.document.title;
		
		removeExisting();
		getNotificationPermission();
		buildUI();
		addEventListeners();
	};
	
	var addHighlightingCondition = function(condition) {
		console.log('Modules.Highlighting.addHighlightingCondition()');
		if (!$.isFunction(condition)) {
			throw new Error('Condition must be a function.');
		}
		
		return highlightingConditions.push(condition);
	};
	
	var removeHighlightingCondition = function(condition) {
		console.log('Modules.Highlighting.removeHighlightingCondition()');
		if (!$.isFunction(condition)) {
			throw new Error('Invalid parameter!');
		}
		
		var index = highlightingConditions.indexOf(condition);
		
		if (index < 0) {
			throw new Error('Condition not found!');
		}
		
		highlightingConditions.splice(index, 1);
	};
	
	var removeExisting = function() {
		console.log('Modules.Highlighting.removeExisting()');
		var $notifyButton = $('#timsChatNotify').css({
			display: 'none'
		});
		
		if ($notifyButton.data('status') === 1) {
			$notifyButton.click();
		}
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
		console.log('Modules.Highlighting.buildUI()');
		bcplus.addBoolOption('bcplusHighlightingActive', 'Highlighting aktivieren', 'bcplusHighlighting', 'Highlighting', true, getNotificationPermission);
		bcplus.addTextOption('bcplusHighlightingText', 'Highlighting bei', 'text', 'bcplusHighlighting', null, WCF.User.username, builRegExp);
		bcplus.addBoolOption('bcplusHighlightingSound', 'Sound aktivieren', 'bcplusHighlighting', null, true);
		bcplus.addBoolOption('bcplusHighlightingNotification', 'Desktop Notification anzeigen', 'bcplusHighlighting', null, true);
		bcplus.addBoolOption('bcplusHighlightingChatbot', 'Chatbot-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
		bcplus.addBoolOption('bcplusHighlightingNp', 'NP-Nachrichten ausschließen', 'bcplusHighlighting', null, true);
	};
	
	var addEventListeners = function() {
		console.log('Modules.Highlighting.addEventListeners()');
		bcplus.addEventListener('messageReceived', function(message) {
			if (highlightingConditions.every(function(cond) { return cond(message, bcplus); })) {
				if (regExp === null) {
					builRegExp();
				}
				
				if ((message.type === bcplus.messageType.WHISPER) || regExp.test(message.plainText)) {
					highlight(message);
				}
			}
		});
	};
	
	var highlight = function(message) {
		messageIDs.push(message.messageID);
		
		if (bcplus.getStorage().getValue('bcplusHighlightingSoundOption', true)) {
			new Audio(Media.bing.dataURI).play();
		}
		
		if (bcplus.getStorage().getValue('bcplusHighlightingNotificationOption', true)) {
			showNotification(message);
		}
		
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
				icon: $(message.avatar['48']).attr('src')
			});
			
			notification.onclick = function() {
				// TODO: if message in private channel, open the channel
				this.close();
			};
			
			Window.setTimeout(function() {
				notification.close();
			}, 5e3);
		}
	};
	
	var builRegExp = function() {
		var highlightingString = bcplus.getStorage().getValue('bcplusHighlightingTextOption', WCF.User.username);
		var regExpString = highlightingString.split(',').map(function(item) {
			return RegExp.escape(item.trim());
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
