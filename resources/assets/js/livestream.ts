class LivestreamReset {
	public hooks: any = {};
	public paths: any = {};
	public constructor() {
		this.hooks = {
			note: "[rt-hook='livestream.recheck:note']",
			status: "[rt-hook='livestream.recheck:status']"
		};
		this.paths = {
			reset: '/livestream/reset'
		};
		this.reset();
	}
	private reset() {
		status = utilities.postAJAX(this.paths.reset, {});
		status.done(function(e: any) {
			console.log(e);
		});
	}
}