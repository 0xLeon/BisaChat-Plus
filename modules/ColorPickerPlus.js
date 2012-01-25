/* 
 * Color Picker Plus Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.ColorPickerPlus = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initialize: function($super, callerObj) {
		this.replaceBasicColorPicker();
		$super(callerObj);
	},
	
	initializeVariables: function() {
		this.colorCache = '';
	},
	
	replaceBasicColorPicker: function() {
		$$('#chatColorPickerContainer a')[0].setAttribute('href', 'javascript:;');
		
		$$('#chatColorPicker a').each(function(item) {
			item.setAttribute('href', 'javascript:;');
		});
		
		$$('#chatColorPicker li').each(function(item) {
			item.addEventListener('click', function(event) {
				this.pick.call(this, event.target.getAttribute('title'));
			}.bindAsEventListener(this), false);
		}, this);
	},
	
	addListeners: function() {
		$$('#chatColorPickerContainer > a')[0].addEventListener('click', function(event) {
			if ($('chatColorPicker').style.display === 'none') {
				new API.w.Effect.Appear('chatColorPicker');
			}
			else {
				new API.w.Effect.Fade('chatColorPicker');
			}
			
			$('chatInput').focus();
		}, true);
	},
	
	finish: function() {
		API.w.chatColorPicker = null;
		API.w.ChatColorPicker = null;
		$('chatColorPicker').style.left = '0px';
	},
	
	pick: function(color) {
		if (color !== 'transparent') {
			if (this.colorCache === '') {
				this.colorCache = color;
				this.callerObj.pushInfo('Erste Farbe '+this.colorCache+' ausgewählt. Wähle nun eine zweite Farbe.');
			}
			else {
				new API.w.Effect.Fade('chatColorPicker');
				$('chatInput').focus();
				this.callerObj.pushInfo('Zweite Farbe '+color+' ausgewählt.');
				this.callerObj.pushMessage('/color '+this.colorCache+' '+color);
				this.colorCache = '';
			}
		}
		else {
			new API.w.Effect.Fade('chatColorPicker');
			$('chatInput').focus();
			this.colorCache = '';
		}
	}
});
