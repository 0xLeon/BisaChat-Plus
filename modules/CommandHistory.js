Modules.CommandHistory = (function() {
	let bcplus = null;
	let lastCommand = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListener();
	};
	
	let addEventListener = function() {
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
	
	let pushCommand = function(command) {
		lastCommand = command;
	};
	
	return {
		initialize:	initialize,
		pushCommand:	pushCommand
	};
})();
