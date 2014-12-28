var userPanel;
class AdminUserPanel {
	elements: any = {};
	hooks: any = {};
	paths: any = {};
	public constructor() {
		this.elements = {
			award: {
				id: "#award-add-id",
				username: "#award-add-username"
			},
			ban: {
				// WIP
			},
			banIp: {
				address: "#ip-ban-address",
				reason: "#ip-ban-reason"
			},
			chatbox: {
				reason: "#chatbox-remove-reason",
				username: "#chatbox-remove-username"
			},
			modals: {
				award: "#modal-award-add",
				ban: "#modal-ban",
				chatboxRemove: "#modal-chatbox-remove",
				ipBan: "#modal-ip-ban",
				mute: "#modal-mute-user",
				postsRemove: "#modal-posts-remove"
			},
			modalResults: {
				bad: "#modal-results-bad",
				good: "#modal-results-good"
			},
			mute: {
				reason: "#mute-reason",
				time: "#mute-time",
				username: "#mute-username"
			},
			posts: {
				reason: "#posts-remove-reason",
				username: "#posts-remove-username"
			},
			search: {
				list: "#admin-user-list",
				name: "#admin-user-search"
			}
		};
		this.hooks = {
			listing: {
				awardAdd: "[rt-hook='admin.panel:user.award.add']",
				chatboxRemove: "[rt-hook='admin.panel:user.chatbox.remove']",
				postsRemove: "[rt-hook='admin.panel:user.posts.remove']",
				userBan: "[rt-hook='admin.panel:user.ban']",
				userBanPermanent: "[rt-hook='admin.panel:user.ban.permanent']",
				userMute: "[rt-hook='admin.panel:user.mute']"
			},
			modals: {
				results: {
					bad: "[rt-hook='modal:bad.message']",
					good: "[rt-hook='modal:good.message']"
				}
			},
			search: {
				submit: "[rt-hook='admin.panel:user.search']"
			},
			submit: {
				award: "[rt-hook='admin.panel:user.award.add.confirm']",
				chatbox: "[rt-hook='admin.panel:user.chatbox.remove.confirm']",
				ip: "[rt-hook='admin.panel:ip.ban.confirm']",
				mute: "[rt-hook='leader.panel:mute.submit']",
				posts: "[rt-hook='admin.panel:user.posts.remove.confirm']"
			}
		};
		this.paths = {
			award: '/staff/administrator/users/award-add',
			awardList: '/api/v1/awards',
			chatboxRemove: '/staff/administrator/users/chatbox-remove',
			ip: '/staff/administrator/ip-ban',
			mute: '/staff/leader/mute',
			posts: '/staff/administrator/users/forum-posts',
			search: '/staff/administrator/users/search',
			username: '/api/v1/user'
		};

		$(this.hooks.search.submit).click(function() {
			userPanel.search();
		});

		$(this.hooks.submit.award).click(function() {
			userPanel.awardSubmit();
		});

		$(this.hooks.submit.chatbox).click(function() {
			userPanel.chatboxSubmit();
		});

		$(this.hooks.submit.ip).click(function() {
			userPanel.banIpSubmit();
		});

		$(this.hooks.submit.posts).click(function() {
			userPanel.postsSubmit();
		});

		$(this.hooks.submit.mute).click(function() {
			userPanel.muteSubmit();
		});
	}

	public addEvents() {
		$(this.hooks.listing.awardAdd).click(function(e: any) {
			var id = $(e.target).parent().parent().parent().attr('rt-data');
			var user = userPanel.getUsernameById(id);
			user.done(function(user: string) {
				user = $.parseJSON(user);
				$(userPanel.elements.award.username).val(user.display_name);
			});
			userPanel.getAwards();

			$(userPanel.elements.modals.award).modal('show');
		});
		$(this.hooks.listing.chatboxRemove).click(function(e: any) {
			var id = $(e.target).parent().parent().parent().attr('rt-data');
			var user = userPanel.getUsernameById(id);
			user.done(function(user: string) {
				user = $.parseJSON(user);
				$(userPanel.elements.chatbox.username).val(user.display_name);
			});

			$(userPanel.elements.modals.chatboxRemove).modal('show');
		});
		$(this.hooks.listing.postsRemove).click(function(e: any) {
			var id = $(e.target).parent().parent().parent().attr('rt-data');
			var user = userPanel.getUsernameById(id);
			user.done(function(user: string) {
				user = $.parseJSON(user);
				$(userPanel.elements.posts.username).val(user.display_name);
			});

			$(userPanel.elements.modals.postsRemove).modal('show');
		});
		$(this.hooks.listing.userBan).click(function(e: any) {
			var id = $(e.target).parent().parent().parent().attr('rt-data');
			var user = userPanel.getUsernameById(id);
			user.done(function(user: string) {
				user = $.parseJSON(user);
				$(userPanel.elements.ban.username).val(user.display_name);
			});

			$(userPanel.elements.modals.ban).modal('show');
		});
		$(this.hooks.listing.userBanPermanent).click(function(e: any) {
			$(userPanel.elements.modals.ipBan).modal('show');
		});
		$(this.hooks.listing.userMute).click(function(e: any) {
			var id = $(e.target).parent().parent().parent().attr('rt-data');
			var user = userPanel.getUsernameById(id);
			user.done(function(user: string) {
				user = $.parseJSON(user);
				$(userPanel.elements.mute.username).val(user.display_name);
			});

			$(userPanel.elements.modals.mute).modal('show');
		});
	}

	public awardSubmit() {
		var id = $(this.elements.award.id).val(),
			username = $(this.elements.award.username).val();
		if(username.length === 0) {
			return this.error("You must fill out the username field.");
		}
		var data = {
			id: id,
			username: username
		};
		var results = utilities.postAJAX(this.paths.award, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				userPanel.done("The award " + results.name + " has been adding to the account <b>" + results.user + "</b>.")
			} else {
				userPanel.error("There was an unknown error while adding an award to that user's account.");
			}
		});
	}

	public banIpSubmit() {
		var address = $(this.elements.banIp.address).val(),
			reason = $(this.elements.banIp.reason).val();
		if(address.length <= 7) {
			return this.error("The IP is not valid.");
		}
		var data = {
			ip: address,
			reason: reason
		};
		var results = utilities.postAJAX(this.paths.ip, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				userPanel.done("The IP " + results.ip_address + " was successfully banned.");
			} else {
				userPanel.error("There was an unknown error banning the IP " + results.ip_address);
			}
		});
	}

	public chatboxSubmit() {
		var username = $(this.elements.chatbox.username).val(),
			reason = $(this.elements.chatbox.reason).val();
		if(username.length === 0) {
			return this.error("The username field must be completed.");
		}

		var data = {
			username: username,
			reason: reason
		};
		var results = utilities.postAJAX(this.paths.chatboxRemove, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				userPanel.done("The chatbox messages by " + results.name + " have successfully been hidden.");
			} else {
				userPanel.error("There was an unknown error.");
			}
		});
	}

	public done(message: string) {
		$.each(this.elements.modals, function() {
			$(this).modal('hide');
		});
		$(this.elements.modalResults.good).modal('show');
		$(this.hooks.modals.results.good).html(message);
	}

	public error(message: string) {
		$.each(this.elements.modals, function(index: number, modal: any) {
			$(modal).modal('hide');
		});
		$(this.elements.modalResults.bad).modal('show');
		$(this.hooks.modals.results.bad).html(message);
	}

	public getAwards() {
		var results = utilities.getAJAX(this.paths.awardList);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			$.each(results, function(index: number, value: string) {
				var html = "<option value='" + value.id + "'>" + value.name + "</option";
				$(userPanel.elements.award.id).append(html);
			});
			$(userPanel.elements.award.id).children().first().attr('selected', 'selected');
		});
	}

	public getUsernameById(id: number) {
		var data = {
			id: id
		};
		return utilities.postAJAX(this.paths.username, data);
	}

	public muteSubmit() {
		var username = $(this.elements.mute.username).val(),
			time = $(this.elements.mute.time).val(),
			reason = $(this.elements.mute.reason).val();
		if(username.length === 0 || time.length === 0 || reason.length === 0) {
			return this.error("All of the fields are required.");
		}
		
		var data = {
			username: username,
			time: time,
			reason: reason
		};
		var results = utilities.postAJAX(this.paths.mute, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);

			if(results.done === true) {
				userPanel.done("The user " + results.name + " has been successfully muted.");
			} else {
				if(results.error === -1) {
					userPanel.error("That user does not exist.");
				} else if(results.error === -2) {
					userPanel.error("There was an unknown error while muting that user.");
				} else if(results.error === -3) {
					userPanel.error("You did not write a 'infinite' but did not write a number either.");
				} else {
					userPanel.error("There was an unknown error while muting that user.");
				}
			}
		});
	}

	public postsSubmit() {
		var username = $(this.elements.posts.username).val(),
			reason = $(this.elements.posts.reason).val();
		var data = {
			username: username,
			reason: reason
		};
		var results = utilities.postAJAX(this.paths.posts, data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				userPanel.done("The posts by " + results.name + " have been successfully hidden.");
			} else {
				userPanel.error("There was an error while hiding the posts by " + results.name + ".");
			}
		});
	}

	public search() {
		var name = $(this.elements.search.name).val();
		if(name.length === 0) {
			this.error("The name must be entered.");
		} else {
			var data = {
				name: name
			};
			var results = utilities.postAJAX(this.paths.search, data);
			results.done(function(results: string) {
				$('#admin-user-list').html('');
				results = $.parseJSON(results);
				$.each(results, function(index: number, user: any) {
					var html = "<div class='col-xs-12 row'>";
					html += "<div class='col-xs-3 col-md-2 col-lg-1'>";
					html += "<img src='/img/forums/photos/" + user.id + ".png' class='img-responsive img-center' />";
					html += "</div>";
					html += "<div class='col-xs-9 col-mg-10 col-lg-11'>";
					html += "<div class='clearfix'>";
					html += "<div class='pull-left'>";
					html += "<a href='/profile/" + user.id + "-user'>" + user.display_name + "</a>";
					html += "</div>";
					html += "<div class='pull-right'>";
					html += "<ul class='list-inline' rt-data='" + user.id + "'>";
					html += "<li><a rt-hook='admin.panel:user.posts.remove' title='Remove Forum Posts'><i class='fa fa-folder fa-2x text-warning'></i></a></li>";
					html += "<li><a rt-hook='admin.panel:user.chatbox.remove' title='Remove Chatbox Messages'><i class='fa fa-comments fa-2x text-warning'></i></a></li>";
					html += "<li><a rt-hook='admin.panel:user.mute' title='Mute User'><i class='fa fa-comments fa-2x holo-text-secondary'></i></a></li>";
					html += "<li><a rt-hook='admin.panel:user.ban' title='Ban User'><i class='fa fa-remove fa-2x text-warning'></i></a></li>";
					html += "<li><a rt-hook='admin.panel:user.ban.permanent' title='IP Ban User'><i class='fa fa-remove fa-2x text-danger'></i></a></li>";
					html += "<li><a rt-hook='admin.panel:user.award.add' title='Add Award'><i class='fa fa-thumbs-o-up fa-2x text-info'></i></a></li>";
					html += "<li><a href='/staff/administrator/users/" + user.id + "-view' title='Edit User'><i class='fa fa-search fa-2x text-info'></i></a></li>";
					html += "</div>";
					html += "</div>";
					html += "</div>";
					html += "</div>";
					$('#admin-user-list').append(html);
				});
				userPanel.addEvents();
			});
		}
	}
}