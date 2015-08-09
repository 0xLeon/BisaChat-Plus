Modules.Remote = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: add generic command handler
			if ((message.sender === 13391) && ((message.type === bcplus.messageType.NORMAL) || (message.type === bcplus.messageType.WHISPER))) {
				var awayStatus = $.extend({}, bcplus.getAwayStatus());
				var handledCommand = false;
				
				if (message.plainText.startsWith('!version')) {
					var text = 'BCPlus ' + bcplus.getVersion();
					
					if (message.type === bcplus.messageType.WHISPER) {
						// TODO: dynamically get username
						text = '/whisper ' + message.username + ', ' + text;
					}
					
					bcplus.sendMessage(text);
				}
				else if (message.plainText.startsWith('!browser')) {
					var text = ' ' + $.browser.version;
					
					if ($.browser.mozilla) {
						text = 'Mozilla Firefox' + text;
					}
					else if ($.browser.chrome) {
						text = 'Google Chrome' + text;
					}
					
					bcplus.sendMessage(text);
				}
				
				if (handledCommand && awayStatus.isAway) {
					var text = '/away';
					
					if (awayStatus.message !== '') {
						text += ' ' + awayStatus.message;
					}
					
					Window.setTimeout(function() {
						bcplus.sendMessage(text);
					}, 1000);
				}
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
