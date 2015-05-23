(function(Window, $, WCF) {
	"use strict";
	
	var BisaChatPlus = (function() {
		var init = function() {
			autoFullscreen();
		};
		
		var autoFullscreen = function() {
			Window.setTimeout(function() {
				$('#timsChatFullscreen').click();
			}, 100);
		};
		
		init();
		
		return {
			
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
