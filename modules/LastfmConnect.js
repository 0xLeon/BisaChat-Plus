Modules.LastfmConnect = (function() {
	let bcplus = null;
	let apiKey = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		apiKey = Window.atob('NDk0Mjk2MzMxNzJlNzRkZWU2OGM3YTNlN2E2Zjc5N2U=');
		
		buildUI();
		addEventListeners();
	};
	
	let buildUI = function() {
		bcplus.addTextOption('lastfmUsername', 'last.fm Username', 'text', 'lastfmConnect', 'last.fm Connect', '');
	};
	
	let addEventListeners = function() {
		bcplus.addCommand(['nowplaying', 'np'], function() {
			let lastfmUsername = bcplus.getOptionValue('lastfmUsername', '');
			
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
					success: function(data, textStatus, jqXHR) {
						if (data && data.recenttracks && data.recenttracks.track) {
							if (data.recenttracks.track[0] && data.recenttracks.track[0]['@attr'] && data.recenttracks.track[0]['@attr'].nowplaying && ('true' === data.recenttracks.track[0]['@attr'].nowplaying)) {
								let title = data.recenttracks.track[0].name;
								let album = data.recenttracks.track[0].album['#text'];
								let artist = data.recenttracks.track[0].artist['#text'];
								
								// TODO: dynamic string getting
								let message = '/me hört gerade: ' + artist + ' – ' + title/* + ' (' + album + ')'*/;
								
								bcplus.sendMessage(message);
							}
							else {
								bcplus.showInfoMessage('Last.fm Connect: Aktuell wird nichts gescrobelt.');
							}
						}
						else if (data && data.error) {
							bcplus.showInfoMessage('Last.fm Connect: Fehler - ' + data.error.toString() + ' - ' + data.message);
						}
						else {
							bcplus.showInfoMessage('Last.fm Connect: Ungültige Daten emfpangen.');
						}
					},
					error: function(xqXHR, textStatus, errorThrown) {
						bcplus.showInfoMessage('Last.fm Connect: Fehler - ' + textStatus + ' - ' + errorThrown);
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
