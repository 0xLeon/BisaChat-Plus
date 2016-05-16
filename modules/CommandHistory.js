Modules.CommandHistory = (function() {
	var bcplus = null;
	var lastCommand = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListener();
	};
	
	var addEventListener = function() {
		$('#timsChatInput').on('keydown', function(event) {
			if ((null !== lastCommand) && (38 === event.which) && !(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)) {
				Window.be.bastelstu.Chat.insertText(lastCommand + ' ', {
					prepend: false,
					append: false,
					submit: false
				});
				
				return false;
			}
		});
		
		bcplus.addCommand(['f', 'whispher'], function(username) {
			if (arguments.length > 1) {
				pushCommand('/f ' + username + ',');
			}
			
			return '/f ' + $.makeArray(arguments).join(', ');
		});
	};
	
	var pushCommand = function(entry) {
		lastCommand = entry;
	};
	
	return {
		initialize:	initialize,
		pushCommand:	pushCommand
	};
})();
