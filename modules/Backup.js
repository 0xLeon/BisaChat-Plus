/* 
 * Backup Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.Backup = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.backupSettings();
		API.w.setInterval(function() {
			this.backupSettings();
		}.bind(this), 60000);
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
				data: 'userID='+API.w.settings['userID']+'&settings='+encodeURIComponent(settings),
				onload: function(transport) {
					API.Storage.setValue('lastBackup', (new Date()).getTime());
					this.callerObj.pushInfo('Deine Einstellungen wurden erfolgreich gesichert.');
				}.bind(this)
			});
		}
	}
};
