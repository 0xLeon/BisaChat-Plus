/*
 * BisaChat API
 */
var API = {
	Storage: {
		getValue: function(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(key) === null) {
				return defaultValue;
			}
			
			value = localStorage.getItem(key);
			type = value[0];
			value = value.slice(1);
			switch (type) {
				case 'b':
					return (value === 'true');
				case 'n':
					return Number(value);
				case 'o':
					return JSON.parse(value);
				default:
					return value;
			}
		},
		
		setValue: function(key, value) {
			value = (typeof value)[0] + ((typeof value === 'object') ? JSON.stringify(value) : value);
			return localStorage.setItem(key, value);
		},
		
		unsetValue: localStorage.removeItem,
		
		clear: localStorage.clear,
		
		get length() {
			return localStorage.length;
		},
		
		key: function(n) {
			return localStorage.key(n);
		}
	},
	
	addStyle: function(CSSString) {
		var styleNode = new this.w.Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		this.w.$$('head')[0].appendChild(styleNode);
	},
	
	checkForUpdates: function(updateServer, callerObj, callback, getNonStableReleases) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: updateServer+'?version='+encodeURIComponent(callerObj.VERSION)+'&getNonStableReleases='+((getNonStableReleases) ? '1' : '0'),
			headers: {
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
