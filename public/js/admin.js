function Admin() {
	this.Radio = null;
	this.Radio = function Radio() {
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
						console.log($("[rt-data2='" + claim.day + ":" + claim.hour + "']"));
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
	};
}
var Admin = new Admin();