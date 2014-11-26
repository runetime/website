var nameChecker;
class NameChecker {
	elements: any = {};
	notAllowed: any = [];
	paths: any = {};
	constructor() {
		this.elements = {
			availability: '#rsn-availability',
			check: '#rsn-check-field'
		};
		this.notAllowed = ['ZnVjaw==', 'c2hpdA=='];
		this.paths = {
			check: '/name/check'
		};
		$("[rt-hook='name.checker:submit']").bind('click', function(value: any) {
			nameChecker.check();
		});
	}
	check() {
		var name = $('#rsn-check-field').val();
		var checkName = this.checkName(name);
		if(checkName === 0) {
			this.unavailable("You did not enter anything.");
		} else if(checkName === 1) {
			this.unavailable("The name <b>" + name + "</b> is over 12 characters.");
		} else if(checkName === 2) {
			this.unavailable("The name <b>" + name + "</b> is under 3 characters.");
		} else if(checkName === 3) {
			this.unavailable("The name <b>" + name + "</b> starts with the word Mod.");
		} else if(checkName === 4) {
			this.unavailable("The name <b>" + name + "</b> contains a swear word.");
		} else if(checkName === 5) {
			var data = {
				rsn: name
			};
			var details = utilities.postAJAX(this.paths.check, data);
			$(this.elements.availability).html('Loading...');
			details.done(function(details: string) {
				var available = false;
				if(details.substring(0, 6) === "<html>") {
					available = true;
				}
				if(available === true) {
					nameChecker.available(name);
				} else {
					nameChecker.unavailable('The Runescape name <b>' + name + '</b> is not available.');
				}
			});
		}
	}
	available(name: string) {
		$(nameChecker.elements.availability).html('The RuneScape name <b>' + name + '</b> is available.').
			css({
				color: 'green'
			});
	}

	checkName(name: string) {
		if(typeof(name) === "undefined") {
			return 0;
		} else {
			if (name.length > 12) {
				return 1;
			} else if (name.length < 3) {
				return 2;
			} else if (name.substring(0, 3) === 'Mod') {
				return 3;
			}
			$.each(this.notAllowed, function (key:number, value:any) {
				var decode = atob(value);
				if (name.indexOf(decode) > -1)
					return 4;
			});
		}
		return 5;
	}
	unavailable(message: string) {
		$(this.elements.availability).html(message).
			css({
				color: 'red'
			});
	}
}