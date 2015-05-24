(function(Window, $, WCF) {
	"use strict";
	
	var BisaChatPlus = (function() {
		var bcplus = null;
		var event = {
			messageAdded: $.Callbacks(),
			messageSubmit: $.Callbacks()
		};
		
		var init = function() {
			bcplus = {
				addEventListener:	addEventListener
			};
			var messageObserver = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
						var messageNode = $(mutation.addedNodes[i]);
						
						if (messageNode.hasClass('timsChatMessage')) {
							event.messageAdded.fire(messageNode);
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
			
			
			initModules();
		};
		
		var initModules = function() {
			console.log('BisachatPlus.initModules()');
			$.each(Modules, function(moduleName, moduleObject) {
				console.log(moduleName);
				moduleObject.initialize(bcplus);
			});
		};
		
		var addEventListener = function(eventName, callback) {
			if (event[eventName] === null) {
				throw new Error('Unknown event »' + eventName + '«.');
			}
			
			event[eventName].add(callback);
		};
		
		init();
		
		return {
			addEventListener:	addEventListener
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
