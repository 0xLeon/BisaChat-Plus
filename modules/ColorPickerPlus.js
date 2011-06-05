/* 
 *  Color Picker Plus Module
 */
Modules.ColorPickerPlus = {
	callerObj: null,
	colorCache: '',
	executed: false,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		API.w.$('chatColorPickerContainer').addEventListener('DOMNodeInserted', function(event) {
			if (!this.executed) {
				this.replaceBasicColorPicker();
				this.addEventListeners();
				this.finish();
				
				this.executed = true;
			}
		}.bindAsEventListener(this), true);
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
		}.bindAsEventListener(this), true);
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
				API.w.Effect.Fade('chatColorPicker');
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