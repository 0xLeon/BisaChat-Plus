/* 
 * Highling Module
 */
Modules.Highlighting = {
	callerObj: null,
	docTitle: '',
	listenerFunctions: { },
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.removeBasicHighlighting();
		this.registerOption();
	},
	
	removeBasicHighlighting: function() {
		window.setTimeout(function() {
			if (typeof API.w.chat === 'object') API.w.chat.enableAnimating = false;
		}, 2000);
		API.w.$$('.smallButtons li')[1].parentNode.removeChild(API.w.$$('.smallButtons li')[1]);
	},
	
	registerOption: function() {
		this.callerObj.registerTextOption('highlightingText', 'Highlighten bei', API.w.settings['username']);
		this.callerObj.registerMessagePrefilter('highlighting', 'Highlighting', 'Highlighting aktivieren', 'l', false, function(event, checked, nickname, message) {
			if (checked && !document.hasFocus()) {
				var regExpString = API.w.$A(API.Storage.getValue('highlightingTextValue', API.w.settings['username']).split(',')).map(function(item) {
					return API.w.RegExp.escape(item.trim());
				}).join('|');
				var regExp = new RegExp('\\b('+regExpString+')\\b', 'i');
				
				if (regExp.test(message.innerHTML)) {
					this.highlight(event.target.getAttribute('id'), regExp.exec(message.innerHTML)[1]);
				}
			}
		}, null, this);
	},
	
	highlight: function(id, matchedSubStr) {
		new Audio('data:'+Media.bing.mimeType+';base64,'+Media.bing.content).play();
		this.docTitle = document.title;
		document.title = 'Neue Nachricht enthält: '+matchedSubStr;
		
		this.listenerFunctions[id] = function(event) {
			document.title = this.docTitle;
			this.docTitle = '';
			new API.w.Effect.Highlight(id);
			document.removeEventListener('focus', this.listenerFunctions[id], false)
			delete this.listenerFunctions[id];
		}.bindAsEventListener(this);
		
		document.addEventListener('focus', this.listenerFunctions[id], false);
	}
};
