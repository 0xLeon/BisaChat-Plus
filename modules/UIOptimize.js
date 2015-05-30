Modules.UIOptimize = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.UIOptimize.initialize()');
		bcplus = _bcplus;
		
		addStyles();
		addEventListeners();
	};
	
	var addStyles = function() {
		console.log('Modules.UIOptimize.addStyles()')
		
		// TODO: re-display if there is content in chat topic
		$('<style type="text/css">#timsChatTopic { display: none !important; }</style>').appendTo('head');
	};

	var addEventListeners = function() {
		console.log('Modules.UIOptimize.addEventListeners()');
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 1);
		});
	};
	
	return {
		initialize:	initialize
	};
})();
