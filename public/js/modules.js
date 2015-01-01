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
    /***** for demo purposes only: don't allow to submit the form *****/
    morphSearch.querySelector('button[type="submit"]').addEventListener('click', function (ev) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvYWJvdXQudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NoYXRib3gudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NsYW4udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvZHJvcHNfZGlhbG9nRngudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbWJhdGNhbGN1bGF0b3IudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2NvbnRhY3QudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL2ZvcnVtcy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbGl2ZXN0cmVhbS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbWFpbi50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmFtZWNoZWNrZXIudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25ld3MudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL25vdGlmaWNhdGlvbnMudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3JhZGlvLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zaWduYXR1cmUudHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RlcHNfZm9ybS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkFib3V0IiwiQWJvdXQuY29uc3RydWN0b3IiLCJBYm91dC5zZXRMaXN0ZW4iLCJDYWxjdWxhdG9yIiwiQ2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlWFAiLCJDYWxjdWxhdG9yLmNhbGN1bGF0ZUxldmVsIiwiQ2FsY3VsYXRvci5nZXRJbmZvIiwiQ2FsY3VsYXRvci5sb2FkQ2FsYyIsIkNhbGN1bGF0b3IudXBkYXRlQ2FsYyIsIkNoYXRib3giLCJDaGF0Ym94LmNvbnN0cnVjdG9yIiwiQ2hhdGJveC5hZGRNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZSIsIkNoYXRib3guZGlzcGxheU1lc3NhZ2VzIiwiQ2hhdGJveC5lcnJvciIsIkNoYXRib3guZ2V0U3RhcnQiLCJDaGF0Ym94Lm1vZCIsIkNoYXRib3gubW9kVG9vbHMiLCJDaGF0Ym94LnBhbmVsQ2hhbm5lbHMiLCJDaGF0Ym94LnBhbmVsQ2hhdCIsIkNoYXRib3gucGFuZWxDbG9zZSIsIkNoYXRib3guc3VibWl0TWVzc2FnZSIsIkNoYXRib3guc3dpdGNoQ2hhbm5lbCIsIkNoYXRib3gudXBkYXRlIiwiQ2hhdGJveC51cGRhdGVUaW1lQWdvIiwiQ2xhbiIsIkNsYW4uY29uc3RydWN0b3IiLCJDbGFuLnNldExpc3RlbiIsImV4dGVuZCIsIkRpYWxvZ0Z4IiwiQ29tYmF0Q2FsY3VsYXRvciIsIkNvbWJhdENhbGN1bGF0b3IuY29uc3RydWN0b3IiLCJDb21iYXRDYWxjdWxhdG9yLmdldExldmVscyIsIkNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwiLCJDb21iYXRDYWxjdWxhdG9yLnZhbCIsIkNvbnRhY3QiLCJDb250YWN0LmNvbnN0cnVjdG9yIiwiQ29udGFjdC5kb25lIiwiQ29udGFjdC5lcnJvciIsIkNvbnRhY3Quc2VuZCIsIkNvbnRhY3QudmFsaWRhdGVFbWFpbCIsIkNvbnRhY3Qud2FybmluZyIsIkZvcnVtcyIsIkZvcnVtcy5jb25zdHJ1Y3RvciIsIkZvcnVtcy5kb3dudm90ZSIsIkZvcnVtcy5wb2xsVm90ZSIsIkZvcnVtcy51cHZvdGUiLCJQb3N0IiwiUG9zdC5jb25zdHJ1Y3RvciIsIlBvc3QucXVvdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUiLCJGb3J1bXNUaHJlYWRDcmVhdGUuY29uc3RydWN0b3IiLCJGb3J1bXNUaHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24iLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXIiLCJGb3J1bXNUaHJlYWRDcmVhdGUuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbiIsIkxpdmVzdHJlYW1SZXNldCIsIkxpdmVzdHJlYW1SZXNldC5jb25zdHJ1Y3RvciIsIkxpdmVzdHJlYW1SZXNldC5yZXNldCIsIkxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c2VzIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24iLCJSdW5lVGltZSIsIlJ1bmVUaW1lLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIiLCJOYW1lQ2hlY2tlci5jb25zdHJ1Y3RvciIsIk5hbWVDaGVja2VyLnNldEZvcm0iLCJOZXdzIiwiTmV3cy5jb25zdHJ1Y3RvciIsIk5ld3Muc2V0dXBBY3Rpb25zIiwiTmV3cy5zdWJtaXRDb21tZW50IiwiTmV3cy50b0NvbW1lbnRzIiwiTm90aWZpY2F0aW9ucyIsIk5vdGlmaWNhdGlvbnMuY29uc3RydWN0b3IiLCJSYWRpbyIsIlJhZGlvLmNvbnN0cnVjdG9yIiwiUmFkaW8ub3Blbkhpc3RvcnkiLCJSYWRpby5vcGVuVGltZXRhYmxlIiwiUmFkaW8ub25saW5lU2V0dGluZ3MiLCJSYWRpby5wdWxsSGlkZSIsIlJhZGlvLnB1bGxPcGVuIiwiUmFkaW8ucmFkaW9DbG9zZSIsIlJhZGlvLnJhZGlvT3BlbiIsIlJhZGlvLnJlcXVlc3RPcGVuIiwiUmFkaW8ucmVxdWVzdFNlbmQiLCJSYWRpby51cGRhdGUiLCJTaWduYXR1cmUiLCJTaWduYXR1cmUuY29uc3RydWN0b3IiLCJTaWdudXBGb3JtIiwiU2lnbnVwRm9ybS5jb25zdHJ1Y3RvciIsIlNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkiLCJTaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQiLCJTaWdudXBGb3JtLmNoZWNrU2VjdXJpdHkiLCJTaWdudXBGb3JtLnN1Ym1pdCIsIlNpZ251cEZvcm0udG9nZ2xlRmVlZGJhY2siLCJTdGFmZkxpc3QiLCJTdGFmZkxpc3QuY29uc3RydWN0b3IiLCJzdGVwc0Zvcm0iLCJVdGlsaXRpZXMiLCJVdGlsaXRpZXMuY29uc3RydWN0b3IiLCJVdGlsaXRpZXMuY3VycmVudFRpbWUiLCJVdGlsaXRpZXMuZm9ybVRva2VuIiwiVXRpbGl0aWVzLmdldEFKQVgiLCJVdGlsaXRpZXMuSlNPTkRlY29kZSIsIlV0aWxpdGllcy5wb3N0QUpBWCIsIlV0aWxpdGllcy5zY3JvbGxUbyIsIlV0aWxpdGllcy50aW1lQWdvIiwiVXRpbGl0aWVzLnBvc3QiXSwibWFwcGluZ3MiOiJBQUFBLElBQUksS0FBSyxDQUFDO0FBQ1YsSUFBTSxLQUFLO0lBQ1ZBLFNBREtBLEtBQUtBO1FBRVRDLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLCtCQUErQkEsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLElBQUlBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLGlDQUFpQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdEVBLElBQUlBLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLGtDQUFrQ0EsQ0FBQ0EsQ0FB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QkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzdCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQ2pDLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzNCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQzFCLFVBQVUsQ0FBQztnQkFDVixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNo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Q0FBQ0E7UUFDckNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVNSCxzQkFBSUEsR0FBWEE7UUFDQ0ksRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLHFDQUFxQ0EsQ0FBQ0EsQ0FBQ0E7UUFDekRBLENBQUNBO1FBRURBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQ3ZDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUN4Q0EsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFFNUNBLEFBQ0FBLGNBRGNBO1FBQ2RBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSx1Q0FBdUNBLENBQUNBLENBQUNBO1FBQzVEQSxDQUFDQTtRQUVEQSxJQUFJQSxJQUFJQSxHQUFHQTtZQUNWQSxRQUFRQSxFQUFFQSxPQUFPQTtZQUNqQkEsS0FBS0EsRUFBRUEsS0FBS0E7WUFDWkEsUUFBUUEsRUFBRUEsUUFBUUE7U0FDbEJBLENBQUNBO1FBQ0ZBLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENB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QSxDQUFDQTtnQkFFL0NBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ2xDQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUNEQSxJQUFJQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3hEQSxJQUFJQSxVQUFVQSxHQUFHQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqREEsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxPQUFPQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUUzQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFN0JBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtJQUNsQkEsQ0FBQ0E7SUFDTFQsZ0JBQUNBO0FBQURBLENBNUZBLEFBNEZDQSxJQUFBO0FBQ0QsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhYm91dDtcclxuY2xhc3MgQWJvdXQge1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHZhciBhZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWFkc11cIik7XHJcblx0XHR2YXIgcmFkaW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLXJhZGlvXVwiKTtcclxuXHRcdHZhciBmb3J1bXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWZvcnVtc11cIik7XHJcblx0XHR2YXIgZGlzY2xvc3VyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctZnVsbC1kaXNjbG9zdXJlXVwiKTtcclxuXHRcdHZhciBtZW1iZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1vdXItbWVtYmVyc11cIik7XHJcblx0XHR2YXIgY29tbXVuaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy1jb21tdW5pdHktb3Blbm5lc3NdXCIpO1xyXG5cclxuXHRcdHRoaXMuc2V0TGlzdGVuKGFkcyk7XHJcblx0XHR0aGlzLnNldExpc3RlbihyYWRpbyk7XHJcblx0XHR0aGlzLnNldExpc3Rlbihmb3J1bXMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oZGlzY2xvc3VyZSk7XHJcblx0XHR0aGlzLnNldExpc3RlbihtZW1iZXJzKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKGNvbW11bml0eSk7XHJcblx0XHRjb25zb2xlLmxvZygxKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW4oZGxndHJpZ2dlcikge1xyXG5cdFx0aWYoZGxndHJpZ2dlcikge1xyXG5cdFx0XHR2YXIgc29tZWRpYWxvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRsZ3RyaWdnZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWRpYWxvZycpKTtcclxuXHRcdFx0dmFyIGRsZyA9IG5ldyBEaWFsb2dGeChzb21lZGlhbG9nKTtcclxuXHRcdFx0ZGxndHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRsZy50b2dnbGUuYmluZChkbGcpKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJ2YXIgY2FsY3VsYXRvcjtcclxuY2xhc3MgQ2FsY3VsYXRvciB7XHJcbiAgICBjYWxjdWxhdG9yOiBhbnk7XHJcbiAgICBlbGVtZW50czogYW55ID0ge307XHJcbiAgICBpbmZvOiBhbnkgPSB7fTtcclxuICAgIFVSTDogYW55ID0ge307XHJcbiAgICBpdGVtczogYW55ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgY2FsYzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IHtcclxuICAgICAgICAgICAgY3VycmVudFhQOiAnI2NhbGN1bGF0b3ItY3VycmVudC14cCcsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnI2NhbGN1bGF0b3ItZGlzcGxheS1uYW1lJyxcclxuICAgICAgICAgICAgc3VibWl0OiAnI2NhbGN1bGF0b3Itc3VibWl0JyxcclxuICAgICAgICAgICAgdGFibGU6ICcjY2FsY3VsYXRvci10YWJsZSB0Ym9keScsXHJcbiAgICAgICAgICAgIHRhcmdldExldmVsOiAnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5VUkwgPSB7XHJcbiAgICAgICAgICAgIGdldENhbGM6ICcvY2FsY3VsYXRvcnMvbG9hZCcsXHJcbiAgICAgICAgICAgIGdldEluZm86ICcvZ2V0L2hpc2NvcmUnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmluZm8gPSB7XHJcbiAgICAgICAgICAgIGxldmVsQ3VycmVudDogMCxcclxuICAgICAgICAgICAgbGV2ZWxUYXJnZXQ6IDAsXHJcbiAgICAgICAgICAgIFhQQ3VycmVudDogMCxcclxuICAgICAgICAgICAgWFBUYXJnZXQ6IDBcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRvciA9IGNhbGM7XHJcbiAgICAgICAgJCh0aGlzLmVsZW1lbnRzLnN1Ym1pdCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0b3IuZ2V0SW5mbygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubG9hZENhbGMoKTtcclxuICAgICAgICAkKCcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnKS5rZXl1cChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNhbGN1bGF0b3IudXBkYXRlQ2FsYygpO1xyXG4gICAgICAgICAgICB9LCAyNSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cdGNhbGN1bGF0ZVhQKGxldmVsOiBudW1iZXIpIHtcclxuXHRcdHZhciB0b3RhbCA9IDAsXHJcblx0XHRcdGkgPSAwO1xyXG5cdFx0Zm9yIChpID0gMTsgaSA8IGxldmVsOyBpICs9IDEpIHtcclxuXHRcdFx0dG90YWwgKz0gTWF0aC5mbG9vcihpICsgMzAwICogTWF0aC5wb3coMiwgaSAvIDcuMCkpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIE1hdGguZmxvb3IodG90YWwgLyA0KTtcclxuXHR9XHJcblxyXG5cdGNhbGN1bGF0ZUxldmVsKHhwOiBudW1iZXIpIHtcclxuXHRcdHZhciB0b3RhbCA9IDAsXHJcblx0XHRcdGkgPSAwO1xyXG5cdFx0Zm9yIChpID0gMTsgaSA8IDEyMDsgaSArPSAxKSB7XHJcblx0XHRcdHRvdGFsICs9IE1hdGguZmxvb3IoaSArIDMwMCArIE1hdGgucG93KDIsIGkgLyA3KSk7XHJcblx0XHRcdGlmKE1hdGguZmxvb3IodG90YWwgLyA0KSA+IHhwKVxyXG5cdFx0XHRcdHJldHVybiBpO1xyXG5cdFx0XHRlbHNlIGlmKGkgPj0gOTkpXHJcblx0XHRcdFx0cmV0dXJuIDk5O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIHZhciBuYW1lID0gJCh0aGlzLmVsZW1lbnRzLmRpc3BsYXlOYW1lKS52YWwoKTtcclxuXHRcdHZhciBpbmZvID0gdXRpbGl0aWVzLmdldEFKQVgodGhpcy5VUkwuZ2V0SW5mbyArICcvJyArIG5hbWUpO1xyXG5cdFx0aW5mby5kb25lKGZ1bmN0aW9uKGluZm86IGFueSkge1xyXG5cdFx0XHRpbmZvID0gJC5wYXJzZUpTT04oaW5mbyk7XHJcblx0XHRcdHZhciByZWxldmFudCA9IGluZm9bMTNdO1xyXG5cdFx0XHRjYWxjdWxhdG9yLmluZm8ubGV2ZWxDdXJyZW50ID0gcmVsZXZhbnRbMV07XHJcblx0XHRcdGNhbGN1bGF0b3IuaW5mby5YUEN1cnJlbnQgPSByZWxldmFudFsyXTtcclxuXHRcdFx0JChjYWxjdWxhdG9yLmVsZW1lbnRzLmN1cnJlbnRYUCkudmFsKGNhbGN1bGF0b3IuaW5mby5YUEN1cnJlbnQpO1xyXG5cdFx0XHRpZigkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFyZ2V0TGV2ZWwpLnZhbCgpLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCQoY2FsY3VsYXRvci5lbGVtZW50cy50YXJnZXRMZXZlbCkudmFsKHBhcnNlSW50KGNhbGN1bGF0b3IuaW5mby5sZXZlbEN1cnJlbnQsIDEwKSArIDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhbGN1bGF0b3IudXBkYXRlQ2FsYygpO1xyXG5cdFx0fSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENhbGMoKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB7aWQ6IHRoaXMuY2FsY3VsYXRvcn07XHJcbiAgICAgICAgdmFyIGluZm8gPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwuZ2V0Q2FsYywgZGF0YSk7XHJcbiAgICAgICAgaW5mby5kb25lKGZ1bmN0aW9uKGluZm8pIHtcclxuICAgICAgICAgICAgaW5mbyA9IHV0aWxpdGllcy5KU09ORGVjb2RlKGluZm8pO1xyXG4gICAgICAgICAgICBjYWxjdWxhdG9yLml0ZW1zID0gaW5mbztcclxuICAgICAgICAgICAgJC5lYWNoKGNhbGN1bGF0b3IuaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dHI+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubmFtZSArIFwiPC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCArIFwiPC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS54cCArIFwiPC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+JmluZmluOzwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPC90cj5cIjtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSkuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVDYWxjKCkge1xyXG4gICAgICAgIHZhciBsZXZlbEN1cnJlbnQgPSAwLFxyXG4gICAgICAgICAgICBsZXZlbFRhcmdldCA9IDAsXHJcbiAgICAgICAgICAgIHhwQ3VycmVudCA9IDAsXHJcbiAgICAgICAgICAgIHhwVGFyZ2V0ID0gMCxcclxuICAgICAgICAgICAgZGlmZmVyZW5jZSA9IDAsXHJcbiAgICAgICAgICAgIGFtb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5pbmZvLmxldmVsVGFyZ2V0ID0gcGFyc2VJbnQoJCgnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJykudmFsKCkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuaW5mby5sZXZlbFRhcmdldCk7XHJcbiAgICAgICAgdGhpcy5pbmZvLlhQVGFyZ2V0ID0gdGhpcy5jYWxjdWxhdGVYUCh0aGlzLmluZm8ubGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgIGlmKHRoaXMuaW5mby5YUEN1cnJlbnQgPiB0aGlzLmluZm8uWFBUYXJnZXQpXHJcbiAgICAgICAgICAgIHRoaXMuaW5mby5YUFRhcmdldCA9IHRoaXMuY2FsY3VsYXRlWFAocGFyc2VJbnQodGhpcy5pbmZvLmxldmVsQ3VycmVudCwgMTApICsgMSk7XHJcbiAgICAgICAgbGV2ZWxDdXJyZW50ID0gdGhpcy5pbmZvLmxldmVsQ3VycmVudDtcclxuICAgICAgICBsZXZlbFRhcmdldCA9IHRoaXMuaW5mby5sZXZlbFRhcmdldDtcclxuICAgICAgICB4cEN1cnJlbnQgPSB0aGlzLmluZm8uWFBDdXJyZW50O1xyXG4gICAgICAgIHhwVGFyZ2V0ID0gdGhpcy5pbmZvLlhQVGFyZ2V0O1xyXG4gICAgICAgIGRpZmZlcmVuY2UgPSB4cFRhcmdldCAtIHhwQ3VycmVudDtcclxuICAgICAgICAkLmVhY2godGhpcy5pdGVtcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBhbW91bnQgPSBNYXRoLmNlaWwoZGlmZmVyZW5jZSAvIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLnhwKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gYW1vdW50IDwgMCA/IDAgOiBhbW91bnQ7XHJcbiAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpIHRkOm50aC1jaGlsZCg0KScpLmh0bWwoYW1vdW50KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLm5hbWUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxldmVsQ3VycmVudCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxldmVsVGFyZ2V0KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcblxcblxcblxcblxcblwiKTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZihjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCA8PSBsZXZlbEN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC1zdWNjZXNzJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCA+IGxldmVsQ3VycmVudCAmJiBsZXZlbFRhcmdldCA+PSBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LXdhcm5pbmcnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC1kYW5nZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwidmFyIGNoYXRib3g7XHJcbmNsYXNzIENoYXRib3gge1xyXG5cdGNoYW5uZWw6IHN0cmluZyA9ICcjcmFkaW8nO1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRsYXN0SWQ6IG51bWJlciA9IDA7XHJcblx0bWVzc2FnZXM6IGFueSA9IFtdO1xyXG5cdG1vZGVyYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHBpbm5lZDogYW55ID0gW107XHJcblx0dGltZXM6IGFueSA9IHt9O1xyXG5cdHRpbWVvdXRQaW5uZWQ6IGFueSA9IG51bGw7XHJcblx0dGltZW91dFVwZGF0ZTogYW55ID0gbnVsbDtcclxuXHRVUkw6IGFueSA9IHt9O1xyXG5cclxuXHRwaW5uZWREaXNwbGF5ZWQ6IGFueSA9IFtdO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY2hhbm5lbDogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0YWN0aW9uczogJyNjaGF0Ym94LWFjdGlvbnMnLFxyXG5cdFx0XHRjaGFubmVsczogJyNjaGF0Ym94LWNoYW5uZWxzJyxcclxuXHRcdFx0Y2hhdGJveDogJyNjaGF0Ym94JyxcclxuXHRcdFx0bWVzc2FnZTogJyNjaGF0Ym94LW1lc3NhZ2UnLFxyXG5cdFx0XHRtZXNzYWdlczogJyNjaGF0Ym94LW1lc3NhZ2VzJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMuVVJMID0ge1xyXG5cdFx0XHRnZXRTdGFydDogJy9jaGF0L3N0YXJ0JyxcclxuXHRcdFx0Z2V0VXBkYXRlOiAnL2NoYXQvdXBkYXRlJyxcclxuXHRcdFx0cG9zdE1lc3NhZ2U6ICcvY2hhdC9wb3N0L21lc3NhZ2UnLFxyXG5cdFx0XHRwb3N0U3RhdHVzQ2hhbmdlOiAnL2NoYXQvcG9zdC9zdGF0dXMvY2hhbmdlJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMudGltZXMgPSB7XHJcblx0XHRcdGxhc3RBY3Rpdml0eTogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCksXHJcblx0XHRcdGxhc3RSZWZyZXNoOiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKSxcclxuXHRcdFx0bG9hZGVkQXQ6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpXHJcblx0XHR9O1xyXG5cdFx0dmFyIG1vZGVyYXRvciA9IHV0aWxpdGllcy5nZXRBSkFYKCcvY2hhdC9tb2RlcmF0b3InKTtcclxuXHRcdG1vZGVyYXRvci5kb25lKGZ1bmN0aW9uKG1vZGVyYXRvcjogc3RyaW5nKSB7XHJcblx0XHRcdG1vZGVyYXRvciA9ICQucGFyc2VKU09OKG1vZGVyYXRvcik7XHJcblx0XHRcdGNoYXRib3gubW9kZXJhdG9yID0gbW9kZXJhdG9yLm1vZCA9PT0gdHJ1ZTtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5wYW5lbENoYXQoKTtcclxuXHRcdHRoaXMuZ2V0U3RhcnQoKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlKS5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRpZihlLndoaWNoID09PSAxMylcclxuXHRcdFx0XHRjaGF0Ym94LnN1Ym1pdE1lc3NhZ2UoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmNoYW5uZWxzKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC5wYW5lbENoYW5uZWxzKCk7XHJcblx0XHR9KTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0fSwgNTAwMCk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGVUaW1lQWdvKCk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhZGRNZXNzYWdlKG1lc3NhZ2U6IGFueSkge1xyXG5cdFx0aWYodGhpcy5sYXN0SWQgPCBtZXNzYWdlLmlkKSB7XHJcblx0XHRcdHRoaXMubGFzdElkID0gbWVzc2FnZS5pZDtcclxuXHRcdH1cclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzIDw9IDEpIHtcclxuXHRcdFx0dGhpcy5tZXNzYWdlc1t0aGlzLm1lc3NhZ2VzLmxlbmd0aF0gPSBtZXNzYWdlO1xyXG5cdFx0XHR0aGlzLnRpbWVzLmxhc3RBY3Rpdml0eSA9IHV0aWxpdGllcy5jdXJyZW50VGltZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpIHtcclxuXHRcdGlmKCFtZXNzYWdlKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBodG1sID0gXCJcIjtcclxuXHRcdGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gMSkge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLWhpZGRlbic+XCI7XHJcblx0XHR9IGVsc2UgaWYobWVzc2FnZS5zdGF0dXMgPT09IDIpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1waW5uZWQnPlwiO1xyXG5cdFx0fSBlbHNlIGlmKG1lc3NhZ2Uuc3RhdHVzID09PSAzKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctcGluaGlkJz5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyc+XCI7XHJcblx0XHR9XHJcblx0XHRodG1sICs9IFwiPHRpbWUgY2xhc3M9J3B1bGwtcmlnaHQnIGRhdGEtdHM9J1wiICsgbWVzc2FnZS5jcmVhdGVkX2F0ICsgXCInPlwiO1xyXG5cdFx0aHRtbCArPSB1dGlsaXRpZXMudGltZUFnbyhtZXNzYWdlLmNyZWF0ZWRfYXQpO1xyXG5cdFx0aHRtbCArPSBcIjwvdGltZT5cIjtcclxuXHRcdGh0bWwgKz0gXCI8cD5cIjtcclxuXHRcdGlmKGNoYXRib3gubW9kZXJhdG9yID09PSB0cnVlKSB7XHJcblx0XHRcdGh0bWwgKz0gQ2hhdGJveC5tb2RUb29scyhtZXNzYWdlKTtcclxuXHRcdH1cclxuXHRcdGh0bWwgKz0gXCI8YSBjbGFzcz0nbWVtYmVycy1cIiArIG1lc3NhZ2UuY2xhc3NfbmFtZSArIFwiJz5cIiArIG1lc3NhZ2UuYXV0aG9yX25hbWUgKyBcIjwvYT46IFwiICsgbWVzc2FnZS5jb250ZW50c19wYXJzZWQ7XHJcblx0XHRodG1sICs9IFwiPC9wPlwiO1xyXG5cdFx0aHRtbCArPSBcIjwvZGl2PlwiO1xyXG5cdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2VzKS5wcmVwZW5kKGh0bWwpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3BsYXlNZXNzYWdlcygpIHtcclxuXHRcdHZhciBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXM7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoJycpO1xyXG5cdFx0JC5lYWNoKG1lc3NhZ2VzLCBmdW5jdGlvbihpbmRleCwgbWVzc2FnZSkge1xyXG5cdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xyXG5cdFx0fSk7XHJcblx0XHQkLmVhY2godGhpcy5waW5uZWQsIGZ1bmN0aW9uKGluZGV4LCBtZXNzYWdlKSB7XHJcblx0XHRcdGlmKGNoYXRib3gucGlubmVkRGlzcGxheWVkW21lc3NhZ2UuaWRdICE9PSB0cnVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5waW5uZWREaXNwbGF5ZWRbbWVzc2FnZS5pZF0gPSB0cnVlO1xyXG5cdFx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y2hhdGJveC5waW5uZWREaXNwbGF5ZWQgPSBbXTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgZXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXRTdGFydCgpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuaHRtbCgnJyk7XHJcblx0XHR0aGlzLm1lc3NhZ2VzID0gW107XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0dGltZTogdGhpcy50aW1lcy5sb2FkZWRBdCxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJ2NoYXQvc3RhcnQnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0JC5lYWNoKHJlc3VsdHMubWVzc2FnZXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmFkZE1lc3NhZ2UodmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0Y2hhdGJveC5waW5uZWQgPSByZXN1bHRzLnBpbm5lZDtcclxuXHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZXMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG1vZChpZDogYW55LCBuZXdTdGF0dXM6IG51bWJlcikge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGlkOiBpZCxcclxuXHRcdFx0c3RhdHVzOiBuZXdTdGF0dXNcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgnL2NoYXQvc3RhdHVzLWNoYW5nZScsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3guZ2V0U3RhcnQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjaGF0Ym94LmVycm9yKFwiVGhlcmUgd2FzIGFuIGVycm9yIHdoaWxlIHBlcmZvcm1pbmcgdGhhdCBtb2RlcmF0aW9uIGNoYW5nZS5cIik7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIG1vZFRvb2xzKG1lc3NhZ2UpIHtcclxuXHRcdHZhciByZXMgPSBcIlwiO1xyXG5cdFx0cmVzICs9IFwiPHVsIGNsYXNzPSdsaXN0LWlubGluZSBpbmxpbmUnPlwiO1xyXG5cdFx0cmVzICs9IFwiPGxpPlwiO1xyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgJSAyID09PSAwKSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyArIDEpICsgXCIpOycgdGl0bGU9J0hpZGUgbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLW1pbnVzLWNpcmNsZSB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgLSAxKSArIFwiKTsnIHRpdGxlPSdTaG93IG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1wbHVzLWNpcmNsZSB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9XHJcblx0XHRyZXMgKz0gXCI8L2xpPlwiO1xyXG5cdFx0cmVzICs9IFwiPGxpPlwiO1xyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgPj0gMikge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgLSAyKSArIFwiKTsnIHRpdGxlPSdVbnBpbiBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtYXJyb3ctY2lyY2xlLWRvd24gdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzICsgMikgKyBcIik7JyB0aXRsZT0nUGluIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1hcnJvdy1jaXJjbGUtdXAgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fVxyXG5cdFx0cmVzICs9IFwiPC9saT5cIjtcclxuXHRcdHJlcyArPSBcIjwvdWw+XCI7XHJcblx0XHRyZXR1cm4gcmVzO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2hhbm5lbHMoKSB7XHJcblx0XHR2YXIgcmVzcG9uc2UgPSB1dGlsaXRpZXMuZ2V0QUpBWCgnL2NoYXQvY2hhbm5lbHMnKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0dmFyIGNvbnRlbnRzID0gXCJcIjtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1wb3B1cC1jaGFubmVscyc+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSdjbG9zZScgb25jbGljaz0nY2hhdGJveC5wYW5lbGNsb3NlKCk7Jz5DbG9zZSA8c3BhbiBhcmlhLWhpZGRlbj0ndHJ1ZSc+JnRpbWVzOzwvc3Bhbj48c3BhbiBjbGFzcz0nc3Itb25seSc+Q2xvc2U8L3NwYW4+PC9idXR0b24+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPGgzPkNoYW5uZWxzPC9oMz5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8cCBjbGFzcz0naG9sby10ZXh0Jz5DdXJyZW50bHkgb24gPGI+I1wiICsgY2hhdGJveC5jaGFubmVsICsgXCI8L2I+PC9wPlwiO1xyXG5cdFx0XHQkLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxhIG9uY2xpY2s9XFxcImNoYXRib3guc3dpdGNoQ2hhbm5lbCgnXCIgKyB2YWx1ZS5uYW1lICsgXCInKTtcXFwiPiNcIiArIHZhbHVlLm5hbWUgKyBcIjwvYT48YnIgLz5cIjtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxzcGFuIGNsYXNzPSdob2xvLXRleHQtc2Vjb25kYXJ5Jz5cIiArIHZhbHVlLm1lc3NhZ2VzICsgXCIgbWVzc2FnZXM8L3NwYW4+PGJyIC8+XCI7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8c3BhbiBjbGFzcz0naG9sby10ZXh0LXNlY29uZGFyeSc+TGFzdCBhY3RpdmUgXCIgKyB1dGlsaXRpZXMudGltZUFnbyh2YWx1ZS5sYXN0X21lc3NhZ2UpICsgXCI8L3NwYW4+PGJyIC8+XCI7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjwvZGl2PlwiO1xyXG5cdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDaGF0KCkge1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gXCJcIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1tZXNzYWdlcyc+PC9kaXY+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtYWN0aW9ucyc+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxhIGhyZWY9Jy90cmFuc3BhcmVuY3kvbWFya2Rvd24nIHRhcmdldD0nX2JsYW5rJyBpZD0nY2hhdGJveC1tYXJrZG93bic+TWFya2Rvd248L2E+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxhIGlkPSdjaGF0Ym94LWNoYW5uZWxzJz5DaGFubmVsczwvYT5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPC9kaXY+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nY2hhdGJveC1tZXNzYWdlJyAvPlwiO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmNoYXRib3gpLmh0bWwoY29udGVudHMpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2xvc2UoKSB7XHJcblx0XHR0aGlzLmdldFN0YXJ0KCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3VibWl0TWVzc2FnZSgpIHtcclxuXHRcdHZhciBjb250ZW50cyA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlKS52YWwoKSxcclxuXHRcdFx0bWVzc2FnZSxcclxuXHRcdFx0cmVzcG9uc2U7XHJcblx0XHRtZXNzYWdlID0ge1xyXG5cdFx0XHRjb250ZW50czogY29udGVudHMsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLnBvc3RNZXNzYWdlLCBtZXNzYWdlKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCcnKTtcclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2Utc2VudCcpO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLXNlbnQnKTtcclxuXHRcdFx0XHR9LCAxNTAwKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZihyZXNwb25zZS5lcnJvciA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1lvdSBhcmUgbm90IGxvZ2dlZCBpbiBhbmQgY2FuIG5vdCBzZW5kIG1lc3NhZ2VzLicpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXNwb25zZS5lcnJvciA9PT0gLTIpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1lvdSB3ZXJlIG11dGVkIGZvciBvbmUgaG91ciBieSBhIHN0YWZmIG1lbWJlciBhbmQgY2FuIG5vdCBzZW5kIG1lc3NhZ2VzLicpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdUaGVyZSB3YXMgYW4gdW5rbm93biBlcnJvci4gIFBsZWFzZSB0cnkgYWdhaW4uJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1iYWQnKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1iYWQnKTtcclxuXHRcdFx0XHR9LCAyNTAwKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3dpdGNoQ2hhbm5lbChuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBkYXRhLFxyXG5cdFx0XHRyZXNwb25zZTtcclxuXHRcdGRhdGEgPSB7XHJcblx0XHRcdGNoYW5uZWw6IG5hbWVcclxuXHRcdH07XHJcblx0XHRyZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCgnL2NoYXQvY2hhbm5lbHMvY2hlY2snLCBkYXRhKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLnZhbGlkKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5jaGFubmVsID0gbmFtZTtcclxuXHRcdFx0XHRjaGF0Ym94LmdldFN0YXJ0KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Vycm9yJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwZGF0ZSgpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRpZDogdGhpcy5sYXN0SWQsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5nZXRVcGRhdGUsIGRhdGEpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y2hhdGJveC50aW1lcy5sYXN0UmVmcmVzaCA9IHV0aWxpdGllcy5jdXJyZW50VGltZSgpO1xyXG5cdFx0XHRpZihyZXNwb25zZS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0XHRjaGF0Ym94LmFkZE1lc3NhZ2UodmFsdWUpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2VzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2xlYXJUaW1lb3V0KGNoYXRib3gudGltZW91dFVwZGF0ZSk7XHJcblx0XHRcdGNoYXRib3gudGltZW91dFVwZGF0ZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHRcdH0sIDEwMDAwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwZGF0ZVRpbWVBZ28oKSB7XHJcblx0XHR2YXIgbWVzc2FnZXMgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmZpbmQoJy5tc2cnKTtcclxuXHRcdCQuZWFjaChtZXNzYWdlcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHR2YXIgdGltZXN0YW1wID0gJCh2YWx1ZSkuZmluZCgndGltZScpLmF0dHIoJ2RhdGEtdHMnKTtcclxuXHRcdFx0JCh2YWx1ZSkuZmluZCgndGltZScpLmh0bWwodXRpbGl0aWVzLnRpbWVBZ28odGltZXN0YW1wKSk7XHJcblx0XHR9KTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZVRpbWVBZ28oKTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxufSIsInZhciBjbGFuO1xyXG5jbGFzcyBDbGFuIHtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR2YXIgd2FybmluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLXdhcm5pbmdzXVwiKTtcclxuXHRcdHZhciB0ZW1wQmFucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctdGVtcG9yYXJ5LWJhbnNdXCIpO1xyXG5cdFx0dmFyIGJhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZGlhbG9nPWNsYW4tZGlhbG9nLWJhbnNdXCIpO1xyXG5cclxuXHRcdHRoaXMuc2V0TGlzdGVuKHdhcm5pbmdzKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKHRlbXBCYW5zKTtcclxuXHRcdHRoaXMuc2V0TGlzdGVuKGJhbnMpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldExpc3RlbihkbGd0cmlnZ2VyKSB7XHJcblx0XHRpZihkbGd0cmlnZ2VyKSB7XHJcblx0XHRcdHZhciBzb21lZGlhbG9nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGxndHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGlhbG9nJykpO1xyXG5cdFx0XHR2YXIgZGxnID0gbmV3IERpYWxvZ0Z4KHNvbWVkaWFsb2cpO1xyXG5cdFx0XHRkbGd0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGxnLnRvZ2dsZS5iaW5kKGRsZykpO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsIi8qKlxyXG4gKiBkaWFsb2dGeC5qcyB2MS4wLjBcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE0LCBDb2Ryb3BzXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICovXHJcbjsoIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblxyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0dmFyIHN1cHBvcnQgPSB7IGFuaW1hdGlvbnMgOiBNb2Rlcm5penIuY3NzYW5pbWF0aW9ucyB9LFxyXG5cdFx0YW5pbUVuZEV2ZW50TmFtZXMgPSB7ICdXZWJraXRBbmltYXRpb24nIDogJ3dlYmtpdEFuaW1hdGlvbkVuZCcsICdPQW5pbWF0aW9uJyA6ICdvQW5pbWF0aW9uRW5kJywgJ21zQW5pbWF0aW9uJyA6ICdNU0FuaW1hdGlvbkVuZCcsICdhbmltYXRpb24nIDogJ2FuaW1hdGlvbmVuZCcgfSxcclxuXHRcdGFuaW1FbmRFdmVudE5hbWUgPSBhbmltRW5kRXZlbnROYW1lc1sgTW9kZXJuaXpyLnByZWZpeGVkKCAnYW5pbWF0aW9uJyApIF0sXHJcblx0XHRvbkVuZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKCBlbCwgY2FsbGJhY2sgKSB7XHJcblx0XHRcdHZhciBvbkVuZENhbGxiYWNrRm4gPSBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdFx0aWYoIHN1cHBvcnQuYW5pbWF0aW9ucyApIHtcclxuXHRcdFx0XHRcdGlmKCBldi50YXJnZXQgIT0gdGhpcyApIHJldHVybjtcclxuXHRcdFx0XHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggYW5pbUVuZEV2ZW50TmFtZSwgb25FbmRDYWxsYmFja0ZuICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKCBjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgKSB7IGNhbGxiYWNrLmNhbGwoKTsgfVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiggc3VwcG9ydC5hbmltYXRpb25zICkge1xyXG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoIGFuaW1FbmRFdmVudE5hbWUsIG9uRW5kQ2FsbGJhY2tGbiApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG9uRW5kQ2FsbGJhY2tGbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRmdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XHJcblx0XHRmb3IoIHZhciBrZXkgaW4gYiApIHtcclxuXHRcdFx0aWYoIGIuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG5cdFx0XHRcdGFba2V5XSA9IGJba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBEaWFsb2dGeCggZWwsIG9wdGlvbnMgKSB7XHJcblx0XHR0aGlzLmVsID0gZWw7XHJcblx0XHR0aGlzLm9wdGlvbnMgPSBleHRlbmQoIHt9LCB0aGlzLm9wdGlvbnMgKTtcclxuXHRcdGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRpb25zICk7XHJcblx0XHR0aGlzLmN0cmxDbG9zZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ1tkYXRhLWRpYWxvZy1jbG9zZV0nICk7XHJcblx0XHR0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cdH1cclxuXHJcblx0RGlhbG9nRngucHJvdG90eXBlLm9wdGlvbnMgPSB7XHJcblx0XHQvLyBjYWxsYmFja3NcclxuXHRcdG9uT3BlbkRpYWxvZyA6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblx0XHRvbkNsb3NlRGlhbG9nIDogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdH1cclxuXHJcblx0RGlhbG9nRngucHJvdG90eXBlLl9pbml0RXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gY2xvc2UgYWN0aW9uXHJcblx0XHR0aGlzLmN0cmxDbG9zZS5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpICk7XHJcblxyXG5cdFx0Ly8gZXNjIGtleSBjbG9zZXMgZGlhbG9nXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0dmFyIGtleUNvZGUgPSBldi5rZXlDb2RlIHx8IGV2LndoaWNoO1xyXG5cdFx0XHRpZigga2V5Q29kZSA9PT0gMjcgJiYgc2VsZi5pc09wZW4gKSB7XHJcblx0XHRcdFx0c2VsZi50b2dnbGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdHRoaXMuZWwucXVlcnlTZWxlY3RvciggJy5kaWFsb2dfX292ZXJsYXknICkuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy50b2dnbGUuYmluZCh0aGlzKSApO1xyXG5cdH1cclxuXHJcblx0RGlhbG9nRngucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0aWYoIHRoaXMuaXNPcGVuICkge1xyXG5cdFx0XHRjbGFzc2llLnJlbW92ZSggdGhpcy5lbCwgJ2RpYWxvZy0tb3BlbicgKTtcclxuXHRcdFx0Y2xhc3NpZS5hZGQoIHNlbGYuZWwsICdkaWFsb2ctLWNsb3NlJyApO1xyXG5cclxuXHRcdFx0b25FbmRBbmltYXRpb24oIHRoaXMuZWwucXVlcnlTZWxlY3RvciggJy5kaWFsb2dfX2NvbnRlbnQnICksIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKCBzZWxmLmVsLCAnZGlhbG9nLS1jbG9zZScgKTtcclxuXHRcdFx0fSApO1xyXG5cclxuXHRcdFx0Ly8gY2FsbGJhY2sgb24gY2xvc2VcclxuXHRcdFx0dGhpcy5vcHRpb25zLm9uQ2xvc2VEaWFsb2coIHRoaXMgKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjbGFzc2llLmFkZCggdGhpcy5lbCwgJ2RpYWxvZy0tb3BlbicgKTtcclxuXHJcblx0XHRcdC8vIGNhbGxiYWNrIG9uIG9wZW5cclxuXHRcdFx0dGhpcy5vcHRpb25zLm9uT3BlbkRpYWxvZyggdGhpcyApO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5pc09wZW4gPSAhdGhpcy5pc09wZW47XHJcblx0fTtcclxuXHJcblx0Ly8gYWRkIHRvIGdsb2JhbCBuYW1lc3BhY2VcclxuXHR3aW5kb3cuRGlhbG9nRnggPSBEaWFsb2dGeDtcclxuXHJcbn0pKCB3aW5kb3cgKTsiLCJ2YXIgY29tYmF0Q2FsY3VsYXRvcjtcclxuY2xhc3MgQ29tYmF0Q2FsY3VsYXRvciB7XHJcblx0Y2xpY2tzOiBhbnkgPSB7fTtcclxuXHRnZW5lcmF0ZTogYW55ID0ge307XHJcblx0aW5wdXRzOiBhbnkgPSB7fTtcclxuXHRvdGhlcjogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5jbGlja3MgPSB7XHJcblx0XHRcdHN1Ym1pdDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VibWl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuZ2VuZXJhdGUgPSB7XHJcblx0XHRcdGxldmVsOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpsZXZlbCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmlucHV0cyA9IHtcclxuXHRcdFx0YXR0YWNrOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjphdHRhY2snXVwiLFxyXG5cdFx0XHRkZWZlbmNlOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpkZWZlbmNlJ11cIixcclxuXHRcdFx0c3RyZW5ndGg6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN0cmVuZ3RoJ11cIixcclxuXHRcdFx0Y29uc3RpdHV0aW9uOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpjb25zdGl0dXRpb24nXVwiLFxyXG5cdFx0XHRyYW5nZWQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnJhbmdlZCddXCIsXHJcblx0XHRcdHByYXllcjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6cHJheWVyJ11cIixcclxuXHRcdFx0bWFnaWM6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm1hZ2ljJ11cIixcclxuXHRcdFx0c3VtbW9uaW5nOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdW1tb25pbmcnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5vdGhlciA9IHtcclxuXHRcdFx0bmFtZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bmFtZSddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRsb2FkQ29tYmF0OiAnL2NhbGN1bGF0b3JzL2NvbWJhdC9sb2FkJ1xyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5pbnB1dHMuYXR0YWNrKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5kZWZlbmNlKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdHJlbmd0aCkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuY29uc3RpdHV0aW9uKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5yYW5nZWQpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnByYXllcikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMubWFnaWMpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnN1bW1vbmluZykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5jbGlja3Muc3VibWl0KS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29tYmF0Q2FsY3VsYXRvci5nZXRMZXZlbHMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRnZXRMZXZlbHMoKSB7XHJcblx0XHR2YXIgbmFtZSA9ICQodGhpcy5vdGhlci5uYW1lKS52YWwoKSxcclxuXHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHRyc246IG5hbWVcclxuXHRcdFx0fSxcclxuXHRcdFx0bGV2ZWxzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMubG9hZENvbWJhdCwgZGF0YSk7XHJcblx0XHRsZXZlbHMuZG9uZShmdW5jdGlvbihsZXZlbHMpIHtcclxuXHRcdFx0bGV2ZWxzID0gJC5wYXJzZUpTT04obGV2ZWxzKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5hdHRhY2spLnZhbChsZXZlbHMuYXR0YWNrKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5kZWZlbmNlKS52YWwobGV2ZWxzLmRlZmVuY2UpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN0cmVuZ3RoKS52YWwobGV2ZWxzLnN0cmVuZ3RoKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5jb25zdGl0dXRpb24pLnZhbChsZXZlbHMuY29uc3RpdHV0aW9uKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5yYW5nZWQpLnZhbChsZXZlbHMucmFuZ2VkKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5wcmF5ZXIpLnZhbChsZXZlbHMucHJheWVyKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5tYWdpYykudmFsKGxldmVscy5tYWdpYyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuc3VtbW9uaW5nKS52YWwobGV2ZWxzLnN1bW1vbmluZyk7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHR1cGRhdGVMZXZlbCgpIHtcclxuXHRcdHZhciBtZWxlZSA9IHRoaXMudmFsKCdhdHRhY2snKSArIHRoaXMudmFsKCdzdHJlbmd0aCcpO1xyXG5cdFx0dmFyIG1hZ2ljID0gMiAqIHRoaXMudmFsKCdtYWdpYycpO1xyXG5cdFx0dmFyIHJhbmdlZCA9IDIgKiB0aGlzLnZhbCgncmFuZ2VkJyk7XHJcblx0XHR2YXIgZGVmID0gdGhpcy52YWwoJ2RlZmVuY2UnKSArIHRoaXMudmFsKCdjb25zdGl0dXRpb24nKTtcclxuXHRcdHZhciBvdGhlciA9ICguNSAqIHRoaXMudmFsKCdwcmF5ZXInKSkgKyAoLjUgKiB0aGlzLnZhbCgnc3VtbW9uaW5nJykpO1xyXG5cdFx0dmFyIGxldmVsID0gKDEzLzEwKSAqIE1hdGgubWF4KG1lbGVlLCBtYWdpYywgcmFuZ2VkKSArIGRlZiArIG90aGVyO1xyXG5cdFx0bGV2ZWwgKj0gLjI1O1xyXG5cdFx0bGV2ZWwgPSBNYXRoLmZsb29yKGxldmVsKTtcclxuXHRcdCQodGhpcy5nZW5lcmF0ZS5sZXZlbCkuaHRtbChsZXZlbCk7XHJcblx0fVxyXG5cdHZhbChuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHJldHVybiBwYXJzZUludCgkKFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOlwiICsgbmFtZSArIFwiJ11cIikudmFsKCkpO1xyXG5cdH1cclxufSIsInZhciBjb250YWN0O1xyXG5jbGFzcyBDb250YWN0IHtcclxuXHRkYXRhOiBhbnkgPSB7fTtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0aG9va3M6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7XHJcblx0XHRcdHNlbnQ6IGZhbHNlXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0ZW1haWw6ICcjY29udGFjdC1lbWFpbCcsXHJcblx0XHRcdGVycm9yOiAnI2NvbnRhY3QtZXJyb3InLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NvbnRhY3QtbWVzc2FnZScsXHJcblx0XHRcdHVzZXJuYW1lOiAnI2NvbnRhY3QtdXNlcm5hbWUnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0c3VibWl0OiBcIltydC1ob29rPSdjb250YWN0OnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRmb3JtOiAnL2NvbnRhY3Qvc3VibWl0J1xyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5ob29rcy5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb250YWN0LnNlbmQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRvbmUobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LWRhbmdlclwiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZW5kKCkge1xyXG5cdFx0aWYodGhpcy5kYXRhLnNlbnQgPT09IHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZG9uZShcIllvdSBoYXZlIGFscmVhZHkgc2VudCB5b3VyIG1lc3NhZ2UhXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBlbWFpbCA9ICQodGhpcy5lbGVtZW50cy5lbWFpbCkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdHVzZXJuYW1lID0gJCh0aGlzLmVsZW1lbnRzLnVzZXJuYW1lKS52YWwoKTtcclxuXHJcblx0XHQvLyBDaGVjayBlbWFpbFxyXG5cdFx0aWYodGhpcy52YWxpZGF0ZUVtYWlsKGVtYWlsKSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZXJyb3IoXCJUaGF0IGlzIG5vdCBhIHZhbGlkYXRlIGVtYWlsIGFkZHJlc3MuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogbWVzc2FnZSxcclxuXHRcdFx0ZW1haWw6IGVtYWlsLFxyXG5cdFx0XHR1c2VybmFtZTogdXNlcm5hbWVcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmZvcm0sIGRhdGEpO1xyXG5cdFx0dGhpcy53YXJuaW5nKFwiU2VuZGluZyBtZXNzYWdlLi4uXCIpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNvbnRhY3QuZGF0YS5zZW50ID0gdHJ1ZTtcclxuXHRcdFx0XHRjb250YWN0LmRvbmUoXCJZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudC5cIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29udGFjdC5lcnJvcihcIlRoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yIHdoaWxlIHNlbmRpbmcgeW91ciBtZXNzYWdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBhbnkpIHtcclxuXHRcdHZhciByZSA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG5cdFx0cmV0dXJuIHJlLnRlc3QoZW1haWwpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHdhcm5pbmcobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LXdhcm5pbmdcIik7XHJcblx0fVxyXG59IiwidmFyIGZvcnVtcztcclxuY2xhc3MgRm9ydW1zIHtcclxuXHRwdWJsaWMgZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcG9zdDogUG9zdCA9IG51bGw7XHJcblx0cHVibGljIHRocmVhZENyZWF0ZTogRm9ydW1zVGhyZWFkQ3JlYXRlID0gbnVsbDtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHQncG9zdEVkaXRvcic6IFwiW3J0LWRhdGE9J3Bvc3QuZWRpdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRwb2xsOiB7XHJcblx0XHRcdFx0dm90ZTogXCJbcnQtaG9vaz0nZm9ydW06cG9sbC52b3RlJ11cIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0cG9sbDoge1xyXG5cdFx0XHRcdHZvdGU6ICcvZm9ydW1zL3BvbGwvdm90ZSdcclxuXHRcdFx0fSxcclxuXHRcdFx0dm90ZTogZnVuY3Rpb24oaWQ6IG51bWJlcikgeyByZXR1cm4gJy9mb3J1bXMvcG9zdC8nICsgaWQgKyAnL3ZvdGUnOyB9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wb3N0ID0gbmV3IFBvc3QoKTtcclxuXHRcdCQoJy51cHZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLnVwdm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcuZG93bnZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLmRvd252b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5wb3N0OnF1b3RlJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGlkID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRmb3J1bXMucG9zdC5xdW90ZShpZCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5ob29rcy5wb2xsLnZvdGUpLmNsaWNrKGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9ICQoZS50YXJnZXQpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0XHRmb3J1bXMucG9sbFZvdGUoZGF0YS5xdWVzdGlvbiwgZGF0YS5hbnN3ZXIpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZG93bnZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ2Rvd24nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcG9sbFZvdGUocXVlc3Rpb25JZDogbnVtYmVyLCBhbnN3ZXJJZDogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0YW5zd2VyOiBhbnN3ZXJJZCxcclxuXHRcdFx0cXVlc3Rpb246IHF1ZXN0aW9uSWRcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnBvbGwudm90ZSwgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnJlcGxhY2Uod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZihyZXN1bHRzLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0Ly8gVGhlIHVzZXIgd2FzIG5vdCBsb2dnZWQgaW5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gVW5rbm93biBlcnJvclxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvLyBUT0RPOiBNYWtlIGFuIGVycm9yIGRpdlxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cHZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzRG93bnZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQndm90ZSc6ICd1cCdcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuY2xhc3MgUG9zdCB7XHJcblx0cHVibGljIHF1b3RlKGlkOiBhbnkpIHtcclxuXHRcdHZhciBzb3VyY2UgPSAkKFwiW3J0LWRhdGE9J3Bvc3QjXCIgKyBpZCArXCI6c291cmNlJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRwb3N0Q29udGVudHMgPSAkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwoKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC9cXG4vZywgJ1xcbj4nKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mbHQ7L2csICc8Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xyXG5cdFx0c291cmNlID0gXCI+XCIgKyBzb3VyY2U7XHJcblx0XHRpZihwb3N0Q29udGVudHMubGVuZ3RoID4gMClcclxuXHRcdFx0cG9zdENvbnRlbnRzICs9IFwiXFxuXCI7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwocG9zdENvbnRlbnRzICsgc291cmNlICsgXCJcXG5cIik7XHJcblx0XHR1dGlsaXRpZXMuc2Nyb2xsVG8oJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvciksIDEwMDApO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikuZm9jdXMoKTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEZvcnVtc1RocmVhZENyZWF0ZSB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcXVlc3Rpb25zOiBBcnJheSA9IFtdO1xyXG5cdHB1YmxpYyB2YWx1ZXM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyB2aWV3czogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25BZGQ6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24uYWRkJ11cIixcclxuXHRcdFx0cXVlc3Rpb25zOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9ucyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnF1ZXN0aW9ucyA9IEFycmF5KDUwMCk7XHJcblx0XHR0aGlzLnZhbHVlcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25zOiAwXHJcblx0XHR9O1xyXG5cdFx0dGhpcy52aWV3cyA9IHtcclxuXHRcdFx0YW5zd2VyOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwuYW5zd2VyJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRxdWVzdGlvbjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uJ11cIikuaHRtbCgpXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9uQWRkKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLmFkZFF1ZXN0aW9uKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHVibGljIGFkZFF1ZXN0aW9uKCkge1xyXG5cdFx0dmFyIGh0bWwgPSB0aGlzLnZpZXdzLnF1ZXN0aW9uO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9ucykuYXBwZW5kKGh0bWwpO1xyXG5cdFx0dGhpcy52YWx1ZXMucXVlc3Rpb25zICs9IDE7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVtb3ZlUXVlc3Rpb24obnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdHRoaXMucXVlc3Rpb25zLnNwbGljZShudW1iZXIsIDEpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldExpc3RlbmVyKGVsZW1lbnQsIHR5cGUpIHtcclxuXHRcdGlmKHR5cGUgPT09IFwicmVtb3ZlIHF1ZXN0aW9uXCIpIHtcclxuXHRcdFx0dGhpcy5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQ6IGFueSkge1xyXG5cdFx0JChlbGVtZW50KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLnJlbW92ZVF1ZXN0aW9uKCQoZWxlbWVudCkucGFyZW50KCkucGFyZW50KCkuYXR0cigncnQtZGF0YScpKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHRmb3J1bXMgPSBuZXcgRm9ydW1zKCk7XHJcbn0pOyIsImNsYXNzIExpdmVzdHJlYW1SZXNldCB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgbGFuZzogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRub3RlOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0Om5vdGUnXVwiLFxyXG5cdFx0XHRzcGlubmVyOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnNwaW5uZXInXVwiLFxyXG5cdFx0XHRzdGF0dXM6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3RhdHVzJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMubGFuZyA9IHtcclxuXHRcdFx0Y2hlY2tpbmc6ICdjaGVja2luZycsXHJcblx0XHRcdG9mZmxpbmU6ICdvZmZsaW5lJyxcclxuXHRcdFx0b25saW5lOiAnb25saW5lJyxcclxuXHRcdFx0dW5rbm93bjogJ3Vua25vd24nXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0cmVzZXQ6ICcvbGl2ZXN0cmVhbS9yZXNldCdcclxuXHRcdH07XHJcblx0XHR0aGlzLnJlc2V0KCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlc2V0KCkge1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAxfSk7XHJcblx0XHR2YXIgc3RhdHVzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucmVzZXQsIHt9KTtcclxuXHRcdHN0YXR1cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gdXRpbGl0aWVzLkpTT05EZWNvZGUocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMub25saW5lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09ubGluZSgpO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVzdWx0cy5vbmxpbmUgPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93bigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNwaW5uZXJSZW1vdmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3Bpbm5lcikuY3NzKHtcclxuXHRcdFx0b3BhY2l0eTogMFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzZXMoY2hlY2tpbmc6IHN0cmluZywgb25saW5lOiBzdHJpbmcsIG9mZmxpbmU6IHN0cmluZywgdW5rbm93bjogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmxhbmcuY2hlY2tpbmcgPSBjaGVja2luZztcclxuXHRcdHRoaXMubGFuZy5vZmZsaW5lID0gb2ZmbGluZTtcclxuXHRcdHRoaXMubGFuZy5vbmxpbmUgPSBvbmxpbmU7XHJcblx0XHR0aGlzLmxhbmcudW5rbm93biA9IHVua25vd247XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT2ZmbGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvZmZsaW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1kYW5nZXInKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPbmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib25saW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzVW5rbm93bigpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJ1bmtub3duXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC13YXJuaW5nJyk7XHJcblx0fVxyXG59IiwidmFyIHJ1bmV0aW1lO1xyXG5jbGFzcyBSdW5lVGltZSB7XHJcblx0bG9hZGluZzpzdHJpbmcgPSAnI2xvYWRpbmcnO1xyXG59XHJcbnJ1bmV0aW1lID0gbmV3IFJ1bmVUaW1lKCk7XHJcbiQoZnVuY3Rpb24gKCkge1xyXG5cdFwidXNlIHN0cmljdFwiO1xyXG5cdCQoJ1tkYXRhLXRvZ2dsZV0nKS50b29sdGlwKCk7XHJcblx0JCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCk7XHJcblx0JCgndGJvZHkucm93bGluaycpLnJvd2xpbmsoKTtcclxuXHQkKCcjdG9wJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0JCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG5cdFx0XHRzY3JvbGxUb3A6IDBcclxuXHRcdH0sIDEwMDApO1xyXG5cdH0pO1xyXG5cdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGhlaWdodCA9ICQoJ2JvZHknKS5oZWlnaHQoKSxcclxuXHRcdFx0c2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxyXG5cdFx0XHR0b3AgPSAkKCcjdG9wJyk7XHJcblx0XHRpZihzY3JvbGwgPiBoZWlnaHQvMTApIHtcclxuXHRcdFx0aWYoISQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVJbigyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYoJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZU91dCgyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdCQoJy5uYXZiYXIgLmRyb3Bkb3duJykuaG92ZXIoZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDUwKS5zbGlkZURvd24oKTtcclxuXHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuZGVsYXkoMTAwKS5zbGlkZVVwKClcclxuXHR9KTtcclxufSk7XHJcblxyXG52YXIgdG9nZ2xlU2VhcmNoO1xyXG4vKipcclxuICogVHltcGFudXMgY29kcm9wc1xyXG4gKiBNb3JwaCBzZWFyY2hcclxuICovXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0dmFyIG1vcnBoU2VhcmNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdtb3JwaHNlYXJjaCcgKSxcclxuXHRcdGlucHV0ID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3RvciggJ2lucHV0Lm1vcnBoc2VhcmNoLWlucHV0JyApLFxyXG5cdFx0Y3RybENsb3NlID0gbW9ycGhTZWFyY2gucXVlcnlTZWxlY3RvciggJ3NwYW4ubW9ycGhzZWFyY2gtY2xvc2UnICksXHJcblx0XHRpc09wZW4gPSBmYWxzZTtcclxuXHQvLyBzaG93L2hpZGUgc2VhcmNoIGFyZWFcclxuXHR0b2dnbGVTZWFyY2ggPSBmdW5jdGlvbihhY3Rpb24pIHtcclxuXHRcdFx0dmFyIG9mZnNldHMgPSBtb3JwaHNlYXJjaC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHRcdFx0aWYoIGFjdGlvbiA9PT0gJ2Nsb3NlJyApIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZSggbW9ycGhTZWFyY2gsICdvcGVuJyApO1xyXG5cclxuXHRcdFx0XHQvLyB0cmljayB0byBoaWRlIGlucHV0IHRleHQgb25jZSB0aGUgc2VhcmNoIG92ZXJsYXkgY2xvc2VzXHJcblx0XHRcdFx0Ly8gdG9kbzogaGFyZGNvZGVkIHRpbWVzLCBzaG91bGQgYmUgZG9uZSBhZnRlciB0cmFuc2l0aW9uIGVuZHNcclxuXHRcdFx0XHRpZiggaW5wdXQudmFsdWUgIT09ICcnICkge1xyXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0Y2xhc3NpZS5hZGQoIG1vcnBoU2VhcmNoLCAnaGlkZUlucHV0JyApO1xyXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGNsYXNzaWUucmVtb3ZlKCBtb3JwaFNlYXJjaCwgJ2hpZGVJbnB1dCcgKTtcclxuXHRcdFx0XHRcdFx0XHRpbnB1dC52YWx1ZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHR9LCAzMDAgKTtcclxuXHRcdFx0XHRcdH0sIDUwMCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpbnB1dC5ibHVyKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQoIG1vcnBoU2VhcmNoLCAnb3BlbicgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpc09wZW4gPSAhaXNPcGVuO1xyXG5cdFx0fTtcclxuXHJcblx0Ly8gZXZlbnRzXHJcblx0Y3RybENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRvZ2dsZVNlYXJjaCApO1xyXG5cdC8vIGVzYyBrZXkgY2xvc2VzIHNlYXJjaCBvdmVybGF5XHJcblx0Ly8ga2V5Ym9hcmQgbmF2aWdhdGlvbiBldmVudHNcclxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdGlmKCBrZXlDb2RlID09PSAyNyAmJiBpc09wZW4gKSB7XHJcblx0XHRcdHRvZ2dsZVNlYXJjaChldik7XHJcblx0XHR9XHJcblx0fSApO1xyXG5cclxuXHJcblx0LyoqKioqIGZvciBkZW1vIHB1cnBvc2VzIG9ubHk6IGRvbid0IGFsbG93IHRvIHN1Ym1pdCB0aGUgZm9ybSAqKioqKi9cclxuXHRtb3JwaFNlYXJjaC5xdWVyeVNlbGVjdG9yKCAnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nICkuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgZnVuY3Rpb24oZXYpIHsgZXYucHJldmVudERlZmF1bHQoKTsgfSApO1xyXG59KTtcclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0JCgnI3NlYXJjaC1nbGFzcycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGZvcm0gPSAkKFwiI21vcnBoc2VhcmNoXCIpO1xyXG5cdFx0dmFyIGlucHV0ID0gJChcIi5tb3JwaHNlYXJjaC1pbnB1dFwiKTtcclxuXHRcdGlmKCQoZm9ybSkuY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnKSB7XHJcblx0XHRcdCQoZm9ybSkuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKGZvcm0pLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dG9nZ2xlU2VhcmNoKCdmb2N1cycpO1xyXG5cdH0pO1xyXG5cdCQoJy5tb3JwaHNlYXJjaC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGZvcm0gPSAkKFwiI21vcnBoc2VhcmNoXCIpO1xyXG5cdFx0JChmb3JtKS5hbmltYXRlKHtcclxuXHRcdFx0b3BhY2l0eTogMFxyXG5cdFx0fSwgNTAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRvZ2dsZVNlYXJjaCgnY2xvc2UnKTtcclxuXHRcdH0sIDUwMCk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKFwiI21vcnBoc2VhcmNoXCIpLmNzcyh7XHJcblx0XHRcdFx0b3BhY2l0eTogMVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0JChcIi5tb3JwaHNlYXJjaFwiKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdub25lJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH0pXHJcbn0pOyIsInZhciBuYW1lQ2hlY2tlcjtcclxuY2xhc3MgTmFtZUNoZWNrZXIge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRmb3JtOiBhbnkgPSB7fTtcclxuXHRub3RBbGxvd2VkOiBhbnkgPSBbXTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhdmFpbGFiaWxpdHk6ICcjcnNuLWF2YWlsYWJpbGl0eScsXHJcblx0XHRcdGNoZWNrOiAnI3Jzbi1jaGVjay1maWVsZCdcclxuXHRcdH07XHJcblx0XHR0aGlzLm5vdEFsbG93ZWQgPSBbJ1puVmphdz09JywgJ2MyaHBkQT09J107XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjaGVjazogJy9uYW1lLWNoZWNrJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMuc2V0Rm9ybSgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldEZvcm0oKSB7XHJcblx0XHR0aGlzLmZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZWNoZWNrZXItZm9ybScpO1xyXG5cdFx0bmV3IHN0ZXBzRm9ybSggdGhpcy5mb3JtLCB7XHJcblx0XHRcdG9uU3VibWl0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgdXNlcm5hbWUgPSAkKCcjcTEnKS52YWwoKTtcclxuXHRcdFx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0XHRcdHJzbjogdXNlcm5hbWVcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKG5hbWVDaGVja2VyLnBhdGhzLmNoZWNrLCBkYXRhKTtcclxuXHRcdFx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdFx0XHR2YXIgY2xhc3NTZXQgPSBuYW1lQ2hlY2tlci5mb3JtLnF1ZXJ5U2VsZWN0b3IoJy5zaW1mb3JtLWlubmVyJyk7XHJcblx0XHRcdFx0XHRjbGFzc2llLmFkZENsYXNzKGNsYXNzU2V0LCdoaWRlJyk7XHJcblx0XHRcdFx0XHR2YXIgZWwgPSBuYW1lQ2hlY2tlci5mb3JtLnF1ZXJ5U2VsZWN0b3IoJy5maW5hbC1tZXNzYWdlJyk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIG1lc3NhZ2UgPSAnVGhlIFJ1bmVzY2FwZSBuYW1lIDxiPicgKyB1c2VybmFtZSArICc8L2I+IGlzICc7XHJcblx0XHRcdFx0XHRpZihyZXN1bHRzLnN1YnN0cmluZygwLCA2KSA9PT0gXCI8aHRtbD5cIikge1xyXG5cdFx0XHRcdFx0XHRtZXNzYWdlICs9ICdhdmFpbGFibGUuJztcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2UgKz0gJ3VuYXZhaWxhYmxlLic7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bWVzc2FnZSArPSBcIjxiciAvPjxhIGhyZWY9Jy9uYW1lLWNoZWNrJyBjbGFzcz0nYnRuIGJ0bi1wcmltYXJ5Jz5TZWFyY2ggQWdhaW48L2E+XCI7XHJcblxyXG5cdFx0XHRcdFx0ZWwuaW5uZXJIVE1MID0gbWVzc2FnZTtcclxuXHJcblx0XHRcdFx0XHRjbGFzc2llLmFkZENsYXNzKGVsLCAnc2hvdycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fVxyXG59IiwidmFyIG5ld3M7XHJcbmNsYXNzIE5ld3Mge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRob29rczogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IHtcclxuXHRcdFx0XHRjb250ZW50czogXCIjbmV3cy1jb21tZW50LXRleHRhcmVhXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IHtcclxuXHRcdFx0XHRzdWJtaXQ6IFwiW3J0LWhvb2s9J25ld3MuYXJ0aWNsZTpjb21tZW50LnN1Ym1pdCddXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IGZ1bmN0aW9uKGlkOiBhbnkpIHtcclxuXHRcdFx0XHRyZXR1cm4gXCIvbmV3cy9cIiArIGlkICsgXCItbmFtZS9yZXBseVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3ZlcmxheScpO1xyXG5cdFx0dmFyIG92ZXJsYXlDbG9zZSA9IG92ZXJsYXkucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XHJcblx0XHR2YXIgaGVhZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlYWRlcicpO1xyXG5cdFx0dmFyIHN3aXRjaEJ0bm4gPSBoZWFkZXIucXVlcnlTZWxlY3RvcignYnV0dG9uLnNsaWRlci1zd2l0Y2gnKTtcclxuXHRcdHZhciB0b2dnbGVCdG5uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKHNsaWRlc2hvdy5pc0Z1bGxzY3JlZW4pIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChzd2l0Y2hCdG5uLCAndmlldy1tYXhpJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoc3dpdGNoQnRubiwgJ3ZpZXctbWF4aScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHRvZ2dsZUN0cmxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFzbGlkZXNob3cuaXNDb250ZW50KSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQoaGVhZGVyLCAnaGlkZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHRvZ2dsZUNvbXBsZXRlQ3RybHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoIXNsaWRlc2hvdy5pc0NvbnRlbnQpIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZShoZWFkZXIsICdoaWRlJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgc2xpZGVzaG93ID0gbmV3IERyYWdTbGlkZXNob3coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlc2hvdycpLCB7XHJcblx0XHRcdC8vIHRvZ2dsZSBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG1pbmltaXplZCBzbGlkZXNob3dcclxuXHRcdFx0b25Ub2dnbGU6IHRvZ2dsZUJ0bm4sXHJcblx0XHRcdC8vIHRvZ2dsZSB0aGUgbWFpbiBpbWFnZSBhbmQgdGhlIGNvbnRlbnQgdmlld1xyXG5cdFx0XHRvblRvZ2dsZUNvbnRlbnQ6IHRvZ2dsZUN0cmxzLFxyXG5cdFx0XHQvLyB0b2dnbGUgdGhlIG1haW4gaW1hZ2UgYW5kIHRoZSBjb250ZW50IHZpZXcgKHRyaWdnZXJlZCBhZnRlciB0aGUgYW5pbWF0aW9uIGVuZHMpXHJcblx0XHRcdG9uVG9nZ2xlQ29udGVudENvbXBsZXRlOiB0b2dnbGVDb21wbGV0ZUN0cmxzXHJcblx0XHR9KTtcclxuXHRcdHZhciB0b2dnbGVTbGlkZXNob3cgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2xpZGVzaG93LnRvZ2dsZSgpO1xyXG5cdFx0XHR0b2dnbGVCdG5uKCk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGNsb3NlT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjbGFzc2llLmFkZChvdmVybGF5LCAnaGlkZScpO1xyXG5cdFx0fTtcclxuXHRcdC8vIHRvZ2dsZSBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIHNtYWxsIHNsaWRlc2hvd1xyXG5cdFx0c3dpdGNoQnRubi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZVNsaWRlc2hvdyk7XHJcblx0XHQvLyBjbG9zZSBvdmVybGF5XHJcblx0XHRvdmVybGF5Q2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZU92ZXJsYXkpO1xyXG5cclxuXHRcdGlmKGxvY2FsU3RvcmFnZSkge1xyXG5cdFx0XHR2YXIgc2hvd2VkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ25ld3MuaW5mby5zaG93ZWQnKTtcclxuXHRcdFx0aWYoc2hvd2VkID09PSAndHJ1ZScpIHtcclxuXHRcdFx0XHRjbG9zZU92ZXJsYXkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuc2V0dXBBY3Rpb25zKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0dXBBY3Rpb25zKCkge1xyXG5cdFx0JChcImRpdi5pbmZvIGJ1dHRvblwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYobG9jYWxTdG9yYWdlKSB7XHJcblx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25ld3MuaW5mby5zaG93ZWQnLCAndHJ1ZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5ob29rcy5jb21tZW50LnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0dmFyIGNvbnRlbnRzID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCgndGV4dGFyZWEnKS52YWwoKTtcclxuXHRcdFx0bmV3cy5zdWJtaXRDb21tZW50KGlkLCBjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRDb21tZW50KGlkLCBjb250ZW50cykge1xyXG5cdFx0aWYoY29udGVudHMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5jb21tZW50KGlkKSwgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSByZXN1bHRzLnVybDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBlcnJvclxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHRvQ29tbWVudHMoaWQ6IG51bWJlcikge1xyXG5cdFx0JChcIltkYXRhLWNvbnRlbnQ9J2NvbnRlbnQtXCIgKyBpZCArXCInXSBidXR0b24uY29udGVudC1zd2l0Y2hcIikudHJpZ2dlcignY2xpY2snKTtcclxuXHR9XHJcbn0iLCJjbGFzcyBOb3RpZmljYXRpb25zIHtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIHBhdGhzOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucGF0aHMgPSB7XHJcbiAgICAgICAgICAgIG1hcmtSZWFkOiAnL25vdGlmaWNhdGlvbnMvbWFyay1yZWFkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJChcIltydC1ob29rPSdob29rIW5vdGlmaWNhdGlvbnM6bWFyay5yZWFkJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmF0dHIoJ3J0LWRhdGEnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgcmFkaW87XHJcbnZhciBjaGF0Ym94O1xyXG5jbGFzcyBSYWRpbyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdG9ubGluZTogYm9vbGVhbiA9IHRydWU7XHJcblx0cG9wdXA6IGFueSA9IG51bGw7XHJcblx0c3RhdHVzOiBib29sZWFuID0gZmFsc2U7XHJcblx0c3RhdHVzQ2xvc2VkOiBzdHJpbmcgPSAnJztcclxuXHRzdGF0dXNPcGVuOiBzdHJpbmcgPSAnJztcclxuXHRVUkw6IHN0cmluZyA9ICcnO1xyXG5cdHZhck1lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG5cdHZhclN0YXR1czogc3RyaW5nID0gJyc7XHJcblxyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuVVJMID0gJ2h0dHA6Ly9hcHBzLnN0cmVhbWxpY2Vuc2luZy5jb20vcGxheWVyLXBvcHVwLnBocD9zaWQ9MjU3OSZzdHJlYW1faWQ9NDM4Nic7XHJcblx0XHR0aGlzLnN0YXR1c0Nsb3NlZCA9ICd0byBsaXN0ZW4gdG8gUnVuZVRpbWUgUmFkaW8hJztcclxuXHRcdHRoaXMuc3RhdHVzT3BlbiA9ICd0byBjbG9zZSBSdW5lVGltZSBSYWRpbyc7XHJcblx0XHR0aGlzLnZhck1lc3NhZ2UgPSAnI3JhZGlvLW1lc3NhZ2UnO1xyXG5cdFx0dGhpcy52YXJTdGF0dXMgPSAnI3JhZGlvLXN0YXR1cyc7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0c3RhdHVzTWVzc2FnZTogJyNyYWRpby1zdGF0dXMtbWVzc2FnZSdcclxuXHRcdH07XHJcblx0XHQkKCcjcmFkaW8tbGluaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighcmFkaW8uc3RhdHVzKSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9PcGVuKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmFkaW8taGlzdG9yeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuSGlzdG9yeSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ucmVxdWVzdE9wZW4oKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby10aW1ldGFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblRpbWV0YWJsZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5wdWxsSGlkZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3Blbkhpc3RvcnkoKSB7XHJcblx0XHR2YXIgaGlzdG9yeSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9oaXN0b3J5Jyk7XHJcblx0XHRoaXN0b3J5LmRvbmUoZnVuY3Rpb24oaGlzdG9yeTogc3RyaW5nKSB7XHJcblx0XHRcdGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuXHRcdFx0dmFyIG11c2ljID0gbnVsbCxcclxuXHRcdFx0XHRodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlJz48dGhlYWQ+PHRyPjx0ZD5UaW1lPC90ZD48dGQ+QXJ0aXN0PC90ZD48dGQ+TmFtZTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IGhpc3RvcnkubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0bXVzaWMgPSBoaXN0b3J5W3hdO1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3BlblRpbWV0YWJsZSgpIHtcclxuXHRcdHZhciB0aW1ldGFibGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdGltZXRhYmxlJyk7XHJcblx0XHR0aW1ldGFibGUuZG9uZShmdW5jdGlvbih0aW1ldGFibGU6IHN0cmluZykge1xyXG5cdFx0XHR0aW1ldGFibGUgPSAkLnBhcnNlSlNPTih0aW1ldGFibGUpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0ZXh0LWNlbnRlcic+PHRoZWFkPjx0cj48dGQ+Jm5ic3A7PC90ZD48dGQ+TW9uZGF5PC90ZD48dGQ+VHVlc2RheTwvdGQ+PHRkPldlZG5lc2RheTwvdGQ+PHRkPlRodXJzZGF5PC90ZD48dGQ+RnJpZGF5PC90ZD48dGQ+U2F0dXJkYXk8L3RkPjx0ZD5TdW5kYXk8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSAyMzsgeCA8PSB5OyB4KyspIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHRyPjx0ZD5cIiArIHggKyBcIjowMDwvdGQ+XCI7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDY7IGkgPD0gajsgaSsrKSB7XHJcblx0XHRcdFx0XHRodG1sICs9IFwiPHRkPlwiO1xyXG5cdFx0XHRcdFx0aWYodGltZXRhYmxlW2ldICE9PSB1bmRlZmluZWQgJiYgdGltZXRhYmxlW2ldW3hdICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSB0aW1ldGFibGVbaV1beF07XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IFwiJm5ic3A7XCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjwvdGQ+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sICs9IFwiPC90cj5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvbmxpbmVTZXR0aW5ncygpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHRoaXMucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlRoZSByYWRpbyBoYXMgYmVlbiBzZXQgb2ZmbGluZS5cIik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsSGlkZSgpIHtcclxuXHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbCgnJm5ic3A7Jyk7XHJcblx0XHQkKCcjcmFkaW8tcHVsbCcpLndpZHRoKCcnKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS53aWR0aCgnJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsT3Blbihjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvQ2xvc2UoKSB7XHJcblx0XHRpZih0aGlzLnBvcHVwKSB7XHJcblx0XHRcdHRoaXMucG9wdXAuY2xvc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c0Nsb3NlZCk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IGZhbHNlO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cylcclxuXHRcdFx0LnJlbW92ZUNsYXNzKCd0ZXh0LXN1Y2Nlc3MnKVxyXG5cdFx0XHQuYWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJylcclxuXHRcdFx0Lmh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T2ZmXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvT3BlbigpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnBvcHVwID0gd2luZG93Lm9wZW4odGhpcy5VUkwsICdSdW5lVGltZSBSYWRpbycsICd3aWR0aD0zODksaGVpZ2h0PTM1OScpO1xyXG5cdFx0dGhpcy5zdGF0dXMgPSB0cnVlO1xyXG5cdFx0JCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNPcGVuKTtcclxuXHRcdCQodGhpcy52YXJTdGF0dXMpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygndGV4dC1kYW5nZXInKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpLlxyXG5cdFx0XHRodG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9uXCIpO1xyXG5cdFx0dmFyIHBvbGxUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHJhZGlvLnBvcHVwLmNsb3NlZCAhPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xyXG5cdFx0XHRcdHJhZGlvLnJhZGlvQ2xvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVxdWVzdE9wZW4oKSB7XHJcblx0XHR2YXIgcmVxdWVzdCA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnKTtcclxuXHRcdHJlcXVlc3QuZG9uZShmdW5jdGlvbihyZXF1ZXN0OiBzdHJpbmcpIHtcclxuXHRcdFx0cmVxdWVzdCA9ICQucGFyc2VKU09OKHJlcXVlc3QpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKHJlcXVlc3QucmVzcG9uc2UgPT09IDIpIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPGZvcm0gcm9sZT0nZm9ybSc+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1hcnRpc3QnPkFydGlzdCBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtYXJ0aXN0JyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LWFydGlzdCcgcGxhY2Vob2xkZXI9J0FydGlzdCBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtbmFtZSc+U29uZyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtbmFtZScgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1uYW1lJyBwbGFjZWhvbGRlcj0nU29uZyBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxwIGlkPSdyZXF1ZXN0LWJ1dHRvbicgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+UmVxdWVzdDwvcD48L2Rpdj48L2Zvcm0+XCI7XHJcblx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAxKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LXdhcm5pbmcnPkF1dG8gREogY3VycmVudGx5IGRvZXMgbm90IGFjY2VwdCBzb25nIHJlcXVlc3RzLCBzb3JyeSFcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5Zb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gcmVxdWVzdCBhIHNvbmcgZnJvbSB0aGUgREouPC9wPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyYWRpby5wdWxsT3BlbihodG1sKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmFkaW8ucmVxdWVzdFNlbmQoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LCAzMDAwKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZXF1ZXN0U2VuZCgpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQnYXJ0aXN0JzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtYXJ0aXN0JykudmFsdWUsXHJcblx0XHRcdCduYW1lJzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtbmFtZScpLnZhbHVlXHJcblx0XHR9O1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnLCBkYXRhKTtcclxuXHRcdGNvbnRlbnRzLmRvbmUoZnVuY3Rpb24oY29udGVudHM6IHN0cmluZykge1xyXG5cdFx0XHRjb250ZW50cyA9ICQucGFyc2VKU09OKGNvbnRlbnRzKTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihjb250ZW50cy5zZW50ID09PSB0cnVlKSB7XHJcblx0XHRcdFx0aHRtbCA9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+WW91ciByZXF1ZXN0IGhhcyBiZWVuIHNlbnQgdG8gdGhlIERKPC9wPlwiO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+VGhlcmUgd2FzIGFuIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0LiAgVHJ5IGFnYWluP1wiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoaHRtbCk7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucHVsbEhpZGUoKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwoJycpO1xyXG5cdFx0dmFyIHVwZGF0ZSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby91cGRhdGUnKTtcclxuXHRcdHVwZGF0ZS5kb25lKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG5cdFx0XHR1cGRhdGUgPSAkLnBhcnNlSlNPTih1cGRhdGUpO1xyXG5cdFx0XHR2YXIgcmVxdWVzdHNIVE1MID0gXCJcIjtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctbmFtZScpLmh0bWwodXBkYXRlWydzb25nJ11bJ25hbWUnXSk7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLWFydGlzdCcpLmh0bWwodXBkYXRlWydzb25nJ11bJ2FydGlzdCddKTtcclxuXHRcdFx0aWYodXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJBdXRvIERKXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gJycgJiYgdXBkYXRlWydtZXNzYWdlJ10gIT09IC0xKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbCh1cGRhdGVbJ21lc3NhZ2UnXSk7XHJcblx0XHRcdH0gZWxzZSBpZih1cGRhdGVbJ21lc3NhZ2UnXSA9PT0gLTEgJiYgdXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10gKyBcIiBpcyBjdXJyZW50bHkgb24gYWlyIVwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiQXV0byBESiBpcyBjdXJyZW50bHkgb24gYWlyXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gdXBkYXRlWydyZXF1ZXN0cyddLmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gdXBkYXRlWydyZXF1ZXN0cyddW3hdO1xyXG5cdFx0XHRcdGlmKHJlcXVlc3Quc3RhdHVzID09IDApIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwPlwiO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PSAxKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMikge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5cIjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJlcXVlc3RzSFRNTCArPSByZXF1ZXN0LnNvbmdfbmFtZSArIFwiIGJ5IFwiICsgcmVxdWVzdC5zb25nX2FydGlzdDtcclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8L3A+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKHJlcXVlc3RzSFRNTCk7XHJcblxyXG5cdFx0XHRyYWRpby5vbmxpbmUgPSB1cGRhdGUub25saW5lO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJhZGlvLnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAzMDAwMCk7XHJcblx0XHRcdHJhZGlvLm9ubGluZVNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbmF0dXJlO1xyXG5jbGFzcyBTaWduYXR1cmUge1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRzdWJtaXQ6ICcvc2lnbmF0dXJlcydcclxuXHRcdH07XHJcblx0XHR2YXIgdGhlRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduYXR1cmUtZm9ybScpO1xyXG5cdFx0bmV3IHN0ZXBzRm9ybSggdGhlRm9ybSwge1xyXG5cdFx0XHRvblN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHVzZXJuYW1lID0gJCgnI3ExJykudmFsKCk7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0XHR1c2VybmFtZTogdXNlcm5hbWVcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHV0aWxpdGllcy5wb3N0KHNpZ25hdHVyZS5wYXRocy5zdWJtaXQsIGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fVxyXG59IiwidmFyIHNpZ251cEZvcm07XHJcbmNsYXNzIFNpZ251cEZvcm0ge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRkaXNwbGF5TmFtZTogJyNkaXNwbGF5X25hbWUnLFxyXG5cdFx0XHRlbWFpbDogJyNlbWFpbCcsXHJcblx0XHRcdHBhc3N3b3JkOiAnI3Bhc3N3b3JkJyxcclxuXHRcdFx0cGFzc3dvcmQyOiAnI3Bhc3N3b3JkMicsXHJcblx0XHRcdHNlY3VyaXR5Q2hlY2s6ICcjc2VjdXJpdHknXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2tBdmFpbGFiaWxpdHk6ICcvZ2V0L3NpZ251cC8nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQsXHJcblx0XHRcdHRpbWVvdXQgPSA1MDA7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdkaXNwbGF5X25hbWUnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lbWFpbCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdFbWFpbCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRW1haWwpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCdmb3JtJykuc3VibWl0KGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uc3VibWl0KGUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja0F2YWlsYWJpbGl0eShmaWVsZDogc3RyaW5nKSB7XHJcblx0XHR2YXIgdmFsID0gJCgnIycgKyBmaWVsZCkudmFsKCk7XHJcblx0XHRpZih2YWwubGVuZ3RoID09PSAwKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR2YXIgdXJsID0gdGhpcy5wYXRocy5jaGVja0F2YWlsYWJpbGl0eSArIGZpZWxkO1xyXG5cdFx0dmFyIGF2YWlsYWJsZTtcclxuXHRcdGlmKGZpZWxkID09PSBcImRpc3BsYXlfbmFtZVwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZGlzcGxheV9uYW1lOiB2YWwgfSk7XHJcblx0XHR9IGVsc2UgaWYoZmllbGQgPT09IFwiZW1haWxcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGVtYWlsOiB2YWwgfSk7XHJcblx0XHR9XHJcblx0XHRhdmFpbGFibGUuZG9uZShmdW5jdGlvbihhdmFpbGFibGU6IHN0cmluZykge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShhdmFpbGFibGUpO1xyXG5cdFx0XHRpZihhdmFpbGFibGUuYXZhaWxhYmxlID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrUGFzc3dvcmQoKSB7XHJcblx0XHR2YXIgdjEgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLnZhbCgpLFxyXG5cdFx0XHR2MiA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLnZhbCgpO1xyXG5cdFx0aWYodjIubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRpZih2MSA9PT0gdjIpIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIHRydWUpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIHRydWUpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgZmFsc2UpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNoZWNrU2VjdXJpdHkoKSB7XHJcblx0XHR2YXIgc2xpZGVyVmFsID0gJCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLnZhbCgpO1xyXG5cdFx0aWYoc2xpZGVyVmFsIDw9IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdub25lJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSBpZihzbGlkZXJWYWwgPiAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnYmxvY2snXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3VibWl0KGU6IGFueSkge1xyXG5cdFx0dmFyIHVzZXJuYW1lID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgndXNlcm5hbWUnKSxcclxuXHRcdFx0ZW1haWwgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpLFxyXG5cdFx0XHRwYXNzID0gdGhpcy5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRpZih1c2VybmFtZSA9PT0gdHJ1ZSAmJiBlbWFpbCA9PT0gdHJ1ZSAmJiBwYXNzID09PSB0cnVlKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR0b2dnbGVGZWVkYmFjayhmaWVsZDogc3RyaW5nLCBzdGF0dXM6IGJvb2xlYW4pIHtcclxuXHRcdGlmKHN0YXR1cyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJjbGFzcyBTdGFmZkxpc3Qge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdmFyIG1lbWJlcnMgPSAkKFwiW3J0LWhvb2s9J2hvb2shc3RhZmYubGlzdDpjYXJkJ11cIik7XHJcbiAgICAgICAgJC5lYWNoKG1lbWJlcnMsIGZ1bmN0aW9uKGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICQodmFsdWUpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHZhbCkuYXR0cigncnQtZGF0YScpO1xyXG4gICAgICAgICAgICAkKHZhbCkuZmluZCgnLmZyb250JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogXCJ1cmwoJy9pbWcvZm9ydW1zL3Bob3Rvcy9cIiArIGlkICsgXCIucG5nJylcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2YWwpLmJpbmQoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2hvdmVyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIHN0ZXBzRm9ybS5qcyB2MS4wLjBcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE0LCBDb2Ryb3BzXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICovXHJcbjsoIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcblx0XHRcdCdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcclxuXHRcdFx0J09UcmFuc2l0aW9uJzogJ29UcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J21zVHJhbnNpdGlvbic6ICdNU1RyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJ1xyXG5cdFx0fSxcclxuXHRcdHRyYW5zRW5kRXZlbnROYW1lID0gdHJhbnNFbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoICd0cmFuc2l0aW9uJyApIF0sXHJcblx0XHRzdXBwb3J0ID0geyB0cmFuc2l0aW9ucyA6IE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyB9O1xyXG5cclxuXHRmdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XHJcblx0XHRmb3IoIHZhciBrZXkgaW4gYiApIHtcclxuXHRcdFx0aWYoIGIuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG5cdFx0XHRcdGFba2V5XSA9IGJba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdGVwc0Zvcm0oIGVsLCBvcHRpb25zICkge1xyXG5cdFx0dGhpcy5lbCA9IGVsO1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XHJcblx0XHRleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xyXG5cdFx0dGhpcy5faW5pdCgpO1xyXG5cdH1cclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5vcHRpb25zID0ge1xyXG5cdFx0b25TdWJtaXQgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dGhpcy5jdXJyZW50ID0gMDtcclxuXHJcblx0XHQvLyBxdWVzdGlvbnNcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gW10uc2xpY2UuY2FsbCggdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCAnb2wucXVlc3Rpb25zID4gbGknICkgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9uc1xyXG5cdFx0dGhpcy5xdWVzdGlvbnNDb3VudCA9IHRoaXMucXVlc3Rpb25zLmxlbmd0aDtcclxuXHRcdC8vIHNob3cgZmlyc3QgcXVlc3Rpb25cclxuXHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMucXVlc3Rpb25zWzBdLCAnY3VycmVudCcgKTtcclxuXHJcblx0XHQvLyBuZXh0IHF1ZXN0aW9uIGNvbnRyb2xcclxuXHRcdHRoaXMuY3RybE5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdidXR0b24ubmV4dCcgKTtcclxuXHJcblx0XHQvLyBwcm9ncmVzcyBiYXJcclxuXHRcdHRoaXMucHJvZ3Jlc3MgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdkaXYucHJvZ3Jlc3MnICk7XHJcblxyXG5cdFx0Ly8gcXVlc3Rpb24gbnVtYmVyIHN0YXR1c1xyXG5cdFx0dGhpcy5xdWVzdGlvblN0YXR1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyJyApO1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvbiBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy5jdXJyZW50TnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItY3VycmVudCcgKTtcclxuXHRcdHRoaXMuY3VycmVudE51bS5pbm5lckhUTUwgPSBOdW1iZXIoIHRoaXMuY3VycmVudCArIDEgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9ucyBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy50b3RhbFF1ZXN0aW9uTnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItdG90YWwnICk7XHJcblx0XHR0aGlzLnRvdGFsUXVlc3Rpb25OdW0uaW5uZXJIVE1MID0gdGhpcy5xdWVzdGlvbnNDb3VudDtcclxuXHJcblx0XHQvLyBlcnJvciBtZXNzYWdlXHJcblx0XHR0aGlzLmVycm9yID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5lcnJvci1tZXNzYWdlJyApO1xyXG5cclxuXHRcdC8vIGluaXQgZXZlbnRzXHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0Ly8gZmlyc3QgaW5wdXRcclxuXHRcdFx0Zmlyc3RFbElucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKSxcclxuXHRcdC8vIGZvY3VzXHJcblx0XHRcdG9uRm9jdXNTdGFydEZuID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Zmlyc3RFbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggc2VsZi5jdHJsTmV4dCwgJ3Nob3cnICk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0Ly8gc2hvdyB0aGUgbmV4dCBxdWVzdGlvbiBjb250cm9sIGZpcnN0IHRpbWUgdGhlIGlucHV0IGdldHMgZm9jdXNlZFxyXG5cdFx0Zmlyc3RFbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblxyXG5cdFx0Ly8gc2hvdyBuZXh0IHF1ZXN0aW9uXHJcblx0XHR0aGlzLmN0cmxOZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0c2VsZi5fbmV4dFF1ZXN0aW9uKCk7XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gcHJlc3NpbmcgZW50ZXIgd2lsbCBqdW1wIHRvIG5leHQgcXVlc3Rpb25cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdC8vIGVudGVyXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSAxMyApIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuX25leHRRdWVzdGlvbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gZGlzYWJsZSB0YWJcclxuXHRcdHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdFx0Ly8gdGFiXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSA5ICkge1xyXG5cdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9O1xyXG5cclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmKCAhdGhpcy5fdmFsaWRhZGUoKSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNoZWNrIGlmIGZvcm0gaXMgZmlsbGVkXHJcblx0XHRpZiggdGhpcy5jdXJyZW50ID09PSB0aGlzLnF1ZXN0aW9uc0NvdW50IC0gMSApIHtcclxuXHRcdFx0dGhpcy5pc0ZpbGxlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2xlYXIgYW55IHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzXHJcblx0XHR0aGlzLl9jbGVhckVycm9yKCk7XHJcblxyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dmFyIGN1cnJlbnRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHJcblx0XHQvLyBpbmNyZW1lbnQgY3VycmVudCBxdWVzdGlvbiBpdGVyYXRvclxyXG5cdFx0Kyt0aGlzLmN1cnJlbnQ7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHByb2dyZXNzIGJhclxyXG5cdFx0dGhpcy5fcHJvZ3Jlc3MoKTtcclxuXHJcblx0XHRpZiggIXRoaXMuaXNGaWxsZWQgKSB7XHJcblx0XHRcdC8vIGNoYW5nZSB0aGUgY3VycmVudCBxdWVzdGlvbiBudW1iZXIvc3RhdHVzXHJcblx0XHRcdHRoaXMuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyKCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgY2xhc3MgXCJzaG93LW5leHRcIiB0byBmb3JtIGVsZW1lbnQgKHN0YXJ0IGFuaW1hdGlvbnMpXHJcblx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMuZWwsICdzaG93LW5leHQnICk7XHJcblxyXG5cdFx0XHQvLyByZW1vdmUgY2xhc3MgXCJjdXJyZW50XCIgZnJvbSBjdXJyZW50IHF1ZXN0aW9uIGFuZCBhZGQgaXQgdG8gdGhlIG5leHQgb25lXHJcblx0XHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdFx0dmFyIG5leHRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHRcdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggY3VycmVudFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggbmV4dFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBhZnRlciBhbmltYXRpb24gZW5kcywgcmVtb3ZlIGNsYXNzIFwic2hvdy1uZXh0XCIgZnJvbSBmb3JtIGVsZW1lbnQgYW5kIGNoYW5nZSBjdXJyZW50IHF1ZXN0aW9uIHBsYWNlaG9sZGVyXHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsXHJcblx0XHRcdG9uRW5kVHJhbnNpdGlvbkZuID0gZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHRcdGlmKCBzdXBwb3J0LnRyYW5zaXRpb25zICkge1xyXG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCB0cmFuc0VuZEV2ZW50TmFtZSwgb25FbmRUcmFuc2l0aW9uRm4gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoIHNlbGYuaXNGaWxsZWQgKSB7XHJcblx0XHRcdFx0XHRzZWxmLl9zdWJtaXQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjbGFzc2llLnJlbW92ZUNsYXNzKCBzZWxmLmVsLCAnc2hvdy1uZXh0JyApO1xyXG5cdFx0XHRcdFx0c2VsZi5jdXJyZW50TnVtLmlubmVySFRNTCA9IHNlbGYubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTDtcclxuXHRcdFx0XHRcdHNlbGYucXVlc3Rpb25TdGF0dXMucmVtb3ZlQ2hpbGQoIHNlbGYubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0XHRcdFx0XHQvLyBmb3JjZSB0aGUgZm9jdXMgb24gdGhlIG5leHQgaW5wdXRcclxuXHRcdFx0XHRcdG5leHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICkuZm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0aWYoIHN1cHBvcnQudHJhbnNpdGlvbnMgKSB7XHJcblx0XHRcdHRoaXMucHJvZ3Jlc3MuYWRkRXZlbnRMaXN0ZW5lciggdHJhbnNFbmRFdmVudE5hbWUsIG9uRW5kVHJhbnNpdGlvbkZuICk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0b25FbmRUcmFuc2l0aW9uRm4oKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIHVwZGF0ZXMgdGhlIHByb2dyZXNzIGJhciBieSBzZXR0aW5nIGl0cyB3aWR0aFxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3Byb2dyZXNzID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLnByb2dyZXNzLnN0eWxlLndpZHRoID0gdGhpcy5jdXJyZW50ICogKCAxMDAgLyB0aGlzLnF1ZXN0aW9uc0NvdW50ICkgKyAnJSc7XHJcblx0fVxyXG5cclxuXHQvLyBjaGFuZ2VzIHRoZSBjdXJyZW50IHF1ZXN0aW9uIG51bWJlclxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBmaXJzdCwgY3JlYXRlIG5leHQgcXVlc3Rpb24gbnVtYmVyIHBsYWNlaG9sZGVyXHJcblx0XHR0aGlzLm5leHRRdWVzdGlvbk51bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xyXG5cdFx0dGhpcy5uZXh0UXVlc3Rpb25OdW0uY2xhc3NOYW1lID0gJ251bWJlci1uZXh0JztcclxuXHRcdHRoaXMubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTCA9IE51bWJlciggdGhpcy5jdXJyZW50ICsgMSApO1xyXG5cdFx0Ly8gaW5zZXJ0IGl0IGluIHRoZSBET01cclxuXHRcdHRoaXMucXVlc3Rpb25TdGF0dXMuYXBwZW5kQ2hpbGQoIHRoaXMubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0fVxyXG5cclxuXHQvLyBzdWJtaXRzIHRoZSBmb3JtXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm9wdGlvbnMub25TdWJtaXQoIHRoaXMuZWwgKTtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE8gKG5leHQgdmVyc2lvbi4uKVxyXG5cdC8vIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fdmFsaWRhZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb27DgsK0cyBpbnB1dFxyXG5cdFx0dmFyIGlucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKS52YWx1ZTtcclxuXHRcdGlmKCBpbnB1dCA9PT0gJycgKSB7XHJcblx0XHRcdHRoaXMuX3Nob3dFcnJvciggJ0VNUFRZU1RSJyApO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIChuZXh0IHZlcnNpb24uLilcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9zaG93RXJyb3IgPSBmdW5jdGlvbiggZXJyICkge1xyXG5cdFx0dmFyIG1lc3NhZ2UgPSAnJztcclxuXHRcdHN3aXRjaCggZXJyICkge1xyXG5cdFx0XHRjYXNlICdFTVBUWVNUUicgOlxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnUGxlYXNlIGZpbGwgdGhlIGZpZWxkIGJlZm9yZSBjb250aW51aW5nJztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAnSU5WQUxJREVNQUlMJyA6XHJcblx0XHRcdFx0bWVzc2FnZSA9ICdQbGVhc2UgZmlsbCBhIHZhbGlkIGVtYWlsIGFkZHJlc3MnO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHQvLyAuLi5cclxuXHRcdH07XHJcblx0XHR0aGlzLmVycm9yLmlubmVySFRNTCA9IG1lc3NhZ2U7XHJcblx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLmVycm9yLCAnc2hvdycgKTtcclxuXHR9XHJcblxyXG5cdC8vIGNsZWFycy9oaWRlcyB0aGUgY3VycmVudCBlcnJvciBtZXNzYWdlXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fY2xlYXJFcnJvciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggdGhpcy5lcnJvciwgJ3Nob3cnICk7XHJcblx0fVxyXG5cclxuXHQvLyBhZGQgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5cdHdpbmRvdy5zdGVwc0Zvcm0gPSBzdGVwc0Zvcm07XHJcblxyXG59KSggd2luZG93ICk7IiwidmFyIHV0aWxpdGllcztcclxuY2xhc3MgVXRpbGl0aWVzIHtcclxuICAgIHB1YmxpYyBjdXJyZW50VGltZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZvcm1Ub2tlbih0b2tlbjogc3RyaW5nKSB7XHJcbiAgICAgICAgdG9rZW4gPSBhdG9iKHRva2VuKTtcclxuICAgICAgICAkKCdmb3JtJykuYXBwZW5kKFwiPGlucHV0IHR5cGU9J2hpZGRlbicgbmFtZT0nX3Rva2VuJyB2YWx1ZT0nXCIgKyB0b2tlbiArIFwiJyAvPlwiKTtcclxuXHJcbiAgICAgICAgdmFyIG1ldGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtZXRhJyk7XHJcbiAgICAgICAgbWV0YS5uYW1lID0gJ190b2tlbic7XHJcbiAgICAgICAgbWV0YS5jb250ZW50ID0gdG9rZW47XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobWV0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFKQVgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnaHRtbCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEpTT05EZWNvZGUoanNvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQucGFyc2VKU09OKGpzb24pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvc3RBSkFYKHBhdGg6IHN0cmluZywgZGF0YTogYW55KSB7XHJcbiAgICAgICAgZGF0YS5fdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJfdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzY3JvbGxUbyhlbGVtZW50OiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcFxyXG4gICAgICAgIH0sIHRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0aW1lQWdvKHRzOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbm93VHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcclxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vd1RzIC0gdHM7XHJcbiAgICAgICAgaWYoc2Vjb25kcyA+IDIgKiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYSBmZXcgZGF5cyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ5ZXN0ZXJkYXlcIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDcyMDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDM2MDApICsgXCIgaG91cnMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImFuIGhvdXIgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gMTIwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCkgKyBcIiBtaW51dGVzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDYwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgbWludXRlIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwiIHNlY29uZHMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBzZWNvbmQgYWdvXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwb3N0KHBhdGg6IHN0cmluZywgcGFyYW1zOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XHJcbiAgICAgICAgbWV0aG9kID0gbWV0aG9kIHx8ICdwb3N0JztcclxuICAgICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnbWV0aG9kJywgbWV0aG9kKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWN0aW9uJywgcGF0aCk7XHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGlmKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGlkZGVuRmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCduYW1lJywga2V5KTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBwYXJhbXNba2V5XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChoaWRkZW5GaWVsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRva2VuVmFsID0gJChcIm1ldGFbbmFtZT0nX3Rva2VuJ11cIikuYXR0cignY29udGVudCcpO1xyXG4gICAgICAgIHZhciB0b2tlbkZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgnbmFtZScsICdfdG9rZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCB0b2tlblZhbCk7XHJcblxyXG4gICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQodG9rZW5GaWVsZCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XHJcbiAgICAgICAgZm9ybS5zdWJtaXQoKTtcclxuICAgIH1cclxufVxyXG51dGlsaXRpZXMgPSBuZXcgVXRpbGl0aWVzKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9