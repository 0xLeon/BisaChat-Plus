/*
 * Message Prefilter Module
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.MessagePrefilters = new ClassSystem.Class(Modules.AbstractModule, {
	registerOptions: function() {
		this.callerObj.registerMessagePrefilter('colorlessNicknames', 'Farblose Nicknamen', 'Nicknamen farblos anzeigen', 'n', false, function(event, checked, nickname, message) {
			if (checked) {
				$A(event.target.querySelectorAll('span[onclick] > span')).each(function(item) {
					item.style.color = '';
				});
			}
		});
		
		this.callerObj.registerMessagePrefilter('greentext', 'Green text', 'Green text aktivieren', 'g', true, function(event, checked, nickname, message) {
			if ((checked) && (message.firstChild.nodeType === 3) && (message.firstChild.nodeValue[0] === '>')) {
				message.style.color = '#792';
			}
		});
		
		this.callerObj.registerMessagePrefilter('background', 'Wechselnde Hintergrundfarbe der Chatmessages', 'Hintergrund aktivieren', 'h', false, function(event, checked, nickname, message) {
			if (checked) {
				event.target.className = (event.target.className+' container-'+((Registry.getValue('messageNumber', 0) % 2) + 1)).trim();
				Registry.setValue('messageNumber', (Registry.getValue('messageNumber') + 1));
			}
		});
		
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message, messageType) {
			if (messageType === 10) {
				event.target.querySelector('span[onclick]').setAttribute('onclick', 'chat.insert(\'/team \', false)');
			}
		});
	}
});
