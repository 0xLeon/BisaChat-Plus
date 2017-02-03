Modules.CommandHistory = (function() {
	let bcplus = null;
	let commandHistory = [];
	let currentIndex = -1;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListener();
	};
	
	let addEventListener = function() {
		$('#timsChatInput').on('keydown', function(event) {
			if ((commandHistory.length > 0) && (38 === event.which) && !(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)) {
				currentIndex = (currentIndex + 1) % commandHistory.length;
				
				Window.be.bastelstu.Chat.insertText(commandHistory[currentIndex] + ' ', {
					prepend: false,
					append: false,
					submit: false
				});
				
				return false;
			}
		});
		$('#timsChatForm').on('submit', function() {
			currentIndex = -1;
		});
		
		bcplus.addCommand(['f', 'whispher'], function(username) {
			if (arguments.length > 1) {
				pushCommand('/f ' + username + ',');
			}
			
			return '/f ' + $.makeArray(arguments).join(', ');
		});
	};
	
	let pushCommand = function(command) {
		if (commandHistory[0] === command) {
			return;
		}
		
		commandHistory.unshift(command);
		
		if ((commandHistory.length > 10)) {
			commandHistory.pop();
		}
		
		while ((commandHistory.length > 1) && (commandHistory[0] === commandHistory[commandHistory.length - 1])) {
			commandHistory.pop();
		}
	};
	
	return {
		initialize:	initialize,
		pushCommand:	pushCommand
	};
})();
