Modules.WhisperTools = (function() {
	var bcplus = null;
	var lastPrivateUser = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListener();
	};
	
	var addEventListener = function() {
		$('#timsChatInput').on('keydown', function(event) {
			if ((null !== lastPrivateUser) && (38 == event.which) && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				Window.be.bastelstu.Chat.insertText('/f ' + lastPrivateUser + ', ', {
					prepend: false,
					append: false,
					submit: false
				});
				
				return false;
			}
		});
		
		bcplus.addCommand(['f', 'whispher'], function(username) {
			if (arguments.length > 1) {
				lastPrivateUser = username;
			}
			
			return '/f ' + $.makeArray(arguments).join(', ');
		});
	};
	
	return {
		initialize:	initialize
	};
})();
