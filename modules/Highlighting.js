/* 
 * Highling Module
 */
Modules.Highlighting = {
	callerObj: null,
	docTitle: '',
	regExp: null,
	periodicalExecuter: null,
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
		this.callerObj.registerTextOption('highlightingText', 'Highlighten bei', API.w.settings['username'], function(optionValue) {
			this.buildRegExp(optionValue);
		}, this);
		this.callerObj.registerMessagePrefilter('highlighting', 'Highlighting', 'Highlighting aktivieren', 'l', false, function(event, checked, nickname, message) {
			if (checked && !document.hasFocus()) {
				if (this.regExp === null) {
					this.buildRegExp(API.Storage.getValue('highlightingTextValue', API.w.settings['username']));
				}
				
				if (this.regExp.test(message.innerHTML)) {
					this.highlight(event.target.getAttribute('id'), this.regExp.exec(message.innerHTML)[1]);
				}
			}
		}, null, this);
	},
	
	buildRegExp: function(basicString) {
		var regExpString = API.w.$A(basicString.split(',')).map(function(item) {
			return API.w.RegExp.escape(item.trim());
		}).join('|');
		this.regExp = null;
		this.regExp = new RegExp('\\b('+regExpString+')\\b', 'i');
	},
	
	highlight: function(id, matchedSubStr) {
		new Audio(Media.bing.dataURI).play();
		this.docTitle = document.title;
		this.periodicalExecuter = new API.w.PeriodicalExecuter(function() {
			if (document.title === this.docTitle) {
				document.title = 'Neue Nachricht enthält: '+matchedSubStr;
			}
			else {
				document.title = this.docTitle;
			}
		}.bind(this), 1.5);
		
		this.listenerFunctions[id] = function(event) {
			this.periodicalExecuter.stop();
			this.periodicalExecuter = null;
			document.title = this.docTitle;
			this.docTitle = '';
			new API.w.Effect.Highlight(id);
			document.removeEventListener('focus', this.listenerFunctions[id], false)
			delete this.listenerFunctions[id];
		}.bindAsEventListener(this);
		
		document.addEventListener('focus', this.listenerFunctions[id], false);
	}
};
