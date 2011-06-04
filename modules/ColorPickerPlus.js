/* 
 *  Color Picker Plus Module
 */
Modules.ColorPickerPlus = {
	callerObj: null,
	colorCache: '',
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.removeBasicColorPicker();
		this.addEventListeners();
		this.finish();
	},
	
	removeBasicColorPicker: function() {
		API.w.chatColorPicker = null;
		API.w.$('chatColorPickerContainer').setAttribute('href', '');
	},
	
	addEventListeners: function() {
		API.w.$('chatColorPickerContainer').addEventListener('click', function(event) {
			if (API.w.$('chatColorPicker').style.display === 'none') {
				API.w.Effect.Appear('chatColorPicker');
			}
			else {
				API.w.Effect.Fade('chatColorPicker');
			}
			
			event.preventDefault();
			API.w.$('chatInput').focus();
		}, true);
	},
	
	finish: function() {
		API.w.chatColorPicker = this;
	},
	
	pick: function(color) {
		if (this.colorCache === '') {
			this.colorCache = color;
		}
		else {
			API.w.chat.insert('/color '+this.colorCache+' '+color, false, 0, 0, true);
			API.w.Effect.Fade('chatColorPicker');
			API.w.$('chatInput').focus();
			
			this.colorCache = '';
		}
	}
};