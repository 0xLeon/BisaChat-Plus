Modules.Highlighting = (function() {
	var bcplus = null;
	var messageIDs = null;
	var regExp = null;
	var docTitle = null;
	var listenerFunction = null;
	var eventName = null;
	var highlightingConditions = [
		function(message, bcplus) {
			return bcplus.getStorage().getValue('highlightingActiveOption', true);
		},
		function(message, bcplus) {
			return (!Window.document.hasFocus() || bcplus.getAwayStatus().isAway);
		},
		function(message, bcplus) {
			return (!message.ownMessage);
		},
		function(message, bcplus) {
			return (bcplus.getStorage().getValue('highlightingChatbotOption', true) && (message.sender !== 55518));
		},
		function(message, bcplus) {
			return (bcplus.getStorage().getValue('highlightingNpOption', true) && !message.plainText.startsWith('np:'));
		}
	];
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		messageIDs = [];
		docTitle = Window.document.title;
		
		removeExisting();
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
	
	var removeExisting = function() {
		var $notifyButton = $('#timsChatNotify').css({
			display: 'none'
		});
		
		if ($notifyButton.data('status') === 1) {
			$notifyButton.click();
		}
	};
	
	var getNotificationPermission = function() {
		if (bcplus.getStorage().getValue('highlightingActiveOption', true) && (Window.Notification.permission !== 'granted')) {
			return Window.Notification.requestPermission(function(permission) {
				var n;
				return (((n = Window.Notification).permission !== null) ? n.permission : (n.permission = permission));
			});
		}
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('highlightingActive', 'Highlighting aktivieren', 'highlighting', 'Highlighting', true, getNotificationPermission);
		bcplus.addTextOption('highlightingText', 'Highlighting bei', 'text', 'highlighting', null, WCF.User.username, builRegExp);
		bcplus.addBoolOption('highlightingSound', 'Sound aktivieren', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingNotification', 'Desktop Notification anzeigen', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingChatbot', 'Chatbot-Nachrichten ausschließen', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingNp', 'NP-Nachrichten ausschließen', 'highlighting', null, true);
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			if (highlightingConditions.every((cond) => cond(message, bcplus))) {
				if (regExp === null) {
					builRegExp();
				}
				
				if ((message.type === bcplus.messageType.WHISPER) || regExp.test(message.plainText)) {
					highlight(message);
				}
			}
		});
		
		// bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
		// 	// if message should be highlighted AND waypoint not attached
		// 	if ((messageIDs.indexOf(messageNodeEvent.messageID) > -1) && !messageNodeEvent.messageNode.closest('.timsChatMessage').data('highlightingWaypointAttached')) {
		// 		messageNodeEvent.messageNode.closest('.timsChatMessage').data('highlightingWaypointAttached', true);
		// 		
		// 		new Waypoint.Inview({
		// 			context: messageNodeEvent.messageNode.closest('.timsChatMessageContainer').get(0),
		// 			element: messageNodeEvent.messageNode.closest('.timsChatMessage').find('.timsChatInnerMessage').get(0),
		// 			entered: function() {
		// 				if (document.hasFocus() && !bcplus.getAwayStatus().isAway) {
		// 					$(this.element).effect('highlight', {}, 1e3);
		// 					this.destroy();
		// 				}
		// 			}
		// 		});
		// 	}
		// });
	};
	
	var highlight = function(message) {
		messageIDs.push(message.messageID);
		
		if (bcplus.getStorage().getValue('highlightingSoundOption', true)) {
			new Audio(Media.bing.dataURI).play();
		}
		
		if (bcplus.getStorage().getValue('highlightingNotificationOption', true)) {
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
				$.unique($(messageIDs.map(function(e) {
					return $('.timsChatText[data-message-id="' + e.toString() + '"]').closest('.timsChatInnerMessage').get(0);
				}))).effect('highlight', {}, 1e3);
				
				messageIDs.length = 0;
				updateDocTitle();
				
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
			var messageIsPrivate = (message.type === bcplus.messageType.WHISPER);
			var notificationTitle = '(' + $('<div>' + message.formattedTime + '</div>').text() + ') ' + message.username + (messageIsPrivate ? ' flüstert' : '');
			var notificationBody = (message.plainText.length > 50 ? message.plainText.slice(0, 51) + '\u2026' : message.plainText);
			var notification = new Window.Notification(notificationTitle, {
				body: notificationBody,
				icon: $(message.avatar['48']).attr('src')
			});
			
			notification.onclick = function() {
				if (messageIsPrivate && ($('#timsChatMessageTabMenuAnchor' + message.sender).length === 1)) {
					$('#timsChatMessageTabMenuAnchor' + message.sender).click();
				}
				else {
					$('#timsChatMessageTabMenuAnchor0').click();
				}
				
				this.close();
			};
			
			Window.setTimeout(function() {
				notification.close();
			}, 5e3);
		}
	};
	
	var builRegExp = function() {
		var highlightingString = bcplus.getStorage().getValue('highlightingTextOption', WCF.User.username);
		var regExpString = highlightingString.split(',').map((item) => RegExp.escape(item.trim())).join('|');
		
		regExp = null;
		regExp = new RegExp('\\b(' + regExpString + ')\\b', 'i');
	};
	
	return {
		initialize:			initialize,
		addHighlightingCondition:	addHighlightingCondition,
		removeHighlightingCondition:	removeHighlightingCondition
	};
})();
