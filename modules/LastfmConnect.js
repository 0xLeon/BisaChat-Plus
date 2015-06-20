Modules.LastfmConnect = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		console.log('Modules.LastfmConnect.initialize()');
		bcplus = _bcplus;
		
		buildUI();
		addEventListeners();
	};
	
	var buildUI = function() {
		console.log('Modules.LastfmConnect.buildUI()');
		bcplus.addTextOption('lastfmUsername', 'last.fm Username', 'text', 'lastfmConnect', 'last.fm Connect', '');
	};
	
	var addEventListeners = function() {
		console.log('Modules.LastfmConnect.addEventListeners()');
		// TODO: add generic command handler
		document.getElementById('timsChatInput').addEventListener('keydown', function(event) {
			if (event.keyCode !== 13) {
				return true;
			}
			
			var message = $('#timsChatInput').val();
			var lastfmUsername = bcplus.getStorage().getValue('lastfmUsernameOption', '');
			
			if ((message === 'np') && (lastfmUsername !== '')) {
				event.preventDefault();
				event.stopPropagation();
				
				$('#timsChatInput').val('');
				$.ajax({
					url: 'https://ws.audioscrobbler.com/2.0/',
					dataType: 'json',
					data: {
						api_key: 'b02a99b9d7e6402de934c7ab59491171',
						format: 'json',
						method: 'user.getRecentTracks',
						user: lastfmUsername,
						limit: 1
					},
					success: function (data, textStatus, xqXHR) {
						if (data && data.recenttracks && data.recenttracks.track && data.recenttracks.track[0] && data.recenttracks.track[0]['@attr'] && data.recenttracks.track[0]['@attr'].nowplaying && data.recenttracks.track[0]['@attr'].nowplaying == 'true') {
							var title = data.recenttracks.track[0].name;
							var album = data.recenttracks.track[0].album['#text'];
							var artist = data.recenttracks.track[0].artist['#text'];
							
							// TODO: dynamic string getting
							var message = 'np: ' + artist + ' – ' + title/* + ' (' + album + ')'*/;
							
							// TODO: move message sending to own BCPlus API function
							new WCF.Action.Proxy({
								autoSend: true,
								data: {
									actionName: 'send',
									className: 'chat\\data\\message\\MessageAction',
									parameters: {
										text: message,
										enableSmilies: $('#timsChatSmilies').data('status')
									}
								},
								showLoadingOverlay: false
							});
						}
					},
					error: function (xqXHR, textStatus, errorThrown) {
						console.error(textStatus, errorThrown);
					}
				});
				
				return false;
			}
		}, true);
		/*Window.be.bastelstu.Chat.listener.add('submit', function(message) {
			var lastfmUsername = bcplus.getStorage().getValue('lastfmUsernameOption', '');
			
			if ((message.text === 'np') && (lastfmUsername !== '')) {
				$.ajax({
					url: 'https://ws.audioscrobbler.com/2.0/',
					dataType: 'json',
					data: {
						api_key: 'b02a99b9d7e6402de934c7ab59491171',
						format: 'json',
						method: 'user.getRecentTracks',
						user: lastfmUsername,
						limit: 1
					},
					success: function (data, textStatus, xqXHR) {
						if (data && data.recenttracks && data.recenttracks.track && data.recenttracks.track[0] && data.recenttracks.track[0]['@attr'] && data.recenttracks.track[0]['@attr'].nowplaying && data.recenttracks.track[0]['@attr'].nowplaying == 'true') {
							title = data.recenttracks.track[0].name;
							album = data.recenttracks.track[0].album['#text'];
							artist = data.recenttracks.track[0].artist['#text'];
							
							// TODO: dynamic string getting
							message = 'np: ' + artist + ' – ' + title/* + ' (' + album + ')'*//*;
							
							$('#timsChatInput').val('');
							be.bastelstu.Chat.insertText(message, { submit: true });
						}
					},
					error: function (xqXHR, textStatus, errorThrown) {
						console.error(textStatus, errorThrown);
					}
				});
				
				throw new Error('Abort message');
			}
		});*/
	};
	
	return {
		initialize:		initialize
	};
})();
