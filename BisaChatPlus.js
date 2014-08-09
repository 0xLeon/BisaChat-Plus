// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        3.0.0dev
// @author         Stefan Hahn
// @copyright      2011-2014, Stefan Hahn
// @license        GNU General Public License, version 2
// @namespace      http://projects.swallow-all-lies.com/greasemonkey/namsespaces/bisachat.plus
// @include        http://www.bisaboard.de/chat/index.php/Chat/*/
// @include        https://www.bisaboard.de/chat/index.php/Chat/*/
// ==/UserScript==

(function(Window, $) {
	"use strict";
	
	var BisaChatPlus = (function() {
		var init = function() {
			autoFullscreen();
			
			registerEventListeners();
		};
		
		var autoFullscreen = function() {
			Window.setTimeout(function() {
				$('#timsChatFullscreen').click();
			}, 100);
		};
		
		var registerEventListeners = function() {
			$('#button active timsChatToggle jsTooltip').on("click", function(){
				$('#smilies').toggle();
			});
		}
		
		init();
		
		return {
			
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery);
