// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        {version}
// @author         Stefan Hahn
// @copyright      2011-2015, Stefan Hahn
// @license        GNU General Public License, version 2
// @namespace      http://projects.0xleon.com/userscripts/bcplus
// @match          http://chat.bisaboard.de/index.php/Chat/*/
// @match          https://chat.bisaboard.de/index.php/Chat/*/
// @require        http://projects.0xleon.de/userscripts/bcplus/resources/scripts/waypoints.noframework.min.js
// @require        http://projects.0xleon.de/userscripts/bcplus/resources/scripts/waypoints.inview.min.js
// @grant          unsafeWindow
// @run-at         document-end
// ==/UserScript==

(function(Window, $, WCF) {
	// TODO: use strict again
	
	/**
	 *  @see	http://stackoverflow.com/a/8809472
	 */
	// TODO: move elsewhere?
	String.generateUUID = function() {
		var d = new Date().getTime();
		
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			
			return ((c == 'x') ? r : (r & 0x3 | 0x8)).toString(16);
		});
	};
	
	RegExp.escapeRegExp = /[.?*+^$[\]\\(){}|-]/g;
	
	RegExp.escape = function(str) {
		return str.replace(RegExp.escapeRegExp, '\\$&');
	}
	
	try {
		/*{content}*/
	}
	catch (e) {
		console.log(e);
	}
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.WCF);
