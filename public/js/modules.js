var about;
var About = (function () {
    function About() {
        var ads = document.querySelector("[data-dialog=clan-dialog-ads]");
        var radio = document.querySelector("[data-dialog=clan-dialog-radio]");
        var forums = document.querySelector("[data-dialog=clan-dialog-forums]");
        var disclosure = document.querySelector("[data-dialog=clan-dialog-full-disclosure]");
        var members = document.querySelector("[data-dialog=clan-dialog-our-members]");
        var community = document.querySelector("[data-dialog=clan-dialog-community-openness]");
        this.setListen(ads);
        this.setListen(radio);
        this.setListen(forums);
        this.setListen(disclosure);
        this.setListen(members);
        this.setListen(community);
        console.log(1);
    }
    About.prototype.setListen = function (dlgtrigger) {
        if (dlgtrigger) {
            var somedialog = document.getElementById(dlgtrigger.getAttribute('data-dialog'));
            var dlg = new DialogFx(somedialog);
            dlgtrigger.addEventListener('click', dlg.toggle.bind(dlg));
        }
    };
    return About;
})();

var calculator;
var Calculator = (function () {
    function Calculator(calc) {
        this.calc = calc;
        this.elements = {};
        this.info = {};
        this.URL = {};
        this.items = {};
        this.elements = {
            currentXP: '#calculator-current-xp',
            displayName: '#calculator-display-name',
            submit: '#calculator-submit',
            table: '#calculator-table tbody',
            targetLevel: '#calculator-target-level'
        };
        this.URL = {
            getCalc: '/calculators/load',
            getInfo: '/get/hiscore'
        };
        this.info = {
            levelCurrent: 0,
            levelTarget: 0,
            XPCurrent: 0,
            XPTarget: 0
        };
        this.calculator = calc;
        $(this.elements.submit).bind('click', function () {
            calculator.getInfo();
        });
        this.loadCalc();
        $('#calculator-target-level').keyup(function () {
            setTimeout(function () {
                calculator.updateCalc();
            }, 25);
        });
    }
    Calculator.prototype.calculateXP = function (level) {
        var total = 0, i = 0;
        for (i = 1; i < level; i += 1) {
            total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
        }
        return Math.floor(total / 4);
    };
    Calculator.prototype.calculateLevel = function (xp) {
        var total = 0, i = 0;
        for (i = 1; i < 120; i += 1) {
            total += Math.floor(i + 300 + Math.pow(2, i / 7));
            if (Math.floor(total / 4) > xp)
                return i;
            else if (i >= 99)
                return 99;
        }
    };
    Calculator.prototype.getInfo = function () {
        var name = $(this.elements.displayName).val();
        var info = utilities.getAJAX(this.URL.getInfo + '/' + name);
        info.done(function (info) {
            info = $.parseJSON(info);
            var relevant = info[13];
            calculator.info.levelCurrent = relevant[1];
            calculator.info.XPCurrent = relevant[2];
            $(calculator.elements.currentXP).val(calculator.info.XPCurrent);
            if ($(calculator.elements.targetLevel).val().length === 0) {
                $(calculator.elements.targetLevel).val(parseInt(calculator.info.levelCurrent, 10) + 1);
            }
            calculator.updateCalc();
        });
    };
    Calculator.prototype.loadCalc = function () {
        var data = { id: this.calculator };
        var info = utilities.postAJAX(this.URL.getCalc, data);
        info.done(function (info) {
            info = utilities.JSONDecode(info);
            calculator.items = info;
            $.each(calculator.items, function (index, value) {
                var html = "";
                html += "<tr>";
                html += "<td>" + calculator.items[index].name + "</td>";
                html += "<td>" + calculator.items[index].level + "</td>";
                html += "<td>" + calculator.items[index].xp + "</td>";
                html += "<td>&infin;</td>";
                html += "</tr>";
                $(calculator.elements.table).append(html);
            });
        });
    };
    Calculator.prototype.updateCalc = function () {
        var levelCurrent = 0, levelTarget = 0, xpCurrent = 0, xpTarget = 0, difference = 0, amount = 0;
        this.info.levelTarget = parseInt($('#calculator-target-level').val());
        console.log(this.info.levelTarget);
        this.info.XPTarget = this.calculateXP(this.info.levelTarget);
        if (this.info.XPCurrent > this.info.XPTarget)
            this.info.XPTarget = this.calculateXP(parseInt(this.info.levelCurrent, 10) + 1);
        levelCurrent = this.info.levelCurrent;
        levelTarget = this.info.levelTarget;
        xpCurrent = this.info.XPCurrent;
        xpTarget = this.info.XPTarget;
        difference = xpTarget - xpCurrent;
        $.each(this.items, function (index, value) {
            amount = Math.ceil(difference / calculator.items[index].xp);
            amount = amount < 0 ? 0 : amount;
            $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ') td:nth-child(4)').html(amount);
            console.log(calculator.items[index].name);
            console.log(calculator.items[index].level);
            console.log(levelCurrent);
            console.log(levelTarget);
            console.log(calculator.items[index].level);
            console.log("\n\n\n\n\n");
            if (calculator.items[index].level <= levelCurrent) {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-success');
            }
            else if (calculator.items[index].level > levelCurrent && levelTarget >= calculator.items[index].level) {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-warning');
            }
            else {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-danger');
            }
        });
    };
    return Calculator;
})();

var chatbox;
var Chatbox = (function () {
    function Chatbox(channel) {
        this.channel = channel;
        this.channel = '#radio';
        this.elements = {};
        this.lastId = 0;
        this.messages = [];
        this.moderator = false;
        this.pinned = [];
        this.times = {};
        this.timeoutPinned = null;
        this.timeoutUpdate = null;
        this.URL = {};
        this.pinnedDisplayed = [];
        this.channel = channel;
        this.elements = {
            actions: '#chatbox-actions',
            channels: '#chatbox-channels',
            chatbox: '#chatbox',
            message: '#chatbox-message',
            messages: '#chatbox-messages'
        };
        this.URL = {
            getStart: '/chat/start',
            getUpdate: '/chat/update',
            postMessage: '/chat/post/message',
            postStatusChange: '/chat/post/status/change'
        };
        this.times = {
            lastActivity: utilities.currentTime(),
            lastRefresh: utilities.currentTime(),
            loadedAt: utilities.currentTime()
        };
        var moderator = utilities.getAJAX('/chat/moderator');
        moderator.done(function (moderator) {
            moderator = $.parseJSON(moderator);
            chatbox.moderator = moderator.mod === true;
        });
        this.panelChat();
        this.getStart();
        $(this.elements.message).keypress(function (e) {
            if (e.which === 13)
                chatbox.submitMessage();
        });
        $(this.elements.channels).bind('click', function () {
            chatbox.panelChannels();
        });
        setTimeout(function () {
            chatbox.update();
        }, 5000);
        setTimeout(function () {
            chatbox.updateTimeAgo();
        }, 1000);
    }
    Chatbox.prototype.addMessage = function (message) {
        if (this.lastId < message.id) {
            this.lastId = message.id;
        }
        if (message.status <= 1) {
            this.messages[this.messages.length] = message;
            this.times.lastActivity = utilities.currentTime();
        }
    };
    Chatbox.prototype.displayMessage = function (message) {
        if (!message) {
            return;
        }
        var html = "";
        if (message.status === 1) {
            html += "<div id='" + message.id + "' class='msg msg-hidden'>";
        }
        else if (message.status === 2) {
            html += "<div id='" + message.id + "' class='msg msg-pinned'>";
        }
        else if (message.status === 3) {
            html += "<div id='" + message.id + "' class='msg msg-pinhid'>";
        }
        else {
            html += "<div id='" + message.id + "' class='msg'>";
        }
        html += "<time class='pull-right' data-ts='" + message.created_at + "'>";
        html += utilities.timeAgo(message.created_at);
        html += "</time>";
        html += "<p>";
        if (chatbox.moderator === true) {
            html += Chatbox.modTools(message);
        }
        html += "<a class='members-" + message.class_name + "'>" + message.author_name + "</a>: " + message.contents_parsed;
        html += "</p>";
        html += "</div>";
        $(chatbox.elements.messages).prepend(html);
    };
    Chatbox.prototype.displayMessages = function () {
        var messages = this.messages;
        $(this.elements.messages).html('');
        $.each(messages, function (index, message) {
            chatbox.displayMessage(message);
        });
        $.each(this.pinned, function (index, message) {
            if (chatbox.pinnedDisplayed[message.id] !== true) {
                chatbox.pinnedDisplayed[message.id] = true;
                chatbox.displayMessage(message);
            }
        });
        chatbox.pinnedDisplayed = [];
    };
    Chatbox.error = function (message) {
        console.log(message);
    };
    Chatbox.prototype.getStart = function () {
        $(this.elements.messages).html('');
        this.messages = [];
        var data = {
            time: this.times.loadedAt,
            channel: this.channel
        };
        var results = utilities.postAJAX('chat/start', data);
        results.done(function (results) {
            results = $.parseJSON(results);
            $.each(results.messages, function (index, value) {
                chatbox.addMessage(value);
            });
            chatbox.pinned = results.pinned;
            chatbox.displayMessages();
        });
    };
    Chatbox.prototype.mod = function (id, newStatus) {
        var data = {
            id: id,
            status: newStatus
        };
        var results = utilities.postAJAX('/chat/status-change', data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                chatbox.getStart();
            }
            else {
                chatbox.error("There was an error while performing that moderation change.");
            }
        });
    };
    Chatbox.modTools = function (message) {
        var res = "";
        res += "<ul class='list-inline inline'>";
        res += "<li>";
        if (message.status % 2 === 0) {
            res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status + 1) + ");' title='Hide message'><i class='fa fa-minus-circle text-info'></i></a>";
        }
        else {
            res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status - 1) + ");' title='Show message'><i class='fa fa-plus-circle text-info'></i></a>";
        }
        res += "</li>";
        res += "<li>";
        if (message.status >= 2) {
            res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status - 2) + ");' title='Unpin message'><i class='fa fa-arrow-circle-down text-info'></i></a>";
        }
        else {
            res += "<a onclick='chatbox.mod(" + message.id + ", " + (message.status + 2) + ");' title='Pin message'><i class='fa fa-arrow-circle-up text-info'></i></a>";
        }
        res += "</li>";
        res += "</ul>";
        return res;
    };
    Chatbox.prototype.panelChannels = function () {
        var response = utilities.getAJAX('/chat/channels');
        response.done(function (response) {
            var contents = "";
            response = $.parseJSON(response);
            contents += "<div id='chatbox-popup-channels'>";
            contents += "<button type='button' class='close' onclick='chatbox.panelclose();'>Close <span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>";
            contents += "<h3>Channels</h3>";
            contents += "<p class='holo-text'>Currently on <b>#" + chatbox.channel + "</b></p>";
            $.each(response, function (index, value) {
                contents += "<a onclick=\"chatbox.switchChannel('" + value.name + "');\">#" + value.name + "</a><br />";
                contents += "<span class='holo-text-secondary'>" + value.messages + " messages</span><br />";
                contents += "<span class='holo-text-secondary'>Last active " + utilities.timeAgo(value.last_message) + "</span><br />";
            });
            contents += "</div>";
            $(chatbox.elements.messages).html(contents);
        });
    };
    Chatbox.prototype.panelChat = function () {
        var contents = "";
        contents += "<div id='chatbox-messages'></div>";
        contents += "<div id='chatbox-actions'>";
        contents += "<a href='/transparency/markdown' target='_blank' id='chatbox-markdown'>Markdown</a>";
        contents += "<a id='chatbox-channels'>Channels</a>";
        contents += "</div>";
        contents += "<input type='text' id='chatbox-message' />";
        $(this.elements.chatbox).html(contents);
    };
    Chatbox.prototype.panelClose = function () {
        this.getStart();
    };
    Chatbox.prototype.submitMessage = function () {
        var contents = $(this.elements.message).val(), message, response;
        message = {
            contents: contents,
            channel: this.channel
        };
        response = utilities.postAJAX(this.URL.postMessage, message);
        response.done(function (response) {
            response = $.parseJSON(response);
            chatbox.update();
            if (response.done === true) {
                $(chatbox.elements.message).val('');
                $(chatbox.elements.message).toggleClass('message-sent');
                setTimeout(function () {
                    $(chatbox.elements.message).toggleClass('message-sent');
                }, 1500);
            }
            else {
                if (response.error === -1) {
                    $(chatbox.elements.message).val('You are not logged in and can not send messages.');
                }
                else if (response.error === -2) {
                    $(chatbox.elements.message).val('You were muted for one hour by a staff member and can not send messages.');
                }
                else {
                    $(chatbox.elements.message).val('There was an unknown error.  Please try again.');
                }
                $(chatbox.elements.message).toggleClass('message-bad');
                setTimeout(function () {
                    $(chatbox.elements.message).toggleClass('message-bad');
                }, 2500);
            }
        });
    };
    Chatbox.prototype.switchChannel = function (name) {
        var data, response;
        data = {
            channel: name
        };
        response = utilities.postAJAX('/chat/channels/check', data);
        response.done(function (response) {
            response = $.parseJSON(response);
            if (response.valid) {
                chatbox.channel = name;
                chatbox.getStart();
            }
            else {
                console.log('error');
            }
        });
    };
    Chatbox.prototype.update = function () {
        var data = {
            id: this.lastId,
            channel: this.channel
        };
        var response = utilities.postAJAX(this.URL.getUpdate, data);
        response.done(function (response) {
            response = $.parseJSON(response);
            chatbox.times.lastRefresh = utilities.currentTime();
            if (response.length > 0) {
                $.each(response, function (index, value) {
                    chatbox.addMessage(value);
                });
                chatbox.displayMessages();
            }
            clearTimeout(chatbox.timeoutUpdate);
            chatbox.timeoutUpdate = setTimeout(function () {
                chatbox.update();
            }, 10000);
        });
    };
    Chatbox.prototype.updateTimeAgo = function () {
        var messages = $(this.elements.messages).find('.msg');
        $.each(messages, function (index, value) {
            var timestamp = $(value).find('time').attr('data-ts');
            $(value).find('time').html(utilities.timeAgo(timestamp));
        });
        setTimeout(function () {
            chatbox.updateTimeAgo();
        }, 1000);
    };
    return Chatbox;
})();

var clan;
var Clan = (function () {
    function Clan() {
        var warnings = document.querySelector("[data-dialog=clan-dialog-warnings]");
        var tempBans = document.querySelector("[data-dialog=clan-dialog-temporary-bans]");
        var bans = document.querySelector("[data-dialog=clan-dialog-bans]");
        this.setListen(warnings);
        this.setListen(tempBans);
        this.setListen(bans);
    }
    Clan.prototype.setListen = function (dlgtrigger) {
        if (dlgtrigger) {
            var somedialog = document.getElementById(dlgtrigger.getAttribute('data-dialog'));
            var dlg = new DialogFx(somedialog);
            dlgtrigger.addEventListener('click', dlg.toggle.bind(dlg));
        }
    };
    return Clan;
})();

;
(function (window) {
    'use strict';
    var support = { animations: Modernizr.cssanimations }, animEndEventNames = { 'WebkitAnimation': 'webkitAnimationEnd', 'OAnimation': 'oAnimationEnd', 'msAnimation': 'MSAnimationEnd', 'animation': 'animationend' }, animEndEventName = animEndEventNames[Modernizr.prefixed('animation')], onEndAnimation = function (el, callback) {
        var onEndCallbackFn = function (ev) {
            if (support.animations) {
                if (ev.target != this)
                    return;
                this.removeEventListener(animEndEventName, onEndCallbackFn);
            }
            if (callback && typeof callback === 'function') {
                callback.call();
            }
        };
        if (support.animations) {
            el.addEventListener(animEndEventName, onEndCallbackFn);
        }
        else {
            onEndCallbackFn();
        }
    };
    function extend(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    }
    function DialogFx(el, options) {
        this.el = el;
        this.options = extend({}, this.options);
        extend(this.options, options);
        this.ctrlClose = this.el.querySelector('[data-dialog-close]');
        this.isOpen = false;
        this._initEvents();
    }
    DialogFx.prototype.options = {
        // callbacks
        onOpenDialog: function () {
            return false;
        },
        onCloseDialog: function () {
            return false;
        }
    };
    DialogFx.prototype._initEvents = function () {
        var self = this;
        // close action
        this.ctrlClose.addEventListener('click', this.toggle.bind(this));
        // esc key closes dialog
        document.addEventListener('keydown', function (ev) {
            var keyCode = ev.keyCode || ev.which;
            if (keyCode === 27 && self.isOpen) {
                self.toggle();
            }
        });
        this.el.querySelector('.dialog__overlay').addEventListener('click', this.toggle.bind(this));
    };
    DialogFx.prototype.toggle = function () {
        var self = this;
        if (this.isOpen) {
            classie.remove(this.el, 'dialog--open');
            classie.add(self.el, 'dialog--close');
            onEndAnimation(this.el.querySelector('.dialog__content'), function () {
                classie.remove(self.el, 'dialog--close');
            });
            // callback on close
            this.options.onCloseDialog(this);
        }
        else {
            classie.add(this.el, 'dialog--open');
            // callback on open
            this.options.onOpenDialog(this);
        }
        this.isOpen = !this.isOpen;
    };
    // add to global namespace
    window.DialogFx = DialogFx;
})(window);

var combatCalculator;
var CombatCalculator = (function () {
    function CombatCalculator() {
        this.clicks = {};
        this.generate = {};
        this.inputs = {};
        this.other = {};
        this.paths = {};
        this.clicks = {
            submit: "[rt-data='combat.calculator:submit']"
        };
        this.generate = {
            level: "[rt-data='combat.calculator:level']"
        };
        this.inputs = {
            attack: "[rt-data='combat.calculator:attack']",
            defence: "[rt-data='combat.calculator:defence']",
            strength: "[rt-data='combat.calculator:strength']",
            constitution: "[rt-data='combat.calculator:constitution']",
            ranged: "[rt-data='combat.calculator:ranged']",
            prayer: "[rt-data='combat.calculator:prayer']",
            magic: "[rt-data='combat.calculator:magic']",
            summoning: "[rt-data='combat.calculator:summoning']"
        };
        this.other = {
            name: "[rt-data='combat.calculator:name']"
        };
        this.paths = {
            loadCombat: '/calculators/combat/load'
        };
        $(this.inputs.attack).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.defence).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.strength).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.constitution).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.ranged).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.prayer).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.magic).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.inputs.summoning).keyup(function () {
            setTimeout(function () {
                combatCalculator.updateLevel();
            }, 25);
        });
        $(this.clicks.submit).click(function () {
            combatCalculator.getLevels();
        });
    }
    CombatCalculator.prototype.getLevels = function () {
        var name = $(this.other.name).val(), data = {
            rsn: name
        }, levels = utilities.postAJAX(this.paths.loadCombat, data);
        levels.done(function (levels) {
            levels = $.parseJSON(levels);
            $(combatCalculator.inputs.attack).val(levels.attack);
            $(combatCalculator.inputs.defence).val(levels.defence);
            $(combatCalculator.inputs.strength).val(levels.strength);
            $(combatCalculator.inputs.constitution).val(levels.constitution);
            $(combatCalculator.inputs.ranged).val(levels.ranged);
            $(combatCalculator.inputs.prayer).val(levels.prayer);
            $(combatCalculator.inputs.magic).val(levels.magic);
            $(combatCalculator.inputs.summoning).val(levels.summoning);
            combatCalculator.updateLevel();
        });
    };
    CombatCalculator.prototype.updateLevel = function () {
        var melee = this.val('attack') + this.val('strength');
        var magic = 2 * this.val('magic');
        var ranged = 2 * this.val('ranged');
        var def = this.val('defence') + this.val('constitution');
        var other = (.5 * this.val('prayer')) + (.5 * this.val('summoning'));
        var level = (13 / 10) * Math.max(melee, magic, ranged) + def + other;
        level *= .25;
        level = Math.floor(level);
        $(this.generate.level).html(level);
    };
    CombatCalculator.prototype.val = function (name) {
        return parseInt($("[rt-data='combat.calculator:" + name + "']").val());
    };
    return CombatCalculator;
})();

var contact;
var Contact = (function () {
    function Contact() {
        this.data = {};
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.data = {
            sent: false
        };
        this.elements = {
            email: '#contact-email',
            error: '#contact-error',
            message: '#contact-message',
            username: '#contact-username'
        };
        this.hooks = {
            submit: "[rt-hook='contact:submit']"
        };
        this.paths = {
            form: '/contact/submit'
        };
        $(this.hooks.submit).click(function () {
            contact.send();
        });
    }
    Contact.prototype.done = function (message) {
        $(this.elements.error).html(message);
        $(this.elements.error).removeClass().addClass("text-success");
    };
    Contact.prototype.error = function (message) {
        $(this.elements.error).html(message);
        $(this.elements.error).removeClass().addClass("text-danger");
    };
    Contact.prototype.send = function () {
        if (this.data.sent === true) {
            return this.done("You have already sent your message!");
        }
        var email = $(this.elements.email).val(), message = $(this.elements.message).val(), username = $(this.elements.username).val();
        // Check email
        if (this.validateEmail(email) === false) {
            return this.error("That is not a validate email address.");
        }
        var data = {
            contents: message,
            email: email,
            username: username
        };
        var results = utilities.postAJAX(this.paths.form, data);
        this.warning("Sending message...");
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                contact.data.sent = true;
                contact.done("Your message has been sent.");
            }
            else {
                contact.error("There was an unknown error while sending your message.");
            }
        });
    };
    Contact.prototype.validateEmail = function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    Contact.prototype.warning = function (message) {
        $(this.elements.error).html(message);
        $(this.elements.error).removeClass().addClass("text-warning");
    };
    return Contact;
})();

var forums;
var Forums = (function () {
    function Forums() {
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.post = null;
        this.threadCreate = null;
        this.elements = {
            'postEditor': "[rt-data='post.edit']"
        };
        this.hooks = {
            poll: {
                vote: "[rt-hook='forum:poll.vote']"
            }
        };
        this.paths = {
            poll: {
                vote: '/forums/poll/vote'
            },
            vote: function (id) {
                return '/forums/post/' + id + '/vote';
            }
        };
        this.post = new Post();
        $('.upvote').bind('click', function (e) {
            var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
            forums.upvote(postId);
        });
        $('.downvote').bind('click', function (e) {
            var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
            forums.downvote(postId);
        });
        $("[rt-hook='forums.thread.post:quote']").bind('click', function (e) {
            var id = $(e.target).attr('rt-data');
            forums.post.quote(id);
        });
        $(this.hooks.poll.vote).click(function (e) {
            var data = $(e.target).attr('rt-data');
            data = $.parseJSON(data);
            forums.pollVote(data.question, data.answer);
        });
    }
    Forums.prototype.downvote = function (postId) {
        postId = postId.replace("post", "");
        var post = $('#post' + postId), isUpvoted = $(post).hasClass('upvote-active'), isDownvoted = $(post).hasClass('downvote-active');
        if (isDownvoted === true)
            $(post).removeClass('downvote-active');
        else
            $(post).addClass('downvote-active');
        if (isUpvoted === true)
            $(post).removeClass('upvote-active');
        var data = {
            'vote': 'down'
        };
        var vote = utilities.postAJAX(this.paths.vote(postId), data);
        vote.done(function (data) {
            data = $.parseJSON(data);
        });
    };
    Forums.prototype.pollVote = function (questionId, answerId) {
        var data = {
            answer: answerId,
            question: questionId
        };
        var results = utilities.postAJAX(this.paths.poll.vote, data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                window.location.replace(window.location.pathname);
            }
            else {
                if (results.error === -1) {
                }
                else {
                }
            }
        });
    };
    Forums.prototype.upvote = function (postId) {
        postId = postId.replace("post", "");
        var post = $('#post' + postId), isUpvoted = $(post).hasClass('upvote-active'), isDownvoted = $(post).hasClass('downvote-active');
        if (isUpvoted === true)
            $(post).removeClass('upvote-active');
        else
            $(post).addClass('upvote-active');
        if (isDownvoted === true)
            $(post).removeClass('downvote-active');
        var data = {
            'vote': 'up'
        };
        var vote = utilities.postAJAX(this.paths.vote(postId), data);
        vote.done(function (data) {
            data = $.parseJSON(data);
        });
    };
    return Forums;
})();
var Post = (function () {
    function Post() {
    }
    Post.prototype.quote = function (id) {
        var source = $("[rt-data='post#" + id + ":source']").html(), postContents = $(forums.elements.postEditor).val();
        source = source.replace(/\n/g, '\n>');
        source = source.replace(/&lt;/g, '<');
        source = source.replace(/&gt;/g, '>');
        source = ">" + source;
        if (postContents.length > 0)
            postContents += "\n";
        $(forums.elements.postEditor).val(postContents + source + "\n");
        utilities.scrollTo($(forums.elements.postEditor), 1000);
        $(forums.elements.postEditor).focus();
    };
    return Post;
})();
var ForumsThreadCreate = (function () {
    function ForumsThreadCreate() {
        this.hooks = {};
        this.questions = [];
        this.values = {};
        this.views = {};
        this.hooks = {
            questionAdd: "[rt-hook='forums.thread.create:poll.question.add']",
            questions: "[rt-hook='forums.thread.create:poll.questions']"
        };
        this.questions = Array(500);
        this.values = {
            questions: 0
        };
        this.views = {
            answer: $("[rt-view='forums.thread.create:poll.answer']").html(),
            question: $("[rt-view='forums.thread.create:poll.question']").html()
        };
        $(this.hooks.questionAdd).bind('click', function () {
            forums.threadCreate.addQuestion();
        });
    }
    ForumsThreadCreate.prototype.addQuestion = function () {
        var html = this.views.question;
        $(this.hooks.questions).append(html);
        this.values.questions += 1;
    };
    ForumsThreadCreate.prototype.removeQuestion = function (number) {
        this.questions.splice(number, 1);
    };
    ForumsThreadCreate.prototype.setListener = function (element, type) {
        if (type === "remove question") {
            this.setListenerRemoveQuestion(element);
        }
    };
    ForumsThreadCreate.prototype.setListenerRemoveQuestion = function (element) {
        $(element).bind('click', function (e) {
            forums.threadCreate.removeQuestion($(element).parent().parent().attr('rt-data'));
        });
    };
    return ForumsThreadCreate;
})();
$(function () {
    forums = new Forums();
});

var LivestreamReset = (function () {
    function LivestreamReset() {
        this.hooks = {};
        this.lang = {};
        this.paths = {};
        this.hooks = {
            note: "[rt-hook='livestream.reset:note']",
            spinner: "[rt-hook='livestream.reset:spinner']",
            status: "[rt-hook='livestream.reset:status']"
        };
        this.lang = {
            checking: 'checking',
            offline: 'offline',
            online: 'online',
            unknown: 'unknown'
        };
        this.paths = {
            reset: '/livestream/reset'
        };
        this.reset();
    }
    LivestreamReset.prototype.reset = function () {
        $('#loading').css({ opacity: 1 });
        var status = utilities.postAJAX(this.paths.reset, {});
        status.done(function (results) {
            results = utilities.JSONDecode(results);
            if (results.online === true) {
                livestreamReset.statusOnline();
            }
            else if (results.online === false) {
                livestreamReset.statusOffline();
            }
            else {
                livestreamReset.statusUnknown();
            }
            livestreamReset.spinnerRemove();
        });
        $('#loading').css({ opacity: 0 });
    };
    LivestreamReset.prototype.spinnerRemove = function () {
        $(this.hooks.spinner).css({
            opacity: 0
        });
    };
    LivestreamReset.prototype.statuses = function (checking, online, offline, unknown) {
        this.lang.checking = checking;
        this.lang.offline = offline;
        this.lang.online = online;
        this.lang.unknown = unknown;
    };
    LivestreamReset.prototype.statusOffline = function () {
        $(this.hooks.status).html("offline").removeClass().addClass('text-danger');
    };
    LivestreamReset.prototype.statusOnline = function () {
        $(this.hooks.status).html("online").removeClass().addClass('text-success');
    };
    LivestreamReset.prototype.statusUnknown = function () {
        $(this.hooks.status).html("unknown").removeClass().addClass('text-warning');
    };
    return LivestreamReset;
})();

var runetime;
var RuneTime = (function () {
    function RuneTime() {
        this.loading = '#loading';
    }
    return RuneTime;
})();
runetime = new RuneTime();
$(function () {
    "use strict";
    $('[data-toggle]').tooltip();
    $('.dropdown-toggle').dropdown();
    $('tbody.rowlink').rowlink();
    $('#top').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });
    $(window).scroll(function () {
        var height = $('body').height(), scroll = $(window).scrollTop(), top = $('#top');
        if (scroll > height / 10) {
            if (!$(top).hasClass('set-vis')) {
                $(top).fadeIn(200).toggleClass('set-vis');
            }
        }
        else {
            if ($(top).hasClass('set-vis')) {
                $(top).fadeOut(200).toggleClass('set-vis');
            }
        }
    });
    $('.navbar .dropdown').hover(function () {
        $(this).find('.dropdown-menu').first().stop(true, true).delay(50).slideDown();
    }, function () {
        $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp();
    });
});
var toggleSearch;
/**
 * Tympanus codrops
 * Morph search
 */
$(function () {
    var morphSearch = document.getElementById('morphsearch'), input = morphSearch.querySelector('input.morphsearch-input'), ctrlClose = morphSearch.querySelector('span.morphsearch-close'), isOpen = false;
    // show/hide search area
    toggleSearch = function (action) {
        var offsets = morphsearch.getBoundingClientRect();
        if (action === 'close') {
            classie.remove(morphSearch, 'open');
            // trick to hide input text once the search overlay closes
            // todo: hardcoded times, should be done after transition ends
            if (input.value !== '') {
                setTimeout(function () {
                    classie.add(morphSearch, 'hideInput');
                    setTimeout(function () {
                        classie.remove(morphSearch, 'hideInput');
                        input.value = '';
                    }, 300);
                }, 500);
            }
            input.blur();
        }
        else {
            classie.add(morphSearch, 'open');
        }
        isOpen = !isOpen;
    };
    // events
    ctrlClose.addEventListener('click', toggleSearch);
    // esc key closes search overlay
    // keyboard navigation events
    document.addEventListener('keydown', function (ev) {
        var keyCode = ev.keyCode || ev.which;
        if (keyCode === 27 && isOpen) {
            toggleSearch(ev);
        }
    });
    var submit = morphSearch.querySelector('button[type="submit"]');
    submit.addEventListener('click', function (ev) {
        ev.preventDefault();
    });
});
$(function () {
    $('#search-glass').click(function () {
        var form = $("#morphsearch");
        var input = $(".morphsearch-input");
        if ($(form).css('display') == 'none') {
            $(form).css('display', 'block');
        }
        else {
            $(form).css('display', 'none');
        }
        toggleSearch('focus');
    });
    $('.morphsearch-close').click(function () {
        var form = $("#morphsearch");
        $(form).animate({
            opacity: 0
        }, 500);
        setTimeout(function () {
            toggleSearch('close');
        }, 500);
        setTimeout(function () {
            $("#morphsearch").css({
                opacity: 1
            });
            $(".morphsearch").css({
                display: 'none'
            });
        }, 1000);
    });
});

var nameChecker;
var NameChecker = (function () {
    function NameChecker() {
        this.elements = {};
        this.form = {};
        this.notAllowed = [];
        this.paths = {};
        this.elements = {
            availability: '#rsn-availability',
            check: '#rsn-check-field'
        };
        this.notAllowed = ['ZnVjaw==', 'c2hpdA=='];
        this.paths = {
            check: '/name-check'
        };
        this.setForm();
    }
    NameChecker.prototype.setForm = function () {
        this.form = document.getElementById('namechecker-form');
        new stepsForm(this.form, {
            onSubmit: function () {
                var username = $('#q1').val();
                var data = {
                    rsn: username
                };
                var results = utilities.postAJAX(nameChecker.paths.check, data);
                results.done(function (results) {
                    var classSet = nameChecker.form.querySelector('.simform-inner');
                    classie.addClass(classSet, 'hide');
                    var el = nameChecker.form.querySelector('.final-message');
                    var message = 'The Runescape name <b>' + username + '</b> is ';
                    if (results.substring(0, 6) === "<html>") {
                        message += 'available.';
                    }
                    else {
                        message += 'unavailable.';
                    }
                    message += "<br /><a href='/name-check' class='btn btn-primary'>Search Again</a>";
                    el.innerHTML = message;
                    classie.addClass(el, 'show');
                });
            }
        });
    };
    return NameChecker;
})();

var news;
var News = (function () {
    function News() {
        this.elements = {};
        this.hooks = {};
        this.paths = {};
        this.elements = {
            comment: {
                contents: "#news-comment-textarea"
            }
        };
        this.hooks = {
            comment: {
                submit: "[rt-hook='news.article:comment.submit']"
            }
        };
        this.paths = {
            comment: function (id) {
                return "/news/" + id + "-name/reply";
            }
        };
        var overlay = document.getElementById('overlay');
        var overlayClose = overlay.querySelector('button');
        var header = document.getElementById('header');
        var switchBtnn = header.querySelector('button.slider-switch');
        var toggleBtnn = function () {
            if (slideshow.isFullscreen) {
                classie.add(switchBtnn, 'view-maxi');
            }
            else {
                classie.remove(switchBtnn, 'view-maxi');
            }
        };
        var toggleCtrls = function () {
            if (!slideshow.isContent) {
                classie.add(header, 'hide');
            }
        };
        var toggleCompleteCtrls = function () {
            if (!slideshow.isContent) {
                classie.remove(header, 'hide');
            }
        };
        var slideshow = new DragSlideshow(document.getElementById('slideshow'), {
            // toggle between fullscreen and minimized slideshow
            onToggle: toggleBtnn,
            // toggle the main image and the content view
            onToggleContent: toggleCtrls,
            // toggle the main image and the content view (triggered after the animation ends)
            onToggleContentComplete: toggleCompleteCtrls
        });
        var toggleSlideshow = function () {
            slideshow.toggle();
            toggleBtnn();
        };
        var closeOverlay = function () {
            classie.add(overlay, 'hide');
        };
        // toggle between fullscreen and small slideshow
        switchBtnn.addEventListener('click', toggleSlideshow);
        // close overlay
        overlayClose.addEventListener('click', closeOverlay);
        if (localStorage) {
            var showed = localStorage.getItem('news.info.showed');
            if (showed === 'true') {
                closeOverlay();
            }
        }
        this.setupActions();
    }
    News.prototype.setupActions = function () {
        $("div.info button").click(function () {
            if (localStorage) {
                localStorage.setItem('news.info.showed', 'true');
            }
        });
        $(this.hooks.comment.submit).click(function (e) {
            var id = $(e.target).parent().attr('rt-data');
            var contents = $(e.target).parent().find('textarea').val();
            news.submitComment(id, contents);
        });
    };
    News.prototype.submitComment = function (id, contents) {
        if (contents.length == 0) {
            return 0;
        }
        var data = {
            contents: contents
        };
        var results = utilities.postAJAX(this.paths.comment(id), data);
        results.done(function (results) {
            results = $.parseJSON(results);
            if (results.done === true) {
                window.location.href = results.url;
            }
            else {
            }
        });
    };
    News.prototype.toComments = function (id) {
        $("[data-content='content-" + id + "'] button.content-switch").trigger('click');
    };
    return News;
})();

var Notifications = (function () {
    function Notifications() {
        this.elements = {};
        this.paths = {};
        this.paths = {
            markRead: '/notifications/mark-read'
        };
        $("[rt-hook='hook!notifications:mark.read']").bind('click', function (e) {
            console.log(e.target.attr('rt-data'));
        });
    }
    return Notifications;
})();

var radio;
var chatbox;
var Radio = (function () {
    function Radio() {
        this.elements = {};
        this.online = true;
        this.popup = null;
        this.status = false;
        this.statusClosed = '';
        this.statusOpen = '';
        this.URL = '';
        this.varMessage = '';
        this.varStatus = '';
        this.URL = 'http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386';
        this.statusClosed = 'to listen to RuneTime Radio!';
        this.statusOpen = 'to close RuneTime Radio';
        this.varMessage = '#radio-message';
        this.varStatus = '#radio-status';
        this.update();
        this.elements = {
            statusMessage: '#radio-status-message'
        };
        $('#radio-link').click(function () {
            if (!radio.status) {
                radio.radioOpen();
            }
            else {
                radio.radioClose();
            }
        });
        $('#radio-history').click(function () {
            radio.openHistory();
        });
        $('#radio-request').click(function () {
            radio.requestOpen();
        });
        $('#radio-timetable').click(function () {
            radio.openTimetable();
        });
        $('#request-button').click(function () {
        });
        $('#pull-close').click(function () {
            radio.pullHide();
        });
    }
    Radio.prototype.openHistory = function () {
        var history = utilities.getAJAX('radio/history');
        history.done(function (history) {
            history = $.parseJSON(history);
            var music = null, html = "<table class='table'><thead><tr><td>Time</td><td>Artist</td><td>Name</td></tr></thead><tbody>";
            for (var x = 0, y = history.length; x < y; x++) {
                music = history[x];
                html += "<tr><td>" + utilities.timeAgo(music.created_at) + "</td><td> " + music.artist + "</td><td>" + music.song + "</td></tr>";
            }
            html += "</tbody></table>";
            radio.pullOpen(html);
        });
    };
    Radio.prototype.openTimetable = function () {
        var timetable = utilities.getAJAX('radio/timetable');
        timetable.done(function (timetable) {
            timetable = $.parseJSON(timetable);
            var html = "<table class='table text-center'><thead><tr><td>&nbsp;</td><td>Monday</td><td>Tuesday</td><td>Wednesday</td><td>Thursday</td><td>Friday</td><td>Saturday</td><td>Sunday</td></tr></thead><tbody>";
            for (var x = 0, y = 23; x <= y; x++) {
                html += "<tr><td>" + x + ":00</td>";
                for (var i = 0, j = 6; i <= j; i++) {
                    html += "<td>";
                    if (timetable[i] !== undefined && timetable[i][x] !== undefined) {
                        html += timetable[i][x];
                    }
                    else {
                        html += "&nbsp;";
                    }
                    html += "</td>";
                }
                html += "</tr>";
            }
            html += "</tbody></table>";
            radio.pullOpen(html);
        });
    };
    Radio.prototype.onlineSettings = function () {
        if (this.online !== true) {
            this.radioClose();
            $(this.elements.statusMessage).html("The radio has been set offline.");
        }
        else {
            $(this.elements.statusMessage).html("");
        }
    };
    Radio.prototype.pullHide = function () {
        $('#pull-contents').html('&nbsp;');
        $('#radio-pull').width('').addClass('hidden').css({
            width: '0%'
        });
        $('#radio-options').width('').css({
            width: '100%'
        });
    };
    Radio.prototype.pullOpen = function (contents) {
        $('#pull-contents').html(contents);
        $('#radio-pull').removeClass('hidden').css({
            width: '50%'
        });
        $('#radio-options').css({
            width: '50%'
        });
    };
    Radio.prototype.radioClose = function () {
        if (this.popup) {
            this.popup.close();
        }
        $(this.varMessage).html(this.statusClosed);
        this.status = false;
        $(this.varStatus).removeClass('text-success').addClass('text-danger').html("<i id='power-button' class='fa fa-power-off'></i>Off");
    };
    Radio.prototype.radioOpen = function () {
        if (this.online !== true) {
            return false;
        }
        this.popup = window.open(this.URL, 'RuneTime Radio', 'width=389,height=359');
        this.status = true;
        $(this.varMessage).html(this.statusOpen);
        $(this.varStatus).removeClass('text-danger').addClass('text-success').html("<i id='power-button' class='fa fa-power-off'></i>On");
        var pollTimer = window.setInterval(function () {
            if (radio.popup.closed !== false) {
                window.clearInterval(pollTimer);
                radio.radioClose();
            }
        }, 1000);
    };
    Radio.prototype.requestOpen = function () {
        var request = utilities.getAJAX('radio/request/song');
        request.done(function (request) {
            request = $.parseJSON(request);
            var html = "";
            if (request.response === 2) {
                html += "<form role='form'><div class='form-group'><label for='request-artist'>Artist Name</label><input type='text' id='request-artist' class='form-control' name='request-artist' placeholder='Artist Name' required /></div><div class='form-group'><label for='request-name'>Song Name</label><input type='text' id='request-name' class='form-control' name='request-name' placeholder='Song Name' required /></div><div class='form-group'><p id='request-button' class='btn btn-primary'>Request</p></div></form>";
            }
            else if (request.response === 1) {
                html += "<p class='text-warning'>Auto DJ currently does not accept song requests, sorry!";
            }
            else {
                html += "<p class='text-danger'>You must be logged in to request a song from the DJ.</p>";
            }
            radio.pullOpen(html);
        });
        setTimeout(function () {
            $('#request-button').click(function () {
                radio.requestSend();
            });
        }, 3000);
    };
    Radio.prototype.requestSend = function () {
        var data = {
            'artist': document.getElementById('request-artist').value,
            'name': document.getElementById('request-name').value
        };
        var contents = utilities.postAJAX('radio/request/song', data);
        contents.done(function (contents) {
            contents = $.parseJSON(contents);
            var html = "";
            if (contents.sent === true) {
                html = "<p class='text-success'>Your request has been sent to the DJ</p>";
            }
            else {
                html = "<p class='text-danger'>There was an error while processing your request.  Try again?";
            }
            $('#pull-contents').html(html);
        });
        this.pullHide();
        this.update();
    };
    Radio.prototype.update = function () {
        $('#requests-user-current').html('');
        var update = utilities.getAJAX('radio/update');
        update.done(function (update) {
            update = $.parseJSON(update);
            var requestsHTML = "";
            $('#radio-song-name').html(update['song']['name']);
            $('#radio-song-artist').html(update['song']['artist']);
            if (update['dj'] !== null && update['dj'] !== '') {
                $('#radio-dj').html("DJ " + update['dj']);
            }
            else {
                $('#radio-dj').html("Auto DJ");
            }
            if (update['message'] !== '' && update['message'] !== -1) {
                $("[rt-data='radio:message.contents']").html(update['message']);
            }
            else if (update['message'] === -1 && update['dj'] !== null && update['dj'] !== '') {
                $("[rt-data='radio:message.contents']").html("DJ " + update['dj'] + " is currently on air!");
            }
            else {
                $("[rt-data='radio:message.contents']").html("Auto DJ is currently on air");
            }
            for (var x = 0, y = update['requests'].length; x < y; x++) {
                var request = update['requests'][x];
                if (request.status == 0) {
                    requestsHTML += "<p>";
                }
                else if (request.status == 1) {
                    requestsHTML += "<p class='text-success'>";
                }
                else if (request.status == 2) {
                    requestsHTML += "<p class='text-danger'>";
                }
                requestsHTML += request.song_name + " by " + request.song_artist;
                requestsHTML += "</p>";
            }
            $('#requests-user-current').html(requestsHTML);
            radio.online = update.online;
            setTimeout(function () {
                radio.update();
            }, 30000);
            radio.onlineSettings();
        });
    };
    return Radio;
})();

var signature;
var Signature = (function () {
    function Signature() {
        this.paths = {};
        this.paths = {
            submit: '/signatures'
        };
        var theForm = document.getElementById('signature-form');
        new stepsForm(theForm, {
            onSubmit: function () {
                var username = $('#q1').val();
                var data = {
                    username: username
                };
                utilities.post(signature.paths.submit, data);
            }
        });
    }
    return Signature;
})();

var signupForm;
var SignupForm = (function () {
    function SignupForm() {
        this.elements = {};
        this.paths = {};
        this.elements = {
            displayName: '#display_name',
            email: '#email',
            password: '#password',
            password2: '#password2',
            securityCheck: '#security'
        };
        this.paths = {
            checkAvailability: '/get/signup/'
        };
        var stoppedTypingDisplayName, stoppedTypingEmail, stoppedTypingPassword, timeout = 500;
        $(this.elements.displayName).bind('input', function () {
            if (stoppedTypingDisplayName) {
                clearTimeout(stoppedTypingDisplayName);
            }
            stoppedTypingDisplayName = setTimeout(function () {
                signupForm.checkAvailability('display_name');
            }, timeout);
        });
        $(this.elements.email).bind('input', function () {
            if (stoppedTypingEmail) {
                clearTimeout(stoppedTypingEmail);
            }
            stoppedTypingEmail = setTimeout(function () {
                signupForm.checkAvailability('email');
            }, timeout);
        });
        $(this.elements.password).bind('input', function () {
            if (stoppedTypingPassword) {
                clearTimeout(stoppedTypingPassword);
            }
            stoppedTypingPassword = setTimeout(function () {
                signupForm.checkPassword();
            }, timeout);
        });
        $(this.elements.password2).bind('input', function () {
            if (stoppedTypingPassword) {
                clearTimeout(stoppedTypingPassword);
            }
            stoppedTypingPassword = setTimeout(function () {
                signupForm.checkPassword();
            }, timeout);
        });
        $(this.elements.securityCheck).bind('change', function () {
            signupForm.checkSecurity();
        });
        $('form').submit(function (e) {
            signupForm.submit(e);
        });
    }
    SignupForm.prototype.checkAvailability = function (field) {
        var val = $('#' + field).val();
        if (val.length === 0)
            return false;
        var url = this.paths.checkAvailability + field;
        var available;
        if (field === "display_name") {
            available = utilities.postAJAX(url, { display_name: val });
        }
        else if (field === "email") {
            available = utilities.postAJAX(url, { email: val });
        }
        available.done(function (available) {
            available = utilities.JSONDecode(available);
            if (available.available === true) {
                $('#signup-' + field).removeClass('has-error').addClass('has-success').find('.col-lg-10').find('.help-block').removeClass('show').addClass('hidden').parent().find('.glyphicon-ok').removeClass('hidden').addClass('show').parent().find('.glyphicon-remove').removeClass('show').addClass('hidden');
                return true;
            }
            else {
                $('#signup-' + field).removeClass('has-success').addClass('has-error').find('.col-lg-10').find('.help-block').removeClass('hidden').addClass('show').parent().find('.glyphicon-remove').removeClass('hidden').addClass('show').parent().find('.glyphicon-ok').removeClass('show').addClass('hidden');
                return false;
            }
        });
    };
    SignupForm.prototype.checkPassword = function () {
        var v1 = $(this.elements.password).val(), v2 = $(this.elements.password2).val();
        if (v2.length > 0) {
            if (v1 === v2) {
                this.toggleFeedback('password', true);
                this.toggleFeedback('password2', true);
                return true;
            }
            else {
                this.toggleFeedback('password', false);
                this.toggleFeedback('password2', false);
                return false;
            }
        }
    };
    SignupForm.prototype.checkSecurity = function () {
        var sliderVal = $(this.elements.securityCheck).val();
        if (sliderVal <= 10) {
            $('form button').removeAttr('disabled');
            $('form .text-danger').css({
                display: 'none'
            });
        }
        else if (sliderVal > 10) {
            $('form button').attr('disabled', 'disabled');
            $('form .text-danger').css({
                display: 'block'
            });
        }
    };
    SignupForm.prototype.submit = function (e) {
        var username = this.checkAvailability('username'), email = this.checkAvailability('email'), pass = this.checkPassword();
        if (username === true && email === true && pass === true) {
            e.preventDefault();
            return true;
        }
        else {
            e.preventDefault();
        }
    };
    SignupForm.prototype.toggleFeedback = function (field, status) {
        if (status === true) {
            $('#signup-' + field).removeClass('has-error').addClass('has-success').find('.col-lg-10').find('.glyphicon-ok').removeClass('hidden').addClass('show').parent().find('.glyphicon-remove').removeClass('show').addClass('hidden').parent().find('.help-block').removeClass('show').addClass('hidden');
        }
        else {
            $('#signup-' + field).removeClass('has-success').addClass('has-error').find('.col-lg-10').find('.glyphicon-remove').removeClass('hidden').addClass('show').parent().find('.glyphicon-ok').removeClass('show').addClass('hidden').parent().find('.help-block').removeClass('hidden').addClass('show');
        }
    };
    return SignupForm;
})();

var StaffList = (function () {
    function StaffList() {
        var members = $("[rt-hook='hook!staff.list:card']");
        $.each(members, function (index, value) {
            var val = $(value);
            var id = $(val).attr('rt-data');
            $(val).find('.front').css({
                'background-image': "url('/img/forums/photos/" + id + ".png')"
            });
            $(val).bind('touchstart', function () {
                $(this).toggleClass('hover');
            });
        });
    }
    return StaffList;
})();

;
(function (window) {
    'use strict';
    var transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    }, transEndEventName = transEndEventNames[Modernizr.prefixed('transition')], support = { transitions: Modernizr.csstransitions };
    function extend(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    }
    function stepsForm(el, options) {
        this.el = el;
        this.options = extend({}, this.options);
        extend(this.options, options);
        this._init();
    }
    stepsForm.prototype.options = {
        onSubmit: function () {
            return false;
        }
    };
    stepsForm.prototype._init = function () {
        // current question
        this.current = 0;
        // questions
        this.questions = [].slice.call(this.el.querySelectorAll('ol.questions > li'));
        // total questions
        this.questionsCount = this.questions.length;
        // show first question
        classie.addClass(this.questions[0], 'current');
        // next question control
        this.ctrlNext = this.el.querySelector('button.next');
        // progress bar
        this.progress = this.el.querySelector('div.progress');
        // question number status
        this.questionStatus = this.el.querySelector('span.number');
        // current question placeholder
        this.currentNum = this.questionStatus.querySelector('span.number-current');
        this.currentNum.innerHTML = Number(this.current + 1);
        // total questions placeholder
        this.totalQuestionNum = this.questionStatus.querySelector('span.number-total');
        this.totalQuestionNum.innerHTML = this.questionsCount;
        // error message
        this.error = this.el.querySelector('span.error-message');
        // init events
        this._initEvents();
    };
    stepsForm.prototype._initEvents = function () {
        var self = this, 
        // first input
        firstElInput = this.questions[this.current].querySelector('input'), 
        // focus
        onFocusStartFn = function () {
            firstElInput.removeEventListener('focus', onFocusStartFn);
            classie.addClass(self.ctrlNext, 'show');
        };
        // show the next question control first time the input gets focused
        firstElInput.addEventListener('focus', onFocusStartFn);
        // show next question
        this.ctrlNext.addEventListener('click', function (ev) {
            ev.preventDefault();
            self._nextQuestion();
        });
        // pressing enter will jump to next question
        document.addEventListener('keydown', function (ev) {
            var keyCode = ev.keyCode || ev.which;
            // enter
            if (keyCode === 13) {
                ev.preventDefault();
                self._nextQuestion();
            }
        });
        // disable tab
        this.el.addEventListener('keydown', function (ev) {
            var keyCode = ev.keyCode || ev.which;
            // tab
            if (keyCode === 9) {
                ev.preventDefault();
            }
        });
    };
    stepsForm.prototype._nextQuestion = function () {
        if (!this._validade()) {
            return false;
        }
        // check if form is filled
        if (this.current === this.questionsCount - 1) {
            this.isFilled = true;
        }
        // clear any previous error messages
        this._clearError();
        // current question
        var currentQuestion = this.questions[this.current];
        // increment current question iterator
        ++this.current;
        // update progress bar
        this._progress();
        if (!this.isFilled) {
            // change the current question number/status
            this._updateQuestionNumber();
            // add class "show-next" to form element (start animations)
            classie.addClass(this.el, 'show-next');
            // remove class "current" from current question and add it to the next one
            // current question
            var nextQuestion = this.questions[this.current];
            classie.removeClass(currentQuestion, 'current');
            classie.addClass(nextQuestion, 'current');
        }
        // after animation ends, remove class "show-next" from form element and change current question placeholder
        var self = this, onEndTransitionFn = function (ev) {
            if (support.transitions) {
                this.removeEventListener(transEndEventName, onEndTransitionFn);
            }
            if (self.isFilled) {
                self._submit();
            }
            else {
                classie.removeClass(self.el, 'show-next');
                self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
                self.questionStatus.removeChild(self.nextQuestionNum);
                // force the focus on the next input
                nextQuestion.querySelector('input').focus();
            }
        };
        if (support.transitions) {
            this.progress.addEventListener(transEndEventName, onEndTransitionFn);
        }
        else {
            onEndTransitionFn();
        }
    };
    // updates the progress bar by setting its width
    stepsForm.prototype._progress = function () {
        this.progress.style.width = this.current * (100 / this.questionsCount) + '%';
    };
    // changes the current question number
    stepsForm.prototype._updateQuestionNumber = function () {
        // first, create next question number placeholder
        this.nextQuestionNum = document.createElement('span');
        this.nextQuestionNum.className = 'number-next';
        this.nextQuestionNum.innerHTML = Number(this.current + 1);
        // insert it in the DOM
        this.questionStatus.appendChild(this.nextQuestionNum);
    };
    // submits the form
    stepsForm.prototype._submit = function () {
        this.options.onSubmit(this.el);
    };
    // TODO (next version..)
    // the validation function
    stepsForm.prototype._validade = function () {
        // current questionÂ´s input
        var input = this.questions[this.current].querySelector('input').value;
        if (input === '') {
            this._showError('EMPTYSTR');
            return false;
        }
        return true;
    };
    // TODO (next version..)
    stepsForm.prototype._showError = function (err) {
        var message = '';
        switch (err) {
            case 'EMPTYSTR':
                message = 'Please fill the field before continuing';
                break;
            case 'INVALIDEMAIL':
                message = 'Please fill a valid email address';
                break;
        }
        ;
        this.error.innerHTML = message;
        classie.addClass(this.error, 'show');
    };
    // clears/hides the current error message
    stepsForm.prototype._clearError = function () {
        classie.removeClass(this.error, 'show');
    };
    // add to global namespace
    window.stepsForm = stepsForm;
})(window);

var utilities;
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.prototype.currentTime = function () {
        return Math.floor(Date.now() / 1000);
    };
    Utilities.prototype.formToken = function (token) {
        token = atob(token);
        $('form').append("<input type='hidden' name='_token' value='" + token + "' />");
        var meta = document.createElement('meta');
        meta.name = '_token';
        meta.content = token;
        document.getElementsByTagName('head')[0].appendChild(meta);
    };
    Utilities.prototype.getAJAX = function (path) {
        return $.ajax({
            url: path,
            type: 'get',
            dataType: 'html',
            async: true
        });
    };
    Utilities.prototype.JSONDecode = function (json) {
        return $.parseJSON(json);
    };
    Utilities.prototype.postAJAX = function (path, data) {
        data._token = $('meta[name="_token"]').attr('content');
        return $.ajax({
            url: path,
            type: 'post',
            data: data,
            async: true
        });
    };
    Utilities.prototype.scrollTo = function (element, time) {
        $('html, body').animate({
            scrollTop: $(element).offset().top
        }, time);
    };
    Utilities.prototype.timeAgo = function (ts) {
        var nowTs = Math.floor(Date.now() / 1000), seconds = nowTs - ts;
        if (seconds > 2 * 24 * 3600) {
            return "a few days ago";
        }
        else if (seconds > 24 * 3600) {
            return "yesterday";
        }
        else if (seconds > 7200) {
            return Math.floor(seconds / 3600) + " hours ago";
        }
        else if (seconds > 3600) {
            return "an hour ago";
        }
        else if (seconds >= 120) {
            return Math.floor(seconds / 60) + " minutes ago";
        }
        else if (seconds >= 60) {
            return "1 minute ago";
        }
        else if (seconds > 1) {
            return seconds + " seconds ago";
        }
        else {
            return "1 second ago";
        }
    };
    Utilities.prototype.post = function (path, params, method) {
        method = method || 'post';
        var form = document.createElement('form');
        form.setAttribute('method', method);
        form.setAttribute('action', path);
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', params[key]);
                form.appendChild(hiddenField);
            }
        }
        var tokenVal = $("meta[name='_token']").attr('content');
        var tokenField = document.createElement('input');
        tokenField.setAttribute('type', 'hidden');
        tokenField.setAttribute('name', '_token');
        tokenField.setAttribute('value', tokenVal);
        form.appendChild(tokenField);
        document.body.appendChild(form);
        form.submit();
    };
    return Utilities;
})();
utilities = new Utilities();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvYWJvdXQudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NoYXRib3gudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NsYW4udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvZHJvcHNfZGlhbG9nRngudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbWJhdGNhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbnRhY3QudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2ZvcnVtcy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbGl2ZXN0cmVhbS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbWFpbi50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmFtZWNoZWNrZXIudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25ld3MudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25vdGlmaWNhdGlvbnMudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3JhZGlvLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zaWduYXR1cmUudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RlcHNfZm9ybS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkFib3V0IiwiQWJvdXQuY29uc3RydWN0b3IiLCJBYm91dC5zZXRMaXN0ZW4iLCJDYWxjdWxhdG9yIiwiQ2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlWFAiLCJDYWxjdWxhdG9yLmNhbGN1bGF0ZUxldmVsIiwiQ2FsY3VsYXRvci5nZXRJbmZvIiwiQ2FsY3VsYXRvci5sb2FkQ2FsYyIsIkNhbGN1bGF0b3IudXBkYXRlQ2FsYyIsIkNoYXRib3giLCJDaGF0Ym94LmNvbnN0cnVjdG9yIiwiQ2hhdGJveC5hZGRNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZSIsIkNoYXRib3guZGlzcGxheU1lc3NhZ2VzIiwiQ2hhdGJveC5lcnJvciIsIkNoYXRib3guZ2V0U3RhcnQiLCJDaGF0Ym94Lm1vZCIsIkNoYXRib3gubW9kVG9vbHMiLCJDaGF0Ym94LnBhbmVsQ2hhbm5lbHMiLCJDaGF0Ym94LnBhbmVsQ2hhdCIsIkNoYXRib3gucGFuZWxDbG9zZSIsIkNoYXRib3guc3VibWl0TWVzc2FnZSIsIkNoYXRib3guc3dpdGNoQ2hhbm5lbCIsIkNoYXRib3gudXBkYXRlIiwiQ2hhdGJveC51cGRhdGVUaW1lQWdvIiwiQ2xhbiIsIkNsYW4uY29uc3RydWN0b3IiLCJDbGFuLnNldExpc3RlbiIsImV4dGVuZCIsIkRpYWxvZ0Z4IiwiQ29tYmF0Q2FsY3VsYXRvciIsIkNvbWJhdENhbGN1bGF0b3IuY29uc3RydWN0b3IiLCJDb21iYXRDYWxjdWxhdG9yLmdldExldmVscyIsIkNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwiLCJDb21iYXRDYWxjdWxhdG9yLnZhbCIsIkNvbnRhY3QiLCJDb250YWN0LmNvbnN0cnVjdG9yIiwiQ29udGFjdC5kb25lIiwiQ29udGFjdC5lcnJvciIsIkNvbnRhY3Quc2VuZCIsIkNvbnRhY3QudmFsaWRhdGVFbWFpbCIsIkNvbnRhY3Qud2FybmluZyIsIkZvcnVtcyIsIkZvcnVtcy5jb25zdHJ1Y3RvciIsIkZvcnVtcy5kb3dudm90ZSIsIkZvcnVtcy5wb2xsVm90ZSIsIkZvcnVtcy51cHZvdGUiLCJQb3N0IiwiUG9zdC5jb25zdHJ1Y3RvciIsIlBvc3QucXVvdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUuY29uc3RydWN0b3IiLCJGb3J1bXNUaHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXIiLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbiIsIkxpdmVzdHJlYW1SZXNldCIsIkxpdmVzdHJlYW1SZXNldC5jb25zdHJ1Y3RvciIsIkxpdmVzdHJlYW1SZXNldC5yZXNldCIsIkxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c2VzIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24iLCJSdW5lVGltZSIsIlJ1bmVUaW1lLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIiLCJOYW1lQ2hlY2tlci5jb25zdHJ1Y3RvciIsIk5hbWVDaGVja2VyLnNldEZvcm0iLCJOZXdzIiwiTmV3cy5jb25zdHJ1Y3RvciIsIk5ld3Muc2V0dXBBY3Rpb25zIiwiTmV3cy5zdWJtaXRDb21tZW50IiwiTmV3cy50b0NvbW1lbnRzIiwiTm90aWZpY2F0aW9ucyIsIk5vdGlmaWNhdGlvbnMuY29uc3RydWN0b3IiLCJSYWRpbyIsIlJhZGlvLmNvbnN0cnVjdG9yIiwiUmFkaW8ub3Blbkhpc3RvcnkiLCJSYWRpby5vcGVuVGltZXRhYmxlIiwiUmFkaW8ub25saW5lU2V0dGluZ3MiLCJSYWRpby5wdWxsSGlkZSIsIlJhZGlvLnB1bGxPcGVuIiwiUmFkaW8ucmFkaW9DbG9zZSIsIlJhZGlvLnJhZGlvT3BlbiIsIlJhZGlvLnJlcXVlc3RPcGVuIiwiUmFkaW8ucmVxdWVzdFNlbmQiLCJSYWRpby51cGRhdGUiLCJTaWduYXR1cmUiLCJTaWduYXR1cmUuY29uc3RydWN0b3IiLCJTaWdudXBGb3JtIiwiU2lnbnVwRm9ybS5jb25zdHJ1Y3RvciIsIlNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkiLCJTaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQiLCJTaWdudXBGb3JtLmNoZWNrU2VjdXJpdHkiLCJTaWdudXBGb3JtLnN1Ym1pdCIsIlNpZ251cEZvcm0udG9nZ2xlRmVlZGJhY2siLCJTdGFmZkxpc3QiLCJTdGFmZkxpc3QuY29uc3RydWN0b3IiLCJzdGVwc0Zvcm0iLCJVdGlsaXRpZXMiLCJVdGlsaXRpZXMuY29uc3RydWN0b3IiLCJVdGlsaXRpZXMuY3VycmVudFRpbWUiLCJVdGlsaXRpZXMuZm9ybVRva2VuIiwiVXRpbGl0aWVzLmdldEFKQVgiLCJVdGlsaXRpZXMuSlNPTkRlY29kZSIsIlV0aWxpdGllcy5wb3N0QUpBWCIsIlV0aWxpdGllcy5zY3JvbGxUbyIsIlV0aWxpdGllcy50aW1lQWdvIiwiVXRpbGl0aWVzLnBvc3QiXSwibWFwcGluZ3MiOiJBQUFBLElBQUksS0FBSyxDQUFDO0FBQ1YsSUFBTSxLQUFLO0lBQ1ZBLFNBREtBLEtBQUtBO1FBRVRDLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLCtCQUErQkEsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLElBQUlBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLGlDQUFpQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdEVBLElBQUlBLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLGtDQUFrQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLElBQUlBLFVBQVVBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLDJDQUEyQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckZBLElBQUlBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLHVDQUF1Q0EsQ0FBQ0EsQ0FBQ0E7UUFDOUVBLElBQUlBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLDhDQUE4Q0EsQ0FBQ0EsQ0FBQ0E7UUFFdkZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3BCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUN4QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVNRCx5QkFBU0EsR0FBaEJBLFVBQWlCQSxVQUFVQTtRQUMxQkUsRUFBRUEsQ0FBQUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsVUFBVUEsR0FBR0EsUUFBUUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakZBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQ25DQSxVQUFVQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzVEQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUNGRixZQUFDQTtBQUFEQSxDQXpCQSxBQXlCQ0EsSUFBQTs7QUMxQkQsSUFBSSxVQUFVLENBQUM7QUFDZixJQUFNLFVBQVU7SUFNWkcsU0FORUEsVUFBVUEsQ0FNT0EsSUFBU0E7UUFBVEMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBS0E7UUFKNUJBLGFBQVFBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ25CQSxTQUFJQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNmQSxRQUFHQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNkQSxVQUFLQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUVaQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQTtZQUNaQSxTQUFTQSxFQUFFQSx3QkFBd0JBO1lBQ25DQSxXQUFXQSxFQUFFQSwwQkFBMEJBO1lBQ3ZDQSxNQUFNQSxFQUFFQSxvQkFBb0JBO1lBQzVCQSxLQUFLQSxFQUFFQSx5QkFBeUJBO1lBQ2hDQSxXQUFXQSxFQUFFQSwwQkFBMEJBO1NBQzFDQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQTtZQUNQQSxPQUFPQSxFQUFFQSxtQkFBbUJBO1lBQzVCQSxPQUFPQSxFQUFFQSxjQUFjQTtTQUMxQkEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0E7WUFDUkEsWUFBWUEsRUFBRUEsQ0FBQ0E7WUFDZkEsV0FBV0EsRUFBRUEsQ0FBQ0E7WUFDZEEsU0FBU0EsRUFBRUEsQ0FBQ0E7WUFDWkEsUUFBUUEsRUFBRUEsQ0FBQ0E7U0FDZEEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdkJBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBO1lBQ2xDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ2hCQSxDQUFDQSxDQUFDQSwwQkFBMEJBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQ2hDLFVBQVUsQ0FBQztnQkFDUCxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDNUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQTtJQUVKRCxnQ0FBV0EsR0FBWEEsVUFBWUEsS0FBYUE7UUFDeEJFLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEVBQ1pBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ1BBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEtBQUtBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBO1lBQy9CQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBO0lBRURGLG1DQUFjQSxHQUFkQSxVQUFlQSxFQUFVQTtRQUN4QkcsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFDWkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0JBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxFQUFFQSxDQUFBQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDN0JBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ1ZBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dCQUNmQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUNaQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVFSCw0QkFBT0EsR0FBUEE7UUFDSUksSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDcERBLElBQUlBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQzVEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFTQSxJQUFTQTtZQUMzQixJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRSxFQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBQ0QsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDREEsQ0FBQ0E7SUFFREosNkJBQVFBLEdBQVJBO1FBQ0lLLElBQUlBLElBQUlBLEdBQUdBLEVBQUNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLEVBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN0REEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsSUFBSUE7WUFDbkIsSUFBSSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUs7Z0JBQzNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxJQUFJLElBQUksTUFBTSxDQUFDO2dCQUNmLElBQUksSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO2dCQUN4RCxJQUFJLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDekQsSUFBSSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7Z0JBQ3RELElBQUksSUFBSSxrQkFBa0IsQ0FBQztnQkFDM0IsSUFBSSxJQUFJLE9BQU8sQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQTtJQUVETCwrQkFBVUEsR0FBVkE7UUFDSU0sSUFBSUEsWUFBWUEsR0FBR0EsQ0FBQ0EsRUFDaEJBLFdBQVdBLEdBQUdBLENBQUNBLEVBQ2ZBLFNBQVNBLEdBQUdBLENBQUNBLEVBQ2JBLFFBQVFBLEdBQUdBLENBQUNBLEVBQ1pBLFVBQVVBLEdBQUdBLENBQUNBLEVBQ2RBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQ2ZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLDBCQUEwQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDdEVBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDeENBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BGQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUN0Q0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDcENBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ2hDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUM5QkEsVUFBVUEsR0FBR0EsUUFBUUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbENBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLFVBQVVBLEtBQUtBLEVBQUVBLEtBQUtBO1lBQ3JDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDakMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLGdCQUFnQixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWpHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRzFCLEVBQUUsQ0FBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3RHLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsWUFBWSxJQUFJLFdBQVcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3RHLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNyRyxDQUFDO1FBQ0wsQ0FBQyxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQTtJQUNMTixpQkFBQ0E7QUFBREEsQ0FuSUEsQUFtSUNBLElBQUE7O0FDcElELElBQUksT0FBTyxDQUFDO0FBQ1osSUFBTSxPQUFPO0lBY1pPLFNBZEtBLE9BQU9BLENBY09BLE9BQWVBO1FBQWZDLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBYmxDQSxZQUFPQSxHQUFXQSxRQUFRQSxDQUFDQTtRQUMzQkEsYUFBUUEsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDbkJBLFdBQU1BLEdBQVdBLENBQUNBLENBQUNBO1FBQ25CQSxhQUFRQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNuQkEsY0FBU0EsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFDM0JBLFdBQU1BLEdBQVFBLEVBQUVBLENBQUNBO1FBQ2pCQSxVQUFLQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNoQkEsa0JBQWFBLEdBQVFBLElBQUlBLENBQUNBO1FBQzFCQSxrQkFBYUEsR0FBUUEsSUFBSUEsQ0FBQ0E7UUFDMUJBLFFBQUdBLEdBQVFBLEVBQUVBLENBQUNBO1FBRWRBLG9CQUFlQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUd6QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBO1lBQ2ZBLE9BQU9BLEVBQUVBLGtCQUFrQkE7WUFDM0JBLFFBQVFBLEVBQUVBLG1CQUFtQkE7WUFDN0JBLE9BQU9BLEVBQUVBLFVBQVVBO1lBQ25CQSxPQUFPQSxFQUFFQSxrQkFBa0JBO1lBQzNCQSxRQUFRQSxFQUFFQSxtQkFBbUJBO1NBQzdCQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQTtZQUNWQSxRQUFRQSxFQUFFQSxhQUFhQTtZQUN2QkEsU0FBU0EsRUFBRUEsY0FBY0E7WUFDekJBLFdBQVdBLEVBQUVBLG9CQUFvQkE7WUFDakNBLGdCQUFnQkEsRUFBRUEsMEJBQTBCQTtTQUM1Q0EsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0E7WUFDWkEsWUFBWUEsRUFBRUEsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUE7WUFDckNBLFdBQVdBLEVBQUVBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBO1lBQ3BDQSxRQUFRQSxFQUFFQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQTtTQUNqQ0EsQ0FBQ0E7UUFDRkEsSUFBSUEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUNyREEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsU0FBaUJBO1lBQ3hDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUM7UUFDNUMsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBO1lBQzVDLEVBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQTtZQUN2QyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxVQUFVQSxDQUFDQTtZQUNWLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ1RBLFVBQVVBLENBQUNBO1lBQ1YsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDVkEsQ0FBQ0E7SUFFTUQsNEJBQVVBLEdBQWpCQSxVQUFrQkEsT0FBWUE7UUFDN0JFLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBO1lBQzlDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxHQUFHQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUNuREEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFTUYsZ0NBQWNBLEdBQXJCQSxVQUFzQkEsT0FBT0E7UUFDNUJHLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ2JBLE1BQU1BLENBQUNBO1FBQ1JBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2RBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJQSxJQUFJQSxXQUFXQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSwyQkFBMkJBLENBQUNBO1FBQ2hFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsSUFBSUEsV0FBV0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsR0FBR0EsMkJBQTJCQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLElBQUlBLFdBQVdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEdBQUdBLDJCQUEyQkEsQ0FBQ0E7UUFDaEVBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLElBQUlBLFdBQVdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEdBQUdBLGdCQUFnQkEsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLG9DQUFvQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekVBLElBQUlBLElBQUlBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQzlDQSxJQUFJQSxJQUFJQSxTQUFTQSxDQUFDQTtRQUNsQkEsSUFBSUEsSUFBSUEsS0FBS0EsQ0FBQ0E7UUFDZEEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLElBQUlBLElBQUlBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ25DQSxDQUFDQTtRQUNEQSxJQUFJQSxJQUFJQSxvQkFBb0JBLEdBQUdBLE9BQU9BLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLEdBQUdBLE9BQU9BLENBQUNBLFdBQVdBLEdBQUdBLFFBQVFBLEdBQUdBLE9BQU9BLENBQUNBLGVBQWVBLENBQUNBO1FBQ3BIQSxJQUFJQSxJQUFJQSxNQUFNQSxDQUFDQTtRQUNmQSxJQUFJQSxJQUFJQSxRQUFRQSxDQUFDQTtRQUNqQkEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRU1ILGlDQUFlQSxHQUF0QkE7UUFDQ0ksSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDN0JBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQ25DQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxVQUFTQSxLQUFLQSxFQUFFQSxPQUFPQTtZQUN2QyxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsVUFBU0EsS0FBS0EsRUFBRUEsT0FBT0E7WUFDMUMsRUFBRSxDQUFBLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakQsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUMzQyxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7UUFDRixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLE9BQU9BLENBQUNBLGVBQWVBLEdBQUdBLEVBQUVBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUVhSixhQUFLQSxHQUFuQkEsVUFBb0JBLE9BQWVBO1FBQ2xDSyxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFFTUwsMEJBQVFBLEdBQWZBO1FBQ0NNLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNuQkEsSUFBSUEsSUFBSUEsR0FBR0E7WUFDVkEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUE7WUFDekJBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BO1NBQ3JCQSxDQUFDQTtRQUNGQSxJQUFJQSxPQUFPQSxHQUFHQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNyREEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsT0FBT0E7WUFDNUIsT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUs7Z0JBQzlDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDaEMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFTU4scUJBQUdBLEdBQVZBLFVBQVdBLEVBQU9BLEVBQUVBLFNBQWlCQTtRQUNwQ08sSUFBSUEsSUFBSUEsR0FBR0E7WUFDVkEsRUFBRUEsRUFBRUEsRUFBRUE7WUFDTkEsTUFBTUEsRUFBRUEsU0FBU0E7U0FDakJBLENBQUNBO1FBQ0ZBLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLHFCQUFxQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDOURBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLE9BQWVBO1lBQ3BDLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7WUFDOUUsQ0FBQztRQUNGLENBQUMsQ0FBQ0EsQ0FBQUE7SUFDSEEsQ0FBQ0E7SUFFYVAsZ0JBQVFBLEdBQXRCQSxVQUF1QkEsT0FBT0E7UUFDN0JRLElBQUlBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2JBLEdBQUdBLElBQUlBLGlDQUFpQ0EsQ0FBQ0E7UUFDekNBLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBO1FBQ2RBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxHQUFHQSxJQUFJQSwwQkFBMEJBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLDJFQUEyRUEsQ0FBQ0E7UUFDNUpBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLEdBQUdBLElBQUlBLDBCQUEwQkEsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsMEVBQTBFQSxDQUFDQTtRQUMzSkEsQ0FBQ0E7UUFDREEsR0FBR0EsSUFBSUEsT0FBT0EsQ0FBQ0E7UUFDZkEsR0FBR0EsSUFBSUEsTUFBTUEsQ0FBQ0E7UUFDZEEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLEdBQUdBLElBQUlBLDBCQUEwQkEsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsaUZBQWlGQSxDQUFDQTtRQUNsS0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsR0FBR0EsSUFBSUEsMEJBQTBCQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSw2RUFBNkVBLENBQUNBO1FBQzlKQSxDQUFDQTtRQUNEQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFDQTtRQUNmQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFDQTtRQUNmQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNaQSxDQUFDQTtJQUVNUiwrQkFBYUEsR0FBcEJBO1FBQ0NTLElBQUlBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLFFBQVFBO1lBQzlCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNsQixRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxRQUFRLElBQUksbUNBQW1DLENBQUM7WUFDaEQsUUFBUSxJQUFJLDhKQUE4SixDQUFDO1lBQzNLLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQztZQUNoQyxRQUFRLElBQUksd0NBQXdDLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7WUFDcEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxLQUFLLEVBQUUsS0FBSztnQkFDdEMsUUFBUSxJQUFJLHNDQUFzQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO2dCQUN4RyxRQUFRLElBQUksb0NBQW9DLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyx3QkFBd0IsQ0FBQztnQkFDN0YsUUFBUSxJQUFJLGdEQUFnRCxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLGVBQWUsQ0FBQztZQUN4SCxDQUFDLENBQUMsQ0FBQztZQUNILFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFTVQsMkJBQVNBLEdBQWhCQTtRQUNDVSxJQUFJQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNsQkEsUUFBUUEsSUFBSUEsbUNBQW1DQSxDQUFDQTtRQUNoREEsUUFBUUEsSUFBSUEsNEJBQTRCQSxDQUFDQTtRQUN6Q0EsUUFBUUEsSUFBSUEscUZBQXFGQSxDQUFDQTtRQUNsR0EsUUFBUUEsSUFBSUEsdUNBQXVDQSxDQUFDQTtRQUNwREEsUUFBUUEsSUFBSUEsUUFBUUEsQ0FBQ0E7UUFDckJBLFFBQVFBLElBQUlBLDRDQUE0Q0EsQ0FBQ0E7UUFDekRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUVNViw0QkFBVUEsR0FBakJBO1FBQ0NXLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVNWCwrQkFBYUEsR0FBcEJBO1FBQ0NZLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVDQSxPQUFPQSxFQUNQQSxRQUFRQSxDQUFDQTtRQUNWQSxPQUFPQSxHQUFHQTtZQUNUQSxRQUFRQSxFQUFFQSxRQUFRQTtZQUNsQkEsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0E7U0FDckJBLENBQUNBO1FBQ0ZBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQzdEQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFTQSxRQUFRQTtZQUM5QixRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsRUFBRSxDQUFBLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEQsVUFBVSxDQUFDO29CQUNWLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNQLEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsa0RBQWtELENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFBLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO2dCQUM3RyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO2dCQUNuRixDQUFDO2dCQUNELENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDdkQsVUFBVSxDQUFDO29CQUNWLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDeEQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFTVosK0JBQWFBLEdBQXBCQSxVQUFxQkEsSUFBWUE7UUFDaENhLElBQUlBLElBQUlBLEVBQ1BBLFFBQVFBLENBQUNBO1FBQ1ZBLElBQUlBLEdBQUdBO1lBQ05BLE9BQU9BLEVBQUVBLElBQUlBO1NBQ2JBLENBQUNBO1FBQ0ZBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLHNCQUFzQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLFFBQVFBO1lBQzlCLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDdkIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLENBQUM7UUFDRixDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBRU1iLHdCQUFNQSxHQUFiQTtRQUNDYyxJQUFJQSxJQUFJQSxHQUFHQTtZQUNWQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQTtZQUNmQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxPQUFPQTtTQUNyQkEsQ0FBQ0E7UUFDRkEsSUFBSUEsUUFBUUEsR0FBR0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLFFBQVFBO1lBQzlCLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwRCxFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUs7b0JBQ3RDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQixDQUFDO1lBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFTWQsK0JBQWFBLEdBQXBCQTtRQUNDZSxJQUFJQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN0REEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsS0FBS0EsRUFBRUEsS0FBS0E7WUFDdEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsVUFBVUEsQ0FBQ0E7WUFDVixPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQyxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNWQSxDQUFDQTtJQUNGZixjQUFDQTtBQUFEQSxDQTdSQSxBQTZSQ0EsSUFBQTs7QUM5UkQsSUFBSSxJQUFJLENBQUM7QUFDVCxJQUFNLElBQUk7SUFDVGdCLFNBREtBLElBQUlBO1FBRVJDLElBQUlBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLElBQUlBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLDBDQUEwQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEZBLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLGdDQUFnQ0EsQ0FBQ0EsQ0FBQ0E7UUFFcEVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdEJBLENBQUNBO0lBRU1ELHdCQUFTQSxHQUFoQkEsVUFBaUJBLFVBQVVBO1FBQzFCRSxFQUFFQSxDQUFBQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxVQUFVQSxHQUFHQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqRkEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLFVBQVVBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNURBLENBQUNBO0lBQ0ZBLENBQUNBO0lBQ0ZGLFdBQUNBO0FBQURBLENBbEJBLEFBa0JDQSxJQUFBOztBQ1RELENBQUM7QUFBQSxDQUFFLFVBQVUsTUFBTTtJQUVsQixZQUFZLENBQUM7SUFFYixJQUFJLE9BQU8sR0FBRyxFQUFFLFVBQVUsRUFBRyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQ3JELGlCQUFpQixHQUFHLEVBQUUsaUJBQWlCLEVBQUcsb0JBQW9CLEVBQUUsWUFBWSxFQUFHLGVBQWUsRUFBRSxhQUFhLEVBQUcsZ0JBQWdCLEVBQUUsV0FBVyxFQUFHLGNBQWMsRUFBRSxFQUNoSyxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBRSxTQUFTLENBQUMsUUFBUSxDQUFFLFdBQVcsQ0FBRSxDQUFFLEVBQ3pFLGNBQWMsR0FBRyxVQUFVLEVBQUUsRUFBRSxRQUFRO1FBQ3RDLElBQUksZUFBZSxHQUFHLFVBQVUsRUFBRTtZQUNqQyxFQUFFLENBQUEsQ0FBRSxPQUFPLENBQUMsVUFBVyxDQUFDLENBQUMsQ0FBQztnQkFDekIsRUFBRSxDQUFBLENBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxJQUFLLENBQUM7b0JBQUMsTUFBTSxDQUFDO2dCQUMvQixJQUFJLENBQUMsbUJBQW1CLENBQUUsZ0JBQWdCLEVBQUUsZUFBZSxDQUFFLENBQUM7WUFDL0QsQ0FBQztZQUNELEVBQUUsQ0FBQSxDQUFFLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUFDLENBQUM7UUFDdEUsQ0FBQyxDQUFDO1FBQ0YsRUFBRSxDQUFBLENBQUUsT0FBTyxDQUFDLFVBQVcsQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLGdCQUFnQixDQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBRSxDQUFDO1FBQzFELENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNMLGVBQWUsRUFBRSxDQUFDO1FBQ25CLENBQUM7SUFDRixDQUFDLENBQUM7SUFFSCxTQUFTLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQztRQUNwQkcsR0FBR0EsQ0FBQUEsQ0FBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEVBQUVBLENBQUFBLENBQUVBLENBQUNBLENBQUNBLGNBQWNBLENBQUVBLEdBQUdBLENBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5QkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDakJBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ1ZBLENBQUNBO0lBRUQsU0FBUyxRQUFRLENBQUUsRUFBRSxFQUFFLE9BQU87UUFDN0JDLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2JBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUVBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUVBLENBQUNBO1FBQzFDQSxNQUFNQSxDQUFFQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFFQSxDQUFDQTtRQUNoQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBRUEscUJBQXFCQSxDQUFFQSxDQUFDQTtRQUNoRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDcEJBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVELFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHO1FBQzVCLEFBQ0EsWUFEWTtRQUNaLFlBQVksRUFBRztZQUFhLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFBQyxDQUFDO1FBQzNDLGFBQWEsRUFBRztZQUFhLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFBQyxDQUFDO0tBQzVDLENBQUE7SUFFRCxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztRQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsQUFDQSxlQURlO1FBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztRQUVuRSxBQUNBLHdCQUR3QjtRQUN4QixRQUFRLENBQUMsZ0JBQWdCLENBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTtZQUNqRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDckMsRUFBRSxDQUFBLENBQUUsT0FBTyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsQ0FBQztRQUNGLENBQUMsQ0FBRSxDQUFDO1FBRUosSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUUsa0JBQWtCLENBQUUsQ0FBQyxnQkFBZ0IsQ0FBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztJQUNqRyxDQUFDLENBQUE7SUFFRCxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRztRQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsRUFBRSxDQUFBLENBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbEIsT0FBTyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBRSxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUUsQ0FBQztZQUV4QyxjQUFjLENBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUUsa0JBQWtCLENBQUUsRUFBRTtnQkFDNUQsT0FBTyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBRSxDQUFDO1lBQzVDLENBQUMsQ0FBRSxDQUFDO1lBRUosQUFDQSxvQkFEb0I7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUUsSUFBSSxDQUFFLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBRSxDQUFDO1lBRXZDLEFBQ0EsbUJBRG1CO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFFLElBQUksQ0FBRSxDQUFDO1FBQ25DLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDLENBQUM7SUFFRixBQUNBLDBCQUQwQjtJQUMxQixNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUU1QixDQUFDLENBQUMsQ0FBRSxNQUFNLENBQUUsQ0FBQzs7QUNuR2IsSUFBSSxnQkFBZ0IsQ0FBQztBQUNyQixJQUFNLGdCQUFnQjtJQU1yQkMsU0FOS0EsZ0JBQWdCQTtRQUNyQkMsV0FBTUEsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDakJBLGFBQVFBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ25CQSxXQUFNQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNqQkEsVUFBS0EsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLFVBQUtBLEdBQVFBLEVBQUVBLENBQUNBO1FBRWZBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBO1lBQ2JBLE1BQU1BLEVBQUVBLHNDQUFzQ0E7U0FDOUNBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBO1lBQ2ZBLEtBQUtBLEVBQUVBLHFDQUFxQ0E7U0FDNUNBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBO1lBQ2JBLE1BQU1BLEVBQUVBLHNDQUFzQ0E7WUFDOUNBLE9BQU9BLEVBQUVBLHVDQUF1Q0E7WUFDaERBLFFBQVFBLEVBQUVBLHdDQUF3Q0E7WUFDbERBLFlBQVlBLEVBQUVBLDRDQUE0Q0E7WUFDMURBLE1BQU1BLEVBQUVBLHNDQUFzQ0E7WUFDOUNBLE1BQU1BLEVBQUVBLHNDQUFzQ0E7WUFDOUNBLEtBQUtBLEVBQUVBLHFDQUFxQ0E7WUFDNUNBLFNBQVNBLEVBQUVBLHlDQUF5Q0E7U0FDcERBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBO1lBQ1pBLElBQUlBLEVBQUVBLG9DQUFvQ0E7U0FDMUNBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBO1lBQ1pBLFVBQVVBLEVBQUVBLDBCQUEwQkE7U0FDdENBLENBQUNBO1FBQ0ZBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzVCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzdCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQ2pDLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzFCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzlCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFDREQsb0NBQVNBLEdBQVRBO1FBQ0NFLElBQUlBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQ2xDQSxJQUFJQSxHQUFHQTtZQUNOQSxHQUFHQSxFQUFFQSxJQUFJQTtTQUNUQSxFQUNEQSxNQUFNQSxHQUFHQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMxREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsTUFBTUE7WUFDMUIsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzRCxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBQ0RGLHNDQUFXQSxHQUFYQTtRQUNDRyxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUN0REEsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDbENBLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3BDQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckVBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ25FQSxLQUFLQSxJQUFJQSxHQUFHQSxDQUFDQTtRQUNiQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBQ0RILDhCQUFHQSxHQUFIQSxVQUFJQSxJQUFZQTtRQUNmSSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSw4QkFBOEJBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3hFQSxDQUFDQTtJQUNGSix1QkFBQ0E7QUFBREEsQ0ExR0EsQUEwR0NBLElBQUE7O0FDM0dELElBQUksT0FBTyxDQUFDO0FBQ1osSUFBTSxPQUFPO0lBS1pLLFNBTEtBLE9BQU9BO1FBQ1pDLFNBQUlBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ2ZBLGFBQVFBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ25CQSxVQUFLQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNoQkEsVUFBS0EsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFFZkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0E7WUFDWEEsSUFBSUEsRUFBRUEsS0FBS0E7U0FDWEEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0E7WUFDZkEsS0FBS0EsRUFBRUEsZ0JBQWdCQTtZQUN2QkEsS0FBS0EsRUFBRUEsZ0JBQWdCQTtZQUN2QkEsT0FBT0EsRUFBRUEsa0JBQWtCQTtZQUMzQkEsUUFBUUEsRUFBRUEsbUJBQW1CQTtTQUM3QkEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0E7WUFDWkEsTUFBTUEsRUFBRUEsNEJBQTRCQTtTQUNwQ0EsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0E7WUFDWkEsSUFBSUEsRUFBRUEsaUJBQWlCQTtTQUN2QkEsQ0FBQ0E7UUFDRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDMUIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFTUQsc0JBQUlBLEdBQVhBLFVBQVlBLE9BQWVBO1FBQzFCRSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNyQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRU1GLHVCQUFLQSxHQUFaQSxVQUFhQSxPQUFlQTtRQUMzQkcsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVNSCxzQkFBSUEsR0FBWEE7UUFDQ0ksRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLHFDQUFxQ0EsQ0FBQ0EsQ0FBQ0E7UUFDekRBLENBQUNBO1FBRURBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQ3ZDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUN4Q0EsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFFNUNBLEFBQ0FBLGNBRGNBO1FBQ2RBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSx1Q0FBdUNBLENBQUNBLENBQUNBO1FBQzVEQSxDQUFDQTtRQUVEQSxJQUFJQSxJQUFJQSxHQUFHQTtZQUNWQSxRQUFRQSxFQUFFQSxPQUFPQTtZQUNqQkEsS0FBS0EsRUFBRUEsS0FBS0E7WUFDWkEsUUFBUUEsRUFBRUEsUUFBUUE7U0FDbEJBLENBQUNBO1FBQ0ZBLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENB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R0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsRUFDckNBLE9BQU9BLEdBQUdBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3pCQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsWUFBWUEsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLEVBQUVBLENBQUNBLEdBQUdBLGNBQWNBLENBQUNBO1FBQ3JEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDMUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxNQUFNQSxDQUFDQSxPQUFPQSxHQUFHQSxjQUFjQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDMUJBLENBQUNBO0lBQ0xBLENBQUNBO0lBRU1SLHdCQUFJQSxHQUFYQSxVQUFZQSxJQUFZQSxFQUFFQSxNQUFXQSxFQUFFQSxNQUFjQTtRQUNqRFMsTUFBTUEsR0FBR0EsTUFBTUEsSUFBSUEsTUFBTUEsQ0FBQ0E7UUFDMUJBLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQzFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxRQUFRQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNwQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDbENBLEdBQUdBLENBQUFBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxFQUFFQSxDQUFBQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLFdBQVdBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO2dCQUNsREEsV0FBV0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDdENBLFdBQVdBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUUvQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLENBQUNBO1FBQ0xBLENBQUNBO1FBQ0RBLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDeERBLElBQUlBLFVBQVVBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ2pEQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMxQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBRTNDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUU3QkEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDaENBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQ2xCQSxDQUFDQTtJQUNMVCxnQkFBQ0E7QUFBREEsQ0E1RkEsQUE0RkNBLElBQUE7QUFDRCxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFib3V0O1xyXG5jbGFzcyBBYm91dCB7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dmFyIGFkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctYWRzXVwiKTtcclxuXHRcdHZhciByYWRpbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctcmFkaW9dXCIpO1xyXG5cdFx0dmFyIGZvcnVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctZm9ydW1zXVwiKTtcclxuXHRcdHZhciBkaXNjbG9zdXJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1mdWxsLWRpc2Nsb3N1cmVdXCIpO1xyXG5cdFx0dmFyIG1lbWJlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLW91ci1tZW1iZXJzXVwiKTtcclxuXHRcdHZhciBjb21tdW5pdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWNvbW11bml0eS1vcGVubmVzc11cIik7XHJcblxyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oYWRzKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKHJhZGlvKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKGZvcnVtcyk7XHJcblx0XHR0aGlzLnNldExpc3RlbihkaXNjbG9zdXJlKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKG1lbWJlcnMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oY29tbXVuaXR5KTtcclxuXHRcdGNvbnNvbGUubG9nKDEpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldExpc3RlbihkbGd0cmlnZ2VyKSB7XHJcblx0XHRpZihkbGd0cmlnZ2VyKSB7XHJcblx0XHRcdHZhciBzb21lZGlhbG9nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGxndHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGlhbG9nJykpO1xyXG5cdFx0XHR2YXIgZGxnID0gbmV3IERpYWxvZ0Z4KHNvbWVkaWFsb2cpO1xyXG5cdFx0XHRkbGd0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGxnLnRvZ2dsZS5iaW5kKGRsZykpO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsInZhciBjYWxjdWxhdG9yO1xyXG5jbGFzcyBDYWxjdWxhdG9yIHtcclxuICAgIGNhbGN1bGF0b3I6IGFueTtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIGluZm86IGFueSA9IHt9O1xyXG4gICAgVVJMOiBhbnkgPSB7fTtcclxuICAgIGl0ZW1zOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxjOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50WFA6ICcjY2FsY3VsYXRvci1jdXJyZW50LXhwJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICcjY2FsY3VsYXRvci1kaXNwbGF5LW5hbWUnLFxyXG4gICAgICAgICAgICBzdWJtaXQ6ICcjY2FsY3VsYXRvci1zdWJtaXQnLFxyXG4gICAgICAgICAgICB0YWJsZTogJyNjYWxjdWxhdG9yLXRhYmxlIHRib2R5JyxcclxuICAgICAgICAgICAgdGFyZ2V0TGV2ZWw6ICcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLlVSTCA9IHtcclxuICAgICAgICAgICAgZ2V0Q2FsYzogJy9jYWxjdWxhdG9ycy9sb2FkJyxcclxuICAgICAgICAgICAgZ2V0SW5mbzogJy9nZXQvaGlzY29yZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IHtcclxuICAgICAgICAgICAgbGV2ZWxDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBsZXZlbFRhcmdldDogMCxcclxuICAgICAgICAgICAgWFBDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBYUFRhcmdldDogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdG9yID0gY2FsYztcclxuICAgICAgICAkKHRoaXMuZWxlbWVudHMuc3VibWl0KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5nZXRJbmZvKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5sb2FkQ2FsYygpO1xyXG4gICAgICAgICQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcbiAgICAgICAgICAgIH0sIDI1KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0Y2FsY3VsYXRlWFAobGV2ZWw6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgbGV2ZWw7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKiBNYXRoLnBvdygyLCBpIC8gNy4wKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0b3RhbCAvIDQpO1xyXG5cdH1cclxuXHJcblx0Y2FsY3VsYXRlTGV2ZWwoeHA6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgMTIwOyBpICs9IDEpIHtcclxuXHRcdFx0dG90YWwgKz0gTWF0aC5mbG9vcihpICsgMzAwICsgTWF0aC5wb3coMiwgaSAvIDcpKTtcclxuXHRcdFx0aWYoTWF0aC5mbG9vcih0b3RhbCAvIDQpID4geHApXHJcblx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdGVsc2UgaWYoaSA+PSA5OSlcclxuXHRcdFx0XHRyZXR1cm4gOTk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLnZhbCgpO1xyXG5cdFx0dmFyIGluZm8gPSB1dGlsaXRpZXMuZ2V0QUpBWCh0aGlzLlVSTC5nZXRJbmZvICsgJy8nICsgbmFtZSk7XHJcblx0XHRpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbzogYW55KSB7XHJcblx0XHRcdGluZm8gPSAkLnBhcnNlSlNPTihpbmZvKTtcclxuXHRcdFx0dmFyIHJlbGV2YW50ID0gaW5mb1sxM107XHJcblx0XHRcdGNhbGN1bGF0b3IuaW5mby5sZXZlbEN1cnJlbnQgPSByZWxldmFudFsxXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCA9IHJlbGV2YW50WzJdO1xyXG5cdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMuY3VycmVudFhQKS52YWwoY2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCk7XHJcblx0XHRcdGlmKCQoY2FsY3VsYXRvci5lbGVtZW50cy50YXJnZXRMZXZlbCkudmFsKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwocGFyc2VJbnQoY2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCwgMTApICsgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcblx0XHR9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2FsYygpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHtpZDogdGhpcy5jYWxjdWxhdG9yfTtcclxuICAgICAgICB2YXIgaW5mbyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5nZXRDYWxjLCBkYXRhKTtcclxuICAgICAgICBpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbykge1xyXG4gICAgICAgICAgICBpbmZvID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoaW5mbyk7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0b3IuaXRlbXMgPSBpbmZvO1xyXG4gICAgICAgICAgICAkLmVhY2goY2FsY3VsYXRvci5pdGVtcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLnhwICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD4maW5maW47PC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8L3RyPlwiO1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNhbGMoKSB7XHJcbiAgICAgICAgdmFyIGxldmVsQ3VycmVudCA9IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0ID0gMCxcclxuICAgICAgICAgICAgeHBDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgeHBUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gMCxcclxuICAgICAgICAgICAgYW1vdW50ID0gMDtcclxuICAgICAgICB0aGlzLmluZm8ubGV2ZWxUYXJnZXQgPSBwYXJzZUludCgkKCcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnKS52YWwoKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHRoaXMuaW5mby5sZXZlbFRhcmdldCk7XHJcbiAgICAgICAgaWYodGhpcy5pbmZvLlhQQ3VycmVudCA+IHRoaXMuaW5mby5YUFRhcmdldClcclxuICAgICAgICAgICAgdGhpcy5pbmZvLlhQVGFyZ2V0ID0gdGhpcy5jYWxjdWxhdGVYUChwYXJzZUludCh0aGlzLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuICAgICAgICBsZXZlbEN1cnJlbnQgPSB0aGlzLmluZm8ubGV2ZWxDdXJyZW50O1xyXG4gICAgICAgIGxldmVsVGFyZ2V0ID0gdGhpcy5pbmZvLmxldmVsVGFyZ2V0O1xyXG4gICAgICAgIHhwQ3VycmVudCA9IHRoaXMuaW5mby5YUEN1cnJlbnQ7XHJcbiAgICAgICAgeHBUYXJnZXQgPSB0aGlzLmluZm8uWFBUYXJnZXQ7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IHhwVGFyZ2V0IC0geHBDdXJyZW50O1xyXG4gICAgICAgICQuZWFjaCh0aGlzLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IE1hdGguY2VpbChkaWZmZXJlbmNlIC8gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHApO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBhbW91bnQgPCAwID8gMCA6IGFtb3VudDtcclxuICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJykgdGQ6bnRoLWNoaWxkKDQpJykuaHRtbChhbW91bnQpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxDdXJyZW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuXFxuXFxuXCIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsIDw9IGxldmVsQ3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsID4gbGV2ZWxDdXJyZW50ICYmIGxldmVsVGFyZ2V0ID49IGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtd2FybmluZycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LWRhbmdlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY2hhdGJveDtcclxuY2xhc3MgQ2hhdGJveCB7XHJcblx0Y2hhbm5lbDogc3RyaW5nID0gJyNyYWRpbyc7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGxhc3RJZDogbnVtYmVyID0gMDtcclxuXHRtZXNzYWdlczogYW55ID0gW107XHJcblx0bW9kZXJhdG9yOiBib29sZWFuID0gZmFsc2U7XHJcblx0cGlubmVkOiBhbnkgPSBbXTtcclxuXHR0aW1lczogYW55ID0ge307XHJcblx0dGltZW91dFBpbm5lZDogYW55ID0gbnVsbDtcclxuXHR0aW1lb3V0VXBkYXRlOiBhbnkgPSBudWxsO1xyXG5cdFVSTDogYW55ID0ge307XHJcblxyXG5cdHBpbm5lZERpc3BsYXllZDogYW55ID0gW107XHJcblxyXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjaGFubmVsOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhY3Rpb25zOiAnI2NoYXRib3gtYWN0aW9ucycsXHJcblx0XHRcdGNoYW5uZWxzOiAnI2NoYXRib3gtY2hhbm5lbHMnLFxyXG5cdFx0XHRjaGF0Ym94OiAnI2NoYXRib3gnLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NoYXRib3gtbWVzc2FnZScsXHJcblx0XHRcdG1lc3NhZ2VzOiAnI2NoYXRib3gtbWVzc2FnZXMnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5VUkwgPSB7XHJcblx0XHRcdGdldFN0YXJ0OiAnL2NoYXQvc3RhcnQnLFxyXG5cdFx0XHRnZXRVcGRhdGU6ICcvY2hhdC91cGRhdGUnLFxyXG5cdFx0XHRwb3N0TWVzc2FnZTogJy9jaGF0L3Bvc3QvbWVzc2FnZScsXHJcblx0XHRcdHBvc3RTdGF0dXNDaGFuZ2U6ICcvY2hhdC9wb3N0L3N0YXR1cy9jaGFuZ2UnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy50aW1lcyA9IHtcclxuXHRcdFx0bGFzdEFjdGl2aXR5OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKSxcclxuXHRcdFx0bGFzdFJlZnJlc2g6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsb2FkZWRBdDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKClcclxuXHRcdH07XHJcblx0XHR2YXIgbW9kZXJhdG9yID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L21vZGVyYXRvcicpO1xyXG5cdFx0bW9kZXJhdG9yLmRvbmUoZnVuY3Rpb24obW9kZXJhdG9yOiBzdHJpbmcpIHtcclxuXHRcdFx0bW9kZXJhdG9yID0gJC5wYXJzZUpTT04obW9kZXJhdG9yKTtcclxuXHRcdFx0Y2hhdGJveC5tb2RlcmF0b3IgPSBtb2RlcmF0b3IubW9kID09PSB0cnVlO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnBhbmVsQ2hhdCgpO1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmKGUud2hpY2ggPT09IDEzKVxyXG5cdFx0XHRcdGNoYXRib3guc3VibWl0TWVzc2FnZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhbm5lbHMpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnBhbmVsQ2hhbm5lbHMoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHR9LCA1MDAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZVRpbWVBZ28oKTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogYW55KSB7XHJcblx0XHRpZih0aGlzLmxhc3RJZCA8IG1lc3NhZ2UuaWQpIHtcclxuXHRcdFx0dGhpcy5sYXN0SWQgPSBtZXNzYWdlLmlkO1xyXG5cdFx0fVxyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgPD0gMSkge1xyXG5cdFx0XHR0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoXSA9IG1lc3NhZ2U7XHJcblx0XHRcdHRoaXMudGltZXMubGFzdEFjdGl2aXR5ID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2UobWVzc2FnZSkge1xyXG5cdFx0aWYoIW1lc3NhZ2UpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0aWYgKG1lc3NhZ2Uuc3RhdHVzID09PSAxKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctaGlkZGVuJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMikge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbm5lZCc+XCI7XHJcblx0XHR9IGVsc2UgaWYobWVzc2FnZS5zdGF0dXMgPT09IDMpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1waW5oaWQnPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnJz5cIjtcclxuXHRcdH1cclxuXHRcdGh0bWwgKz0gXCI8dGltZSBjbGFzcz0ncHVsbC1yaWdodCcgZGF0YS10cz0nXCIgKyBtZXNzYWdlLmNyZWF0ZWRfYXQgKyBcIic+XCI7XHJcblx0XHRodG1sICs9IHV0aWxpdGllcy50aW1lQWdvKG1lc3NhZ2UuY3JlYXRlZF9hdCk7XHJcblx0XHRodG1sICs9IFwiPC90aW1lPlwiO1xyXG5cdFx0aHRtbCArPSBcIjxwPlwiO1xyXG5cdFx0aWYoY2hhdGJveC5tb2RlcmF0b3IgPT09IHRydWUpIHtcclxuXHRcdFx0aHRtbCArPSBDaGF0Ym94Lm1vZFRvb2xzKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjxhIGNsYXNzPSdtZW1iZXJzLVwiICsgbWVzc2FnZS5jbGFzc19uYW1lICsgXCInPlwiICsgbWVzc2FnZS5hdXRob3JfbmFtZSArIFwiPC9hPjogXCIgKyBtZXNzYWdlLmNvbnRlbnRzX3BhcnNlZDtcclxuXHRcdGh0bWwgKz0gXCI8L3A+XCI7XHJcblx0XHRodG1sICs9IFwiPC9kaXY+XCI7XHJcblx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZXMpLnByZXBlbmQoaHRtbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2VzKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuaHRtbCgnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uKGluZGV4LCBtZXNzYWdlKSB7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaCh0aGlzLnBpbm5lZCwgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0aWYoY2hhdGJveC5waW5uZWREaXNwbGF5ZWRbbWVzc2FnZS5pZF0gIT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSA9IHRydWU7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZCA9IFtdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldFN0YXJ0KCkge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHR0aW1lOiB0aGlzLnRpbWVzLmxvYWRlZEF0LFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgnY2hhdC9zdGFydCcsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHMpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5tZXNzYWdlcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRjaGF0Ym94LnBpbm5lZCA9IHJlc3VsdHMucGlubmVkO1xyXG5cdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbW9kKGlkOiBhbnksIG5ld1N0YXR1czogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IGlkLFxyXG5cdFx0XHRzdGF0dXM6IG5ld1N0YXR1c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9zdGF0dXMtY2hhbmdlJywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNoYXRib3guZXJyb3IoXCJUaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcGVyZm9ybWluZyB0aGF0IG1vZGVyYXRpb24gY2hhbmdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgbW9kVG9vbHMobWVzc2FnZSkge1xyXG5cdFx0dmFyIHJlcyA9IFwiXCI7XHJcblx0XHRyZXMgKz0gXCI8dWwgY2xhc3M9J2xpc3QtaW5saW5lIGlubGluZSc+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyAlIDIgPT09IDApIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzICsgMSkgKyBcIik7JyB0aXRsZT0nSGlkZSBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtbWludXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDEpICsgXCIpOycgdGl0bGU9J1Nob3cgbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA+PSAyKSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDIpICsgXCIpOycgdGl0bGU9J1VucGluIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1hcnJvdy1jaXJjbGUtZG93biB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAyKSArIFwiKTsnIHRpdGxlPSdQaW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS11cCB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9XHJcblx0XHRyZXMgKz0gXCI8L2xpPlwiO1xyXG5cdFx0cmVzICs9IFwiPC91bD5cIjtcclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDaGFubmVscygpIHtcclxuXHRcdHZhciByZXNwb25zZSA9IHV0aWxpdGllcy5nZXRBSkFYKCcvY2hhdC9jaGFubmVscycpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LXBvcHVwLWNoYW5uZWxzJz5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2Nsb3NlJyBvbmNsaWNrPSdjaGF0Ym94LnBhbmVsY2xvc2UoKTsnPkNsb3NlIDxzcGFuIGFyaWEtaGlkZGVuPSd0cnVlJz4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPSdzci1vbmx5Jz5DbG9zZTwvc3Bhbj48L2J1dHRvbj5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8aDM+Q2hhbm5lbHM8L2gzPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxwIGNsYXNzPSdob2xvLXRleHQnPkN1cnJlbnRseSBvbiA8Yj4jXCIgKyBjaGF0Ym94LmNoYW5uZWwgKyBcIjwvYj48L3A+XCI7XHJcblx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPGEgb25jbGljaz1cXFwiY2hhdGJveC5zd2l0Y2hDaGFubmVsKCdcIiArIHZhbHVlLm5hbWUgKyBcIicpO1xcXCI+I1wiICsgdmFsdWUubmFtZSArIFwiPC9hPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPlwiICsgdmFsdWUubWVzc2FnZXMgKyBcIiBtZXNzYWdlczwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxzcGFuIGNsYXNzPSdob2xvLXRleHQtc2Vjb25kYXJ5Jz5MYXN0IGFjdGl2ZSBcIiArIHV0aWxpdGllcy50aW1lQWdvKHZhbHVlLmxhc3RfbWVzc2FnZSkgKyBcIjwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPC9kaXY+XCI7XHJcblx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykuaHRtbChjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYXQoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LW1lc3NhZ2VzJz48L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1hY3Rpb25zJz5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaHJlZj0nL3RyYW5zcGFyZW5jeS9tYXJrZG93bicgdGFyZ2V0PSdfYmxhbmsnIGlkPSdjaGF0Ym94LW1hcmtkb3duJz5NYXJrZG93bjwvYT5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaWQ9J2NoYXRib3gtY2hhbm5lbHMnPkNoYW5uZWxzPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGlucHV0IHR5cGU9J3RleHQnIGlkPSdjaGF0Ym94LW1lc3NhZ2UnIC8+XCI7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhdGJveCkuaHRtbChjb250ZW50cyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDbG9zZSgpIHtcclxuXHRcdHRoaXMuZ2V0U3RhcnQoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRNZXNzYWdlKCkge1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlLFxyXG5cdFx0XHRyZXNwb25zZTtcclxuXHRcdG1lc3NhZ2UgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50cyxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwucG9zdE1lc3NhZ2UsIG1lc3NhZ2UpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJycpO1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2Utc2VudCcpO1xyXG5cdFx0XHRcdH0sIDE1MDApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3BvbnNlLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IGFyZSBub3QgbG9nZ2VkIGluIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlc3BvbnNlLmVycm9yID09PSAtMikge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IHdlcmUgbXV0ZWQgZm9yIG9uZSBob3VyIGJ5IGEgc3RhZmYgbWVtYmVyIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1RoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yLiAgUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdH0sIDI1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzd2l0Y2hDaGFubmVsKG5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIGRhdGEsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0ZGF0YSA9IHtcclxuXHRcdFx0Y2hhbm5lbDogbmFtZVxyXG5cdFx0fTtcclxuXHRcdHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9jaGFubmVscy9jaGVjaycsIGRhdGEpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0aWYocmVzcG9uc2UudmFsaWQpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmNoYW5uZWwgPSBuYW1lO1xyXG5cdFx0XHRcdGNoYXRib3guZ2V0U3RhcnQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnZXJyb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGlkOiB0aGlzLmxhc3RJZCxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldFVwZGF0ZSwgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVzLmxhc3RSZWZyZXNoID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZXMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjbGVhclRpbWVvdXQoY2hhdGJveC50aW1lb3V0VXBkYXRlKTtcclxuXHRcdFx0Y2hhdGJveC50aW1lb3V0VXBkYXRlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0fSwgMTAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlVGltZUFnbygpIHtcclxuXHRcdHZhciBtZXNzYWdlcyA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuZmluZCgnLm1zZycpO1xyXG5cdFx0JC5lYWNoKG1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdHZhciB0aW1lc3RhbXAgPSAkKHZhbHVlKS5maW5kKCd0aW1lJykuYXR0cignZGF0YS10cycpO1xyXG5cdFx0XHQkKHZhbHVlKS5maW5kKCd0aW1lJykuaHRtbCh1dGlsaXRpZXMudGltZUFnbyh0aW1lc3RhbXApKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG59IiwidmFyIGNsYW47XHJcbmNsYXNzIENsYW4ge1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHZhciB3YXJuaW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctd2FybmluZ3NdXCIpO1xyXG5cdFx0dmFyIHRlbXBCYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy10ZW1wb3JhcnktYmFuc11cIik7XHJcblx0XHR2YXIgYmFucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctYmFuc11cIik7XHJcblxyXG5cdFx0dGhpcy5zZXRMaXN0ZW4od2FybmluZ3MpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4odGVtcEJhbnMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oYmFucyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuKGRsZ3RyaWdnZXIpIHtcclxuXHRcdGlmKGRsZ3RyaWdnZXIpIHtcclxuXHRcdFx0dmFyIHNvbWVkaWFsb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkbGd0cmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS1kaWFsb2cnKSk7XHJcblx0XHRcdHZhciBkbGcgPSBuZXcgRGlhbG9nRngoc29tZWRpYWxvZyk7XHJcblx0XHRcdGRsZ3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkbGcudG9nZ2xlLmJpbmQoZGxnKSk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiLyoqXHJcbiAqIGRpYWxvZ0Z4LmpzIHYxLjAuMFxyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTQsIENvZHJvcHNcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKi9cclxuOyggZnVuY3Rpb24oIHdpbmRvdyApIHtcclxuXHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgc3VwcG9ydCA9IHsgYW5pbWF0aW9ucyA6IE1vZGVybml6ci5jc3NhbmltYXRpb25zIH0sXHJcblx0XHRhbmltRW5kRXZlbnROYW1lcyA9IHsgJ1dlYmtpdEFuaW1hdGlvbicgOiAnd2Via2l0QW5pbWF0aW9uRW5kJywgJ09BbmltYXRpb24nIDogJ29BbmltYXRpb25FbmQnLCAnbXNBbmltYXRpb24nIDogJ01TQW5pbWF0aW9uRW5kJywgJ2FuaW1hdGlvbicgOiAnYW5pbWF0aW9uZW5kJyB9LFxyXG5cdFx0YW5pbUVuZEV2ZW50TmFtZSA9IGFuaW1FbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoICdhbmltYXRpb24nICkgXSxcclxuXHRcdG9uRW5kQW5pbWF0aW9uID0gZnVuY3Rpb24oIGVsLCBjYWxsYmFjayApIHtcclxuXHRcdFx0dmFyIG9uRW5kQ2FsbGJhY2tGbiA9IGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0XHRpZiggc3VwcG9ydC5hbmltYXRpb25zICkge1xyXG5cdFx0XHRcdFx0aWYoIGV2LnRhcmdldCAhPSB0aGlzICkgcmV0dXJuO1xyXG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCBhbmltRW5kRXZlbnROYW1lLCBvbkVuZENhbGxiYWNrRm4gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoIGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyApIHsgY2FsbGJhY2suY2FsbCgpOyB9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmKCBzdXBwb3J0LmFuaW1hdGlvbnMgKSB7XHJcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lciggYW5pbUVuZEV2ZW50TmFtZSwgb25FbmRDYWxsYmFja0ZuICk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0b25FbmRDYWxsYmFja0ZuKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdGZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcclxuXHRcdGZvciggdmFyIGtleSBpbiBiICkge1xyXG5cdFx0XHRpZiggYi5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XHJcblx0XHRcdFx0YVtrZXldID0gYltrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIERpYWxvZ0Z4KCBlbCwgb3B0aW9ucyApIHtcclxuXHRcdHRoaXMuZWwgPSBlbDtcclxuXHRcdHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xyXG5cdFx0ZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcclxuXHRcdHRoaXMuY3RybENsb3NlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnW2RhdGEtZGlhbG9nLWNsb3NlXScgKTtcclxuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuXHRcdC8vIGNhbGxiYWNrc1xyXG5cdFx0b25PcGVuRGlhbG9nIDogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHRcdG9uQ2xvc2VEaWFsb2cgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUuX2luaXRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHJcblx0XHQvLyBjbG9zZSBhY3Rpb25cclxuXHRcdHRoaXMuY3RybENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykgKTtcclxuXHJcblx0XHQvLyBlc2Mga2V5IGNsb3NlcyBkaWFsb2dcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSAyNyAmJiBzZWxmLmlzT3BlbiApIHtcclxuXHRcdFx0XHRzZWxmLnRvZ2dsZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0dGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnLmRpYWxvZ19fb3ZlcmxheScgKS5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpICk7XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRpZiggdGhpcy5pc09wZW4gKSB7XHJcblx0XHRcdGNsYXNzaWUucmVtb3ZlKCB0aGlzLmVsLCAnZGlhbG9nLS1vcGVuJyApO1xyXG5cdFx0XHRjbGFzc2llLmFkZCggc2VsZi5lbCwgJ2RpYWxvZy0tY2xvc2UnICk7XHJcblxyXG5cdFx0XHRvbkVuZEFuaW1hdGlvbiggdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnLmRpYWxvZ19fY29udGVudCcgKSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoIHNlbGYuZWwsICdkaWFsb2ctLWNsb3NlJyApO1xyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0XHQvLyBjYWxsYmFjayBvbiBjbG9zZVxyXG5cdFx0XHR0aGlzLm9wdGlvbnMub25DbG9zZURpYWxvZyggdGhpcyApO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNsYXNzaWUuYWRkKCB0aGlzLmVsLCAnZGlhbG9nLS1vcGVuJyApO1xyXG5cclxuXHRcdFx0Ly8gY2FsbGJhY2sgb24gb3BlblxyXG5cdFx0XHR0aGlzLm9wdGlvbnMub25PcGVuRGlhbG9nKCB0aGlzICk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmlzT3BlbiA9ICF0aGlzLmlzT3BlbjtcclxuXHR9O1xyXG5cclxuXHQvLyBhZGQgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5cdHdpbmRvdy5EaWFsb2dGeCA9IERpYWxvZ0Z4O1xyXG5cclxufSkoIHdpbmRvdyApOyIsInZhciBjb21iYXRDYWxjdWxhdG9yO1xyXG5jbGFzcyBDb21iYXRDYWxjdWxhdG9yIHtcclxuXHRjbGlja3M6IGFueSA9IHt9O1xyXG5cdGdlbmVyYXRlOiBhbnkgPSB7fTtcclxuXHRpbnB1dHM6IGFueSA9IHt9O1xyXG5cdG90aGVyOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmNsaWNrcyA9IHtcclxuXHRcdFx0c3VibWl0OiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdWJtaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5nZW5lcmF0ZSA9IHtcclxuXHRcdFx0bGV2ZWw6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmxldmVsJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaW5wdXRzID0ge1xyXG5cdFx0XHRhdHRhY2s6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmF0dGFjayddXCIsXHJcblx0XHRcdGRlZmVuY2U6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmRlZmVuY2UnXVwiLFxyXG5cdFx0XHRzdHJlbmd0aDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3RyZW5ndGgnXVwiLFxyXG5cdFx0XHRjb25zdGl0dXRpb246IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmNvbnN0aXR1dGlvbiddXCIsXHJcblx0XHRcdHJhbmdlZDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6cmFuZ2VkJ11cIixcclxuXHRcdFx0cHJheWVyOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpwcmF5ZXInXVwiLFxyXG5cdFx0XHRtYWdpYzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bWFnaWMnXVwiLFxyXG5cdFx0XHRzdW1tb25pbmc6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1bW1vbmluZyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLm90aGVyID0ge1xyXG5cdFx0XHRuYW1lOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpuYW1lJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGxvYWRDb21iYXQ6ICcvY2FsY3VsYXRvcnMvY29tYmF0L2xvYWQnXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmlucHV0cy5hdHRhY2spLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmRlZmVuY2UpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnN0cmVuZ3RoKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5jb25zdGl0dXRpb24pLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnJhbmdlZCkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucHJheWVyKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5tYWdpYykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3VtbW9uaW5nKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmNsaWNrcy5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLmdldExldmVscygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGdldExldmVscygpIHtcclxuXHRcdHZhciBuYW1lID0gJCh0aGlzLm90aGVyLm5hbWUpLnZhbCgpLFxyXG5cdFx0XHRkYXRhID0ge1xyXG5cdFx0XHRcdHJzbjogbmFtZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRsZXZlbHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5sb2FkQ29tYmF0LCBkYXRhKTtcclxuXHRcdGxldmVscy5kb25lKGZ1bmN0aW9uKGxldmVscykge1xyXG5cdFx0XHRsZXZlbHMgPSAkLnBhcnNlSlNPTihsZXZlbHMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmF0dGFjaykudmFsKGxldmVscy5hdHRhY2spO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmRlZmVuY2UpLnZhbChsZXZlbHMuZGVmZW5jZSk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuc3RyZW5ndGgpLnZhbChsZXZlbHMuc3RyZW5ndGgpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmNvbnN0aXR1dGlvbikudmFsKGxldmVscy5jb25zdGl0dXRpb24pO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnJhbmdlZCkudmFsKGxldmVscy5yYW5nZWQpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnByYXllcikudmFsKGxldmVscy5wcmF5ZXIpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLm1hZ2ljKS52YWwobGV2ZWxzLm1hZ2ljKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdW1tb25pbmcpLnZhbChsZXZlbHMuc3VtbW9uaW5nKTtcclxuXHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHVwZGF0ZUxldmVsKCkge1xyXG5cdFx0dmFyIG1lbGVlID0gdGhpcy52YWwoJ2F0dGFjaycpICsgdGhpcy52YWwoJ3N0cmVuZ3RoJyk7XHJcblx0XHR2YXIgbWFnaWMgPSAyICogdGhpcy52YWwoJ21hZ2ljJyk7XHJcblx0XHR2YXIgcmFuZ2VkID0gMiAqIHRoaXMudmFsKCdyYW5nZWQnKTtcclxuXHRcdHZhciBkZWYgPSB0aGlzLnZhbCgnZGVmZW5jZScpICsgdGhpcy52YWwoJ2NvbnN0aXR1dGlvbicpO1xyXG5cdFx0dmFyIG90aGVyID0gKC41ICogdGhpcy52YWwoJ3ByYXllcicpKSArICguNSAqIHRoaXMudmFsKCdzdW1tb25pbmcnKSk7XHJcblx0XHR2YXIgbGV2ZWwgPSAoMTMvMTApICogTWF0aC5tYXgobWVsZWUsIG1hZ2ljLCByYW5nZWQpICsgZGVmICsgb3RoZXI7XHJcblx0XHRsZXZlbCAqPSAuMjU7XHJcblx0XHRsZXZlbCA9IE1hdGguZmxvb3IobGV2ZWwpO1xyXG5cdFx0JCh0aGlzLmdlbmVyYXRlLmxldmVsKS5odG1sKGxldmVsKTtcclxuXHR9XHJcblx0dmFsKG5hbWU6IHN0cmluZykge1xyXG5cdFx0cmV0dXJuIHBhcnNlSW50KCQoXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6XCIgKyBuYW1lICsgXCInXVwiKS52YWwoKSk7XHJcblx0fVxyXG59IiwidmFyIGNvbnRhY3Q7XHJcbmNsYXNzIENvbnRhY3Qge1xyXG5cdGRhdGE6IGFueSA9IHt9O1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRob29rczogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZGF0YSA9IHtcclxuXHRcdFx0c2VudDogZmFsc2VcclxuXHRcdH07XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRlbWFpbDogJyNjb250YWN0LWVtYWlsJyxcclxuXHRcdFx0ZXJyb3I6ICcjY29udGFjdC1lcnJvcicsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY29udGFjdC1tZXNzYWdlJyxcclxuXHRcdFx0dXNlcm5hbWU6ICcjY29udGFjdC11c2VybmFtZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWhvb2s9J2NvbnRhY3Q6c3VibWl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGZvcm06ICcvY29udGFjdC9zdWJtaXQnXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbnRhY3Quc2VuZCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZG9uZShtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtc3VjY2Vzc1wiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtZGFuZ2VyXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNlbmQoKSB7XHJcblx0XHRpZih0aGlzLmRhdGEuc2VudCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5kb25lKFwiWW91IGhhdmUgYWxyZWFkeSBzZW50IHlvdXIgbWVzc2FnZSFcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGVtYWlsID0gJCh0aGlzLmVsZW1lbnRzLmVtYWlsKS52YWwoKSxcclxuXHRcdFx0bWVzc2FnZSA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlKS52YWwoKSxcclxuXHRcdFx0dXNlcm5hbWUgPSAkKHRoaXMuZWxlbWVudHMudXNlcm5hbWUpLnZhbCgpO1xyXG5cclxuXHRcdC8vIENoZWNrIGVtYWlsXHJcblx0XHRpZih0aGlzLnZhbGlkYXRlRW1haWwoZW1haWwpID09PSBmYWxzZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcnJvcihcIlRoYXQgaXMgbm90IGEgdmFsaWRhdGUgZW1haWwgYWRkcmVzcy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBtZXNzYWdlLFxyXG5cdFx0XHRlbWFpbDogZW1haWwsXHJcblx0XHRcdHVzZXJuYW1lOiB1c2VybmFtZVxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuZm9ybSwgZGF0YSk7XHJcblx0XHR0aGlzLndhcm5pbmcoXCJTZW5kaW5nIG1lc3NhZ2UuLi5cIik7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y29udGFjdC5kYXRhLnNlbnQgPSB0cnVlO1xyXG5cdFx0XHRcdGNvbnRhY3QuZG9uZShcIllvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50LlwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb250YWN0LmVycm9yKFwiVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3Igd2hpbGUgc2VuZGluZyB5b3VyIG1lc3NhZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHZhbGlkYXRlRW1haWwoZW1haWw6IGFueSkge1xyXG5cdFx0dmFyIHJlID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcblx0XHRyZXR1cm4gcmUudGVzdChlbWFpbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgd2FybmluZyhtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtd2FybmluZ1wiKTtcclxuXHR9XHJcbn0iLCJ2YXIgZm9ydW1zO1xyXG5jbGFzcyBGb3J1bXMge1xyXG5cdHB1YmxpYyBlbGVtZW50czogYW55ID0ge307XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwb3N0OiBQb3N0ID0gbnVsbDtcclxuXHRwdWJsaWMgdGhyZWFkQ3JlYXRlOiBGb3J1bXNUaHJlYWRDcmVhdGUgPSBudWxsO1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdCdwb3N0RWRpdG9yJzogXCJbcnQtZGF0YT0ncG9zdC5lZGl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHBvbGw6IHtcclxuXHRcdFx0XHR2b3RlOiBcIltydC1ob29rPSdmb3J1bTpwb2xsLnZvdGUnXVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRwb2xsOiB7XHJcblx0XHRcdFx0dm90ZTogJy9mb3J1bXMvcG9sbC92b3RlJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR2b3RlOiBmdW5jdGlvbihpZDogbnVtYmVyKSB7IHJldHVybiAnL2ZvcnVtcy9wb3N0LycgKyBpZCArICcvdm90ZSc7IH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBvc3QgPSBuZXcgUG9zdCgpO1xyXG5cdFx0JCgnLnVwdm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMudXB2b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJy5kb3dudm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMuZG93bnZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JChcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLnBvc3Q6cXVvdGUnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgaWQgPSAkKGUudGFyZ2V0KS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdGZvcnVtcy5wb3N0LnF1b3RlKGlkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnBvbGwudm90ZSkuY2xpY2soZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBkYXRhID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHRcdGZvcnVtcy5wb2xsVm90ZShkYXRhLnF1ZXN0aW9uLCBkYXRhLmFuc3dlcik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb3dudm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAnZG93bidcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwb2xsVm90ZShxdWVzdGlvbklkOiBudW1iZXIsIGFuc3dlcklkOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRhbnN3ZXI6IGFuc3dlcklkLFxyXG5cdFx0XHRxdWVzdGlvbjogcXVlc3Rpb25JZFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucG9sbC52b3RlLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3VsdHMuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQvLyBUaGUgdXNlciB3YXMgbm90IGxvZ2dlZCBpblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBVbmtub3duIGVycm9yXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vIFRPRE86IE1ha2UgYW4gZXJyb3IgZGl2XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwdm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc1Vwdm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0JChwb3N0KS5hZGRDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ3VwJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB2b3RlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMudm90ZShwb3N0SWQpLCBkYXRhKTtcclxuXHRcdHZvdGUuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5jbGFzcyBQb3N0IHtcclxuXHRwdWJsaWMgcXVvdGUoaWQ6IGFueSkge1xyXG5cdFx0dmFyIHNvdXJjZSA9ICQoXCJbcnQtZGF0YT0ncG9zdCNcIiArIGlkICtcIjpzb3VyY2UnXVwiKS5odG1sKCksXHJcblx0XHRcdHBvc3RDb250ZW50cyA9ICQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbCgpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoL1xcbi9nLCAnXFxuPicpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZsdDsvZywgJzwnKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XHJcblx0XHRzb3VyY2UgPSBcIj5cIiArIHNvdXJjZTtcclxuXHRcdGlmKHBvc3RDb250ZW50cy5sZW5ndGggPiAwKVxyXG5cdFx0XHRwb3N0Q29udGVudHMgKz0gXCJcXG5cIjtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbChwb3N0Q29udGVudHMgKyBzb3VyY2UgKyBcIlxcblwiKTtcclxuXHRcdHV0aWxpdGllcy5zY3JvbGxUbygkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKSwgMTAwMCk7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS5mb2N1cygpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRm9ydW1zVGhyZWFkQ3JlYXRlIHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBxdWVzdGlvbnM6IEFycmF5ID0gW107XHJcblx0cHVibGljIHZhbHVlczogYW55ID0ge307XHJcblx0cHVibGljIHZpZXdzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRxdWVzdGlvbkFkZDogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbi5hZGQnXVwiLFxyXG5cdFx0XHRxdWVzdGlvbnM6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb25zJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gQXJyYXkoNTAwKTtcclxuXHRcdHRoaXMudmFsdWVzID0ge1xyXG5cdFx0XHRxdWVzdGlvbnM6IDBcclxuXHRcdH07XHJcblx0XHR0aGlzLnZpZXdzID0ge1xyXG5cdFx0XHRhbnN3ZXI6ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5hbnN3ZXInXVwiKS5odG1sKCksXHJcblx0XHRcdHF1ZXN0aW9uOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24nXVwiKS5odG1sKClcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25BZGQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24oKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRwdWJsaWMgYWRkUXVlc3Rpb24oKSB7XHJcblx0XHR2YXIgaHRtbCA9IHRoaXMudmlld3MucXVlc3Rpb247XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25zKS5hcHBlbmQoaHRtbCk7XHJcblx0XHR0aGlzLnZhbHVlcy5xdWVzdGlvbnMgKz0gMTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZW1vdmVRdWVzdGlvbihudW1iZXI6IG51bWJlcikge1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMuc3BsaWNlKG51bWJlciwgMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuZXIoZWxlbWVudCwgdHlwZSkge1xyXG5cdFx0aWYodHlwZSA9PT0gXCJyZW1vdmUgcXVlc3Rpb25cIikge1xyXG5cdFx0XHR0aGlzLnNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudDogYW55KSB7XHJcblx0XHQkKGVsZW1lbnQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24oJChlbGVtZW50KS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdydC1kYXRhJykpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdGZvcnVtcyA9IG5ldyBGb3J1bXMoKTtcclxufSk7IiwiY2xhc3MgTGl2ZXN0cmVhbVJlc2V0IHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBsYW5nOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdG5vdGU6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6bm90ZSddXCIsXHJcblx0XHRcdHNwaW5uZXI6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3Bpbm5lciddXCIsXHJcblx0XHRcdHN0YXR1czogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzdGF0dXMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5sYW5nID0ge1xyXG5cdFx0XHRjaGVja2luZzogJ2NoZWNraW5nJyxcclxuXHRcdFx0b2ZmbGluZTogJ29mZmxpbmUnLFxyXG5cdFx0XHRvbmxpbmU6ICdvbmxpbmUnLFxyXG5cdFx0XHR1bmtub3duOiAndW5rbm93bidcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRyZXNldDogJy9saXZlc3RyZWFtL3Jlc2V0J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucmVzZXQoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVzZXQoKSB7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDF9KTtcclxuXHRcdHZhciBzdGF0dXMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5yZXNldCwge30pO1xyXG5cdFx0c3RhdHVzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5vbmxpbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lKCk7XHJcblx0XHRcdH0gZWxzZSBpZihyZXN1bHRzLm9ubGluZSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNVbmtub3duKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAwfSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3Bpbm5lclJlbW92ZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zcGlubmVyKS5jc3Moe1xyXG5cdFx0XHRvcGFjaXR5OiAwXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNlcyhjaGVja2luZzogc3RyaW5nLCBvbmxpbmU6IHN0cmluZywgb2ZmbGluZTogc3RyaW5nLCB1bmtub3duOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMubGFuZy5jaGVja2luZyA9IGNoZWNraW5nO1xyXG5cdFx0dGhpcy5sYW5nLm9mZmxpbmUgPSBvZmZsaW5lO1xyXG5cdFx0dGhpcy5sYW5nLm9ubGluZSA9IG9ubGluZTtcclxuXHRcdHRoaXMubGFuZy51bmtub3duID0gdW5rbm93bjtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPZmZsaW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9mZmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LWRhbmdlcicpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09ubGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvbmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNVbmtub3duKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcInVua25vd25cIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXdhcm5pbmcnKTtcclxuXHR9XHJcbn0iLCJ2YXIgcnVuZXRpbWU7XHJcbmNsYXNzIFJ1bmVUaW1lIHtcclxuXHRsb2FkaW5nOnN0cmluZyA9ICcjbG9hZGluZyc7XHJcbn1cclxucnVuZXRpbWUgPSBuZXcgUnVuZVRpbWUoKTtcclxuJChmdW5jdGlvbiAoKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblx0JCgnW2RhdGEtdG9nZ2xlXScpLnRvb2x0aXAoKTtcclxuXHQkKCcuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oKTtcclxuXHQkKCd0Ym9keS5yb3dsaW5rJykucm93bGluaygpO1xyXG5cdCQoJyN0b3AnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHQkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcblx0XHRcdHNjcm9sbFRvcDogMFxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fSk7XHJcblx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaGVpZ2h0ID0gJCgnYm9keScpLmhlaWdodCgpLFxyXG5cdFx0XHRzY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcblx0XHRcdHRvcCA9ICQoJyN0b3AnKTtcclxuXHRcdGlmKHNjcm9sbCA+IGhlaWdodC8xMCkge1xyXG5cdFx0XHRpZighJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZUluKDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZigkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlT3V0KDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblx0JCgnLm5hdmJhciAuZHJvcGRvd24nKS5ob3ZlcihmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuZGVsYXkoNTApLnNsaWRlRG93bigpO1xyXG5cdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5kZWxheSgxMDApLnNsaWRlVXAoKVxyXG5cdH0pO1xyXG59KTtcclxuXHJcbnZhciB0b2dnbGVTZWFyY2g7XHJcbi8qKlxyXG4gKiBUeW1wYW51cyBjb2Ryb3BzXHJcbiAqIE1vcnBoIHNlYXJjaFxyXG4gKi9cclxuJChmdW5jdGlvbigpIHtcclxuXHR2YXIgbW9ycGhTZWFyY2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9ycGhzZWFyY2gnKSxcclxuXHRcdGlucHV0ID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3RvcignaW5wdXQubW9ycGhzZWFyY2gtaW5wdXQnKSxcclxuXHRcdGN0cmxDbG9zZSA9IG1vcnBoU2VhcmNoLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ubW9ycGhzZWFyY2gtY2xvc2UnKSxcclxuXHRcdGlzT3BlbiA9IGZhbHNlO1xyXG5cdC8vIHNob3cvaGlkZSBzZWFyY2ggYXJlYVxyXG5cdHRvZ2dsZVNlYXJjaCA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG5cdFx0XHR2YXIgb2Zmc2V0cyA9IG1vcnBoc2VhcmNoLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cdFx0XHRpZihhY3Rpb24gPT09ICdjbG9zZScpIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZShtb3JwaFNlYXJjaCwgJ29wZW4nKTtcclxuXHJcblx0XHRcdFx0Ly8gdHJpY2sgdG8gaGlkZSBpbnB1dCB0ZXh0IG9uY2UgdGhlIHNlYXJjaCBvdmVybGF5IGNsb3Nlc1xyXG5cdFx0XHRcdC8vIHRvZG86IGhhcmRjb2RlZCB0aW1lcywgc2hvdWxkIGJlIGRvbmUgYWZ0ZXIgdHJhbnNpdGlvbiBlbmRzXHJcblx0XHRcdFx0aWYoaW5wdXQudmFsdWUgIT09ICcnKSB7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRjbGFzc2llLmFkZChtb3JwaFNlYXJjaCwgJ2hpZGVJbnB1dCcpO1xyXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGNsYXNzaWUucmVtb3ZlKG1vcnBoU2VhcmNoLCAnaGlkZUlucHV0Jyk7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXQudmFsdWUgPSAnJztcclxuXHRcdFx0XHRcdFx0fSwgMzAwKTtcclxuXHRcdFx0XHRcdH0sIDUwMCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpbnB1dC5ibHVyKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQobW9ycGhTZWFyY2gsICdvcGVuJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlzT3BlbiA9ICFpc09wZW47XHJcblx0XHR9O1xyXG5cclxuXHQvLyBldmVudHNcclxuXHRjdHJsQ2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVTZWFyY2gpO1xyXG5cdC8vIGVzYyBrZXkgY2xvc2VzIHNlYXJjaCBvdmVybGF5XHJcblx0Ly8ga2V5Ym9hcmQgbmF2aWdhdGlvbiBldmVudHNcclxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZXYpIHtcclxuXHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdGlmKGtleUNvZGUgPT09IDI3ICYmIGlzT3Blbikge1xyXG5cdFx0XHR0b2dnbGVTZWFyY2goZXYpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHR2YXIgc3VibWl0ID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcclxuXHRzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldikge1xyXG5cdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHR9KTtcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdCQoJyNzZWFyY2gtZ2xhc3MnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdHZhciBmb3JtID0gJChcIiNtb3JwaHNlYXJjaFwiKTtcclxuXHRcdHZhciBpbnB1dCA9ICQoXCIubW9ycGhzZWFyY2gtaW5wdXRcIik7XHJcblx0XHRpZigkKGZvcm0pLmNzcygnZGlzcGxheScpID09ICdub25lJykge1xyXG5cdFx0XHQkKGZvcm0pLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JChmb3JtKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZVNlYXJjaCgnZm9jdXMnKTtcclxuXHR9KTtcclxuXHQkKCcubW9ycGhzZWFyY2gtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdHZhciBmb3JtID0gJChcIiNtb3JwaHNlYXJjaFwiKTtcclxuXHRcdCQoZm9ybSkuYW5pbWF0ZSh7XHJcblx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdH0sIDUwMCk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0b2dnbGVTZWFyY2goJ2Nsb3NlJyk7XHJcblx0XHR9LCA1MDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0JChcIiNtb3JwaHNlYXJjaFwiKS5jc3Moe1xyXG5cdFx0XHRcdG9wYWNpdHk6IDFcclxuXHRcdFx0fSk7XHJcblx0XHRcdCQoXCIubW9ycGhzZWFyY2hcIikuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnbm9uZSdcclxuXHRcdFx0fSk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9KVxyXG59KTsiLCJ2YXIgbmFtZUNoZWNrZXI7XHJcbmNsYXNzIE5hbWVDaGVja2VyIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0Zm9ybTogYW55ID0ge307XHJcblx0bm90QWxsb3dlZDogYW55ID0gW107XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0YXZhaWxhYmlsaXR5OiAnI3Jzbi1hdmFpbGFiaWxpdHknLFxyXG5cdFx0XHRjaGVjazogJyNyc24tY2hlY2stZmllbGQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ub3RBbGxvd2VkID0gWydablZqYXc9PScsICdjMmhwZEE9PSddO1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2s6ICcvbmFtZS1jaGVjaydcclxuXHRcdH07XHJcblx0XHR0aGlzLnNldEZvcm0oKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRGb3JtKCkge1xyXG5cdFx0dGhpcy5mb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVjaGVja2VyLWZvcm0nKTtcclxuXHRcdG5ldyBzdGVwc0Zvcm0oIHRoaXMuZm9ybSwge1xyXG5cdFx0XHRvblN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHVzZXJuYW1lID0gJCgnI3ExJykudmFsKCk7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0XHRyc246IHVzZXJuYW1lXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWChuYW1lQ2hlY2tlci5wYXRocy5jaGVjaywgZGF0YSk7XHJcblx0XHRcdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRcdFx0dmFyIGNsYXNzU2V0ID0gbmFtZUNoZWNrZXIuZm9ybS5xdWVyeVNlbGVjdG9yKCcuc2ltZm9ybS1pbm5lcicpO1xyXG5cdFx0XHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyhjbGFzc1NldCwnaGlkZScpO1xyXG5cdFx0XHRcdFx0dmFyIGVsID0gbmFtZUNoZWNrZXIuZm9ybS5xdWVyeVNlbGVjdG9yKCcuZmluYWwtbWVzc2FnZScpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBtZXNzYWdlID0gJ1RoZSBSdW5lc2NhcGUgbmFtZSA8Yj4nICsgdXNlcm5hbWUgKyAnPC9iPiBpcyAnO1xyXG5cdFx0XHRcdFx0aWYocmVzdWx0cy5zdWJzdHJpbmcoMCwgNikgPT09IFwiPGh0bWw+XCIpIHtcclxuXHRcdFx0XHRcdFx0bWVzc2FnZSArPSAnYXZhaWxhYmxlLic7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRtZXNzYWdlICs9ICd1bmF2YWlsYWJsZS4nO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdG1lc3NhZ2UgKz0gXCI8YnIgLz48YSBocmVmPScvbmFtZS1jaGVjaycgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+U2VhcmNoIEFnYWluPC9hPlwiO1xyXG5cclxuXHRcdFx0XHRcdGVsLmlubmVySFRNTCA9IG1lc3NhZ2U7XHJcblxyXG5cdFx0XHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyhlbCwgJ3Nob3cnKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cdH1cclxufSIsInZhciBuZXdzO1xyXG5jbGFzcyBOZXdzIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0aG9va3M6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRjb21tZW50OiB7XHJcblx0XHRcdFx0Y29udGVudHM6IFwiI25ld3MtY29tbWVudC10ZXh0YXJlYVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRjb21tZW50OiB7XHJcblx0XHRcdFx0c3VibWl0OiBcIltydC1ob29rPSduZXdzLmFydGljbGU6Y29tbWVudC5zdWJtaXQnXVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjb21tZW50OiBmdW5jdGlvbihpZDogYW55KSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiL25ld3MvXCIgKyBpZCArIFwiLW5hbWUvcmVwbHlcIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ292ZXJsYXknKTtcclxuXHRcdHZhciBvdmVybGF5Q2xvc2UgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpO1xyXG5cdFx0dmFyIGhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZWFkZXInKTtcclxuXHRcdHZhciBzd2l0Y2hCdG5uID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zbGlkZXItc3dpdGNoJyk7XHJcblx0XHR2YXIgdG9nZ2xlQnRubiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihzbGlkZXNob3cuaXNGdWxsc2NyZWVuKSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQoc3dpdGNoQnRubiwgJ3ZpZXctbWF4aScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKHN3aXRjaEJ0bm4sICd2aWV3LW1heGknKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciB0b2dnbGVDdHJscyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighc2xpZGVzaG93LmlzQ29udGVudCkge1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkKGhlYWRlciwgJ2hpZGUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciB0b2dnbGVDb21wbGV0ZUN0cmxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFzbGlkZXNob3cuaXNDb250ZW50KSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoaGVhZGVyLCAnaGlkZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHNsaWRlc2hvdyA9IG5ldyBEcmFnU2xpZGVzaG93KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbGlkZXNob3cnKSwge1xyXG5cdFx0XHQvLyB0b2dnbGUgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBtaW5pbWl6ZWQgc2xpZGVzaG93XHJcblx0XHRcdG9uVG9nZ2xlOiB0b2dnbGVCdG5uLFxyXG5cdFx0XHQvLyB0b2dnbGUgdGhlIG1haW4gaW1hZ2UgYW5kIHRoZSBjb250ZW50IHZpZXdcclxuXHRcdFx0b25Ub2dnbGVDb250ZW50OiB0b2dnbGVDdHJscyxcclxuXHRcdFx0Ly8gdG9nZ2xlIHRoZSBtYWluIGltYWdlIGFuZCB0aGUgY29udGVudCB2aWV3ICh0cmlnZ2VyZWQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBlbmRzKVxyXG5cdFx0XHRvblRvZ2dsZUNvbnRlbnRDb21wbGV0ZTogdG9nZ2xlQ29tcGxldGVDdHJsc1xyXG5cdFx0fSk7XHJcblx0XHR2YXIgdG9nZ2xlU2xpZGVzaG93ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNsaWRlc2hvdy50b2dnbGUoKTtcclxuXHRcdFx0dG9nZ2xlQnRubigpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBjbG9zZU92ZXJsYXkgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0Y2xhc3NpZS5hZGQob3ZlcmxheSwgJ2hpZGUnKTtcclxuXHRcdH07XHJcblx0XHQvLyB0b2dnbGUgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBzbWFsbCBzbGlkZXNob3dcclxuXHRcdHN3aXRjaEJ0bm4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVTbGlkZXNob3cpO1xyXG5cdFx0Ly8gY2xvc2Ugb3ZlcmxheVxyXG5cdFx0b3ZlcmxheUNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VPdmVybGF5KTtcclxuXHJcblx0XHRpZihsb2NhbFN0b3JhZ2UpIHtcclxuXHRcdFx0dmFyIHNob3dlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCduZXdzLmluZm8uc2hvd2VkJyk7XHJcblx0XHRcdGlmKHNob3dlZCA9PT0gJ3RydWUnKSB7XHJcblx0XHRcdFx0Y2xvc2VPdmVybGF5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnNldHVwQWN0aW9ucygpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldHVwQWN0aW9ucygpIHtcclxuXHRcdCQoXCJkaXYuaW5mbyBidXR0b25cIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKGxvY2FsU3RvcmFnZSkge1xyXG5cdFx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCduZXdzLmluZm8uc2hvd2VkJywgJ3RydWUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaG9va3MuY29tbWVudC5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgaWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdHZhciBjb250ZW50cyA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmZpbmQoJ3RleHRhcmVhJykudmFsKCk7XHJcblx0XHRcdG5ld3Muc3VibWl0Q29tbWVudChpZCwgY29udGVudHMpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3VibWl0Q29tbWVudChpZCwgY29udGVudHMpIHtcclxuXHRcdGlmKGNvbnRlbnRzLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuY29tbWVudChpZCksIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzdWx0cy51cmw7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZXJyb3JcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB0b0NvbW1lbnRzKGlkOiBudW1iZXIpIHtcclxuXHRcdCQoXCJbZGF0YS1jb250ZW50PSdjb250ZW50LVwiICsgaWQgK1wiJ10gYnV0dG9uLmNvbnRlbnQtc3dpdGNoXCIpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcblx0fVxyXG59IiwiY2xhc3MgTm90aWZpY2F0aW9ucyB7XHJcbiAgICBlbGVtZW50czogYW55ID0ge307XHJcbiAgICBwYXRoczogYW55ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnBhdGhzID0ge1xyXG4gICAgICAgICAgICBtYXJrUmVhZDogJy9ub3RpZmljYXRpb25zL21hcmstcmVhZCdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoXCJbcnQtaG9vaz0naG9vayFub3RpZmljYXRpb25zOm1hcmsucmVhZCddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlLnRhcmdldC5hdHRyKCdydC1kYXRhJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwidmFyIHJhZGlvO1xyXG52YXIgY2hhdGJveDtcclxuY2xhc3MgUmFkaW8ge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRvbmxpbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdHBvcHVwOiBhbnkgPSBudWxsO1xyXG5cdHN0YXR1czogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHN0YXR1c0Nsb3NlZDogc3RyaW5nID0gJyc7XHJcblx0c3RhdHVzT3Blbjogc3RyaW5nID0gJyc7XHJcblx0VVJMOiBzdHJpbmcgPSAnJztcclxuXHR2YXJNZXNzYWdlOiBzdHJpbmcgPSAnJztcclxuXHR2YXJTdGF0dXM6IHN0cmluZyA9ICcnO1xyXG5cclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLlVSTCA9ICdodHRwOi8vYXBwcy5zdHJlYW1saWNlbnNpbmcuY29tL3BsYXllci1wb3B1cC5waHA/c2lkPTI1Nzkmc3RyZWFtX2lkPTQzODYnO1xyXG5cdFx0dGhpcy5zdGF0dXNDbG9zZWQgPSAndG8gbGlzdGVuIHRvIFJ1bmVUaW1lIFJhZGlvISc7XHJcblx0XHR0aGlzLnN0YXR1c09wZW4gPSAndG8gY2xvc2UgUnVuZVRpbWUgUmFkaW8nO1xyXG5cdFx0dGhpcy52YXJNZXNzYWdlID0gJyNyYWRpby1tZXNzYWdlJztcclxuXHRcdHRoaXMudmFyU3RhdHVzID0gJyNyYWRpby1zdGF0dXMnO1xyXG5cdFx0dGhpcy51cGRhdGUoKTtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdHN0YXR1c01lc3NhZ2U6ICcjcmFkaW8tc3RhdHVzLW1lc3NhZ2UnXHJcblx0XHR9O1xyXG5cdFx0JCgnI3JhZGlvLWxpbmsnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoIXJhZGlvLnN0YXR1cykge1xyXG5cdFx0XHRcdHJhZGlvLnJhZGlvT3BlbigpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJhZGlvLnJhZGlvQ2xvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLWhpc3RvcnknKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3Blbkhpc3RvcnkoKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby1yZXF1ZXN0JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLnJlcXVlc3RPcGVuKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmFkaW8tdGltZXRhYmxlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLm9wZW5UaW1ldGFibGUoKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyZXF1ZXN0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3B1bGwtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ucHVsbEhpZGUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5IaXN0b3J5KCkge1xyXG5cdFx0dmFyIGhpc3RvcnkgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vaGlzdG9yeScpO1xyXG5cdFx0aGlzdG9yeS5kb25lKGZ1bmN0aW9uKGhpc3Rvcnk6IHN0cmluZykge1xyXG5cdFx0XHRoaXN0b3J5ID0gJC5wYXJzZUpTT04oaGlzdG9yeSk7XHJcblx0XHRcdHZhciBtdXNpYyA9IG51bGwsXHJcblx0XHRcdFx0aHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSc+PHRoZWFkPjx0cj48dGQ+VGltZTwvdGQ+PHRkPkFydGlzdDwvdGQ+PHRkPk5hbWU8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSBoaXN0b3J5Lmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG5cdFx0XHRcdG11c2ljID0gaGlzdG9yeVt4XTtcclxuXHRcdFx0XHRodG1sICs9IFwiPHRyPjx0ZD5cIiArIHV0aWxpdGllcy50aW1lQWdvKG11c2ljLmNyZWF0ZWRfYXQpICsgXCI8L3RkPjx0ZD4gXCIgKyBtdXNpYy5hcnRpc3QgKyBcIjwvdGQ+PHRkPlwiICsgbXVzaWMuc29uZyArIFwiPC90ZD48L3RyPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRodG1sICs9IFwiPC90Ym9keT48L3RhYmxlPlwiO1xyXG5cdFx0XHRyYWRpby5wdWxsT3BlbihodG1sKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5UaW1ldGFibGUoKSB7XHJcblx0XHR2YXIgdGltZXRhYmxlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3RpbWV0YWJsZScpO1xyXG5cdFx0dGltZXRhYmxlLmRvbmUoZnVuY3Rpb24odGltZXRhYmxlOiBzdHJpbmcpIHtcclxuXHRcdFx0dGltZXRhYmxlID0gJC5wYXJzZUpTT04odGltZXRhYmxlKTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0ndGFibGUgdGV4dC1jZW50ZXInPjx0aGVhZD48dHI+PHRkPiZuYnNwOzwvdGQ+PHRkPk1vbmRheTwvdGQ+PHRkPlR1ZXNkYXk8L3RkPjx0ZD5XZWRuZXNkYXk8L3RkPjx0ZD5UaHVyc2RheTwvdGQ+PHRkPkZyaWRheTwvdGQ+PHRkPlNhdHVyZGF5PC90ZD48dGQ+U3VuZGF5PC90ZD48L3RyPjwvdGhlYWQ+PHRib2R5PlwiO1xyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gMjM7IHggPD0geTsgeCsrKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjx0cj48dGQ+XCIgKyB4ICsgXCI6MDA8L3RkPlwiO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDAsIGogPSA2OyBpIDw9IGo7IGkrKykge1xyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjx0ZD5cIjtcclxuXHRcdFx0XHRcdGlmKHRpbWV0YWJsZVtpXSAhPT0gdW5kZWZpbmVkICYmIHRpbWV0YWJsZVtpXVt4XSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdGh0bWwgKz0gdGltZXRhYmxlW2ldW3hdO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSBcIiZuYnNwO1wiO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGh0bWwgKz0gXCI8L3RkPlwiO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aHRtbCArPSBcIjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb25saW5lU2V0dGluZ3MoKSB7XHJcblx0XHRpZih0aGlzLm9ubGluZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHR0aGlzLnJhZGlvQ2xvc2UoKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLnN0YXR1c01lc3NhZ2UpLmh0bWwoXCJUaGUgcmFkaW8gaGFzIGJlZW4gc2V0IG9mZmxpbmUuXCIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLnN0YXR1c01lc3NhZ2UpLmh0bWwoXCJcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcHVsbEhpZGUoKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoJyZuYnNwOycpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS53aWR0aCgnJykuXHJcblx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHR3aWR0aDogJzAlJ1xyXG5cdFx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1vcHRpb25zJykud2lkdGgoJycpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMTAwJSdcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcHVsbE9wZW4oY29udGVudHM6IHN0cmluZykge1xyXG5cdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdCQoJyNyYWRpby1wdWxsJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnNTAlJ1xyXG5cdFx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1vcHRpb25zJykuY3NzKHtcclxuXHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByYWRpb0Nsb3NlKCkge1xyXG5cdFx0aWYodGhpcy5wb3B1cCkge1xyXG5cdFx0XHR0aGlzLnBvcHVwLmNsb3NlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNDbG9zZWQpO1xyXG5cdFx0dGhpcy5zdGF0dXMgPSBmYWxzZTtcclxuXHRcdCQodGhpcy52YXJTdGF0dXMpXHJcblx0XHRcdC5yZW1vdmVDbGFzcygndGV4dC1zdWNjZXNzJylcclxuXHRcdFx0LmFkZENsYXNzKCd0ZXh0LWRhbmdlcicpXHJcblx0XHRcdC5odG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9mZlwiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByYWRpb09wZW4oKSB7XHJcblx0XHRpZih0aGlzLm9ubGluZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5wb3B1cCA9IHdpbmRvdy5vcGVuKHRoaXMuVVJMLCAnUnVuZVRpbWUgUmFkaW8nLCAnd2lkdGg9Mzg5LGhlaWdodD0zNTknKTtcclxuXHRcdHRoaXMuc3RhdHVzID0gdHJ1ZTtcclxuXHRcdCQodGhpcy52YXJNZXNzYWdlKS5odG1sKHRoaXMuc3RhdHVzT3Blbik7XHJcblx0XHQkKHRoaXMudmFyU3RhdHVzKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoJ3RleHQtZGFuZ2VyJykuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXN1Y2Nlc3MnKS5cclxuXHRcdFx0aHRtbChcIjxpIGlkPSdwb3dlci1idXR0b24nIGNsYXNzPSdmYSBmYS1wb3dlci1vZmYnPjwvaT5PblwiKTtcclxuXHRcdHZhciBwb2xsVGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihyYWRpby5wb3B1cC5jbG9zZWQgIT09IGZhbHNlKSB7XHJcblx0XHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwocG9sbFRpbWVyKTtcclxuXHRcdFx0XHRyYWRpby5yYWRpb0Nsb3NlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlcXVlc3RPcGVuKCkge1xyXG5cdFx0dmFyIHJlcXVlc3QgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJyk7XHJcblx0XHRyZXF1ZXN0LmRvbmUoZnVuY3Rpb24ocmVxdWVzdDogc3RyaW5nKSB7XHJcblx0XHRcdHJlcXVlc3QgPSAkLnBhcnNlSlNPTihyZXF1ZXN0KTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAyKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxmb3JtIHJvbGU9J2Zvcm0nPjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtYXJ0aXN0Jz5BcnRpc3QgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LWFydGlzdCcgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1hcnRpc3QnIHBsYWNlaG9sZGVyPSdBcnRpc3QgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48bGFiZWwgZm9yPSdyZXF1ZXN0LW5hbWUnPlNvbmcgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LW5hbWUnIGNsYXNzPSdmb3JtLWNvbnRyb2wnIG5hbWU9J3JlcXVlc3QtbmFtZScgcGxhY2Vob2xkZXI9J1NvbmcgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48cCBpZD0ncmVxdWVzdC1idXR0b24nIGNsYXNzPSdidG4gYnRuLXByaW1hcnknPlJlcXVlc3Q8L3A+PC9kaXY+PC9mb3JtPlwiO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5yZXNwb25zZSA9PT0gMSkge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8cCBjbGFzcz0ndGV4dC13YXJuaW5nJz5BdXRvIERKIGN1cnJlbnRseSBkb2VzIG5vdCBhY2NlcHQgc29uZyByZXF1ZXN0cywgc29ycnkhXCI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+WW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHJlcXVlc3QgYSBzb25nIGZyb20gdGhlIERKLjwvcD5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJhZGlvLnJlcXVlc3RTZW5kKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMzAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVxdWVzdFNlbmQoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J2FydGlzdCc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LWFydGlzdCcpLnZhbHVlLFxyXG5cdFx0XHQnbmFtZSc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LW5hbWUnKS52YWx1ZVxyXG5cdFx0fTtcclxuXHRcdHZhciBjb250ZW50cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJywgZGF0YSk7XHJcblx0XHRjb250ZW50cy5kb25lKGZ1bmN0aW9uKGNvbnRlbnRzOiBzdHJpbmcpIHtcclxuXHRcdFx0Y29udGVudHMgPSAkLnBhcnNlSlNPTihjb250ZW50cyk7XHJcblx0XHRcdHZhciBodG1sID0gXCJcIjtcclxuXHRcdFx0aWYoY29udGVudHMuc2VudCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LXN1Y2Nlc3MnPllvdXIgcmVxdWVzdCBoYXMgYmVlbiBzZW50IHRvIHRoZSBESjwvcD5cIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC4gIFRyeSBhZ2Fpbj9cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnB1bGxIaWRlKCk7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwZGF0ZSgpIHtcclxuXHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKCcnKTtcclxuXHRcdHZhciB1cGRhdGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdXBkYXRlJyk7XHJcblx0XHR1cGRhdGUuZG9uZShmdW5jdGlvbih1cGRhdGUpIHtcclxuXHRcdFx0dXBkYXRlID0gJC5wYXJzZUpTT04odXBkYXRlKTtcclxuXHRcdFx0dmFyIHJlcXVlc3RzSFRNTCA9IFwiXCI7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLW5hbWUnKS5odG1sKHVwZGF0ZVsnc29uZyddWyduYW1lJ10pO1xyXG5cdFx0XHQkKCcjcmFkaW8tc29uZy1hcnRpc3QnKS5odG1sKHVwZGF0ZVsnc29uZyddWydhcnRpc3QnXSk7XHJcblx0XHRcdGlmKHVwZGF0ZVsnZGonXSAhPT0gbnVsbCAmJiB1cGRhdGVbJ2RqJ10gIT09ICcnKSB7XHJcblx0XHRcdFx0JCgnI3JhZGlvLWRqJykuaHRtbChcIkRKIFwiICsgdXBkYXRlWydkaiddKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiQXV0byBESlwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodXBkYXRlWydtZXNzYWdlJ10gIT09ICcnICYmIHVwZGF0ZVsnbWVzc2FnZSddICE9PSAtMSkge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwodXBkYXRlWydtZXNzYWdlJ10pO1xyXG5cdFx0XHR9IGVsc2UgaWYodXBkYXRlWydtZXNzYWdlJ10gPT09IC0xICYmIHVwZGF0ZVsnZGonXSAhPT0gbnVsbCAmJiB1cGRhdGVbJ2RqJ10gIT09ICcnKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkRKIFwiICsgdXBkYXRlWydkaiddICsgXCIgaXMgY3VycmVudGx5IG9uIGFpciFcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkF1dG8gREogaXMgY3VycmVudGx5IG9uIGFpclwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IHVwZGF0ZVsncmVxdWVzdHMnXS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9IHVwZGF0ZVsncmVxdWVzdHMnXVt4XTtcclxuXHRcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PSAwKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cD5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMSkge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+XCI7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09IDIpIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gcmVxdWVzdC5zb25nX25hbWUgKyBcIiBieSBcIiArIHJlcXVlc3Quc29uZ19hcnRpc3Q7XHJcblx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPC9wPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKCcjcmVxdWVzdHMtdXNlci1jdXJyZW50JykuaHRtbChyZXF1ZXN0c0hUTUwpO1xyXG5cclxuXHRcdFx0cmFkaW8ub25saW5lID0gdXBkYXRlLm9ubGluZTtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyYWRpby51cGRhdGUoKTtcclxuXHRcdFx0fSwgMzAwMDApO1xyXG5cdFx0XHRyYWRpby5vbmxpbmVTZXR0aW5ncygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59IiwidmFyIHNpZ25hdHVyZTtcclxuY2xhc3MgU2lnbmF0dXJlIHtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0c3VibWl0OiAnL3NpZ25hdHVyZXMnXHJcblx0XHR9O1xyXG5cdFx0dmFyIHRoZUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmF0dXJlLWZvcm0nKTtcclxuXHRcdG5ldyBzdGVwc0Zvcm0oIHRoZUZvcm0sIHtcclxuXHRcdFx0b25TdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciB1c2VybmFtZSA9ICQoJyNxMScpLnZhbCgpO1xyXG5cdFx0XHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdFx0dXNlcm5hbWU6IHVzZXJuYW1lXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHR1dGlsaXRpZXMucG9zdChzaWduYXR1cmUucGF0aHMuc3VibWl0LCBkYXRhKTtcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cdH1cclxufSIsInZhciBzaWdudXBGb3JtO1xyXG5jbGFzcyBTaWdudXBGb3JtIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0ZGlzcGxheU5hbWU6ICcjZGlzcGxheV9uYW1lJyxcclxuXHRcdFx0ZW1haWw6ICcjZW1haWwnLFxyXG5cdFx0XHRwYXNzd29yZDogJyNwYXNzd29yZCcsXHJcblx0XHRcdHBhc3N3b3JkMjogJyNwYXNzd29yZDInLFxyXG5cdFx0XHRzZWN1cml0eUNoZWNrOiAnI3NlY3VyaXR5J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrQXZhaWxhYmlsaXR5OiAnL2dldC9zaWdudXAvJ1xyXG5cdFx0fTtcclxuXHRcdHZhciBzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkLFxyXG5cdFx0XHR0aW1lb3V0ID0gNTAwO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmRpc3BsYXlOYW1lKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZGlzcGxheV9uYW1lJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZW1haWwpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRW1haWwpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0VtYWlsKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzaWdudXBGb3JtLmNoZWNrU2VjdXJpdHkoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRzaWdudXBGb3JtLnN1Ym1pdChlKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tBdmFpbGFiaWxpdHkoZmllbGQ6IHN0cmluZykge1xyXG5cdFx0dmFyIHZhbCA9ICQoJyMnICsgZmllbGQpLnZhbCgpO1xyXG5cdFx0aWYodmFsLmxlbmd0aCA9PT0gMClcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0dmFyIHVybCA9IHRoaXMucGF0aHMuY2hlY2tBdmFpbGFiaWxpdHkgKyBmaWVsZDtcclxuXHRcdHZhciBhdmFpbGFibGU7XHJcblx0XHRpZihmaWVsZCA9PT0gXCJkaXNwbGF5X25hbWVcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGRpc3BsYXlfbmFtZTogdmFsIH0pO1xyXG5cdFx0fSBlbHNlIGlmKGZpZWxkID09PSBcImVtYWlsXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBlbWFpbDogdmFsIH0pO1xyXG5cdFx0fVxyXG5cdFx0YXZhaWxhYmxlLmRvbmUoZnVuY3Rpb24oYXZhaWxhYmxlOiBzdHJpbmcpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoYXZhaWxhYmxlKTtcclxuXHRcdFx0aWYoYXZhaWxhYmxlLmF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja1Bhc3N3b3JkKCkge1xyXG5cdFx0dmFyIHYxID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS52YWwoKSxcclxuXHRcdFx0djIgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS52YWwoKTtcclxuXHRcdGlmKHYyLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0aWYodjEgPT09IHYyKSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCB0cnVlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCB0cnVlKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIGZhbHNlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCBmYWxzZSk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjaGVja1NlY3VyaXR5KCkge1xyXG5cdFx0dmFyIHNsaWRlclZhbCA9ICQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS52YWwoKTtcclxuXHRcdGlmKHNsaWRlclZhbCA8PSAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnbm9uZSdcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2UgaWYoc2xpZGVyVmFsID4gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ2Jsb2NrJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN1Ym1pdChlOiBhbnkpIHtcclxuXHRcdHZhciB1c2VybmFtZSA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ3VzZXJuYW1lJyksXHJcblx0XHRcdGVtYWlsID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKSxcclxuXHRcdFx0cGFzcyA9IHRoaXMuY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0aWYodXNlcm5hbWUgPT09IHRydWUgJiYgZW1haWwgPT09IHRydWUgJiYgcGFzcyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dG9nZ2xlRmVlZGJhY2soZmllbGQ6IHN0cmluZywgc3RhdHVzOiBib29sZWFuKSB7XHJcblx0XHRpZihzdGF0dXMgPT09IHRydWUpIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93Jyk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiY2xhc3MgU3RhZmZMaXN0IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHZhciBtZW1iZXJzID0gJChcIltydC1ob29rPSdob29rIXN0YWZmLmxpc3Q6Y2FyZCddXCIpO1xyXG4gICAgICAgICQuZWFjaChtZW1iZXJzLCBmdW5jdGlvbihpbmRleDogbnVtYmVyLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkKHZhbHVlKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh2YWwpLmF0dHIoJ3J0LWRhdGEnKTtcclxuICAgICAgICAgICAgJCh2YWwpLmZpbmQoJy5mcm9udCcpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCcvaW1nL2ZvcnVtcy9waG90b3MvXCIgKyBpZCArIFwiLnBuZycpXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmFsKS5iaW5kKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBzdGVwc0Zvcm0uanMgdjEuMC4wXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxNCwgQ29kcm9wc1xyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqL1xyXG47KCBmdW5jdGlvbiggd2luZG93ICkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHR2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG5cdFx0XHQnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXHJcblx0XHRcdCdPVHJhbnNpdGlvbic6ICdvVHJhbnNpdGlvbkVuZCcsXHJcblx0XHRcdCdtc1RyYW5zaXRpb24nOiAnTVNUcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCdcclxuXHRcdH0sXHJcblx0XHR0cmFuc0VuZEV2ZW50TmFtZSA9IHRyYW5zRW5kRXZlbnROYW1lc1sgTW9kZXJuaXpyLnByZWZpeGVkKCAndHJhbnNpdGlvbicgKSBdLFxyXG5cdFx0c3VwcG9ydCA9IHsgdHJhbnNpdGlvbnMgOiBNb2Rlcm5penIuY3NzdHJhbnNpdGlvbnMgfTtcclxuXHJcblx0ZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xyXG5cdFx0Zm9yKCB2YXIga2V5IGluIGIgKSB7XHJcblx0XHRcdGlmKCBiLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuXHRcdFx0XHRhW2tleV0gPSBiW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc3RlcHNGb3JtKCBlbCwgb3B0aW9ucyApIHtcclxuXHRcdHRoaXMuZWwgPSBlbDtcclxuXHRcdHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xyXG5cdFx0ZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcclxuXHRcdHRoaXMuX2luaXQoKTtcclxuXHR9XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuXHRcdG9uU3VibWl0IDogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdH07XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdHRoaXMuY3VycmVudCA9IDA7XHJcblxyXG5cdFx0Ly8gcXVlc3Rpb25zXHJcblx0XHR0aGlzLnF1ZXN0aW9ucyA9IFtdLnNsaWNlLmNhbGwoIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCggJ29sLnF1ZXN0aW9ucyA+IGxpJyApICk7XHJcblx0XHQvLyB0b3RhbCBxdWVzdGlvbnNcclxuXHRcdHRoaXMucXVlc3Rpb25zQ291bnQgPSB0aGlzLnF1ZXN0aW9ucy5sZW5ndGg7XHJcblx0XHQvLyBzaG93IGZpcnN0IHF1ZXN0aW9uXHJcblx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLnF1ZXN0aW9uc1swXSwgJ2N1cnJlbnQnICk7XHJcblxyXG5cdFx0Ly8gbmV4dCBxdWVzdGlvbiBjb250cm9sXHJcblx0XHR0aGlzLmN0cmxOZXh0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnYnV0dG9uLm5leHQnICk7XHJcblxyXG5cdFx0Ly8gcHJvZ3Jlc3MgYmFyXHJcblx0XHR0aGlzLnByb2dyZXNzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnZGl2LnByb2dyZXNzJyApO1xyXG5cclxuXHRcdC8vIHF1ZXN0aW9uIG51bWJlciBzdGF0dXNcclxuXHRcdHRoaXMucXVlc3Rpb25TdGF0dXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdzcGFuLm51bWJlcicgKTtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb24gcGxhY2Vob2xkZXJcclxuXHRcdHRoaXMuY3VycmVudE51bSA9IHRoaXMucXVlc3Rpb25TdGF0dXMucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyLWN1cnJlbnQnICk7XHJcblx0XHR0aGlzLmN1cnJlbnROdW0uaW5uZXJIVE1MID0gTnVtYmVyKCB0aGlzLmN1cnJlbnQgKyAxICk7XHJcblx0XHQvLyB0b3RhbCBxdWVzdGlvbnMgcGxhY2Vob2xkZXJcclxuXHRcdHRoaXMudG90YWxRdWVzdGlvbk51bSA9IHRoaXMucXVlc3Rpb25TdGF0dXMucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyLXRvdGFsJyApO1xyXG5cdFx0dGhpcy50b3RhbFF1ZXN0aW9uTnVtLmlubmVySFRNTCA9IHRoaXMucXVlc3Rpb25zQ291bnQ7XHJcblxyXG5cdFx0Ly8gZXJyb3IgbWVzc2FnZVxyXG5cdFx0dGhpcy5lcnJvciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ3NwYW4uZXJyb3ItbWVzc2FnZScgKTtcclxuXHJcblx0XHQvLyBpbml0IGV2ZW50c1xyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cdH07XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2luaXRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdC8vIGZpcnN0IGlucHV0XHJcblx0XHRcdGZpcnN0RWxJbnB1dCA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXS5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICksXHJcblx0XHQvLyBmb2N1c1xyXG5cdFx0XHRvbkZvY3VzU3RhcnRGbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGZpcnN0RWxJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzU3RhcnRGbiApO1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHNlbGYuY3RybE5leHQsICdzaG93JyApO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdC8vIHNob3cgdGhlIG5leHQgcXVlc3Rpb24gY29udHJvbCBmaXJzdCB0aW1lIHRoZSBpbnB1dCBnZXRzIGZvY3VzZWRcclxuXHRcdGZpcnN0RWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzU3RhcnRGbiApO1xyXG5cclxuXHRcdC8vIHNob3cgbmV4dCBxdWVzdGlvblxyXG5cdFx0dGhpcy5jdHJsTmV4dC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHNlbGYuX25leHRRdWVzdGlvbigpO1xyXG5cdFx0fSApO1xyXG5cclxuXHRcdC8vIHByZXNzaW5nIGVudGVyIHdpbGwganVtcCB0byBuZXh0IHF1ZXN0aW9uXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0dmFyIGtleUNvZGUgPSBldi5rZXlDb2RlIHx8IGV2LndoaWNoO1xyXG5cdFx0XHQvLyBlbnRlclxyXG5cdFx0XHRpZigga2V5Q29kZSA9PT0gMTMgKSB7XHJcblx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRzZWxmLl9uZXh0UXVlc3Rpb24oKTtcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdC8vIGRpc2FibGUgdGFiXHJcblx0XHR0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdC8vIHRhYlxyXG5cdFx0XHRpZigga2V5Q29kZSA9PT0gOSApIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fbmV4dFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZiggIXRoaXMuX3ZhbGlkYWRlKCkgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjaGVjayBpZiBmb3JtIGlzIGZpbGxlZFxyXG5cdFx0aWYoIHRoaXMuY3VycmVudCA9PT0gdGhpcy5xdWVzdGlvbnNDb3VudCAtIDEgKSB7XHJcblx0XHRcdHRoaXMuaXNGaWxsZWQgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNsZWFyIGFueSBwcmV2aW91cyBlcnJvciBtZXNzYWdlc1xyXG5cdFx0dGhpcy5fY2xlYXJFcnJvcigpO1xyXG5cclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdHZhciBjdXJyZW50UXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uc1sgdGhpcy5jdXJyZW50IF07XHJcblxyXG5cdFx0Ly8gaW5jcmVtZW50IGN1cnJlbnQgcXVlc3Rpb24gaXRlcmF0b3JcclxuXHRcdCsrdGhpcy5jdXJyZW50O1xyXG5cclxuXHRcdC8vIHVwZGF0ZSBwcm9ncmVzcyBiYXJcclxuXHRcdHRoaXMuX3Byb2dyZXNzKCk7XHJcblxyXG5cdFx0aWYoICF0aGlzLmlzRmlsbGVkICkge1xyXG5cdFx0XHQvLyBjaGFuZ2UgdGhlIGN1cnJlbnQgcXVlc3Rpb24gbnVtYmVyL3N0YXR1c1xyXG5cdFx0XHR0aGlzLl91cGRhdGVRdWVzdGlvbk51bWJlcigpO1xyXG5cclxuXHRcdFx0Ly8gYWRkIGNsYXNzIFwic2hvdy1uZXh0XCIgdG8gZm9ybSBlbGVtZW50IChzdGFydCBhbmltYXRpb25zKVxyXG5cdFx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLmVsLCAnc2hvdy1uZXh0JyApO1xyXG5cclxuXHRcdFx0Ly8gcmVtb3ZlIGNsYXNzIFwiY3VycmVudFwiIGZyb20gY3VycmVudCBxdWVzdGlvbiBhbmQgYWRkIGl0IHRvIHRoZSBuZXh0IG9uZVxyXG5cdFx0XHQvLyBjdXJyZW50IHF1ZXN0aW9uXHJcblx0XHRcdHZhciBuZXh0UXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uc1sgdGhpcy5jdXJyZW50IF07XHJcblx0XHRcdGNsYXNzaWUucmVtb3ZlQ2xhc3MoIGN1cnJlbnRRdWVzdGlvbiwgJ2N1cnJlbnQnICk7XHJcblx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIG5leHRRdWVzdGlvbiwgJ2N1cnJlbnQnICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gYWZ0ZXIgYW5pbWF0aW9uIGVuZHMsIHJlbW92ZSBjbGFzcyBcInNob3ctbmV4dFwiIGZyb20gZm9ybSBlbGVtZW50IGFuZCBjaGFuZ2UgY3VycmVudCBxdWVzdGlvbiBwbGFjZWhvbGRlclxyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0XHRvbkVuZFRyYW5zaXRpb25GbiA9IGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0XHRpZiggc3VwcG9ydC50cmFuc2l0aW9ucyApIHtcclxuXHRcdFx0XHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNFbmRFdmVudE5hbWUsIG9uRW5kVHJhbnNpdGlvbkZuICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKCBzZWxmLmlzRmlsbGVkICkge1xyXG5cdFx0XHRcdFx0c2VsZi5fc3VibWl0KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggc2VsZi5lbCwgJ3Nob3ctbmV4dCcgKTtcclxuXHRcdFx0XHRcdHNlbGYuY3VycmVudE51bS5pbm5lckhUTUwgPSBzZWxmLm5leHRRdWVzdGlvbk51bS5pbm5lckhUTUw7XHJcblx0XHRcdFx0XHRzZWxmLnF1ZXN0aW9uU3RhdHVzLnJlbW92ZUNoaWxkKCBzZWxmLm5leHRRdWVzdGlvbk51bSApO1xyXG5cdFx0XHRcdFx0Ly8gZm9yY2UgdGhlIGZvY3VzIG9uIHRoZSBuZXh0IGlucHV0XHJcblx0XHRcdFx0XHRuZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvciggJ2lucHV0JyApLmZvY3VzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdGlmKCBzdXBwb3J0LnRyYW5zaXRpb25zICkge1xyXG5cdFx0XHR0aGlzLnByb2dyZXNzLmFkZEV2ZW50TGlzdGVuZXIoIHRyYW5zRW5kRXZlbnROYW1lLCBvbkVuZFRyYW5zaXRpb25GbiApO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdG9uRW5kVHJhbnNpdGlvbkZuKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB1cGRhdGVzIHRoZSBwcm9ncmVzcyBiYXIgYnkgc2V0dGluZyBpdHMgd2lkdGhcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9wcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9ncmVzcy5zdHlsZS53aWR0aCA9IHRoaXMuY3VycmVudCAqICggMTAwIC8gdGhpcy5xdWVzdGlvbnNDb3VudCApICsgJyUnO1xyXG5cdH1cclxuXHJcblx0Ly8gY2hhbmdlcyB0aGUgY3VycmVudCBxdWVzdGlvbiBudW1iZXJcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl91cGRhdGVRdWVzdGlvbk51bWJlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gZmlyc3QsIGNyZWF0ZSBuZXh0IHF1ZXN0aW9uIG51bWJlciBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy5uZXh0UXVlc3Rpb25OdW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcclxuXHRcdHRoaXMubmV4dFF1ZXN0aW9uTnVtLmNsYXNzTmFtZSA9ICdudW1iZXItbmV4dCc7XHJcblx0XHR0aGlzLm5leHRRdWVzdGlvbk51bS5pbm5lckhUTUwgPSBOdW1iZXIoIHRoaXMuY3VycmVudCArIDEgKTtcclxuXHRcdC8vIGluc2VydCBpdCBpbiB0aGUgRE9NXHJcblx0XHR0aGlzLnF1ZXN0aW9uU3RhdHVzLmFwcGVuZENoaWxkKCB0aGlzLm5leHRRdWVzdGlvbk51bSApO1xyXG5cdH1cclxuXHJcblx0Ly8gc3VibWl0cyB0aGUgZm9ybVxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3N1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLm9uU3VibWl0KCB0aGlzLmVsICk7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIChuZXh0IHZlcnNpb24uLilcclxuXHQvLyB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3ZhbGlkYWRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBjdXJyZW50IHF1ZXN0aW9uw4LCtHMgaW5wdXRcclxuXHRcdHZhciBpbnB1dCA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXS5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICkudmFsdWU7XHJcblx0XHRpZiggaW5wdXQgPT09ICcnICkge1xyXG5cdFx0XHR0aGlzLl9zaG93RXJyb3IoICdFTVBUWVNUUicgKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gVE9ETyAobmV4dCB2ZXJzaW9uLi4pXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fc2hvd0Vycm9yID0gZnVuY3Rpb24oIGVyciApIHtcclxuXHRcdHZhciBtZXNzYWdlID0gJyc7XHJcblx0XHRzd2l0Y2goIGVyciApIHtcclxuXHRcdFx0Y2FzZSAnRU1QVFlTVFInIDpcclxuXHRcdFx0XHRtZXNzYWdlID0gJ1BsZWFzZSBmaWxsIHRoZSBmaWVsZCBiZWZvcmUgY29udGludWluZyc7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ0lOVkFMSURFTUFJTCcgOlxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnUGxlYXNlIGZpbGwgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Ly8gLi4uXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5lcnJvci5pbm5lckhUTUwgPSBtZXNzYWdlO1xyXG5cdFx0Y2xhc3NpZS5hZGRDbGFzcyggdGhpcy5lcnJvciwgJ3Nob3cnICk7XHJcblx0fVxyXG5cclxuXHQvLyBjbGVhcnMvaGlkZXMgdGhlIGN1cnJlbnQgZXJyb3IgbWVzc2FnZVxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2NsZWFyRXJyb3IgPSBmdW5jdGlvbigpIHtcclxuXHRcdGNsYXNzaWUucmVtb3ZlQ2xhc3MoIHRoaXMuZXJyb3IsICdzaG93JyApO1xyXG5cdH1cclxuXHJcblx0Ly8gYWRkIHRvIGdsb2JhbCBuYW1lc3BhY2VcclxuXHR3aW5kb3cuc3RlcHNGb3JtID0gc3RlcHNGb3JtO1xyXG5cclxufSkoIHdpbmRvdyApOyIsInZhciB1dGlsaXRpZXM7XHJcbmNsYXNzIFV0aWxpdGllcyB7XHJcbiAgICBwdWJsaWMgY3VycmVudFRpbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmb3JtVG9rZW4odG9rZW46IHN0cmluZykge1xyXG4gICAgICAgIHRva2VuID0gYXRvYih0b2tlbik7XHJcbiAgICAgICAgJCgnZm9ybScpLmFwcGVuZChcIjxpbnB1dCB0eXBlPSdoaWRkZW4nIG5hbWU9J190b2tlbicgdmFsdWU9J1wiICsgdG9rZW4gKyBcIicgLz5cIik7XHJcblxyXG4gICAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbWV0YScpO1xyXG4gICAgICAgIG1ldGEubmFtZSA9ICdfdG9rZW4nO1xyXG4gICAgICAgIG1ldGEuY29udGVudCA9IHRva2VuO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKG1ldGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBSkFYKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBKU09ORGVjb2RlKGpzb246IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLnBhcnNlSlNPTihqc29uKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb3N0QUpBWChwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGRhdGEuX3Rva2VuID0gJCgnbWV0YVtuYW1lPVwiX3Rva2VuXCJdJykuYXR0cignY29udGVudCcpO1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Nyb2xsVG8oZWxlbWVudDogYW55LCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcDogJChlbGVtZW50KS5vZmZzZXQoKS50b3BcclxuICAgICAgICB9LCB0aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGltZUFnbyh0czogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5vd1RzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBub3dUcyAtIHRzO1xyXG4gICAgICAgIGlmKHNlY29uZHMgPiAyICogMjQgKiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImEgZmV3IGRheXMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwieWVzdGVyZGF5XCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiA3MjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyAzNjAwKSArIFwiIGhvdXJzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbiBob3VyIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDEyMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApICsgXCIgbWludXRlcyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+PSA2MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIxIG1pbnV0ZSBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKyBcIiBzZWNvbmRzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgc2Vjb25kIGFnb1wiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcG9zdChwYXRoOiBzdHJpbmcsIHBhcmFtczogYW55LCBtZXRob2Q6IHN0cmluZykge1xyXG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCAncG9zdCc7XHJcbiAgICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XHJcbiAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ21ldGhvZCcsIG1ldGhvZCk7XHJcbiAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ2FjdGlvbicsIHBhdGgpO1xyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xyXG4gICAgICAgICAgICBpZihwYXJhbXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGhpZGRlbkZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgnbmFtZScsIGtleSk7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgcGFyYW1zW2tleV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoaGlkZGVuRmllbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b2tlblZhbCA9ICQoXCJtZXRhW25hbWU9J190b2tlbiddXCIpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICB2YXIgdG9rZW5GaWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaGlkZGVuJyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnX3Rva2VuJyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdG9rZW5WYWwpO1xyXG5cclxuICAgICAgICBmb3JtLmFwcGVuZENoaWxkKHRva2VuRmllbGQpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xyXG4gICAgICAgIGZvcm0uc3VibWl0KCk7XHJcbiAgICB9XHJcbn1cclxudXRpbGl0aWVzID0gbmV3IFV0aWxpdGllcygpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==