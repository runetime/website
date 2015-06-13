var leaderPanel;
var LeaderPanel = (function () {
    function LeaderPanel() {
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.elements = {
            ban: {
                username: "#ban-username",
                reason: "#ban-reason"
            },
            modals: {
                ban: "#modal-temp-ban-user",
                chatbox: "#modal-clear-chatbox",
                demote: "#modal-demote-member",
                mute: "#modal-mute-user"
            },
            mute: {
                reason: "#mute-reason",
                time: "#mute-time",
                username: "#mute-username"
            },
            results: {
                good: "#modal-results-good",
                goodMessage: "[rt-hook='leader.panel:results.good.message']",
                bad: "#modal-results-bad",
                badMessage: "[rt-hook='leader.panel:results.bad.message']"
            }
        };
        this.hooks = {
            ban: {
                submit: "[rt-hook='leader.panel:ban.submit']"
            },
            chatbox: {
                reason: "#chatbox-clear-reason",
                confirm: "[rt-hook='leader.panel:chatbox.clear']"
            },
            demote: {
                data: "[rt-hook='leader.panel:demote.data']"
            },
            mute: {
                submit: "[rt-hook='leader.panel:mute.submit']"
            }
        };
        this.paths = {
            chatboxClear: '/staff/leader/clear-chatbox',
            demote: '/staff/leader/demote',
            mute: '/staff/leader/mute',
            ban: '/staff/leader/temp-ban'
        };
        this.setup();
    }
    LeaderPanel.prototype.ban = function () {
        var username = $(this.elements.ban.username).val(), reason = $(this.elements.ban.reason).val();
        if (username.length > 0 && reason.length > 0) {
            var data = {
                username: username,
                reason: reason
            };
            var results = utilities.postAJAX(this.paths.ban, data);
            results.done(function (results) {
                results = $.parseJSON(results);
                if (results.done === true) {
                    leaderPanel.done("The user " + results.name + " was successfully temporarily banned.");
                }
                else {
                    if (results.error === -1) {
                        leaderPanel.error("That user does not exist.");
                    }
                    else {
                        leaderPanel.error("An unknown error occurred.");
                    }
                }
            });
        }
        else {
            this.error("All fields need to be completed.");
        }
    };
    LeaderPanel.prototype.chatboxClear = function () {
        var reason = $(this.hooks.chatbox.reason).val();
        if (reason.length < 1) {
            this.error("No reason was given.");
        }
        else {
            var data = {
                reason: reason
            };
            var results = utilities.postAJAX(this.paths.chatboxClear, data);
            results.done(function (results) {
                results = $.parseJSON(results);
                if (results.done === true) {
                    leaderPanel.done("The chatbox has been successfully cleared.");
                }
                else {
                    if (results.error === -1) {
                        leaderPanel.error("There was an unknown error while setting all chat messages to invisible.");
                    }
                    else {
                        leaderPanel.error("There was an unknown error while clearing the chatbox.");
                    }
                }
            });
        }
    };
    LeaderPanel.prototype.demote = function (e) {
        var id = $(e.target).attr('rt-data');
        var data = {
            id: id
        };
        var results = utilities.postAJAX(this.paths.demote, data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                leaderPanel.done("The user " + results.name + " was successfully demoted.");
            }
            else {
                if (results.error === -1) {
                    leaderPanel.done("You are not a team leader and can not demote members.");
                }
                else if (results.error === -2) {
                    leaderPanel.done("That user is not in your team.");
                }
                else {
                    leaderPanel.done("There was unknown error.");
                }
            }
        });
    };
    LeaderPanel.prototype.done = function (reason) {
        $.each(this.elements.modals, function (index, value) {
            $(value).modal('hide');
        });
        $(this.elements.results.good).modal('show');
        $(this.elements.results.goodMessage).html(reason);
    };
    LeaderPanel.prototype.error = function (reason) {
        $.each(this.elements.modals, function (index, value) {
            $(value).modal('hide');
        });
        $(this.elements.results.bad).modal('show');
        $(this.elements.results.badMessage).html(reason);
    };
    LeaderPanel.prototype.mute = function () {
        var username = $(this.elements.mute.username).val(), time = $(this.elements.mute.time).val(), reason = $(this.elements.mute.reason).val();
        if (username.length > 0 && time.length > 0 && reason.length > 0) {
            var data = {
                username: username,
                time: time,
                reason: reason
            };
            var results = utilities.postAJAX(this.paths.mute, data);
            results.done(function (results) {
                results = $.parseJSON(results);
                if (results.done === true) {
                    leaderPanel.done("The user " + results.name + " has been successfully muted.");
                }
                else {
                    if (results.error === -1) {
                        leaderPanel.error("That user does not exist.");
                    }
                    else if (results.error === -2) {
                        leaderPanel.error("There was an unknown error while muting that user.");
                    }
                    else if (results.error === -3) {
                        leaderPanel.error("You did not write a 'infinite' but did not write a number either.");
                    }
                    else {
                        leaderPanel.error("There was an unknown error while muting that user.");
                    }
                }
            });
        }
        else {
            leaderPanel.error("All of the fields need to be completed.");
        }
    };
    LeaderPanel.prototype.setup = function () {
        $(this.hooks.chatbox.confirm).click(function () {
            leaderPanel.chatboxClear();
        });
        $(this.hooks.demote.data).click(function (e) {
            leaderPanel.demote(e);
        });
        $(this.hooks.mute.submit).click(function () {
            leaderPanel.mute();
        });
        $(this.hooks.ban.submit).click(function () {
            leaderPanel.ban();
        });
    };
    return LeaderPanel;
})();
