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
			autoTraditional();
			
			addRemoveFishButton();
			addRemoveSidebarButton();
			
			registerEventListeners();
		};
		
		var autoFullscreen = function() {
			Window.setTimeout(function() {
				$('#timsChatFullscreen').click();
			}, 100);
		};
		
		var autoTraditional = function() {
			Window.setTimeout(function() {
				$('#timsChatAltLayout').click();
			}, 100);
		};
		
		var addRemoveFishButton = function() {
			$('.buttonGroup').append('<li><a id="removeFishButton" class="button jsTooltip" title="Fisch entfernen"> <span>NoFish</span></a></li>');
		}
		
		var addRemoveSidebarButton = function() {
			$('.buttonGroup').append('<li><a id="removeSidebarButton" class="button timsChatToggle jsTooltip" title="Sidebar entfernen"> <span>Sidebar</span></a></li>');
		}
		
		var registerEventListeners = function() {
			$('#timsChatSmilies').on("click", function() {
				$('#smilies').toggle();
				$(window).resize();
			});
			
			$('#removeFishButton').on("click", function() {
				if($('#fish')){
					$('#fish').remove();
				}
			});
			
			$('#removeSidebarButton').on("click", function() {
				$('.sidebar').toggle();
				$(window).resize();
			});
		};
		
		init();
		
		return {
			
		};
	})();
})(unsafeWindow, unsafeWindow.jQuery);
