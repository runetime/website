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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvYWJvdXQudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NoYXRib3gudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NsYW4udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvZHJvcHNfZGlhbG9nRngudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbWJhdGNhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbnRhY3QudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2ZvcnVtcy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbGl2ZXN0cmVhbS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbWFpbi50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmFtZWNoZWNrZXIudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25ld3MudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25vdGlmaWNhdGlvbnMudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3JhZGlvLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zaWduYXR1cmUudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RlcHNfZm9ybS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkFib3V0IiwiQWJvdXQuY29uc3RydWN0b3IiLCJBYm91dC5zZXRMaXN0ZW4iLCJDYWxjdWxhdG9yIiwiQ2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlWFAiLCJDYWxjdWxhdG9yLmNhbGN1bGF0ZUxldmVsIiwiQ2FsY3VsYXRvci5nZXRJbmZvIiwiQ2FsY3VsYXRvci5sb2FkQ2FsYyIsIkNhbGN1bGF0b3IudXBkYXRlQ2FsYyIsIkNoYXRib3giLCJDaGF0Ym94LmNvbnN0cnVjdG9yIiwiQ2hhdGJveC5hZGRNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZSIsIkNoYXRib3guZGlzcGxheU1lc3NhZ2VzIiwiQ2hhdGJveC5lcnJvciIsIkNoYXRib3guZ2V0U3RhcnQiLCJDaGF0Ym94Lm1vZCIsIkNoYXRib3gubW9kVG9vbHMiLCJDaGF0Ym94LnBhbmVsQ2hhbm5lbHMiLCJDaGF0Ym94LnBhbmVsQ2hhdCIsIkNoYXRib3gucGFuZWxDbG9zZSIsIkNoYXRib3guc3VibWl0TWVzc2FnZSIsIkNoYXRib3guc3dpdGNoQ2hhbm5lbCIsIkNoYXRib3gudXBkYXRlIiwiQ2hhdGJveC51cGRhdGVUaW1lQWdvIiwiQ2xhbiIsIkNsYW4uY29uc3RydWN0b3IiLCJDbGFuLnNldExpc3RlbiIsImV4dGVuZCIsIkRpYWxvZ0Z4IiwiQ29tYmF0Q2FsY3VsYXRvciIsIkNvbWJhdENhbGN1bGF0b3IuY29uc3RydWN0b3IiLCJDb21iYXRDYWxjdWxhdG9yLmdldExldmVscyIsIkNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwiLCJDb21iYXRDYWxjdWxhdG9yLnZhbCIsIkNvbnRhY3QiLCJDb250YWN0LmNvbnN0cnVjdG9yIiwiQ29udGFjdC5kb25lIiwiQ29udGFjdC5lcnJvciIsIkNvbnRhY3Quc2VuZCIsIkNvbnRhY3QudmFsaWRhdGVFbWFpbCIsIkNvbnRhY3Qud2FybmluZyIsIkZvcnVtcyIsIkZvcnVtcy5jb25zdHJ1Y3RvciIsIkZvcnVtcy5kb3dudm90ZSIsIkZvcnVtcy5wb2xsVm90ZSIsIkZvcnVtcy51cHZvdGUiLCJQb3N0IiwiUG9zdC5jb25zdHJ1Y3RvciIsIlBvc3QucXVvdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUuY29uc3RydWN0b3IiLCJGb3J1bXNUaHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXIiLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbiIsIkxpdmVzdHJlYW1SZXNldCIsIkxpdmVzdHJlYW1SZXNldC5jb25zdHJ1Y3RvciIsIkxpdmVzdHJlYW1SZXNldC5yZXNldCIsIkxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c2VzIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24iLCJSdW5lVGltZSIsIlJ1bmVUaW1lLmNvbnN0cnVjdG9yIiwibWVkaWFPYmplY3QiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuc2V0Rm9ybSIsIk5ld3MiLCJOZXdzLmNvbnN0cnVjdG9yIiwiTmV3cy5zZXR1cEFjdGlvbnMiLCJOZXdzLnN1Ym1pdENvbW1lbnQiLCJOZXdzLnRvQ29tbWVudHMiLCJOb3RpZmljYXRpb25zIiwiTm90aWZpY2F0aW9ucy5jb25zdHJ1Y3RvciIsIlJhZGlvIiwiUmFkaW8uY29uc3RydWN0b3IiLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vbmxpbmVTZXR0aW5ncyIsIlJhZGlvLnB1bGxIaWRlIiwiUmFkaW8ucHVsbE9wZW4iLCJSYWRpby5yYWRpb0Nsb3NlIiwiUmFkaW8ucmFkaW9PcGVuIiwiUmFkaW8ucmVxdWVzdE9wZW4iLCJSYWRpby5yZXF1ZXN0U2VuZCIsIlJhZGlvLnVwZGF0ZSIsIlNpZ25hdHVyZSIsIlNpZ25hdHVyZS5jb25zdHJ1Y3RvciIsIlNpZ251cEZvcm0iLCJTaWdudXBGb3JtLmNvbnN0cnVjdG9yIiwiU2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSIsIlNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCIsIlNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSIsIlNpZ251cEZvcm0uc3VibWl0IiwiU2lnbnVwRm9ybS50b2dnbGVGZWVkYmFjayIsIlN0YWZmTGlzdCIsIlN0YWZmTGlzdC5jb25zdHJ1Y3RvciIsInN0ZXBzRm9ybSIsIlV0aWxpdGllcyIsIlV0aWxpdGllcy5jb25zdHJ1Y3RvciIsIlV0aWxpdGllcy5jdXJyZW50VGltZSIsIlV0aWxpdGllcy5mb3JtVG9rZW4iLCJVdGlsaXRpZXMuZ2V0QUpBWCIsIlV0aWxpdGllcy5KU09ORGVjb2RlIiwiVXRpbGl0aWVzLnBvc3RBSkFYIiwiVXRpbGl0aWVzLnNjcm9sbFRvIiwiVXRpbGl0aWVzLnRpbWVBZ28iLCJVdGlsaXRpZXMucG9zdCJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxLQUFLLENBQUM7QUFDVixJQUFNLEtBQUs7SUFDVkEsU0FES0EsS0FBS0E7UUFFVEMsSUFBSUEsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsK0JBQStCQSxDQUFDQSxDQUFDQTtRQUNsRUEsSUFBSUEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsaUNBQWlDQSxDQUFDQSxDQUFDQTtRQUN0RUEsSUFBSUEsTUFBTUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0Esa0NB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VSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDN0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDakMsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDMUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcs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QUFnQkEsT0FBWUEsRUFBRUEsSUFBWUE7UUFDdENPLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBO1lBQ3BCQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQTtTQUNyQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFFTVAsMkJBQU9BLEdBQWRBLFVBQWVBLEVBQVVBO1FBQ3JCUSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxFQUNyQ0EsT0FBT0EsR0FBR0EsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzVCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxZQUFZQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsY0FBY0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLE9BQU9BLEdBQUdBLGNBQWNBLENBQUNBO1FBQ3BDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFTVIsd0JBQUlBLEdBQVhBLFVBQVlBLElBQVlBLEVBQUVBLE1BQVdBLEVBQUVBLE1BQWNBO1FBQ2pEUyxNQUFNQSxHQUFHQSxNQUFNQSxJQUFJQSxNQUFNQSxDQUFDQTtRQUMxQkEsSUFBSUEsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFFBQVFBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3BDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNsQ0EsR0FBR0EsQ0FBQUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEVBQUVBLENBQUFBLENBQUNBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsV0FBV0EsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xEQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtnQkFDM0NBLFdBQVdBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO2dCQUN0Q0EsV0FBV0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBRS9DQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNsQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFDREEsSUFBSUEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4REEsSUFBSUEsVUFBVUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMxQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFFM0NBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBRTdCQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDbEJBLENBQUNBO0lBQ0xULGdCQUFDQTtBQUFEQSxDQTVGQSxBQTRGQ0EsSUFBQTtBQUNELFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYWJvdXQ7XHJcbmNsYXNzIEFib3V0IHtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR2YXIgYWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1hZHNdXCIpO1xyXG5cdFx0dmFyIHJhZGlvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1yYWRpb11cIik7XHJcblx0XHR2YXIgZm9ydW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1mb3J1bXNdXCIpO1xyXG5cdFx0dmFyIGRpc2Nsb3N1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWZ1bGwtZGlzY2xvc3VyZV1cIik7XHJcblx0XHR2YXIgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctb3VyLW1lbWJlcnNdXCIpO1xyXG5cdFx0dmFyIGNvbW11bml0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctY29tbXVuaXR5LW9wZW5uZXNzXVwiKTtcclxuXHJcblx0XHR0aGlzLnNldExpc3RlbihhZHMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4ocmFkaW8pO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oZm9ydW1zKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKGRpc2Nsb3N1cmUpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4obWVtYmVycyk7XHJcblx0XHR0aGlzLnNldExpc3Rlbihjb21tdW5pdHkpO1xyXG5cdFx0Y29uc29sZS5sb2coMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuKGRsZ3RyaWdnZXIpIHtcclxuXHRcdGlmKGRsZ3RyaWdnZXIpIHtcclxuXHRcdFx0dmFyIHNvbWVkaWFsb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkbGd0cmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS1kaWFsb2cnKSk7XHJcblx0XHRcdHZhciBkbGcgPSBuZXcgRGlhbG9nRngoc29tZWRpYWxvZyk7XHJcblx0XHRcdGRsZ3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkbGcudG9nZ2xlLmJpbmQoZGxnKSk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwidmFyIGNhbGN1bGF0b3I7XHJcbmNsYXNzIENhbGN1bGF0b3Ige1xyXG4gICAgY2FsY3VsYXRvcjogYW55O1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgaW5mbzogYW55ID0ge307XHJcbiAgICBVUkw6IGFueSA9IHt9O1xyXG4gICAgaXRlbXM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbGM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRYUDogJyNjYWxjdWxhdG9yLWN1cnJlbnQteHAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJyNjYWxjdWxhdG9yLWRpc3BsYXktbmFtZScsXHJcbiAgICAgICAgICAgIHN1Ym1pdDogJyNjYWxjdWxhdG9yLXN1Ym1pdCcsXHJcbiAgICAgICAgICAgIHRhYmxlOiAnI2NhbGN1bGF0b3ItdGFibGUgdGJvZHknLFxyXG4gICAgICAgICAgICB0YXJnZXRMZXZlbDogJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuVVJMID0ge1xyXG4gICAgICAgICAgICBnZXRDYWxjOiAnL2NhbGN1bGF0b3JzL2xvYWQnLFxyXG4gICAgICAgICAgICBnZXRJbmZvOiAnL2dldC9oaXNjb3JlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pbmZvID0ge1xyXG4gICAgICAgICAgICBsZXZlbEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0OiAwLFxyXG4gICAgICAgICAgICBYUEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIFhQVGFyZ2V0OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0b3IgPSBjYWxjO1xyXG4gICAgICAgICQodGhpcy5lbGVtZW50cy5zdWJtaXQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYWxjdWxhdG9yLmdldEluZm8oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxvYWRDYWxjKCk7XHJcbiAgICAgICAgJCgnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJykua2V5dXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuICAgICAgICAgICAgfSwgMjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHRjYWxjdWxhdGVYUChsZXZlbDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCBsZXZlbDsgaSArPSAxKSB7XHJcblx0XHRcdHRvdGFsICs9IE1hdGguZmxvb3IoaSArIDMwMCAqIE1hdGgucG93KDIsIGkgLyA3LjApKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBNYXRoLmZsb29yKHRvdGFsIC8gNCk7XHJcblx0fVxyXG5cclxuXHRjYWxjdWxhdGVMZXZlbCh4cDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCAxMjA7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKyBNYXRoLnBvdygyLCBpIC8gNykpO1xyXG5cdFx0XHRpZihNYXRoLmZsb29yKHRvdGFsIC8gNCkgPiB4cClcclxuXHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0ZWxzZSBpZihpID49IDk5KVxyXG5cdFx0XHRcdHJldHVybiA5OTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICB2YXIgbmFtZSA9ICQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkudmFsKCk7XHJcblx0XHR2YXIgaW5mbyA9IHV0aWxpdGllcy5nZXRBSkFYKHRoaXMuVVJMLmdldEluZm8gKyAnLycgKyBuYW1lKTtcclxuXHRcdGluZm8uZG9uZShmdW5jdGlvbihpbmZvOiBhbnkpIHtcclxuXHRcdFx0aW5mbyA9ICQucGFyc2VKU09OKGluZm8pO1xyXG5cdFx0XHR2YXIgcmVsZXZhbnQgPSBpbmZvWzEzXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCA9IHJlbGV2YW50WzFdO1xyXG5cdFx0XHRjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50ID0gcmVsZXZhbnRbMl07XHJcblx0XHRcdCQoY2FsY3VsYXRvci5lbGVtZW50cy5jdXJyZW50WFApLnZhbChjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50KTtcclxuXHRcdFx0aWYoJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwoKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFyZ2V0TGV2ZWwpLnZhbChwYXJzZUludChjYWxjdWxhdG9yLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuXHRcdH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDYWxjKCkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge2lkOiB0aGlzLmNhbGN1bGF0b3J9O1xyXG4gICAgICAgIHZhciBpbmZvID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldENhbGMsIGRhdGEpO1xyXG4gICAgICAgIGluZm8uZG9uZShmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgIGluZm8gPSB1dGlsaXRpZXMuSlNPTkRlY29kZShpbmZvKTtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5pdGVtcyA9IGluZm87XHJcbiAgICAgICAgICAgICQuZWFjaChjYWxjdWxhdG9yLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLm5hbWUgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHAgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPiZpbmZpbjs8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjwvdHI+XCI7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ2FsYygpIHtcclxuICAgICAgICB2YXIgbGV2ZWxDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgbGV2ZWxUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICB4cEN1cnJlbnQgPSAwLFxyXG4gICAgICAgICAgICB4cFRhcmdldCA9IDAsXHJcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgPSAwLFxyXG4gICAgICAgICAgICBhbW91bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuaW5mby5sZXZlbFRhcmdldCA9IHBhcnNlSW50KCQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLnZhbCgpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmluZm8ubGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgIHRoaXMuaW5mby5YUFRhcmdldCA9IHRoaXMuY2FsY3VsYXRlWFAodGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICBpZih0aGlzLmluZm8uWFBDdXJyZW50ID4gdGhpcy5pbmZvLlhQVGFyZ2V0KVxyXG4gICAgICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHBhcnNlSW50KHRoaXMuaW5mby5sZXZlbEN1cnJlbnQsIDEwKSArIDEpO1xyXG4gICAgICAgIGxldmVsQ3VycmVudCA9IHRoaXMuaW5mby5sZXZlbEN1cnJlbnQ7XHJcbiAgICAgICAgbGV2ZWxUYXJnZXQgPSB0aGlzLmluZm8ubGV2ZWxUYXJnZXQ7XHJcbiAgICAgICAgeHBDdXJyZW50ID0gdGhpcy5pbmZvLlhQQ3VycmVudDtcclxuICAgICAgICB4cFRhcmdldCA9IHRoaXMuaW5mby5YUFRhcmdldDtcclxuICAgICAgICBkaWZmZXJlbmNlID0geHBUYXJnZXQgLSB4cEN1cnJlbnQ7XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgYW1vdW50ID0gTWF0aC5jZWlsKGRpZmZlcmVuY2UgLyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS54cCk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGFtb3VudCA8IDAgPyAwIDogYW1vdW50O1xyXG4gICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKSB0ZDpudGgtY2hpbGQoNCknKS5odG1sKGFtb3VudCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbEN1cnJlbnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbFRhcmdldCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG5cXG5cXG5cXG5cIik7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPD0gbGV2ZWxDdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtc3VjY2VzcycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPiBsZXZlbEN1cnJlbnQgJiYgbGV2ZWxUYXJnZXQgPj0gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC13YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtZGFuZ2VyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciBjaGF0Ym94O1xyXG5jbGFzcyBDaGF0Ym94IHtcclxuXHRjaGFubmVsOiBzdHJpbmcgPSAnI3JhZGlvJztcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bGFzdElkOiBudW1iZXIgPSAwO1xyXG5cdG1lc3NhZ2VzOiBhbnkgPSBbXTtcclxuXHRtb2RlcmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwaW5uZWQ6IGFueSA9IFtdO1xyXG5cdHRpbWVzOiBhbnkgPSB7fTtcclxuXHR0aW1lb3V0UGlubmVkOiBhbnkgPSBudWxsO1xyXG5cdHRpbWVvdXRVcGRhdGU6IGFueSA9IG51bGw7XHJcblx0VVJMOiBhbnkgPSB7fTtcclxuXHJcblx0cGlubmVkRGlzcGxheWVkOiBhbnkgPSBbXTtcclxuXHJcblx0Y29uc3RydWN0b3IocHVibGljIGNoYW5uZWw6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jaGFubmVsID0gY2hhbm5lbDtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGFjdGlvbnM6ICcjY2hhdGJveC1hY3Rpb25zJyxcclxuXHRcdFx0Y2hhbm5lbHM6ICcjY2hhdGJveC1jaGFubmVscycsXHJcblx0XHRcdGNoYXRib3g6ICcjY2hhdGJveCcsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY2hhdGJveC1tZXNzYWdlJyxcclxuXHRcdFx0bWVzc2FnZXM6ICcjY2hhdGJveC1tZXNzYWdlcydcclxuXHRcdH07XHJcblx0XHR0aGlzLlVSTCA9IHtcclxuXHRcdFx0Z2V0U3RhcnQ6ICcvY2hhdC9zdGFydCcsXHJcblx0XHRcdGdldFVwZGF0ZTogJy9jaGF0L3VwZGF0ZScsXHJcblx0XHRcdHBvc3RNZXNzYWdlOiAnL2NoYXQvcG9zdC9tZXNzYWdlJyxcclxuXHRcdFx0cG9zdFN0YXR1c0NoYW5nZTogJy9jaGF0L3Bvc3Qvc3RhdHVzL2NoYW5nZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnRpbWVzID0ge1xyXG5cdFx0XHRsYXN0QWN0aXZpdHk6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsYXN0UmVmcmVzaDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCksXHJcblx0XHRcdGxvYWRlZEF0OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKVxyXG5cdFx0fTtcclxuXHRcdHZhciBtb2RlcmF0b3IgPSB1dGlsaXRpZXMuZ2V0QUpBWCgnL2NoYXQvbW9kZXJhdG9yJyk7XHJcblx0XHRtb2RlcmF0b3IuZG9uZShmdW5jdGlvbihtb2RlcmF0b3I6IHN0cmluZykge1xyXG5cdFx0XHRtb2RlcmF0b3IgPSAkLnBhcnNlSlNPTihtb2RlcmF0b3IpO1xyXG5cdFx0XHRjaGF0Ym94Lm1vZGVyYXRvciA9IG1vZGVyYXRvci5tb2QgPT09IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucGFuZWxDaGF0KCk7XHJcblx0XHR0aGlzLmdldFN0YXJ0KCk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0aWYoZS53aGljaCA9PT0gMTMpXHJcblx0XHRcdFx0Y2hhdGJveC5zdWJtaXRNZXNzYWdlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGFubmVscykuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gucGFuZWxDaGFubmVscygpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdH0sIDUwMDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWRkTWVzc2FnZShtZXNzYWdlOiBhbnkpIHtcclxuXHRcdGlmKHRoaXMubGFzdElkIDwgbWVzc2FnZS5pZCkge1xyXG5cdFx0XHR0aGlzLmxhc3RJZCA9IG1lc3NhZ2UuaWQ7XHJcblx0XHR9XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA8PSAxKSB7XHJcblx0XHRcdHRoaXMubWVzc2FnZXNbdGhpcy5tZXNzYWdlcy5sZW5ndGhdID0gbWVzc2FnZTtcclxuXHRcdFx0dGhpcy50aW1lcy5sYXN0QWN0aXZpdHkgPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKSB7XHJcblx0XHRpZighbWVzc2FnZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRpZiAobWVzc2FnZS5zdGF0dXMgPT09IDEpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1oaWRkZW4nPlwiO1xyXG5cdFx0fSBlbHNlIGlmKG1lc3NhZ2Uuc3RhdHVzID09PSAyKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctcGlubmVkJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMykge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbmhpZCc+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cnPlwiO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjx0aW1lIGNsYXNzPSdwdWxsLXJpZ2h0JyBkYXRhLXRzPSdcIiArIG1lc3NhZ2UuY3JlYXRlZF9hdCArIFwiJz5cIjtcclxuXHRcdGh0bWwgKz0gdXRpbGl0aWVzLnRpbWVBZ28obWVzc2FnZS5jcmVhdGVkX2F0KTtcclxuXHRcdGh0bWwgKz0gXCI8L3RpbWU+XCI7XHJcblx0XHRodG1sICs9IFwiPHA+XCI7XHJcblx0XHRpZihjaGF0Ym94Lm1vZGVyYXRvciA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRodG1sICs9IENoYXRib3gubW9kVG9vbHMobWVzc2FnZSk7XHJcblx0XHR9XHJcblx0XHRodG1sICs9IFwiPGEgY2xhc3M9J21lbWJlcnMtXCIgKyBtZXNzYWdlLmNsYXNzX25hbWUgKyBcIic+XCIgKyBtZXNzYWdlLmF1dGhvcl9uYW1lICsgXCI8L2E+OiBcIiArIG1lc3NhZ2UuY29udGVudHNfcGFyc2VkO1xyXG5cdFx0aHRtbCArPSBcIjwvcD5cIjtcclxuXHRcdGh0bWwgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykucHJlcGVuZChodG1sKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZXMoKSB7XHJcblx0XHR2YXIgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdCQuZWFjaChtZXNzYWdlcywgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdH0pO1xyXG5cdFx0JC5lYWNoKHRoaXMucGlubmVkLCBmdW5jdGlvbihpbmRleCwgbWVzc2FnZSkge1xyXG5cdFx0XHRpZihjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkW21lc3NhZ2UuaWRdID0gdHJ1ZTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkID0gW107XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0U3RhcnQoKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoJycpO1xyXG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdHRpbWU6IHRoaXMudGltZXMubG9hZGVkQXQsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdjaGF0L3N0YXJ0JywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLm1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNoYXRib3gucGlubmVkID0gcmVzdWx0cy5waW5uZWQ7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2VzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtb2QoaWQ6IGFueSwgbmV3U3RhdHVzOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRpZDogaWQsXHJcblx0XHRcdHN0YXR1czogbmV3U3RhdHVzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L3N0YXR1cy1jaGFuZ2UnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmdldFN0YXJ0KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2hhdGJveC5lcnJvcihcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwZXJmb3JtaW5nIHRoYXQgbW9kZXJhdGlvbiBjaGFuZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBtb2RUb29scyhtZXNzYWdlKSB7XHJcblx0XHR2YXIgcmVzID0gXCJcIjtcclxuXHRcdHJlcyArPSBcIjx1bCBjbGFzcz0nbGlzdC1pbmxpbmUgaW5saW5lJz5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzICUgMiA9PT0gMCkge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAxKSArIFwiKTsnIHRpdGxlPSdIaWRlIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1taW51cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMSkgKyBcIik7JyB0aXRsZT0nU2hvdyBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtcGx1cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fVxyXG5cdFx0cmVzICs9IFwiPC9saT5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzID49IDIpIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMikgKyBcIik7JyB0aXRsZT0nVW5waW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS1kb3duIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyArIDIpICsgXCIpOycgdGl0bGU9J1BpbiBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtYXJyb3ctY2lyY2xlLXVwIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8L3VsPlwiO1xyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYW5uZWxzKCkge1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L2NoYW5uZWxzJyk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtcG9wdXAtY2hhbm5lbHMnPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nY2xvc2UnIG9uY2xpY2s9J2NoYXRib3gucGFuZWxjbG9zZSgpOyc+Q2xvc2UgPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9J3NyLW9ubHknPkNsb3NlPC9zcGFuPjwvYnV0dG9uPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxoMz5DaGFubmVsczwvaDM+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPHAgY2xhc3M9J2hvbG8tdGV4dCc+Q3VycmVudGx5IG9uIDxiPiNcIiArIGNoYXRib3guY2hhbm5lbCArIFwiPC9iPjwvcD5cIjtcclxuXHRcdFx0JC5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8YSBvbmNsaWNrPVxcXCJjaGF0Ym94LnN3aXRjaENoYW5uZWwoJ1wiICsgdmFsdWUubmFtZSArIFwiJyk7XFxcIj4jXCIgKyB2YWx1ZS5uYW1lICsgXCI8L2E+PGJyIC8+XCI7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8c3BhbiBjbGFzcz0naG9sby10ZXh0LXNlY29uZGFyeSc+XCIgKyB2YWx1ZS5tZXNzYWdlcyArIFwiIG1lc3NhZ2VzPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPkxhc3QgYWN0aXZlIFwiICsgdXRpbGl0aWVzLnRpbWVBZ28odmFsdWUubGFzdF9tZXNzYWdlKSArIFwiPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2hhdCgpIHtcclxuXHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtbWVzc2FnZXMnPjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LWFjdGlvbnMnPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBocmVmPScvdHJhbnNwYXJlbmN5L21hcmtkb3duJyB0YXJnZXQ9J19ibGFuaycgaWQ9J2NoYXRib3gtbWFya2Rvd24nPk1hcmtkb3duPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBpZD0nY2hhdGJveC1jaGFubmVscyc+Q2hhbm5lbHM8L2E+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J2NoYXRib3gtbWVzc2FnZScgLz5cIjtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGF0Ym94KS5odG1sKGNvbnRlbnRzKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENsb3NlKCkge1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdE1lc3NhZ2UoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0bWVzc2FnZSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHRyZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5wb3N0TWVzc2FnZSwgbWVzc2FnZSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHRpZihyZXNwb25zZS5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnJyk7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLXNlbnQnKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0fSwgMTUwMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzcG9uc2UuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3UgYXJlIG5vdCBsb2dnZWQgaW4gYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuZXJyb3IgPT09IC0yKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3Ugd2VyZSBtdXRlZCBmb3Igb25lIGhvdXIgYnkgYSBzdGFmZiBtZW1iZXIgYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3IuICBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0fSwgMjUwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN3aXRjaENoYW5uZWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgZGF0YSxcclxuXHRcdFx0cmVzcG9uc2U7XHJcblx0XHRkYXRhID0ge1xyXG5cdFx0XHRjaGFubmVsOiBuYW1lXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L2NoYW5uZWxzL2NoZWNrJywgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRpZihyZXNwb25zZS52YWxpZCkge1xyXG5cdFx0XHRcdGNoYXRib3guY2hhbm5lbCA9IG5hbWU7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IHRoaXMubGFzdElkLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwuZ2V0VXBkYXRlLCBkYXRhKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNoYXRib3gudGltZXMubGFzdFJlZnJlc2ggPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNsZWFyVGltZW91dChjaGF0Ym94LnRpbWVvdXRVcGRhdGUpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVvdXRVcGRhdGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAxMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGVUaW1lQWdvKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5maW5kKCcubXNnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0dmFyIHRpbWVzdGFtcCA9ICQodmFsdWUpLmZpbmQoJ3RpbWUnKS5hdHRyKCdkYXRhLXRzJyk7XHJcblx0XHRcdCQodmFsdWUpLmZpbmQoJ3RpbWUnKS5odG1sKHV0aWxpdGllcy50aW1lQWdvKHRpbWVzdGFtcCkpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGVUaW1lQWdvKCk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcbn0iLCJ2YXIgY2xhbjtcclxuY2xhc3MgQ2xhbiB7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dmFyIHdhcm5pbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy13YXJuaW5nc11cIik7XHJcblx0XHR2YXIgdGVtcEJhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLXRlbXBvcmFyeS1iYW5zXVwiKTtcclxuXHRcdHZhciBiYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1iYW5zXVwiKTtcclxuXHJcblx0XHR0aGlzLnNldExpc3Rlbih3YXJuaW5ncyk7XHJcblx0XHR0aGlzLnNldExpc3Rlbih0ZW1wQmFucyk7XHJcblx0XHR0aGlzLnNldExpc3RlbihiYW5zKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW4oZGxndHJpZ2dlcikge1xyXG5cdFx0aWYoZGxndHJpZ2dlcikge1xyXG5cdFx0XHR2YXIgc29tZWRpYWxvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRsZ3RyaWdnZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWRpYWxvZycpKTtcclxuXHRcdFx0dmFyIGRsZyA9IG5ldyBEaWFsb2dGeChzb21lZGlhbG9nKTtcclxuXHRcdFx0ZGxndHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRsZy50b2dnbGUuYmluZChkbGcpKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCIvKipcclxuICogZGlhbG9nRnguanMgdjEuMC4wXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxNCwgQ29kcm9wc1xyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqL1xyXG47KCBmdW5jdGlvbiggd2luZG93ICkge1xyXG5cclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciBzdXBwb3J0ID0geyBhbmltYXRpb25zIDogTW9kZXJuaXpyLmNzc2FuaW1hdGlvbnMgfSxcclxuXHRcdGFuaW1FbmRFdmVudE5hbWVzID0geyAnV2Via2l0QW5pbWF0aW9uJyA6ICd3ZWJraXRBbmltYXRpb25FbmQnLCAnT0FuaW1hdGlvbicgOiAnb0FuaW1hdGlvbkVuZCcsICdtc0FuaW1hdGlvbicgOiAnTVNBbmltYXRpb25FbmQnLCAnYW5pbWF0aW9uJyA6ICdhbmltYXRpb25lbmQnIH0sXHJcblx0XHRhbmltRW5kRXZlbnROYW1lID0gYW5pbUVuZEV2ZW50TmFtZXNbIE1vZGVybml6ci5wcmVmaXhlZCggJ2FuaW1hdGlvbicgKSBdLFxyXG5cdFx0b25FbmRBbmltYXRpb24gPSBmdW5jdGlvbiggZWwsIGNhbGxiYWNrICkge1xyXG5cdFx0XHR2YXIgb25FbmRDYWxsYmFja0ZuID0gZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHRcdGlmKCBzdXBwb3J0LmFuaW1hdGlvbnMgKSB7XHJcblx0XHRcdFx0XHRpZiggZXYudGFyZ2V0ICE9IHRoaXMgKSByZXR1cm47XHJcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGFuaW1FbmRFdmVudE5hbWUsIG9uRW5kQ2FsbGJhY2tGbiApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiggY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nICkgeyBjYWxsYmFjay5jYWxsKCk7IH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYoIHN1cHBvcnQuYW5pbWF0aW9ucyApIHtcclxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKCBhbmltRW5kRXZlbnROYW1lLCBvbkVuZENhbGxiYWNrRm4gKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRvbkVuZENhbGxiYWNrRm4oKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0ZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xyXG5cdFx0Zm9yKCB2YXIga2V5IGluIGIgKSB7XHJcblx0XHRcdGlmKCBiLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuXHRcdFx0XHRhW2tleV0gPSBiW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gRGlhbG9nRngoIGVsLCBvcHRpb25zICkge1xyXG5cdFx0dGhpcy5lbCA9IGVsO1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XHJcblx0XHRleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xyXG5cdFx0dGhpcy5jdHJsQ2xvc2UgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdbZGF0YS1kaWFsb2ctY2xvc2VdJyApO1xyXG5cdFx0dGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHRcdHRoaXMuX2luaXRFdmVudHMoKTtcclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS5vcHRpb25zID0ge1xyXG5cdFx0Ly8gY2FsbGJhY2tzXHJcblx0XHRvbk9wZW5EaWFsb2cgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9LFxyXG5cdFx0b25DbG9zZURpYWxvZyA6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNsb3NlIGFjdGlvblxyXG5cdFx0dGhpcy5jdHJsQ2xvc2UuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy50b2dnbGUuYmluZCh0aGlzKSApO1xyXG5cclxuXHRcdC8vIGVzYyBrZXkgY2xvc2VzIGRpYWxvZ1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdFx0aWYoIGtleUNvZGUgPT09IDI3ICYmIHNlbGYuaXNPcGVuICkge1xyXG5cdFx0XHRcdHNlbGYudG9nZ2xlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICcuZGlhbG9nX19vdmVybGF5JyApLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykgKTtcclxuXHR9XHJcblxyXG5cdERpYWxvZ0Z4LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdGlmKCB0aGlzLmlzT3BlbiApIHtcclxuXHRcdFx0Y2xhc3NpZS5yZW1vdmUoIHRoaXMuZWwsICdkaWFsb2ctLW9wZW4nICk7XHJcblx0XHRcdGNsYXNzaWUuYWRkKCBzZWxmLmVsLCAnZGlhbG9nLS1jbG9zZScgKTtcclxuXHJcblx0XHRcdG9uRW5kQW5pbWF0aW9uKCB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICcuZGlhbG9nX19jb250ZW50JyApLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZSggc2VsZi5lbCwgJ2RpYWxvZy0tY2xvc2UnICk7XHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHRcdC8vIGNhbGxiYWNrIG9uIGNsb3NlXHJcblx0XHRcdHRoaXMub3B0aW9ucy5vbkNsb3NlRGlhbG9nKCB0aGlzICk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y2xhc3NpZS5hZGQoIHRoaXMuZWwsICdkaWFsb2ctLW9wZW4nICk7XHJcblxyXG5cdFx0XHQvLyBjYWxsYmFjayBvbiBvcGVuXHJcblx0XHRcdHRoaXMub3B0aW9ucy5vbk9wZW5EaWFsb2coIHRoaXMgKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaXNPcGVuID0gIXRoaXMuaXNPcGVuO1xyXG5cdH07XHJcblxyXG5cdC8vIGFkZCB0byBnbG9iYWwgbmFtZXNwYWNlXHJcblx0d2luZG93LkRpYWxvZ0Z4ID0gRGlhbG9nRng7XHJcblxyXG59KSggd2luZG93ICk7IiwidmFyIGNvbWJhdENhbGN1bGF0b3I7XHJcbmNsYXNzIENvbWJhdENhbGN1bGF0b3Ige1xyXG5cdGNsaWNrczogYW55ID0ge307XHJcblx0Z2VuZXJhdGU6IGFueSA9IHt9O1xyXG5cdGlucHV0czogYW55ID0ge307XHJcblx0b3RoZXI6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuY2xpY2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmdlbmVyYXRlID0ge1xyXG5cdFx0XHRsZXZlbDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bGV2ZWwnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5pbnB1dHMgPSB7XHJcblx0XHRcdGF0dGFjazogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6YXR0YWNrJ11cIixcclxuXHRcdFx0ZGVmZW5jZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6ZGVmZW5jZSddXCIsXHJcblx0XHRcdHN0cmVuZ3RoOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdHJlbmd0aCddXCIsXHJcblx0XHRcdGNvbnN0aXR1dGlvbjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6Y29uc3RpdHV0aW9uJ11cIixcclxuXHRcdFx0cmFuZ2VkOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpyYW5nZWQnXVwiLFxyXG5cdFx0XHRwcmF5ZXI6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnByYXllciddXCIsXHJcblx0XHRcdG1hZ2ljOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjptYWdpYyddXCIsXHJcblx0XHRcdHN1bW1vbmluZzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VtbW9uaW5nJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMub3RoZXIgPSB7XHJcblx0XHRcdG5hbWU6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm5hbWUnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0bG9hZENvbWJhdDogJy9jYWxjdWxhdG9ycy9jb21iYXQvbG9hZCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaW5wdXRzLmF0dGFjaykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuZGVmZW5jZSkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3RyZW5ndGgpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmNvbnN0aXR1dGlvbikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucmFuZ2VkKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5wcmF5ZXIpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLm1hZ2ljKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdW1tb25pbmcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuY2xpY2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Z2V0TGV2ZWxzKCkge1xyXG5cdFx0dmFyIG5hbWUgPSAkKHRoaXMub3RoZXIubmFtZSkudmFsKCksXHJcblx0XHRcdGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH0sXHJcblx0XHRcdGxldmVscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmxvYWRDb21iYXQsIGRhdGEpO1xyXG5cdFx0bGV2ZWxzLmRvbmUoZnVuY3Rpb24obGV2ZWxzKSB7XHJcblx0XHRcdGxldmVscyA9ICQucGFyc2VKU09OKGxldmVscyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuYXR0YWNrKS52YWwobGV2ZWxzLmF0dGFjayk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuZGVmZW5jZSkudmFsKGxldmVscy5kZWZlbmNlKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdHJlbmd0aCkudmFsKGxldmVscy5zdHJlbmd0aCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuY29uc3RpdHV0aW9uKS52YWwobGV2ZWxzLmNvbnN0aXR1dGlvbik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucmFuZ2VkKS52YWwobGV2ZWxzLnJhbmdlZCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucHJheWVyKS52YWwobGV2ZWxzLnByYXllcik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMubWFnaWMpLnZhbChsZXZlbHMubWFnaWMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN1bW1vbmluZykudmFsKGxldmVscy5zdW1tb25pbmcpO1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dXBkYXRlTGV2ZWwoKSB7XHJcblx0XHR2YXIgbWVsZWUgPSB0aGlzLnZhbCgnYXR0YWNrJykgKyB0aGlzLnZhbCgnc3RyZW5ndGgnKTtcclxuXHRcdHZhciBtYWdpYyA9IDIgKiB0aGlzLnZhbCgnbWFnaWMnKTtcclxuXHRcdHZhciByYW5nZWQgPSAyICogdGhpcy52YWwoJ3JhbmdlZCcpO1xyXG5cdFx0dmFyIGRlZiA9IHRoaXMudmFsKCdkZWZlbmNlJykgKyB0aGlzLnZhbCgnY29uc3RpdHV0aW9uJyk7XHJcblx0XHR2YXIgb3RoZXIgPSAoLjUgKiB0aGlzLnZhbCgncHJheWVyJykpICsgKC41ICogdGhpcy52YWwoJ3N1bW1vbmluZycpKTtcclxuXHRcdHZhciBsZXZlbCA9ICgxMy8xMCkgKiBNYXRoLm1heChtZWxlZSwgbWFnaWMsIHJhbmdlZCkgKyBkZWYgKyBvdGhlcjtcclxuXHRcdGxldmVsICo9IC4yNTtcclxuXHRcdGxldmVsID0gTWF0aC5mbG9vcihsZXZlbCk7XHJcblx0XHQkKHRoaXMuZ2VuZXJhdGUubGV2ZWwpLmh0bWwobGV2ZWwpO1xyXG5cdH1cclxuXHR2YWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQoJChcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpcIiArIG5hbWUgKyBcIiddXCIpLnZhbCgpKTtcclxuXHR9XHJcbn0iLCJ2YXIgY29udGFjdDtcclxuY2xhc3MgQ29udGFjdCB7XHJcblx0ZGF0YTogYW55ID0ge307XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5kYXRhID0ge1xyXG5cdFx0XHRzZW50OiBmYWxzZVxyXG5cdFx0fTtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGVtYWlsOiAnI2NvbnRhY3QtZW1haWwnLFxyXG5cdFx0XHRlcnJvcjogJyNjb250YWN0LWVycm9yJyxcclxuXHRcdFx0bWVzc2FnZTogJyNjb250YWN0LW1lc3NhZ2UnLFxyXG5cdFx0XHR1c2VybmFtZTogJyNjb250YWN0LXVzZXJuYW1lJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHN1Ym1pdDogXCJbcnQtaG9vaz0nY29udGFjdDpzdWJtaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Zm9ybTogJy9jb250YWN0L3N1Ym1pdCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaG9va3Muc3VibWl0KS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29udGFjdC5zZW5kKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb25lKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC1zdWNjZXNzXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC1kYW5nZXJcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2VuZCgpIHtcclxuXHRcdGlmKHRoaXMuZGF0YS5zZW50ID09PSB0cnVlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmRvbmUoXCJZb3UgaGF2ZSBhbHJlYWR5IHNlbnQgeW91ciBtZXNzYWdlIVwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZW1haWwgPSAkKHRoaXMuZWxlbWVudHMuZW1haWwpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHR1c2VybmFtZSA9ICQodGhpcy5lbGVtZW50cy51c2VybmFtZSkudmFsKCk7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgZW1haWxcclxuXHRcdGlmKHRoaXMudmFsaWRhdGVFbWFpbChlbWFpbCkgPT09IGZhbHNlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVycm9yKFwiVGhhdCBpcyBub3QgYSB2YWxpZGF0ZSBlbWFpbCBhZGRyZXNzLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0Y29udGVudHM6IG1lc3NhZ2UsXHJcblx0XHRcdGVtYWlsOiBlbWFpbCxcclxuXHRcdFx0dXNlcm5hbWU6IHVzZXJuYW1lXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5mb3JtLCBkYXRhKTtcclxuXHRcdHRoaXMud2FybmluZyhcIlNlbmRpbmcgbWVzc2FnZS4uLlwiKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjb250YWN0LmRhdGEuc2VudCA9IHRydWU7XHJcblx0XHRcdFx0Y29udGFjdC5kb25lKFwiWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQuXCIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnRhY3QuZXJyb3IoXCJUaGVyZSB3YXMgYW4gdW5rbm93biBlcnJvciB3aGlsZSBzZW5kaW5nIHlvdXIgbWVzc2FnZS5cIik7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsaWRhdGVFbWFpbChlbWFpbDogYW55KSB7XHJcblx0XHR2YXIgcmUgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcclxuXHRcdHJldHVybiByZS50ZXN0KGVtYWlsKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB3YXJuaW5nKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVycm9yKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKFwidGV4dC13YXJuaW5nXCIpO1xyXG5cdH1cclxufSIsInZhciBmb3J1bXM7XHJcbmNsYXNzIEZvcnVtcyB7XHJcblx0cHVibGljIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIHBvc3Q6IFBvc3QgPSBudWxsO1xyXG5cdHB1YmxpYyB0aHJlYWRDcmVhdGU6IEZvcnVtc1RocmVhZENyZWF0ZSA9IG51bGw7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0J3Bvc3RFZGl0b3InOiBcIltydC1kYXRhPSdwb3N0LmVkaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0cG9sbDoge1xyXG5cdFx0XHRcdHZvdGU6IFwiW3J0LWhvb2s9J2ZvcnVtOnBvbGwudm90ZSddXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHBvbGw6IHtcclxuXHRcdFx0XHR2b3RlOiAnL2ZvcnVtcy9wb2xsL3ZvdGUnXHJcblx0XHRcdH0sXHJcblx0XHRcdHZvdGU6IGZ1bmN0aW9uKGlkOiBudW1iZXIpIHsgcmV0dXJuICcvZm9ydW1zL3Bvc3QvJyArIGlkICsgJy92b3RlJzsgfVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucG9zdCA9IG5ldyBQb3N0KCk7XHJcblx0XHQkKCcudXB2b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy51cHZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnLmRvd252b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy5kb3dudm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQucG9zdDpxdW90ZSddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZS50YXJnZXQpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0Zm9ydW1zLnBvc3QucXVvdGUoaWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaG9va3MucG9sbC52b3RlKS5jbGljayhmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSAkKGUudGFyZ2V0KS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdFx0Zm9ydW1zLnBvbGxWb3RlKGRhdGEucXVlc3Rpb24sIGRhdGEuYW5zd2VyKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRvd252b3RlKHBvc3RJZDogYW55KSB7XHJcblx0XHRwb3N0SWQgPSBwb3N0SWQucmVwbGFjZShcInBvc3RcIiwgXCJcIik7XHJcblx0XHR2YXIgcG9zdCA9ICQoJyNwb3N0JyArIHBvc3RJZCksXHJcblx0XHRcdGlzVXB2b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKSxcclxuXHRcdFx0aXNEb3dudm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzRG93bnZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0JChwb3N0KS5hZGRDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc1Vwdm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQndm90ZSc6ICdkb3duJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB2b3RlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMudm90ZShwb3N0SWQpLCBkYXRhKTtcclxuXHRcdHZvdGUuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBvbGxWb3RlKHF1ZXN0aW9uSWQ6IG51bWJlciwgYW5zd2VySWQ6IG51bWJlcikge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGFuc3dlcjogYW5zd2VySWQsXHJcblx0XHRcdHF1ZXN0aW9uOiBxdWVzdGlvbklkXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5wb2xsLnZvdGUsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzdWx0cy5lcnJvciA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdC8vIFRoZSB1c2VyIHdhcyBub3QgbG9nZ2VkIGluXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIFVua25vd24gZXJyb3JcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8gVE9ETzogTWFrZSBhbiBlcnJvciBkaXZcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXB2b3RlKHBvc3RJZDogYW55KSB7XHJcblx0XHRwb3N0SWQgPSBwb3N0SWQucmVwbGFjZShcInBvc3RcIiwgXCJcIik7XHJcblx0XHR2YXIgcG9zdCA9ICQoJyNwb3N0JyArIHBvc3RJZCksXHJcblx0XHRcdGlzVXB2b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKSxcclxuXHRcdFx0aXNEb3dudm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAndXAnXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbmNsYXNzIFBvc3Qge1xyXG5cdHB1YmxpYyBxdW90ZShpZDogYW55KSB7XHJcblx0XHR2YXIgc291cmNlID0gJChcIltydC1kYXRhPSdwb3N0I1wiICsgaWQgK1wiOnNvdXJjZSddXCIpLmh0bWwoKSxcclxuXHRcdFx0cG9zdENvbnRlbnRzID0gJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKCk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXFxuL2csICdcXG4+Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmx0Oy9nLCAnPCcpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZndDsvZywgJz4nKTtcclxuXHRcdHNvdXJjZSA9IFwiPlwiICsgc291cmNlO1xyXG5cdFx0aWYocG9zdENvbnRlbnRzLmxlbmd0aCA+IDApXHJcblx0XHRcdHBvc3RDb250ZW50cyArPSBcIlxcblwiO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKHBvc3RDb250ZW50cyArIHNvdXJjZSArIFwiXFxuXCIpO1xyXG5cdFx0dXRpbGl0aWVzLnNjcm9sbFRvKCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLCAxMDAwKTtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLmZvY3VzKCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBGb3J1bXNUaHJlYWRDcmVhdGUge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIHF1ZXN0aW9uczogQXJyYXkgPSBbXTtcclxuXHRwdWJsaWMgdmFsdWVzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgdmlld3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHF1ZXN0aW9uQWRkOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uLmFkZCddXCIsXHJcblx0XHRcdHF1ZXN0aW9uczogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbnMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMgPSBBcnJheSg1MDApO1xyXG5cdFx0dGhpcy52YWx1ZXMgPSB7XHJcblx0XHRcdHF1ZXN0aW9uczogMFxyXG5cdFx0fTtcclxuXHRcdHRoaXMudmlld3MgPSB7XHJcblx0XHRcdGFuc3dlcjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLmFuc3dlciddXCIpLmh0bWwoKSxcclxuXHRcdFx0cXVlc3Rpb246ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbiddXCIpLmh0bWwoKVxyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbkFkZCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5hZGRRdWVzdGlvbigpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHB1YmxpYyBhZGRRdWVzdGlvbigpIHtcclxuXHRcdHZhciBodG1sID0gdGhpcy52aWV3cy5xdWVzdGlvbjtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbnMpLmFwcGVuZChodG1sKTtcclxuXHRcdHRoaXMudmFsdWVzLnF1ZXN0aW9ucyArPSAxO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlbW92ZVF1ZXN0aW9uKG51bWJlcjogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnF1ZXN0aW9ucy5zcGxpY2UobnVtYmVyLCAxKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW5lcihlbGVtZW50LCB0eXBlKSB7XHJcblx0XHRpZih0eXBlID09PSBcInJlbW92ZSBxdWVzdGlvblwiKSB7XHJcblx0XHRcdHRoaXMuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50OiBhbnkpIHtcclxuXHRcdCQoZWxlbWVudCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbigkKGVsZW1lbnQpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ3J0LWRhdGEnKSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0Zm9ydW1zID0gbmV3IEZvcnVtcygpO1xyXG59KTsiLCJjbGFzcyBMaXZlc3RyZWFtUmVzZXQge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIGxhbmc6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0bm90ZTogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpub3RlJ11cIixcclxuXHRcdFx0c3Bpbm5lcjogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzcGlubmVyJ11cIixcclxuXHRcdFx0c3RhdHVzOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnN0YXR1cyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmxhbmcgPSB7XHJcblx0XHRcdGNoZWNraW5nOiAnY2hlY2tpbmcnLFxyXG5cdFx0XHRvZmZsaW5lOiAnb2ZmbGluZScsXHJcblx0XHRcdG9ubGluZTogJ29ubGluZScsXHJcblx0XHRcdHVua25vd246ICd1bmtub3duJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHJlc2V0OiAnL2xpdmVzdHJlYW0vcmVzZXQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5yZXNldCgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZXNldCgpIHtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMX0pO1xyXG5cdFx0dmFyIHN0YXR1cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnJlc2V0LCB7fSk7XHJcblx0XHRzdGF0dXMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9IHV0aWxpdGllcy5KU09ORGVjb2RlKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLm9ubGluZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIGlmKHJlc3VsdHMub25saW5lID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPZmZsaW5lKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3Bpbm5lclJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDB9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzcGlubmVyUmVtb3ZlKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnNwaW5uZXIpLmNzcyh7XHJcblx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c2VzKGNoZWNraW5nOiBzdHJpbmcsIG9ubGluZTogc3RyaW5nLCBvZmZsaW5lOiBzdHJpbmcsIHVua25vd246IHN0cmluZykge1xyXG5cdFx0dGhpcy5sYW5nLmNoZWNraW5nID0gY2hlY2tpbmc7XHJcblx0XHR0aGlzLmxhbmcub2ZmbGluZSA9IG9mZmxpbmU7XHJcblx0XHR0aGlzLmxhbmcub25saW5lID0gb25saW5lO1xyXG5cdFx0dGhpcy5sYW5nLnVua25vd24gPSB1bmtub3duO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09mZmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib2ZmbGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT25saW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9ubGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c1Vua25vd24oKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwidW5rbm93blwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtd2FybmluZycpO1xyXG5cdH1cclxufSIsInZhciBydW5ldGltZTtcclxuY2xhc3MgUnVuZVRpbWUge1xyXG5cdGxvYWRpbmc6c3RyaW5nID0gJyNsb2FkaW5nJztcclxufVxyXG5ydW5ldGltZSA9IG5ldyBSdW5lVGltZSgpO1xyXG4kKGZ1bmN0aW9uICgpIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHQkKCdbZGF0YS10b2dnbGVdJykudG9vbHRpcCgpO1xyXG5cdCQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigpO1xyXG5cdCQoJ3Rib2R5LnJvd2xpbmsnKS5yb3dsaW5rKCk7XHJcblx0JCgnI3RvcCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdCQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuXHRcdFx0c2Nyb2xsVG9wOiAwXHJcblx0XHR9LCAxMDAwKTtcclxuXHR9KTtcclxuXHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBoZWlnaHQgPSAkKCdib2R5JykuaGVpZ2h0KCksXHJcblx0XHRcdHNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuXHRcdFx0dG9wID0gJCgnI3RvcCcpO1xyXG5cdFx0aWYoc2Nyb2xsID4gaGVpZ2h0LzEwKSB7XHJcblx0XHRcdGlmKCEkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlSW4oMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKCQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVPdXQoMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxuXHQkKCcubmF2YmFyIC5kcm9wZG93bicpLmhvdmVyKGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5kZWxheSg1MCkuc2xpZGVEb3duKCk7XHJcblx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDEwMCkuc2xpZGVVcCgpXHJcblx0fSk7XHJcbn0pO1xyXG5cclxudmFyIHRvZ2dsZVNlYXJjaDtcclxuLyoqXHJcbiAqIFR5bXBhbnVzIGNvZHJvcHNcclxuICogTW9ycGggc2VhcmNoXHJcbiAqL1xyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdHZhciBtb3JwaFNlYXJjaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb3JwaHNlYXJjaCcpLFxyXG5cdFx0aW5wdXQgPSBtb3JwaFNlYXJjaC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5tb3JwaHNlYXJjaC1pbnB1dCcpLFxyXG5cdFx0Y3RybENsb3NlID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3Rvcignc3Bhbi5tb3JwaHNlYXJjaC1jbG9zZScpLFxyXG5cdFx0aXNPcGVuID0gZmFsc2U7XHJcblx0Ly8gc2hvdy9oaWRlIHNlYXJjaCBhcmVhXHJcblx0dG9nZ2xlU2VhcmNoID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcblx0XHRcdHZhciBvZmZzZXRzID0gbW9ycGhzZWFyY2guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHRcdGlmKGFjdGlvbiA9PT0gJ2Nsb3NlJykge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKG1vcnBoU2VhcmNoLCAnb3BlbicpO1xyXG5cclxuXHRcdFx0XHQvLyB0cmljayB0byBoaWRlIGlucHV0IHRleHQgb25jZSB0aGUgc2VhcmNoIG92ZXJsYXkgY2xvc2VzXHJcblx0XHRcdFx0Ly8gdG9kbzogaGFyZGNvZGVkIHRpbWVzLCBzaG91bGQgYmUgZG9uZSBhZnRlciB0cmFuc2l0aW9uIGVuZHNcclxuXHRcdFx0XHRpZihpbnB1dC52YWx1ZSAhPT0gJycpIHtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGNsYXNzaWUuYWRkKG1vcnBoU2VhcmNoLCAnaGlkZUlucHV0Jyk7XHJcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUobW9ycGhTZWFyY2gsICdoaWRlSW5wdXQnKTtcclxuXHRcdFx0XHRcdFx0XHRpbnB1dC52YWx1ZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHR9LCAzMDApO1xyXG5cdFx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlucHV0LmJsdXIoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChtb3JwaFNlYXJjaCwgJ29wZW4nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aXNPcGVuID0gIWlzT3BlbjtcclxuXHRcdH07XHJcblxyXG5cdC8vIGV2ZW50c1xyXG5cdGN0cmxDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZVNlYXJjaCk7XHJcblx0Ly8gZXNjIGtleSBjbG9zZXMgc2VhcmNoIG92ZXJsYXlcclxuXHQvLyBrZXlib2FyZCBuYXZpZ2F0aW9uIGV2ZW50c1xyXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldikge1xyXG5cdFx0dmFyIGtleUNvZGUgPSBldi5rZXlDb2RlIHx8IGV2LndoaWNoO1xyXG5cdFx0aWYoa2V5Q29kZSA9PT0gMjcgJiYgaXNPcGVuKSB7XHJcblx0XHRcdHRvZ2dsZVNlYXJjaChldik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0dmFyIHNlYXJjaFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlYXJjaCA9ICQoXCJpbnB1dC5tb3JwaHNlYXJjaC1pbnB1dFwiKS52YWwoKTtcclxuXHRcdGlmKHNlYXJjaC5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogc2VhcmNoXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9zZWFyY2gnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkKCcjc2VhcmNoLXBlb3BsZScpLmh0bWwoJzxoMj5QZW9wbGU8L2gyPicpO1xyXG5cdFx0XHQkKCcjc2VhcmNoLXRocmVhZHMnKS5odG1sKCc8aDI+VGhyZWFkczwvaDI+Jyk7XHJcblx0XHRcdCQoJyNzZWFyY2gtbmV3cycpLmh0bWwoJzxoMj5OZXdzPC9oMj4nKTtcclxuXHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLnVzZXJzLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb2JqID0gbWVkaWFPYmplY3QodGhpcy5pbWcsIHRoaXMubmFtZSwgdGhpcy51cmwpO1xyXG5cdFx0XHRcdCQoJyNzZWFyY2gtcGVvcGxlJykuYXBwZW5kKG9iaik7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JC5lYWNoKHJlc3VsdHMudGhyZWFkcywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIG9iaiA9IG1lZGlhT2JqZWN0KHRoaXMuaW1nLCB0aGlzLm5hbWUsIHRoaXMudXJsKTtcclxuXHRcdFx0XHQkKCcjc2VhcmNoLXRocmVhZHMnKS5hcHBlbmQob2JqKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5uZXdzLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb2JqID0gbWVkaWFPYmplY3QodGhpcy5pbWcsIHRoaXMubmFtZSwgdGhpcy51cmwpO1xyXG5cdFx0XHRcdCQoJyNzZWFyY2gtbmV3cycpLmFwcGVuZChvYmopO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblxyXG5cdHZhciBzdWJtaXQgPSBtb3JwaFNlYXJjaC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xyXG5cdGZ1bmN0aW9uIG1lZGlhT2JqZWN0KGltZzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XHJcblx0XHR2YXIgaHRtbCA9IFwiPGEgY2xhc3M9J21lZGlhLW9iamVjdCcgaHJlZj0nXCIgKyB1cmwgKyBcIic+XCI7XHJcblx0XHRpZihpbWcubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRodG1sICs9IFwiPGltZyBzcmM9J1wiICsgaW1nICsgXCInIC8+XCI7XHJcblx0XHR9XHJcblxyXG5cdFx0aHRtbCArPSBcIjxoMz5cIiArIG5hbWUgKyBcIjwvaDM+XCI7XHJcblx0XHRodG1sICs9IFwiPC9hPlwiO1xyXG5cdFx0cmV0dXJuIGh0bWw7XHJcblx0fVxyXG5cdHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2KSB7XHJcblx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0c2VhcmNoU3VibWl0KCk7XHJcblx0fSk7XHJcblxyXG5cdCQoJy5tb3JwaHNlYXJjaC1pbnB1dCcpLmJpbmQoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcblx0XHRpZihlLmtleUNvZGUgPT09IDEzKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0c2VhcmNoU3VibWl0KCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn0pO1xyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHQkKCcjc2VhcmNoLWdsYXNzJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZm9ybSA9ICQoXCIjbW9ycGhzZWFyY2hcIik7XHJcblx0XHR2YXIgaW5wdXQgPSAkKFwiLm1vcnBoc2VhcmNoLWlucHV0XCIpO1xyXG5cdFx0aWYoJChmb3JtKS5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScpIHtcclxuXHRcdFx0JChmb3JtKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQoZm9ybSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0b2dnbGVTZWFyY2goJ2ZvY3VzJyk7XHJcblx0fSk7XHJcblx0JCgnLm1vcnBoc2VhcmNoLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZm9ybSA9ICQoXCIjbW9ycGhzZWFyY2hcIik7XHJcblx0XHQkKGZvcm0pLmFuaW1hdGUoe1xyXG5cdFx0XHRvcGFjaXR5OiAwXHJcblx0XHR9LCA1MDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0dG9nZ2xlU2VhcmNoKCdjbG9zZScpO1xyXG5cdFx0fSwgNTAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoXCIjbW9ycGhzZWFyY2hcIikuY3NzKHtcclxuXHRcdFx0XHRvcGFjaXR5OiAxXHJcblx0XHRcdH0pO1xyXG5cdFx0XHQkKFwiLm1vcnBoc2VhcmNoXCIpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ25vbmUnXHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fSlcclxufSk7IiwidmFyIG5hbWVDaGVja2VyO1xyXG5jbGFzcyBOYW1lQ2hlY2tlciB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGZvcm06IGFueSA9IHt9O1xyXG5cdG5vdEFsbG93ZWQ6IGFueSA9IFtdO1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGF2YWlsYWJpbGl0eTogJyNyc24tYXZhaWxhYmlsaXR5JyxcclxuXHRcdFx0Y2hlY2s6ICcjcnNuLWNoZWNrLWZpZWxkJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMubm90QWxsb3dlZCA9IFsnWm5WamF3PT0nLCAnYzJocGRBPT0nXTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrOiAnL25hbWUtY2hlY2snXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5zZXRGb3JtKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0Rm9ybSgpIHtcclxuXHRcdHRoaXMuZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYW1lY2hlY2tlci1mb3JtJyk7XHJcblx0XHRuZXcgc3RlcHNGb3JtKCB0aGlzLmZvcm0sIHtcclxuXHRcdFx0b25TdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciB1c2VybmFtZSA9ICQoJyNxMScpLnZhbCgpO1xyXG5cdFx0XHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdFx0cnNuOiB1c2VybmFtZVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgobmFtZUNoZWNrZXIucGF0aHMuY2hlY2ssIGRhdGEpO1xyXG5cdFx0XHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0XHRcdHZhciBjbGFzc1NldCA9IG5hbWVDaGVja2VyLmZvcm0ucXVlcnlTZWxlY3RvcignLnNpbWZvcm0taW5uZXInKTtcclxuXHRcdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoY2xhc3NTZXQsJ2hpZGUnKTtcclxuXHRcdFx0XHRcdHZhciBlbCA9IG5hbWVDaGVja2VyLmZvcm0ucXVlcnlTZWxlY3RvcignLmZpbmFsLW1lc3NhZ2UnKTtcclxuXHJcblx0XHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdUaGUgUnVuZXNjYXBlIG5hbWUgPGI+JyArIHVzZXJuYW1lICsgJzwvYj4gaXMgJztcclxuXHRcdFx0XHRcdGlmKHJlc3VsdHMuc3Vic3RyaW5nKDAsIDYpID09PSBcIjxodG1sPlwiKSB7XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2UgKz0gJ2F2YWlsYWJsZS4nO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bWVzc2FnZSArPSAndW5hdmFpbGFibGUuJztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRtZXNzYWdlICs9IFwiPGJyIC8+PGEgaHJlZj0nL25hbWUtY2hlY2snIGNsYXNzPSdidG4gYnRuLXByaW1hcnknPlNlYXJjaCBBZ2FpbjwvYT5cIjtcclxuXHJcblx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSBtZXNzYWdlO1xyXG5cclxuXHRcdFx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoZWwsICdzaG93Jyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9XHJcbn0iLCJ2YXIgbmV3cztcclxuY2xhc3MgTmV3cyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0Y29tbWVudDoge1xyXG5cdFx0XHRcdGNvbnRlbnRzOiBcIiNuZXdzLWNvbW1lbnQtdGV4dGFyZWFcIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0Y29tbWVudDoge1xyXG5cdFx0XHRcdHN1Ym1pdDogXCJbcnQtaG9vaz0nbmV3cy5hcnRpY2xlOmNvbW1lbnQuc3VibWl0J11cIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y29tbWVudDogZnVuY3Rpb24oaWQ6IGFueSkge1xyXG5cdFx0XHRcdHJldHVybiBcIi9uZXdzL1wiICsgaWQgKyBcIi1uYW1lL3JlcGx5XCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdmVybGF5Jyk7XHJcblx0XHR2YXIgb3ZlcmxheUNsb3NlID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcclxuXHRcdHZhciBoZWFkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVhZGVyJyk7XHJcblx0XHR2YXIgc3dpdGNoQnRubiA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCdidXR0b24uc2xpZGVyLXN3aXRjaCcpO1xyXG5cdFx0dmFyIHRvZ2dsZUJ0bm4gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoc2xpZGVzaG93LmlzRnVsbHNjcmVlbikge1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkKHN3aXRjaEJ0bm4sICd2aWV3LW1heGknKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZShzd2l0Y2hCdG5uLCAndmlldy1tYXhpJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgdG9nZ2xlQ3RybHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoIXNsaWRlc2hvdy5pc0NvbnRlbnQpIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChoZWFkZXIsICdoaWRlJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgdG9nZ2xlQ29tcGxldGVDdHJscyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighc2xpZGVzaG93LmlzQ29udGVudCkge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKGhlYWRlciwgJ2hpZGUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciBzbGlkZXNob3cgPSBuZXcgRHJhZ1NsaWRlc2hvdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2xpZGVzaG93JyksIHtcclxuXHRcdFx0Ly8gdG9nZ2xlIGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgbWluaW1pemVkIHNsaWRlc2hvd1xyXG5cdFx0XHRvblRvZ2dsZTogdG9nZ2xlQnRubixcclxuXHRcdFx0Ly8gdG9nZ2xlIHRoZSBtYWluIGltYWdlIGFuZCB0aGUgY29udGVudCB2aWV3XHJcblx0XHRcdG9uVG9nZ2xlQ29udGVudDogdG9nZ2xlQ3RybHMsXHJcblx0XHRcdC8vIHRvZ2dsZSB0aGUgbWFpbiBpbWFnZSBhbmQgdGhlIGNvbnRlbnQgdmlldyAodHJpZ2dlcmVkIGFmdGVyIHRoZSBhbmltYXRpb24gZW5kcylcclxuXHRcdFx0b25Ub2dnbGVDb250ZW50Q29tcGxldGU6IHRvZ2dsZUNvbXBsZXRlQ3RybHNcclxuXHRcdH0pO1xyXG5cdFx0dmFyIHRvZ2dsZVNsaWRlc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzbGlkZXNob3cudG9nZ2xlKCk7XHJcblx0XHRcdHRvZ2dsZUJ0bm4oKTtcclxuXHRcdH07XHJcblx0XHR2YXIgY2xvc2VPdmVybGF5ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNsYXNzaWUuYWRkKG92ZXJsYXksICdoaWRlJyk7XHJcblx0XHR9O1xyXG5cdFx0Ly8gdG9nZ2xlIGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgc21hbGwgc2xpZGVzaG93XHJcblx0XHRzd2l0Y2hCdG5uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlU2xpZGVzaG93KTtcclxuXHRcdC8vIGNsb3NlIG92ZXJsYXlcclxuXHRcdG92ZXJsYXlDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlT3ZlcmxheSk7XHJcblxyXG5cdFx0aWYobG9jYWxTdG9yYWdlKSB7XHJcblx0XHRcdHZhciBzaG93ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbmV3cy5pbmZvLnNob3dlZCcpO1xyXG5cdFx0XHRpZihzaG93ZWQgPT09ICd0cnVlJykge1xyXG5cdFx0XHRcdGNsb3NlT3ZlcmxheSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zZXR1cEFjdGlvbnMoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXR1cEFjdGlvbnMoKSB7XHJcblx0XHQkKFwiZGl2LmluZm8gYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihsb2NhbFN0b3JhZ2UpIHtcclxuXHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbmV3cy5pbmZvLnNob3dlZCcsICd0cnVlJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmhvb2tzLmNvbW1lbnQuc3VibWl0KS5jbGljayhmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGlkID0gJChlLnRhcmdldCkucGFyZW50KCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5maW5kKCd0ZXh0YXJlYScpLnZhbCgpO1xyXG5cdFx0XHRuZXdzLnN1Ym1pdENvbW1lbnQoaWQsIGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdENvbW1lbnQoaWQsIGNvbnRlbnRzKSB7XHJcblx0XHRpZihjb250ZW50cy5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH1cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogY29udGVudHNcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmNvbW1lbnQoaWQpLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlc3VsdHMudXJsO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGVycm9yXHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdG9Db21tZW50cyhpZDogbnVtYmVyKSB7XHJcblx0XHQkKFwiW2RhdGEtY29udGVudD0nY29udGVudC1cIiArIGlkICtcIiddIGJ1dHRvbi5jb250ZW50LXN3aXRjaFwiKS50cmlnZ2VyKCdjbGljaycpO1xyXG5cdH1cclxufSIsImNsYXNzIE5vdGlmaWNhdGlvbnMge1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgcGF0aHM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wYXRocyA9IHtcclxuICAgICAgICAgICAgbWFya1JlYWQ6ICcvbm90aWZpY2F0aW9ucy9tYXJrLXJlYWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKFwiW3J0LWhvb2s9J2hvb2shbm90aWZpY2F0aW9uczptYXJrLnJlYWQnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZS50YXJnZXQuYXR0cigncnQtZGF0YScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciByYWRpbztcclxudmFyIGNoYXRib3g7XHJcbmNsYXNzIFJhZGlvIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0b25saW5lOiBib29sZWFuID0gdHJ1ZTtcclxuXHRwb3B1cDogYW55ID0gbnVsbDtcclxuXHRzdGF0dXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRzdGF0dXNDbG9zZWQ6IHN0cmluZyA9ICcnO1xyXG5cdHN0YXR1c09wZW46IHN0cmluZyA9ICcnO1xyXG5cdFVSTDogc3RyaW5nID0gJyc7XHJcblx0dmFyTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblx0dmFyU3RhdHVzOiBzdHJpbmcgPSAnJztcclxuXHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5VUkwgPSAnaHR0cDovL2FwcHMuc3RyZWFtbGljZW5zaW5nLmNvbS9wbGF5ZXItcG9wdXAucGhwP3NpZD0yNTc5JnN0cmVhbV9pZD00Mzg2JztcclxuXHRcdHRoaXMuc3RhdHVzQ2xvc2VkID0gJ3RvIGxpc3RlbiB0byBSdW5lVGltZSBSYWRpbyEnO1xyXG5cdFx0dGhpcy5zdGF0dXNPcGVuID0gJ3RvIGNsb3NlIFJ1bmVUaW1lIFJhZGlvJztcclxuXHRcdHRoaXMudmFyTWVzc2FnZSA9ICcjcmFkaW8tbWVzc2FnZSc7XHJcblx0XHR0aGlzLnZhclN0YXR1cyA9ICcjcmFkaW8tc3RhdHVzJztcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRzdGF0dXNNZXNzYWdlOiAnI3JhZGlvLXN0YXR1cy1tZXNzYWdlJ1xyXG5cdFx0fTtcclxuXHRcdCQoJyNyYWRpby1saW5rJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFyYWRpby5zdGF0dXMpIHtcclxuXHRcdFx0XHRyYWRpby5yYWRpb09wZW4oKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyYWRpby5yYWRpb0Nsb3NlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby1oaXN0b3J5JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLm9wZW5IaXN0b3J5KCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmFkaW8tcmVxdWVzdCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5yZXF1ZXN0T3BlbigpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLXRpbWV0YWJsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuVGltZXRhYmxlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNwdWxsLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLnB1bGxIaWRlKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvcGVuSGlzdG9yeSgpIHtcclxuXHRcdHZhciBoaXN0b3J5ID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL2hpc3RvcnknKTtcclxuXHRcdGhpc3RvcnkuZG9uZShmdW5jdGlvbihoaXN0b3J5OiBzdHJpbmcpIHtcclxuXHRcdFx0aGlzdG9yeSA9ICQucGFyc2VKU09OKGhpc3RvcnkpO1xyXG5cdFx0XHR2YXIgbXVzaWMgPSBudWxsLFxyXG5cdFx0XHRcdGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0ndGFibGUnPjx0aGVhZD48dHI+PHRkPlRpbWU8L3RkPjx0ZD5BcnRpc3Q8L3RkPjx0ZD5OYW1lPC90ZD48L3RyPjwvdGhlYWQ+PHRib2R5PlwiO1xyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gaGlzdG9yeS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuXHRcdFx0XHRtdXNpYyA9IGhpc3RvcnlbeF07XHJcblx0XHRcdFx0aHRtbCArPSBcIjx0cj48dGQ+XCIgKyB1dGlsaXRpZXMudGltZUFnbyhtdXNpYy5jcmVhdGVkX2F0KSArIFwiPC90ZD48dGQ+IFwiICsgbXVzaWMuYXJ0aXN0ICsgXCI8L3RkPjx0ZD5cIiArIG11c2ljLnNvbmcgKyBcIjwvdGQ+PC90cj5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvcGVuVGltZXRhYmxlKCkge1xyXG5cdFx0dmFyIHRpbWV0YWJsZSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby90aW1ldGFibGUnKTtcclxuXHRcdHRpbWV0YWJsZS5kb25lKGZ1bmN0aW9uKHRpbWV0YWJsZTogc3RyaW5nKSB7XHJcblx0XHRcdHRpbWV0YWJsZSA9ICQucGFyc2VKU09OKHRpbWV0YWJsZSk7XHJcblx0XHRcdHZhciBodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlIHRleHQtY2VudGVyJz48dGhlYWQ+PHRyPjx0ZD4mbmJzcDs8L3RkPjx0ZD5Nb25kYXk8L3RkPjx0ZD5UdWVzZGF5PC90ZD48dGQ+V2VkbmVzZGF5PC90ZD48dGQ+VGh1cnNkYXk8L3RkPjx0ZD5GcmlkYXk8L3RkPjx0ZD5TYXR1cmRheTwvdGQ+PHRkPlN1bmRheTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IDIzOyB4IDw9IHk7IHgrKykge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgeCArIFwiOjAwPC90ZD5cIjtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gNjsgaSA8PSBqOyBpKyspIHtcclxuXHRcdFx0XHRcdGh0bWwgKz0gXCI8dGQ+XCI7XHJcblx0XHRcdFx0XHRpZih0aW1ldGFibGVbaV0gIT09IHVuZGVmaW5lZCAmJiB0aW1ldGFibGVbaV1beF0gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IHRpbWV0YWJsZVtpXVt4XTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGh0bWwgKz0gXCImbmJzcDtcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRodG1sICs9IFwiPC90ZD5cIjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGh0bWwgKz0gXCI8L3RyPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRodG1sICs9IFwiPC90Ym9keT48L3RhYmxlPlwiO1xyXG5cdFx0XHRyYWRpby5wdWxsT3BlbihodG1sKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9ubGluZVNldHRpbmdzKCkge1xyXG5cdFx0aWYodGhpcy5vbmxpbmUgIT09IHRydWUpIHtcclxuXHRcdFx0dGhpcy5yYWRpb0Nsb3NlKCk7XHJcblx0XHRcdCQodGhpcy5lbGVtZW50cy5zdGF0dXNNZXNzYWdlKS5odG1sKFwiVGhlIHJhZGlvIGhhcyBiZWVuIHNldCBvZmZsaW5lLlwiKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQodGhpcy5lbGVtZW50cy5zdGF0dXNNZXNzYWdlKS5odG1sKFwiXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIHB1bGxIaWRlKCkge1xyXG5cdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKCcmbmJzcDsnKTtcclxuXHRcdCQoJyNyYWRpby1wdWxsJykud2lkdGgoJycpLlxyXG5cdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcwJSdcclxuXHRcdFx0fSk7XHJcblx0XHQkKCcjcmFkaW8tb3B0aW9ucycpLndpZHRoKCcnKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHR3aWR0aDogJzEwMCUnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHB1bGxPcGVuKGNvbnRlbnRzOiBzdHJpbmcpIHtcclxuXHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbChjb250ZW50cyk7XHJcblx0XHQkKCcjcmFkaW8tcHVsbCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdFx0fSk7XHJcblx0XHQkKCcjcmFkaW8tb3B0aW9ucycpLmNzcyh7XHJcblx0XHRcdHdpZHRoOiAnNTAlJ1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmFkaW9DbG9zZSgpIHtcclxuXHRcdGlmKHRoaXMucG9wdXApIHtcclxuXHRcdFx0dGhpcy5wb3B1cC5jbG9zZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQodGhpcy52YXJNZXNzYWdlKS5odG1sKHRoaXMuc3RhdHVzQ2xvc2VkKTtcclxuXHRcdHRoaXMuc3RhdHVzID0gZmFsc2U7XHJcblx0XHQkKHRoaXMudmFyU3RhdHVzKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ3RleHQtc3VjY2VzcycpXHJcblx0XHRcdC5hZGRDbGFzcygndGV4dC1kYW5nZXInKVxyXG5cdFx0XHQuaHRtbChcIjxpIGlkPSdwb3dlci1idXR0b24nIGNsYXNzPSdmYSBmYS1wb3dlci1vZmYnPjwvaT5PZmZcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmFkaW9PcGVuKCkge1xyXG5cdFx0aWYodGhpcy5vbmxpbmUgIT09IHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMucG9wdXAgPSB3aW5kb3cub3Blbih0aGlzLlVSTCwgJ1J1bmVUaW1lIFJhZGlvJywgJ3dpZHRoPTM4OSxoZWlnaHQ9MzU5Jyk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IHRydWU7XHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c09wZW4pO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cykuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCd0ZXh0LWRhbmdlcicpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJykuXHJcblx0XHRcdGh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T25cIik7XHJcblx0XHR2YXIgcG9sbFRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYocmFkaW8ucG9wdXAuY2xvc2VkICE9PSBmYWxzZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHBvbGxUaW1lcik7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZXF1ZXN0T3BlbigpIHtcclxuXHRcdHZhciByZXF1ZXN0ID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3JlcXVlc3Qvc29uZycpO1xyXG5cdFx0cmVxdWVzdC5kb25lKGZ1bmN0aW9uKHJlcXVlc3Q6IHN0cmluZykge1xyXG5cdFx0XHRyZXF1ZXN0ID0gJC5wYXJzZUpTT04ocmVxdWVzdCk7XHJcblx0XHRcdHZhciBodG1sID0gXCJcIjtcclxuXHRcdFx0aWYocmVxdWVzdC5yZXNwb25zZSA9PT0gMikge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8Zm9ybSByb2xlPSdmb3JtJz48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48bGFiZWwgZm9yPSdyZXF1ZXN0LWFydGlzdCc+QXJ0aXN0IE5hbWU8L2xhYmVsPjxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0ncmVxdWVzdC1hcnRpc3QnIGNsYXNzPSdmb3JtLWNvbnRyb2wnIG5hbWU9J3JlcXVlc3QtYXJ0aXN0JyBwbGFjZWhvbGRlcj0nQXJ0aXN0IE5hbWUnIHJlcXVpcmVkIC8+PC9kaXY+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1uYW1lJz5Tb25nIE5hbWU8L2xhYmVsPjxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0ncmVxdWVzdC1uYW1lJyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LW5hbWUnIHBsYWNlaG9sZGVyPSdTb25nIE5hbWUnIHJlcXVpcmVkIC8+PC9kaXY+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PHAgaWQ9J3JlcXVlc3QtYnV0dG9uJyBjbGFzcz0nYnRuIGJ0bi1wcmltYXJ5Jz5SZXF1ZXN0PC9wPjwvZGl2PjwvZm9ybT5cIjtcclxuXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3QucmVzcG9uc2UgPT09IDEpIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtd2FybmluZyc+QXV0byBESiBjdXJyZW50bHkgZG9lcyBub3QgYWNjZXB0IHNvbmcgcmVxdWVzdHMsIHNvcnJ5IVwiO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPllvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byByZXF1ZXN0IGEgc29uZyBmcm9tIHRoZSBESi48L3A+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNyZXF1ZXN0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRyYWRpby5yZXF1ZXN0U2VuZCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sIDMwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlcXVlc3RTZW5kKCkge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCdhcnRpc3QnOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVxdWVzdC1hcnRpc3QnKS52YWx1ZSxcclxuXHRcdFx0J25hbWUnOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVxdWVzdC1uYW1lJykudmFsdWVcclxuXHRcdH07XHJcblx0XHR2YXIgY29udGVudHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJ3JhZGlvL3JlcXVlc3Qvc29uZycsIGRhdGEpO1xyXG5cdFx0Y29udGVudHMuZG9uZShmdW5jdGlvbihjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHRcdGNvbnRlbnRzID0gJC5wYXJzZUpTT04oY29udGVudHMpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKGNvbnRlbnRzLnNlbnQgPT09IHRydWUpIHtcclxuXHRcdFx0XHRodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5Zb3VyIHJlcXVlc3QgaGFzIGJlZW4gc2VudCB0byB0aGUgREo8L3A+XCI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aHRtbCA9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5UaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QuICBUcnkgYWdhaW4/XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbChodG1sKTtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5wdWxsSGlkZSgpO1xyXG5cdFx0dGhpcy51cGRhdGUoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHQkKCcjcmVxdWVzdHMtdXNlci1jdXJyZW50JykuaHRtbCgnJyk7XHJcblx0XHR2YXIgdXBkYXRlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3VwZGF0ZScpO1xyXG5cdFx0dXBkYXRlLmRvbmUoZnVuY3Rpb24odXBkYXRlKSB7XHJcblx0XHRcdHVwZGF0ZSA9ICQucGFyc2VKU09OKHVwZGF0ZSk7XHJcblx0XHRcdHZhciByZXF1ZXN0c0hUTUwgPSBcIlwiO1xyXG5cdFx0XHQkKCcjcmFkaW8tc29uZy1uYW1lJykuaHRtbCh1cGRhdGVbJ3NvbmcnXVsnbmFtZSddKTtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctYXJ0aXN0JykuaHRtbCh1cGRhdGVbJ3NvbmcnXVsnYXJ0aXN0J10pO1xyXG5cdFx0XHRpZih1cGRhdGVbJ2RqJ10gIT09IG51bGwgJiYgdXBkYXRlWydkaiddICE9PSAnJykge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnI3JhZGlvLWRqJykuaHRtbChcIkF1dG8gREpcIik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHVwZGF0ZVsnbWVzc2FnZSddICE9PSAnJyAmJiB1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gLTEpIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKHVwZGF0ZVsnbWVzc2FnZSddKTtcclxuXHRcdFx0fSBlbHNlIGlmKHVwZGF0ZVsnbWVzc2FnZSddID09PSAtMSAmJiB1cGRhdGVbJ2RqJ10gIT09IG51bGwgJiYgdXBkYXRlWydkaiddICE9PSAnJykge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSArIFwiIGlzIGN1cnJlbnRseSBvbiBhaXIhXCIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwoXCJBdXRvIERKIGlzIGN1cnJlbnRseSBvbiBhaXJcIik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSB1cGRhdGVbJ3JlcXVlc3RzJ10ubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSB1cGRhdGVbJ3JlcXVlc3RzJ11beF07XHJcblx0XHRcdFx0aWYocmVxdWVzdC5zdGF0dXMgPT0gMCkge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHA+XCI7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09IDEpIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwIGNsYXNzPSd0ZXh0LXN1Y2Nlc3MnPlwiO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PSAyKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPlwiO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IHJlcXVlc3Quc29uZ19uYW1lICsgXCIgYnkgXCIgKyByZXF1ZXN0LnNvbmdfYXJ0aXN0O1xyXG5cdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjwvcD5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwocmVxdWVzdHNIVE1MKTtcclxuXHJcblx0XHRcdHJhZGlvLm9ubGluZSA9IHVwZGF0ZS5vbmxpbmU7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmFkaW8udXBkYXRlKCk7XHJcblx0XHRcdH0sIDMwMDAwKTtcclxuXHRcdFx0cmFkaW8ub25saW5lU2V0dGluZ3MoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufSIsInZhciBzaWduYXR1cmU7XHJcbmNsYXNzIFNpZ25hdHVyZSB7XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHN1Ym1pdDogJy9zaWduYXR1cmVzJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB0aGVGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ25hdHVyZS1mb3JtJyk7XHJcblx0XHRuZXcgc3RlcHNGb3JtKCB0aGVGb3JtLCB7XHJcblx0XHRcdG9uU3VibWl0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgdXNlcm5hbWUgPSAkKCcjcTEnKS52YWwoKTtcclxuXHRcdFx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0XHRcdHVzZXJuYW1lOiB1c2VybmFtZVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dXRpbGl0aWVzLnBvc3Qoc2lnbmF0dXJlLnBhdGhzLnN1Ym1pdCwgZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbnVwRm9ybTtcclxuY2xhc3MgU2lnbnVwRm9ybSB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGRpc3BsYXlOYW1lOiAnI2Rpc3BsYXlfbmFtZScsXHJcblx0XHRcdGVtYWlsOiAnI2VtYWlsJyxcclxuXHRcdFx0cGFzc3dvcmQ6ICcjcGFzc3dvcmQnLFxyXG5cdFx0XHRwYXNzd29yZDI6ICcjcGFzc3dvcmQyJyxcclxuXHRcdFx0c2VjdXJpdHlDaGVjazogJyNzZWN1cml0eSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjaGVja0F2YWlsYWJpbGl0eTogJy9nZXQvc2lnbnVwLydcclxuXHRcdH07XHJcblx0XHR2YXIgc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCxcclxuXHRcdFx0dGltZW91dCA9IDUwMDtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2Rpc3BsYXlfbmFtZScpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVtYWlsKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0VtYWlsKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdFbWFpbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5KCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJ2Zvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5zdWJtaXQoZSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrQXZhaWxhYmlsaXR5KGZpZWxkOiBzdHJpbmcpIHtcclxuXHRcdHZhciB2YWwgPSAkKCcjJyArIGZpZWxkKS52YWwoKTtcclxuXHRcdGlmKHZhbC5sZW5ndGggPT09IDApXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdHZhciB1cmwgPSB0aGlzLnBhdGhzLmNoZWNrQXZhaWxhYmlsaXR5ICsgZmllbGQ7XHJcblx0XHR2YXIgYXZhaWxhYmxlO1xyXG5cdFx0aWYoZmllbGQgPT09IFwiZGlzcGxheV9uYW1lXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBkaXNwbGF5X25hbWU6IHZhbCB9KTtcclxuXHRcdH0gZWxzZSBpZihmaWVsZCA9PT0gXCJlbWFpbFwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZW1haWw6IHZhbCB9KTtcclxuXHRcdH1cclxuXHRcdGF2YWlsYWJsZS5kb25lKGZ1bmN0aW9uKGF2YWlsYWJsZTogc3RyaW5nKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5KU09ORGVjb2RlKGF2YWlsYWJsZSk7XHJcblx0XHRcdGlmKGF2YWlsYWJsZS5hdmFpbGFibGUgPT09IHRydWUpIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tQYXNzd29yZCgpIHtcclxuXHRcdHZhciB2MSA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkudmFsKCksXHJcblx0XHRcdHYyID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikudmFsKCk7XHJcblx0XHRpZih2Mi5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGlmKHYxID09PSB2Mikge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgdHJ1ZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgdHJ1ZSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCBmYWxzZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgZmFsc2UpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hlY2tTZWN1cml0eSgpIHtcclxuXHRcdHZhciBzbGlkZXJWYWwgPSAkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykudmFsKCk7XHJcblx0XHRpZihzbGlkZXJWYWwgPD0gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ25vbmUnXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIGlmKHNsaWRlclZhbCA+IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdibG9jaydcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdWJtaXQoZTogYW55KSB7XHJcblx0XHR2YXIgdXNlcm5hbWUgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCd1c2VybmFtZScpLFxyXG5cdFx0XHRlbWFpbCA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyksXHJcblx0XHRcdHBhc3MgPSB0aGlzLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdGlmKHVzZXJuYW1lID09PSB0cnVlICYmIGVtYWlsID09PSB0cnVlICYmIHBhc3MgPT09IHRydWUpIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRvZ2dsZUZlZWRiYWNrKGZpZWxkOiBzdHJpbmcsIHN0YXR1czogYm9vbGVhbikge1xyXG5cdFx0aWYoc3RhdHVzID09PSB0cnVlKSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsImNsYXNzIFN0YWZmTGlzdCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB2YXIgbWVtYmVycyA9ICQoXCJbcnQtaG9vaz0naG9vayFzdGFmZi5saXN0OmNhcmQnXVwiKTtcclxuICAgICAgICAkLmVhY2gobWVtYmVycywgZnVuY3Rpb24oaW5kZXg6IG51bWJlciwgdmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodmFsKS5hdHRyKCdydC1kYXRhJyk7XHJcbiAgICAgICAgICAgIHZhciBzcmMgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZihpZCA9PSAnbm8nKSB7XHJcbiAgICAgICAgICAgICAgICBzcmMgPSAkKHZhbCkuYXR0cigncnQtZGF0YTInKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNyYyA9IGlkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQodmFsKS5maW5kKCcuZnJvbnQnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgnL2ltZy9mb3J1bXMvcGhvdG9zL1wiICsgc3JjICsgXCIucG5nJylcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2YWwpLmJpbmQoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2hvdmVyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIHN0ZXBzRm9ybS5qcyB2MS4wLjBcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE0LCBDb2Ryb3BzXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICovXHJcbjsoIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcblx0XHRcdCdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcclxuXHRcdFx0J09UcmFuc2l0aW9uJzogJ29UcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J21zVHJhbnNpdGlvbic6ICdNU1RyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJ1xyXG5cdFx0fSxcclxuXHRcdHRyYW5zRW5kRXZlbnROYW1lID0gdHJhbnNFbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoICd0cmFuc2l0aW9uJyApIF0sXHJcblx0XHRzdXBwb3J0ID0geyB0cmFuc2l0aW9ucyA6IE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyB9O1xyXG5cclxuXHRmdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XHJcblx0XHRmb3IoIHZhciBrZXkgaW4gYiApIHtcclxuXHRcdFx0aWYoIGIuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG5cdFx0XHRcdGFba2V5XSA9IGJba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdGVwc0Zvcm0oIGVsLCBvcHRpb25zICkge1xyXG5cdFx0dGhpcy5lbCA9IGVsO1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XHJcblx0XHRleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xyXG5cdFx0dGhpcy5faW5pdCgpO1xyXG5cdH1cclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5vcHRpb25zID0ge1xyXG5cdFx0b25TdWJtaXQgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dGhpcy5jdXJyZW50ID0gMDtcclxuXHJcblx0XHQvLyBxdWVzdGlvbnNcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gW10uc2xpY2UuY2FsbCggdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCAnb2wucXVlc3Rpb25zID4gbGknICkgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9uc1xyXG5cdFx0dGhpcy5xdWVzdGlvbnNDb3VudCA9IHRoaXMucXVlc3Rpb25zLmxlbmd0aDtcclxuXHRcdC8vIHNob3cgZmlyc3QgcXVlc3Rpb25cclxuXHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMucXVlc3Rpb25zWzBdLCAnY3VycmVudCcgKTtcclxuXHJcblx0XHQvLyBuZXh0IHF1ZXN0aW9uIGNvbnRyb2xcclxuXHRcdHRoaXMuY3RybE5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdidXR0b24ubmV4dCcgKTtcclxuXHJcblx0XHQvLyBwcm9ncmVzcyBiYXJcclxuXHRcdHRoaXMucHJvZ3Jlc3MgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdkaXYucHJvZ3Jlc3MnICk7XHJcblxyXG5cdFx0Ly8gcXVlc3Rpb24gbnVtYmVyIHN0YXR1c1xyXG5cdFx0dGhpcy5xdWVzdGlvblN0YXR1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyJyApO1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvbiBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy5jdXJyZW50TnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItY3VycmVudCcgKTtcclxuXHRcdHRoaXMuY3VycmVudE51bS5pbm5lckhUTUwgPSBOdW1iZXIoIHRoaXMuY3VycmVudCArIDEgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9ucyBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy50b3RhbFF1ZXN0aW9uTnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItdG90YWwnICk7XHJcblx0XHR0aGlzLnRvdGFsUXVlc3Rpb25OdW0uaW5uZXJIVE1MID0gdGhpcy5xdWVzdGlvbnNDb3VudDtcclxuXHJcblx0XHQvLyBlcnJvciBtZXNzYWdlXHJcblx0XHR0aGlzLmVycm9yID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5lcnJvci1tZXNzYWdlJyApO1xyXG5cclxuXHRcdC8vIGluaXQgZXZlbnRzXHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0Ly8gZmlyc3QgaW5wdXRcclxuXHRcdFx0Zmlyc3RFbElucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKSxcclxuXHRcdC8vIGZvY3VzXHJcblx0XHRcdG9uRm9jdXNTdGFydEZuID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Zmlyc3RFbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggc2VsZi5jdHJsTmV4dCwgJ3Nob3cnICk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0Ly8gc2hvdyB0aGUgbmV4dCBxdWVzdGlvbiBjb250cm9sIGZpcnN0IHRpbWUgdGhlIGlucHV0IGdldHMgZm9jdXNlZFxyXG5cdFx0Zmlyc3RFbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblxyXG5cdFx0Ly8gc2hvdyBuZXh0IHF1ZXN0aW9uXHJcblx0XHR0aGlzLmN0cmxOZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0c2VsZi5fbmV4dFF1ZXN0aW9uKCk7XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gcHJlc3NpbmcgZW50ZXIgd2lsbCBqdW1wIHRvIG5leHQgcXVlc3Rpb25cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdC8vIGVudGVyXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSAxMyApIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuX25leHRRdWVzdGlvbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gZGlzYWJsZSB0YWJcclxuXHRcdHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdFx0Ly8gdGFiXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSA5ICkge1xyXG5cdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9O1xyXG5cclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmKCAhdGhpcy5fdmFsaWRhZGUoKSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNoZWNrIGlmIGZvcm0gaXMgZmlsbGVkXHJcblx0XHRpZiggdGhpcy5jdXJyZW50ID09PSB0aGlzLnF1ZXN0aW9uc0NvdW50IC0gMSApIHtcclxuXHRcdFx0dGhpcy5pc0ZpbGxlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2xlYXIgYW55IHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzXHJcblx0XHR0aGlzLl9jbGVhckVycm9yKCk7XHJcblxyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dmFyIGN1cnJlbnRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHJcblx0XHQvLyBpbmNyZW1lbnQgY3VycmVudCBxdWVzdGlvbiBpdGVyYXRvclxyXG5cdFx0Kyt0aGlzLmN1cnJlbnQ7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHByb2dyZXNzIGJhclxyXG5cdFx0dGhpcy5fcHJvZ3Jlc3MoKTtcclxuXHJcblx0XHRpZiggIXRoaXMuaXNGaWxsZWQgKSB7XHJcblx0XHRcdC8vIGNoYW5nZSB0aGUgY3VycmVudCBxdWVzdGlvbiBudW1iZXIvc3RhdHVzXHJcblx0XHRcdHRoaXMuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyKCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgY2xhc3MgXCJzaG93LW5leHRcIiB0byBmb3JtIGVsZW1lbnQgKHN0YXJ0IGFuaW1hdGlvbnMpXHJcblx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMuZWwsICdzaG93LW5leHQnICk7XHJcblxyXG5cdFx0XHQvLyByZW1vdmUgY2xhc3MgXCJjdXJyZW50XCIgZnJvbSBjdXJyZW50IHF1ZXN0aW9uIGFuZCBhZGQgaXQgdG8gdGhlIG5leHQgb25lXHJcblx0XHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdFx0dmFyIG5leHRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHRcdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggY3VycmVudFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggbmV4dFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBhZnRlciBhbmltYXRpb24gZW5kcywgcmVtb3ZlIGNsYXNzIFwic2hvdy1uZXh0XCIgZnJvbSBmb3JtIGVsZW1lbnQgYW5kIGNoYW5nZSBjdXJyZW50IHF1ZXN0aW9uIHBsYWNlaG9sZGVyXHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsXHJcblx0XHRcdG9uRW5kVHJhbnNpdGlvbkZuID0gZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHRcdGlmKCBzdXBwb3J0LnRyYW5zaXRpb25zICkge1xyXG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCB0cmFuc0VuZEV2ZW50TmFtZSwgb25FbmRUcmFuc2l0aW9uRm4gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoIHNlbGYuaXNGaWxsZWQgKSB7XHJcblx0XHRcdFx0XHRzZWxmLl9zdWJtaXQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjbGFzc2llLnJlbW92ZUNsYXNzKCBzZWxmLmVsLCAnc2hvdy1uZXh0JyApO1xyXG5cdFx0XHRcdFx0c2VsZi5jdXJyZW50TnVtLmlubmVySFRNTCA9IHNlbGYubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTDtcclxuXHRcdFx0XHRcdHNlbGYucXVlc3Rpb25TdGF0dXMucmVtb3ZlQ2hpbGQoIHNlbGYubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0XHRcdFx0XHQvLyBmb3JjZSB0aGUgZm9jdXMgb24gdGhlIG5leHQgaW5wdXRcclxuXHRcdFx0XHRcdG5leHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICkuZm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0aWYoIHN1cHBvcnQudHJhbnNpdGlvbnMgKSB7XHJcblx0XHRcdHRoaXMucHJvZ3Jlc3MuYWRkRXZlbnRMaXN0ZW5lciggdHJhbnNFbmRFdmVudE5hbWUsIG9uRW5kVHJhbnNpdGlvbkZuICk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0b25FbmRUcmFuc2l0aW9uRm4oKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIHVwZGF0ZXMgdGhlIHByb2dyZXNzIGJhciBieSBzZXR0aW5nIGl0cyB3aWR0aFxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3Byb2dyZXNzID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLnByb2dyZXNzLnN0eWxlLndpZHRoID0gdGhpcy5jdXJyZW50ICogKCAxMDAgLyB0aGlzLnF1ZXN0aW9uc0NvdW50ICkgKyAnJSc7XHJcblx0fVxyXG5cclxuXHQvLyBjaGFuZ2VzIHRoZSBjdXJyZW50IHF1ZXN0aW9uIG51bWJlclxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBmaXJzdCwgY3JlYXRlIG5leHQgcXVlc3Rpb24gbnVtYmVyIHBsYWNlaG9sZGVyXHJcblx0XHR0aGlzLm5leHRRdWVzdGlvbk51bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xyXG5cdFx0dGhpcy5uZXh0UXVlc3Rpb25OdW0uY2xhc3NOYW1lID0gJ251bWJlci1uZXh0JztcclxuXHRcdHRoaXMubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTCA9IE51bWJlciggdGhpcy5jdXJyZW50ICsgMSApO1xyXG5cdFx0Ly8gaW5zZXJ0IGl0IGluIHRoZSBET01cclxuXHRcdHRoaXMucXVlc3Rpb25TdGF0dXMuYXBwZW5kQ2hpbGQoIHRoaXMubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0fVxyXG5cclxuXHQvLyBzdWJtaXRzIHRoZSBmb3JtXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm9wdGlvbnMub25TdWJtaXQoIHRoaXMuZWwgKTtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE8gKG5leHQgdmVyc2lvbi4uKVxyXG5cdC8vIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fdmFsaWRhZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb27DgsK0cyBpbnB1dFxyXG5cdFx0dmFyIGlucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKS52YWx1ZTtcclxuXHRcdGlmKCBpbnB1dCA9PT0gJycgKSB7XHJcblx0XHRcdHRoaXMuX3Nob3dFcnJvciggJ0VNUFRZU1RSJyApO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIChuZXh0IHZlcnNpb24uLilcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9zaG93RXJyb3IgPSBmdW5jdGlvbiggZXJyICkge1xyXG5cdFx0dmFyIG1lc3NhZ2UgPSAnJztcclxuXHRcdHN3aXRjaCggZXJyICkge1xyXG5cdFx0XHRjYXNlICdFTVBUWVNUUicgOlxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnUGxlYXNlIGZpbGwgdGhlIGZpZWxkIGJlZm9yZSBjb250aW51aW5nJztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAnSU5WQUxJREVNQUlMJyA6XHJcblx0XHRcdFx0bWVzc2FnZSA9ICdQbGVhc2UgZmlsbCBhIHZhbGlkIGVtYWlsIGFkZHJlc3MnO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHQvLyAuLi5cclxuXHRcdH07XHJcblx0XHR0aGlzLmVycm9yLmlubmVySFRNTCA9IG1lc3NhZ2U7XHJcblx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLmVycm9yLCAnc2hvdycgKTtcclxuXHR9XHJcblxyXG5cdC8vIGNsZWFycy9oaWRlcyB0aGUgY3VycmVudCBlcnJvciBtZXNzYWdlXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fY2xlYXJFcnJvciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggdGhpcy5lcnJvciwgJ3Nob3cnICk7XHJcblx0fVxyXG5cclxuXHQvLyBhZGQgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5cdHdpbmRvdy5zdGVwc0Zvcm0gPSBzdGVwc0Zvcm07XHJcblxyXG59KSggd2luZG93ICk7IiwidmFyIHV0aWxpdGllcztcclxuY2xhc3MgVXRpbGl0aWVzIHtcclxuICAgIHB1YmxpYyBjdXJyZW50VGltZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZvcm1Ub2tlbih0b2tlbjogc3RyaW5nKSB7XHJcbiAgICAgICAgdG9rZW4gPSBhdG9iKHRva2VuKTtcclxuICAgICAgICAkKCdmb3JtJykuYXBwZW5kKFwiPGlucHV0IHR5cGU9J2hpZGRlbicgbmFtZT0nX3Rva2VuJyB2YWx1ZT0nXCIgKyB0b2tlbiArIFwiJyAvPlwiKTtcclxuXHJcbiAgICAgICAgdmFyIG1ldGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtZXRhJyk7XHJcbiAgICAgICAgbWV0YS5uYW1lID0gJ190b2tlbic7XHJcbiAgICAgICAgbWV0YS5jb250ZW50ID0gdG9rZW47XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobWV0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFKQVgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnaHRtbCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEpTT05EZWNvZGUoanNvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQucGFyc2VKU09OKGpzb24pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvc3RBSkFYKHBhdGg6IHN0cmluZywgZGF0YTogYW55KSB7XHJcbiAgICAgICAgZGF0YS5fdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJfdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzY3JvbGxUbyhlbGVtZW50OiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcFxyXG4gICAgICAgIH0sIHRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0aW1lQWdvKHRzOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbm93VHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcclxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vd1RzIC0gdHM7XHJcbiAgICAgICAgaWYoc2Vjb25kcyA+IDIgKiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYSBmZXcgZGF5cyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ5ZXN0ZXJkYXlcIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDcyMDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDM2MDApICsgXCIgaG91cnMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImFuIGhvdXIgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gMTIwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCkgKyBcIiBtaW51dGVzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDYwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgbWludXRlIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwiIHNlY29uZHMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBzZWNvbmQgYWdvXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwb3N0KHBhdGg6IHN0cmluZywgcGFyYW1zOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XHJcbiAgICAgICAgbWV0aG9kID0gbWV0aG9kIHx8ICdwb3N0JztcclxuICAgICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnbWV0aG9kJywgbWV0aG9kKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWN0aW9uJywgcGF0aCk7XHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGlmKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGlkZGVuRmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCduYW1lJywga2V5KTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBwYXJhbXNba2V5XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChoaWRkZW5GaWVsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRva2VuVmFsID0gJChcIm1ldGFbbmFtZT0nX3Rva2VuJ11cIikuYXR0cignY29udGVudCcpO1xyXG4gICAgICAgIHZhciB0b2tlbkZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgnbmFtZScsICdfdG9rZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCB0b2tlblZhbCk7XHJcblxyXG4gICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQodG9rZW5GaWVsZCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XHJcbiAgICAgICAgZm9ybS5zdWJtaXQoKTtcclxuICAgIH1cclxufVxyXG51dGlsaXRpZXMgPSBuZXcgVXRpbGl0aWVzKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9