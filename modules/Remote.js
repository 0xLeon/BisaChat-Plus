Modules.Remote = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.Remote.initialize()');
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		console.log('Modules.Remote.addEventListeners()');
		bcplus.addEventListener('messageReceived', function(message) {
			// TODO: add generic command handler
			if ((message.sender === 13391) && ((message.type === bcplus.messageType.NORMAL) || (message.type === bcplus.messageType.WHISPER)) && message.plainText.startsWith('!version')) {
				var text = 'BCPlus ' + bcplus.getVersion();
				
				if (message.type === bcplus.messageType.WHISPER) {
					// TODO: dynamically get username
					text = '/whisper Leon, ' + text;
				}
				
				bcplus.sendMessage(text);
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
