/*jslint browser: true*/
/*global $, jQuery, alert*/
/*jslint devel: true */
/*jshint -W097*/
function RuneTime() {
	"use strict";
	this.Calculator = null;
	this.ChatBox = null;
	this.CombatCalculator = null;
	this.FormSignup = null;
	this.Forums = null;
	this.NameChecker = null;
	this.Utilities = null;
	this.Utilities = function Utilities() {
		this.getAJAX = function getAJAX(path) {
			return $.ajax({
				url     : path,
				type    : 'get',
				dataType: 'html',
				async   : true
			});
		};
		this.postAJAX = function postAJAX(path, data) {
			return $.ajax({
				url: path,
				type: 'post',
				data: data,
				async: true
			});
		};
		this.timeAgo = function timeAgo(ts) {
			var nowTs = Math.floor(Date.now() / 1000),
				seconds = nowTs - ts;
			if(seconds > 2 * 24 * 3600) {
				return "a few days ago";
			} else if(seconds > 24 * 3600) {
				return "yesterday";
			} else if(seconds > 7200) {
				return Math.floor(seconds / 3600) + " hours ago";
			} else if(seconds > 3600) {
				return "an hour ago";
			} else if(seconds >= 120) {
				return Math.floor(seconds / 60) + " minutes ago";
			} else if(seconds >= 60) {
				return "1 minute ago";
			} else if(seconds > 1) {
				return seconds + " seconds ago";
			} else {
				return "1 second ago";
			}
		};
		this.currentTime = function currentTime() {
			return Math.floor(Date.now() / 1000);
		};
		this.JSONDecode = function JSONDecode(json) {
			return $.parseJSON(json);
		};
		this.scrollTo = function scrollTo(element, time) {
			$('html, body').animate({
				scrollTop: $(element).offset().top
			}, time);
		}
	};
	this.Forums = function Forums() {
		this.elements = {};
		this.Post = null;
		this.Post = function Post() {
			/**
			 * Sets a quote to be at affixed to the open post editor
			 * @param id
			 */
			this.quote = function quote(id) {
				var source = $("[rt-data='post#" + id +":source']").html(),
					postContents = $(RuneTime.Forums.elements.postEditor).val();
				source = source.replace(/\n/g, '\n>');
				source = source.replace(/&lt;/g, '<');
				source = source.replace(/&gt;/g, '>');
				source = ">" + source;
				if(postContents.length > 0)
					postContents += "\n";
				$(RuneTime.Forums.elements.postEditor).val(postContents + source + "\n");
				RuneTime.Utilities.scrollTo($(RuneTime.Forums.elements.postEditor), 1000);
				$(RuneTime.Forums.elements.postEditor).focus();
			}
		};
		this.upvote = function upvote(postID) {
			postID = postID.replace("post", "");
			var post = $('#post' + postID),
				isUpvoted = $(post).hasClass('upvote-active'),
				isDownvoted = $(post).hasClass('downvote-active');
			if(isUpvoted === true)
				$(post).removeClass('upvote-active');
			else
				$(post).addClass('upvote-active');
			if(isDownvoted === true)
				$(post).removeClass('downvote-active');
			var data = {
				'vote': 'up'
			};
			var vote = RuneTime.Utilities.postAJAX(this.paths.vote(postID), data);
			vote.done(function(data) {
				data = $.parseJSON(data);
			});
		};
		this.downvote = function downvote(postID) {
			postID = postID.replace("post", "");
			var post = $('#post' + postID),
				isUpvoted = $(post).hasClass('upvote-active'),
				isDownvoted = $(post).hasClass('downvote-active');
			if(isDownvoted === true)
				$(post).removeClass('downvote-active');
			else
				$(post).addClass('downvote-active');
			if(isUpvoted === true)
				$(post).removeClass('upvote-active');
			var data = {
				'vote': 'down'
			};
			var vote = RuneTime.Utilities.postAJAX(this.paths.vote(postID), data);
			vote.done(function(data) {
				data = $.parseJSON(data);
			});
		};
		this.setup = function setup() {
			this.elements = {
				'postEditor': "[rt-data='post.edit']"
			};
			this.paths = {
				'vote': function(id) { return '/forums/post/' + id + '/vote'; }
			};
			this.Post = new this.Post();
			$('.upvote').bind('click', function(e) {
				var postID = $(e.target).parent().parent().parent().parent().parent().attr('id');
				RuneTime.Forums.upvote(postID);
			});
			$('.downvote').bind('click', function(e) {
				var postID = $(e.target).parent().parent().parent().parent().parent().attr('id');
				RuneTime.Forums.downvote(postID);
			});
		}
	};
	this.ChatBox = function ChatBox() {
		this.channel = '#radio';
		this.elements = {};
		this.URL = {};
		this.times = {};
		this.Panels = null;
		this.updateTimeout = null;
		this.messages = [];
		this.lastId = 0;
		this.getStart = function getStart() {
			$(RuneTime.ChatBox.elements.messages).html('');
			var data = {
				time: this.times.loadedAt,
				channel: this.channel
			};
			var messages = RuneTime.Utilities.postAJAX('chat/start', data);
			messages.done(function(messages) {
				messages = $.parseJSON(messages);
				$.each(messages, function (index, value) {
					RuneTime.ChatBox.addMessage(value);
				});
			});
		};
		this.addMessage = function addMessage(message) {
			this.lastId = message.id;
			this.messages.push(message);
			this.times.lastActivity = RuneTime.Utilities.currentTime();
			this.displayMessages();
		};
		this.displayMessages = function displayMessages() {
			var startingPoint = $(this.messages).size()-20;
			var messages = $(this.messages).slice(startingPoint);
			$(this.elements.messages).html('');
			$.each(messages, function(index, message) {
				var html ="";
				html += "<div id='" + message.uuid + "' class='msg'>";
				html += "<time class='pull-right' data-ts='" + message.created_at + "'>";
				html += RuneTime.Utilities.timeAgo(message.created_at);
				html += "</time>";
				html += "<p>";
				html += "<a onclick='RuneTime.ChatBox.nameClick();'>" + message.author_name + "</a>: " + message.contents_parsed;
				html += "</p>";
				html += "</div>";
				$(RuneTime.ChatBox.elements.messages).prepend(html);
			});
		};
		this.submitMessage = function submitMessage() {
			var contents = $(this.elements.message).val(),
				message,
				response;
			message = {
				contents: contents,
				channel: this.channel
			};
			response = RuneTime.Utilities.postAJAX(this.URL.postMessage, message);
			response.done(function(response) {
				response = $.parseJSON(response);
				RuneTime.ChatBox.update();
				if(response.sent === true) {
					$(RuneTime.ChatBox.elements.message).val('');
					$(RuneTime.ChatBox.elements.message).toggleClass('message-sent');
					setTimeout(function () {
						$(RuneTime.ChatBox.elements.message).toggleClass('message-sent');
					}, 1500);
				}
			});
		};
		this.update = function update() {
			var delta = RuneTime.Utilities.currentTime() - this.times.lastRefresh;
			var data = {
				id: this.lastId,
				channel: this.channel
			};
			var response = RuneTime.Utilities.postAJAX(this.URL.getUpdate, data);
			response.done(function(response) {
				response = $.parseJSON(response);
				RuneTime.ChatBox.times.lastRefresh = RuneTime.Utilities.currentTime();
				$.each(response, function (index, value) {
					RuneTime.ChatBox.addMessage(value);
				});
				clearTimeout(RuneTime.ChatBox.updateTimeout);
				RuneTime.ChatBox.updateTimeout = setTimeout(function () {
					RuneTime.ChatBox.update();
				}, 5500);
			});
		};
		this.updateTimeAgo = function updateTimeAgo() {
			var messages = $(this.elements.messages).find('.msg');
			$.each(messages, function (index, value) {
				var timestamp = $(value).find('time').attr('data-ts');
				$(value).find('time').html(RuneTime.Utilities.timeAgo(timestamp));
			});
			setTimeout(function () {
				RuneTime.ChatBox.updateTimeAgo();
			}, 1000);
		};
		this.switchChannel = function switchChannel(name) {
			var data,
				response;
			data = {
				channel: name
			};
			response = RuneTime.Utilities.postAJAX('/chat/channels/check', data);
			response.done(function(response) {
				response = $.parseJSON(response);
				if(response.valid) {
					RuneTime.ChatBox.channel = name;
					RuneTime.ChatBox.getStart();
				} else {
					console.log('error');
				}
			});
		};
		this.Panels = function Panels() {
			this.chat = function chat() {
				var contents = "";
				contents += "<div id='chatbox-messages'></div>";
				contents += "<div id='chatbox-actions'>";
				contents += "<a href='/transparency/markdown' target='_blank' id='chatbox-markdown'>Markdown</a>";
				contents += "<a id='chatbox-channels'>Channels</a>";
				contents += "</div>";
				contents += "<input type='text' id='chatbox-message' />";
				$(RuneTime.ChatBox.elements.chatbox).html(contents);
			};
			this.channels = function channels() {
				var response = RuneTime.Utilities.getAJAX('/chat/channels');
				response.done(function(response) {
					var contents = "";
					response = $.parseJSON(response);
					contents += "<div id='chatbox-popup-channels'>";
					contents += "<button type='button' class='close' onclick='RuneTime.ChatBox.Panels.close();'>Close <span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>";
					contents += "<h3>Channels</h3>";
					contents += "<p class='holo-text'>Currently on <b>#" + RuneTime.ChatBox.channel + "</b></p>";
					$.each(response, function (index, value) {
						contents += "<a onclick=\"RuneTime.ChatBox.switchChannel('" + value.name + "');\">#" + value.name + "</a><br />";
						contents += "<span class='holo-text-secondary'>" + value.messages + " messages</span><br />";
						contents += "<span class='holo-text-secondary'>Last active " + RuneTime.Utilities.timeAgo(value.last_message) + "</span><br />";
					});
					contents += "</div>";
					$(RuneTime.ChatBox.elements.messages).html(contents);
				});
			};
			this.close = function close() {
				RuneTime.ChatBox.getStart();
			};
		};
		this.setup = function setup(channel) {
			this.Panels = new this.Panels();
			this.channel = channel;
			this.elements.chatbox = '#chatbox';
			this.elements.messages = '#chatbox-messages';
			this.elements.actions = '#chatbox-actions';
			this.elements.channels = '#chatbox-channels';
			this.elements.message = '#chatbox-message';
			this.URL.postMessage = '/chat/post/message';
			this.URL.getUpdate = '/chat/update';
			this.URL.getStart = '/chat/start';
			this.URL.postStatusChange = '/chat/post/status/change';
			this.times.lastActivity = RuneTime.Utilities.currentTime();
			this.times.lastRefresh = RuneTime.Utilities.currentTime();
			this.times.loadedAt = RuneTime.Utilities.currentTime();
			this.Panels.chat();
			this.getStart();
			$(this.elements.message).keypress(function (e) {
				if(e.which === 13)
					RuneTime.ChatBox.submitMessage();
			});
			$(this.elements.channels).bind('click', function () {
				RuneTime.ChatBox.Panels.channels();
			});
			setTimeout(function () {
				RuneTime.ChatBox.update();
			}, 5000);
			setTimeout(function () {
				RuneTime.ChatBox.updateTimeAgo();
			}, 1000);
		};
	};
	this.CombatCalculator = function CombatCalculator() {
		this.clicks = {};
		this.generate = {};
		this.inputs = {};
		this.other = {};
		this.paths = {};
		this.getLevels = function getLevels() {
			var name = $(this.other.name).val(),
				data = { rsn: name},
				levels = RuneTime.Utilities.postAJAX(this.paths.loadCombat, data)
			levels.done(function(levels) {
				levels = $.parseJSON(levels);
				$(RuneTime.CombatCalculator.inputs.attack).val(levels.attack);
				$(RuneTime.CombatCalculator.inputs.defence).val(levels.defence);
				$(RuneTime.CombatCalculator.inputs.strength).val(levels.strength);
				$(RuneTime.CombatCalculator.inputs.constitution).val(levels.constitution);
				$(RuneTime.CombatCalculator.inputs.ranged).val(levels.ranged);
				$(RuneTime.CombatCalculator.inputs.prayer).val(levels.prayer);
				$(RuneTime.CombatCalculator.inputs.magic).val(levels.magic);
				$(RuneTime.CombatCalculator.inputs.summoning).val(levels.summoning);
				RuneTime.CombatCalculator.updateLevel();
			});
		};
		this.updateLevel = function updateLevel() {
			var level = 0;
			var attacks = Math.ceil(this.val('attack') + this.val('strength'), 2 * this.val('magic'), 2 * this.val('ranged'));
			var defences = this.val('defence') + this.val('constitution');
			var other = (.5 * this.val('prayer')) + (.5 * this.val('summoning'));
			level = Math.floor((1/4) * (
				(13/10) * attacks + defences + other
			));
			$(RuneTime.CombatCalculator.generate.level).html(level);
		};
		this.val = function val(name) {
			return parseInt($("[rt-data='combat.calculator:" + name + "']").val());
		};
		this.setup = function setup() {
			this.paths = {
				loadCombat: '/calculators/combat/load'
			};
			this.clicks = {
				submit: "[rt-data='combat.calculator:submit']"
			};
			this.other = {
				name: "[rt-data='combat.calculator:name']"
			};
			this.inputs = {
				attack: "[rt-data='combat.calculator:attack']",
				defence: "[rt-data='combat.calculator:defence']",
				strength: "[rt-data='combat.calculator:strength']",
				constitution: "[rt-data='combat.calculator:constitution']",
				ranged: "[rt-data='combat.calculator:ranged']",
				prayer: "[rt-data='combat.calculator:prayer']",
				magic: "[rt-data='combat.calculator:magic']",
				summoning: "[rt-data='combat.calculator:summoning']"
			};
			this.generate = {
				level: "[rt-data='combat.calculator:level']"
			};
			$(this.inputs.attack).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.defence).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.strength).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.constitution).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.ranged).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.prayer).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.magic).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.inputs.summoning).keyup(function() {
				setTimeout(function() {
					RuneTime.CombatCalculator.updateLevel();
				}, 25);
			});
			$(this.clicks.submit).click(function() {
				RuneTime.CombatCalculator.getLevels();
			});
		};
	};
	this.SignupForm = function SignupForm() {
		this.displayName = 'display_name';
		this.email = 'email';
		this.password = 'password';
		this.password2 = 'password2';
		this.securityCheck = 'security';
		this.checkAvailability = function checkAvailability(field) {
			var val,
				url,
				available;
			val = $('#' + field).val();
			if(val.length === 0)
				return false;
			url = '/get/signup/' + field;
			if(field === "display_name") {
				available = RuneTime.Utilities.postAJAX(url, {display_name: val});
			} else if(field === "email") {
				available = RuneTime.Utilities.postAJAX(url, {email: val});
			}
			available.done(function(available) {
				available = $.parseJSON(available);
				if(available.available === true) {
					$('#signup-' + field).
						removeClass('has-error').
						addClass('has-success').
						find('.col-lg-10').
						find('.help-block').
						removeClass('show').
						addClass('hidden').
						parent().
						find('.glyphicon-ok').
						removeClass('hidden').
						addClass('show').
						parent().
						find('.glyphicon-remove').
						removeClass('show').
						addClass('hidden');
					return true;
				} else {
					$('#signup-' + field).
						removeClass('has-success').
						addClass('has-error').
						find('.col-lg-10').
						find('.help-block').
						removeClass('hidden').
						addClass('show').
						parent().
						find('.glyphicon-remove').
						removeClass('hidden').
						addClass('show').
						parent().
						find('.glyphicon-ok').
						removeClass('show').
						addClass('hidden');
					return false;
				}
			});
		};
		this.checkPassword = function checkPassword() {
			var v1 = $('#' + this.password).val(),
				v2 = $('#' + this.password2).val();
			if(v2.length > 0) {
				if(v1 === v2) {
					this.toggleFeedback('password', true);
					this.toggleFeedback('password2', true);
					return true;
				} else {
					this.toggleFeedback('password', false);
					this.toggleFeedback('password2', false);
					return false;
				}
			}
		};
		this.checkSecurity = function checkSecurity() {
			var sliderVal = $('#' + this.securityCheck).val();
			if(sliderVal <= 10) {
				$('form button').removeAttr('disabled');
				$('form .text-danger').css({
					display: 'none'
				});
			} else if(sliderVal > 10) {
				$('form button').attr('disabled', 'disabled');
				$('form .text-danger').css({
					display: 'block'
				});
			}
		};
		this.submit = function submit(e) {
			var username = this.checkAvailability('username'),
				email = this.checkAvailability('email'),
				pass = this.checkPassword();
			if(username === true && email === true && pass === true) {
				return true;
			} else {
				e.preventDefault();
			}
		};
		this.setup = function setup() {
			var stoppedTypingDisplayName,
				stoppedTypingEmail,
				stoppedTypingPassword,
				timeout = 500;
			$('#' + this.displayName).bind('input', function () {
				if(stoppedTypingDisplayName) {
					clearTimeout(stoppedTypingDisplayName);
				}
				stoppedTypingDisplayName = setTimeout(function () {
					RuneTime.FormSignup.checkAvailability('display_name');
				}, timeout);
			});
			$('#' + this.email).bind('input', function () {
				if(stoppedTypingEmail) {
					clearTimeout(stoppedTypingEmail);
				}
				stoppedTypingEmail = setTimeout(function () {
					RuneTime.FormSignup.checkAvailability('email');
				}, timeout);
			});
			$('#' + this.password).bind('input', function () {
				if(stoppedTypingPassword) {
					clearTimeout(stoppedTypingPassword);
				}
				stoppedTypingPassword = setTimeout(function () {
					RuneTime.FormSignup.checkPassword();
				}, timeout);
			});
			$('#' + this.password2).bind('input', function () {
				if(stoppedTypingPassword) {
					clearTimeout(stoppedTypingPassword);
				}
				stoppedTypingPassword = setTimeout(function () {
					RuneTime.FormSignup.checkPassword();
				}, timeout);
			});
			$('#' + this.securityCheck).bind('change', function () {
				RuneTime.FormSignup.checkSecurity();
			});
			$('form').submit(function (e) {
				RuneTime.FormSignup.submit(e);
			});
		};
		this.toggleFeedback = function toggleFeedback(field, status) {
			if(status === true) {
				$('#signup-' + field).
					removeClass('has-error').
					addClass('has-success').
					find('.col-lg-10').
					find('.glyphicon-ok').
					removeClass('hidden').
					addClass('show').
					parent().
					find('.glyphicon-remove').
					removeClass('show').
					addClass('hidden').
					parent().
					find('.help-block').
					removeClass('show').
					addClass('hidden');
			} else {
				$('#signup-' + field).
					removeClass('has-success').
					addClass('has-error').
					find('.col-lg-10').
					find('.glyphicon-remove').
					removeClass('hidden').
					addClass('show').
					parent().
					find('.glyphicon-ok').
					removeClass('show').
					addClass('hidden').
					parent().
					find('.help-block').
					removeClass('hidden').
					addClass('show');
			}
		};
	};
	this.Radio = function Radio() {
		this.status = false;
		this.statusClosed = '';
		this.statusOpen = '';
		this.URL = '';
		this.varMessage = '';
		this.varStatus = '';
		this.popup = null;
		this.closeRadio = function closeRadio() {
			this.popup.close();
			$(this.varMessage).html(this.statusClosed);
			this.status = false;
			$(this.varStatus).
				removeClass('text-success').
				addClass('text-danger').
				html("<i id='power-button' class='fa fa-power-off'></i>Off");
		};
		this.openRadio = function openRadio() {
			this.popup = window.open(this.URL, 'RuneTime Radio', 'width=389,height=359');
			this.status = true;
			$(this.varMessage).html(this.statusOpen);
			$(this.varStatus).
				removeClass('text-danger').
				addClass('text-success').
				html("<i id='power-button' class='fa fa-power-off'></i>On");
			var pollTimer = window.setInterval(function () {
				if(Radio.popup.closed !== false) {
					window.clearInterval(pollTimer);
					Radio.closeRadio();
				}
			}, 1000);
		};
		this.openHistory = function openHistory() {
			var history = RuneTime.Utilities.getAJAX('radio/history');
			history.done(function(history) {
				history = $.parseJSON(history);
				var music = null,
					html = "<table class='table'><thead><tr><td>Time</td><td>Artist</td><td>Name</td></tr></thead><tbody>";
				for(var x = 0, y = history.length; x < y; x++) {
					music = history[x];
					html += "<tr><td>" + RuneTime.Utilities.timeAgo(music.created_at) + "</td><td> " + music.artist + "</td><td>" + music.song + "</td></tr>";
				}
				html += "</tbody></table>";
				RuneTime.Radio.openPull(html);
			});
		};
		this.openTimetable = function openHistory() {
			var timetable = RuneTime.Utilities.getAJAX('radio/timetable');
			timetable.done(function(timetable) {
				timetable = $.parseJSON(timetable);
				var html = "<table class='table text-center'><thead><tr><td>&nbsp;</td><td>Monday</td><td>Tuesday</td><td>Wednesday</td><td>Thursday</td><td>Friday</td><td>Saturday</td><td>Sunday</td></tr></thead><tbody>";
				for(var x = 0, y = 23; x <= y; x++) {
					html += "<tr><td>" + x + ":00</td>";
					for(var i = 0, j = 6; i <= j; i++) {
						html += "<td>";
						if(timetable[i] !== undefined && timetable[i][x] !== undefined) {
							html += timetable[i][x];
						} else {
							html += "&nbsp;";
						}
						html += "</td>";
					}
					html += "</tr>";
				}
				html += "</tbody></table>";
				RuneTime.Radio.openPull(html);
			});
		};
		this.openRequest = function openRequest() {
			var request = RuneTime.Utilities.getAJAX('radio/request/song');
			request.done(function(request) {
				request = $.parseJSON(request);
				var html = "";
				if(request.response === true) {
					html += "<form role='form'><div class='form-group'><label for='request-artist'>Artist Name</label><input type='text' id='request-artist' class='form-control' name='request-artist' placeholder='Artist Name' required /></div><div class='form-group'><label for='request-name'>Song Name</label><input type='text' id='request-name' class='form-control' name='request-name' placeholder='Song Name' required /></div><div class='form-group'><p id='request-button' class='btn btn-primary'>Request</p></div></form>";
					RuneTime.Radio.openPull(html);
				} else {
					html += "<p class='text-danger'>You must be logged in to request a song from the DJ.</p>";
					RuneTime.Radio.openPull(html);
				}
			});
			setTimeout(function () {
				$('#request-button').click(function () {
					RuneTime.Radio.sendRequest();
				});
			}, 3000);
		};
		this.sendRequest = function sendRequest() {
			var data = {
					'artist': document.getElementById('request-artist').value,
					'name': document.getElementById('request-name').value
				},
				contents;
			contents = RuneTime.Utilities.postAJAX('radio/request/song', data);
			contents.done(function(contents) {
				contents = $.parseJSON(contents);
				var html = "";
				if(contents.sent === true) {
					html = "<p class='text-success'>Your request has been sent to the DJ</p>";
				} else {
					html = "<p class='text-danger'>There was an error while processing your request.  Try again?";
				}
				$('#pull-contents').html(html);
			});
			this.hidePull();
			this.update();
		};
		this.openPull = function openPull(contents) {
			$('#pull-contents').html(contents);
			$('#radio-pull').removeClass('hidden').
				css({
					width: '50%'
				});
			$('#radio-options').css({
				width: '50%'
			});
		};
		this.hidePull = function hidePull() {
			$('#pull-contents').html('&nbsp;');
			$('#radio-pull').width('').
				addClass('hidden').
				css({
					width: '0%'
				});
			$('#radio-options').width('').
				css({
					width: '100%'
				});
		};
		this.update = function update() {
			$('#requests-user-current').html('');
			var update = RuneTime.Utilities.getAJAX('radio/update');
			update.done(function(update) {
				update = $.parseJSON(update);
				var requestsHTML = "";
				$('#radio-song-name').html(update['song']['name']);
				$('#radio-song-artist').html(update['song']['artist']);
				if(update['dj'] !== null && update['dj'] !== '') {
					$('#radio-dj').html("DJ " + update['dj']);
				} else {
					$('#radio-dj').html("Auto DJ");
				}
				if(update['message'] !== '') {
					$("[rt-data='radio:message.contents']").html(update['message']);
				} else {
					$("[rt-data='radio:message.contents']").html("Auto DJ is currently on air");
				}
				for(var x = 0, y = update['requests'].length; x < y; x++) {
					var request = update['requests'][x];
					if(request.status == 0) {
						requestsHTML += "<p>";
					} else if(request.status == 1) {
						requestsHTML += "<p class='text-success'>";
					} else if(request.status == 2) {
						requestsHTML += "<p class='text-warning'>";
					}
					requestsHTML += request.song_name + " by " + request.song_artist;
					requestsHTML += "</p>";
				}
				$('#requests-user-current').html(requestsHTML);
				setTimeout(function() {
					RuneTime.Radio.update();
				}, 30000);
			});
		};
		this.setup = function setup() {
			this.URL = 'http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386';
			this.statusClosed = 'to listen to RuneTime Radio!';
			this.statusOpen = 'to close RuneTime Radio';
			this.varMessage = '#radio-message';
			this.varStatus = '#radio-status';
			RuneTime.Radio.update();
			$('#radio-link').click(function() {
				if(!RuneTime.Radio.status) {
					RuneTime.Radio.openRadio();
				} else {
					RuneTime.Radio.closeRadio();
				}
			});
			$('#radio-history').click(function() {
				RuneTime.Radio.openHistory();
			});
			$('#radio-request').click(function() {
				RuneTime.Radio.openRequest();
			});
			$('#radio-timetable').click(function() {
				RuneTime.Radio.openTimetable();
			});
			$('#request-button').click(function() {
			});
			$('#pull-close').click(function() {
				RuneTime.Radio.hidePull();
			});
		};
	};
	this.Calculator = function Calculators() {
		this.calculator = null;
		this.elements = {};
		this.info = {};
		this.URL = {};
		this.items = {};
		this.getInfo = function getInfo() {
			var name = null,
				url = null,
				data = null,
				info = null,
				relevant = null;
			name = $(this.elements.displayName).val();
			url = this.URL.getInfo + '/' + encodeURIComponent(name);
			info = RuneTime.Utilities.getAJAX(url);
			info.done(function(info) {
				info = RuneTime.Utilities.JSONDecode(info);
				info = info.split('\n');
				relevant = info[13];
				relevant = relevant.split(',');
				RuneTime.Calculator.info.levelCurrent = relevant[1];
				RuneTime.Calculator.info.XPCurrent = relevant[2];
				$(RuneTime.Calculator.elements.currentXP).val(RuneTime.Calculator.info.XPCurrent);
				if($(RuneTime.Calculator.elements.targetLevel).val().length === 0) {
					$(RuneTime.Calculator.elements.targetLevel).val(parseInt(RuneTime.Calculator.info.levelCurrent, 10) + 1);
				}
				RuneTime.Calculator.updateCalc();
			});
		};
		this.setup = function setup(calc) {
			this.elements.displayName = '#calculator-display-name';
			this.elements.submit = '#calculator-submit';
			this.elements.currentXP = '#calculator-current-xp';
			this.elements.targetLevel = '#calculator-target-level';
			this.elements.table = '#calculator-table tbody';
			this.URL.getInfo = '/get/hiscore';
			this.URL.getCalc = '/calculators/load';
			this.info.XPCurrent = 0;
			this.info.XPTarget = 0;
			this.info.levelCurrent = 0;
			this.info.levelTarget = 0;
			this.calculator = calc;
			$(this.elements.submit).bind('click', function () {
				RuneTime.Calculator.getInfo();
			});
			this.loadCalc();
			$('#calculator-target-level').keyup(function() {
				setTimeout(function() {
					RuneTime.Calculator.updateCalc();
				}, 25);
			});
		};
		this.loadCalc = function loadCalc() {
			var data = {id: this.calculator};
			var info = RuneTime.Utilities.postAJAX(this.URL.getCalc, data);
			info.done(function(info) {
				info = RuneTime.Utilities.JSONDecode(info);
				RuneTime.Calculator.items = info;
				$.each(RuneTime.Calculator.items, function (index, value) {
					var html = "";
					html += "<tr>";
					html += "<td>" + RuneTime.Calculator.items[index].name + "</td>";
					html += "<td>" + RuneTime.Calculator.items[index].level + "</td>";
					html += "<td>" + RuneTime.Calculator.items[index].xp + "</td>";
					html += "<td>&infin;</td>";
					html += "</tr>";
					$(RuneTime.Calculator.elements.table).append(html);
				});
			});
		};
		this.calculateXP = function calculateXP(level) {
			var total = 0,
				i = 0;
			for (i = 1; i < level; i += 1) {
				total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
			}
			return Math.floor(total / 4);
		};
		this.calculateLevel = function calculateLevel(xp) {
			var total = 0,
				i = 0;
			for (i = 1; i < 120; i += 1) {
				total += Math.floor(i + 300 + Math.pow(2, i / 7));
				if(Math.floor(total / 4) > xp)
					return i;
				else if(i >= 99)
					return 99;
			}
		};
		this.updateCalc = function updateCalc() {
			var levelCurrent = 0,
				levelTarget = 0,
				xpCurrent = 0,
				xpTarget = 0,
				difference = 0,
				amount = 0;
			this.info.levelTarget = parseInt($('#calculator-target-level').val());
			console.log(this.info.levelTarget);
			this.info.XPTarget = this.calculateXP(this.info.levelTarget);
			if(this.info.XPCurrent > this.info.XPTarget)
				this.info.XPTarget = this.calculateXP(parseInt(this.info.levelCurrent, 10) + 1);
			levelCurrent = this.info.levelCurrent;
			levelTarget = this.info.levelTarget;
			xpCurrent = this.info.XPCurrent;
			xpTarget = this.info.XPTarget;
			difference = xpTarget - xpCurrent;
			$.each(this.items, function (index, value) {
				amount = Math.ceil(difference / RuneTime.Calculator.items[index].xp);
				amount = amount < 0 ? 0 : amount;
				$(RuneTime.Calculator.elements.table + ' tr:nth-child(' + (index + 1) + ') td:nth-child(4)').html(amount);

				console.log(RuneTime.Calculator.items[index].name);
				console.log(RuneTime.Calculator.items[index].level);
				console.log(levelCurrent);
				console.log(levelTarget);
				console.log(RuneTime.Calculator.items[index].level);
				console.log("\n\n\n\n\n");


				if(RuneTime.Calculator.items[index].level <= levelCurrent) {
					$(RuneTime.Calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-success');
				} else if(RuneTime.Calculator.items[index].level > levelCurrent && levelTarget >= RuneTime.Calculator.items[index].level) {
					$(RuneTime.Calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-warning');
				} else {
					$(RuneTime.Calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-danger');
				}
			});
		};
	};
	this.NameChecker = function NameChecker() {
		this.check = function check(){
			var name = null,
				data = null,
				path = null,
				details = null,
				available = false,
				nameAllowed = true,
				url = '/name/check';
			name = document.getElementById('rsn-check-field').value;
			path = url;
			data = {rsn: name};
			if(typeof(name) != "undefined") {
				if(name.length > 12) {
					nameAllowed = false;
				}
				if(name.length < 3) {
					nameAllowed = false;
				}
				if(name.substring(0, 3) === 'Mod') {
					nameAllowed = false;
				}
				var notAllowed = ['ZnVjaw==', 'c2hpdA=='];
				$.each(notAllowed, function (key, value) {
					var decode = atob(value);
					if(name.indexOf(decode) > -1) {
						nameAllowed = false;
					}
				});
				if(nameAllowed === true) {
					details = $.ajax({
						url: path,
						type: 'post',
						data: data,
						async: false
					}).responseText;
					if(details.substring(0, 6) === '<html>') {
						available = true;
					}
					if(available === true) {
						$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is available.');
						$('#rsn-availability').css({
							color: 'green',
						});
					} else {
						$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is not available.');
						$('#rsn-availability').css({
							color: 'red',
						});
					}
				} else {
					$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is not appropriate, is too long (over 12 characters), or too short (under 3 characters).');
					$('#rsn-availability').css({
						color: 'red'
					});
				}
			}
		};
	};
}
RuneTime = new RuneTime();
RuneTime.Utilities = new RuneTime.Utilities();
$(function () {
	"use strict";
	RuneTime.Forums = new RuneTime.Forums();
	RuneTime.Forums.setup();
	$('[data-toggle]').tooltip();
	$('.dropdown-toggle').dropdown();
	$('tbody.rowlink').rowlink();
	$('#top').click(function () {
		$('html, body').animate({ scrollTop: 0 }, 1000);
	});
	$(window).scroll(function () {
		var height = $('body').height(),
			scroll = $(window).scrollTop(),
			top = $('#top');
		if(scroll > height/10) {
			if(!$(top).hasClass('set-vis')) {
				$(top).fadeIn(200);
				$(top).toggleClass('set-vis');
			}
		} else {
			if($(top).hasClass('set-vis')) {
				$(top).fadeOut(200);
				$(top).toggleClass('set-vis');
			}
		}
	});
	///**
	// * Create base height of page if no scrollbar
	// */
	//var windowHeight = $(window).height(),
	//	bodyHeight = $('body').height(),
	//	pageHeight = $('#page').height(),
	//	minusPage = bodyHeight - pageHeight,
	//	newPageHeight = windowHeight - minusPage - 50;
	//if(bodyHeight < windowHeight)
	//	$('#page').height(newPageHeight);
});