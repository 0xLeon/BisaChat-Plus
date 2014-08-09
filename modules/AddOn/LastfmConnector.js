/*
 * Last.fm Connect Module
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on BisaChat Last.fm Connect
 */
Modules.AddOn.LastfmConnector = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.loadingTrack = false;
	},
	
	registerOptions: function() {
		this.callerObj.registerTextOption('lastfmUsername', 'last.fm Username', 'Not set yet');
	},
	
	buildUI: function() {
		var input = new Element('input', { id: 'nowPlayingButton', 'class': 'inputImage', type: 'image', alt: 'Gerade angehörten Song posten', title: 'Gerade angehörten Song posten', src: './wcf/icon/cronjobExecuteS.png' });
		
		input.addEventListener('click', function() {
			if (!this.loadingTrack) {
				this.getTrack();
				$('chatInput').focus();
			}
		}.bindAsEventListener(this), true);
		
		$$('#chatForm p')[0].insertBefore(input, $('chatLoading'));
	},
	
	finish: function() {
		this.callerObj.coreModuleInstances.get('CommandController').addCommand('np', function() {
			this.getTrack();
			
			throw new Error('abort');
		}.bind(this));
	},
	
	getTrackString: function(artist, title, trackURI, username) {
		return this.storage.getValue('formatString', 'np: $artist – $title').replace('$artist', artist).replace('$title', title).replace('$url', trackURI).replace('$profil', 'http://www.last.fm/user/'+encodeURIComponent(username));
	},
	
	getTrack: function() {
		$('nowPlayingButton').style.opacity = 0.3;
		$('nowPlayingButton').disabled = true;
		this.loadingTrack = true;
		
		if (this.storage.getValue('lastfmUsernameValue', undefined) === undefined) {
			this.callerObj.pushInfo('Error catching track! Username not set');
			$('nowPlayingButton').style.opacity = 1.0;
			$('nowPlayingButton').disabled = false;
			this.loadingTrack = false;
			return false;
		}
		
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+encodeURIComponent(this.storage.getValue('lastfmUsernameValue'))+'&limit=1&api_key=b02a99b9d7e6402de934c7ab59491171',
			headers: {
				'Accept': 'application/xml'
			},
			onload: function(response) {
				try {
					var xml = (new DOMParser()).parseFromString(response.responseText, 'application/xml')
					
					if (xml.documentElement.getAttribute('status') === 'ok') {
						if ((xml.querySelectorAll('track').length > 0) && (xml.querySelector('recenttracks > track:first-child').getAttribute('nowplaying') === 'true')) {
							var trackDOM = xml.querySelector('recenttracks > track:first-child');
							var artist = trackDOM.querySelector('artist').firstChild.nodeValue;
							var title = trackDOM.querySelector('name').firstChild.nodeValue;
							var trackURI = trackDOM.querySelector('url').firstChild.nodeValue;
							var username = xml.querySelector('recenttracks').getAttribute('user');
							
							this.callerObj.pushMessage(this.getTrackString(artist, title, trackURI, username));
						}
						else {
							throw new Error('No track playing');
						}
					}
					else if (xml.documentElement.getAttribute('status') === 'failed') {
						throw new Error(String(xml.querySelector('error').firstChild.nodeValue));
					}
					else {
						throw new Error('');
					}
				}
				catch (e) {
					this.callerObj.pushInfo('Error catching track! '+e.message);
				}
				finally {
					$('nowPlayingButton').style.opacity = 1.0;
					$('nowPlayingButton').disabled = false;
					this.loadingTrack = false;
				}
			}.bind(this),
			onerror: function() {
				this.callerObj.pushInfo('Error catching track! Connection failed');
				$('nowPlayingButton').style.opacity = 1.0;
				$('nowPlayingButton').disabled = false;
				this.loadingTrack = false;
			}.bind(this)
		});
	}
});
