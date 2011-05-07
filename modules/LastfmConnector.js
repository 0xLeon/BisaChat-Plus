/*
 * Last.fm Connect Module
 * Based on BisaChat Last.fm Connect
 */
var LastfmConnector = {
	track: null,
	loadingTrack: false,
	regularUpdaterHandle: null,
	caller: null,
	
	init: function(caller) {
		this.caller = caller;
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
		this.caller.registerTextOption('lastfmUsername', 'last.fm Username', 'Not set yet');
	},
	
	getTrackString: function() {
		var trackString = (((API.getValue('formatString', 'np: $artist – $title').replace(/\$artist/gi, this.track[0])).replace(/\$title/gi, this.track[1])).replace(/\$url/gi, this.track[2])).replace(/\$profil/gi, 'http://www.last.fm/user/'+encodeURIComponent(this.track[3]));
		
		if (API.checkAwayStatus()) {
		 	trackString = '/away '+trackString;
		}
		
		return trackString;
	},
	
	getTrack: function() {
		API.w.$('nowPlayingButton').style.opacity = 0.3;
		API.w.$('nowPlayingButton').disabled = true;
		this.loadingTrack = true;
		
		if (API.getValue('lastfmUsernameValue', undefined) === undefined) {
			this.track = 'Error catching track! Username not set';
			this.submitTrack();
			this.loadingTrack = false;
			return false;
		}
		
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+encodeURIComponent(API.getValue('lastfmUsernameValue'))+'&limit=1&api_key=b02a99b9d7e6402de934c7ab59491171',
			headers: {
				'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/Scriptish BisaChat Plus/'+this.caller.VERSION+' Last.fm Connect Module',
				'Accept': 'text/xml'
			},
			onload: function(response) {
				if (response.readyState == 4) {
					try {
						var xml = ((!response.responseXML) ? (new DOMParser()).parseFromString(response.responseText, 'text/xml') : response.responseXML);
						
						if (xml.documentElement.getAttribute('status') == 'ok') {
							if ((xml.getElementsByTagName('track').length > 0) && (xml.getElementsByTagName('track')[0].getAttribute('nowplaying'))) {
								var trackDOM = xml.getElementsByTagName('track')[0];
								var artist = trackDOM.getElementsByTagName('artist')[0].firstChild.nodeValue;
								var title = trackDOM.getElementsByTagName('name')[0].firstChild.nodeValue;
								var trackURL = trackDOM.getElementsByTagName('url')[0].firstChild.nodeValue;
								var username = xml.getElementsByTagName('recenttracks')[0].getAttribute('user');
								
								this.track = new Array(artist, title, trackURL, username);
							}
							else {
								throw new Error('No track playing');
							}
						}
						else if (xml.documentElement.getAttribute('status') == 'failed') {
							throw new Error(String(xml.getElementsByTagName('error')[0].firstChild.nodeValue));
						}
						else {
							throw new Error('');
						}
					}
					catch (e) {
						this.track = 'Error catching track! '+e.message;
					}
					finally {
						this.submitTrack();
						this.loadingTrack = false;
					}
				}
			}.bindAsEventListener(this),
			onerror: function() {
				this.track = 'Error catching track! Connection failed';
				this.submitTrack();
				this.loadingTrack = false;
			}.bindAsEventListener(this)
		});
	},
	
	submitTrack: function() {
		if (typeof this.track == 'object') {
			GM_xmlhttpRequest({
				method: 'POST',
				url: './index.php?form=Chat',
				data: 'text='+encodeURIComponent(this.getTrackString())+'&ajax=1',
				headers: {
					'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/Scriptish BisaChat Plus/'+this.caller.VERSION+' Last.fm Connect Module',
					'Accept': '*/*',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			
			API.w.chat.getMessages();
		}
		else if (typeof this.track == 'string') {
			var now = new Date();
			var time = ((now.getHours() < 10) ? '0'+now.getHours() : now.getHours())+':'+((now.getMinutes() < 10) ? '0'+now.getMinutes() : now.getMinutes())+':'+((now.getSeconds() < 10) ? '0'+now.getSeconds() : now.getSeconds());
			
			var li = new API.w.Element('li', { 'class': 'messageType8 ownMessage' });
			var spanOne = new API.w.Element('span', { style: 'font-size:0.8em; font-weight:normal; font-style:normal;' });
			var spanTwo = new API.w.Element('span', { style: 'font-weight:bold;' });
			
			spanOne.appendChild(document.createTextNode('('+time+')'));
			spanTwo.appendChild(document.createTextNode('Information: '));
			
			li.appendChild(spanOne);
			li.appendChild(document.createTextNode(' '));
			li.appendChild(spanTwo);
			li.appendChild(document.createTextNode(this.track));
			
			API.w.$$('#chatMessage'+API.w.chat.activeUserID+' ul')[0].appendChild(li);
			API.w.$('chatMessage'+API.w.chat.activeUserID).scrollTop = API.w.$('chatMessage'+API.w.chat.activeUserID).scrollHeight;
		}
		
		API.w.$('nowPlayingButton').style.opacity = 1.0;
		API.w.$('nowPlayingButton').disabled = false;
	}
};
