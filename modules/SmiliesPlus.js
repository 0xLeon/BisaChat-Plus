/* 
 * Smilies Plus Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.SmiliesPlus = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.callerObj.buildBox('smilies', './wcf/images/smilies/smile.png', 'Smileys', function() {
			var smiliesListDiv = new API.w.Element('div', { id: 'smiliesList' });
			var smiliesUl = new API.w.Element('ul', { 'class': 'smileys' });
			
			(API.w.$$('#smileyList ul > li')).each(function(item) {
				smiliesUl.appendChild(item.cloneNode(true));
			});
			
			smiliesListDiv.appendChild(smiliesUl);
			
			return smiliesListDiv;
		});
		this.addListener();
	},
	
	addListener: function() {
		this.callerObj.registerMessagePrefilter('enablesmilies', 'Smileys', 'Darstellung von Smileys aktivieren', 'p', false, function(event, checked, nickname, message) {
			if (!checked) {
				var smilies = API.w.$A(message.getElementsByTagName('img'));
				
				if (smilies.length > 0) {
					smilies.each(function(item) {
						message.replaceChild(document.createTextNode(String(item.getAttribute('alt'))), item);
					});
				}
			}
		});
	}
};
