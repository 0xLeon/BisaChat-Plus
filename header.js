// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        /*{version}*/
// @author         Stefan Hahn
// @copyright      2011-2017, Stefan Hahn
// @license        GNU General Public License, version 2
// @namespace      http://projects.0xleon.com/userscripts/bcplus
// @match          http://chat.bisaboard.de/*
// @match          https://chat.bisaboard.de/*
// @require        http://projects.0xleon.com/userscripts/bcplus/resources/scripts/waypoints.noframework.min.js
// @require        http://projects.0xleon.com/userscripts/bcplus/resources/scripts/waypoints.inview.min.js
// @grant          none
// @run-at         document-end
// ==/UserScript==

let browserWindow = null;

try {
	browserWindow = unsafeWindow;
}
catch (e) {
	browserWindow = window;
}

(function(Window, $, WCF) {
	'use strict';
	
	/*{functions}*/
	
	try {
		/*{content}*/
	}
	catch (e) {
		console.error(e);
	}
})(browserWindow, browserWindow.jQuery, browserWindow.WCF);
