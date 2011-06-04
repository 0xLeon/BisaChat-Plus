/*
 * Last.fm Connect Module
 * Based on BisaChat Last.fm Connect
 */
Modules.LastfmConnector = {
	loadingTrack: false,
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		this.showNowPlayingButton();
		this.registerOption();
	},
	
	showNowPlayingButton: function() {
		var input = new API.w.Element('input', { id: 'nowPlayingButton', 'class': 'inputImage', type: 'image', alt: 'Post now played track', title: 'Post now played track', src: './wcf/icon/cronjobExecuteS.png' });
		
		input.addEventListener('click', function() {
			if (!this.loadingTrack) {
				this.getTrack();
			}
		}.bindAsEventListener(this), true);
		
		API.w.$$('#chatForm p')[0].insertBefore(input, API.w.$('chatLoading'));
	},
	
	registerOption: function() {
		this.callerObj.registerTextOption('lastfmUsername', 'last.fm Username', 'Not set yet');
	},
	
	getTrackString: function(artist, title, trackURI, username) {
		return API.Storage.getValue('formatString', 'np: $artist – $title').replace(/\$artist/gi, artist).replace(/\$title/gi, title).replace(/\$url/gi, trackURI).replace(/\$profil/gi, 'http://www.last.fm/user/'+encodeURIComponent(username));
	},
	
	getTrack: function() {
		API.w.$('nowPlayingButton').style.opacity = 0.3;
		API.w.$('nowPlayingButton').disabled = true;
		this.loadingTrack = true;
		
		if (API.Storage.getValue('lastfmUsernameValue', undefined) === undefined) {
			this.callerObj.pushInfo('Error catching track! Username not set');
			API.w.$('nowPlayingButton').style.opacity = 1.0;
			API.w.$('nowPlayingButton').disabled = false;
			this.loadingTrack = false;
			return false;
		}
		
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+encodeURIComponent(API.Storage.getValue('lastfmUsernameValue'))+'&limit=1&api_key=b02a99b9d7e6402de934c7ab59491171',
			headers: {
				'Accept': 'text/xml'
			},
			onload: function(response) {
				if (response.readyState === 4) {
					try {
						var xml = ((!response.responseXML) ? (new DOMParser()).parseFromString(response.responseText, 'text/xml') : response.responseXML);
						
						if (xml.documentElement.getAttribute('status') === 'ok') {
							if ((xml.getElementsByTagName('track').length > 0) && (xml.getElementsByTagName('track')[0].getAttribute('nowplaying'))) {
								var trackDOM = xml.getElementsByTagName('track')[0];
								var artist = trackDOM.getElementsByTagName('artist')[0].firstChild.nodeValue;
								var title = trackDOM.getElementsByTagName('name')[0].firstChild.nodeValue;
								var trackURI = trackDOM.getElementsByTagName('url')[0].firstChild.nodeValue;
								var username = xml.getElementsByTagName('recenttracks')[0].getAttribute('user');
								
								this.submitTrack(this.getTrackString(artist, title, trackURI, username));
							}
							else {
								throw new Error('No track playing');
							}
						}
						else if (xml.documentElement.getAttribute('status') === 'failed') {
							throw new Error(String(xml.getElementsByTagName('error')[0].firstChild.nodeValue));
						}
						else {
							throw new Error('');
						}
					}
					catch (e) {
						this.callerObj.pushInfo('Error catching track! '+e.message);
					}
					finally {
						API.w.$('nowPlayingButton').style.opacity = 1.0;
						API.w.$('nowPlayingButton').disabled = false;
						this.loadingTrack = false;
					}
				}
			}.bindAsEventListener(this),
			onerror: function() {
				this.callerObj.pushInfo('Error catching track! Connection failed');
				API.w.$('nowPlayingButton').style.opacity = 1.0;
				API.w.$('nowPlayingButton').disabled = false;
				this.loadingTrack = false;
			}.bindAsEventListener(this)
		});
	},
	
	submitTrack: function(trackString) {
		GM_xmlhttpRequest({
			method: 'POST',
			url: './index.php?form=Chat',
			data: 'text='+encodeURIComponent(trackString)+'&ajax=1',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*'
			},
			onload: function(response) {
				if (response.readyState === 4) {
					API.w.chat.getMessages();
				}
			}
		});
	}
};
