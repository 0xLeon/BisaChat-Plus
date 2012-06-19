/* 
 * User Movin Plus Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.UserMovingPlus = new ClassSystem.Class(Modules.Util.AbstractModule, {
	addListeners: function() {
		if (!!this.callerObj.moduleInstances.get('RoomSelect') && !!this.callerObj.moduleInstances.get('RoomSelect').roomNamesToID) {
			Event.register('messageSent', function(event) {
				var parsedCommand = event.parameters.text.parseAsCommand();
				
				if (!!parsedCommand && (parsedCommand.command === 'move')) {
					try {
						var roomID = this.callerObj.moduleInstances.get('RoomSelect').roomNamesToID[parsedCommand.parameters[1].toLowerCase()];
						
						if (!Object.isUndefined(roomID)) {
							event.parameters.text = '/move ' + parsedCommand.parameters[0] + ', ' + roomID.toString();
						}
					}
					catch (e) { }
				}
			}, this);
		}
	}
});
