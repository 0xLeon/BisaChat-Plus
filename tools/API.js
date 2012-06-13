/**
 * BisaChat API
 * Provides useful functions for userscripts
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var API = (function() {
	/**
	 * Add style rules to document
	 * 
	 * @param	{String}	CSSString			Valid CSS style rules
	 * @returns	{undefined}					Returns nothing
	 */
	function addStyle(CSSString) {
		var styleNode = new Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		$$('head')[0].appendChild(styleNode);
	}
	
	return {
		addStyle:	addStyle,
		
		/**
		 * Unrestricted window object
		 * 
		 * @type	{Object}
		 */
		get w() {
			return (unsafeWindow || window);
		}
	};
})();
