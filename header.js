// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        {version}
// @author         Stefan Hahn
// @copyright      2011-2015, Stefan Hahn
// @license        GNU General Public License, version 2
// @namespace      http://projects.0xleon.com/userscripts/bcplus
// @match          http://chat.bisaboard.de/index.php/Chat/*/*
// @match          https://chat.bisaboard.de/index.php/Chat/*/*
// @require        http://projects.0xleon.com/userscripts/bcplus/resources/scripts/waypoints.noframework.min.js
// @require        http://projects.0xleon.com/userscripts/bcplus/resources/scripts/waypoints.inview.min.js
// @grant          none
// @run-at         document-end
// ==/UserScript==

var browserWindow = null;

try {
	browserWindow = unsafeWindow;
}
catch (e) {
	browserWindow = window;
}

(function(Window, $, WCF) {
	'use strict';
	
	/*{util}*/
	
	try {
		/*{content}*/
	}
	catch (e) {
		console.log(e);
	}
})(browserWindow, browserWindow.jQuery, browserWindow.WCF);
