Modules.MessageFilters = (function() {
	let bcplus = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	let addStyles = function() {
		bcplus.addStyle('.timsChatMessage.noAvatar .timsChatAvatarContainer { display: none !important; width: 0px !important; }');
		bcplus.addStyle('.timsChatMessage.noAvatar .timsChatInnerMessage { margin-left: 18px !important; }');
		bcplus.addStyle('.timsChatMessage.noAvatar .bubble .timsChatInnerMessage::before, .timsChatMessage.noAvatar .bubble .timsChatInnerMessage::after { border-style: none !important; }');
	};
	
	let buildUI = function() {
		bcplus.addBoolOption('greentext', 'Greentext aktivieren', 'prefilters', 'Prefilter', true);
		bcplus.addBoolOption('smilies', 'Grafische Smileys aktivieren', 'prefilters', null, true);
		bcplus.addBoolOption('hideAvatar', 'Avatare ausblenden', 'prefilters', null, false);
		bcplus.addBoolOption('colorlessNickname', 'Benutzernamen farblos anzeigen', 'prefilters', null, false);
		bcplus.addBoolOption('hideLogin', 'Login- & Logout-Nachrichten ausblenden', 'prefilters', null, false);
		bcplus.addBoolOption('hideStatus', 'Statusnachrichten ausblenden', 'prefilters', null, false);
	};
	
	let addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			if (!bcplus.getOptionValue('smilies', true)) {
				let $messageNodeObj = $('<div />').html(message.formattedMessage);
				
				if ($messageNodeObj.find('img').length > 0) {
					let formattedMessage = '';
					
					$messageNodeObj.contents().each(function() {
						if (Node.TEXT_NODE === this.nodeType) {
							formattedMessage += this.nodeValue;
						}
						else if ((Node.ELEMENT_NODE === this.nodeType) && ('img' === this.nodeName.toLowerCase())) {
							formattedMessage += $(this).attr('alt');
						}
					});
					
					message.plainText = $('<div />').html(formattedMessage).text().trim();
					message.formattedMessage = formattedMessage;
				}
			}
			
			if (bcplus.getOptionValue('colorlessNickname', false)) {
				message.formattedUsername = '<span>' + $('<p />').html(message.formattedUsername).text() + '</span>';
			}
		});
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			let $messageNode = messageNodeEvent.messageNode;
			
			if (bcplus.getOptionValue('greentext', true) && messageNodeEvent.messageText.startsWith('>')) {
				let $targetNode = null;
				
				if (bcplus.messageNodeType.ALTERNATIVE === messageNodeEvent.messageNodeType) {
					$targetNode = $messageNode.find('.timsChatText');
				}
				else {
					$targetNode = $messageNode.find('.bcplusBubbleMessageText').first();
				}
				
				$targetNode.css({
					color: '#792'
				});
			}
			
			if (bcplus.getOptionValue('hideAvatar', false) && (bcplus.messageNodeType.BUBBLEFOLLOWUP !== messageNodeEvent.messageNodeType)) {
				$messageNode.addClass('noAvatar');
			}
			
			if (bcplus.getOptionValue('hideLogin', false) && ((bcplus.messageType.JOIN === messageNodeEvent.messageType) || (bcplus.messageType.LEAVE === messageNodeEvent.messageType))) {
				$messageNode.addClass('invisible');
			}
			
			if (bcplus.getOptionValue('hideStatus', false) && ((bcplus.messageType.AWAY === messageNodeEvent.messageType) || (bcplus.messageType.BACK === messageNodeEvent.messageType))) {
				$messageNode.addClass('invisible');
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
