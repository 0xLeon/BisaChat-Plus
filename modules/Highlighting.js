/* 
 * 
 */
Modules.Highlighting = {
	callerObj: null,
	listenerFunctions: { },
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.removeBasicHighlighting();
		this.registerOption();
	},
	
	removeBasicHighlighting: function() {
		API.w.chat.enableAnimating = false;
		API.w.$$('.smallButtons li')[1].parentNode.removeChild(API.w.$$('.smallButtons li')[1]);
	},
	
	registerOption: function() {
		this.callerObj.registerTextOption('highlightingText', 'Highlighten bei', API.w.settings['username']);
		this.callerObj.registerMessagePrefilter('highlighting', 'Highlighting', 'Highlighting aktivieren', 'l', false, function(event, checked, nickname, message) {
			if (checked && !document.hasFocus()) {
				var regExpString = API.w.$A(API.Storage.getValue('highlightingTextValue', API.w.settings['username']).split(',')).map(function(item) {
					return API.w.RegExp.escape(item.trim());
				}).join('|');
				
				if ((new RegExp('\\b('+regExpString+')\\b', 'i')).test(message.innerHTML)) {
					this.highlight(event.target.getAttribute('id'));
				}
			}
		}, null, this);
	},
	
	highlight: function(id) {
		new Audio('data:'+Media.bing.mimeType+';base64,'+Media.bing.content).play();
		
		this.listenerFunctions[id] = function(event) {
			new API.w.Effect.Highlight(id);
			document.removeEventListener('focus', this.listenerFunctions[id], false)
			delete this.listenerFunctions[id];
		}.bindAsEventListener(this);
		
		document.addEventListener('focus', this.listenerFunctions[id], false);
	}
};
