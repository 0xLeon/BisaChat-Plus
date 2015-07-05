Modules.MessageFilters = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.MessageFilters.initialize()');
		bcplus = _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	var addStyles = function() {
		console.log('Modules.MessageFilters.addStyles()');
		$('<style type="text/css">.timsChatMessage.noAvatar .timsChatAvatarContainer { display: none !important; width: 0px !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.noAvatar .timsChatInnerMessage { margin-left: 18px !important; }</style>').appendTo('head');
		$('<style type="text/css">.timsChatMessage.noAvatar .bubble .timsChatInnerMessage::before, .timsChatMessage.noAvatar .bubble .timsChatInnerMessage::after { border-style: none !important; }</style>').appendTo('head');
	};
	
	var buildUI = function() {
		console.log('Modules.MessageFilters.buildUI()');
		bcplus.addBoolOption('greentext', 'Greentext aktivieren', 'prefilters', 'Prefilter', true);
		bcplus.addBoolOption('hideAvatar', 'Avatare ausblenden', 'prefilters', null, false);
	};
	
	var addEventListeners = function() {
		console.log('Modules.MessageFilters.addEventListeners()');
		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			var $messageNode = messageNodeEvent.messageNode;
			
			if (bcplus.getStorage().getValue('greentextOption', true)) {
				var $targetNode = null;
				var messageText = '';
				
				if (messageNodeEvent.messageNodeType === bcplus.messageNodeType.BUBBLEFOLLOWUP) {
					$targetNode = $messageNode;
					
					$targetNode.contents().each(function() {
						if (this.nodeType === 3) {
							messageText += this.nodeValue;
						}
					});
					messageText = messageText.trim();
					
					console.log('TEST: ' + messageText);
				}
				else {
					$targetNode = $messageNode.find('.timsChatText');
					messageText = $targetNode.text().trim();
				}
				
				if (messageText.startsWith('>')) {
					$targetNode.css({
						color: '#792'
					});
				}
			}
			
			if (bcplus.getStorage().getValue('hideAvatarOption', false) && (messageNodeEvent.messageNodeType !== bcplus.messageNodeType.BUBBLEFOLLOWUP)) {
				$messageNode.addClass('noAvatar');
			}
		});
	};
	
	return {
		initialize:	initialize
	};
})();
