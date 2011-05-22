/*
 * Message Prefilter Module
 */
Modules.MessagePrefilters = {
	init: function(callerObj) {
		callerObj.registerMessagePrefilter('colorlessNicknames', 'Nicknamen farblos anzeigen', 'n', false, function(event, checked, nickname, message) {
			if (checked) {
				var nickname = event.target.getElementsByTagName('span')[1].getElementsByTagName('span');
				
				for (var i = 0; i < nickname.length; i++) {
					nickname[i].style.color = '';
				}
			}
		});
		
		callerObj.registerMessagePrefilter('hideMuschelMessages', 'Muschel-Nachrichten ausblenden', 'm', false, function(event, checked, nickname, message) {
			if ((checked) && (nickname.toLowerCase() == 'magische miesmuschel') && (String(message.firstChild.nodeValue)[0] != '[')) {
				event.target.parentNode.removeChild(event.target);
			}
		});
		
		callerObj.registerMessagePrefilter('greentext', 'Green text aktivieren', 'g', true, function(event, checked, nickname, message) {
			if ((checked) && (message.firstChild.nodeType == 3) && (String(message.firstChild.nodeValue)[0] == '>')) {
				message.style.color = '#792';
			}
		});
		
		callerObj.registerMessagePrefilter('background', 'Hintergrund aktivieren', 'h', true, function(event, checked, nickname, message) {
			if (checked) {
				event.target.className += ' container-' + ((Registry.getValue('messageNumber', 0) % 2) + 1);
				Registry.setValue('messageNumber', (Registry.getValue('messageNumber') + 1));
			}
		});
		
		callerObj.registerMessagePrefilter('kyon', 'Nachrichten kyonisieren', 'k', false, function(event, checked, nickname, message) {
			if (checked) {
				var node = message.firstChild;
				
				do {
					if (node.nodeType === 3) node.nodeValue = node.nodeValue.toUpperCase();
				} while (node = node.nextSibling);
			}
		});
	}
};
