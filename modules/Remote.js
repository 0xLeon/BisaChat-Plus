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
				
				// TODO: move message sending to own BCPlus API function
				new WCF.Action.Proxy({
					autoSend: true,
					data: {
						actionName: 'send',
						className: 'chat\\data\\message\\MessageAction',
						parameters: {
							text: text,
							enableSmilies: $('#timsChatSmilies').data('status')
						}
					},
					showLoadingOverlay: false
				});
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
