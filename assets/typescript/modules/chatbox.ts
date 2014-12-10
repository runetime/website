var chatbox;
class Chatbox {
	channel: string = '#radio';
	elements: any = {};
	lastId: number = 0;
	messages: any = [];
	times: any = {};
	updateTimeout: number = null;
	URL: any = {};

	constructor(public channel: string) {
		this.channel = channel;
		this.elements = {
			actions: '#chatbox-actions',
			channels: '#chatbox-channels',
			chatbox: '#chatbox',
			message: '#chatbox-message',
			messages: '#chatbox-messages'
		};
		this.URL = {
			getStart: '/chat/start',
			getUpdate: '/chat/update',
			postMessage: '/chat/post/message',
			postStatusChange: '/chat/post/status/change'
		};
		this.times = {
			lastActivity: utilities.currentTime(),
			lastRefresh: utilities.currentTime(),
			loadedAt: utilities.currentTime()
		};
		this.panelChat();
		this.getStart();
		$(this.elements.message).keypress(function (e) {
			if(e.which === 13)
				chatbox.submitMessage();
		});
		$(this.elements.channels).bind('click', function () {
			chatbox.Panels.channels();
		});
		setTimeout(function () {
			chatbox.update();
		}, 5000);
		setTimeout(function () {
			chatbox.updateTimeAgo();
		}, 1000);
	}

	addMessage(message: any) {
		this.lastId = message.id;
		this.messages.push(message);
		this.times.lastActivity = utilities.currentTime();
		this.displayMessages();
	}

	displayMessages() {
		var startingPoint = $(this.messages).size() - 20;
		if(startingPoint < 0)
			startingPoint = 0;
		var messages = $(this.messages).slice(startingPoint);
		$(this.elements.messages).html('');
		$.each(messages, function(index, message) {
			var html ="";
			html += "<div id='" + message.uuid + "' class='msg'>";
			html += "<time class='pull-right' data-ts='" + message.created_at + "'>";
			html += utilities.timeAgo(message.created_at);
			html += "</time>";
			html += "<p>";
			html += "<a class='members-" + message.class_name + "'>" + message.author_name + "</a>: " + message.contents_parsed;
			html += "</p>";
			html += "</div>";
			$(chatbox.elements.messages).prepend(html);
		});
	}

	getStart() {
		$(this.elements.messages).html('');
		var data = {
			time: this.times.loadedAt,
			channel: this.channel
		};
		var messages = utilities.postAJAX('chat/start', data);
		messages.done(function(messages) {
			messages = $.parseJSON(messages);
			$.each(messages, function (index, value) {
				chatbox.addMessage(value);
			});
		});
	}

	panelChannels() {
		var response = utilities.getAJAX('/chat/channels');
		response.done(function(response) {
			var contents = "";
			response = $.parseJSON(response);
			contents += "<div id='chatbox-popup-channels'>";
			contents += "<button type='button' class='close' onclick='chatbox.panelclose();'>Close <span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>";
			contents += "<h3>Channels</h3>";
			contents += "<p class='holo-text'>Currently on <b>#" + chatbox.channel + "</b></p>";
			$.each(response, function (index, value) {
				contents += "<a onclick=\"chatbox.switchChannel('" + value.name + "');\">#" + value.name + "</a><br />";
				contents += "<span class='holo-text-secondary'>" + value.messages + " messages</span><br />";
				contents += "<span class='holo-text-secondary'>Last active " + utilities.timeAgo(value.last_message) + "</span><br />";
			});
			contents += "</div>";
			$(chatbox.elements.messages).html(contents);
		});
	}

	panelChat() {
		var contents = "";
		contents += "<div id='chatbox-messages'></div>";
		contents += "<div id='chatbox-actions'>";
		contents += "<a href='/transparency/markdown' target='_blank' id='chatbox-markdown'>Markdown</a>";
		contents += "<a id='chatbox-channels'>Channels</a>";
		contents += "</div>";
		contents += "<input type='text' id='chatbox-message' />";
		$(this.elements.chatbox).html(contents);
	}

	panelClose() {
		this.getStart();
	}

	submitMessage() {
		var contents = $(this.elements.message).val(),
			message,
			response;
		message = {
			contents: contents,
			channel: this.channel
		};
		response = utilities.postAJAX(this.URL.postMessage, message);
		response.done(function(response) {
			response = $.parseJSON(response);
			chatbox.update();
			if(response.done === true) {
				$(chatbox.elements.message).val('');
				$(chatbox.elements.message).toggleClass('message-sent');
				setTimeout(function () {
					$(chatbox.elements.message).toggleClass('message-sent');
				}, 1500);
			} else {
				if(response.error === -1) {
					$(chatbox.elements.message).val('You are not logged in and can not send messages.');
				} else if(response.error === -2) {
					$(chatbox.elements.message).val('You were muted for one hour by a staff member and can not send messages.');
				} else {
					$(chatbox.elements.message).val('There was an unknown error.  Please try again.');
				}
				$(chatbox.elements.message).toggleClass('message-bad');
				setTimeout(function () {
					$(chatbox.elements.message).toggleClass('message-bad');
				}, 2500);
			}
		});
	}

	switchChannel() {
		var data,
			response;
		data = {
			channel: name
		};
		response = utilities.postAJAX('/chat/channels/check', data);
		response.done(function(response) {
			response = $.parseJSON(response);
			if(response.valid) {
				chatbox.channel = name;
				chatbox.getStart();
			} else {
				console.log('error');
			}
		});
	}

	update() {
		var data = {
			id: this.lastId,
			channel: this.channel
		};
		var response = utilities.postAJAX(this.URL.getUpdate, data);
		response.done(function(response) {
			response = $.parseJSON(response);
			chatbox.times.lastRefresh = utilities.currentTime();
			$.each(response, function (index, value) {
				chatbox.addMessage(value);
			});
			clearTimeout(chatbox.updateTimeout);
			chatbox.updateTimeout = setTimeout(function () {
				chatbox.update();
			}, 5500);
		});
	}

	updateTimeAgo() {
		var messages = $(this.elements.messages).find('.msg');
		$.each(messages, function (index, value) {
			var timestamp = $(value).find('time').attr('data-ts');
			$(value).find('time').html(utilities.timeAgo(timestamp));
		});
		setTimeout(function () {
			chatbox.updateTimeAgo();
		}, 1000);
	}
}