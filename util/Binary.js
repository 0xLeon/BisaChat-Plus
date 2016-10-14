Util.Binary = (function() {
	var stringToArrayBuffer = function(str) {
		var fr = new FileReader();
		var blob = new Blob([str], {
			type: 'text/plain'
		});
		var prom = new Promise(function(resolve, reject) {
			fr.onload = function(e) {
				resolve(e.target.result);
			};
			fr.onerror = function(e) {
				reject(e);
			};
		});
		
		fr.readAsArrayBuffer(blob);
		
		return prom;
	};

	var arrayBufferToString = function(buf) {
		var fr = new FileReader();
		var blob = new Blob([buf], {
			type: 'application/octet-binary'
		});
		var prom = new Promise(function(resolve, reject) {
			fr.onload = function(e) {
				resolve(e.target.result);
			};
			fr.onerror = function(e) {
				reject(e);
			};
		});
		
		fr.readAsText(blob);
		
		return prom;
	};

	var base64ToArrayBuffer = function(str) {
		var url = 'data:text/plain;base64,' + str;
		var fr = new FileReader();
		var prom = new Promise(function(resolve, reject) {
			fr.onload = function(e) {
				resolve(e.target.result);
			};
			fr.onerror = function(e) {
				reject(e);
			};
		});
		
		window.fetch(url)
			.then(function(res) {
				return res.blob();
			})
			.then(function(blob) {
				fr.readAsArrayBuffer(blob);
			});
		
		return prom;
	};

	var arrayBufferToBase64 = function(buf) {
		var fr = new FileReader();
		var blob = new Blob([buf], {
			type: 'application/octet-binary'
		});
		var prom = new Promise(function(resolve, reject) {
			fr.onload = function(e) {
				var dataURL = e.target.result;
			
				resolve(dataURL.substr(dataURL.indexOf(',') + 1));
			};
			fr.onerror = function(e) {
				reject(e);
			};
		});
		
		fr.readAsDataURL(blob);
		
		return prom;
	};

	return {
		strToBuf:	stringToArrayBuffer,
		bufToStr:	arrayBufferToString,
		b64ToBuf:	base64ToArrayBuffer,
		bufToB64:	arrayBufferToBase64
	};
})();
