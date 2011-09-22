/* 
 * Backup Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.Backup = {
	callerObj: null,
	intervalHandle: null,
	buttonWidth: '',
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		API.addStyle('#backupSmallButton { overflow: hidden; }');
		this.registerOptions();
		this.buildOverlay();
		
		if (API.Storage.getValue('backupActiveStatus', true)) {
			this.backupSettings();
			this.intervalHandle = API.w.setInterval(function() {
				this.backupSettings();
			}.bind(this), 60000);
		}
		else {
			new API.w.Effect.Morph('backupSmallButton', {
				style: {
					width: '0px'
				},
				beforeSetup: function(effect) {
					this.buttonWidth = API.w.getComputedStyle(effect.element).getPropertyValue('width');
				}.bind(this),
				afterFinish: function(effect) {
					effect.element.style.display = 'none';
				}
			});
		}
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('backupActive', 'Backup', 'Backup aktivieren', 'c', true, function(event, checked) {
			if (checked) {
				if (this.intervalHandle !== null) {
					API.w.clearInterval(this.intervalHandle);
					this.intervalHandle = null;
				}
				
				if ($('backupSmallButton').style.display === 'none') {
					new API.w.Effect.Morph('backupSmallButton', {
						style: {
							width: this.buttonWidth
						},
						beforeSetup: function(effect) {
							effect.element.style.display = '';
						}
					});
				}
				
				this.backupSettings();
				this.intervalHandle = API.w.setInterval(function() {
					this.backupSettings();
				}.bind(this), 60000);
			}
			else {
				if (this.intervalHandle !== null) {
					API.w.clearInterval(this.intervalHandle);
					this.intervalHandle = null;
				}
				
				if ($('backupSmallButton').style.display !== 'none') {
					new API.w.Effect.Morph('backupSmallButton', {
						style: {
							width: '0px'
						},
						beforeSetup: function(effect) {
							this.buttonWidth = API.w.getComputedStyle(effect.element).getPropertyValue('width');
						}.bind(this),
						afterFinish: function(effect) {
							effect.element.style.display = 'none';
						}
					});
				}
			}
			
			return true;
		}, this);
	},
	
	buildOverlay: function() {
		this.callerObj.buildOverlay('backup', './wcf/icon/dbImportL.png', 'Backup', function(overlayContentNode) {
			this.overlayContentBuilder(overlayContentNode);
		}.bind(this),
		function() {
			this.overlayContentBuilder($$('#backup .overlayContent')[0]);
		}.bind(this));
	},
	
	backupSettings: function() {
		if (API.Storage.getValue('lastBackup', 0) + 86400000 < (new Date()).getTime()) {
			var settings = JSON.stringify(API.Storage.exportSettings());
			
			GM_xmlhttpRequest({
				method: 'POST',
				url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: 'userID='+this.callerObj.chatUserID+'&settings='+encodeURIComponent(settings),
				onload: function(transport) {
					API.Storage.setValue('lastBackup', (new Date()).getTime());
					this.callerObj.pushInfo('Deine Einstellungen wurden erfolgreich gesichert.');
				}.bind(this)
			});
		}
	},
	
	overlayContentBuilder: function(overlayContentNode) {
		if (typeof overlayContentNode !== 'object') throw new TypeError('overlayContentNode has to be of type object');
		
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/getBackup.php?action=getList&userID='+API.w.settings.userID,
			onload: function(transport) {
				var xml = ((!transport.responseXML) ? (new DOMParser()).parseFromString(transport.responseText, 'text/xml') : transport.responseXML);
				var node = null;
				
				if (xml.querySelectorAll('entry').length > 0) {
					node = new API.w.Element('div');
					
					API.w.$A(xml.querySelectorAll('entry')).each(function(item) {
						var p = new API.w.Element('p');
						var a = new API.w.Element('a', { href: 'javascript:;', title: 'Klicken zum einspielen der Datensicherung' });
						var input = new API.w.Element('input', { 'type': 'hidden', value: String(item.querySelector('index').firstChild.nodeValue) });
						var span = new API.w.Element('span');
						
						var backupTimeObj = new Date(Math.floor(Number(item.querySelector('timestamp').firstChild.nodeValue) * 1000));
						var backupTimeString = '';
						
						backupTimeString += backupTimeObj.getDate()+'. '+(['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][backupTimeObj.getMonth()])+' '+backupTimeObj.getFullYear()+', ';
						backupTimeString += ((backupTimeObj.getHours() < 10) ? '0' : '')+backupTimeObj.getHours()+':'+((backupTimeObj.getMinutes() < 10) ? '0' : '')+backupTimeObj.getMinutes()+' Uhr';
						
						a.addEventListener('click', function(event) {
							GM_xmlhttpRequest({
								method: 'GET',
								url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/getBackup.php?action=getData&userID='+API.w.settings.userID+'&index='+event.target.getElementsByTagName('input')[0].getAttribute('value'),
								headers: {
									'Accept': 'application/json'
								},
								onload: function(innerTransport) {
									API.Storage.importSettings(innerTransport.responseJSON);
									API.w.location.reload();
								}
							});
						}, true);
						
						span.appendChild(document.createTextNode('Datensicherung vom '+backupTimeString));
						span.appendChild(input);
						a.appendChild(span);
						p.appendChild(a);
						node.appendChild(p);
					});
				}
				else {
					node = new API.w.Element('p');
					
					node.appendChild(document.createTextNode('Keine Datensicherungsen auf dem Server vorhanden.'));
				}
				
				if (!!overlayContentNode.firstChild) {
					overlayContentNode.replaceChild(node, overlayContentNode.firstChild);
				}
				else {
					overlayContentNode.appendChild(node);
				}
			}
		});
		
		return null;
	}
};
