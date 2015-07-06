(function() {
	var uuidUtilRegExp = /[xy]/g;
	var escapeRegExp = /[.?*+^$[\]\\(){}|-]/g;
	
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
})();
