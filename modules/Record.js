Modules.Record = (function() {
	let bcplus = null;
	
	let recording = false;
	let currentSessionID = '';
	let sessions = {};
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addEventListeners();
	};
	
	let addEventListeners = function() {
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
	
	let startRecording = function() {
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
	
	let stopRecording = function() {
		if (!recording) {
			return;
		}
		
		currentSessionID = 0;
		recording = false;
		
		bcplus.showInfoMessage('Recording stopped');
	};
	
	let getRecordingSession = function(sessionID) {
		return sessions[sessionID];
	};
	
	return {
		initialize:		initialize,
		getRecordingSession:	getRecordingSession
	};
})();
