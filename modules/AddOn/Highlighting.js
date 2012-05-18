/* 
 * Highlighting Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.Highlighting = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initialize: function($super, callerObj) {
		this.removeBasicHighlighting();
		$super(callerObj);
	},
	
	removeBasicHighlighting: function() {
		var basicHighlightingButton = $$('#chatOptions .smallButtons > ul > li')[2];
		API.w.chat.enableAnimating = false;
		
		// TODO: remove button in a smooth way
		/*basicHighlightingButton.style.overflow = 'hidden';
		new API.w.Effect.Morph(basicHighlightingButton, {
			style: {
				width: '0px'
			},
			afterFinish: function(effect) {
				effect.element.parentNode.removeChild(effect.element);
			}
		});*/
		basicHighlightingButton.parentNode.removeChild(basicHighlightingButton);
	},
	
	initializeVariables: function() {
		this.docTitle = '';
		this.regExp = null;
		this.messageIDs = [];
		this.title = '';
		this.periodicalExecuter = null;
		this.listenerFunction = null;
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('blurHR', 'Horizontale Linie beim verlassen des Tabs', 'Horizontale Linie', 'r', false);
		this.callerObj.registerTextOption('highlightingText', 'Highlighten bei', API.w.settings.username, function(optionValue) {
			this.buildRegExp(optionValue);
		}, this);
		this.callerObj.registerBoolOption('highlighting', 'Highlighting', 'Highlighting aktivieren', 'l', false);
	},
	
	addListeners: function() {
		Event.register('messageAfterNodeSetup', function(event) {
			if (API.Storage.getValue('highlightingStatus', false) && (!document.hasFocus() || this.callerObj.isAway) && (event.usernameSimple.toLowerCase() !== 'chatbot')) {
				if (this.regExp === null) {
					this.buildRegExp(API.Storage.getValue('highlightingTextValue', API.w.settings.username));
				}
				
				if (this.regExp.test(event.text)) {
					this.title = 'Neue Nachricht enthält: '+this.regExp.exec(event.text)[1];
					this.highlight(event.id);
					
					if (!!this.callerObj.moduleInstances.get('MessageBox') && !!this.callerObj.moduleInstances.get('MessageBox').pushMessage && (event.type !== 7)) {
						this.callerObj.moduleInstances.get('MessageBox').pushMessage(event);
					}
				}
				else if (event.type === 7) {
					this.title = 'Du wurdest angeflüstert'
					this.highlight(event.id);
				}
			}
		}, this);
		document.addEventListener('blur', function(event) {
			if (API.Storage.getValue('blurHRStatus', false)) {
				$$('#chatMessage'+API.w.chat.activeUserID+' ul .blurHr').each(function(item) {
					item.parentNode.removeChild(item);
				});
				var line = (new Element('li', { 'class': 'blurHr' }));
				
				line.appendChild(new Element('hr', { style: 'display: block; width: 75%;' }));
				$$('#chatMessage'+API.w.chat.activeUserID+' ul')[0].appendChild(line);
			}
		}, false);
	},
	
	buildRegExp: function(basicString) {
		var regExpString = basicString.split(',').map(function(item) {
			return RegExp.escape(item.trim());
		}).join('|');
		this.regExp = null;
		this.regExp = new RegExp('\\b('+regExpString+')\\b', 'i');
	},
	
	highlight: function(id) {
		new Audio(Media.bing.dataURI).play();
		this.messageIDs.push('chatMessage'+id);
		
		if (this.periodicalExecuter === null) {
			this.docTitle = document.title;
			this.periodicalExecuter = new API.w.PeriodicalExecuter(function() {
				if (document.title === this.docTitle) {
					document.title = this.title;
				}
				else {
					document.title = this.docTitle;
				}
			}.bind(this), 1.5);
		}
		if (this.listenerFunction === null) {
			if (this.callerObj.isAway) {
				this.listenerFunction = Event.register('awayStatusChange', function(event) {
					if (this.periodicalExecuter !== null) {
						this.periodicalExecuter.stop();
						this.periodicalExecuter = null;
					}
					
					document.title = this.docTitle;
					this.docTitle = '';
					
					this.messageIDs.each(function(item) {
						this.callerObj.coreModuleInstances.get('Animations').highlight(item);
					}, this);
					this.messageIDs.clear();
					
					Event.unregister('awayStatusChange', this.listenerFunction);
					this.listenerFunction = null;
				}, this);
			}
			else if (!document.hasFocus()) {
				this.listenerFunction = function(event) {
					if (this.periodicalExecuter !== null) {
						this.periodicalExecuter.stop();
						this.periodicalExecuter = null;
					}
					
					document.title = this.docTitle;
					this.docTitle = '';
					
					this.messageIDs.each(function(item) {
						this.callerObj.coreModuleInstances.get('Animations').highlight(item);
					}, this);
					this.messageIDs.clear();
					
					document.removeEventListener('focus', this.listenerFunction, false)
					this.listenerFunction = null;
				}.bindAsEventListener(this);
				
				document.addEventListener('focus', this.listenerFunction, false);
			}
		}
	}
});
