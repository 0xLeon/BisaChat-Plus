(function(Window, $, WCF) {
	"use strict";
	
	var BisaChatPlus = (function() {
		var bcplus = null;
		var storage = Storage.getInterface('bcplus');
		var event = {
			messageAdded: $.Callbacks(),
			messageSubmit: $.Callbacks(),
			optionsOpend: $.Callbacks(),
			optionsClosed: $.Callbacks()
		};
		var optionsDialog = $('<div id="bcplusOptionsDialogContent" class="container containerPadding"></div>').appendTo('body').wcfDialog({
			autoOpen: false,
			title: 'Optionen',
			
			onOpen: function() {
				event.optionsOpend.fire();
			},
			onClose: function() {
				event.optionsClosed.fire();
			}
		});
		
		var init = function() {
			console.log('BisachatPlus.init()');
			bcplus = {
				addEventListener:	addEventListener,
				addBoolOption:		addBoolOption
			};
			
			initEvents();
			buildUI();
			initModules();
		};
		
		var initEvents = function() {
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
			var messageObserverTarget = $('#timsChatMessageContainer0').find('ul');
			
			messageObserver.observe(messageObserverTarget[0], messageObserverConfig);
		};
		
		var buildUI = function() {
			var $optionsButton = $('<li><a id="bcplusOptions" class="button"><span class="icon icon16 icon-cog"></span><span class="invisible">BisaChat Plus Optionen</span></a></li>');
			$optionsButton.find('a').on('click', function() {
				optionsDialog.wcfDialog('open');
			});
			$optionsButton.appendTo('#timsChatOptions .buttonGroup');
		}
		
		var initModules = function() {
			console.log('BisachatPlus.initModules()');
			$.each(Modules, function(moduleName, moduleObject) {
				console.log(moduleName);
				moduleObject.initialize(bcplus);
			});
		};
		
		var addEventListener = function(eventName, callback) {
			console.log('BisachatPlus.addEventListener()');
			if (event[eventName] === null) {
				throw new Error('Unknown event »' + eventName + '«.');
			}
			
			event[eventName].add(callback);
		};
		
		var addBoolOption = function(optionID, optionText, categoryID, categoryName, defaultValue, onChange) {
			// TODO: check if ID is already used
			// TODO: get existing category
			var $category = $('<fieldset id="' + categoryID + '"><legend>' + categoryName + '</legend><dl></dl></fieldset>');
			var $option = $('<dt></dt><dd><label><input type="checkbox" id="' + optionID + '"/> ' + optionText + '</label></dd>');
			
			$option.find('input').prop({
				checked: !!defaultValue
			});
			$category.appendTo('#bcplusOptionsDialogContent').find('dl').append($option);
		};
		
		init();
		
		return {
			addEventListener:	addEventListener,
			addBoolOption:		addBoolOption
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
