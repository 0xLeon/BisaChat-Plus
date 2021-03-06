Modules.Selection = (function() {
	let bcplus = null;
	
	let faWhisperIcon = '';
	let multiWhitespaceRegex = /\s{2,}/g;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		faWhisperIcon = String.fromCodePoint(String.faUnicode('double-angle-right'));
		
		addEventListeners();
	};
	
	let addEventListeners = function() {
		Window.document.addEventListener('copy', streamCopyListener, false);
		Window.document.addEventListener('keypress', streamSelectAllListener, false);
	};
	
	/**
	 * @param	{ClipboardEvent}	event
	 */
	let streamCopyListener = function(event) {
		if (!Window.getSelection().containsNode($('#timsChatMessageTabMenu')[0], true)) {
			return;
		}
		
		/** @type {String} */    let text = '';
		/** @type {Selection} */ let selection = Window.getSelection();
		/** @type {Range[]} */   let additionalRanges = [];
		
		event.preventDefault();
		
		for (let i = 0, rangeCount = selection.rangeCount; i < rangeCount; ++i) {
			/** @type {Range} */ let range = selection.getRangeAt(i);
			let $start = $(range.startContainer);
			let $startMessageNode = $start.closest('.timsChatMessage');
			let $end = $(range.endContainer);
			let $endMessageNode = $end.closest('.timsChatMessage');
			let $ancestor = $(range.commonAncestorContainer);
			
			if (range.collapsed || ((0 === $ancestor.closest('.timsChatMessageContainer').length) && (0 === $ancestor.find('.timsChatMessageContainer').length))) {
				// range neither contains chat stream nor is contained within chat stream
				text += rangeToText(range, selection);
				continue;
			}
			
			if ((1 === rangeCount) && ((($startMessageNode.find('.altLayout').length > 0) && ($startMessageNode[0] === $endMessageNode[0])) || (($startMessageNode.find('.bubble')) && ($start.closest('.timsChatText')[0] === $end.closest('.timsChatText')[0])))) {
				// only one range which only covers parts of one message
				// don't handle through this stack, just stringify instead
				text += range.toString().trim().replace(faWhisperIcon, '»');
				break;
			}
			
			if ($end.hasClass('timsChatMessageIcon') || ($end.hasClass('userAvatar') && ($end.find('.icon').length > 0))) {
				// problem when selection covers CSS generated pseudo elments in
				// font awesome icons; ignore end node and assume previous
				// message node as end node
				$endMessageNode = $($endMessageNode[0].previousElementSibling);
				$end = $endMessageNode.lastLeaf();
			}
			
			if ($start.closest('.bcplusAwayMarker').length > 0) {
				// start is away marker, jump to next message
				$startMessageNode = $($end.closest('.bcplusAwayMarker')[0].nextElementSibling);
				$start = $startMessageNode.firstLeaf();
			}
			
			if ($end.closest('.bcplusAwayMarker').length > 0) {
				// end is away marker, jump to previous message
				$endMessageNode = $($end.closest('.bcplusAwayMarker')[0].previousElementSibling);
				$end = $endMessageNode.lastLeaf();
			}
			
			if (($startMessageNode.length > 0) && ($endMessageNode.length > 0)) {
				// both start end end are message nodes
				text += handleCopyStartMessageEndMessage(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor);
			}
			else if (($startMessageNode.length > 0) && (0 === $endMessageNode.length)) {
				// start is message node, but end isn't
				/** @type {Range} */ let remainingRange = document.createRange();
				
				remainingRange.setStartAfter($startMessageNode.closest('ul')[0]);
				remainingRange.setEnd(range.endContainer, range.endOffset);
				
				$endMessageNode = $startMessageNode.closest('ul').find('.timsChatMessage').last();
				$end = $endMessageNode.lastLeaf();
				range.setEnd($end[0], (Node.TEXT_NODE === $end[0].nodeType) ? $end[0].nodeValue.length : 0);
				$ancestor = $(range.commonAncestorContainer);
				
				remainingRange.uuid = String.generateUUID();
				additionalRanges.push(remainingRange);
				
				text += handleCopyStartMessageEndMessage(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor);
				text += '[' + remainingRange.uuid + ']';
			}
			else if (($endMessageNode.length > 0) && (0 === $startMessageNode.length)) {
				// start isn't message node, but end is
				/** @type {Range} */ let remainingRange = document.createRange();
				
				remainingRange.setStart(range.startContainer, range.startOffset);
				remainingRange.setEndBefore($endMessageNode.closest('ul')[0]);
				
				$startMessageNode = $endMessageNode.closest('ul').find('.timsChatMessage').first();
				$start = $startMessageNode.firstLeaf();
				range.setStart($start[0], 0);
				$ancestor = $(range.commonAncestorContainer);
				
				remainingRange.uuid = String.generateUUID();
				additionalRanges.push(remainingRange);
				
				text += '[' + remainingRange.uuid + ']';
				text += handleCopyStartMessageEndMessage(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor);
			}
		}
		
		additionalRanges.forEach(function(range) {
			selection.addRange(range);
			text.replace('[' + range.uuid + ']', rangeToText(range, selection));
		});
		
		event.clipboardData.setData('text/plain', text.trim().replace(multiWhitespaceRegex, ' '));
	};
	
	/**
	 * @param	{Selection}	selection
	 * @param	{Range}		range
	 * @param	{jQuery}	$start
	 * @param	{jQuery}	$startMessageNode
	 * @param	{jQuery}	$end
	 * @param	{jQuery}	$endMessageNode
	 * @param	{jQuery}	$ancestor
	 * @returns	{string}
	 */
	let handleCopyStartMessageEndMessage = function(selection, range, $start, $startMessageNode, $end, $endMessageNode, $ancestor) {
		/** @type {String} */	let text = '';
		/** @type {Element} */	let currentMessageNode = $startMessageNode[0];
		/** @type {jQuery} */	let $currentMessageNode = $startMessageNode;
		
		// Set start of selection to the beginning of the first partly selected message
		if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			range.setStart($startMessageNode.firstLeaf()[0], 0);
		}
		else if ($startMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$startMessageNode.find('.timsChatText').each(function() {
				if (selection.containsNode(this, true)) {
					range.setStart($(this).firstLeaf()[0], 0);
					return false;
				}
			});
		}
		
		// Set end of selection to the end of the last partly selected message
		if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('altLayout')) {
			/** @type {Node} */ let leaf = $endMessageNode.lastLeaf()[0];
			range.setEnd(leaf, (Node.TEXT_NODE === leaf.nodeType) ? leaf.nodeValue.length : 0);
		}
		else if ($endMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
			$endMessageNode.find('.timsChatText').reverse().each(function() {
				if (selection.containsNode(this, true)) {
					/** @type {Node} */ let leaf = $(this).lastLeaf()[0];
					range.setEnd(leaf, (Node.TEXT_NODE === leaf.nodeType) ? leaf.nodeValue.length : 0);
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
					elementToText($currentMessageNode.find('.timsChatTextContainer')[0].firstChild).trim() + '\x0A';
			}
			else if ($currentMessageNode.find('.timsChatInnerMessageContainer').hasClass('bubble')) {
				// current node is bubble, loop over messages in bubble
				// and find messages which are at least partly selected
				let username = $currentMessageNode.find('.timsChatUsernameContainer').text().trim().replace(faWhisperIcon, '»') + ':';
				
				$currentMessageNode.find('.timsChatText').each(function() {
					if (selection.containsNode(this, true)) {
						let $this = $(this);
						
						text += 
							$this.find('time').text().trim() + ' ' + 
							username + ' ' + 
							elementToText($this.find('.bcplusBubbleMessageText')[0].firstChild).trim() + '\x0A';
					}
				});
			}
			
			if (currentMessageNode === $endMessageNode[0]) {
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
	let elementToText = function(element) {
		let text = '';
		
		if (!element || ((0 === element.offsetWidth) && (0 === element.offsetHeight))) {
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
	
	/**
	 * @param	{Range}		range
	 * @param	{Selection}	selection
	 * @returns	{string}
	 */
	let rangeToText = function(range, selection) {
		/**
		 * @param	{Node}		node
		 */
		let traversTillStart = function(node) {
			while (!!node) {
				if (selection.containsNode(node, true)) {
					return node;
				}
				
				node = node.nextSibling;
			}
		};
		
		/**
		 * @param	{Element}	element
		 * @returns	{string}
		 */
		let traverseSubtree = function(element) {
			/** @type {string} */ let text = '';
			
			do {
				switch (element.nodeType) {
					case Node.ELEMENT_NODE:
						// TODO: check if offsets need to be checked here as well
						if (('img' === element.nodeName.toLowerCase()) && !!element.getAttribute('alt')) {
							text += element.getAttribute('alt');
						}
						else if ((0 !== element.offsetWidth) || (0 !== element.offsetHeight)) {
							text += traverseSubtree(element.firstChild);
						}
						break;
					case Node.TEXT_NODE:
						if (range.startContainer === element) {
							text += element.nodeValue.substr(range.startOffset);
						}
						else if (range.endContainer === element) {
							text += element.nodeValue.substr(0, range.endOffset);
						}
						else {
							text += element.nodeValue;
						}
						break;
				}
				
				element = element.nextSibling;
			}
			while (!!element && (selection.containsNode(element, true)));
			
			return text;
		};
		
		return traverseSubtree(traversTillStart(range.commonAncestorContainer.firstChild));
	};
	
	/**
	 * @param	{KeyboardEvent}		event
	 */
	let streamSelectAllListener = function(event) {
		if (event.ctrlKey && ('a' === event.key) && !(event.altKey || event.shiftKey || event.metaKey) && ('body' === Window.document.activeElement.nodeName.toLowerCase())) {
			event.preventDefault();
			
			// workaround for firefox bug: add list instead of actual node
			// because otherwise copy event wouldn't fire
			let $roomNode = $('.timsChatMessageContainer.active ul');
			let selection = Window.getSelection();
			let selectionRange = Window.document.createRange();
			
			selectionRange.selectNode($roomNode[0]);
			selection.removeAllRanges();
			selection.addRange(selectionRange);
		}
	};
	
	return {
		initialize:	initialize
	};
})();
