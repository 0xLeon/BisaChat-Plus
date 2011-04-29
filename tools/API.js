/*
 * BisaChat API 1.0.1
 */
var API = {
	get VERSION() {
		return '101';
	},
	
	getValue: function(name) {
		var type, value;
		if (!(value = localStorage.getItem(name))) {
			return arguments[1] || undefined;
		}
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
	
	saveUnemptyString: function(key, value) {
		if ((typeof key == 'string') && (value != '')) {
			return this.setValue(key, value);
		}
		else {
			return false;
		}
	},
	
	checkForUpdates: function(updateServer, caller, callback) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: updateServer+'?version='+caller.VERSION,
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
}