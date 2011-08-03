// ==UserScript==
// @name           BisaChat Plus Migration Tool
// @description    Get your old data for BC+ from bisafans.de to bisaboard.de
// @version        1.0.0
// @author         Stefan Hahn
// @copyright      2011, Stefan Hahn
// @licence        Simplified BSD License
// @namespace      http://projects.swallow-all-lies.com/greasemonkey/namsespaces/bisachat.plus.migration.tool
// @include        http://www.bisaboard.de/index.html?bcplusData=*
// @include        http://www.bisafans.de/
// ==/UserScript==
/*
 * Copyright (c) 2011, Stefan Hahn
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted 
 * provided that the following conditions are met:
 * 
 *   - Redistributions of source code must retain the above copyright notice, this list of conditions  and the 
 *     following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the 
 *     following disclaimer in the documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, 
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE 
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * BisaChat API
 * Copyright (c) 2011, Stefan Hahn
 */
var API = {
	Storage: {
		getValue: function(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(key) === null) {
				if (defaultValue !== undefined) this.setValue(key, defaultValue);
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
		
		unsetValue: function(key) {
			localStorage.removeItem(key);
		},
		
		clear: function() {
			localStorage.clear();
		},
		
		get length() {
			return localStorage.length;
		},
		
		key: function(n) {
			return localStorage.key(n);
		},
		
		importSettings: function(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = Object.keys(obj);
			
			this.clear();
			for (i = 0; i < keys.length; i++) {
				this.setValue(keys[i], obj[keys[i]]);
			}
		},
		
		exportSettings: function() {
			var obj = { };
			
			for (var i = 0; i < this.length; i++) {
				obj[this.key(i)] = this.getValue(this.key(i));
			}
			
			return obj;
		}
	},
	
	checkForUpdates: function(updateServer, version, callback, getNonStableReleases) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: updateServer+'?version='+encodeURIComponent(version)+'&getNonStableReleases='+((getNonStableReleases) ? '1' : '0'),
			headers: {
				'Accept': 'text/xml'
			},
			onload: function(response) {
				var xml = ((!response.responseXML) ? (new DOMParser()).parseFromString(response.responseText, 'text/xml') : response.responseXML);
				
				if (xml.documentElement.getAttribute('newVersion') === 'true') {
					callback(xml);
				}
			}
		});
	},
	
	get w() {
		return (unsafeWindow || window);
	},
	
	get inWidth() {
		return parseInt(window.innerWidth);
	},
	
	get inHeight() {
		return parseInt(window.innerHeight);
	}
};

if (API.w.location.host.toLowerCase() === 'www.bisafans.de') {
	var data = JSON.stringify(API.Storage.exportSettings());
	
	var iframe = document.createElement('iframe');
	
	iframe.setAttribute('src', 'http://www.bisaboard.de/index.html?bcplusData='+encodeURIComponent(data));
	iframe.setAttribute('width', '5');
	iframe.setAttribute('height', '5');
	iframe.setAttribute('scrolling', 'no');
	iframe.setAttribute('style', 'top:-9000px; left:-9000px;');
	
	document.getElementsByTagName('body')[0].appendChild(iframe);
}
else if (API.w.location.host.toLowerCase() === 'www.bisaboard.de') {
	if (API.w.location.search.indexOf('bcplusData') > -1) {
		var data = JSON.parse(decodeURIComponent(API.w.location.search.slice(API.w.location.search.indexOf('=')+1)));
		
		if (typeof API.Storage.getValue('statisticsOnlineTimeStart') === 'number') {
			if (API.Storage.getValue('statisticsOnlineTimeStart') > data['statisticsOnlineTimeStart']) {
				data['statisticsOnlineTimeLength'] += API.Storage.getValue('statisticsOnlineTimeLength');
				data['statisticsMessageCount'] += API.Storage.getValue('statisticsMessageCount');
			}
		}
		
		if (!API.Storage.getValue('bisafansDataImported', false)) {
			API.Storage.importSettings(data);
			API.Storage.setValue('bisafansDataImported', true);
			alert('Deine BisaChat Plus-Einstellungen wurden übernommen.'+"\n"+'Bitte deinstalliere das BisaChat Plus Migration Tool jetzt.');
		}
		else {
			alert('Deine BisaChat Plus-Einstellungen wurden bereits übernommen.'+"\n"+'Bitte deinstalliere das BisaChat Plus Migration Tool jetzt.');
		}
	}
}