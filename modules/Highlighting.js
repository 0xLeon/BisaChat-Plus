Modules.Highlighting = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.Highlighting.initialize()');
		bcplus = _bcplus;
		
		// removeExisting();
		buildUI();
		addEventListeners();
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('bcplusHighlightingActive', 'Highlighting aktivieren', 'bcplusHighlighting', 'Highlighting', true);
		bcplus.addTextOption('bcplusHighlightingText', 'Highlighting bei', 'text', 'bcplusHighlighting', null, '');
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageAdded', function(message) {
			var messageText = $.trim(message.find('.timsChatText').text());
			console.log(message);
			if (messageText.indexOf('Leon') > -1) {
				
			}
		});
	};
	
	return {
		initialize:	initialize
	}
})();
