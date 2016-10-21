(function() {
	var uuidUtilRegExp = /[xy]/g;
	var escapeRegExp = /[.?*+^$[\]\\(){}|-]/g;
	var htmlCleanRegExp = /\s{2,}/g;
	
	/**
	 *  @see	http://stackoverflow.com/a/8809472
	 */
	String.generateUUID = function() {
		var d = (new Date()).getTime();
		
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(uuidUtilRegExp, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			
			return ((c == 'x') ? r : (r & 0x3 | 0x8)).toString(16);
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
			if (3 !== this.nodeType) {
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
	
	if (!String.prototype.includes && !!String.prototype.contains) {
		String.prototype.includes = String.prototype.contains;
	}
})();
