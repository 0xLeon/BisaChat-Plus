Modules.Selection = (function() {
	var bcplus = null;
	
	var faWhisperIcon = '';
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		faWhisperIcon = String.fromCodePoint(String.faUnicode('double-angle-right'));
		
		addEventListeners();
	};
	
	var addEventListeners = function() {
		Window.document.addEventListener('copy', streamCopyListener, false);
		Window.document.addEventListener('keypress', streamSelectAllListener, false);
	};
	
	/**
	 * @param	{ClipboardEvent}	event
	 */
	var streamCopyListener = function(event) {
		if (!Window.getSelection().containsNode($('#timsChatMessageTabMenu').get(0), true)) {
			return;
		}
		
		/** @type {String} */    var text = '';
		/** @type {Selection} */ var selection = Window.getSelection();
		
		event.preventDefault();
		
		for (var i = 0, l = selection.rangeCount; i < l; ++i) {
			/** @type {Range} */ var range = selection.getRangeAt(i);
			var $start = $(range.startContainer);
			var $startMessageNode = $start.closest('.timsChatMessage');
			var $end = $(range.endContainer);
			var $endMessageNode = $end.closest('.timsChatMessage');
			var $ancestor = $(range.commonAncestorContainer);
			
			if (range.collapsed || ((0 === $ancestor.closest('.timsChatMessageContainer').length) && (0 === $ancestor.find('.timsChatMessageContainer').length))) {
				// range neither contains chat stream nor is contained within chat stream
				text += range.toString();
				continue;
			}
			
			if ($end.hasClass('timsChatMessageIcon') || ($end.hasClass('userAvatar') && ($end.find('.icon').length > 0))) {
				// problem when selection covers CSS generated pseudo elments in
				// font awesome icons; ignore end node and assume previous
				// message node as end node
				$endMessageNode = $($endMessageNode[0].previousElementSibling);
				$end = $endMessageNode;
			}
			
			if ($start.closest('.bcplusAwayMarker').length > 0) {
				// start is away marker, jump to next message
				$startMessageNode = $($end.closest('.bcplusAwayMarker')[0].nextElementSibling);
				$start = $startMessageNode;
			}
			
			if ($end.closest('.bcplusAwayMarker').length > 0) {
				// end is away marker, jump to previous message
				$endMessageNode = $($end.closest('.bcplusAwayMarker')[0].previousElementSibling);
				$end = $endMessageNode;
			}
			
			if (($startMessageNode.length > 0) && ($endMessageNode.length > 0)) {
				// start end end are both message nodes
				text += handleCopyStartMessageEndMessage(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor);
			}
			
			// TODO: handle when start and/or end aren't messages but messages are still selected
		}
		
		event.clipboardData.setData('text/plain', text.trim());
	};
	
	/**
	 * @param	{Selection}	selection
	 * @param	{Range}		range
	 * @param	{jQuery}	$start
	 * @param	{jQuery}	$startMessageNode
	 * @param	{jQuery}	$end
	 * @param	{jQuery}	$endMessageNode
	 * @param	{jQuery}	$ancestor
	 */
	var handleCopyStartMessageEndMessage = function(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor) {
		/** @type {String} */	var text = '';
		/** @type {Element} */	var currentMessageNode = $startMessageNode.get(0);
		/** @type {jQuery} */	var $currentMessageNode = $startMessageNode;
		
		// Set start of selection to the beginning of the first partly selected message
		if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			range.setStartBefore($startMessageNode[0]);
		}
		else if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$startMessageNode.find('.timsChatText').each(function() {
				if (selection.containsNode(this, true)) {
					range.setStartBefore(this);
					return false;
				}
			});
		}
		
		// Set end of selection to the end of the last partly selected message
		if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			range.setEndAfter($endMessageNode[0]);
		}
		else if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$endMessageNode.find('.timsChatText').reverse().each(function() {
				if (selection.containsNode(this, true)) {
					range.setEndAfter(this);
					return false;
				}
			});
		}
		
		do {
			if ($currentMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
				// current node is alt message, handle directly
				text += 
					$currentMessageNode.find('time').text().trim() + ' ' +
					$currentMessageNode.find('.timsChatUsernameContainer').text().trim().replace(faWhisperIcon, '»') + ' ' + 
					elementToText($currentMessageNode.find('.timsChatTextContainer')[0].firstChild).trim() + "\n";
			}
			else if ($currentMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
				// current node is bubble, loop over messages in bubble
				// and find messages which are at least partly selected
				var username = $currentMessageNode.find('.timsChatUsernameContainer').text().trim().replace(faWhisperIcon, '»') + ':';
				
				$currentMessageNode.find('.timsChatText').each(function() {
					if (selection.containsNode(this, true)) {
						var $this = $(this);
						
						text += 
							$this.find('time').text().trim() + ' ' + 
							username + ' ' + 
							elementToText($this.find('.bcplusBubbleMessageText')[0].firstChild).trim() + "\n";
					}
				});
			}
			
			if (currentMessageNode === $endMessageNode.get(0)) {
				// reached last message node in range, leave loop
				break;
			}
			
			currentMessageNode = currentMessageNode.nextElementSibling;
			$currentMessageNode = $(currentMessageNode);
		}
		while (!!currentMessageNode);
		
		return text;
	};
	
	/**
	 * @param	{Element}	element
	 * @returns	{string}
	 */
	var elementToText = function(element) {
		var text = '';
		
		if (!element) {
			return '';
		}
		
		do {
			switch (element.nodeType) {
				case Node.TEXT_NODE:
					text += element.nodeValue;
					break;
				case Node.ELEMENT_NODE:
					if (('img' === element.nodeName.toLowerCase()) && !!element.getAttribute('alt')) {
						text += element.getAttribute('alt');
					}
					else {
						text += elementToText(element.firstChild);
					}
					break;
			}
		}
		while (!!(element = element.nextSibling));
		
		return text;
	};
	
	var streamSelectAllListener = function(event) {
		if (event.ctrlKey && ('a' === event.key) && !(event.altKey || event.shiftKey || event.metaKey) && ('body' === Window.document.activeElement.nodeName.toLowerCase())) {
			event.preventDefault();
			
			// workaround for firefox bug: add list instead of actual node
			// because otherwise copy event wouldn't fire
			var $roomNode = $('.timsChatMessageContainer.active ul');
			var selection = Window.getSelection();
			var selectionRange = Window.document.createRange();
			
			selectionRange.selectNode($roomNode.get(0));
			selection.removeAllRanges();
			selection.addRange(selectionRange);
		}
	};
	
	return {
		initialize:	initialize
	};
})();
