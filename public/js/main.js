/*jslint browser: true*/
/*global $, jQuery, alert*/
/*jslint devel: true */
/* jshint -W097 */
function RuneTime() {
	"use strict";
	this.FormSignup = null;
	this.Utilities = null;
	this.Utilities = function Utilities() {
		this.getAJAX = function getAJAX(path) {
			return $.ajax({
				url     : path,
				type    : 'get',
				dataType: 'html',
				async   : false
			}).responseText;
		};
		this.postAJAX = function getAJAX(path, data) {
			return $.ajax({
				url: path,
				type: 'post',
				data: data,
				async: false
			}).responseText;
		};
		this.timeAgo = function timeAgo(ts) {
			var d = new Date(),
				nowTs = Math.floor(d.getTime() / 1000),
				seconds = nowTs - ts;
			if (seconds > 2 * 24 * 3600) {
				return "a few days ago";
			}
			if (seconds > 24 * 3600) {
				return "yesterday";
			}
			if (seconds > 3600) {
				return "a few hours ago";
			}
			if (seconds > 1800) {
				return "Half an hour ago";
			}
			if (seconds > 60) {
				return Math.floor(seconds / 60) + " minutes ago";
			}
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
			if (val.length === 0) {
				return false;
			}
			url = '/get/signup/' + field;
			if (field === "display_name") {
				available = $.parseJSON(RuneTime.Utilities.postAJAX(url, {display_name: val}));
			} else if (field === "email") {
				available = $.parseJSON(RuneTime.Utilities.postAJAX(url, {email: val}));
			}
			console.log(available);
			if (available.available === true) {
				console.log('#signup-' + field);
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
		};
		this.checkPassword = function checkPassword() {
			var v1,
				v2;
			v1 = $('#' + this.password).val();
			v2 = $('#' + this.password2).val();
			if (v2.length > 0) {
				if (v1 === v2) {
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
			var sliderVal;
			sliderVal = $('#' + this.securityCheck).val();
			if (sliderVal <= 10) {
				$('form button').removeAttr('disabled');
				$('form .text-danger').css({
					display: 'none'
				});
			} else if (sliderVal > 10) {
				$('form button').attr('disabled', 'disabled');
				$('form .text-danger').css({
					display: 'block'
				});
			}
		};
		this.submit = function submit(e) {
			var username,
				email,
				pass;
			username = this.checkAvailability('username');
			email = this.checkAvailability('email');
			pass = this.checkPassword();
			if (username === true && email === true && pass === true) {
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
				if (stoppedTypingDisplayName) {
					clearTimeout(stoppedTypingDisplayName);
				}
				stoppedTypingDisplayName = setTimeout(function () {
					RuneTime.FormSignup.checkAvailability('display_name');
				}, timeout);
			});
			$('#' + this.email).bind('input', function () {
				if (stoppedTypingEmail) {
					clearTimeout(stoppedTypingEmail);
				}
				stoppedTypingEmail = setTimeout(function () {
					RuneTime.FormSignup.checkAvailability('email');
				}, timeout);
			});
			$('#' + this.password).bind('input', function () {
				if (stoppedTypingPassword) {
					clearTimeout(stoppedTypingPassword);
				}
				stoppedTypingPassword = setTimeout(function () {
					RuneTime.FormSignup.checkPassword();
				}, timeout);
			});
			$('#' + this.password2).bind('input', function () {
				if (stoppedTypingPassword) {
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
			if (status === true) {
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
		/**
		 * Whether the radio is currently opened or not
		 * @type {Boolean}
		 */
		this.status = false;
		/**
		 * The message to display when the radio is closed
		 * @type {String}
		 */
		this.statusClosed = '';
		/**
		 * The message to display when the radio is open
		 * @type {String}
		 */
		this.statusOpen = '';
		/**
		 * The string URL of where the player is.  We legally have to open a popup to it.
		 * @type {String}
		 */
		this.URL = '';
		this.varHistory = '';
		this.varMessage = '';
		this.varPull = '';
		this.varRequest = '';
		this.varSongArtist = '';
		this.varSongName = '';
		this.varStatus = '';
		this.varTimetable = '';
		/**
		 * The object of the popup so we can poll it to detect whether it is still open or not
		 * @type {Object}
		 */
		this.popup = null;
		/**
		 * Closes the palyer and sets its status to closed on the variable 'status'
		 * @return {void} 
		 */
		this.closeRadio = function closeRadio() {
			this.popup.close();
			$(this.varMessage).html(this.statusClosed);
			this.status = false;
			$(this.varStatus).
				removeClass('text-success').
				addClass('text-danger').
				html("<i id='power-button' class='fa fa-power-off'></i>Off");
		};
		/**
		 * Opens the player and sets its status to opened on the variable 'status'
		 * @return {void} 
		 */
		this.openRadio = function openRadio() {
			this.popup = window.open(this.URL, 'RuneTime Radio', 'width=389,height=359');
			this.status = true;
			$(this.varMessage).html(this.statusOpen);
			$(this.varStatus).
				removeClass('text-danger').
				addClass('text-success').
				html("<i id='power-button' class='fa fa-power-off'></i>On");
			var pollTimer = window.setInterval(function () {
				if (Radio.popup.closed !== false) {
					window.clearInterval(pollTimer);
					Radio.closeRadio();
				}
			}, 1000);
		};
		this.openHistory = function openHistory() {
			this.openPull(RuneTime.Utilities.getAJAX('radio/request/history'));
		};
		this.openTimetable = function openHistory() {
			this.openPull(RuneTime.Utilities.getAJAX('radio/request/timetable'));
		};
		this.openRequest = function openRequest() {
			setTimeout(function () {
				$('#request-button').click(function () {
					Radio.sendRequest();
				});
			}, 1500);
			this.openPull(RuneTime.Utilities.getAJAX('radio/request/song'));
		};
		this.sendRequest = function sendRequest() {
			var artist,
				name,
				contents;
			artist = document.getElementById('request-artist').value;
			name = document.getElementById('request-name').value;
			contents = RuneTime.Utilities.getAJAX('radio/send/request/' + artist + '/' + name);
			$('#pull-contents').html(contents);
			this.hidePull(2000);
			this.updateRequests();
		};
		this.openPull = function openPull(contents) {
			setTimeout(function () {
				$('#radio-pull').animate({
					width: '50%'
				}, 1000);
				$('#pull-contents').html(contents);
				$('#radio-pull').removeClass('invisible');
				$('#radio-options').animate({
					width: '50%'
				}, 1000, function () {
					$('#radio-options').
						removeClass('col-md-11').
						addClass('col-md-6');
					$('#radio-pull').
						removeClass('col-md-1').
						addClass('col-md-6');
					$('#radio-options').width('');
					$('#radio-pull').width('');
					RuneTime.Radio.sizeEqual();
				});
			}, 0);
		};
		this.hidePull = function hidePull(delay) {
			setTimeout(function () {
				$('#pull-contents').html('&nbsp;');
				$('#radio-pull').animate({
					width: '8.33%'
				}, 1000);
				$('#radio-options').animate({
					width: '91.66%'
				}, 1000, function () {
					$('#radio-options').
						removeClass('col-md-6').
						addClass('col-md-11');
					$('#radio-pull').
						removeClass('col-md-6').
						addClass('col-md-1').
						addClass('invisible');
					$('#radio-options').width('');
					$('#radio-pull').width('');
				});
			}, delay);
			this.moveShoutbox('original');
		};
		this.sizeEqual = function sizeEqual() {
			var hPull,
				hOptions;
			hPull = $('#radio-pull').height();
			hOptions = $('#radio-options').height();
			console.log(hPull);
			console.log(hOptions);
			if (hPull < hOptions) {
				$('#radio-pull').height(hOptions);
				this.moveShoutbox('original');
			} else {
				$('#radio-pull').css({
					height: ''
				});
				this.moveShoutbox('options');
			}
		};
		this.moveShoutbox = function moveShoutbox(to) {
			if (to === "options") {
				var contents;
				$('#shoutbox-holder-radio').css({
					display: 'block'
				});
				contents = $('#shoutbox-holder').html();
				$('#shoutbox-holder-radio').html(contents);
				$('#shoutbox-holder').css({
					display: 'none'
				});
			}
			if (to === "original") {
				$('#shoutbox-holder-radio').css({
					display: 'none'
				});
				$('#shoutbox-holder').css({
					display: 'block'
				});
			}
		};
		this.updateRequests = function updateRequests() {
			var userRequests;
			userRequests = $.parseJSON(RuneTime.Utilities.getAJAX('radio/requests/current'));
			setTimeout(function () {
				Radio.updateRequests();
			}, 30000);
			$('#requests-user-current').html('');
			$.each(userRequests, function (index, value) {
				var status;
				if (value.status === 1) {
					status = "text-success";
				} else if (value.status === 2) {
					status = "text-danger";
				}
				console.log(value);
				$('#requests-user-current').
					append("<p class='" + status + "'>" + value.song_artist + " - " + value.song_name + "</p><p class='" + status + "'><small>" + RuneTime.Utilities.timeAgo(value.time_sent) + "</small></p>");
			});
		};
		/**
		 * Declares all fields' contents
		 * @return {void} 
		 */
		this.setup = function setup() {
			var hPull,
				hOptions;
			this.URL = 'http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386';
			this.statusClosed = 'to listen to RuneTime Radio!';
			this.statusOpen = 'to close RuneTime Radio';
			this.varHistory = '#radio-history';
			this.varMessage = '#radio-message';
			this.varPull = '#radio-pull';
			this.varRequest = '#radio-request';
			this.varSongArtist = '#radio-song-artist';
			this.varSongName = '#radio-song-name';
			this.varStatus = '#radio-status';
			this.varTimetable = '#radio-timetable';
			hPull = $('#pull-height').height();
			hOptions = $('#pull-options').height();
			if (hPull < hOptions) {
				$('#pull-height').height(hOptions);
			}
			RuneTime.Radio.updateRequests();
			$('#radio-link').click(function () {
				if (!RuneTime.Radio.status) {
					RuneTime.Radio.openRadio();
				} else {
					RuneTime.Radio.closeRadio();
				}
			});
			$('#radio-history').click(function () {
				RuneTime.Radio.openHistory();
			});
			$('#radio-request').click(function () {
				RuneTime.Radio.openRequest();
			});
			$('#radio-timetable').click(function () {
				RuneTime.Radio.openTimetable();
			});
			$('#request-button').click(function () {
			});
			$('#pull-close').click(function () {
				RuneTime.Radio.hidePull(0);
				RuneTime.Radio.sizeEqual();
				setTimeout(function () {
					RuneTime.Radio.moveShoutbox('original');
				}, 1100);
			});
		};
	};
}
RuneTime = new RuneTime();
RuneTime.Utilities = new RuneTime.Utilities();