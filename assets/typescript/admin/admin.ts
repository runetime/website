var staffPanel;
class Admin {
	radio: AdminRadio = null;
}
class AdminRadio {
	live: AdminLive = null;
	timetable: AdminTimetable = null;
}
class AdminTimetable {
	paths: any = {};
	constructor() {
		this.paths = {
			claim: '/staff/radio/timetable'
		};
		$("[rt-data='radio.panel.timetable:update.hour']").bind('click', function(e: any) {
			admin.radio.timetable.claim(e);
		});
	}
	claim(e: any) {
		alert(1);
		var src = $(e.target).attr('rt-data2');
		var src2 = src.split(":");
		var day = src2[0],
			hour = src[1];
		var data = {
			day: day,
			hour: hour
		};
		var claim = utilities.PostAJAX(this.paths.claim, data);
		claim.done(function(claim: any) {
			claim = $.parseJSON(claim);
			if(claim.valid === true) {
				$("[rt-data2='" + claim.day + ":" + claim.hour + "']").html(claim.name);
			}
		});
	}
}
class AdminLive {
	elements: any = {};
	paths: any = {};
	constructor() {
		this.elements = {
			song: "[rt-data='radio.panel:current.song']",
			songName: "[rt-data='radio.panel:current.song.name']",
			songArtist: "[rt-data='radio.panel:current.song.artist']",
			currentMessage: "[rt-data='radio.panel:current.message']",
			requests: "[rt-data='radio.panel:requests']"
		};
		this.paths = {
			message: '/staff/radio/live/message',
			update: '/staff/radio/live/update'
		};
		this.update();
		$("[rt-data='radio.panel:message.update']").bind('click', function(e: any) {
			admin.radio.live.updateMessage($(e.target).attr('rt-data2'));
		});
	}
	update() {
		var data = utilities.getAJAX(this.paths.update);
		data.done(function(data: any) {
			data = $.parseJSON(data);
			$(admin.radio.live.elements.songName).html(data.song.name);
			$(admin.radio.live.elements.songArtist).html(data.song.artist);
			$(admin.radio.live.elements.currentMessage).html(data.song.message);
		});
		setTimeout(function() {
			admin.radio.live.update();
		}, 30000);
	}
	updateMessage(id: number) {
		var data = {
			id: id
		};
		var load = utilities.postAJAX(this.paths.message, data);
		load.done(function(load: any) {
			load = $.parseJSON(load);
			$(admin.radio.live.elements.currentMessage).html(load.message);
		});
	}
}

class StaffPanel {
	hooks: any = {};
	paths: any = {};
	public constructor() {
		this.hooks = {
			mute: {
				username: '#mute-username',
				reason: '#mute-contents',
				send: "[rt-hook='staff.panel:mute.send']"
			},
			report: {
				username: '#report-username',
				reason: '#report-contents',
				send: "[rt-hook='staff.panel:report.send']"
			},
			results: {
				good: "[rt-hook='staff.panel:results.good.message']",
				bad: "[rt-hook='staff.panel:results.bad.message']"
			}
		};
		this.paths = {
			mute: '/staff/mute',
			report: '/staff/report'
		};

		$(this.hooks.mute.send).click(function(e: any) {
			staffPanel.sendMute();
		});
		$(this.hooks.report.send).click(function(e: any) {
			staffPanel.sendReport();
		});

		this.setup();
	}

	public sendMute() {
		var data = {
			username: $(this.hooks.mute.username).val(),
			contents: $(this.hooks.mute.reason).val()
		};
		var results = utilities.postAJAX(this.paths.mute, data);
		results.done(function(results) {
			results = $.parseJSON(results);
			$('#modal-mute-user').modal('hide');
			if(results.done === true) {
				$('#modal-results-good').modal('show')
			} else {
				$('#modal-results-bad').modal('show')
			}
		});
	}

	public sendReport() {
		var data = {
			username: $(this.hooks.report.username).val(),
			contents: $(this.hooks.report.reason).val()
		};
		var results = utilities.postAJAX(this.paths.report, data);
		results.done(function(results) {
			results = $.parseJSON(results);
			$('#modal-report-user').modal('hide');
			if(results.done === true) {
				$('#modal-results-good').modal('show')
			} else {
				if(results.error === -1) {
					$(staffPanel.hooks.results.bad).html("That user does not exist.");
				} else if(results.error === -2) {
					$(staffPanel.hooks.results.bad).html("There was an error with processing the report.");
				} else {
					$(staffPanel.hooks.results.bad).html("There was an unknown error.");
				}
				$('#modal-results-bad').modal('show')
			}
		});
	}

	private setup() {
		var elements = $('.pretty-row > div');
		var count = $(elements).size();
		for(i = 1; i <= count; i+=2) {
			var left = $(".pretty-row div:nth-child(" + i + ")");
			var right = $(".pretty-row div:nth-child(" + (i + 1) + ")");
			var max = Math.max($(left).height(), $(right).height());
			$(left).height(max);
			$(right).height(max);
		}
		if(count % 2 == 0) {
			var left = $(".pretty-row div:nth-child(" + (count - 1) + ")");
			var right = $(".pretty-row div:nth-child(" + count + ")");

			$(left).css({
				'padding-bottom': 0
			});
			$(right).css({
				'padding-bottom': 0
			});
		} else {
			var left = $(".pretty-row div:nth-child(" + count + ")");
			$(left).css({
				'padding-bottom': 0
			});
		}
	}
}
var admin = new Admin();