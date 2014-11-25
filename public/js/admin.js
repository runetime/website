/*global $:false, jQuery:false */
var Admin = (function () {
    function Admin() {
        this.radio = null;
    }
    return Admin;
})();
var Radio = (function () {
    function Radio() {
        this.live = null;
        this.timetable = null;
    }
    return Radio;
})();
var Timetable = (function () {
    function Timetable() {
        this.paths = {};
        this.paths = {
            claim: '/staff/radio/timetable'
        };
        $("[rt-data='radio.panel.timetable:update.hour']").bind('click', function (e) {
            admin.radio.timetable.claim(e);
        });
    }
    Timetable.prototype.claim = function (e) {
        var src = $(e.target).attr('rt-data2');
        var src2 = src.split(":");
        var day = src2[0], hour = src[1];
        var data = {
            day: day,
            hour: hour
        };
        var claim = utilities.PostAJAX(this.paths.claim, data);
        claim.done(function (claim) {
            claim = $.parseJSON(claim);
            if (claim.valid === true) {
                $("[rt-data2='" + claim.day + ":" + claim.hour + "']").html(claim.name);
            }
        });
    };
    return Timetable;
})();
var Live = (function () {
    function Live() {
        this.elements = {};
        this.paths = {};
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
        $("[rt-data='radio.panel:message.update']").bind('click', function (e) {
            admin.radio.live.updateMessage($(e.target).attr('rt-data2'));
        });
    }
    Live.prototype.update = function () {
        var data = utilities.getAJAX(this.paths.update);
        data.done(function (data) {
            data = $.parseJSON(data);
            $(admin.radio.live.elements.songName).html(data.song.name);
            $(admin.radio.live.elements.songArtist).html(data.song.artist);
            $(admin.radio.live.elements.currentMessage).html(data.song.message);
        });
        setTimeout(function () {
            admin.radio.live.update();
        }, 30000);
    };
    Live.prototype.updateMessage = function (id) {
        var data = {
            id: id
        };
        var load = utilities.postAJAX(this.paths.message, data);
        load.done(function (load) {
            load = $.parseJSON(load);
            $(admin.radio.live.elements.currentMessage).html(load.message);
        });
    };
    return Live;
})();
var admin = new Admin();
