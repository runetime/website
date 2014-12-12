var staffPanel;
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

	public error(error: number) {
		if(results.error === -1) {
			$(staffPanel.hooks.results.bad).html("That user does not exist.");
		} else if(results.error === -2) {
			$(staffPanel.hooks.results.bad).html("There was an error with processing the report.");
		} else {
			$(staffPanel.hooks.results.bad).html("There was an unknown error.");
		}
		$('#modal-results-bad').modal('show');
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
				staffPanel.error(results.error);
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
				staffPanel.error(results.error);
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