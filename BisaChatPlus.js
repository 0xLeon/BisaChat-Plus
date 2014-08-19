// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat.
// @version        3.0.0dev
// @author         Stefan Hahn, Marvin Altemeier
// @copyright      2011-2014, Stefan Hahn
// @license        GNU General Public License, version 2
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
			$('.buttonGroup').append('<li><a id="removeFishButton" class="button jsTooltip" title="Fisch entfernen"> <span class="icon icon16 icon-lock"> <span class="invisible">Fisch einsperren</span></a></li>');
		}
		
		var addRemoveSidebarButton = function() {
			$('.buttonGroup').append('<li><a id="removeSidebarButton" class="button active timsChatToggle jsTooltip" title="Sidebar entfernen"> <span class="icon icon16 icon-chevron-left"> <span class="invisible">Sidebar entfernen</span></a></li>');
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
