/* 
 * Extended RegExp functions
 * 
 * Taken from Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
Object.extend(RegExp, {
	escape: function(str) {
		return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}
});
