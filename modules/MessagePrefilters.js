/*
 * Message Prefilter Module
 */
var MessagePrefilters = {
	init: function(caller) {
		caller.registerMessagePrefilter('colorlessNicknames', 'Nicknamen farblos anzeigen', 'n', false, function(event, checked, nickname, message) {
			if (checked) {
				var nickname = event.target.getElementsByTagName('span')[1].getElementsByTagName('span');
				
				for (var i = 0; i < nickname.length; i++) {
					nickname[i].style.color = '';
				}
			}
		});
		
		caller.registerMessagePrefilter('hideMuschelMessages', 'Muschel-Nachrichten ausblenden', 'm', false, function(event, checked, nickname, message) {
			if ((checked) && (nickname.toLowerCase() == 'magische miesmuschel') && (String(message.firstChild.nodeValue)[0] != '[')) {
				event.target.parentNode.removeChild(event.target);
			}
		});
		
		caller.registerMessagePrefilter('greentext', 'Green text aktivieren', 'g', true, function(event, checked, nickname, message) {
			if ((checked) && (message.firstChild.nodeType == 3) && (String(message.firstChild.nodeValue)[0] == '>')) {
				message.style.color = '#792';
			}
		});
		
		caller.registerMessagePrefilter('background', 'Hintergrund aktivieren', 'h', true, function(event, checked, nickname, message) {
			if (checked) {
				if (Registery.getValue('messageNumber') == null) Registery.setValue('messageNumber', 0);
				event.target.className = 'container-' + ((Registery.getValue('messageNumber') % 2) + 1);
				Registery.setValue('messageNumber', (Registery.getValue('messageNumber') + 1));
			}
		});
	}
};
