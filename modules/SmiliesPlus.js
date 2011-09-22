/* 
 * Smilies Plus Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.SmiliesPlus = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		API.addStyle('#smiliesList li { border: none !important; margin-left: 3px; margin-right: 3px; height: 30px; float: left; }');
		this.setStatus(API.Storage.getValue('smiliesActiveStatus', false));
		this.callerObj.buildBox('smilies', './wcf/images/smilies/smile.png', 'Smileys', function() {
			var smiliesListDiv = new API.w.Element('div', { id: 'smiliesList' });
			var smiliesUl = new API.w.Element('ul', { 'class': 'smileys' });
			
			$$('#smileyList ul > li').each(function(item) {
				smiliesUl.appendChild(item.cloneNode(true));
			});
			
			smiliesListDiv.appendChild(smiliesUl);
			
			return smiliesListDiv;
		});
		this.addListener();
	},
	
	addListener: function() {
		this.callerObj.registerMessagePrefilter('smiliesActive', 'Smileys', 'Darstellung von Smileys aktivieren', 'p', false, function(event, checked, nickname, message) {
			if (!checked) {
				this.replaceImageSmilies(message);
			}
		}, function(event, checked) {
			this.setStatus(checked);
			
			return true;
		}, this);
	},
	
	replaceImageSmilies: function(node) {
		var smilies = API.w.$A(node.querySelectorAll('img'));
		
		if (smilies.length > 0) {
			smilies.each(function(item) {
				node.replaceChild(document.createTextNode(item.getAttribute('alt')), item);
			});
		}
	},
	
	setStatus: function(state) {
		if (state) {
			if (!!$('enablesmilies')) $('enablesmilies').parentNode.removeChild($('enablesmilies'));
			$('chatForm').appendChild(new API.w.Element('input', { id: 'enablesmilies', name: 'enablesmilies', type: 'hidden', value: 'on' }));
		}
		else {
			if (!!$('enablesmilies')) $('enablesmilies').parentNode.removeChild($('enablesmilies'));
		}
	}
};
