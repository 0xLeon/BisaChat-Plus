Modules.MessageFilters = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	var addStyles = function() {
		$('<style type="text/css">.timsChatMessage.noAvatar .timsChatAvatarContainer { display: none !important; width: 0px !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.noAvatar .timsChatInnerMessage { margin-left: 18px !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.noAvatar .bubble .timsChatInnerMessage::before, .timsChatMessage.noAvatar .bubble .timsChatInnerMessage::after { border-style: none !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.colorlessNickname .timsChatUsernameContainer span { color: inherit !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.messageHidden { display: none !important; visibility: hidden !important; }</style>').appendTo('head');
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('greentext', 'Greentext aktivieren', 'prefilters', 'Prefilter', true);
		bcplus.addBoolOption('smilies', 'Grafische Smileys aktivieren', 'prefilters', null, true);
		bcplus.addBoolOption('hideAvatar', 'Avatare ausblenden', 'prefilters', null, false);
		bcplus.addBoolOption('colorlessNickname', 'Benutzernamen farblos anzeigen', 'prefilters', null, false);
		bcplus.addBoolOption('hideLogin', 'Login- & Logout-Nachrichten ausblenden', 'prefilters', null, false);
		bcplus.addBoolOption('hideStatus', 'Statusnachrichten ausblenden', 'prefilters', null, false);
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			if (!bcplus.getStorage().getValue('smiliesOption', true)) {
				var $messageNodeObj = $('<div>' + message.formattedMessage + '</div>');
				
				if ($messageNodeObj.find('img').length > 0) {
					var formattedMessage = '';
					
					$messageNodeObj.contents().each(function() {
						if (this.nodeType === 3) {
							formattedMessage += this.nodeValue;
						}
						else if ((this.nodeType === 1) && (this.nodeName.toLowerCase() === 'img')) {
							formattedMessage += $(this).attr('alt');
						}
					});
					
					message.plainText = $('<div>' + formattedMessage + '</div>').text().trim();
					message.formattedMessage = formattedMessage;
				}
			}
		});
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			
			if (bcplus.getStorage().getValue('greentextOption', true)) {
				var $targetNode = null;
				var messageText = '';
				
				if (messageNodeEvent.messageNodeType === bcplus.messageNodeType.BUBBLEFOLLOWUP) {
					$targetNode = $messageNode;
					
					$targetNode.contents().each(function() {
						if (this.nodeType === 3) {
							messageText += this.nodeValue;
						}
					});
					messageText = messageText.trim();
				}
				else {
					$targetNode = $messageNode.find('.timsChatText');
					messageText = $targetNode.text().trim();
				}
				
				if (messageText.startsWith('>')) {
					$targetNode.css({
						color: '#792'
					});
				}
			}
			
			if (bcplus.getStorage().getValue('hideAvatarOption', false) && (messageNodeEvent.messageNodeType !== bcplus.messageNodeType.BUBBLEFOLLOWUP)) {
				$messageNode.addClass('noAvatar');
			}
			
			if (bcplus.getStorage().getValue('colorlessNicknameOption', false) && (messageNodeEvent.messageNodeType !== bcplus.messageNodeType.BUBBLEFOLLOWUP)) {
				$messageNode.addClass('colorlessNickname');
			}
			
			if (bcplus.getStorage().getValue('hideLoginOption', false) && ((messageNodeEvent.messageType === bcplus.messageType.JOIN) || (messageNodeEvent.messageType === bcplus.messageType.LEAVE))) {
				$messageNode.addClass('messageHidden');
			}
			
			if (bcplus.getStorage().getValue('hideStatusOption', false) && ((messageNodeEvent.messageType === bcplus.messageType.AWAY) || (messageNodeEvent.messageType === bcplus.messageType.BACK))) {
				$messageNode.addClass('messageHidden');
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
