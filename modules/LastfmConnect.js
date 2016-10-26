Modules.LastfmConnect = (function() {
	var bcplus = null;
	var apiKey = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		apiKey = Window.atob('NDk0Mjk2MzMxNzJlNzRkZWU2OGM3YTNlN2E2Zjc5N2U=');
		
		buildUI();
		addEventListeners();
	};
	
	var buildUI = function() {
		bcplus.addTextOption('lastfmUsername', 'last.fm Username', 'text', 'lastfmConnect', 'last.fm Connect', '');
	};
	
	var addEventListeners = function() {
		bcplus.addCommand(['nowplaying', 'np'], function() {
			var lastfmUsername = bcplus.getOptionValue('lastfmUsername', '');
			
			if ('' !== lastfmUsername) {
				$.ajax({
					url: 'https://ws.audioscrobbler.com/2.0/',
					dataType: 'json',
					data: {
						api_key: apiKey,
						format: 'json',
						method: 'user.getRecentTracks',
						user: lastfmUsername,
						limit: 1
					},
					success: function (data, textStatus, xqXHR) {
						if (data && data.recenttracks && data.recenttracks.track) {
							if (data.recenttracks.track[0] && data.recenttracks.track[0]['@attr'] && data.recenttracks.track[0]['@attr'].nowplaying && ('true' === data.recenttracks.track[0]['@attr'].nowplaying)) {
								var title = data.recenttracks.track[0].name;
								var album = data.recenttracks.track[0].album['#text'];
								var artist = data.recenttracks.track[0].artist['#text'];
								
								// TODO: dynamic string getting
								var message = 'np: ' + artist + ' – ' + title/* + ' (' + album + ')'*/;
								
								bcplus.sendMessage(message);
							}
							else {
								bcplus.showInfoMessage('Last.fm Connect: No track playing!');
							}
						}
						else if (data && data.error) {
							bcplus.showInfoMessage('Last.fm Connect: Error ' + data.error.toString() + ' - ' + data.message);
						}
						else {
							bcplus.showInfoMessage('Last.fm Connect: Invalid data received!');
						}
					},
					error: function (xqXHR, textStatus, errorThrown) {
						bcplus.showInfoMessage('Last.fm Connect: ' + textStatus + ' - ' + errorThrown);
					}
				});
			}
			else {
				bcplus.showInfoMessage('Last.fm Connect: Gib zuerst deinen last.fm-Benutzernamen ein.');
			}
		});
	};
	
	return {
		initialize:		initialize
	};
})();
