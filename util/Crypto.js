Util.Crypto = (function() {
	let keys = [];

	let generateKey = function(algorithm, extractable, usages) {
		return window.crypto.subtle.generateKey(algorithm, extractable, usages).then(
			function(keyPair) {
				let keyIDs = {};

				if (keyPair instanceof CryptoKeyPair) {
					keyIDs.private = (keys.push(keyPair.privateKey) - 1);
					keyIDs.public = (keys.push(keyPair.publicKey) - 1);
				}
				else if (keyPair instanceof CryptoKey) {
					keyIDs = (keys.push(keyPair) - 1);
				}

				return keyIDs;
			},
			function(reason) {
				console.error(new Error(reason));
			}
		);
	};

	let loadKey = function(format, keyData, algorithm, extractable, usages) {
		return window.crypto.subtle.importKey(format, keyData, algorithm, extractable, usages).then(
			function(cryptoKey) {
				return (keys.push(cryptoKey) - 1);
			},
			function(reason) {
				console.error(new Error(reason));
			}
		);
	};

	let unloadKey = function(keyID) {
		return new Promise(function(resolve, reject) {
			let key = keys[keyID];

			if (!!key) {
				delete keys[keyID];
				resolve(key);
			}
			else {
				console.error(new Error('Invalid keyID given'));
				reject();
			}
		});
	};

	let getKey = function(keyID) {
		return new Promise(function(resolve, reject) {
			let key = keys[keyID];

			if (!!key) {
				resolve(key);
			}
			else {
				console.error(new Error('Invalid keyID given'));
				reject();
			}
		});
	};

	let sign = function(keyID, data) {
		let signedObject = {
			data: JSON.stringify(data),
			signature: ''
		};

		if (!keys[keyID]) {
			throw new Error('Invalid keyID given');
		}

		return Util.Binary.strToBuf(signedObject.data)
			.then(function(buf) {
				return window.crypto.subtle.sign(keys[keyID].algorithm, keys[keyID], buf);
			})
			.then(function(signature) {
				return Util.Binary.bufToB64(signature);
			})
			.then(function(str) {
				signedObject.signature = str;

				return signedObject;
			});
	};

	let verify = function(keyID, signedObject) {
		let dataBuffer = null;
		let signBuffer = null;

		if (!keys[keyID]) {
			throw new Error('Invalid keyID given');
		}

		return Util.Binary.strToBuf(signedObject.data)
			.then(function(buf) {
				return (dataBuffer = buf);
			})
			.then(function() {
				return Util.Binary.b64ToBuf(signedObject.signature);
			})
			.then(function(buf) {
				return (signBuffer = buf);
			})
			.then(function() {
				return window.crypto.subtle.verify(keys[keyID].algorithm, keys[keyID], signBuffer, dataBuffer);
			});
	};

	return {
		generateKey:	generateKey,
		loadKey:	loadKey,
		unloadKey:	unloadKey,
		getKey:		getKey,
		sign:		sign,
		verify:		verify
	};
})();
