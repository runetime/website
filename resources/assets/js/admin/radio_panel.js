var RadioPanel = (function () {
    function RadioPanel() {
        this.live = null;
        this.timetable = null;
    }
    return RadioPanel;
})();
var RadioPanelTimetable = (function () {
    function RadioPanelTimetable() {
        this.paths = {};
        this.paths = {
            claim: '/staff/radio/timetable'
        };
        $("[rt-data='radio.panel.timetable:update.hour']").bind('click', function (e) {
            radioPanel.timetable.claim(e);
        });
    }
    RadioPanelTimetable.prototype.claim = function (e) {
        var src = $(e.target).attr('rt-data2');
        var src2 = src.split(":");
        var day = src2[0], hour = src2[1];
        var data = {
            day: day,
            hour: hour
        };
        var claim = utilities.postAJAX(this.paths.claim, data);
        claim.done(function (claim) {
            claim = $.parseJSON(claim);
            if (claim.valid === true) {
                console.log(claim);
                $("[rt-data2='" + claim.day + ":" + claim.hour + "']").html(claim.name);
            }
            else {
                console.log('error');
            }
        });
    };
    return RadioPanelTimetable;
})();
var RadioPanelLive = (function () {
    function RadioPanelLive() {
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.elements = {
            song: "[rt-data='radio.panel:current.song']",
            songName: "[rt-data='radio.panel:current.song.name']",
            songArtist: "[rt-data='radio.panel:current.song.artist']",
            currentMessage: "[rt-data='radio.panel:current.message']",
            requests: "[rt-data='radio.panel:requests']"
        };
        this.hooks = {
            accept: "[rt-hook='radio.panel:request.accept']",
            decline: "[rt-hook='radio.panel:request.decline']"
        };
        this.paths = {
            message: '/staff/radio/live/message',
            request: '/staff/radio/live/request',
            update: '/staff/radio/live/update'
        };
        this.update();
        $("[rt-data='radio.panel:message.update']").bind('click', function (e) {
            radioPanel.live.updateMessage($(e.target).attr('rt-data2'));
        });
    }
    RadioPanelLive.prototype.accept = function (id) {
        var data = {
            id: id,
            status: 1
        };
        var results = utilities.postAJAX(this.paths.request, data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                radioPanel.live.update();
            }
            else {
                console.log('error');
            }
        });
    };
    RadioPanelLive.prototype.decline = function (id) {
        var data = {
            id: id,
            status: 2
        };
        var results = utilities.postAJAX(this.paths.request, data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                radioPanel.live.update();
            }
            else {
                console.log('error');
            }
        });
    };
    RadioPanelLive.prototype.update = function () {
        var data = utilities.getAJAX(this.paths.update);
        var self = this;
        data.done(function (data) {
            data = $.parseJSON(data);
            $(self.elements.songName).html(data.song.name);
            $(self.elements.songArtist).html(data.song.artist);
            $(self.elements.currentMessage).html(data.message);
            var html = "";
            $.each(data.requests, function (index, value) {
                if (value.status === 0) {
                    html += "<p title='" + value.author_name + "' rt-data='" + value.id + "'>";
                    html += "<a class='fa fa-check text-success' rt-hook='radio.panel:request.accept'></a>";
                    html += "<a class='fa fa-close text-danger' rt-hook='radio.panel:request.decline'></a>";
                }
                else if (value.status === 1) {
                    html += "<p class='text-success' title='" + value.author_name + "'>";
                }
                else if (value.status === 2) {
                    html += "<p class='text-danger' title='" + value.author_name + "'>";
                }
                html += value.song_name;
                html += " - ";
                html += value.song_artist;
            });
            $(radioPanel.live.elements.requests).html(html);
            $(radioPanel.live.hooks.accept).click(function (e) {
                var id = $(e.target).parent().attr('rt-data');
                radioPanel.live.accept(id);
            });
            $(radioPanel.live.hooks.decline).click(function (e) {
                var id = $(e.target).parent().attr('rt-data');
                radioPanel.live.decline(id);
            });
        });
        setTimeout(function () {
            radioPanel.live.update();
        }, 30000);
    };
    RadioPanelLive.prototype.updateMessage = function (id) {
        var data = {
            id: id
        };
        var load = utilities.postAJAX(this.paths.message, data);
        load.done(function (load) {
            load = $.parseJSON(load);
            $(radioPanel.live.elements.currentMessage).html(load.message);
        });
    };
    return RadioPanelLive;
})();
var radioPanel = new RadioPanel();
