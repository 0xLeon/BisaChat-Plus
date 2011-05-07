/*
 * BisaChat API
 */
var API = {
	getValue: function(name) {
		var type, value;
		
		if (localStorage.getItem(name) === null) {
			return ((typeof arguments[1] != 'undefined') ? arguments[1] : undefined);
		}
		
		value = localStorage.getItem(name);
		type = value[0];
		value = value.slice(1);
		switch (type) {
			case 'b':
				return (value === 'true');
			case 'n':
				return Number(value);
			default:
				return value;
		}
	},
	
	setValue: function(name, value) {
		value = (typeof value)[0] + value;
		return localStorage.setItem(name, value);
	},
	
	addStyle: function(CSSString) {
		var styleNode = new this.w.Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		this.w.$$('head')[0].appendChild(styleNode);
	},
	
	checkForUpdates: function(updateServer, caller, callback, getNonStableReleases) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: updateServer+'?version='+encodeURIComponent(caller.VERSION)+'&getNonStableReleases='+((getNonStableReleases) ? '1' : '0'),
			headers: {
				'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/Scriptish BisaChat Plus/'+caller.VERSION,
				'Accept': 'text/xml'
			},
			onload: function(response) {
				if (response.readyState == 4) {
					var xml = ((!response.responseXML) ? (new DOMParser()).parseFromString(response.responseText, 'text/xml') : response.responseXML);
					
					if (xml.documentElement.getAttribute('newVersion') == 'true') {
						callback(xml);
					}
				}
			}
		});
	},
	
	checkAwayStatus: function() {
		try {
			return !!this.w.$('chatUserListItem'+this.chatUserID).getAttribute('title');
		}
		catch (e) {
			return false;
		}
	},
	
	get w() {
		return (unsafeWindow || window);
	},
	
	get inWidth() {
		return parseInt(window.innerWidth);
	},
	
	get inHeight() {
		return parseInt(window.innerHeight);
	},
	
	get chatUserID() {
		return this.w.settings['userID'];
	}
};
