var radio;
var chatbox;
class Radio {
	elements: any = {};
	online: boolean = true;
	popup: any = null;
	status: boolean = false;
	statusClosed: string = '';
	statusOpen: string = '';
	URL: string = '';
	varMessage: string = '';
	varStatus: string = '';

	public constructor() {
		this.URL = 'http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386';
		this.statusClosed = 'to listen to RuneTime Radio!';
		this.statusOpen = 'to close RuneTime Radio';
		this.varMessage = '#radio-message';
		this.varStatus = '#radio-status';
		this.update();
		this.elements = {
			statusMessage: '#radio-status-message'
		};
		$('#radio-link').click(function() {
			if(!radio.status) {
				radio.radioOpen();
			} else {
				radio.radioClose();
			}
		});

		$('#radio-history').click(function() {
			radio.openHistory();
		});

		$('#radio-request').click(function() {
			radio.requestOpen();
		});

		$('#radio-timetable').click(function() {
			radio.openTimetable();
		});

		$('#request-button').click(function() {
		});

		$('#pull-close').click(function() {
			radio.pullHide();
		});
	}

	public openHistory() {
		var history = utilities.getAJAX('radio/history');
		history.done(function(history: string) {
			history = $.parseJSON(history);
			var music = null,
				html = "<table class='table'><thead><tr><td>Time</td><td>Artist</td><td>Name</td></tr></thead><tbody>";
			for(var x = 0, y = history.length; x < y; x++) {
				music = history[x];
				html += "<tr><td>" + utilities.timeAgo(music.created_at) + "</td><td> " + music.artist + "</td><td>" + music.song + "</td></tr>";
			}

			html += "</tbody></table>";
			radio.pullOpen(html);
		});
	}

	public openTimetable() {
		var timetable = utilities.getAJAX('radio/timetable');
		timetable.done(function(timetable: string) {
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
			radio.pullOpen(html);
		});
	}

	public onlineSettings() {
		if(this.online !== true) {
			this.radioClose();
			$(this.elements.statusMessage).html("The radio has been set offline.");
		} else {
			$(this.elements.statusMessage).html("");
		}
	}

	public pullHide() {
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
	}

	public pullOpen(contents: string) {
		$('#pull-contents').html(contents);
		$('#radio-pull').removeClass('hidden').
			css({
				width: '50%'
			});
		$('#radio-options').css({
			width: '50%'
		});
	}
	
	public radioClose() {
		if(this.popup) {
			this.popup.close();
		}

		$(this.varMessage).html(this.statusClosed);
		this.status = false;
		$(this.varStatus)
			.removeClass('text-success')
			.addClass('text-danger')
			.html("<i id='power-button' class='fa fa-power-off'></i>Off");
	}

	public radioOpen() {
		if(this.online !== true) {
			return false;
		}

		this.popup = window.open(this.URL, 'RuneTime Radio', 'width=389,height=359');
		this.status = true;
		$(this.varMessage).html(this.statusOpen);
		$(this.varStatus).
			removeClass('text-danger').
			addClass('text-success').
			html("<i id='power-button' class='fa fa-power-off'></i>On");
		var pollTimer = window.setInterval(function () {
			if(radio.popup.closed !== false) {
				window.clearInterval(pollTimer);
				radio.radioClose();
			}
		}, 1000);
	}

	public requestOpen() {
		var request = utilities.getAJAX('radio/request/song');
		request.done(function(request: string) {
			request = $.parseJSON(request);
			var html = "";
			if(request.response === 2) {
				html += "<form role='form'><div class='form-group'><label for='request-artist'>Artist Name</label><input type='text' id='request-artist' class='form-control' name='request-artist' placeholder='Artist Name' required /></div><div class='form-group'><label for='request-name'>Song Name</label><input type='text' id='request-name' class='form-control' name='request-name' placeholder='Song Name' required /></div><div class='form-group'><p id='request-button' class='btn btn-primary'>Request</p></div></form>";
			} else if(request.response === 1) {
				html += "<p class='text-warning'>Auto DJ currently does not accept song requests, sorry!";
			} else {
				html += "<p class='text-danger'>You must be logged in to request a song from the DJ.</p>";
			}

			radio.pullOpen(html);
		});

		setTimeout(function () {
			$('#request-button').click(function () {
				radio.requestSend();
			});
		}, 3000);
	}

	public requestSend() {
		var data = {
			'artist': document.getElementById('request-artist').value,
			'name': document.getElementById('request-name').value
		};
		var contents = utilities.postAJAX('radio/request/song', data);
		contents.done(function(contents: string) {
			contents = $.parseJSON(contents);
			var html = "";
			if(contents.sent === true) {
				html = "<p class='text-success'>Your request has been sent to the DJ</p>";
			} else {
				html = "<p class='text-danger'>There was an error while processing your request.  Try again?";
			}

			$('#pull-contents').html(html);
		});
		this.pullHide();
		this.update();
	}

	public update() {
		$('#requests-user-current').html('');
		var update = utilities.getAJAX('radio/update');
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

			if(update['message'] !== '' && update['message'] !== -1) {
				$("[rt-data='radio:message.contents']").html(update['message']);
			} else if(update['message'] === -1) {
				$("[rt-data='radio:message.contents']").html("DJ " + update['dj'] + " is currently on air!");
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
					requestsHTML += "<p class='text-danger'>";
				}

				requestsHTML += request.song_name + " by " + request.song_artist;
				requestsHTML += "</p>";
			}

			$('#requests-user-current').html(requestsHTML);

			radio.online = update.online;
			setTimeout(function() {
				radio.update();
			}, 30000);
			radio.onlineSettings();
		});
	}
}