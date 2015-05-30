Modules.ResizeChatWindow = (function () {
	var bcplus = null;

	var initialize = function(_bcplus) {
		console.log('Modules.ResizeChatWindow.initialize()');
		bcplus = _bcplus;

		addEventListeners();
	};

	var addEventListeners = function() {
		console.log('Modules.ResizeChatWindow.addEventListeners()');
		$('#timsChatSmilies').on('click', function() {
			Window.setTimeout(function() {
				$(Window).resize();
			}, 300);
		});
	};

	return {
		initialize:	initialize
	}
})();
