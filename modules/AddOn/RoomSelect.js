/* 
 * Room Select Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.RoomSelect = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initialize: function($super, callerObj) {
		this.callerObj = callerObj;
		
		if (WEBKIT) {
			$super(callerObj);
		}
		else {
			new API.w.Ajax.Updater('chatRoomSelect', './index.php?page=ChatRefreshRoomList' + API.w.SID_ARG_2ND, {
				evalScripts: true
			});
		}
	},
	
	addStyleRules: function() {
		API.addStyle('#chatChangeRoom span:after { content: " "; }');
	},
	
	buildUI: function() {
		new API.w.Ajax.Request('./index.php?page=ChatRefreshRoomList' + API.w.SID_ARG_2ND, {
			onSuccess: function(response) {
				var text = response.responseText.trim().split("\n").map(function(line) {
					return line.trim();
				}).join('');
				
				var activeRoom = text.match(/<a.*?id="chatChangeRoom".*?>(.*?)<\/a>/)[1];
				var roomList = text.match(/<ul.*?>(.*?)<\/ul>/)[1];
				
				$('chatChangeRoom').innerHTML = activeRoom;
				$('chatChangeRoomMenu').innerHTML = '<ul>' + roomList + '</ul>';
				$('chatChangeRoom').querySelector('img').addEventListener('click', function(event) {
					this.buildUI();
					Event.stop(event);
				}.bindAsEventListener(this), true);
				$$('#chatChangeRoomMenu li > a').each(function(element) {
					element.addEventListener('click', function(event) {
						if (this.className.indexOf('active') == -1) {
							window.location.hash = this.className;
						}
					}, true);
				});
			}.bind(this)
		});
	}
});
