function Admin() {
	this.Radio = null;
	this.Radio = function Radio() {
		this.Live = null;
		this.Timetable = null;
		this.Timetable = function Timetable() {
			this.paths = {};
			this.claim = function claim(e) {
				var src = $(e.target).attr('rt-data2');
				var src2 = src.split(":");
				var day = src2[0],
					hour = src2[1];
				var data = {
					'day': day,
					'hour': hour
				};
				var claim = RuneTime.Utilities.postAJAX(this.paths.claim, data);
				claim.done(function(claim) {
					claim = $.parseJSON(claim);
					if(claim.valid === true) {
						$("[rt-data2='" + claim.day + ":" + claim.hour + "']").html(claim.name);
					}
				});
			};
			this.setup = function setup() {
				this.paths = {
					claim: '/staff/radio/timetable'
				};
				$("[rt-data='radio.panel.timetable:update.hour']").bind('click', function(e) {
					Admin.Radio.Timetable.claim(e);
				});
			};
		};
		this.Live = function Live() {
			this.elements = {};
			this.paths = {};
			this.update = function update() {
				var data = RuneTime.Utilities.getAJAX(this.paths.update);
				data.done(function(data) {
					data = $.parseJSON(data);
					$(Admin.Radio.Live.elements.songName).html(data.song.name);
					$(Admin.Radio.Live.elements.songArtist).html(data.song.artist);
					$(Admin.Radio.Live.elements.currentMessage).html(data.song.message);
				});
				setTimeout(function() {
					Admin.Radio.Live.update();
				}, 30000);
			};
			this.updateMessage = function updateMessage(id) {
				var data = {
					id: id
				};
				var load = RuneTime.Utilities.postAJAX(this.paths.message, data);
				load.done(function(load) {
					load = $.parseJSON(load);
					$(Admin.Radio.Live.elements.currentMessage).html(load.message);
				});
			};
			this.setup = function setup() {
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
				$("[rt-data='radio.panel:message.update']").bind('click', function(e) {
					Admin.Radio.Live.updateMessage($(e.target).attr('rt-data2'));
				});
			};
		};
	};
}
var Admin = new Admin();