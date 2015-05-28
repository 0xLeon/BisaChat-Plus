Modules.Highlighting = (function() {
	var bcplus = null;
	var messages = null;
	var docTitle = null;
	var listenerFunction = null;
	var eventName = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.Highlighting.initialize()');
		bcplus = _bcplus;
		messages = [];
		docTitle = Window.document.title;
		
		// removeExisting();
		buildUI();
		addEventListeners();
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('bcplusHighlightingActive', 'Highlighting aktivieren', 'bcplusHighlighting', 'Highlighting', true);
		bcplus.addTextOption('bcplusHighlightingText', 'Highlighting bei', 'text', 'bcplusHighlighting', null, '');
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: dynamic, comma separated value
			if (!Window.document.hasFocus() || bcplus.getAwayStatus().isAway) {
				if (message.message.indexOf('Leon') > -1) {
					highlight(message);
				}
			}
		});
	};
	
	var highlight = function(message) {
		new Audio(Media.bing.dataURI).play();
		messages.push(message);
		updateDocTitle();
		
		if (listenerFunction === null) {
			if (bcplus.getAwayStatus().isAway) {
				eventName = 'awayStatusChanged';
			}
			else if (!document.hasFocus()) {
				eventName = 'chatFocus';
			}
			
			listenerFunction = function(awayStatus) {
				if (!awayStatus.isAway) {
					$($.map(messages, function(e) {
						return e.get();
					})).effect('highlight');
					
					message.length = 0;
					updateDocTitle();
					
					bcplus.removeEventListener(eventName, listenerFunction);
					listenerFunction = null;
					eventName = null;
				}
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
	
	return {
		initialize:	initialize
	}
})();
