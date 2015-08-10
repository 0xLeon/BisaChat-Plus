Modules.Remote = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		bcplus.addExternalCommand('version', 'BCPlus ' + bcplus.getVersion());
		bcplus.addExternalCommand('browser', (function() {
			if ($.browser.mozilla) {
				return 'Mozilla Firefox ' + $.browser.version;
			}
			else if ($.browser.chrome) {
				return 'Google Chrome ' + $.browser.version;
			}
			else {
				return 'Unknown Browser';
			}
		})());
	};
	
	return {
		initialize:	initialize
	};
})();
