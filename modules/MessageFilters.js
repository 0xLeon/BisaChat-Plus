Modules.MessageFilters = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('.timsChatMessage.noAvatar .timsChatAvatarContainer { display: none !important; width: 0px !important; }');
		bcplus.addStyle('.timsChatMessage.noAvatar .timsChatInnerMessage { margin-left: 18px !important; }');
		bcplus.addStyle('.timsChatMessage.noAvatar .bubble .timsChatInnerMessage::before, .timsChatMessage.noAvatar .bubble .timsChatInnerMessage::after { border-style: none !important; }');
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
			if (!bcplus.getOptionValue('smilies', true)) {
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
			
			if (bcplus.getOptionValue('colorlessNickname', false)) {
				message.formattedUsername = '<span>' + $('<p />').html(message.formattedUsername).text() + '</span>';
			}
		});
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			
			if (bcplus.getOptionValue('greentext', true)) {
				if (messageNodeEvent.messageText.startsWith('>')) {
					$messageNode.find('.timsChatText').css({
						color: '#792'
					});
				}
			}
			
			if (bcplus.getOptionValue('hideAvatar', false)) {
				$messageNode.addClass('noAvatar');
			}
			
			if (bcplus.getOptionValue('hideLogin', false) && ((messageNodeEvent.messageType === bcplus.messageType.JOIN) || (messageNodeEvent.messageType === bcplus.messageType.LEAVE))) {
				$messageNode.addClass('invisible');
			}
			
			if (bcplus.getOptionValue('hideStatus', false) && ((messageNodeEvent.messageType === bcplus.messageType.AWAY) || (messageNodeEvent.messageType === bcplus.messageType.BACK))) {
				$messageNode.addClass('invisible');
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
