/* 
 * Highling Module
 */
Modules.Highlighting = {
	callerObj: null,
	docTitle: '',
	regExp: null,
	messageIDs: API.w.$A([ ]),
	matchedSubstr: '',
	periodicalExecuter: null,
	listenerFunction: null,
	
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
		this.callerObj.registerTextOption('highlightingText', 'Highlighten bei', API.w.settings['username'], function(optionValue) {
			this.buildRegExp(optionValue);
		}, this);
		this.callerObj.registerMessagePrefilter('highlighting', 'Highlighting', 'Highlighting aktivieren', 'l', false, function(event, checked, nickname, message) {
			if (checked && !document.hasFocus()) {
				if (this.regExp === null) {
					this.buildRegExp(API.Storage.getValue('highlightingTextValue', API.w.settings['username']));
				}
				
				if (this.regExp.test(message.innerHTML)) {
					this.matchedSubstr = this.regExp.exec(message.innerHTML)[1];
					this.highlight(event.target.getAttribute('id'));
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
	
	highlight: function(id) {
		new Audio(Media.bing.dataURI).play();
		this.messageIDs.push(id);
		
		if (this.periodicalExecuter === null) {
			this.docTitle = document.title;
			this.periodicalExecuter = new API.w.PeriodicalExecuter(function() {
				if (document.title === this.docTitle) {
					document.title = 'Neue Nachricht enthält: '+this.matchedSubstr;
				}
				else {
					document.title = this.docTitle;
				}
			}.bind(this), 1.5);
		}
		
		if (this.listenerFunction === null) {
			this.listenerFunction = function(event) {
				if (this.periodicalExecuter !== null) {
					this.periodicalExecuter.stop();
					this.periodicalExecuter = null;
				}
				
				document.title = this.docTitle;
				this.docTitle = '';
				
				this.messageIDs.each(function(item) {
					new API.w.Effect.Highlight(item);
				});
				
				document.removeEventListener('focus', this.listenerFunction, false)
				this.listenerFunction = null;
			}.bindAsEventListener(this);
			
			document.addEventListener('focus', this.listenerFunction, false);
		}
	}
};
