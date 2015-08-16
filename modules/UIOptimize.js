Modules.UIOptimize = (function() {
	var bcplus = null;
	var hideAwayUsersStyle = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		buildUI();
		addStyles();
		addEventListeners();
	};
	
	var addStyles = function() {
		$('<style type="text/css">.timsChatMessageContainer { padding-left: 15px !important; padding-right: 15px !important; }</style>').appendTo('head');
		// TODO: re-display if there is content in chat topic
		$('<style type="text/css">#timsChatTopic { display: none !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage time { font-weight: normal !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage .altLayout time.timeLeft { float: none !important; }</style>').appendTo('head');
		hideAwayUsersStyle = $('<style type="text/css">#timsChatUserList .away:not(.you) { display: none !important; visibility: hidden !important; }</style>');
		
		if (bcplus.getStorage().getValue('UIOptimizeHideAwayUsersOption', false)) {
			hideAwayUsersStyle.appendTo('head');
		}
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('UIOptimizeTimeBeforeName', 'Zeitstempel vor dem Benutzername', 'UIOptimize', 'User Interface', false);
		bcplus.addBoolOption('UIOptimizeShowSeconds', 'Zeitstempel mit Sekundenangabe', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeHideExternalLinkConfirm', 'Bestätigungs-Dialog bei externen Links überspringen', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeHideAwayUsers', 'Abwesende Benutzer ausblenden', 'UIOptimize', null, false, function(event) {
			if (bcplus.getStorage().getValue('UIOptimizeHideAwayUsersOption', false)) {
				hideAwayUsersStyle.detach().appendTo('head');
			}
			else {
				hideAwayUsersStyle.detach();
			}
		});
		
		$('#timsChatAltLayout').closest('li').detach().insertAfter($('#timsChatSmilies').closest('li'));
	};

	var addEventListeners = function() {
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			var $timeNode = null;
			var $timeTargetNode = null;
			
			if (messageNodeEvent.messageNodeType === bcplus.messageNodeType.BUBBLEFOLLOWUP) {
				$timeNode = $messageNode.find('time');
				$timeTargetNode = $messageNode;
			}
			else {
				$timeNode = $messageNode.find('.timsChatInnerMessage time');
				$timeTargetNode = $messageNode.find('.timsChatInnerMessage');
				
				if (bcplus.getStorage().getValue('UIOptimizeTimeBeforeNameOption', false) && (messageNodeEvent.messageNodeType === bcplus.messageNodeType.ALTERNATIVE)) {
					$timeNode.addClass('timeLeft');
				}
			}
			
			$timeNode.detach();
			
			if (!bcplus.getStorage().getValue('UIOptimizeShowSecondsOption', false)) {
				$timeNode.text($timeNode.text().trim().slice(0, -3));
			}
			
			if ($timeNode.hasClass('timeLeft')) {
				$timeNode.text('[' + $timeNode.text().trim() + ']');
			}
			
			$timeNode.prependTo($timeTargetNode);
			
			if ((messageNodeEvent.messageNodeType !== bcplus.messageNodeType.BUBBLEFOLLOWUP) && ((messageNodeEvent.messageType < bcplus.messageType.MODERATE) || (messageNodeEvent.messageType === bcplus.messageType.WHISPER))) {
				$messageNode.find('.timsChatUsernameContainer').find('.icon.pointer').off('click').prop('onclick', null);
				$messageNode.find('.timsChatUsernameContainer').data('username', messageNodeEvent.senderUsername);
				$messageNode.find('.timsChatUsernameContainer').toggleClass('pointer').on('click', function() {
					Window.be.bastelstu.Chat.insertText('/whisper ' + $(this).data('username') + ', ', {
						prepend: false,
						append: false,
						submit: false
					});
				});
			}
			
			if (bcplus.getStorage().getValue('UIOptimizeHideExternalLinkConfirmOption', false)) {
				$messageNode.find('a.externalURL[onclick]').prop('onclick', null);
			}
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
		event.preventDefault();
		
		var selection = Window.getSelection();
		var selectedText = selection.toString();
		
		event.clipboardData.setData('text/plain', selectedText);
		
		console.log(selectedText);
	};
	
	var streamSelectAllListener = function(event) {
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
