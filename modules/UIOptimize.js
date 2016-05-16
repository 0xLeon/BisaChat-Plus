Modules.UIOptimize = (function() {
	var bcplus = null;
	var hideAwayUsersStyle = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('.timsChatMessageContainer { padding-left: 15px !important; padding-right: 15px !important; }');
		bcplus.addStyle('.timsChatMessage time { font-weight: normal !important; }');
		bcplus.addStyle('.timsChatMessage .altLayout time.timeLeft { float: none !important; }');
		bcplus.addStyle('.timsChatMessage .timsChatMessageIcon { display: table; text-align: center; min-height: 100%; }');
		bcplus.addStyle('.timsChatMessage .timsChatMessageIcon .icon, .timsChatMessage .timsChatMessageIcon .icon::before { vertical-align: middle; }');
		hideAwayUsersStyle = bcplus.addStyle('#timsChatUserList .away:not(.you) { display: none !important; visibility: hidden !important; }');
		
		if (!bcplus.getOptionValue('UIOptimizeHideAwayUsers', false)) {
			hideAwayUsersStyle.detach();
		}
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('UIOptimizeTimeBeforeName', 'Zeitstempel vor dem Benutzername', 'UIOptimize', 'User Interface', false);
		bcplus.addBoolOption('UIOptimizeShowSeconds', 'Zeitstempel mit Sekundenangabe', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeHideExternalLinkConfirm', 'Bestätigungs-Dialog bei externen Links überspringen', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeHideAwayUsers', 'Abwesende Benutzer ausblenden', 'UIOptimize', null, false, function(event) {
			if (bcplus.getOptionValue('UIOptimizeHideAwayUsers', false)) {
				hideAwayUsersStyle.detach().appendTo('head');
			}
			else {
				hideAwayUsersStyle.detach();
			}
		});
		
		$('#timsChatAltLayout').addClass('invisible');
		$('#timsChatAltLayout').data('status', 1);
		
		$(Window).resize();
	};

	var addEventListeners = function() {
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
		
		(new MutationObserver(function(mutations) {
			$(Window).resize();
		})).observe($('#timsChatTopic').get(0), {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
			attributeFilter: ['class']
		});
		
		bcplus.addEventListener('messageReceived', function(message) {
			message.altLayout = true;
			message.isFollowUp = false;
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			var $timeNode = $messageNode.find('.timsChatInnerMessage time');
			
			if (bcplus.getOptionValue('UIOptimizeTimeBeforeName', false)) {
				$timeNode.addClass('timeLeft');
			}
			
			$timeNode.detach();
			
			if (!bcplus.getOptionValue('UIOptimizeShowSeconds', false)) {
				$timeNode.text($timeNode.text().trim().slice(0, -3));
			}
			
			if ($timeNode.hasClass('timeLeft')) {
				$timeNode.text('[' + $timeNode.text().trim() + ']');
			}
			
			$timeNode.prependTo($messageNode.find('.timsChatInnerMessage'));
			
			if ((messageNodeEvent.messageType < bcplus.messageType.MODERATE) || (messageNodeEvent.messageType === bcplus.messageType.WHISPER)) {
				$messageNode.find('.timsChatUsernameContainer').find('.icon.pointer').off('click').prop('onclick', null);
				$messageNode.find('.timsChatUsernameContainer').data('username', ((messageNodeEvent.messageType === bcplus.messageType.WHISPER) && messageNodeEvent.ownMessage) ? messageNodeEvent.receiverUsername : messageNodeEvent.senderUsername);
				$messageNode.find('.timsChatUsernameContainer').addClass('pointer').on('click', function() {
					Window.be.bastelstu.Chat.insertText('/whisper ' + $(this).data('username') + ', ', {
						prepend: false,
						append: false,
						submit: false
					});
				});
			}
			
			if (bcplus.getOptionValue('UIOptimizeHideExternalLinkConfirm', false)) {
				$messageNode.find('a.externalURL[onclick]').off('click').prop('onclick', null);
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
		
		// TODO: check with timestamps with date (0:00 pm rollover)
		selectedText = selectedText.trim()
			.replace(/^\s+|\s+$/gm, "\n")				// white space on start and end of lines
			.replace(/\n{2,}/g, "\n")				// multiple sequential line feeds
			.replace(/^(\d{2})(\:\d{2})(\:\d{2})?/gm, '[$1$2$3]');	// enclose timestamp in brackets
		
		event.clipboardData.setData('text/plain', selectedText);
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
