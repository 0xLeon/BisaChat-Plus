Modules.Highlighting = (function() {
	let bcplus = null;
	let messageIDs = null;
	let regExp = null;
	let docTitle = null;
	let listenerFunction = null;
	let eventName = null;
	let highlightingConditions = [
		function(message, bcplus) {
			return bcplus.getOptionValue('highlightingActive', true);
		},
		function(message, bcplus) {
			return (!Window.document.hasFocus() || bcplus.getAwayStatus().isAway);
		},
		function(message, bcplus) {
			return (!message.ownMessage);
		},
		function(message, bcplus) {
			return (-1 === bcplus.getStorage().getValue('ignoredUserIDs', []).indexOf(message.sender));
		},
		function(message, bcplus) {
			return (!!message.teamMessage ? !bcplus.getOptionValue('teamIgnore', false) : true);
		},
		function(message, bcplus) {
			return ((55518 === message.sender) ? !bcplus.getOptionValue('highlightingChatbot', true) : true);
		},
		function(message, bcplus) {
			return (message.plainText.startsWith('np:') ? !bcplus.getOptionValue('highlightingNp', true) : true);
		}
	];
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		messageIDs = [];
		docTitle = Window.document.title;
		
		removeExisting();
		getNotificationPermission();
		builRegExp();
		buildUI();
		addEventListeners();
	};
	
	let addHighlightingCondition = function(condition) {
		if (!$.isFunction(condition)) {
			throw new Error('Condition must be a function.');
		}
		
		return highlightingConditions.push(condition);
	};
	
	let removeHighlightingCondition = function(condition) {
		if (!$.isFunction(condition)) {
			throw new Error('Invalid parameter!');
		}
		
		let index = highlightingConditions.indexOf(condition);
		
		if (index < 0) {
			throw new Error('Condition not found!');
		}
		
		highlightingConditions.splice(index, 1);
	};
	
	let removeExisting = function() {
		let $notifyButton = $('#timsChatNotify').css({
			display: 'none'
		});
		
		if (1 === $notifyButton.data('status')) {
			$notifyButton.click();
		}
	};
	
	let getNotificationPermission = function() {
		if (bcplus.getOptionValue('highlightingActive', true) && ('granted' !== Window.Notification.permission)) {
			return Window.Notification.requestPermission(function(permission) {
				let n;
				return ((null !== (n = Window.Notification).permission) ? n.permission : (n.permission = permission));
			});
		}
	};
	
	let buildUI = function() {
		bcplus.addBoolOption('highlightingActive', 'Highlighting aktivieren', 'highlighting', 'Highlighting', true, function(event) {
			getNotificationPermission();
			
			if ($(event.target).prop('checked')) {
				$('#bcplus-highlighting input').enable();
			}
			else {
				$('#bcplus-highlighting input:not(#bcplus-highlightingActive)').disable();
			}
		});
		bcplus.addTextOption('highlightingText', 'Highlighting bei', 'text', 'highlighting', null, WCF.User.username, builRegExp);
		bcplus.addBoolOption('highlightingSound', 'Sound aktivieren', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingNotification', 'Desktop Notification anzeigen', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingChatbot', 'Chatbot-Nachrichten ausschließen', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingNp', 'NP-Nachrichten ausschließen', 'highlighting', null, true);
		bcplus.addBoolOption('highlightingWhisperAlways', 'Bei privaten Nachrichten immer benachrichtigen', 'highlighting', null, true);
		
		if (Modules.hasOwnProperty('TeamMessages')) {
			bcplus.addBoolOption('highlightingTeamAlways', 'Bei Team-Nachrichten immer benachrichtigen', 'highlighting', null, false);
		}
		
		if (!bcplus.getOptionValue('highlightingActive', true)) {
			$('#bcplus-highlighting input:not(#bcplus-highlightingActive)').disable();
		}
	};
	
	let addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			if (highlightingConditions.every(function(cond) { return cond(message, bcplus); })) {
				if ((bcplus.getOptionValue('highlightingWhisperAlways', true) && (bcplus.messageType.WHISPER === message.type) && !message.teamMessage) || (bcplus.getOptionValue('highlightingTeamAlways', false) && !!message.teamMessage) || regExp.test(message.plainText)) {
					highlight(message);
				}
			}
		});
	};
	
	let highlight = function(message) {
		messageIDs.push(message.messageID);
		
		if (bcplus.getOptionValue('highlightingSound', true)) {
			new Audio(Media.bing.dataURI).play();
		}
		
		if (bcplus.getOptionValue('highlightingNotification', true)) {
			showNotification(message);
		}
		
		updateDocTitle();
		
		if (null === listenerFunction) {
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
			
			listenerFunction = highlightingListenerFunction;
			listenerFunction.eventName = eventName;
			bcplus.addEventListener(eventName, listenerFunction);
		}
	};
	
	let highlightingListenerFunction = function() {
		$.unique($(messageIDs.map(function(messageID) {
			return $('.timsChatText[data-message-id="' + messageID.toString(10) + '"]').closest('.timsChatInnerMessage')[0];
		}))).each(function(index, message) {
			let docViewTop = $(message).closest('.timsChatMessageContainer').scrollTop();
			let docViewBottom = docViewTop + $(message).closest('.timsChatMessageContainer').height();
			
			let elemTop = $(message).offset().top;
			let elemBottom = elemTop + $(message).height();
			
			if ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
				// is visible in scroll, highlight directly
				$(message).effect('highlight', {}, 1e3);
			}
			else {
				// not visible, attach waypoint
				// TODO: screw waypoints, this shit is still not working :(
				if (undefined !== $(message).data('waypoint')) {
					return;
				}
				
				let wp = new Waypoint.Inview({
					context: $(message).closest('.timsChatMessageContainer')[0],
					element: $(message).closest('.timsChatMessage')[0],
					entered: function() {
						$(this.element).effect('highlight', {}, 1e3);
						this.destroy();
					}
				});
				
				$(message).data('waypoint', wp);
			}
		});
		
		messageIDs.length = 0;
		updateDocTitle();
		
		bcplus.removeEventListener(listenerFunction.eventName, listenerFunction);
		delete listenerFunction.eventName;
		listenerFunction = null;
	};
	
	let updateDocTitle = function() {
		if (messageIDs.length > 0) {
			Window.document.title = '(' + messageIDs.length.toString() + ') ' + docTitle;
		}
		else {
			Window.document.title = docTitle;
		}
	};
	
	let showNotification = function(message) {
		if ('granted' === Window.Notification.permission) {
			let messageIsPrivate = (bcplus.messageType.WHISPER === message.type);
			let notificationTitle = '[' + $('<div>' + message.formattedTime + '</div>').text() + '] ' + message.username + ' ' + (messageIsPrivate ? !!message.teamMessage ? '» Team' : 'flüstert' : 'schreibt') + message.separator;
			let notificationBody = (message.plainText.length > 50 ? message.plainText.slice(0, 51) + '\u2026' : message.plainText);
			let notification = new Window.Notification(notificationTitle, {
				body: notificationBody,
				icon: $(message.avatar['48']).attr('src')
			});
			
			notification.onclick = function() {
				if (messageIsPrivate && (1 === $('#timsChatMessageTabMenuAnchor' + message.sender).length)) {
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
	
	let builRegExp = function() {
		let highlightingString = bcplus.getOptionValue('highlightingText', WCF.User.username);
		let regExpString = highlightingString.split(',').map(function(item) {
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
