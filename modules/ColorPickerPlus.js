/* 
 * Color Picker Plus Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.ColorPickerPlus = {
	callerObj: null,
	colorCache: '',
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.replaceBasicColorPicker();
		this.addEventListeners();
		this.finish();
	},
	
	replaceBasicColorPicker: function() {
		API.w.$$('#chatColorPickerContainer a')[0].setAttribute('href', 'javascript:;');
		
		(API.w.$$('#chatColorPicker a')).each(function(item) {
			item.setAttribute('href', 'javascript:;');
		}, this);
		
		(API.w.$$('#chatColorPicker li')).each(function(item) {
			item.addEventListener('click', function(event) {
				this.pick.call(this, event.target.getAttribute('title'));
			}.bindAsEventListener(this), false);
		}, this);
	},
	
	addEventListeners: function() {
		API.w.$$('#chatColorPickerContainer > a')[0].addEventListener('click', function(event) {
			if (API.w.$('chatColorPicker').style.display === 'none') {
				new API.w.Effect.Appear('chatColorPicker');
			}
			else {
				new API.w.Effect.Fade('chatColorPicker');
			}
			
			API.w.$('chatInput').focus();
		}, true);
	},
	
	finish: function() {
		API.w.chatColorPicker = null;
		API.w.ChatColorPicker = null;
		API.w.$('chatColorPicker').style.left = '0px';
	},
	
	pick: function(color) {
		if (color !== 'transparent') {
			if (this.colorCache === '') {
				this.colorCache = color;
				this.callerObj.pushInfo('Erste Farbe '+this.colorCache+' ausgewählt. Wähle nun eine zweite Farbe.');
			}
			else {
				new API.w.Effect.Fade('chatColorPicker');
				API.w.$('chatInput').focus();
				this.callerObj.pushInfo('Zweite Farbe '+color+' ausgewählt.');
				this.callerObj.pushMessage('/color '+this.colorCache+' '+color);
				this.colorCache = '';
			}
		}
		else {
			new API.w.Effect.Fade('chatColorPicker');
			API.w.$('chatInput').focus();
		}
	}
};
