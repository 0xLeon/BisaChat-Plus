/* 
 * Highling Module
 * Copyright (c) 2011, Stefan Hahn
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
		this.addListener();
	},
	
	removeBasicHighlighting: function() {
		var basicHighlightingButton = API.w.$$('.smallButtons li')[1];
		API.w.chat.enableAnimating = false;
		
		basicHighlightingButton.style.overflow = 'hidden';
		new API.w.Effect.Morph(basicHighlightingButton, {
			style: {
				width: '0px'
			},
			afterFinish: function(effect) {
				effect.element.parentNode.removeChild(effect.element);
			}
		});
	},
	
	registerOption: function() {
		this.callerObj.registerBoolOption('blurHR', 'Horizontale Linie beim verlassen des Tabs', 'Horizontale Linie', 'r', false);
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
	
	addListener: function() {
		document.addEventListener('blur', function(event) {
			if (API.Storage.getValue('blurHRStatus', false)) {
				API.w.$$('#chatMessage'+API.w.chat.activeUserID+' ul hr').each(function(item) {
					item.parentNode.removeChild(item);
				});
				API.w.$$('#chatMessage'+API.w.chat.activeUserID+' ul')[0].appendChild((new API.w.Element('hr', { style: 'display:block; width:75%;' })));
			}
		}, false);
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
