Modules.UIOptimize = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.UIOptimize.initialize()');
		bcplus = _bcplus;
		
		addEventListeners();
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
