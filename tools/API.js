/**
 * BisaChat API
 * Provides useful functions for userscripts
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var API = (function() {
	return {
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
