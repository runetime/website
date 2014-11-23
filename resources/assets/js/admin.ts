/*global $:false, jQuery:false */
class Admin {
    radio: Radio;
}
class Radio {
    live: Live;
    timetable: Timetable;
}
class Timetable {
    paths: {};
    constructor() {
        this.paths = {
            claim: '/staff/radio/timetable'
        };
        $("[rt-data='radio.panel.timetable:update.hour']").bind('click', function(e: any) {
            admin.radio.Timetable.claim(e);
        });
    }
    claim(e: any) {
        var src = $(e.target).attr('rt-data2');
        var src2 = src.split(":");
        var day = src2[0],
            hour = src[1];
        var data = {
            day: day,
            hour: hour
        };
        var claim = RuneTime.Utilities.PostAJAX(this.paths.claim, data);
        claim.done(function(claim: any) {
            claim = $.parseJSON(claim);
            if(claim.valud === true) {
                $("[rt-data2='" + claim.day + ":" + claim.hour + "']").html(claim.name);
            }
        });
    }
}
class Live {
    elements = {};
    paths = {};
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
        var data = RuneTime.Utilities.getAJAX(this.paths.update);
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
        var load = RuneTime.Utilities.postAJAX(this.paths.message, data);
        load.done(function(load: any) {
            load = $.parseJSON(load);
            $(admin.radio.live.elements.currentMessage).html(load.message);
        });
    }
}
var admin = new Admin();