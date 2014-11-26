class LivestreamReset {
	public hooks: any = {};
	public paths: any = {};
	public constructor() {
		this.hooks = {
			note: "[rt-hook='livestream.reset:note']",
			spinner: "[rt-hook='livestream.reset:spinner']",
			status: "[rt-hook='livestream.reset:status']"
		};
		this.paths = {
			reset: '/livestream/reset'
		};
		this.reset();
	}

	private reset() {
		var status = utilities.postAJAX(this.paths.reset, {});
		status.done(function(results: string) {
			results = utilities.JSONDecode(results);
			console.log(results);
			if(results.online === true) {
				livestreamReset.statusOnline();
			} else if(results.online === false) {
				livestreamReset.statusOffline();
			} else {
				livestreamReset.statusUnknown();
			}
			livestreamReset.spinnerRemove();
		});
	}

	public spinnerRemove() {
		$(this.hooks.spinner).css({
			opacity: 0
		});
	}

	public statusOnline() {
		$(this.hooks.status).html("online").
			removeClass().
			addClass('text-success');
	}

	public statusOffline() {
		$(this.hooks.status).html("offline").
			removeClass().
			addClass('text-danger');
	}

	public statusUnknown() {
		$(this.hooks.status).html("unknown").
			removeClass().
			addClass('text-warning');
	}
}