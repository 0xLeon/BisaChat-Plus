/* 
 * Room Select Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.RoomSelect = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.roomNamesToID = {};
	},
	
	addStyleRules: function() {
		Style.addNode('#chatChangeRoom span:after { content: " "; }');
	},
	
	buildUI: function() {
		new Window.Ajax.Request('./index.php?page=ChatRefreshRoomList' + Window.SID_ARG_2ND, {
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
						if (this.parentNode.className.indexOf('active') == -1) {
							window.location.hash = this.className;
						}
					}, true);
					
					var match = element.className.match(/(?:\s|^)room(\d+)-(.*)/);
					this.roomNamesToID[match[2].toLowerCase()] = parseInt(match[1], 10);
				}, this);
			}.bind(this)
		});
	}
});
