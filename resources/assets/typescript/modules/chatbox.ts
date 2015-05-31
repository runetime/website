var chatbox;
class Chatbox {
	channel: string = '#radio';
	elements: any = {};
	lastId: number = 0;
	messages: any = [];
	moderator: boolean = false;
	pinned: any = [];
	spam: any = {};
	times: any = {};
	timeoutPinned: any = null;
	timeoutUpdate: any = null;
	URL: any = {};

	pinnedDisplayed: any = [];

	public constructor(channel: string) {
		this.channel = channel;
		this.elements = {
			actions: '#chatbox-actions',
			channels: '#chatbox-channels',
			chatbox: '#chatbox',
			error: "#chatbox-error",
			message: '#chatbox-message',
			messages: '#chatbox-messages'
		};
		this.URL = {
			getStart: '/chat/start',
			getUpdate: '/chat/update',
			postMessage: '/chat/post/message',
			postStatusChange: '/chat/post/status/change'
		};
		this.spam = {
			first: 0,
			second: 0,
			third: 0
		};
		this.times = {
			lastActivity: utilities.currentTime(),
			lastRefresh: utilities.currentTime(),
			loadedAt: utilities.currentTime()
		};
		var moderator = utilities.getAJAX('/chat/moderator');
		moderator.done(function(moderator: string) {
			moderator = $.parseJSON(moderator);
			chatbox.moderator = moderator.mod === true;
		});
		this.panelChat();
		this.getStart();
		$(this.elements.message).keypress(function (e) {
			if(e.which === 13)
				chatbox.submitMessage();
		});
		$(this.elements.channels).bind('click', function () {
			chatbox.panelChannels();
		});
		setTimeout(function () {
			chatbox.update();
		}, 5000);
		setTimeout(function () {
			chatbox.updateTimeAgo();
		}, 1000);
	}

	public addMessage(message: any) {
		if(this.lastId < message.id) {
			this.lastId = message.id;
		}
		if(message.status <= 1) {
			this.messages[this.messages.length] = message;
			this.times.lastActivity = utilities.currentTime();
		}
	}

	public displayMessage(message) {
		if(!message) {
			return;
		}
		var html = "";
		if (message.status === 1) {
			html += "<div id='" + message.id + "' class='msg msg-hidden'>";
		} else if(message.status === 2) {
			html += "<div id='" + message.id + "' class='msg msg-pinned'>";
		} else if(message.status === 3) {
			html += "<div id='" + message.id + "' class='msg msg-pinhid'>";
		} else {
			html += "<div id='" + message.id + "' class='msg'>";
		}
		html += "<time class='pull-right' data-ts='" + message.created_at + "'>";
		html += utilities.timeAgo(message.created_at);
		html += "</time>";
		html += "<p>";
		if(chatbox.moderator === true) {
			html += Chatbox.modTools(message);
		}
		html += "<a class='members-" + message.class_name + "'>" + message.author_name + "</a>: " + message.contents_parsed;
		html += "</p>";
		html += "</div>";
		$(chatbox.elements.messages).prepend(html);
	}

	public displayMessages() {
		var messages = this.messages;
		$(this.elements.messages).html('');
		$.each(messages, function(index, message) {
			chatbox.displayMessage(message);
		});
		$.each(this.pinned, function(index, message) {
			if(chatbox.pinnedDisplayed[message.id] !== true) {
				chatbox.pinnedDisplayed[message.id] = true;
				chatbox.displayMessage(message);
			}
		});
		chatbox.pinnedDisplayed = [];
	}

	public error(message: string) {
		$(this.elements.error).html(message).
			fadeTo(1000, 1);
		var self = this;
		setTimeout(function() {
			$(self.elements.error).
				fadeTo(1000, 0);
			setTimeout(function() {
				$(self.elements.error).html("");
			}, 1500);
		}, 3500);
	}

	public getStart() {
		$(this.elements.messages).html('');
		this.messages = [];
		var data = {
			time: this.times.loadedAt,
			channel: this.channel
		};
		var results = utilities.postAJAX('chat/start', data);
		var self = this;
		results.done(function(results) {
			results = $.parseJSON(results);
			$.each(results.messages, function (index, value) {
				self.addMessage(value);
			});
			self.pinned = results.pinned;
			self.displayMessages();
		});
	}

	public mod(id: any, newStatus: number) {
		var data = {
			id: id,
			status: newStatus
		};
		var results = utilities.postAJAX('/chat/status-change', data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				chatbox.getStart();
			} else {
				chatbox.error("There was an error while performing that moderation change.");
			}
		})
	}

	public static modTools(message) {
		var res = "";
		res += "<ul class='list-inline inline'>";
		res += "<li>";
		if(message.status % 2 === 0) {
			res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status + 1) + ");' title='Hide message'><i class='fa fa-minus-circle text-info'></i></a>";
		} else {
			res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status - 1) + ");' title='Show message'><i class='fa fa-plus-circle text-info'></i></a>";
		}
		res += "</li>";
		res += "<li>";
		if(message.status >= 2) {
			res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status - 2) + ");' title='Unpin message'><i class='fa fa-arrow-circle-down text-info'></i></a>";
		} else {
			res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status + 2) + ");' title='Pin message'><i class='fa fa-arrow-circle-up text-info'></i></a>";
		}
		res += "</li>";
		res += "</ul>";
		return res;
	}

	public panelChannels() {
		var response = utilities.getAJAX('/chat/channels');
		response.done(function(response) {
			var contents = "";
			response = $.parseJSON(response);
			contents += "<div id='chatbox-popup-channels'>";
			contents += "<button type='button' class='close' onclick='chatbox.panelClose();'>Close <span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>";
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

	public panelChat() {
		var contents = "";
		contents += "<div id='chatbox-error'></div>";
		contents += "<div id='chatbox-messages'></div>";
		contents += "<div id='chatbox-actions'>";
		contents += "<a href='/transparency/markdown' target='_blank' id='chatbox-markdown'>Markdown</a>";
		contents += "<a id='chatbox-channels'>Channels</a>";
		contents += "</div>";
		contents += "<input type='text' id='chatbox-message' />";
		$(this.elements.chatbox).html(contents);
	}

	public panelClose() {
		this.getStart();
	}

	public submitMessage() {
		var contents = $(this.elements.message).val(),
			message,
			response;
		message = {
			contents: contents,
			channel: this.channel
		};
		if((Date.now() / 1000) - 30 < this.spam.third) {
			var diff = ((Date.now() / 1000) - this.spam.third);
			var time = Math.round(30 - diff);
			this.error('You must wait another ' + time + ' seconds before sending another message.');
			return;
		} else {
			this.spam.third = this.spam.second;
			this.spam.second = this.spam.first;
			this.spam.first = Date.now() / 1000;
		}

		response = utilities.postAJAX(this.URL.postMessage, message);
		var self = this;

		response.done(function(response) {
			response = $.parseJSON(response);
			self.update();
			if(response.done === true) {
				$(self.elements.message).val('');
				$(self.elements.message).toggleClass('message-sent');
				setTimeout(function () {
					$(self.elements.message).toggleClass('message-sent');
				}, 1500);
			} else {
				if(response.error === -1) {
					$(self.elements.message).val('You are not logged in and can not send messages.');
				} else if(response.error === -2) {
					$(self.elements.message).val('You were muted for one hour by a staff member and can not send messages.');
				} else {
					$(self.elements.message).val('There was an unknown error.  Please try again.');
				}
				$(self.elements.message).toggleClass('message-bad');
				setTimeout(function () {
					$(self.elements.message).toggleClass('message-bad');
				}, 2500);
			}
		});
	}

	public switchChannel(name: string) {
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

	public update() {
		var data = {
			id: this.lastId,
			channel: this.channel
		};
		var response = utilities.postAJAX(this.URL.getUpdate, data);
		response.done(function(response) {
			response = $.parseJSON(response);
			chatbox.times.lastRefresh = utilities.currentTime();
			if(response.length > 0) {
				$.each(response, function (index, value) {
					chatbox.addMessage(value);
				});
				chatbox.displayMessages();
			}
			clearTimeout(chatbox.timeoutUpdate);
			chatbox.timeoutUpdate = setTimeout(function () {
				chatbox.update();
			}, 10000);
		});
	}

	public updateTimeAgo() {
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
