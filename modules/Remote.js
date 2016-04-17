Modules.Remote = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		bcplus.addExternalCommand(['version', 'v'], 'BCPlus ' + bcplus.getVersion());
		bcplus.addExternalCommand(['browser', 'b'], (function() {
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
