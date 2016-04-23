Modules.FancyMode = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		bcplus.addEventListener('messageSubmit', function() {
			if (bcplus.getOptionValue('fancyMode', false)) {
				bcplus.sendMessage('/color ' + getRandomColor() + ' ' + getRandomColor(), false);
			}
		});
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			if (bcplus.getOptionValue('fancyMode', false) && (messageNodeEvent.messageType === bcplus.messageType.INFO) && messageNodeEvent.messageText.startsWith('Die Farbe')) {
				messageNodeEvent.messageNode.addClass('invisible');
			}
		});
	};
	
	var getRandomColor = function() {
		return	'#' + 
			('00' + Math.floor(Math.random() * 256).toString(16)).slice(-2) + 
			('00' + Math.floor(Math.random() * 256).toString(16)).slice(-2) + 
			('00' + Math.floor(Math.random() * 256).toString(16)).slice(-2);
	};
	
	return {
		initialize:	initialize
	};
})();
