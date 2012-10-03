/* 
 * Backup Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.Backup = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.transitionendUIFunction = null;
		this.intervalHandle = null;
		this.buttonWidth = '';
	},
	
	addStyleRules: function() {
		Style.addNode('#backupSmallButton, #backupDataList li { overflow: hidden !important; }');
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('backupActive', 'Backup', 'Backup aktivieren', 'c', true, function(event, checked) {
			if (checked) {
				if ($('backupSmallButton').style.display === 'none') {
					new Window.Effect.Morph('backupSmallButton', {
						style: {
							width: this.buttonWidth
						},
						beforeSetup: function(effect) {
							effect.element.style.display = '';
						}
					});
				}
				
				try {
					this.storage.setValue('backupActiveStatus', true);
					this.startTimer();
				}
				catch (e) {
					this.callerObj.pushInfo('Couldn\'t start backup timer. '+e.message);
				}
			}
			else {
				this.stopTimer();
				
				if ($('backupSmallButton').style.display !== 'none') {
					new Window.Effect.Morph('backupSmallButton', {
						style: {
							width: '0px'
						},
						beforeSetup: function(effect) {
							this.buttonWidth = Window.getComputedStyle(effect.element).getPropertyValue('width');
						}.bind(this),
						afterFinish: function(effect) {
							effect.element.style.display = 'none';
						}
					});
				}
			}
			
			return true;
		}, this);
	},
	
	buildUI: function() {
		this.callerObj.buildOverlay('backup', './wcf/icon/dbImportL.png', 'Backup', function(overlayContentNode) {
			Element.addClassName(overlayContentNode, 'transitionOpacity');
			this.overlayContentBuilder(overlayContentNode);
		},
		function() {
			this.overlayContentBuilder($$('#backup .overlayContent')[0]);
		}, this);
	},
	
	finish: function() {
		try {
			this.startTimer();
		}
		catch (e) {
			if (e.message === 'Backup inactive') {
				new Window.Effect.Morph('backupSmallButton', {
					style: {
						width: '0px'
					},
					beforeSetup: function(effect) {
						this.buttonWidth = Window.getComputedStyle(effect.element).getPropertyValue('width');
					}.bind(this),
					afterFinish: function(effect) {
						effect.element.style.display = 'none';
					}
				});
			}
			else {
				this.callerObj.pushInfo('Couldn\'t start backup timer. '+e.message);
			}
		}
		
		$$('#backup .overlayContent')[0].addEventListener(Animations.config.events.transition.end, function(event) {
			if (this.transitionendUIFunction !== null) {
				this.transitionendUIFunction(event.target);
				this.transitionendUIFunction = null;
			}
		}.bindAsEventListener(this), true);
	},
	
	backupSettings: function() {
		if (this.storage.getValue('lastBackup', 0) + 86400000 < (new Date()).getTime()) {
			var settings = this.storage.exportSettings();
			
			if (!!settings.backupUsername) delete settings.backupUsername;
			if (!!settings.backupPassword) delete settings.backupPassword;
			
			GM_xmlhttpRequest({
				method: 'POST',
				url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: 'action=saveData&username='+encodeURIComponent(this.storage.getValue('backupUsername'))+'&password='+encodeURIComponent(this.storage.getValue('backupPassword'))+'&settings='+encodeURIComponent(JSON.stringify(settings)),
				onload: function(transport) {
					if (transport.readyState === 4) {
						if ((transport.status >= 200) && (transport.status < 300)) {
							this.storage.setValue('lastBackup', (new Date()).getTime());
							this.callerObj.pushInfo('Deine Einstellungen wurden erfolgreich gesichert.');
						}
						else {
							this.callerObj.pushInfo('Fehler beim Sichern der Einstellungen.');
							this.callerObj.pushInfo(transport.status+' - '+transport.statusText);
							
							try {
								var xml = (new DOMParser()).parseFromString(transport.responseText, 'application/xml');
								
								if (!!xml.querySelector('error')) {
									this.callerObj.pushInfo(xml.querySelector('error > message').firstChild.nodeValue);
								}
							}
							catch (e) { }
						}
					}
				}.bind(this)
			});
		}
	},
	
	overlayContentBuilder: function(overlayContentNode) {
		if (typeof overlayContentNode !== 'object') throw new TypeError('overlayContentNode has to be of type object');
		
		
		if ((this.storage.getValue('backupUsername', '') !== '') && (this.storage.getValue('backupPassword', '') !== '')) {
			this.displayBackupData(overlayContentNode);
		}
		else {
			this.displayLoginForm(overlayContentNode);
		}
			
		return null;
	},
	
	startTimer: function() {
		if (this.storage.getValue('backupActiveStatus', true)) {
			if ((this.storage.getValue('backupUsername', '') !== '') && (this.storage.getValue('backupPassword') !== '')) {
				this.stopTimer();
				this.backupSettings();
				this.intervalHandle = Window.setInterval(function() {
					this.backupSettings();
				}.bind(this), 60000);
			}
			else {
				throw new Error('Login data missing');
			}
		}
		else {
			throw new Error('Backup inactive');
		}
	},
	
	stopTimer: function() {
		if (this.intervalHandle !== null) {
			Window.clearInterval(this.intervalHandle);
			this.intervalHandle = null;
		}
	},
	
	displayBackupData: function(overlayContentNode) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/?action=getList&username='+this.storage.getValue('backupUsername')+'&password='+this.storage.getValue('backupPassword'),
			onload: function(transport) {
				if (transport.readyState === 4) {
					var node = new Element('div');
					var userP = new Element('p');
					var panelLink = new Element('a', { href: 'javascript:;' });
					var logoutLink = new Element('a', { href: 'javascript:;' });
					
					panelLink.addEventListener('click', function(event) {
						this.transitionendUIFunction = this.displayUserPanel;
						$$('#backup .overlayContent')[0].style.opacity = 0;
					}.bindAsEventListener(this), true);
					
					logoutLink.addEventListener('click', function(event) {
						this.storage.unsetValue('backupUsername');
						this.storage.unsetValue('backupPassword');
						this.stopTimer();
						this.transitionendUIFunction = this.displayLoginForm;
						$$('#backup .overlayContent')[0].style.opacity = 0;
					}.bindAsEventListener(this), true);
					
					userP.appendChild(document.createTextNode('Angemeldet als '+this.storage.getValue('backupUsername')));
					userP.appendChild(new Element('br'));
					panelLink.appendChild(document.createTextNode('Benutzereinstellungen öffnen'));
					logoutLink.appendChild(document.createTextNode('Ausloggen'));
					userP.appendChild(panelLink);
					userP.appendChild(document.createTextNode(' | '));
					userP.appendChild(logoutLink);
					
					node.appendChild(userP);
					node.appendChild(new Element('hr', { style: 'display: block;' }));
					
					if ((transport.status >= 200) && (transport.status < 300)) {
						var xml = (new DOMParser()).parseFromString(transport.responseText, 'application/xml');
						
						if (xml.querySelectorAll('entry').length > 0) {
							var buttonsList = new Element('ul', { id: 'backupDataList', 'class': 'memberList' });
							
							$A(xml.querySelectorAll('entry')).each(function(item) {
								var button = new Element('li', { 'class': 'deletable' });
								var textLink = new Element('a', { 'class': 'memberName', href: 'javascript:;', title: 'Klicken zum Einspielen der Datensicherung' });
								var textSpan = new Element('span');
								var deleteLink = new Element('a', { 'class': 'memberRemove deleteButton', href: 'javascript:;', title: 'Klicken zum Löschen der Datensicherung' });
								var deleteImage = new Element('img', { src: './wcf/icon/deleteS.png', alt: '' });
								var input = new Element('input', { 'type': 'hidden', value: String(item.querySelector('index').firstChild.nodeValue) });
								
								var backupTimeObj = new Date(Math.floor(Number(item.querySelector('timestamp').firstChild.nodeValue) * 1000));
								var backupTimeString = '';
								
								backupTimeString += backupTimeObj.getDate()+'. '+(['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][backupTimeObj.getMonth()])+' '+backupTimeObj.getFullYear()+', ';
								backupTimeString += ((backupTimeObj.getHours() < 10) ? '0' : '')+backupTimeObj.getHours()+':'+((backupTimeObj.getMinutes() < 10) ? '0' : '')+backupTimeObj.getMinutes()+' Uhr';
								
								textLink.addEventListener('click', function(event) {
									var li = ((event.target.nodeName.toLowerCase() === 'a') ? event.target.parentNode : event.target.parentNode.parentNode);
									
									GM_xmlhttpRequest({
										method: 'GET',
										url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/index.php?action=getData&username='+this.storage.getValue('backupUsername')+'&password='+this.storage.getValue('backupPassword')+'&index='+li.querySelector('input').getAttribute('value'),
										headers: {
											'Accept': 'application/json'
										},
										onload: function(response) {
											if (response.readyState === 4) {
												if (response.status === 200) {
													var data = response.responseJSON;
													
													data.backupUsername = this.storage.getValue('backupUsername');
													data.backupPassword = this.storage.getValue('backupPassword');
													this.storage.importSettings(data);
													Window.location.reload();
												}
											}
										}.bind(this)
									});
								}.bindAsEventListener(this), true);
								
								deleteLink.addEventListener('click', function(event) {
									var li = ((event.target.nodeName.toLowerCase() === 'a') ? event.target.parentNode : event.target.parentNode.parentNode);
									
									GM_xmlhttpRequest({
										method: 'POST',
										url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/',
										headers: {
											'Content-Type': 'application/x-www-form-urlencoded'
										},
										data: 'action=deleteData&username='+encodeURIComponent(this.storage.getValue('backupUsername'))+'&password='+encodeURIComponent(this.storage.getValue('backupPassword'))+'&index='+li.querySelector('input').getAttribute('value'),
										onload: function(response) {
											if (response.readyState === 4) {
												if (response.status === 200) {
													new Window.Effect.Scale(li, 0, {
														afterFinish: function(effect) {
															if ($$('#backupDataList li').length === 1) {
																var info = new Element('p', { style: 'display: none;' });
																
																info.appendChild(document.createTextNode('Keine Datensicherungen auf dem Server vorhanden.'));
																effect.element.parentNode.parentNode.replaceChild(info, effect.element.parentNode);
																new Animations.FadeIn(info);
															}
															else {
																effect.element.parentNode.removeChild(effect.element);
															}
														}
													});
												}
											}
										}.bind(this)
									});
								}.bindAsEventListener(this), true);
								
								textSpan.appendChild(document.createTextNode('Datensicherung vom '+backupTimeString));
								textLink.appendChild(textSpan);
								deleteLink.appendChild(deleteImage);
								button.appendChild(input);
								button.appendChild(textLink);
								button.appendChild(deleteLink);
								buttonsList.appendChild(button);
							}, this);
							
							node.appendChild(buttonsList);
						}
						else {
							var info = new Element('p');
							
							info.appendChild(document.createTextNode('Keine Datensicherungen auf dem Server vorhanden.'));
							node.appendChild(info);
						}
					}
					else {
						var info = new Element('p');
						
						info.appendChild(document.createTextNode('Fehler beim Abfragen der gespeicherten Datensicherungen.'));
						info.appendChild(new Element('br'));
						info.appendChild(document.createTextNode(transport.status+' - '+transport.statusText));
							
						try {
							var xml = (new DOMParser()).parseFromString(transport.responseText, 'application/xml');
							
							if (!!xml.querySelector('error')) {
								info.appendChild(new Element('br'));
								info.appendChild(document.createTextNode(xml.querySelector('error > message').firstChild.nodeValue));
							}
						}
						catch (e) { }
						
						node.appendChild(info);
					}
					
					if (!!overlayContentNode.firstChild) {
						overlayContentNode.replaceChild(node, overlayContentNode.firstChild);
					}
					else {
						overlayContentNode.appendChild(node);
					}
					
					overlayContentNode.style.opacity = 1.0;
				}
			}.bind(this)
		});
	},
	
	displayLoginForm: function(overlayContentNode) {
		var node = new Element('div');
		var labelUsername = new Element('label', { 'for': 'inputUsername' });
		var labelPassword = new Element('label', { 'for': 'inputPassword' });
		var inputUsername = new Element('input', { type: 'text', id: 'inputUsername', name: 'inputUsername', size: '15', style: 'margin-bottom: 5px;' });
		var inputPassword = new Element('input', { type: 'password', id: 'inputPassword', name: 'inputPassword', size: '15', style: 'margin-bottom: 5px;' });
		var buttonLoginUser = new Element('button', { type: 'button' });
		var buttonRegisterUser = new Element('button', { type: 'button' });
		var info = new Element('p', { id: 'backupUserFormInfo', style: 'display: none;' });
		
		var buttonLoadFunction = function(response, infoText, errorText) {
			if (response.readyState === 4) {
				if (response.status === 200) {
					this.storage.setValue('backupUsername', $('inputUsername').value);
					this.storage.setValue('backupPassword', $('inputPassword').value);
					$('backupUserFormInfo').innerHTML = infoText;
					this.startTimer();
					this.transitionendUIFunction = this.displayBackupData;
					
					if ($('backupUserFormInfo').style.display !== 'none') {
						new Animations.Highlight('backupUserFormInfo', {
							onAnimationEnd: function(event) {
								$$('#backup .overlayContent')[0].style.opacity = 0;
							}
						});
					}
					else {
						new Animations.FadeIn('backupUserFormInfo', {
							onAnimationEnd: function(event) {
								event.target.style.display = 'inline-block';
								$$('#backup .overlayContent')[0].style.opacity = 0;
							}
						});
					}
				}
				else {
					try {
						var xml = (new DOMParser()).parseFromString(response.responseText, 'application/xml');
						
						$('backupUserFormInfo').innerHTML = xml.querySelector('message').firstChild.nodeValue;
					}
					catch (e) {
						$('backupUserFormInfo').innerHTML = errorText;
					}
					
					if ($('backupUserFormInfo').style.display !== 'none') {
						new Animations.Highlight('backupUserFormInfo');
					}
					else {
						new Animations.FadeIn('backupUserFormInfo', {
							onAnimationEnd: function(event) {
								event.target.style.display = 'inline-block';
							}
						});
					}
					
					$('inputUsername').focus();
				}
			}
		}.bind(this);
		
		buttonLoginUser.addEventListener('click', function(event) {
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/user.php?action=checkLoginData&username='+encodeURIComponent($('inputUsername').value)+'&password='+encodeURIComponent($('inputPassword').value),
				onload: function(response) {
					buttonLoadFunction(response, 'Benutzer eingeloggt', 'Benutzer konnte nicht eingeloggt werden');
				}
			});
		}, true);
		
		buttonRegisterUser.addEventListener('click', function(event) {
			GM_xmlhttpRequest({
				method: 'POST',
				url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/user.php',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: 'action=createUser&username='+encodeURIComponent($('inputUsername').value)+'&password='+encodeURIComponent($('inputPassword').value),
				onload: function(response) {
					buttonLoadFunction(response, 'Benutzer angelegt und eingeloggt', 'Benutzer konnte nicht angelegt werden');
				}
			});
		}, true);
		
		labelUsername.appendChild(inputUsername);
		labelUsername.appendChild(document.createTextNode(' Username'));
		labelPassword.appendChild(inputPassword);
		labelPassword.appendChild(document.createTextNode(' Passwort'));
		buttonLoginUser.appendChild(document.createTextNode('Einloggen'));
		buttonRegisterUser.appendChild(document.createTextNode('User anlegen'));
		node.appendChild(labelUsername);
		node.appendChild(new Element('br'));
		node.appendChild(labelPassword);
		node.appendChild(new Element('br'));
		node.appendChild(buttonLoginUser);
		node.appendChild(document.createTextNode(' '));
		node.appendChild(buttonRegisterUser);
		node.appendChild(new Element('br'));
		node.appendChild(new Element('br'));
		node.appendChild(info);
		
		if (!!overlayContentNode.firstChild) {
			overlayContentNode.replaceChild(node, overlayContentNode.firstChild);
		}
		else {
			overlayContentNode.appendChild(node);
		}
		
		overlayContentNode.style.opacity = 1.0;
	},
	
	displayUserPanel: function(overlayContentNode) {
		var node = new Element('div');
		var userP = new Element('p');
		var returnLink = new Element('a', { href: 'javascript:;' });
		var logoutLink = new Element('a', { href: 'javascript:;' });
		
		var wrapper = new Element('div');
		var deleteLink = new Element('a', { href: 'javascript:;' });
		var inputAlterPasswordOld = new Element('input', { type: 'password', id: 'inputAlterPasswordOld', name: 'inputAlterPasswordOld', size: '15', style: 'margin-bottom: 5px;' });
		var labelAlterPasswordOld = new Element('label', { 'for': 'inputAlterPasswordOld' });
		var inputAlterPasswordNew = new Element('input', { type: 'password', id: 'inputAlterPasswordNew', name: 'inputAlterPasswordNew', size: '15', style: 'margin-bottom: 5px;' });
		var labelAlterPasswordNew = new Element('label', { 'for': 'inputAlterPasswordNew' });
		var buttonAlterPassword = new Element('button', { type: 'button' });
		var info = new Element('p', { id: 'backupUserFormInfo', style: 'display: none;' });
		
		returnLink.addEventListener('click', function(event) {
			this.transitionendUIFunction = this.displayBackupData;
			$$('#backup .overlayContent')[0].style.opacity = 0;
		}.bindAsEventListener(this), true);
		
		logoutLink.addEventListener('click', function(event) {
			this.storage.unsetValue('backupUsername');
			this.storage.unsetValue('backupPassword');
			this.stopTimer();
			this.transitionendUIFunction = this.displayLoginForm;
			$$('#backup .overlayContent')[0].style.opacity = 0;
		}.bindAsEventListener(this), true);
		
		deleteLink.addEventListener('click', function(event) {
			GM_xmlhttpRequest({
				method: 'POST',
				url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/user.php',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: 'action=deleteUser&username='+encodeURIComponent(this.storage.getValue('backupUsername'))+'&password='+encodeURIComponent(this.storage.getValue('backupPassword')),
				onload: function(response) {
					if (response.readyState === 4) {
						if (response.status === 200) {
							this.storage.unsetValue('backupUsername');
							this.storage.unsetValue('backupPassword');
							this.storage.unsetValue('lastBackup');
							this.stopTimer();
							this.transitionendUIFunction = this.displayLoginForm;
							$$('#backup .overlayContent')[0].style.opacity = 0;
						}
						else {
							try {
								var xml = (new DOMParser()).parseFromString(response.responseText, 'application/xml');
								
								$('backupUserFormInfo').innerHTML = xml.querySelector('message').firstChild.nodeValue;
							}
							catch (e) {
								$('backupUserFormInfo').innerHTML = 'Benutzer konnte nicht gelöscht werden';
							}
							
							if ($('backupUserFormInfo').style.display !== 'none') {
								new Animations.Highlight('backupUserFormInfo');
							}
							else {
								new Animations.FadeIn('backupUserFormInfo', {
									onAnimationEnd: function(event) {
										event.target.style.display = 'inline-block';
									}
								});
							}
						}
					}
				}.bind(this)
			});
		}.bindAsEventListener(this), true);
		
		buttonAlterPassword.addEventListener('click', function(event) {
			if ($('inputAlterPasswordOld').value === this.storage.getValue('backupPassword')) {
				GM_xmlhttpRequest({
					method: 'POST',
					url: 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/backup/user.php',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: 'action=alterPassword&username='+encodeURIComponent(this.storage.getValue('backupUsername'))+'&oldPassword='+encodeURIComponent(this.storage.getValue('backupPassword'))+'&newPassword='+encodeURIComponent($('inputAlterPasswordNew').value),
					onload: function(response) {
						if (response.readyState === 4) {
							if (response.status === 200) {
								this.storage.setValue('backupPassword', $('inputAlterPasswordNew').value);
								$('backupUserFormInfo').innerHTML = 'Passwort geändert';
								this.transitionendUIFunction = this.displayBackupData;
								
								if ($('backupUserFormInfo').style.display !== 'none') {
									new Animations.Highlight('backupUserFormInfo', {
										onAnimationEnd: function(event) {
											$$('#backup .overlayContent')[0].style.opacity = 0;
										}
									});
								}
								else {
									new Animations.FadeIn('backupUserFormInfo', {
										onAnimationEnd: function(event) {
											event.target.style.display = 'inline-block';
											$$('#backup .overlayContent')[0].style.opacity = 0;
										}
									});
								}
							}
							else {
								try {
									var xml = (new DOMParser()).parseFromString(response.responseText, 'application/xml');
									
									$('backupUserFormInfo').innerHTML = xml.querySelector('message').firstChild.nodeValue;
								}
								catch (e) {
									$('backupUserFormInfo').innerHTML = 'Passwort konnte nicht geändert werden';
								}
								
								if ($('backupUserFormInfo').style.display !== 'none') {
									new Animations.Highlight('backupUserFormInfo');
								}
								else {
									new Animations.FadeIn('backupUserFormInfo', {
										onAnimationEnd: function(event) {
											event.target.style.display = 'inline-block';
										}
									});
								}
							}
						}
					}.bind(this)
				});
			}
			else {
				$('backupUserFormInfo').innerHTML = 'Das bisherige Passwort ist inkorrekt';
				
				if ($('backupUserFormInfo').style.display !== 'none') {
					new Animations.Highlight('backupUserFormInfo');
				}
				else {
					new Animations.FadeIn('backupUserFormInfo', {
						onAnimationEnd: function(event) {
							event.target.style.display = 'inline-block';
						}
					});
				}
				
				$('inputAlterPasswordOld').focus();
			}
		}.bindAsEventListener(this), true);
		
		userP.appendChild(document.createTextNode('Angemeldet als '+this.storage.getValue('backupUsername')));
		userP.appendChild(new Element('br'));
		returnLink.appendChild(document.createTextNode('Zurück'));
		logoutLink.appendChild(document.createTextNode('Ausloggen'));
		userP.appendChild(returnLink);
		userP.appendChild(document.createTextNode(' | '));
		userP.appendChild(logoutLink);
		
		deleteLink.appendChild(document.createTextNode('Benutzer löschen'));
		labelAlterPasswordOld.appendChild(inputAlterPasswordOld);
		labelAlterPasswordOld.appendChild(document.createTextNode(' bisheriges Passwort'));
		labelAlterPasswordNew.appendChild(inputAlterPasswordNew);
		labelAlterPasswordNew.appendChild(document.createTextNode(' neues Passwort'));
		buttonAlterPassword.appendChild(document.createTextNode('Passwort ändern'));
		wrapper.appendChild(deleteLink);
		wrapper.appendChild(new Element('hr', { style: 'display: block;' }));
		wrapper.appendChild(labelAlterPasswordOld);
		wrapper.appendChild(new Element('br'));
		wrapper.appendChild(labelAlterPasswordNew);
		wrapper.appendChild(new Element('br'));
		wrapper.appendChild(buttonAlterPassword);
		
		node.appendChild(userP);
		node.appendChild(new Element('hr', { style: 'display: block;' }));
		node.appendChild(new Element('hr', { style: 'display: block;' }));
		node.appendChild(wrapper);
		node.appendChild(info);
		
		if (!!overlayContentNode.firstChild) {
			overlayContentNode.replaceChild(node, overlayContentNode.firstChild);
		}
		else {
			overlayContentNode.appendChild(node);
		}
		
		overlayContentNode.style.opacity = 1.0;
	}
});
