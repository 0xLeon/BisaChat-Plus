(function(Window, $, WCF) {
	"use strict";
	
	var BisaChatPlus = (function() {
		var init = function() {
			var messageObserver = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
						var messageNode = $(mutation.addedNodes[i]);
						
						if (messageNode.hasClass('timsChatMessage')) {
							var messageText = $.trim(messageNode.find('.timsChatText').text());
							
							if (messageText.startsWith('>')) {
								messageNode.find('.timsChatText').css({
									color: '#792'
								});
							}
						}
					}
				});
			});
			var messageObserverConfig = {
				childList: true,
				attributes: false,
				characterData: false
			};
			var messageObserverTarget = $('#timsChatMessageContainer0 > ul');
			
			messageObserver.observe(messageObserverTarget[0], messageObserverConfig);
		};
		
		init();
		
		return {
			
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
