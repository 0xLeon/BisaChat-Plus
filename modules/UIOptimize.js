Modules.UIOptimize = (function() {
	let bcplus = null;
	let hideAwayUsersStyle = null;
	let faWhisperIcon = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	let addStyles = function() {
		bcplus.addStyle('.dialogContent fieldset { display: block !important; }');
		bcplus.addStyle('.timsChatMessageContainer { padding-left: 15px !important; padding-right: 15px !important; }');
		bcplus.addStyle('.timsChatMessage time { font-weight: normal !important; }');
		bcplus.addStyle('.timsChatMessage .altLayout time.timeLeft { float: none !important; }');
		bcplus.addStyle('.timsChatMessage.timsChatMessage8 .timsChatTextContainer { position: relative; }');
		bcplus.addStyle('.timsChatMessage.timsChatMessage8 time:not(.timeLeft) { position: absolute; top: 0px; right: 0px;}');
		bcplus.addStyle('.timsChatMessage .timsChatMessageIcon { display: table; text-align: center; min-height: 100%; }');
		bcplus.addStyle('.timsChatMessage .timsChatMessageIcon .icon, .timsChatMessage .timsChatMessageIcon .icon::before { vertical-align: middle; }');
		bcplus.addStyle('.timsChatMessage .timsChatUsernameContainer .icon { -moz-user-select: text !important; display: inline !important; }');
		bcplus.addStyle('.timsChatMessage8 .timsChatUsernameContainer, .timsChatMessage7 .timsChatUsernameContainer, .timsChatMessage1 > .timsChatInnerMessageContainer, .timsChatMessage2 > .timsChatInnerMessageContainer, .timsChatMessage2 > .timsChatInnerMessageContainer, .timsChatMessage4 > .timsChatInnerMessageContainer, .timsChatMessage6 > .timsChatInnerMessageContainer { font-weight: bold !important; }');
		bcplus.addStyle('.bcplusAwayMarker hr { width: 80%; }');
		hideAwayUsersStyle = bcplus.addStyle('#timsChatUserList .away:not(.you) { display: none !important; visibility: hidden !important; }');
		
		if (!bcplus.getOptionValue('UIOptimizeHideAwayUsers', false)) {
			hideAwayUsersStyle.detach();
		}
	};
	
	let buildUI = function() {
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
		
		faWhisperIcon = String.fromCodePoint(String.faUnicode('double-angle-right'));
		
		$('#timsChatAltLayout').closest('li').detach().insertAfter($('#timsChatSmilies').closest('li'));
		
		$(Window).resize();
	};
	
	let addEventListeners = function() {
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
		
		(new MutationObserver(function(mutations) {
			$(Window).resize();
		})).observe($('#timsChatTopic')[0], {
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
			let $messageNode = messageNodeEvent.messageNode;
			let $timeNode = null;
			
			if (bcplus.messageNodeType.BUBBLEFOLLOWUP === messageNodeEvent.messageNodeType) {
				$timeNode = $messageNode.find('time');
			}
			else {
				$timeNode = $messageNode.find('.timsChatInnerMessage time').first();
				
				if (bcplus.getOptionValue('UIOptimizeTimeBeforeName', false) && (bcplus.messageNodeType.ALTERNATIVE === messageNodeEvent.messageNodeType)) {
					$timeNode.addClass('timeLeft').detach().prependTo($messageNode.find('.timsChatInnerMessage'));
				}
			}
			
			$timeNode.text('[' + $timeNode.text().trim() + ']');
			
			if ((bcplus.messageNodeType.BUBBLEFOLLOWUP !== messageNodeEvent.messageNodeType) && ((messageNodeEvent.messageType < bcplus.messageType.MODERATE) || (bcplus.messageType.WHISPER === messageNodeEvent.messageType))) {
				$messageNode.find('.timsChatUsernameContainer').find('.icon.pointer').off('click').attr('onclick', null).removeClass('icon-double-angle-right icon16').text(faWhisperIcon);
				$messageNode.find('.timsChatUsernameContainer').data('username', ((bcplus.messageType.WHISPER === messageNodeEvent.messageType) && messageNodeEvent.ownMessage) ? messageNodeEvent.receiverUsername : messageNodeEvent.senderUsername);
				$messageNode.find('.timsChatUsernameContainer').addClass('pointer').on('click', function() {
					Window.be.bastelstu.Chat.insertText('/whisper ' + $(this).data('username') + ', ', {
						prepend: false,
						append: false,
						submit: false
					});
				});
			}
			
			if (bcplus.getOptionValue('UIOptimizeHideExternalLinkConfirm', false)) {
				$messageNode.find('a.externalURL[onclick]').off('click').attr('onclick', null);
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
