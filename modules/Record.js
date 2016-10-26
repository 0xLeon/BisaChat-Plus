Modules.Record = (function() {
	var bcplus = null;

	var recording = false;
	var currentSessionID = '';
	var sessions = {};

	var initialize = function(_bcplus) {
		bcplus = _bcplus;

		addEventListeners();
	};

	var addEventListeners = function() {
		bcplus.addCommand(['record', 'rec'], function() {
			if (recording) {
				stopRecording();
			}
			else {
				startRecording();
			}

			return null;
		});

		bcplus.addEventListener('messageAdded', function(messageNodeEvent) {
			if (recording && !!sessions[currentSessionID] && (sessions[currentSessionID] instanceof Array)) {
				sessions[currentSessionID].push(messageNodeEvent);
			}
		});
	};

	var startRecording = function() {
		if (recording) {
			bcplus.showInfoMessage('Already recording');
			return;
		}

		currentSessionID = String().generateUUID();
		sessions[currentSessionID] = [];
		recording = true;

		bcplus.showInfoMessage('Recording started');
		
		return currentSessionID;
	};

	var stopRecording = function() {
		if (!recording) {
			return;
		}

		currentSessionID = 0;
		recording = false;

		bcplus.showInfoMessage('Recording stopped');
	};

	var getRecordingSession = function(sessionID) {
		return sessions[sessionID];
	};

	return {
		initialize:		initialize,
		getRecordingSession:	getRecordingSession
	};
})();
