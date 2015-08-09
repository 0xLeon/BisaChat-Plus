Modules.Remote = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: add generic command handler
			if ((message.sender === 13391) && ((message.type === bcplus.messageType.NORMAL) || (message.type === bcplus.messageType.WHISPER)) && message.plainText.startsWith('!version')) {
				var text = 'BCPlus ' + bcplus.getVersion();
				var awayStatus = $.extend({}, bcplus.getAwayStatus());
				
				if (message.type === bcplus.messageType.WHISPER) {
					// TODO: dynamically get username
					text = '/whisper Leon, ' + text;
				}
				
				bcplus.sendMessage(text);
				
				if (awayStatus.isAway) {
					text = '/away';
					
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
