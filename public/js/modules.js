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
    var searchSubmit = function () {
        var search = $("input.morphsearch-input").val();
        if (search.length === 0) {
            return;
        }
        var data = {
            contents: search
        };
        var results = utilities.postAJAX('/search', data);
        results.done(function (results) {
            results = $.parseJSON(results);
            $('#search-people').html('<h2>People</h2>');
            $('#search-threads').html('<h2>Threads</h2>');
            $('#search-news').html('<h2>News</h2>');
            $.each(results.users, function () {
                var obj = mediaObject(this.img, this.name, this.url);
                $('#search-people').append(obj);
            });
            $.each(results.threads, function () {
                var obj = mediaObject(this.img, this.name, this.url);
                $('#search-threads').append(obj);
            });
            $.each(results.news, function () {
                var obj = mediaObject(this.img, this.name, this.url);
                $('#search-news').append(obj);
            });
        });
    };
    var submit = morphSearch.querySelector('button[type="submit"]');
    function mediaObject(img, name, url) {
        var html = "<a class='media-object' href='" + url + "'>";
        if (img.length > 0) {
            html += "<img src='" + img + "' />";
        }
        html += "<h3>" + name + "</h3>";
        html += "</a>";
        return html;
    }
    submit.addEventListener('click', function (ev) {
        ev.preventDefault();
        searchSubmit();
    });
    $('.morphsearch-input').bind('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            searchSubmit();
        }
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
    Radio.prototype.onlineSettings = function (online) {
        this.online = online;
        if (online !== true) {
            $(this.elements.statusMessage).html("The radio has been set offline.");
            $(this.varStatus).removeClass().addClass('text-danger').html("<i id='power-button' class='fa fa-power-off'></i>Off");
        }
        else {
            $(this.elements.statusMessage).html("");
            $(this.varStatus).removeClass().addClass('text-success').html("<i id='power-button' class='fa fa-power-off'></i>On");
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
            radio.onlineSettings(update.online);
            setTimeout(function () {
                radio.update();
            }, 30000);
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
            var src = "";
            if (id == 'no') {
                src = $(val).attr('rt-data2');
            }
            else {
                src = id;
            }
            $(val).find('.front').css({
                'background-image': "url('/img/forums/photos/" + src + ".png')"
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvYWJvdXQudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NoYXRib3gudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NsYW4udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvZHJvcHNfZGlhbG9nRngudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbWJhdGNhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbnRhY3QudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2ZvcnVtcy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbGl2ZXN0cmVhbS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbWFpbi50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmFtZWNoZWNrZXIudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25ld3MudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25vdGlmaWNhdGlvbnMudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3JhZGlvLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zaWduYXR1cmUudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RlcHNfZm9ybS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkFib3V0IiwiQWJvdXQuY29uc3RydWN0b3IiLCJBYm91dC5zZXRMaXN0ZW4iLCJDYWxjdWxhdG9yIiwiQ2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlWFAiLCJDYWxjdWxhdG9yLmNhbGN1bGF0ZUxldmVsIiwiQ2FsY3VsYXRvci5nZXRJbmZvIiwiQ2FsY3VsYXRvci5sb2FkQ2FsYyIsIkNhbGN1bGF0b3IudXBkYXRlQ2FsYyIsIkNoYXRib3giLCJDaGF0Ym94LmNvbnN0cnVjdG9yIiwiQ2hhdGJveC5hZGRNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZSIsIkNoYXRib3guZGlzcGxheU1lc3NhZ2VzIiwiQ2hhdGJveC5lcnJvciIsIkNoYXRib3guZ2V0U3RhcnQiLCJDaGF0Ym94Lm1vZCIsIkNoYXRib3gubW9kVG9vbHMiLCJDaGF0Ym94LnBhbmVsQ2hhbm5lbHMiLCJDaGF0Ym94LnBhbmVsQ2hhdCIsIkNoYXRib3gucGFuZWxDbG9zZSIsIkNoYXRib3guc3VibWl0TWVzc2FnZSIsIkNoYXRib3guc3dpdGNoQ2hhbm5lbCIsIkNoYXRib3gudXBkYXRlIiwiQ2hhdGJveC51cGRhdGVUaW1lQWdvIiwiQ2xhbiIsIkNsYW4uY29uc3RydWN0b3IiLCJDbGFuLnNldExpc3RlbiIsImV4dGVuZCIsIkRpYWxvZ0Z4IiwiQ29tYmF0Q2FsY3VsYXRvciIsIkNvbWJhdENhbGN1bGF0b3IuY29uc3RydWN0b3IiLCJDb21iYXRDYWxjdWxhdG9yLmdldExldmVscyIsIkNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwiLCJDb21iYXRDYWxjdWxhdG9yLnZhbCIsIkNvbnRhY3QiLCJDb250YWN0LmNvbnN0cnVjdG9yIiwiQ29udGFjdC5kb25lIiwiQ29udGFjdC5lcnJvciIsIkNvbnRhY3Quc2VuZCIsIkNvbnRhY3QudmFsaWRhdGVFbWFpbCIsIkNvbnRhY3Qud2FybmluZyIsIkZvcnVtcyIsIkZvcnVtcy5jb25zdHJ1Y3RvciIsIkZvcnVtcy5kb3dudm90ZSIsIkZvcnVtcy5wb2xsVm90ZSIsIkZvcnVtcy51cHZvdGUiLCJQb3N0IiwiUG9zdC5jb25zdHJ1Y3RvciIsIlBvc3QucXVvdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUuY29uc3RydWN0b3IiLCJGb3J1bXNUaHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXIiLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbiIsIkxpdmVzdHJlYW1SZXNldCIsIkxpdmVzdHJlYW1SZXNldC5jb25zdHJ1Y3RvciIsIkxpdmVzdHJlYW1SZXNldC5yZXNldCIsIkxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c2VzIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24iLCJSdW5lVGltZSIsIlJ1bmVUaW1lLmNvbnN0cnVjdG9yIiwibWVkaWFPYmplY3QiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuc2V0Rm9ybSIsIk5ld3MiLCJOZXdzLmNvbnN0cnVjdG9yIiwiTmV3cy5zZXR1cEFjdGlvbnMiLCJOZXdzLnN1Ym1pdENvbW1lbnQiLCJOZXdzLnRvQ29tbWVudHMiLCJOb3RpZmljYXRpb25zIiwiTm90aWZpY2F0aW9ucy5jb25zdHJ1Y3RvciIsIlJhZGlvIiwiUmFkaW8uY29uc3RydWN0b3IiLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vbmxpbmVTZXR0aW5ncyIsIlJhZGlvLnB1bGxIaWRlIiwiUmFkaW8ucHVsbE9wZW4iLCJSYWRpby5yZXF1ZXN0T3BlbiIsIlJhZGlvLnJlcXVlc3RTZW5kIiwiUmFkaW8udXBkYXRlIiwiU2lnbmF0dXJlIiwiU2lnbmF0dXJlLmNvbnN0cnVjdG9yIiwiU2lnbnVwRm9ybSIsIlNpZ251cEZvcm0uY29uc3RydWN0b3IiLCJTaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5IiwiU2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkIiwiU2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5IiwiU2lnbnVwRm9ybS5zdWJtaXQiLCJTaWdudXBGb3JtLnRvZ2dsZUZlZWRiYWNrIiwiU3RhZmZMaXN0IiwiU3RhZmZMaXN0LmNvbnN0cnVjdG9yIiwic3RlcHNGb3JtIiwiVXRpbGl0aWVzIiwiVXRpbGl0aWVzLmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzLmN1cnJlbnRUaW1lIiwiVXRpbGl0aWVzLmZvcm1Ub2tlbiIsIlV0aWxpdGllcy5nZXRBSkFYIiwiVXRpbGl0aWVzLkpTT05EZWNvZGUiLCJVdGlsaXRpZXMucG9zdEFKQVgiLCJVdGlsaXRpZXMuc2Nyb2xsVG8iLCJVdGlsaXRpZXMudGltZUFnbyIsIlV0aWxpdGllcy5wb3N0Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLEtBQUssQ0FBQztBQUNWLElBQU0sS0FBSztJQUNWQSxTQURLQSxLQUFLQTtRQUVUQyxJQUFJQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSwrQkFBK0JBLENBQUNBLENBQUNBO1FBQ2xFQSxJQUFJQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxpQ0FBaUNBLENBQUNBLENBQUNBO1FBQ3RFQSxJQUFJQSxNQUFNQSxHQUFHQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxrQ0FBa0NBLENBQUNBLENBQUNBO1FBQ3hFQSxJQUFJQSxVQUFVQSxH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QUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM3QixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNqQyxVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMxQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxD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QUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNsQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFDREEsSUFBSUEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4REEsSUFBSUEsVUFBVUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMxQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFFM0NBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBRTdCQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDbEJBLENBQUNBO0lBQ0xULGdCQUFDQTtBQUFEQSxDQTVGQSxBQTRGQ0EsSUFBQTtBQUNELFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYWJvdXQ7XHJcbmNsYXNzIEFib3V0IHtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR2YXIgYWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1hZHNdXCIpO1xyXG5cdFx0dmFyIHJhZGlvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1yYWRpb11cIik7XHJcblx0XHR2YXIgZm9ydW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1mb3J1bXNdXCIpO1xyXG5cdFx0dmFyIGRpc2Nsb3N1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWZ1bGwtZGlzY2xvc3VyZV1cIik7XHJcblx0XHR2YXIgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctb3VyLW1lbWJlcnNdXCIpO1xyXG5cdFx0dmFyIGNvbW11bml0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctY29tbXVuaXR5LW9wZW5uZXNzXVwiKTtcclxuXHJcblx0XHR0aGlzLnNldExpc3RlbihhZHMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4ocmFkaW8pO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oZm9ydW1zKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKGRpc2Nsb3N1cmUpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4obWVtYmVycyk7XHJcblx0XHR0aGlzLnNldExpc3Rlbihjb21tdW5pdHkpO1xyXG5cdFx0Y29uc29sZS5sb2coMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuKGRsZ3RyaWdnZXIpIHtcclxuXHRcdGlmKGRsZ3RyaWdnZXIpIHtcclxuXHRcdFx0dmFyIHNvbWVkaWFsb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkbGd0cmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS1kaWFsb2cnKSk7XHJcblx0XHRcdHZhciBkbGcgPSBuZXcgRGlhbG9nRngoc29tZWRpYWxvZyk7XHJcblx0XHRcdGRsZ3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkbGcudG9nZ2xlLmJpbmQoZGxnKSk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwidmFyIGNhbGN1bGF0b3I7XHJcbmNsYXNzIENhbGN1bGF0b3Ige1xyXG4gICAgY2FsY3VsYXRvcjogYW55O1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgaW5mbzogYW55ID0ge307XHJcbiAgICBVUkw6IGFueSA9IHt9O1xyXG4gICAgaXRlbXM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbGM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRYUDogJyNjYWxjdWxhdG9yLWN1cnJlbnQteHAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJyNjYWxjdWxhdG9yLWRpc3BsYXktbmFtZScsXHJcbiAgICAgICAgICAgIHN1Ym1pdDogJyNjYWxjdWxhdG9yLXN1Ym1pdCcsXHJcbiAgICAgICAgICAgIHRhYmxlOiAnI2NhbGN1bGF0b3ItdGFibGUgdGJvZHknLFxyXG4gICAgICAgICAgICB0YXJnZXRMZXZlbDogJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuVVJMID0ge1xyXG4gICAgICAgICAgICBnZXRDYWxjOiAnL2NhbGN1bGF0b3JzL2xvYWQnLFxyXG4gICAgICAgICAgICBnZXRJbmZvOiAnL2dldC9oaXNjb3JlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pbmZvID0ge1xyXG4gICAgICAgICAgICBsZXZlbEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0OiAwLFxyXG4gICAgICAgICAgICBYUEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIFhQVGFyZ2V0OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0b3IgPSBjYWxjO1xyXG4gICAgICAgICQodGhpcy5lbGVtZW50cy5zdWJtaXQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYWxjdWxhdG9yLmdldEluZm8oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxvYWRDYWxjKCk7XHJcbiAgICAgICAgJCgnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJykua2V5dXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuICAgICAgICAgICAgfSwgMjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHRjYWxjdWxhdGVYUChsZXZlbDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCBsZXZlbDsgaSArPSAxKSB7XHJcblx0XHRcdHRvdGFsICs9IE1hdGguZmxvb3IoaSArIDMwMCAqIE1hdGgucG93KDIsIGkgLyA3LjApKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBNYXRoLmZsb29yKHRvdGFsIC8gNCk7XHJcblx0fVxyXG5cclxuXHRjYWxjdWxhdGVMZXZlbCh4cDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCAxMjA7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKyBNYXRoLnBvdygyLCBpIC8gNykpO1xyXG5cdFx0XHRpZihNYXRoLmZsb29yKHRvdGFsIC8gNCkgPiB4cClcclxuXHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0ZWxzZSBpZihpID49IDk5KVxyXG5cdFx0XHRcdHJldHVybiA5OTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICB2YXIgbmFtZSA9ICQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkudmFsKCk7XHJcblx0XHR2YXIgaW5mbyA9IHV0aWxpdGllcy5nZXRBSkFYKHRoaXMuVVJMLmdldEluZm8gKyAnLycgKyBuYW1lKTtcclxuXHRcdGluZm8uZG9uZShmdW5jdGlvbihpbmZvOiBhbnkpIHtcclxuXHRcdFx0aW5mbyA9ICQucGFyc2VKU09OKGluZm8pO1xyXG5cdFx0XHR2YXIgcmVsZXZhbnQgPSBpbmZvWzEzXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCA9IHJlbGV2YW50WzFdO1xyXG5cdFx0XHRjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50ID0gcmVsZXZhbnRbMl07XHJcblx0XHRcdCQoY2FsY3VsYXRvci5lbGVtZW50cy5jdXJyZW50WFApLnZhbChjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50KTtcclxuXHRcdFx0aWYoJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwoKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFyZ2V0TGV2ZWwpLnZhbChwYXJzZUludChjYWxjdWxhdG9yLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuXHRcdH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDYWxjKCkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge2lkOiB0aGlzLmNhbGN1bGF0b3J9O1xyXG4gICAgICAgIHZhciBpbmZvID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldENhbGMsIGRhdGEpO1xyXG4gICAgICAgIGluZm8uZG9uZShmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgIGluZm8gPSB1dGlsaXRpZXMuSlNPTkRlY29kZShpbmZvKTtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5pdGVtcyA9IGluZm87XHJcbiAgICAgICAgICAgICQuZWFjaChjYWxjdWxhdG9yLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLm5hbWUgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHAgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPiZpbmZpbjs8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjwvdHI+XCI7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ2FsYygpIHtcclxuICAgICAgICB2YXIgbGV2ZWxDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgbGV2ZWxUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICB4cEN1cnJlbnQgPSAwLFxyXG4gICAgICAgICAgICB4cFRhcmdldCA9IDAsXHJcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgPSAwLFxyXG4gICAgICAgICAgICBhbW91bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuaW5mby5sZXZlbFRhcmdldCA9IHBhcnNlSW50KCQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLnZhbCgpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmluZm8ubGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgIHRoaXMuaW5mby5YUFRhcmdldCA9IHRoaXMuY2FsY3VsYXRlWFAodGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICBpZih0aGlzLmluZm8uWFBDdXJyZW50ID4gdGhpcy5pbmZvLlhQVGFyZ2V0KVxyXG4gICAgICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHBhcnNlSW50KHRoaXMuaW5mby5sZXZlbEN1cnJlbnQsIDEwKSArIDEpO1xyXG4gICAgICAgIGxldmVsQ3VycmVudCA9IHRoaXMuaW5mby5sZXZlbEN1cnJlbnQ7XHJcbiAgICAgICAgbGV2ZWxUYXJnZXQgPSB0aGlzLmluZm8ubGV2ZWxUYXJnZXQ7XHJcbiAgICAgICAgeHBDdXJyZW50ID0gdGhpcy5pbmZvLlhQQ3VycmVudDtcclxuICAgICAgICB4cFRhcmdldCA9IHRoaXMuaW5mby5YUFRhcmdldDtcclxuICAgICAgICBkaWZmZXJlbmNlID0geHBUYXJnZXQgLSB4cEN1cnJlbnQ7XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgYW1vdW50ID0gTWF0aC5jZWlsKGRpZmZlcmVuY2UgLyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS54cCk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGFtb3VudCA8IDAgPyAwIDogYW1vdW50O1xyXG4gICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKSB0ZDpudGgtY2hpbGQoNCknKS5odG1sKGFtb3VudCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbEN1cnJlbnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbFRhcmdldCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG5cXG5cXG5cXG5cIik7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPD0gbGV2ZWxDdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtc3VjY2VzcycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPiBsZXZlbEN1cnJlbnQgJiYgbGV2ZWxUYXJnZXQgPj0gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC13YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtZGFuZ2VyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciBjaGF0Ym94O1xyXG5jbGFzcyBDaGF0Ym94IHtcclxuXHRjaGFubmVsOiBzdHJpbmcgPSAnI3JhZGlvJztcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bGFzdElkOiBudW1iZXIgPSAwO1xyXG5cdG1lc3NhZ2VzOiBhbnkgPSBbXTtcclxuXHRtb2RlcmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwaW5uZWQ6IGFueSA9IFtdO1xyXG5cdHRpbWVzOiBhbnkgPSB7fTtcclxuXHR0aW1lb3V0UGlubmVkOiBhbnkgPSBudWxsO1xyXG5cdHRpbWVvdXRVcGRhdGU6IGFueSA9IG51bGw7XHJcblx0VVJMOiBhbnkgPSB7fTtcclxuXHJcblx0cGlubmVkRGlzcGxheWVkOiBhbnkgPSBbXTtcclxuXHJcblx0Y29uc3RydWN0b3IocHVibGljIGNoYW5uZWw6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jaGFubmVsID0gY2hhbm5lbDtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGFjdGlvbnM6ICcjY2hhdGJveC1hY3Rpb25zJyxcclxuXHRcdFx0Y2hhbm5lbHM6ICcjY2hhdGJveC1jaGFubmVscycsXHJcblx0XHRcdGNoYXRib3g6ICcjY2hhdGJveCcsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY2hhdGJveC1tZXNzYWdlJyxcclxuXHRcdFx0bWVzc2FnZXM6ICcjY2hhdGJveC1tZXNzYWdlcydcclxuXHRcdH07XHJcblx0XHR0aGlzLlVSTCA9IHtcclxuXHRcdFx0Z2V0U3RhcnQ6ICcvY2hhdC9zdGFydCcsXHJcblx0XHRcdGdldFVwZGF0ZTogJy9jaGF0L3VwZGF0ZScsXHJcblx0XHRcdHBvc3RNZXNzYWdlOiAnL2NoYXQvcG9zdC9tZXNzYWdlJyxcclxuXHRcdFx0cG9zdFN0YXR1c0NoYW5nZTogJy9jaGF0L3Bvc3Qvc3RhdHVzL2NoYW5nZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnRpbWVzID0ge1xyXG5cdFx0XHRsYXN0QWN0aXZpdHk6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsYXN0UmVmcmVzaDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCksXHJcblx0XHRcdGxvYWRlZEF0OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKVxyXG5cdFx0fTtcclxuXHRcdHZhciBtb2RlcmF0b3IgPSB1dGlsaXRpZXMuZ2V0QUpBWCgnL2NoYXQvbW9kZXJhdG9yJyk7XHJcblx0XHRtb2RlcmF0b3IuZG9uZShmdW5jdGlvbihtb2RlcmF0b3I6IHN0cmluZykge1xyXG5cdFx0XHRtb2RlcmF0b3IgPSAkLnBhcnNlSlNPTihtb2RlcmF0b3IpO1xyXG5cdFx0XHRjaGF0Ym94Lm1vZGVyYXRvciA9IG1vZGVyYXRvci5tb2QgPT09IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucGFuZWxDaGF0KCk7XHJcblx0XHR0aGlzLmdldFN0YXJ0KCk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0aWYoZS53aGljaCA9PT0gMTMpXHJcblx0XHRcdFx0Y2hhdGJveC5zdWJtaXRNZXNzYWdlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGFubmVscykuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gucGFuZWxDaGFubmVscygpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdH0sIDUwMDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWRkTWVzc2FnZShtZXNzYWdlOiBhbnkpIHtcclxuXHRcdGlmKHRoaXMubGFzdElkIDwgbWVzc2FnZS5pZCkge1xyXG5cdFx0XHR0aGlzLmxhc3RJZCA9IG1lc3NhZ2UuaWQ7XHJcblx0XHR9XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA8PSAxKSB7XHJcblx0XHRcdHRoaXMubWVzc2FnZXNbdGhpcy5tZXNzYWdlcy5sZW5ndGhdID0gbWVzc2FnZTtcclxuXHRcdFx0dGhpcy50aW1lcy5sYXN0QWN0aXZpdHkgPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKSB7XHJcblx0XHRpZighbWVzc2FnZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRpZiAobWVzc2FnZS5zdGF0dXMgPT09IDEpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1oaWRkZW4nPlwiO1xyXG5cdFx0fSBlbHNlIGlmKG1lc3NhZ2Uuc3RhdHVzID09PSAyKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctcGlubmVkJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMykge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbmhpZCc+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cnPlwiO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjx0aW1lIGNsYXNzPSdwdWxsLXJpZ2h0JyBkYXRhLXRzPSdcIiArIG1lc3NhZ2UuY3JlYXRlZF9hdCArIFwiJz5cIjtcclxuXHRcdGh0bWwgKz0gdXRpbGl0aWVzLnRpbWVBZ28obWVzc2FnZS5jcmVhdGVkX2F0KTtcclxuXHRcdGh0bWwgKz0gXCI8L3RpbWU+XCI7XHJcblx0XHRodG1sICs9IFwiPHA+XCI7XHJcblx0XHRpZihjaGF0Ym94Lm1vZGVyYXRvciA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRodG1sICs9IENoYXRib3gubW9kVG9vbHMobWVzc2FnZSk7XHJcblx0XHR9XHJcblx0XHRodG1sICs9IFwiPGEgY2xhc3M9J21lbWJlcnMtXCIgKyBtZXNzYWdlLmNsYXNzX25hbWUgKyBcIic+XCIgKyBtZXNzYWdlLmF1dGhvcl9uYW1lICsgXCI8L2E+OiBcIiArIG1lc3NhZ2UuY29udGVudHNfcGFyc2VkO1xyXG5cdFx0aHRtbCArPSBcIjwvcD5cIjtcclxuXHRcdGh0bWwgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykucHJlcGVuZChodG1sKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZXMoKSB7XHJcblx0XHR2YXIgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdCQuZWFjaChtZXNzYWdlcywgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdH0pO1xyXG5cdFx0JC5lYWNoKHRoaXMucGlubmVkLCBmdW5jdGlvbihpbmRleCwgbWVzc2FnZSkge1xyXG5cdFx0XHRpZihjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkW21lc3NhZ2UuaWRdID0gdHJ1ZTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkID0gW107XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0U3RhcnQoKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoJycpO1xyXG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdHRpbWU6IHRoaXMudGltZXMubG9hZGVkQXQsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdjaGF0L3N0YXJ0JywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLm1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNoYXRib3gucGlubmVkID0gcmVzdWx0cy5waW5uZWQ7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2VzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtb2QoaWQ6IGFueSwgbmV3U3RhdHVzOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRpZDogaWQsXHJcblx0XHRcdHN0YXR1czogbmV3U3RhdHVzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L3N0YXR1cy1jaGFuZ2UnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmdldFN0YXJ0KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2hhdGJveC5lcnJvcihcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwZXJmb3JtaW5nIHRoYXQgbW9kZXJhdGlvbiBjaGFuZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBtb2RUb29scyhtZXNzYWdlKSB7XHJcblx0XHR2YXIgcmVzID0gXCJcIjtcclxuXHRcdHJlcyArPSBcIjx1bCBjbGFzcz0nbGlzdC1pbmxpbmUgaW5saW5lJz5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzICUgMiA9PT0gMCkge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAxKSArIFwiKTsnIHRpdGxlPSdIaWRlIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1taW51cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMSkgKyBcIik7JyB0aXRsZT0nU2hvdyBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtcGx1cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fVxyXG5cdFx0cmVzICs9IFwiPC9saT5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzID49IDIpIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMikgKyBcIik7JyB0aXRsZT0nVW5waW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS1kb3duIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyArIDIpICsgXCIpOycgdGl0bGU9J1BpbiBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtYXJyb3ctY2lyY2xlLXVwIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8L3VsPlwiO1xyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYW5uZWxzKCkge1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L2NoYW5uZWxzJyk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtcG9wdXAtY2hhbm5lbHMnPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nY2xvc2UnIG9uY2xpY2s9J2NoYXRib3gucGFuZWxjbG9zZSgpOyc+Q2xvc2UgPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9J3NyLW9ubHknPkNsb3NlPC9zcGFuPjwvYnV0dG9uPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxoMz5DaGFubmVsczwvaDM+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPHAgY2xhc3M9J2hvbG8tdGV4dCc+Q3VycmVudGx5IG9uIDxiPiNcIiArIGNoYXRib3guY2hhbm5lbCArIFwiPC9iPjwvcD5cIjtcclxuXHRcdFx0JC5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8YSBvbmNsaWNrPVxcXCJjaGF0Ym94LnN3aXRjaENoYW5uZWwoJ1wiICsgdmFsdWUubmFtZSArIFwiJyk7XFxcIj4jXCIgKyB2YWx1ZS5uYW1lICsgXCI8L2E+PGJyIC8+XCI7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8c3BhbiBjbGFzcz0naG9sby10ZXh0LXNlY29uZGFyeSc+XCIgKyB2YWx1ZS5tZXNzYWdlcyArIFwiIG1lc3NhZ2VzPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPkxhc3QgYWN0aXZlIFwiICsgdXRpbGl0aWVzLnRpbWVBZ28odmFsdWUubGFzdF9tZXNzYWdlKSArIFwiPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2hhdCgpIHtcclxuXHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtbWVzc2FnZXMnPjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LWFjdGlvbnMnPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBocmVmPScvdHJhbnNwYXJlbmN5L21hcmtkb3duJyB0YXJnZXQ9J19ibGFuaycgaWQ9J2NoYXRib3gtbWFya2Rvd24nPk1hcmtkb3duPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBpZD0nY2hhdGJveC1jaGFubmVscyc+Q2hhbm5lbHM8L2E+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J2NoYXRib3gtbWVzc2FnZScgLz5cIjtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGF0Ym94KS5odG1sKGNvbnRlbnRzKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENsb3NlKCkge1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdE1lc3NhZ2UoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0bWVzc2FnZSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHRyZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5wb3N0TWVzc2FnZSwgbWVzc2FnZSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHRpZihyZXNwb25zZS5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnJyk7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLXNlbnQnKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0fSwgMTUwMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzcG9uc2UuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3UgYXJlIG5vdCBsb2dnZWQgaW4gYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuZXJyb3IgPT09IC0yKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3Ugd2VyZSBtdXRlZCBmb3Igb25lIGhvdXIgYnkgYSBzdGFmZiBtZW1iZXIgYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3IuICBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0fSwgMjUwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN3aXRjaENoYW5uZWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgZGF0YSxcclxuXHRcdFx0cmVzcG9uc2U7XHJcblx0XHRkYXRhID0ge1xyXG5cdFx0XHRjaGFubmVsOiBuYW1lXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L2NoYW5uZWxzL2NoZWNrJywgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRpZihyZXNwb25zZS52YWxpZCkge1xyXG5cdFx0XHRcdGNoYXRib3guY2hhbm5lbCA9IG5hbWU7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IHRoaXMubGFzdElkLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwuZ2V0VXBkYXRlLCBkYXRhKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNoYXRib3gudGltZXMubGFzdFJlZnJlc2ggPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNsZWFyVGltZW91dChjaGF0Ym94LnRpbWVvdXRVcGRhdGUpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVvdXRVcGRhdGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAxMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGVUaW1lQWdvKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5maW5kKCcubXNnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0dmFyIHRpbWVzdGFtcCA9ICQodmFsdWUpLmZpbmQoJ3RpbWUnKS5hdHRyKCdkYXRhLXRzJyk7XHJcblx0XHRcdCQodmFsdWUpLmZpbmQoJ3RpbWUnKS5odG1sKHV0aWxpdGllcy50aW1lQWdvKHRpbWVzdGFtcCkpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGVUaW1lQWdvKCk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcbn0iLCJ2YXIgY2xhbjtcclxuY2xhc3MgQ2xhbiB7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dmFyIHdhcm5pbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy13YXJuaW5nc11cIik7XHJcblx0XHR2YXIgdGVtcEJhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLXRlbXBvcmFyeS1iYW5zXVwiKTtcclxuXHRcdHZhciBiYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1iYW5zXVwiKTtcclxuXHJcblx0XHR0aGlzLnNldExpc3Rlbih3YXJuaW5ncyk7XHJcblx0XHR0aGlzLnNldExpc3Rlbih0ZW1wQmFucyk7XHJcblx0XHR0aGlzLnNldExpc3RlbihiYW5zKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW4oZGxndHJpZ2dlcikge1xyXG5cdFx0aWYoZGxndHJpZ2dlcikge1xyXG5cdFx0XHR2YXIgc29tZWRpYWxvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRsZ3RyaWdnZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWRpYWxvZycpKTtcclxuXHRcdFx0dmFyIGRsZyA9IG5ldyBEaWFsb2dGeChzb21lZGlhbG9nKTtcclxuXHRcdFx0ZGxndHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRsZy50b2dnbGUuYmluZChkbGcpKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCIvKipcclxuICogZGlhbG9nRnguanMgdjEuMC4wXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxNCwgQ29kcm9wc1xyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqL1xyXG47KCBmdW5jdGlvbiggd2luZG93ICkge1xyXG5cclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciBzdXBwb3J0ID0geyBhbmltYXRpb25zIDogTW9kZXJuaXpyLmNzc2FuaW1hdGlvbnMgfSxcclxuXHRcdGFuaW1FbmRFdmVudE5hbWVzID0geyAnV2Via2l0QW5pbWF0aW9uJyA6ICd3ZWJraXRBbmltYXRpb25FbmQnLCAnT0FuaW1hdGlvbicgOiAnb0FuaW1hdGlvbkVuZCcsICdtc0FuaW1hdGlvbicgOiAnTVNBbmltYXRpb25FbmQnLCAnYW5pbWF0aW9uJyA6ICdhbmltYXRpb25lbmQnIH0sXHJcblx0XHRhbmltRW5kRXZlbnROYW1lID0gYW5pbUVuZEV2ZW50TmFtZXNbIE1vZGVybml6ci5wcmVmaXhlZCggJ2FuaW1hdGlvbicgKSBdLFxyXG5cdFx0b25FbmRBbmltYXRpb24gPSBmdW5jdGlvbiggZWwsIGNhbGxiYWNrICkge1xyXG5cdFx0XHR2YXIgb25FbmRDYWxsYmFja0ZuID0gZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHRcdGlmKCBzdXBwb3J0LmFuaW1hdGlvbnMgKSB7XHJcblx0XHRcdFx0XHRpZiggZXYudGFyZ2V0ICE9IHRoaXMgKSByZXR1cm47XHJcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGFuaW1FbmRFdmVudE5hbWUsIG9uRW5kQ2FsbGJhY2tGbiApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiggY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nICkgeyBjYWxsYmFjay5jYWxsKCk7IH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYoIHN1cHBvcnQuYW5pbWF0aW9ucyApIHtcclxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKCBhbmltRW5kRXZlbnROYW1lLCBvbkVuZENhbGxiYWNrRm4gKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRvbkVuZENhbGxiYWNrRm4oKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0ZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xyXG5cdFx0Zm9yKCB2YXIga2V5IGluIGIgKSB7XHJcblx0XHRcdGlmKCBiLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuXHRcdFx0XHRhW2tleV0gPSBiW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gRGlhbG9nRngoIGVsLCBvcHRpb25zICkge1xyXG5cdFx0dGhpcy5lbCA9IGVsO1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XHJcblx0XHRleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xyXG5cdFx0dGhpcy5jdHJsQ2xvc2UgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdbZGF0YS1kaWFsb2ctY2xvc2VdJyApO1xyXG5cdFx0dGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHRcdHRoaXMuX2luaXRFdmVudHMoKTtcclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS5vcHRpb25zID0ge1xyXG5cdFx0Ly8gY2FsbGJhY2tzXHJcblx0XHRvbk9wZW5EaWFsb2cgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9LFxyXG5cdFx0b25DbG9zZURpYWxvZyA6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNsb3NlIGFjdGlvblxyXG5cdFx0dGhpcy5jdHJsQ2xvc2UuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy50b2dnbGUuYmluZCh0aGlzKSApO1xyXG5cclxuXHRcdC8vIGVzYyBrZXkgY2xvc2VzIGRpYWxvZ1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdFx0aWYoIGtleUNvZGUgPT09IDI3ICYmIHNlbGYuaXNPcGVuICkge1xyXG5cdFx0XHRcdHNlbGYudG9nZ2xlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICcuZGlhbG9nX19vdmVybGF5JyApLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykgKTtcclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdGlmKCB0aGlzLmlzT3BlbiApIHtcclxuXHRcdFx0Y2xhc3NpZS5yZW1vdmUoIHRoaXMuZWwsICdkaWFsb2ctLW9wZW4nICk7XHJcblx0XHRcdGNsYXNzaWUuYWRkKCBzZWxmLmVsLCAnZGlhbG9nLS1jbG9zZScgKTtcclxuXHJcblx0XHRcdG9uRW5kQW5pbWF0aW9uKCB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICcuZGlhbG9nX19jb250ZW50JyApLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZSggc2VsZi5lbCwgJ2RpYWxvZy0tY2xvc2UnICk7XHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHRcdC8vIGNhbGxiYWNrIG9uIGNsb3NlXHJcblx0XHRcdHRoaXMub3B0aW9ucy5vbkNsb3NlRGlhbG9nKCB0aGlzICk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y2xhc3NpZS5hZGQoIHRoaXMuZWwsICdkaWFsb2ctLW9wZW4nICk7XHJcblxyXG5cdFx0XHQvLyBjYWxsYmFjayBvbiBvcGVuXHJcblx0XHRcdHRoaXMub3B0aW9ucy5vbk9wZW5EaWFsb2coIHRoaXMgKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaXNPcGVuID0gIXRoaXMuaXNPcGVuO1xyXG5cdH07XHJcblxyXG5cdC8vIGFkZCB0byBnbG9iYWwgbmFtZXNwYWNlXHJcblx0d2luZG93LkRpYWxvZ0Z4ID0gRGlhbG9nRng7XHJcblxyXG59KSggd2luZG93ICk7IiwidmFyIGNvbWJhdENhbGN1bGF0b3I7XHJcbmNsYXNzIENvbWJhdENhbGN1bGF0b3Ige1xyXG5cdGNsaWNrczogYW55ID0ge307XHJcblx0Z2VuZXJhdGU6IGFueSA9IHt9O1xyXG5cdGlucHV0czogYW55ID0ge307XHJcblx0b3RoZXI6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuY2xpY2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmdlbmVyYXRlID0ge1xyXG5cdFx0XHRsZXZlbDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bGV2ZWwnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5pbnB1dHMgPSB7XHJcblx0XHRcdGF0dGFjazogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6YXR0YWNrJ11cIixcclxuXHRcdFx0ZGVmZW5jZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6ZGVmZW5jZSddXCIsXHJcblx0XHRcdHN0cmVuZ3RoOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdHJlbmd0aCddXCIsXHJcblx0XHRcdGNvbnN0aXR1dGlvbjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6Y29uc3RpdHV0aW9uJ11cIixcclxuXHRcdFx0cmFuZ2VkOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpyYW5nZWQnXVwiLFxyXG5cdFx0XHRwcmF5ZXI6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnByYXllciddXCIsXHJcblx0XHRcdG1hZ2ljOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjptYWdpYyddXCIsXHJcblx0XHRcdHN1bW1vbmluZzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VtbW9uaW5nJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMub3RoZXIgPSB7XHJcblx0XHRcdG5hbWU6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm5hbWUnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0bG9hZENvbWJhdDogJy9jYWxjdWxhdG9ycy9jb21iYXQvbG9hZCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaW5wdXRzLmF0dGFjaykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuZGVmZW5jZSkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3RyZW5ndGgpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmNvbnN0aXR1dGlvbikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucmFuZ2VkKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5wcmF5ZXIpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLm1hZ2ljKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdW1tb25pbmcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuY2xpY2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Z2V0TGV2ZWxzKCkge1xyXG5cdFx0dmFyIG5hbWUgPSAkKHRoaXMub3RoZXIubmFtZSkudmFsKCksXHJcblx0XHRcdGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH0sXHJcblx0XHRcdGxldmVscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmxvYWRDb21iYXQsIGRhdGEpO1xyXG5cdFx0bGV2ZWxzLmRvbmUoZnVuY3Rpb24obGV2ZWxzKSB7XHJcblx0XHRcdGxldmVscyA9ICQucGFyc2VKU09OKGxldmVscyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuYXR0YWNrKS52YWwobGV2ZWxzLmF0dGFjayk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuZGVmZW5jZSkudmFsKGxldmVscy5kZWZlbmNlKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdHJlbmd0aCkudmFsKGxldmVscy5zdHJlbmd0aCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuY29uc3RpdHV0aW9uKS52YWwobGV2ZWxzLmNvbnN0aXR1dGlvbik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucmFuZ2VkKS52YWwobGV2ZWxzLnJhbmdlZCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucHJheWVyKS52YWwobGV2ZWxzLnByYXllcik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMubWFnaWMpLnZhbChsZXZlbHMubWFnaWMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN1bW1vbmluZykudmFsKGxldmVscy5zdW1tb25pbmcpO1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dXBkYXRlTGV2ZWwoKSB7XHJcblx0XHR2YXIgbWVsZWUgPSB0aGlzLnZhbCgnYXR0YWNrJykgKyB0aGlzLnZhbCgnc3RyZW5ndGgnKTtcclxuXHRcdHZhciBtYWdpYyA9IDIgKiB0aGlzLnZhbCgnbWFnaWMnKTtcclxuXHRcdHZhciByYW5nZWQgPSAyICogdGhpcy52YWwoJ3JhbmdlZCcpO1xyXG5cdFx0dmFyIGRlZiA9IHRoaXMudmFsKCdkZWZlbmNlJykgKyB0aGlzLnZhbCgnY29uc3RpdHV0aW9uJyk7XHJcblx0XHR2YXIgb3RoZXIgPSAoLjUgKiB0aGlzLnZhbCgncHJheWVyJykpICsgKC41ICogdGhpcy52YWwoJ3N1bW1vbmluZycpKTtcclxuXHRcdHZhciBsZXZlbCA9ICgxMy8xMCkgKiBNYXRoLm1heChtZWxlZSwgbWFnaWMsIHJhbmdlZCkgKyBkZWYgKyBvdGhlcjtcclxuXHRcdGxldmVsICo9IC4yNTtcclxuXHRcdGxldmVsID0gTWF0aC5mbG9vcihsZXZlbCk7XHJcblx0XHQkKHRoaXMuZ2VuZXJhdGUubGV2ZWwpLmh0bWwobGV2ZWwpO1xyXG5cdH1cclxuXHR2YWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQoJChcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpcIiArIG5hbWUgKyBcIiddXCIpLnZhbCgpKTtcclxuXHR9XHJcbn0iLCJ2YXIgY29udGFjdDtcclxuY2xhc3MgQ29udGFjdCB7XHJcblx0ZGF0YTogYW55ID0ge307XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5kYXRhID0ge1xyXG5cdFx0XHRzZW50OiBmYWxzZVxyXG5cdFx0fTtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGVtYWlsOiAnI2NvbnRhY3QtZW1haWwnLFxyXG5cdFx0XHRlcnJvcjogJyNjb250YWN0LWVycm9yJyxcclxuXHRcdFx0bWVzc2FnZTogJyNjb250YWN0LW1lc3NhZ2UnLFxyXG5cdFx0XHR1c2VybmFtZTogJyNjb250YWN0LXVzZXJuYW1lJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHN1Ym1pdDogXCJbcnQtaG9vaz0nY29udGFjdDpzdWJtaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Zm9ybTogJy9jb250YWN0L3N1Ym1pdCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaG9va3Muc3VibWl0KS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29udGFjdC5zZW5kKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb25lKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC1zdWNjZXNzXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC1kYW5nZXJcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2VuZCgpIHtcclxuXHRcdGlmKHRoaXMuZGF0YS5zZW50ID09PSB0cnVlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmRvbmUoXCJZb3UgaGF2ZSBhbHJlYWR5IHNlbnQgeW91ciBtZXNzYWdlIVwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZW1haWwgPSAkKHRoaXMuZWxlbWVudHMuZW1haWwpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHR1c2VybmFtZSA9ICQodGhpcy5lbGVtZW50cy51c2VybmFtZSkudmFsKCk7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgZW1haWxcclxuXHRcdGlmKHRoaXMudmFsaWRhdGVFbWFpbChlbWFpbCkgPT09IGZhbHNlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVycm9yKFwiVGhhdCBpcyBub3QgYSB2YWxpZGF0ZSBlbWFpbCBhZGRyZXNzLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0Y29udGVudHM6IG1lc3NhZ2UsXHJcblx0XHRcdGVtYWlsOiBlbWFpbCxcclxuXHRcdFx0dXNlcm5hbWU6IHVzZXJuYW1lXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5mb3JtLCBkYXRhKTtcclxuXHRcdHRoaXMud2FybmluZyhcIlNlbmRpbmcgbWVzc2FnZS4uLlwiKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjb250YWN0LmRhdGEuc2VudCA9IHRydWU7XHJcblx0XHRcdFx0Y29udGFjdC5kb25lKFwiWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQuXCIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnRhY3QuZXJyb3IoXCJUaGVyZSB3YXMgYW4gdW5rbm93biBlcnJvciB3aGlsZSBzZW5kaW5nIHlvdXIgbWVzc2FnZS5cIik7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsaWRhdGVFbWFpbChlbWFpbDogYW55KSB7XHJcblx0XHR2YXIgcmUgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcclxuXHRcdHJldHVybiByZS50ZXN0KGVtYWlsKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB3YXJuaW5nKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC13YXJuaW5nXCIpO1xyXG5cdH1cclxufSIsInZhciBmb3J1bXM7XHJcbmNsYXNzIEZvcnVtcyB7XHJcblx0cHVibGljIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIHBvc3Q6IFBvc3QgPSBudWxsO1xyXG5cdHB1YmxpYyB0aHJlYWRDcmVhdGU6IEZvcnVtc1RocmVhZENyZWF0ZSA9IG51bGw7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0J3Bvc3RFZGl0b3InOiBcIltydC1kYXRhPSdwb3N0LmVkaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0cG9sbDoge1xyXG5cdFx0XHRcdHZvdGU6IFwiW3J0LWhvb2s9J2ZvcnVtOnBvbGwudm90ZSddXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHBvbGw6IHtcclxuXHRcdFx0XHR2b3RlOiAnL2ZvcnVtcy9wb2xsL3ZvdGUnXHJcblx0XHRcdH0sXHJcblx0XHRcdHZvdGU6IGZ1bmN0aW9uKGlkOiBudW1iZXIpIHsgcmV0dXJuICcvZm9ydW1zL3Bvc3QvJyArIGlkICsgJy92b3RlJzsgfVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucG9zdCA9IG5ldyBQb3N0KCk7XHJcblx0XHQkKCcudXB2b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy51cHZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnLmRvd252b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy5kb3dudm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQucG9zdDpxdW90ZSddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZS50YXJnZXQpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0Zm9ydW1zLnBvc3QucXVvdGUoaWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaG9va3MucG9sbC52b3RlKS5jbGljayhmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSAkKGUudGFyZ2V0KS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdFx0Zm9ydW1zLnBvbGxWb3RlKGRhdGEucXVlc3Rpb24sIGRhdGEuYW5zd2VyKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRvd252b3RlKHBvc3RJZDogYW55KSB7XHJcblx0XHRwb3N0SWQgPSBwb3N0SWQucmVwbGFjZShcInBvc3RcIiwgXCJcIik7XHJcblx0XHR2YXIgcG9zdCA9ICQoJyNwb3N0JyArIHBvc3RJZCksXHJcblx0XHRcdGlzVXB2b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKSxcclxuXHRcdFx0aXNEb3dudm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzRG93bnZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0JChwb3N0KS5hZGRDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc1Vwdm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQndm90ZSc6ICdkb3duJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB2b3RlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMudm90ZShwb3N0SWQpLCBkYXRhKTtcclxuXHRcdHZvdGUuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBvbGxWb3RlKHF1ZXN0aW9uSWQ6IG51bWJlciwgYW5zd2VySWQ6IG51bWJlcikge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGFuc3dlcjogYW5zd2VySWQsXHJcblx0XHRcdHF1ZXN0aW9uOiBxdWVzdGlvbklkXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5wb2xsLnZvdGUsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzdWx0cy5lcnJvciA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdC8vIFRoZSB1c2VyIHdhcyBub3QgbG9nZ2VkIGluXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIFVua25vd24gZXJyb3JcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8gVE9ETzogTWFrZSBhbiBlcnJvciBkaXZcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXB2b3RlKHBvc3RJZDogYW55KSB7XHJcblx0XHRwb3N0SWQgPSBwb3N0SWQucmVwbGFjZShcInBvc3RcIiwgXCJcIik7XHJcblx0XHR2YXIgcG9zdCA9ICQoJyNwb3N0JyArIHBvc3RJZCksXHJcblx0XHRcdGlzVXB2b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKSxcclxuXHRcdFx0aXNEb3dudm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAndXAnXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbmNsYXNzIFBvc3Qge1xyXG5cdHB1YmxpYyBxdW90ZShpZDogYW55KSB7XHJcblx0XHR2YXIgc291cmNlID0gJChcIltydC1kYXRhPSdwb3N0I1wiICsgaWQgK1wiOnNvdXJjZSddXCIpLmh0bWwoKSxcclxuXHRcdFx0cG9zdENvbnRlbnRzID0gJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKCk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXFxuL2csICdcXG4+Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmx0Oy9nLCAnPCcpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZndDsvZywgJz4nKTtcclxuXHRcdHNvdXJjZSA9IFwiPlwiICsgc291cmNlO1xyXG5cdFx0aWYocG9zdENvbnRlbnRzLmxlbmd0aCA+IDApXHJcblx0XHRcdHBvc3RDb250ZW50cyArPSBcIlxcblwiO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKHBvc3RDb250ZW50cyArIHNvdXJjZSArIFwiXFxuXCIpO1xyXG5cdFx0dXRpbGl0aWVzLnNjcm9sbFRvKCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLCAxMDAwKTtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLmZvY3VzKCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBGb3J1bXNUaHJlYWRDcmVhdGUge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIHF1ZXN0aW9uczogQXJyYXkgPSBbXTtcclxuXHRwdWJsaWMgdmFsdWVzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgdmlld3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHF1ZXN0aW9uQWRkOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uLmFkZCddXCIsXHJcblx0XHRcdHF1ZXN0aW9uczogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbnMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMgPSBBcnJheSg1MDApO1xyXG5cdFx0dGhpcy52YWx1ZXMgPSB7XHJcblx0XHRcdHF1ZXN0aW9uczogMFxyXG5cdFx0fTtcclxuXHRcdHRoaXMudmlld3MgPSB7XHJcblx0XHRcdGFuc3dlcjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLmFuc3dlciddXCIpLmh0bWwoKSxcclxuXHRcdFx0cXVlc3Rpb246ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbiddXCIpLmh0bWwoKVxyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbkFkZCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5hZGRRdWVzdGlvbigpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHB1YmxpYyBhZGRRdWVzdGlvbigpIHtcclxuXHRcdHZhciBodG1sID0gdGhpcy52aWV3cy5xdWVzdGlvbjtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbnMpLmFwcGVuZChodG1sKTtcclxuXHRcdHRoaXMudmFsdWVzLnF1ZXN0aW9ucyArPSAxO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlbW92ZVF1ZXN0aW9uKG51bWJlcjogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnF1ZXN0aW9ucy5zcGxpY2UobnVtYmVyLCAxKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW5lcihlbGVtZW50LCB0eXBlKSB7XHJcblx0XHRpZih0eXBlID09PSBcInJlbW92ZSBxdWVzdGlvblwiKSB7XHJcblx0XHRcdHRoaXMuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50OiBhbnkpIHtcclxuXHRcdCQoZWxlbWVudCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbigkKGVsZW1lbnQpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ3J0LWRhdGEnKSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0Zm9ydW1zID0gbmV3IEZvcnVtcygpO1xyXG59KTsiLCJjbGFzcyBMaXZlc3RyZWFtUmVzZXQge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIGxhbmc6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0bm90ZTogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpub3RlJ11cIixcclxuXHRcdFx0c3Bpbm5lcjogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzcGlubmVyJ11cIixcclxuXHRcdFx0c3RhdHVzOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnN0YXR1cyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmxhbmcgPSB7XHJcblx0XHRcdGNoZWNraW5nOiAnY2hlY2tpbmcnLFxyXG5cdFx0XHRvZmZsaW5lOiAnb2ZmbGluZScsXHJcblx0XHRcdG9ubGluZTogJ29ubGluZScsXHJcblx0XHRcdHVua25vd246ICd1bmtub3duJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHJlc2V0OiAnL2xpdmVzdHJlYW0vcmVzZXQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5yZXNldCgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZXNldCgpIHtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMX0pO1xyXG5cdFx0dmFyIHN0YXR1cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnJlc2V0LCB7fSk7XHJcblx0XHRzdGF0dXMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9IHV0aWxpdGllcy5KU09ORGVjb2RlKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLm9ubGluZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIGlmKHJlc3VsdHMub25saW5lID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPZmZsaW5lKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3Bpbm5lclJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDB9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzcGlubmVyUmVtb3ZlKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnNwaW5uZXIpLmNzcyh7XHJcblx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c2VzKGNoZWNraW5nOiBzdHJpbmcsIG9ubGluZTogc3RyaW5nLCBvZmZsaW5lOiBzdHJpbmcsIHVua25vd246IHN0cmluZykge1xyXG5cdFx0dGhpcy5sYW5nLmNoZWNraW5nID0gY2hlY2tpbmc7XHJcblx0XHR0aGlzLmxhbmcub2ZmbGluZSA9IG9mZmxpbmU7XHJcblx0XHR0aGlzLmxhbmcub25saW5lID0gb25saW5lO1xyXG5cdFx0dGhpcy5sYW5nLnVua25vd24gPSB1bmtub3duO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09mZmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib2ZmbGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT25saW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9ubGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c1Vua25vd24oKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwidW5rbm93blwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtd2FybmluZycpO1xyXG5cdH1cclxufSIsInZhciBydW5ldGltZTtcclxuY2xhc3MgUnVuZVRpbWUge1xyXG5cdGxvYWRpbmc6c3RyaW5nID0gJyNsb2FkaW5nJztcclxufVxyXG5ydW5ldGltZSA9IG5ldyBSdW5lVGltZSgpO1xyXG4kKGZ1bmN0aW9uICgpIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHQkKCdbZGF0YS10b2dnbGVdJykudG9vbHRpcCgpO1xyXG5cdCQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigpO1xyXG5cdCQoJ3Rib2R5LnJvd2xpbmsnKS5yb3dsaW5rKCk7XHJcblx0JCgnI3RvcCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdCQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuXHRcdFx0c2Nyb2xsVG9wOiAwXHJcblx0XHR9LCAxMDAwKTtcclxuXHR9KTtcclxuXHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBoZWlnaHQgPSAkKCdib2R5JykuaGVpZ2h0KCksXHJcblx0XHRcdHNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuXHRcdFx0dG9wID0gJCgnI3RvcCcpO1xyXG5cdFx0aWYoc2Nyb2xsID4gaGVpZ2h0LzEwKSB7XHJcblx0XHRcdGlmKCEkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlSW4oMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKCQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVPdXQoMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxuXHQkKCcubmF2YmFyIC5kcm9wZG93bicpLmhvdmVyKGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5kZWxheSg1MCkuc2xpZGVEb3duKCk7XHJcblx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDEwMCkuc2xpZGVVcCgpXHJcblx0fSk7XHJcbn0pO1xyXG5cclxudmFyIHRvZ2dsZVNlYXJjaDtcclxuLyoqXHJcbiAqIFR5bXBhbnVzIGNvZHJvcHNcclxuICogTW9ycGggc2VhcmNoXHJcbiAqL1xyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdHZhciBtb3JwaFNlYXJjaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb3JwaHNlYXJjaCcpLFxyXG5cdFx0aW5wdXQgPSBtb3JwaFNlYXJjaC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5tb3JwaHNlYXJjaC1pbnB1dCcpLFxyXG5cdFx0Y3RybENsb3NlID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3Rvcignc3Bhbi5tb3JwaHNlYXJjaC1jbG9zZScpLFxyXG5cdFx0aXNPcGVuID0gZmFsc2U7XHJcblx0Ly8gc2hvdy9oaWRlIHNlYXJjaCBhcmVhXHJcblx0dG9nZ2xlU2VhcmNoID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcblx0XHRcdHZhciBvZmZzZXRzID0gbW9ycGhzZWFyY2guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHRcdGlmKGFjdGlvbiA9PT0gJ2Nsb3NlJykge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKG1vcnBoU2VhcmNoLCAnb3BlbicpO1xyXG5cclxuXHRcdFx0XHQvLyB0cmljayB0byBoaWRlIGlucHV0IHRleHQgb25jZSB0aGUgc2VhcmNoIG92ZXJsYXkgY2xvc2VzXHJcblx0XHRcdFx0Ly8gdG9kbzogaGFyZGNvZGVkIHRpbWVzLCBzaG91bGQgYmUgZG9uZSBhZnRlciB0cmFuc2l0aW9uIGVuZHNcclxuXHRcdFx0XHRpZihpbnB1dC52YWx1ZSAhPT0gJycpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGNsYXNzaWUuYWRkKG1vcnBoU2VhcmNoLCAnaGlkZUlucHV0Jyk7XHJcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUobW9ycGhTZWFyY2gsICdoaWRlSW5wdXQnKTtcclxuXHRcdFx0XHRcdFx0XHRpbnB1dC52YWx1ZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHR9LCAzMDApO1xyXG5cdFx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlucHV0LmJsdXIoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChtb3JwaFNlYXJjaCwgJ29wZW4nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aXNPcGVuID0gIWlzT3BlbjtcclxuXHRcdH07XHJcblxyXG5cdC8vIGV2ZW50c1xyXG5cdGN0cmxDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZVNlYXJjaCk7XHJcblx0Ly8gZXNjIGtleSBjbG9zZXMgc2VhcmNoIG92ZXJsYXlcclxuXHQvLyBrZXlib2FyZCBuYXZpZ2F0aW9uIGV2ZW50c1xyXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldikge1xyXG5cdFx0dmFyIGtleUNvZGUgPSBldi5rZXlDb2RlIHx8IGV2LndoaWNoO1xyXG5cdFx0aWYoa2V5Q29kZSA9PT0gMjcgJiYgaXNPcGVuKSB7XHJcblx0XHRcdHRvZ2dsZVNlYXJjaChldik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0dmFyIHNlYXJjaFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlYXJjaCA9ICQoXCJpbnB1dC5tb3JwaHNlYXJjaC1pbnB1dFwiKS52YWwoKTtcclxuXHRcdGlmKHNlYXJjaC5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogc2VhcmNoXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9zZWFyY2gnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkKCcjc2VhcmNoLXBlb3BsZScpLmh0bWwoJzxoMj5QZW9wbGU8L2gyPicpO1xyXG5cdFx0XHQkKCcjc2VhcmNoLXRocmVhZHMnKS5odG1sKCc8aDI+VGhyZWFkczwvaDI+Jyk7XHJcblx0XHRcdCQoJyNzZWFyY2gtbmV3cycpLmh0bWwoJzxoMj5OZXdzPC9oMj4nKTtcclxuXHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLnVzZXJzLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb2JqID0gbWVkaWFPYmplY3QodGhpcy5pbWcsIHRoaXMubmFtZSwgdGhpcy51cmwpO1xyXG5cdFx0XHRcdCQoJyNzZWFyY2gtcGVvcGxlJykuYXBwZW5kKG9iaik7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JC5lYWNoKHJlc3VsdHMudGhyZWFkcywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIG9iaiA9IG1lZGlhT2JqZWN0KHRoaXMuaW1nLCB0aGlzLm5hbWUsIHRoaXMudXJsKTtcclxuXHRcdFx0XHQkKCcjc2VhcmNoLXRocmVhZHMnKS5hcHBlbmQob2JqKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5uZXdzLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb2JqID0gbWVkaWFPYmplY3QodGhpcy5pbWcsIHRoaXMubmFtZSwgdGhpcy51cmwpO1xyXG5cdFx0XHRcdCQoJyNzZWFyY2gtbmV3cycpLmFwcGVuZChvYmopO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblxyXG5cdHZhciBzdWJtaXQgPSBtb3JwaFNlYXJjaC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xyXG5cdGZ1bmN0aW9uIG1lZGlhT2JqZWN0KGltZzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XHJcblx0XHR2YXIgaHRtbCA9IFwiPGEgY2xhc3M9J21lZGlhLW9iamVjdCcgaHJlZj0nXCIgKyB1cmwgKyBcIic+XCI7XHJcblx0XHRpZihpbWcubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRodG1sICs9IFwiPGltZyBzcmM9J1wiICsgaW1nICsgXCInIC8+XCI7XHJcblx0XHR9XHJcblxyXG5cdFx0aHRtbCArPSBcIjxoMz5cIiArIG5hbWUgKyBcIjwvaDM+XCI7XHJcblx0XHRodG1sICs9IFwiPC9hPlwiO1xyXG5cdFx0cmV0dXJuIGh0bWw7XHJcblx0fVxyXG5cdHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2KSB7XHJcblx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0c2VhcmNoU3VibWl0KCk7XHJcblx0fSk7XHJcblxyXG5cdCQoJy5tb3JwaHNlYXJjaC1pbnB1dCcpLmJpbmQoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcblx0XHRpZihlLmtleUNvZGUgPT09IDEzKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0c2VhcmNoU3VibWl0KCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn0pO1xyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHQkKCcjc2VhcmNoLWdsYXNzJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZm9ybSA9ICQoXCIjbW9ycGhzZWFyY2hcIik7XHJcblx0XHR2YXIgaW5wdXQgPSAkKFwiLm1vcnBoc2VhcmNoLWlucHV0XCIpO1xyXG5cdFx0aWYoJChmb3JtKS5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScpIHtcclxuXHRcdFx0JChmb3JtKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQoZm9ybSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0b2dnbGVTZWFyY2goJ2ZvY3VzJyk7XHJcblx0fSk7XHJcblx0JCgnLm1vcnBoc2VhcmNoLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZm9ybSA9ICQoXCIjbW9ycGhzZWFyY2hcIik7XHJcblx0XHQkKGZvcm0pLmFuaW1hdGUoe1xyXG5cdFx0XHRvcGFjaXR5OiAwXHJcblx0XHR9LCA1MDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0dG9nZ2xlU2VhcmNoKCdjbG9zZScpO1xyXG5cdFx0fSwgNTAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoXCIjbW9ycGhzZWFyY2hcIikuY3NzKHtcclxuXHRcdFx0XHRvcGFjaXR5OiAxXHJcblx0XHRcdH0pO1xyXG5cdFx0XHQkKFwiLm1vcnBoc2VhcmNoXCIpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ25vbmUnXHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fSlcclxufSk7IiwidmFyIG5hbWVDaGVja2VyO1xyXG5jbGFzcyBOYW1lQ2hlY2tlciB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGZvcm06IGFueSA9IHt9O1xyXG5cdG5vdEFsbG93ZWQ6IGFueSA9IFtdO1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGF2YWlsYWJpbGl0eTogJyNyc24tYXZhaWxhYmlsaXR5JyxcclxuXHRcdFx0Y2hlY2s6ICcjcnNuLWNoZWNrLWZpZWxkJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMubm90QWxsb3dlZCA9IFsnWm5WamF3PT0nLCAnYzJocGRBPT0nXTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrOiAnL25hbWUtY2hlY2snXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5zZXRGb3JtKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0Rm9ybSgpIHtcclxuXHRcdHRoaXMuZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYW1lY2hlY2tlci1mb3JtJyk7XHJcblx0XHRuZXcgc3RlcHNGb3JtKCB0aGlzLmZvcm0sIHtcclxuXHRcdFx0b25TdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciB1c2VybmFtZSA9ICQoJyNxMScpLnZhbCgpO1xyXG5cdFx0XHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdFx0cnNuOiB1c2VybmFtZVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgobmFtZUNoZWNrZXIucGF0aHMuY2hlY2ssIGRhdGEpO1xyXG5cdFx0XHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0XHRcdHZhciBjbGFzc1NldCA9IG5hbWVDaGVja2VyLmZvcm0ucXVlcnlTZWxlY3RvcignLnNpbWZvcm0taW5uZXInKTtcclxuXHRcdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoY2xhc3NTZXQsJ2hpZGUnKTtcclxuXHRcdFx0XHRcdHZhciBlbCA9IG5hbWVDaGVja2VyLmZvcm0ucXVlcnlTZWxlY3RvcignLmZpbmFsLW1lc3NhZ2UnKTtcclxuXHJcblx0XHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdUaGUgUnVuZXNjYXBlIG5hbWUgPGI+JyArIHVzZXJuYW1lICsgJzwvYj4gaXMgJztcclxuXHRcdFx0XHRcdGlmKHJlc3VsdHMuc3Vic3RyaW5nKDAsIDYpID09PSBcIjxodG1sPlwiKSB7XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2UgKz0gJ2F2YWlsYWJsZS4nO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bWVzc2FnZSArPSAndW5hdmFpbGFibGUuJztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRtZXNzYWdlICs9IFwiPGJyIC8+PGEgaHJlZj0nL25hbWUtY2hlY2snIGNsYXNzPSdidG4gYnRuLXByaW1hcnknPlNlYXJjaCBBZ2FpbjwvYT5cIjtcclxuXHJcblx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSBtZXNzYWdlO1xyXG5cclxuXHRcdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoZWwsICdzaG93Jyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9XHJcbn0iLCJ2YXIgbmV3cztcclxuY2xhc3MgTmV3cyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0Y29tbWVudDoge1xyXG5cdFx0XHRcdGNvbnRlbnRzOiBcIiNuZXdzLWNvbW1lbnQtdGV4dGFyZWFcIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0Y29tbWVudDoge1xyXG5cdFx0XHRcdHN1Ym1pdDogXCJbcnQtaG9vaz0nbmV3cy5hcnRpY2xlOmNvbW1lbnQuc3VibWl0J11cIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y29tbWVudDogZnVuY3Rpb24oaWQ6IGFueSkge1xyXG5cdFx0XHRcdHJldHVybiBcIi9uZXdzL1wiICsgaWQgKyBcIi1uYW1lL3JlcGx5XCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdmVybGF5Jyk7XHJcblx0XHR2YXIgb3ZlcmxheUNsb3NlID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcclxuXHRcdHZhciBoZWFkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVhZGVyJyk7XHJcblx0XHR2YXIgc3dpdGNoQnRubiA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCdidXR0b24uc2xpZGVyLXN3aXRjaCcpO1xyXG5cdFx0dmFyIHRvZ2dsZUJ0bm4gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoc2xpZGVzaG93LmlzRnVsbHNjcmVlbikge1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkKHN3aXRjaEJ0bm4sICd2aWV3LW1heGknKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZShzd2l0Y2hCdG5uLCAndmlldy1tYXhpJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgdG9nZ2xlQ3RybHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoIXNsaWRlc2hvdy5pc0NvbnRlbnQpIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChoZWFkZXIsICdoaWRlJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgdG9nZ2xlQ29tcGxldGVDdHJscyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighc2xpZGVzaG93LmlzQ29udGVudCkge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKGhlYWRlciwgJ2hpZGUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciBzbGlkZXNob3cgPSBuZXcgRHJhZ1NsaWRlc2hvdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2xpZGVzaG93JyksIHtcclxuXHRcdFx0Ly8gdG9nZ2xlIGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgbWluaW1pemVkIHNsaWRlc2hvd1xyXG5cdFx0XHRvblRvZ2dsZTogdG9nZ2xlQnRubixcclxuXHRcdFx0Ly8gdG9nZ2xlIHRoZSBtYWluIGltYWdlIGFuZCB0aGUgY29udGVudCB2aWV3XHJcblx0XHRcdG9uVG9nZ2xlQ29udGVudDogdG9nZ2xlQ3RybHMsXHJcblx0XHRcdC8vIHRvZ2dsZSB0aGUgbWFpbiBpbWFnZSBhbmQgdGhlIGNvbnRlbnQgdmlldyAodHJpZ2dlcmVkIGFmdGVyIHRoZSBhbmltYXRpb24gZW5kcylcclxuXHRcdFx0b25Ub2dnbGVDb250ZW50Q29tcGxldGU6IHRvZ2dsZUNvbXBsZXRlQ3RybHNcclxuXHRcdH0pO1xyXG5cdFx0dmFyIHRvZ2dsZVNsaWRlc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzbGlkZXNob3cudG9nZ2xlKCk7XHJcblx0XHRcdHRvZ2dsZUJ0bm4oKTtcclxuXHRcdH07XHJcblx0XHR2YXIgY2xvc2VPdmVybGF5ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNsYXNzaWUuYWRkKG92ZXJsYXksICdoaWRlJyk7XHJcblx0XHR9O1xyXG5cdFx0Ly8gdG9nZ2xlIGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgc21hbGwgc2xpZGVzaG93XHJcblx0XHRzd2l0Y2hCdG5uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlU2xpZGVzaG93KTtcclxuXHRcdC8vIGNsb3NlIG92ZXJsYXlcclxuXHRcdG92ZXJsYXlDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlT3ZlcmxheSk7XHJcblxyXG5cdFx0aWYobG9jYWxTdG9yYWdlKSB7XHJcblx0XHRcdHZhciBzaG93ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbmV3cy5pbmZvLnNob3dlZCcpO1xyXG5cdFx0XHRpZihzaG93ZWQgPT09ICd0cnVlJykge1xyXG5cdFx0XHRcdGNsb3NlT3ZlcmxheSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zZXR1cEFjdGlvbnMoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXR1cEFjdGlvbnMoKSB7XHJcblx0XHQkKFwiZGl2LmluZm8gYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihsb2NhbFN0b3JhZ2UpIHtcclxuXHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbmV3cy5pbmZvLnNob3dlZCcsICd0cnVlJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmhvb2tzLmNvbW1lbnQuc3VibWl0KS5jbGljayhmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGlkID0gJChlLnRhcmdldCkucGFyZW50KCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5maW5kKCd0ZXh0YXJlYScpLnZhbCgpO1xyXG5cdFx0XHRuZXdzLnN1Ym1pdENvbW1lbnQoaWQsIGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdENvbW1lbnQoaWQsIGNvbnRlbnRzKSB7XHJcblx0XHRpZihjb250ZW50cy5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH1cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogY29udGVudHNcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmNvbW1lbnQoaWQpLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlc3VsdHMudXJsO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGVycm9yXHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdG9Db21tZW50cyhpZDogbnVtYmVyKSB7XHJcblx0XHQkKFwiW2RhdGEtY29udGVudD0nY29udGVudC1cIiArIGlkICtcIiddIGJ1dHRvbi5jb250ZW50LXN3aXRjaFwiKS50cmlnZ2VyKCdjbGljaycpO1xyXG5cdH1cclxufSIsImNsYXNzIE5vdGlmaWNhdGlvbnMge1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgcGF0aHM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wYXRocyA9IHtcclxuICAgICAgICAgICAgbWFya1JlYWQ6ICcvbm90aWZpY2F0aW9ucy9tYXJrLXJlYWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKFwiW3J0LWhvb2s9J2hvb2shbm90aWZpY2F0aW9uczptYXJrLnJlYWQnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZS50YXJnZXQuYXR0cigncnQtZGF0YScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciByYWRpbztcclxudmFyIGNoYXRib3g7XHJcbmNsYXNzIFJhZGlvIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0b25saW5lOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwb3B1cDogYW55ID0gbnVsbDtcclxuXHRzdGF0dXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRzdGF0dXNDbG9zZWQ6IHN0cmluZyA9ICcnO1xyXG5cdHN0YXR1c09wZW46IHN0cmluZyA9ICcnO1xyXG5cdFVSTDogc3RyaW5nID0gJyc7XHJcblx0dmFyTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblx0dmFyU3RhdHVzOiBzdHJpbmcgPSAnJztcclxuXHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5VUkwgPSAnaHR0cDovL2FwcHMuc3RyZWFtbGljZW5zaW5nLmNvbS9wbGF5ZXItcG9wdXAucGhwP3NpZD0yNTc5JnN0cmVhbV9pZD00Mzg2JztcclxuXHRcdHRoaXMuc3RhdHVzQ2xvc2VkID0gJ3RvIGxpc3RlbiB0byBSdW5lVGltZSBSYWRpbyEnO1xyXG5cdFx0dGhpcy5zdGF0dXNPcGVuID0gJ3RvIGNsb3NlIFJ1bmVUaW1lIFJhZGlvJztcclxuXHRcdHRoaXMudmFyTWVzc2FnZSA9ICcjcmFkaW8tbWVzc2FnZSc7XHJcblx0XHR0aGlzLnZhclN0YXR1cyA9ICcjcmFkaW8tc3RhdHVzJztcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRzdGF0dXNNZXNzYWdlOiAnI3JhZGlvLXN0YXR1cy1tZXNzYWdlJ1xyXG5cdFx0fTtcclxuXHJcblx0XHQkKCcjcmFkaW8taGlzdG9yeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuSGlzdG9yeSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ucmVxdWVzdE9wZW4oKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby10aW1ldGFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblRpbWV0YWJsZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5wdWxsSGlkZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3Blbkhpc3RvcnkoKSB7XHJcblx0XHR2YXIgaGlzdG9yeSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9oaXN0b3J5Jyk7XHJcblx0XHRoaXN0b3J5LmRvbmUoZnVuY3Rpb24oaGlzdG9yeTogc3RyaW5nKSB7XHJcblx0XHRcdGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuXHRcdFx0dmFyIG11c2ljID0gbnVsbCxcclxuXHRcdFx0XHRodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlJz48dGhlYWQ+PHRyPjx0ZD5UaW1lPC90ZD48dGQ+QXJ0aXN0PC90ZD48dGQ+TmFtZTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IGhpc3RvcnkubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0bXVzaWMgPSBoaXN0b3J5W3hdO1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3BlblRpbWV0YWJsZSgpIHtcclxuXHRcdHZhciB0aW1ldGFibGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdGltZXRhYmxlJyk7XHJcblx0XHR0aW1ldGFibGUuZG9uZShmdW5jdGlvbih0aW1ldGFibGU6IHN0cmluZykge1xyXG5cdFx0XHR0aW1ldGFibGUgPSAkLnBhcnNlSlNPTih0aW1ldGFibGUpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0ZXh0LWNlbnRlcic+PHRoZWFkPjx0cj48dGQ+Jm5ic3A7PC90ZD48dGQ+TW9uZGF5PC90ZD48dGQ+VHVlc2RheTwvdGQ+PHRkPldlZG5lc2RheTwvdGQ+PHRkPlRodXJzZGF5PC90ZD48dGQ+RnJpZGF5PC90ZD48dGQ+U2F0dXJkYXk8L3RkPjx0ZD5TdW5kYXk8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSAyMzsgeCA8PSB5OyB4KyspIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHRyPjx0ZD5cIiArIHggKyBcIjowMDwvdGQ+XCI7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDY7IGkgPD0gajsgaSsrKSB7XHJcblx0XHRcdFx0XHRodG1sICs9IFwiPHRkPlwiO1xyXG5cdFx0XHRcdFx0aWYodGltZXRhYmxlW2ldICE9PSB1bmRlZmluZWQgJiYgdGltZXRhYmxlW2ldW3hdICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSB0aW1ldGFibGVbaV1beF07XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IFwiJm5ic3A7XCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjwvdGQ+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sICs9IFwiPC90cj5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvbmxpbmVTZXR0aW5ncyhvbmxpbmU6IGJvb2xlYW4pIHtcclxuXHRcdHRoaXMub25saW5lID0gb25saW5lO1xyXG5cclxuXHRcdGlmKG9ubGluZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlRoZSByYWRpbyBoYXMgYmVlbiBzZXQgb2ZmbGluZS5cIik7XHJcblx0XHRcdCQodGhpcy52YXJTdGF0dXMpLnJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJykuXHJcblx0XHRcdFx0aHRtbChcIjxpIGlkPSdwb3dlci1idXR0b24nIGNsYXNzPSdmYSBmYS1wb3dlci1vZmYnPjwvaT5PZmZcIik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlwiKTtcclxuXHRcdFx0JCh0aGlzLnZhclN0YXR1cykucmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJykuXHJcblx0XHRcdFx0aHRtbChcIjxpIGlkPSdwb3dlci1idXR0b24nIGNsYXNzPSdmYSBmYS1wb3dlci1vZmYnPjwvaT5PblwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsSGlkZSgpIHtcclxuXHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbCgnJm5ic3A7Jyk7XHJcblx0XHQkKCcjcmFkaW8tcHVsbCcpLndpZHRoKCcnKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS53aWR0aCgnJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsT3Blbihjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlcXVlc3RPcGVuKCkge1xyXG5cdFx0dmFyIHJlcXVlc3QgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJyk7XHJcblx0XHRyZXF1ZXN0LmRvbmUoZnVuY3Rpb24ocmVxdWVzdDogc3RyaW5nKSB7XHJcblx0XHRcdHJlcXVlc3QgPSAkLnBhcnNlSlNPTihyZXF1ZXN0KTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAyKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxmb3JtIHJvbGU9J2Zvcm0nPjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtYXJ0aXN0Jz5BcnRpc3QgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LWFydGlzdCcgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1hcnRpc3QnIHBsYWNlaG9sZGVyPSdBcnRpc3QgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48bGFiZWwgZm9yPSdyZXF1ZXN0LW5hbWUnPlNvbmcgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LW5hbWUnIGNsYXNzPSdmb3JtLWNvbnRyb2wnIG5hbWU9J3JlcXVlc3QtbmFtZScgcGxhY2Vob2xkZXI9J1NvbmcgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48cCBpZD0ncmVxdWVzdC1idXR0b24nIGNsYXNzPSdidG4gYnRuLXByaW1hcnknPlJlcXVlc3Q8L3A+PC9kaXY+PC9mb3JtPlwiO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5yZXNwb25zZSA9PT0gMSkge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8cCBjbGFzcz0ndGV4dC13YXJuaW5nJz5BdXRvIERKIGN1cnJlbnRseSBkb2VzIG5vdCBhY2NlcHQgc29uZyByZXF1ZXN0cywgc29ycnkhXCI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+WW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHJlcXVlc3QgYSBzb25nIGZyb20gdGhlIERKLjwvcD5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJhZGlvLnJlcXVlc3RTZW5kKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMzAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVxdWVzdFNlbmQoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J2FydGlzdCc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LWFydGlzdCcpLnZhbHVlLFxyXG5cdFx0XHQnbmFtZSc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LW5hbWUnKS52YWx1ZVxyXG5cdFx0fTtcclxuXHRcdHZhciBjb250ZW50cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJywgZGF0YSk7XHJcblx0XHRjb250ZW50cy5kb25lKGZ1bmN0aW9uKGNvbnRlbnRzOiBzdHJpbmcpIHtcclxuXHRcdFx0Y29udGVudHMgPSAkLnBhcnNlSlNPTihjb250ZW50cyk7XHJcblx0XHRcdHZhciBodG1sID0gXCJcIjtcclxuXHRcdFx0aWYoY29udGVudHMuc2VudCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LXN1Y2Nlc3MnPllvdXIgcmVxdWVzdCBoYXMgYmVlbiBzZW50IHRvIHRoZSBESjwvcD5cIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC4gIFRyeSBhZ2Fpbj9cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnB1bGxIaWRlKCk7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwZGF0ZSgpIHtcclxuXHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKCcnKTtcclxuXHRcdHZhciB1cGRhdGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdXBkYXRlJyk7XHJcblx0XHR1cGRhdGUuZG9uZShmdW5jdGlvbih1cGRhdGUpIHtcclxuXHRcdFx0dXBkYXRlID0gJC5wYXJzZUpTT04odXBkYXRlKTtcclxuXHRcdFx0dmFyIHJlcXVlc3RzSFRNTCA9IFwiXCI7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLW5hbWUnKS5odG1sKHVwZGF0ZVsnc29uZyddWyduYW1lJ10pO1xyXG5cdFx0XHQkKCcjcmFkaW8tc29uZy1hcnRpc3QnKS5odG1sKHVwZGF0ZVsnc29uZyddWydhcnRpc3QnXSk7XHJcblx0XHRcdGlmKHVwZGF0ZVsnZGonXSAhPT0gbnVsbCAmJiB1cGRhdGVbJ2RqJ10gIT09ICcnKSB7XHJcblx0XHRcdFx0JCgnI3JhZGlvLWRqJykuaHRtbChcIkRKIFwiICsgdXBkYXRlWydkaiddKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiQXV0byBESlwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodXBkYXRlWydtZXNzYWdlJ10gIT09ICcnICYmIHVwZGF0ZVsnbWVzc2FnZSddICE9PSAtMSkge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwodXBkYXRlWydtZXNzYWdlJ10pO1xyXG5cdFx0XHR9IGVsc2UgaWYodXBkYXRlWydtZXNzYWdlJ10gPT09IC0xICYmIHVwZGF0ZVsnZGonXSAhPT0gbnVsbCAmJiB1cGRhdGVbJ2RqJ10gIT09ICcnKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkRKIFwiICsgdXBkYXRlWydkaiddICsgXCIgaXMgY3VycmVudGx5IG9uIGFpciFcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkF1dG8gREogaXMgY3VycmVudGx5IG9uIGFpclwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IHVwZGF0ZVsncmVxdWVzdHMnXS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9IHVwZGF0ZVsncmVxdWVzdHMnXVt4XTtcclxuXHRcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PSAwKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cD5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMSkge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+XCI7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09IDIpIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gcmVxdWVzdC5zb25nX25hbWUgKyBcIiBieSBcIiArIHJlcXVlc3Quc29uZ19hcnRpc3Q7XHJcblx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPC9wPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKCcjcmVxdWVzdHMtdXNlci1jdXJyZW50JykuaHRtbChyZXF1ZXN0c0hUTUwpO1xyXG5cclxuXHRcdFx0cmFkaW8ub25saW5lU2V0dGluZ3ModXBkYXRlLm9ubGluZSk7XHJcblxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJhZGlvLnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAzMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbmF0dXJlO1xyXG5jbGFzcyBTaWduYXR1cmUge1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRzdWJtaXQ6ICcvc2lnbmF0dXJlcydcclxuXHRcdH07XHJcblx0XHR2YXIgdGhlRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduYXR1cmUtZm9ybScpO1xyXG5cdFx0bmV3IHN0ZXBzRm9ybSggdGhlRm9ybSwge1xyXG5cdFx0XHRvblN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHVzZXJuYW1lID0gJCgnI3ExJykudmFsKCk7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0XHR1c2VybmFtZTogdXNlcm5hbWVcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHV0aWxpdGllcy5wb3N0KHNpZ25hdHVyZS5wYXRocy5zdWJtaXQsIGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fVxyXG59IiwidmFyIHNpZ251cEZvcm07XHJcbmNsYXNzIFNpZ251cEZvcm0ge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRkaXNwbGF5TmFtZTogJyNkaXNwbGF5X25hbWUnLFxyXG5cdFx0XHRlbWFpbDogJyNlbWFpbCcsXHJcblx0XHRcdHBhc3N3b3JkOiAnI3Bhc3N3b3JkJyxcclxuXHRcdFx0cGFzc3dvcmQyOiAnI3Bhc3N3b3JkMicsXHJcblx0XHRcdHNlY3VyaXR5Q2hlY2s6ICcjc2VjdXJpdHknXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2tBdmFpbGFiaWxpdHk6ICcvZ2V0L3NpZ251cC8nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQsXHJcblx0XHRcdHRpbWVvdXQgPSA1MDA7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdkaXNwbGF5X25hbWUnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lbWFpbCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdFbWFpbCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRW1haWwpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCdmb3JtJykuc3VibWl0KGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uc3VibWl0KGUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja0F2YWlsYWJpbGl0eShmaWVsZDogc3RyaW5nKSB7XHJcblx0XHR2YXIgdmFsID0gJCgnIycgKyBmaWVsZCkudmFsKCk7XHJcblx0XHRpZih2YWwubGVuZ3RoID09PSAwKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR2YXIgdXJsID0gdGhpcy5wYXRocy5jaGVja0F2YWlsYWJpbGl0eSArIGZpZWxkO1xyXG5cdFx0dmFyIGF2YWlsYWJsZTtcclxuXHRcdGlmKGZpZWxkID09PSBcImRpc3BsYXlfbmFtZVwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZGlzcGxheV9uYW1lOiB2YWwgfSk7XHJcblx0XHR9IGVsc2UgaWYoZmllbGQgPT09IFwiZW1haWxcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGVtYWlsOiB2YWwgfSk7XHJcblx0XHR9XHJcblx0XHRhdmFpbGFibGUuZG9uZShmdW5jdGlvbihhdmFpbGFibGU6IHN0cmluZykge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShhdmFpbGFibGUpO1xyXG5cdFx0XHRpZihhdmFpbGFibGUuYXZhaWxhYmxlID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrUGFzc3dvcmQoKSB7XHJcblx0XHR2YXIgdjEgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLnZhbCgpLFxyXG5cdFx0XHR2MiA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLnZhbCgpO1xyXG5cdFx0aWYodjIubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRpZih2MSA9PT0gdjIpIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIHRydWUpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIHRydWUpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgZmFsc2UpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNoZWNrU2VjdXJpdHkoKSB7XHJcblx0XHR2YXIgc2xpZGVyVmFsID0gJCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLnZhbCgpO1xyXG5cdFx0aWYoc2xpZGVyVmFsIDw9IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdub25lJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSBpZihzbGlkZXJWYWwgPiAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnYmxvY2snXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3VibWl0KGU6IGFueSkge1xyXG5cdFx0dmFyIHVzZXJuYW1lID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgndXNlcm5hbWUnKSxcclxuXHRcdFx0ZW1haWwgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpLFxyXG5cdFx0XHRwYXNzID0gdGhpcy5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRpZih1c2VybmFtZSA9PT0gdHJ1ZSAmJiBlbWFpbCA9PT0gdHJ1ZSAmJiBwYXNzID09PSB0cnVlKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR0b2dnbGVGZWVkYmFjayhmaWVsZDogc3RyaW5nLCBzdGF0dXM6IGJvb2xlYW4pIHtcclxuXHRcdGlmKHN0YXR1cyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJjbGFzcyBTdGFmZkxpc3Qge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdmFyIG1lbWJlcnMgPSAkKFwiW3J0LWhvb2s9J2hvb2shc3RhZmYubGlzdDpjYXJkJ11cIik7XHJcbiAgICAgICAgJC5lYWNoKG1lbWJlcnMsIGZ1bmN0aW9uKGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICQodmFsdWUpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHZhbCkuYXR0cigncnQtZGF0YScpO1xyXG4gICAgICAgICAgICB2YXIgc3JjID0gXCJcIjtcclxuICAgICAgICAgICAgaWYoaWQgPT0gJ25vJykge1xyXG4gICAgICAgICAgICAgICAgc3JjID0gJCh2YWwpLmF0dHIoJ3J0LWRhdGEyJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcmMgPSBpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKHZhbCkuZmluZCgnLmZyb250JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogXCJ1cmwoJy9pbWcvZm9ydW1zL3Bob3Rvcy9cIiArIHNyYyArIFwiLnBuZycpXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmFsKS5iaW5kKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBzdGVwc0Zvcm0uanMgdjEuMC4wXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxNCwgQ29kcm9wc1xyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqL1xyXG47KCBmdW5jdGlvbiggd2luZG93ICkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHR2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG5cdFx0XHQnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXHJcblx0XHRcdCdPVHJhbnNpdGlvbic6ICdvVHJhbnNpdGlvbkVuZCcsXHJcblx0XHRcdCdtc1RyYW5zaXRpb24nOiAnTVNUcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCdcclxuXHRcdH0sXHJcblx0XHR0cmFuc0VuZEV2ZW50TmFtZSA9IHRyYW5zRW5kRXZlbnROYW1lc1sgTW9kZXJuaXpyLnByZWZpeGVkKCAndHJhbnNpdGlvbicgKSBdLFxyXG5cdFx0c3VwcG9ydCA9IHsgdHJhbnNpdGlvbnMgOiBNb2Rlcm5penIuY3NzdHJhbnNpdGlvbnMgfTtcclxuXHJcblx0ZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xyXG5cdFx0Zm9yKCB2YXIga2V5IGluIGIgKSB7XHJcblx0XHRcdGlmKCBiLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuXHRcdFx0XHRhW2tleV0gPSBiW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc3RlcHNGb3JtKCBlbCwgb3B0aW9ucyApIHtcclxuXHRcdHRoaXMuZWwgPSBlbDtcclxuXHRcdHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xyXG5cdFx0ZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcclxuXHRcdHRoaXMuX2luaXQoKTtcclxuXHR9XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuXHRcdG9uU3VibWl0IDogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdH07XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdHRoaXMuY3VycmVudCA9IDA7XHJcblxyXG5cdFx0Ly8gcXVlc3Rpb25zXHJcblx0XHR0aGlzLnF1ZXN0aW9ucyA9IFtdLnNsaWNlLmNhbGwoIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCggJ29sLnF1ZXN0aW9ucyA+IGxpJyApICk7XHJcblx0XHQvLyB0b3RhbCBxdWVzdGlvbnNcclxuXHRcdHRoaXMucXVlc3Rpb25zQ291bnQgPSB0aGlzLnF1ZXN0aW9ucy5sZW5ndGg7XHJcblx0XHQvLyBzaG93IGZpcnN0IHF1ZXN0aW9uXHJcblx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLnF1ZXN0aW9uc1swXSwgJ2N1cnJlbnQnICk7XHJcblxyXG5cdFx0Ly8gbmV4dCBxdWVzdGlvbiBjb250cm9sXHJcblx0XHR0aGlzLmN0cmxOZXh0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnYnV0dG9uLm5leHQnICk7XHJcblxyXG5cdFx0Ly8gcHJvZ3Jlc3MgYmFyXHJcblx0XHR0aGlzLnByb2dyZXNzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnZGl2LnByb2dyZXNzJyApO1xyXG5cclxuXHRcdC8vIHF1ZXN0aW9uIG51bWJlciBzdGF0dXNcclxuXHRcdHRoaXMucXVlc3Rpb25TdGF0dXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdzcGFuLm51bWJlcicgKTtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb24gcGxhY2Vob2xkZXJcclxuXHRcdHRoaXMuY3VycmVudE51bSA9IHRoaXMucXVlc3Rpb25TdGF0dXMucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyLWN1cnJlbnQnICk7XHJcblx0XHR0aGlzLmN1cnJlbnROdW0uaW5uZXJIVE1MID0gTnVtYmVyKCB0aGlzLmN1cnJlbnQgKyAxICk7XHJcblx0XHQvLyB0b3RhbCBxdWVzdGlvbnMgcGxhY2Vob2xkZXJcclxuXHRcdHRoaXMudG90YWxRdWVzdGlvbk51bSA9IHRoaXMucXVlc3Rpb25TdGF0dXMucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyLXRvdGFsJyApO1xyXG5cdFx0dGhpcy50b3RhbFF1ZXN0aW9uTnVtLmlubmVySFRNTCA9IHRoaXMucXVlc3Rpb25zQ291bnQ7XHJcblxyXG5cdFx0Ly8gZXJyb3IgbWVzc2FnZVxyXG5cdFx0dGhpcy5lcnJvciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ3NwYW4uZXJyb3ItbWVzc2FnZScgKTtcclxuXHJcblx0XHQvLyBpbml0IGV2ZW50c1xyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cdH07XHJcblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2luaXRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdC8vIGZpcnN0IGlucHV0XHJcblx0XHRcdGZpcnN0RWxJbnB1dCA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXS5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICksXHJcblx0XHQvLyBmb2N1c1xyXG5cdFx0XHRvbkZvY3VzU3RhcnRGbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGZpcnN0RWxJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzU3RhcnRGbiApO1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHNlbGYuY3RybE5leHQsICdzaG93JyApO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdC8vIHNob3cgdGhlIG5leHQgcXVlc3Rpb24gY29udHJvbCBmaXJzdCB0aW1lIHRoZSBpbnB1dCBnZXRzIGZvY3VzZWRcclxuXHRcdGZpcnN0RWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzU3RhcnRGbiApO1xyXG5cclxuXHRcdC8vIHNob3cgbmV4dCBxdWVzdGlvblxyXG5cdFx0dGhpcy5jdHJsTmV4dC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHNlbGYuX25leHRRdWVzdGlvbigpO1xyXG5cdFx0fSApO1xyXG5cclxuXHRcdC8vIHByZXNzaW5nIGVudGVyIHdpbGwganVtcCB0byBuZXh0IHF1ZXN0aW9uXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0dmFyIGtleUNvZGUgPSBldi5rZXlDb2RlIHx8IGV2LndoaWNoO1xyXG5cdFx0XHQvLyBlbnRlclxyXG5cdFx0XHRpZigga2V5Q29kZSA9PT0gMTMgKSB7XHJcblx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRzZWxmLl9uZXh0UXVlc3Rpb24oKTtcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdC8vIGRpc2FibGUgdGFiXHJcblx0XHR0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdC8vIHRhYlxyXG5cdFx0XHRpZigga2V5Q29kZSA9PT0gOSApIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fbmV4dFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZiggIXRoaXMuX3ZhbGlkYWRlKCkgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjaGVjayBpZiBmb3JtIGlzIGZpbGxlZFxyXG5cdFx0aWYoIHRoaXMuY3VycmVudCA9PT0gdGhpcy5xdWVzdGlvbnNDb3VudCAtIDEgKSB7XHJcblx0XHRcdHRoaXMuaXNGaWxsZWQgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNsZWFyIGFueSBwcmV2aW91cyBlcnJvciBtZXNzYWdlc1xyXG5cdFx0dGhpcy5fY2xlYXJFcnJvcigpO1xyXG5cclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdHZhciBjdXJyZW50UXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uc1sgdGhpcy5jdXJyZW50IF07XHJcblxyXG5cdFx0Ly8gaW5jcmVtZW50IGN1cnJlbnQgcXVlc3Rpb24gaXRlcmF0b3JcclxuXHRcdCsrdGhpcy5jdXJyZW50O1xyXG5cclxuXHRcdC8vIHVwZGF0ZSBwcm9ncmVzcyBiYXJcclxuXHRcdHRoaXMuX3Byb2dyZXNzKCk7XHJcblxyXG5cdFx0aWYoICF0aGlzLmlzRmlsbGVkICkge1xyXG5cdFx0XHQvLyBjaGFuZ2UgdGhlIGN1cnJlbnQgcXVlc3Rpb24gbnVtYmVyL3N0YXR1c1xyXG5cdFx0XHR0aGlzLl91cGRhdGVRdWVzdGlvbk51bWJlcigpO1xyXG5cclxuXHRcdFx0Ly8gYWRkIGNsYXNzIFwic2hvdy1uZXh0XCIgdG8gZm9ybSBlbGVtZW50IChzdGFydCBhbmltYXRpb25zKVxyXG5cdFx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLmVsLCAnc2hvdy1uZXh0JyApO1xyXG5cclxuXHRcdFx0Ly8gcmVtb3ZlIGNsYXNzIFwiY3VycmVudFwiIGZyb20gY3VycmVudCBxdWVzdGlvbiBhbmQgYWRkIGl0IHRvIHRoZSBuZXh0IG9uZVxyXG5cdFx0XHQvLyBjdXJyZW50IHF1ZXN0aW9uXHJcblx0XHRcdHZhciBuZXh0UXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uc1sgdGhpcy5jdXJyZW50IF07XHJcblx0XHRcdGNsYXNzaWUucmVtb3ZlQ2xhc3MoIGN1cnJlbnRRdWVzdGlvbiwgJ2N1cnJlbnQnICk7XHJcblx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIG5leHRRdWVzdGlvbiwgJ2N1cnJlbnQnICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gYWZ0ZXIgYW5pbWF0aW9uIGVuZHMsIHJlbW92ZSBjbGFzcyBcInNob3ctbmV4dFwiIGZyb20gZm9ybSBlbGVtZW50IGFuZCBjaGFuZ2UgY3VycmVudCBxdWVzdGlvbiBwbGFjZWhvbGRlclxyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0XHRvbkVuZFRyYW5zaXRpb25GbiA9IGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0XHRpZiggc3VwcG9ydC50cmFuc2l0aW9ucyApIHtcclxuXHRcdFx0XHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNFbmRFdmVudE5hbWUsIG9uRW5kVHJhbnNpdGlvbkZuICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKCBzZWxmLmlzRmlsbGVkICkge1xyXG5cdFx0XHRcdFx0c2VsZi5fc3VibWl0KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggc2VsZi5lbCwgJ3Nob3ctbmV4dCcgKTtcclxuXHRcdFx0XHRcdHNlbGYuY3VycmVudE51bS5pbm5lckhUTUwgPSBzZWxmLm5leHRRdWVzdGlvbk51bS5pbm5lckhUTUw7XHJcblx0XHRcdFx0XHRzZWxmLnF1ZXN0aW9uU3RhdHVzLnJlbW92ZUNoaWxkKCBzZWxmLm5leHRRdWVzdGlvbk51bSApO1xyXG5cdFx0XHRcdFx0Ly8gZm9yY2UgdGhlIGZvY3VzIG9uIHRoZSBuZXh0IGlucHV0XHJcblx0XHRcdFx0XHRuZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvciggJ2lucHV0JyApLmZvY3VzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdGlmKCBzdXBwb3J0LnRyYW5zaXRpb25zICkge1xyXG5cdFx0XHR0aGlzLnByb2dyZXNzLmFkZEV2ZW50TGlzdGVuZXIoIHRyYW5zRW5kRXZlbnROYW1lLCBvbkVuZFRyYW5zaXRpb25GbiApO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdG9uRW5kVHJhbnNpdGlvbkZuKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB1cGRhdGVzIHRoZSBwcm9ncmVzcyBiYXIgYnkgc2V0dGluZyBpdHMgd2lkdGhcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9wcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9ncmVzcy5zdHlsZS53aWR0aCA9IHRoaXMuY3VycmVudCAqICggMTAwIC8gdGhpcy5xdWVzdGlvbnNDb3VudCApICsgJyUnO1xyXG5cdH1cclxuXHJcblx0Ly8gY2hhbmdlcyB0aGUgY3VycmVudCBxdWVzdGlvbiBudW1iZXJcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl91cGRhdGVRdWVzdGlvbk51bWJlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gZmlyc3QsIGNyZWF0ZSBuZXh0IHF1ZXN0aW9uIG51bWJlciBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy5uZXh0UXVlc3Rpb25OdW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcclxuXHRcdHRoaXMubmV4dFF1ZXN0aW9uTnVtLmNsYXNzTmFtZSA9ICdudW1iZXItbmV4dCc7XHJcblx0XHR0aGlzLm5leHRRdWVzdGlvbk51bS5pbm5lckhUTUwgPSBOdW1iZXIoIHRoaXMuY3VycmVudCArIDEgKTtcclxuXHRcdC8vIGluc2VydCBpdCBpbiB0aGUgRE9NXHJcblx0XHR0aGlzLnF1ZXN0aW9uU3RhdHVzLmFwcGVuZENoaWxkKCB0aGlzLm5leHRRdWVzdGlvbk51bSApO1xyXG5cdH1cclxuXHJcblx0Ly8gc3VibWl0cyB0aGUgZm9ybVxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3N1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLm9uU3VibWl0KCB0aGlzLmVsICk7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIChuZXh0IHZlcnNpb24uLilcclxuXHQvLyB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvblxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3ZhbGlkYWRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBjdXJyZW50IHF1ZXN0aW9uw4LCtHMgaW5wdXRcclxuXHRcdHZhciBpbnB1dCA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXS5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICkudmFsdWU7XHJcblx0XHRpZiggaW5wdXQgPT09ICcnICkge1xyXG5cdFx0XHR0aGlzLl9zaG93RXJyb3IoICdFTVBUWVNUUicgKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gVE9ETyAobmV4dCB2ZXJzaW9uLi4pXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fc2hvd0Vycm9yID0gZnVuY3Rpb24oIGVyciApIHtcclxuXHRcdHZhciBtZXNzYWdlID0gJyc7XHJcblx0XHRzd2l0Y2goIGVyciApIHtcclxuXHRcdFx0Y2FzZSAnRU1QVFlTVFInIDpcclxuXHRcdFx0XHRtZXNzYWdlID0gJ1BsZWFzZSBmaWxsIHRoZSBmaWVsZCBiZWZvcmUgY29udGludWluZyc7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ0lOVkFMSURFTUFJTCcgOlxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnUGxlYXNlIGZpbGwgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Ly8gLi4uXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5lcnJvci5pbm5lckhUTUwgPSBtZXNzYWdlO1xyXG5cdFx0Y2xhc3NpZS5hZGRDbGFzcyggdGhpcy5lcnJvciwgJ3Nob3cnICk7XHJcblx0fVxyXG5cclxuXHQvLyBjbGVhcnMvaGlkZXMgdGhlIGN1cnJlbnQgZXJyb3IgbWVzc2FnZVxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX2NsZWFyRXJyb3IgPSBmdW5jdGlvbigpIHtcclxuXHRcdGNsYXNzaWUucmVtb3ZlQ2xhc3MoIHRoaXMuZXJyb3IsICdzaG93JyApO1xyXG5cdH1cclxuXHJcblx0Ly8gYWRkIHRvIGdsb2JhbCBuYW1lc3BhY2VcclxuXHR3aW5kb3cuc3RlcHNGb3JtID0gc3RlcHNGb3JtO1xyXG5cclxufSkoIHdpbmRvdyApOyIsInZhciB1dGlsaXRpZXM7XHJcbmNsYXNzIFV0aWxpdGllcyB7XHJcbiAgICBwdWJsaWMgY3VycmVudFRpbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmb3JtVG9rZW4odG9rZW46IHN0cmluZykge1xyXG4gICAgICAgIHRva2VuID0gYXRvYih0b2tlbik7XHJcbiAgICAgICAgJCgnZm9ybScpLmFwcGVuZChcIjxpbnB1dCB0eXBlPSdoaWRkZW4nIG5hbWU9J190b2tlbicgdmFsdWU9J1wiICsgdG9rZW4gKyBcIicgLz5cIik7XHJcblxyXG4gICAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbWV0YScpO1xyXG4gICAgICAgIG1ldGEubmFtZSA9ICdfdG9rZW4nO1xyXG4gICAgICAgIG1ldGEuY29udGVudCA9IHRva2VuO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKG1ldGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBSkFYKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBKU09ORGVjb2RlKGpzb246IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLnBhcnNlSlNPTihqc29uKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb3N0QUpBWChwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGRhdGEuX3Rva2VuID0gJCgnbWV0YVtuYW1lPVwiX3Rva2VuXCJdJykuYXR0cignY29udGVudCcpO1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Nyb2xsVG8oZWxlbWVudDogYW55LCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcDogJChlbGVtZW50KS5vZmZzZXQoKS50b3BcclxuICAgICAgICB9LCB0aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGltZUFnbyh0czogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5vd1RzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBub3dUcyAtIHRzO1xyXG4gICAgICAgIGlmKHNlY29uZHMgPiAyICogMjQgKiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImEgZmV3IGRheXMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwieWVzdGVyZGF5XCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiA3MjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyAzNjAwKSArIFwiIGhvdXJzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbiBob3VyIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDEyMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApICsgXCIgbWludXRlcyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+PSA2MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIxIG1pbnV0ZSBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKyBcIiBzZWNvbmRzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgc2Vjb25kIGFnb1wiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcG9zdChwYXRoOiBzdHJpbmcsIHBhcmFtczogYW55LCBtZXRob2Q6IHN0cmluZykge1xyXG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCAncG9zdCc7XHJcbiAgICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XHJcbiAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ21ldGhvZCcsIG1ldGhvZCk7XHJcbiAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ2FjdGlvbicsIHBhdGgpO1xyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xyXG4gICAgICAgICAgICBpZihwYXJhbXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGhpZGRlbkZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgnbmFtZScsIGtleSk7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgcGFyYW1zW2tleV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoaGlkZGVuRmllbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b2tlblZhbCA9ICQoXCJtZXRhW25hbWU9J190b2tlbiddXCIpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICB2YXIgdG9rZW5GaWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaGlkZGVuJyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnX3Rva2VuJyk7XHJcbiAgICAgICAgdG9rZW5GaWVsZC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdG9rZW5WYWwpO1xyXG5cclxuICAgICAgICBmb3JtLmFwcGVuZENoaWxkKHRva2VuRmllbGQpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xyXG4gICAgICAgIGZvcm0uc3VibWl0KCk7XHJcbiAgICB9XHJcbn1cclxudXRpbGl0aWVzID0gbmV3IFV0aWxpdGllcygpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==