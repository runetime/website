var adminPanel;
var AdminPanel = (function () {
    function AdminPanel() {
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.elements = {
            ipBan: {
                ip: '#ip-ban-address',
                reason: '#ip-ban-reason'
            },
            modals: {
                chatboxClear: '#modal-chatbox-clear',
                ipBan: '#modal-ip-ban',
                radioStop: '#modal-radio-stop',
                staffDemote: '#modal-staff-demote'
            },
            results: {
                good: '#modal-results-good',
                goodMessage: "[rt-hook='modal:good.message']",
                bad: '#modal-results-bad',
                badMessage: "[rt-hook='modal:bad.message']"
            }
        };
        this.hooks = {
            chatbox: {
                clear: {
                    confirm: "[rt-hook='admin.panel:chatbox.clear.confirm']",
                    open: "[rt-hook='admin.panel:chatbox.clear.open']"
                }
            },
            ip: {
                ban: {
                    confirm: "[rt-hook='admin.panel:ip.ban.confirm']",
                    open: "[rt-hook='admin.panel:ip.ban.open']"
                }
            },
            radio: {
                stop: {
                    confirm: "[rt-hook='admin.panel:radio.stop.confirm']",
                    open: "[rt-hook='admin.panel:radio.stop.open']"
                }
            },
            staff: {
                demote: {
                    confirm: "[rt-hook='admin.panel:staff.demote.confirm']",
                    open: "[rt-hook='admin.panel:staff.demote.open']"
                }
            }
        };
        this.paths = {
            chatbox: {
                clear: '/staff/leader/chatbox-clear'
            },
            ip: {
                ban: '/staff/administrator/ip-ban'
            },
            radio: {
                stop: '/staff/administrator/radio-stop'
            },
            staff: {
                demote: '/staff/administrator/staff-demote'
            }
        };
        $(this.hooks.chatbox.clear.open).click(function () {
            $(adminPanel.elements.modals.chatboxClear).modal('show');
        });
        $(this.hooks.ip.ban.open).click(function () {
            $(adminPanel.elements.modals.ipBan).modal('show');
        });
        $(this.hooks.radio.stop.open).click(function () {
            $(adminPanel.elements.modals.radioStop).modal('show');
        });
        $(this.hooks.staff.demote.open).click(function () {
            $(adminPanel.elements.modals.staffDemote).modal('show');
        });
        $(this.hooks.chatbox.clear.confirm).click(function () {
            adminPanel.chatboxClear();
        });
        $(this.hooks.ip.ban.confirm).click(function () {
            adminPanel.ban();
        });
        $(this.hooks.radio.stop.confirm).click(function () {
            adminPanel.radioStop();
        });
        $(this.hooks.staff.demote.confirm).click(function () {
            adminPanel.staffDemote();
        });
    }
    AdminPanel.prototype.ban = function () {
        var ip = $(this.elements.ipBan.ip).val(), reason = $(this.elements.ipBan.reason).val();
        var data = {
            ip: ip,
            contents: reason
        };
        var results = utilities.postAJAX(this.paths.ip.ban, data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                adminPanel.done("The IP has been successfully banned.");
            }
            else {
                adminPanel.error("There was an unknown error while performing the IP ban.");
            }
        });
    };
    AdminPanel.prototype.chatboxClear = function () {
        var results = utilities.postAJAX(this.paths.chatbox.clear, {});
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                adminPanel.done("The chatbox was successfully cleared.");
            }
            else {
                adminPanel.error("There was an unknown error while clearing the chatbox.");
            }
        });
    };
    AdminPanel.prototype.done = function (message) {
        $.each(this.elements.modals, function (index, value) {
            $(value).modal('hide');
        });
        $(this.elements.results.good).modal('show');
        $(this.elements.results.goodMessage).html(message);
    };
    AdminPanel.prototype.error = function (reason) {
        $.each(this.elements.modals, function (index, value) {
            $(value).modal('hide');
        });
        $(this.elements.results.bad).modal('show');
        $(this.elements.results.badMessage).html(reason);
    };
    AdminPanel.prototype.radioStop = function () {
        var results = utilities.postAJAX(this.paths.radio.stop, {});
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                adminPanel.done("The radio will successfully stop within 30 seconds.");
            }
            else {
                adminPanel.error("The radio has been switched on.");
            }
        });
    };
    AdminPanel.prototype.staffDemote = function () {
        var results = utilities.postAJAX(this.paths.staff.demote, {});
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                adminPanel.done("All staff were successfully demoted.");
            }
            else {
                adminPanel.error("There was an unknown error while demoting all staff.");
            }
        });
    };
    return AdminPanel;
})();
