Modules.UIOptimize = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.UIOptimize.initialize()');
		bcplus = _bcplus;
		
		buildUI();
		addStyles();
		addEventListeners();
	};
	
	var addStyles = function() {
		console.log('Modules.UIOptimize.addStyles()')
		
		// TODO: re-display if there is content in chat topic
		$('<style type="text/css">#timsChatTopic { display: none !important; }</style>').appendTo('head');
	};
	
	var buildUI = function() {
		console.log('Modules.UIOptimize.buildUI()');
		bcplus.addBoolOption('bcplusUIOptimizeShowSeconds', 'Zeitstempel mit Sekundenangabe', 'bcplusUIOptimize', 'User Interface', false);
	};

	var addEventListeners = function() {
		console.log('Modules.UIOptimize.addEventListeners()');
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
		
		bcplus.addEventListener('messageAdded', function($messageNode) {
			var $timeNode = $messageNode.find('.timsChatInnerMessage time').detach();
			
			if (!bcplus.getStorage().getValue('bcplusUIOptimizeShowSecondsOption', false)) {
				$timeNode.text($timeNode.text().trim().slice(0, -3));
			}
			
			$timeNode.prependTo($messageNode.find('.timsChatInnerMessage'));
		});
	};
	
	return {
		initialize:	initialize
	};
})();
