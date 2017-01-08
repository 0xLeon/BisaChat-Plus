Util.Binary = (function() {
	let stringToArrayBuffer = function(str) {
		let fr = new FileReader();
		let blob = new Blob([str], {
			type: 'text/plain'
		});
		let prom = new Promise(function(resolve, reject) {
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

	let arrayBufferToString = function(buf) {
		let fr = new FileReader();
		let blob = new Blob([buf], {
			type: 'application/octet-binary'
		});
		let prom = new Promise(function(resolve, reject) {
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

	let base64ToArrayBuffer = function(str) {
		let url = 'data:text/plain;base64,' + str;
		let fr = new FileReader();
		let prom = new Promise(function(resolve, reject) {
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

	let arrayBufferToBase64 = function(buf) {
		let fr = new FileReader();
		let blob = new Blob([buf], {
			type: 'application/octet-binary'
		});
		let prom = new Promise(function(resolve, reject) {
			fr.onload = function(e) {
				let dataURL = e.target.result;
			
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
