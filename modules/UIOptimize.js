Modules.UIOptimize = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.UIOptimize.initialize()');
		bcplus = _bcplus;
		
		buildUI();
		addStyles();
		addEventListeners();
	};
	
	var addStyles = function() {
		console.log('Modules.UIOptimize.addStyles()')
		
		// TODO: re-display if there is content in chat topic
		$('<style type="text/css">#timsChatTopic { display: none !important; }</style>').appendTo('head');
	};
	
	var buildUI = function() {
		console.log('Modules.UIOptimize.buildUI()');
		bcplus.addBoolOption('UIOptimizeShowSeconds', 'Zeitstempel mit Sekundenangabe', 'UIOptimize', 'User Interface', false);
	};

	var addEventListeners = function() {
		console.log('Modules.UIOptimize.addEventListeners()');
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
		
		bcplus.addEventListener('messageAdded', function($messageNode) {
			// TODO: bubble layout support
			var $timeNode = $messageNode.find('.timsChatInnerMessage time').detach();
			
			if (!bcplus.getStorage().getValue('UIOptimizeShowSecondsOption', false)) {
				$timeNode.text($timeNode.text().trim().slice(0, -3));
			}
			
			$timeNode.prependTo($messageNode.find('.timsChatInnerMessage'));
		});
		
		$('#timsChatMessageContainer0').get(0).addEventListener('copy', streamCopyListener, false);
		Window.document.addEventListener('keypress', streamSelectAllListener, false);
		
		bcplus.addEventListener('privateRoomAdded', function($privateRoom) {
			$privateRoom.get(0).addEventListener('copy', streamCopyListener, false);
		});
		
		bcplus.addEventListener('privateRoomRemoved', function($privateRoom) {
			$privateRoom.get(0).removeEventListener('copy', streamCopyListener, false);
		});
	};
	
	var streamCopyListener = function(event) {
		console.log('Modules.UIOptimize.streamCopyListener()');
		event.preventDefault();
		
		var selection = Window.getSelection();
		var selectedText = selection.toString();
		
		event.clipboardData.setData('text/plain', selectedText);
		
		console.log(selectedText);
	};
	
	var streamSelectAllListener = function(event) {
		console.log('Modules.UIOptimize.streamSelectAllListener()');
		if (event.ctrlKey && (event.key === 'a') && !(event.altKey || event.shiftKey || event.metaKey) && (Window.document.activeElement.nodeName.toLowerCase() === 'body')) {
			event.preventDefault();
			
			// workaround for firefox bug: add list instead of actual node
			// because otherwise copy event wouldn't fire
			var $roomNode = $('.timsChatMessageContainer.active ul');
			var selection = Window.getSelection();
			var selectionRange = Window.document.createRange();
			
			selectionRange.selectNode($roomNode.get(0));
			selection.removeAllRanges();
			selection.addRange(selectionRange);
		}
	};
	
	return {
		initialize:	initialize
	};
})();
