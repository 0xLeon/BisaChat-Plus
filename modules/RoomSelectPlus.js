/* 
 * Room Select Plus Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.RoomSelectPlus = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.buildRoomSelectPlus();
	},
	
	buildRoomSelectPlus: function() {
		var roomSelectPlusSmallButton = new API.w.Element('li', { id: 'roomSelectPlusButton', style: 'display:none;' });
		var roomSelectPlusSmallButtonLink = new API.w.Element('a', { id: 'roomSelectPlus', style: 'display:inline-block; -moz-border-radius-topright:0px !important; -moz-border-radius-bottomright:0px !important;' });
		var roomSelectPlusSmallButtonSpan = new API.w.Element('span');
		var roomSelectPlusSmallButtonMenu = new API.w.Element('div', { id: 'roomSelectPlusMenu', 'class': 'hidden' });
		var roomSelectPlusSmallButtonMenuList = this.getRoomList();
		
		var roomSelectPlusSmallButtonUpdateLink = new API.w.Element('a', { id: 'roomSelectPlusUpdate', title: 'Raumliste neu laden', style: 'display:inline-block; top:1px !important; -moz-border-radius-topleft:0px !important; -moz-border-radius-bottomleft:0px !important;' });
		var roomSelectPlusSmallButtonUpdateImage = new API.w.Element('img', { src: './wcf/icon/packageUpdateS.png', alt: '' });
		
		roomSelectPlusSmallButtonUpdateLink.addEventListener('click', function(event) {
			new API.w.Ajax.Updater('chatExtraRoomContainer', 'index.php?page=ChatRefreshRoomList', {
				evalScripts: true,
				onCreate: function(response) {
					API.w.$('roomSelectPlusUpdate').style.opacity = 0.5;
				},
				onComplete: function(respone, json) {
					API.w.$('roomSelectPlusMenu').replaceChild(this.getRoomList(), API.w.$('roomSelectPlusMenuList'));
					API.w.$('roomSelectPlusUpdate').style.opacity = 1.0;
				}.bind(this)
			});
		}.bindAsEventListener(this), true);
		
		roomSelectPlusSmallButtonUpdateLink.appendChild(roomSelectPlusSmallButtonUpdateImage);
		
		roomSelectPlusSmallButtonSpan.appendChild(document.createTextNode('Aktueller Raum: '+String(roomSelectPlusSmallButtonMenuList.getElementsByClassName('active')[0].getElementsByTagName('span')[0].firstChild.nodeValue).trim()));
		roomSelectPlusSmallButtonLink.appendChild(roomSelectPlusSmallButtonSpan);
		roomSelectPlusSmallButtonMenu.appendChild(roomSelectPlusSmallButtonMenuList);
		roomSelectPlusSmallButton.appendChild(roomSelectPlusSmallButtonLink);
		roomSelectPlusSmallButton.appendChild(roomSelectPlusSmallButtonUpdateLink);
		roomSelectPlusSmallButton.appendChild(roomSelectPlusSmallButtonMenu);
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(roomSelectPlusSmallButton);
		
		API.w.popupMenuList.register('roomSelectPlus');
		new API.w.Effect.Appear('roomSelectPlusButton');
	},
	
	getRoomList: function() {
		var roomSelectPlusSmallButtonMenuList = new API.w.Element('ul', { id: 'roomSelectPlusMenuList' });
		
		(API.w.$$('#chatOptions option')).each(function(item) {
			var roomSelectPlusSmallButtonMenuListItem = new API.w.Element('li', { id: String(item.getAttribute('id')) });
			var roomSelectPlusSmallButtonMenuListItemLink = new API.w.Element('a');
			var roomSelectPlusSmallButtonMenuListItemSpan = new API.w.Element('span');
			var roomSelectPlusSmallButtonMenuListItemInput = new API.w.Element('input', { type: 'hidden', value: String(item.getAttribute('value')) });
			
			roomSelectPlusSmallButtonMenuListItem.addEventListener('click', function(event) {
				var li = (event.target.parentNode.nodeName.toLowerCase() === 'li') ? event.target.parentNode : event.target.parentNode.parentNode;
				
				if (!!li.getAttribute('class')) {
					return false;
				}
				else {
					API.w.$$('#roomSelectPlusMenu li.active')[0].setAttribute('class', '');
					window.location.hash = li.getElementsByTagName('input')[0].getAttribute('value');
					API.w.$$('#roomSelectPlus > span')[0].firstChild.replaceData(0, API.w.$$('#roomSelectPlus > span')[0].firstChild.nodeValue.length, 'Aktueller Raum: '+String(li.getElementsByTagName('span')[0].firstChild.nodeValue).trim());
					li.setAttribute('class', 'active');
				}
			}, true);
			
			if (item.selected) roomSelectPlusSmallButtonMenuListItem.setAttribute('class', 'active');
			roomSelectPlusSmallButtonMenuListItemSpan.appendChild(document.createTextNode(String(item.innerHTML).trim()));
			roomSelectPlusSmallButtonMenuListItemLink.appendChild(roomSelectPlusSmallButtonMenuListItemSpan);
			roomSelectPlusSmallButtonMenuListItem.appendChild(roomSelectPlusSmallButtonMenuListItemLink);
			roomSelectPlusSmallButtonMenuListItem.appendChild(roomSelectPlusSmallButtonMenuListItemInput);
			roomSelectPlusSmallButtonMenuList.appendChild(roomSelectPlusSmallButtonMenuListItem);
			
			item.removeAttribute('id');
			delete roomSelectPlusSmallButtonMenuListItem;
			delete roomSelectPlusSmallButtonMenuListItemLink;
			delete roomSelectPlusSmallButtonMenuListItemSpan;
			delete roomSelectPlusSmallButtonMenuListItemInput;
		});
		
		return roomSelectPlusSmallButtonMenuList;
	}
};
