/* 
 * Smilies Plus Module
 */
Modules.SmiliesPlus = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.buildSmiliesBox();
		this.addListener();
	},
	
	buildSmiliesBox: function() {
		var smiliesSmallButton = new API.w.Element('li', { id: 'smiliesSmallButton' });
		var smiliesSmallButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var smiliesSmallButtonImg = new API.w.Element('img', { src: './wcf/images/smilies/smile.png', alt: '', style: 'width:16px; height:16px;' });
		var smiliesSmallButtonSpan = new API.w.Element('span');
		
		var smiliesDiv = new API.w.Element('div', { id: 'smilies', 'class': 'border messageInner', style: 'z-index:500;' });
		var smiliesHeadlineDiv = new API.w.Element('div', { id: 'smiliesHeadline', 'class': 'containerHead', style: 'cursor:move;' });
		var smiliesHeadline = new API.w.Element('h3');
		var smiliesContentDiv = new API.w.Element('div', { id: 'smiliesContent', style: 'height:132px; padding-left:3px; overflow-y:auto;' });
		var smiliesListDiv = new API.w.Element('div', { id: 'smiliesList' });
		var smiliesUl = new API.w.Element('ul', { 'class': 'smileys' });
		
		(API.w.$$('#smileyList ul > li')).each(function(item) {
			smiliesUl.appendChild(item.cloneNode(true));
		});
		
		smiliesDiv.style.display = (API.Storage.getValue('smiliesboxVisible', false)) ? '' : 'none';
		smiliesDiv.style.top = API.Storage.getValue('smiliesboxTop', '-160px');
		smiliesDiv.style.left = API.Storage.getValue('smiliesboxLeft', '0px');
		
		smiliesSmallButtonLink.addEventListener('click', function(event) {
			if (event.altKey) {
				new API.w.Effect.Morph('smilies', {
					style: {
						display: 'block',
						top: '-160px',
						left: '0px'
					},
					
					afterFinish: function() {
						this.callerObj.saveBoxStatus('smilies');
					}.bind(this)
				});
			}
			else {
				if (API.w.$('smilies').style.display === 'none') {
					API.w.Effect.Appear('smilies', {
						afterFinish: function() {
							this.callerObj.saveBoxStatus('smilies');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
				else {
					API.w.Effect.Fade('smilies', {
						afterFinish: function() {
							this.callerObj.saveBoxStatus('smilies');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
			}
			
			event.preventDefault();
		}.bindAsEventListener(this), true);
		
		smiliesSmallButtonSpan.appendChild(document.createTextNode('Smileys'));
		smiliesHeadline.appendChild(document.createTextNode('Smileys'));
		
		smiliesListDiv.appendChild(smiliesUl);
		smiliesContentDiv.appendChild(smiliesListDiv);
		smiliesHeadlineDiv.appendChild(smiliesHeadline);
		smiliesDiv.appendChild(smiliesHeadlineDiv);
		smiliesDiv.appendChild(smiliesContentDiv);
		
		smiliesSmallButtonLink.appendChild(smiliesSmallButtonImg);
		smiliesSmallButtonLink.appendChild(document.createTextNode(' '));
		smiliesSmallButtonLink.appendChild(smiliesSmallButtonSpan);
		smiliesSmallButton.appendChild(smiliesSmallButtonLink);
		smiliesSmallButton.appendChild(smiliesDiv);
		API.w.$('smileys').parentNode.removeChild(API.w.$('smileys'));
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(smiliesSmallButton);
	},
	
	addListener: function() {
		new API.w.Draggable('smilies', {
			handle: 'smiliesHeadline',
			zindex: 2000,
			starteffect: void(0),
			endeffect: void(0),
			onEnd: function() {
				this.callerObj.saveBoxStatus('smilies');
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > API.inWidth) || (dragObjRect.bottom > API.inHeight)) return true;
				else return false;
			}
		});
		
		this.callerObj.registerMessagePrefilter('enablesmilies', 'Smileys', 'Darstellung von Smileys aktivieren', 'p', false, function(event, checked, nickname, message) {
			if (!checked) {
				var smilies = API.w.$A(message.getElementsByTagName('img'));
				
				if (smilies.length > 0) {
					smilies.each(function(item) {
						message.replaceChild(document.createTextNode(String(item.getAttribute('alt'))), item);
					});
				}
			}
		});
	}
};
