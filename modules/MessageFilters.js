Modules.MessageFilters = (function(Window, $, WCF) {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.MessageFilters.initialize()');
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		console.log('Modules.MessageFilters.addEventListeners()');
		bcplus.addEventListener('messageAdded', function(messageNode) {
			var messageText = $.trim(messageNode.find('.timsChatText').text());
			
			if (messageText.startsWith('>')) {
				messageNode.find('.timsChatText').css({
					color: '#792'
				});
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
