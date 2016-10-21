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
		bcplus.addStyle('.timsChatMessage8 .timsChatUsernameContainer, .timsChatMessage7 .timsChatUsernameContainer, .timsChatMessage1 > .timsChatInnerMessageContainer, .timsChatMessage2 > .timsChatInnerMessageContainer, .timsChatMessage2 > .timsChatInnerMessageContainer, .timsChatMessage4 > .timsChatInnerMessageContainer, .timsChatMessage6 > .timsChatInnerMessageContainer { font-weight: bold !important; }');
		bcplus.addStyle('.bcplusAwayMarker hr { width: 80%; }');
		hideAwayUsersStyle = bcplus.addStyle('#timsChatUserList .away:not(.you) { display: none !important; visibility: hidden !important; }');
		
		if (!bcplus.getOptionValue('UIOptimizeHideAwayUsers', false)) {
			hideAwayUsersStyle.detach();
		}
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('UIOptimizeTimeBeforeName', 'Zeitstempel vor dem Benutzername', 'UIOptimize', 'User Interface', false);
		bcplus.addBoolOption('UIOptimizeShowSeconds', 'Zeitstempel mit Sekundenangabe', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeAwayMarker', 'Marker beim Tab-/Fenster-Wechsel setzen', 'UIOptimize', null, true, function(event) {
			if (!bcplus.getOptionValue('UIOptimizeAwayMarker', true)) {
				$('.timsChatMessageContainer li.bcplusAwayMarker').remove();
				bcplus.handleStreamScroll();
			}
		});
		bcplus.addBoolOption('UIOptimizeHideExternalLinkConfirm', 'Bestätigungs-Dialog bei externen Links überspringen', 'UIOptimize', null, false);
		bcplus.addBoolOption('UIOptimizeHideAwayUsers', 'Abwesende Benutzer ausblenden', 'UIOptimize', null, false, function(event) {
			if (bcplus.getOptionValue('UIOptimizeHideAwayUsers', false)) {
				hideAwayUsersStyle.detach().appendTo('head');
			}
			else {
				hideAwayUsersStyle.detach();
			}
		});
		
		$('#timsChatAltLayout').closest('li').detach().insertAfter($('#timsChatSmilies').closest('li'));
		
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

		bcplus.addEventListener('chatBlur', function() {
			if (bcplus.getOptionValue('UIOptimizeAwayMarker', true)) {
				$('.timsChatMessageContainer li.bcplusAwayMarker').remove();
				$('.timsChatMessageContainer > ul').append($('<li class="bcplusAwayMarker"><hr /></li>'));
				bcplus.handleStreamScroll();
			}
		});
		
		bcplus.addEventListener('messageReceived', function(message) {
			if (!bcplus.getOptionValue('UIOptimizeShowSeconds', false)) {
				message.formattedTime = message.formattedTime.trim().slice(0, -3);
			}
		});
		
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			var $timeNode = null;
 			
			if (bcplus.messageNodeType.BUBBLEFOLLOWUP === messageNodeEvent.messageNodeType) {
				$timeNode = $messageNode.find('time');
			}
			else {
				$timeNode = $messageNode.find('.timsChatInnerMessage time');
				
				if (bcplus.getOptionValue('UIOptimizeTimeBeforeName', false) && (bcplus.messageNodeType.ALTERNATIVE === messageNodeEvent.messageNodeType)) {
					$timeNode.addClass('timeLeft').detach().prependTo($messageNode.find('.timsChatInnerMessage'));
				}
			}
			
			$timeNode.text('[' + $timeNode.text().trim() + ']');
			
			if ((bcplus.messageNodeType.BUBBLEFOLLOWUP !== messageNodeEvent.messageNodeType) && ((messageNodeEvent.messageType < bcplus.messageType.MODERATE) || (messageNodeEvent.messageType === bcplus.messageType.WHISPER))) {
				$messageNode.find('.timsChatUsernameContainer').find('.icon.pointer').off('click').prop('onclick', null).removeClass('icon icon16 icon-double-angle-right').text('»');
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
		
		Window.document.addEventListener('copy', streamCopyListener, false);
		Window.document.addEventListener('keypress', streamSelectAllListener, false);
	};
	
	/**
	 * @param	{ClipboardEvent}	event
	 */
	var streamCopyListener = function(event) {
		if (!Window.getSelection().containsNode($('#timsChatMessageTabMenu').get(0), true)) {
			return;
		}

		/** @type {String} */    var text = '';
		/** @type {Selection} */ var selection = Window.getSelection();

		event.preventDefault();

		for (var i = 0, l = selection.rangeCount; i < l; ++i) {
			/** @type {Range} */ var range = selection.getRangeAt(i);
			var $start = $(range.startContainer);
			var $startMessageNode = $start.closest('.timsChatMessage');
			var $end = $(range.endContainer);
			var $endMessageNode = $end.closest('.timsChatMessage');
			var $ancestor = $(range.commonAncestorContainer);

			if (range.collapsed || ((0 === $ancestor.closest('.timsChatMessageContainer').length) && (0 === $ancestor.find('.timsChatMessageContainer').length))) {
				// range neither contains chat stream nor is contained within chat stream
				text += range.toString();
				continue;
			}

			if ($end.hasClass('timsChatMessageIcon') || ($end.hasClass('userAvatar') && ($end.find('.icon').length > 0))) {
				// problem when selection covers CSS generated pseudo elments in
				// font awesome icons; ignore end node and assume previous
				// message node as end node
				$endMessageNode = $($endMessageNode[0].previousElementSibling);
				$end = $endMessageNode;
			}

			if ($start.closest('.bcplusAwayMarker').length > 0) {
				// start is away marker, jump to next message
				$startMessageNode = $($end.closest('.bcplusAwayMarker')[0].nextElementSibling);
				$start = $startMessageNode;
			}

			if ($end.closest('.bcplusAwayMarker').length > 0) {
				// end is away marker, jump to previous message
				$endMessageNode = $($end.closest('.bcplusAwayMarker')[0].previousElementSibling);
				$end = $endMessageNode;
			}

			if (($startMessageNode.length > 0) && ($endMessageNode.length > 0)) {
				// start end end are both message nodes
				text += handleCopyStartMessageEndMessage(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor);
			}

			// TODO: handle when start and/or end aren't messages but messages are still selected
		}

		event.clipboardData.setData('text/plain', text.trim());
	};

	/**
	 * @param	{Selection}	selection
	 * @param	{Range}		range
	 * @param	{jQuery}	$start
	 * @param	{jQuery}	$startMessageNode
	 * @param	{jQuery}	$end
	 * @param	{jQuery}	$endMessageNode
	 * @param	{jQuery}	$ancestor
	 */
	var handleCopyStartMessageEndMessage = function(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor) {
		/** @type {String} */	var text = '';
		/** @type {Element} */	var currentMessageNode = $startMessageNode.get(0);
		/** @type {jQuery} */	var $currentMessageNode = $startMessageNode;

		// Set start of selection to the beginning of the first partly selected message
		if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			range.setStart($startMessageNode.find('time')[0].firstChild, 0);
		}
		else if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$startMessageNode.find('.timsChatText').each(function() {
				if (selection.containsNode(this, true)) {
					range.setStart(this.firstChild, 0);
					return false;
				}
			});
		}

		// Set end of selection to the end of the last partly selected message
		if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			range.setEnd($endMessageNode.find('.timsChatText')[0].firstChild, $endMessageNode.find('.timsChatText')[0].firstChild.nodeValue.length);
		}
		else if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$endMessageNode.find('.timsChatText').reverse().each(function() {
				if (selection.containsNode(this, true)) {
					range.setEnd($(this).find('time')[0].firstChild, $(this).find('time')[0].firstChild.nodeValue.length);
					return false;
				}
			});
		}

		do {
			if ($currentMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
				// current node is alt message, handle directly
				text += 
					$currentMessageNode.find('time').text().trim() + ' ' +
					$currentMessageNode.find('.timsChatUsernameContainer').text().trim() + ' ' + 
					$currentMessageNode.find('.timsChatTextContainer').text().trim() + "\n";
			}
			else if ($currentMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
				// current node is bubble, loop over messages in bubble
				// and find messages which are at least partly selected
				var username = $currentMessageNode.find('.timsChatUsernameContainer').text().trim() + ':';

				$currentMessageNode.find('.timsChatText').each(function() {
					if (selection.containsNode(this, true)) {
						var $this = $(this);
						
						text += 
							$this.find('time').text().trim() + ' ' + 
							username + ' ' + 
							$this.find('.bcplusBubbleMessageText').text().trim() + "\n";
					}
				});
			}

			if (currentMessageNode === $endMessageNode.get(0)) {
				// reached last message node in range, leave loop
				break;
			}

			currentMessageNode = currentMessageNode.nextElementSibling;
			$currentMessageNode = $(currentMessageNode);
		}
		while (!!currentMessageNode);

		return text;
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
