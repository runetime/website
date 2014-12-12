var leaderPanel;
class LeaderPanel {
	elements: any = {};
	hooks: any = {};
	paths: any = {};
	public constructor() {
		this.elements = {
			modals: {
				ban: "#modal-temp-ban-user",
				chatbox: "#modal-clear-chatbox",
				demote: "#modal-demote-member",
				mute: "#modal-mute-user"
			},
			results: {
				good: "#modal-results-good",
				goodMessage: "[rt-hook='leader.panel:results.good.message']",
				bad: "#modal-results-bad",
				badMessage: "[rt-hook='leader.panel:results.bad.message']"
			}
		};
		this.hooks = {
			chatbox: {
				reason: "#chatbox-clear-reason",
				confirm: "[rt-hook='leader.panel:chatbox.clear']"
			},
			demote: {
				data: "[rt-hook='leader.panel:demote.data']"
			},
			mute: {
				username: "[rt-hook='leader.panel:mute.username']",
				time: "[rt-hook='leader.panel:mute.time']",
				reason: "[rt-hook='leader.panel:mute.reason']"
			},
			tempBan: {
				username: "[rt-hook='leader.panel:ban.username']",
				reason: "[rt-hook='leader.panel:ban.reason']"
			}
		};
		this.paths = {
			chatboxClear: '/staff/leader/clear-chatbox',
			demote: '/staff/leader/demote',
			mute: '/staff/leader/mute',
			tempBan: '/staff/leader/temp-ban'
		};
		this.setup();
	}

	public chatboxClear() {
		var reason = $(this.hooks.chatbox.reason).val();
		if(reason.length < 1) {
			this.error("No reason was given.");
		} else {
			var data = {
				reason: reason
			};
			var results = utilities.postAJAX(this.paths.chatboxClear, data);
			results.done(function(results: string) {
				results = $.parseJSON(results);
				if(results.done === true) {
					leaderPanel.done("The chatbox has been successfully cleared.");
				} else {
					if(results.error === -1) {
						leaderPanel.error("There was an unknown error while setting all chat messages to invisible.");
					} else {
						leaderPanel.error("There was an unknown error while clearing the chatbox.");
					}
				}
			});
		}
	}

	public demote(e: any) {
		var id = $(e.target).attr('rt-data');
		var data = {
			id: id
		};
		var results = utilities.postAJAX(this.paths.demote, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				leaderPanel.done("The user " + results.name + " was successfully demoted.");
			} else {
				if(results.error === -1) {
					leaderPanel.done("You are not a team leader and can not demote members.");
				} else if(results.error === -2) {
					leaderPanel.done("That user is not in your team.");
				} else {
					leaderPanel.done("There was unknown error.");
				}
			}
		});
	}

	private done(reason: string) {
		$.each(this.elements.modals, function(index: number, value: string) {
			$(value).modal('hide');
		});

		$(this.elements.results.good).modal('show');
		$(this.elements.results.goodMessage).html(reason);
	}

	private error(reason: string) {
		$.each(this.elements.modals, function(index: number, value: string) {
			$(value).modal('hide');
		});

		$(this.elements.results.bad).modal('show');
		$(this.elements.results.badMessage).html(reason);
	}

	private setup() {
		$(this.hooks.chatbox.confirm).click(function() {
			leaderPanel.chatboxClear();
		});
		$(this.hooks.demote.data).click(function(e: any) {
			leaderPanel.demote(e);
		});
	}
}