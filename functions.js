(function() {
	let uuidUtilRegExp = /[xy]/g;
	let escapeRegExp = /[.?*+^$[\]\\(){}|-]/g;
	let htmlCleanRegExp = /\s{2,}/g;
	
	/**
	 *  @see	http://stackoverflow.com/a/8809472
	 */
	String.generateUUID = function() {
		let d = (new Date()).getTime();
		
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(uuidUtilRegExp, function(c) {
			let r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			
			return (('x' === c) ? r : (r & 0x3 | 0x8)).toString(16);
		});
	};
	
	/**
	 *  
	 */
	RegExp.escape = function(str) {
		return str.replace(escapeRegExp, '\\$&');
	};
	
	/**
	 * 
	 */
	$.fn.htmlClean = function() {
		this.contents().each(function() {
			if (Node.TEXT_NODE !== this.nodeType) {
				$(this).htmlClean();
			}
			else {
				this.textContent = this.textContent.replace(htmlCleanRegExp, ' ');
			}
		});
		
		return this;
	};
	
	/**
	 * @see		http://stackoverflow.com/a/5386150/1128707
	 */
	$.fn.reverse = Array.prototype.reverse;
	
	$.fn.firstLeaf = function() {
		return this.map(function(i, node) {
			/** @type {Node} */ let leaf = node;
		
			while (!!leaf.firstChild) {
				leaf = leaf.firstChild;
			}
			
			return leaf;
		});
	};

	$.fn.lastLeaf = function() {
		return this.map(function(i, node) {
			/** @type {Node} */ let leaf = node;
		
			while (!!leaf.lastChild) {
				leaf = leaf.lastChild;
			}
			
			return leaf;
		});
	};
	
	(function() {
		let clearRegex = /'|"/g;
		let faTestParent = $('<div id="fa-test-element" style="display: none; visibility: hidden;" />');
		let faTestElement = $('<span />');
		
		faTestParent.append(faTestElement);
		$('body').append(faTestParent);
		
		faTestElement = faTestElement[0];
		
		/**
		 * @param	{string}	name
		 * @returns	{number}
		 */
		function faUnicode(name) {
			faTestElement.className = 'icon icon-' + name;
			
			return Window.getComputedStyle(faTestElement, '::before' ).content.replace(clearRegex, '').codePointAt(0);
		}
		
		String.faUnicode = faUnicode;
	})();
	
	if (!String.prototype.includes && !!String.prototype.contains) {
		String.prototype.includes = String.prototype.contains;
	}
})();
