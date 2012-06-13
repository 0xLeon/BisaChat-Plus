/*
 * Message Prefilter Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.MessagePrefilters = new ClassSystem.Class(Modules.Util.AbstractModule, {
	registerOptions: function() {
		this.callerObj.registerBoolOption('colorlessNicknames', 'Farblose Nicknamen', 'Nicknamen farblos anzeigen', 'n', false);
		this.callerObj.registerBoolOption('greentext', 'Green text', 'Green text aktivieren', 'g', true);
		this.callerObj.registerBoolOption('background', 'Wechselnde Hintergrundfarbe der Chatmessages', 'Hintergrund aktivieren', 'h', false);
	},
	
	addListeners: function() {
		Event.register('messageBeforeNodeSetup', function(event) {
			if (this.storage.getValue('backgroundStatus', false)) {
				event.classes.push('container-'+((Registry.getValue('messageBackgroundContainer', 0) % 2) + 1));
				Registry.setValue('messageBackgroundContainer', (Registry.getValue('messageBackgroundContainer') + 1));
			}
		}, this);
		Event.register('messageAfterNodeAppending', function(event) {
			if (this.storage.getValue('colorlessNicknamesStatus', false)) {
				$A(event.nodes.username.querySelectorAll('span')).each(function(item) {
					item.style.color = '';
				});
			}
			
			if (this.storage.getValue('greentextStatus', true) && (event.text !== '') && event.text.startsWith('&gt;')) {
				event.nodes.text.style.color = '#792';
			}
		}, this);
	}
});
