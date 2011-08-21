/* 
 * Backup Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.Backup = {
	callerObj: null,
	intervalHandle: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerOptions();
		
		if (API.Storage.getValue('backupActiveStatus', true)) {
			this.backupSettings();
			this.intervalHandle = API.w.setInterval(function() {
				this.backupSettings();
			}.bind(this), 60000);
		}
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('backupActive', 'Backup', 'Backup aktivieren', 'c', true, function(event, checked) {
			if (checked) {
				if (this.intervalHandle !== null) {
					API.w.clearInterval(this.intervalHandle);
					this.intervalHandle = null;
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
			}
			
			return true;
		}, this);
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
	}
};
