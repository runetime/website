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

var nameChecker;
var NameChecker = (function () {
    function NameChecker() {
        this.elements = {};
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
        $("[rt-hook='name.checker:submit']").bind('click', function (value) {
            nameChecker.check();
        });
    }
    NameChecker.prototype.check = function () {
        var name = $('#rsn-check-field').val();
        var checkName = this.checkName(name);
        if (checkName === 0) {
            this.unavailable("You did not enter anything.");
        }
        else if (checkName === 1) {
            this.unavailable("The name <b>" + name + "</b> is over 12 characters.");
        }
        else if (checkName === 2) {
            this.unavailable("The name <b>" + name + "</b> is under 3 characters.");
        }
        else if (checkName === 3) {
            this.unavailable("The name <b>" + name + "</b> starts with the word Mod.");
        }
        else if (checkName === 4) {
            this.unavailable("The name <b>" + name + "</b> contains a swear word.");
        }
        else if (checkName === 5) {
            var data = {
                rsn: name
            };
            var details = utilities.postAJAX(this.paths.check, data);
            $(this.elements.availability).html('Loading...');
            details.done(function (details) {
                var available = false;
                if (details.substring(0, 6) === "<html>") {
                    available = true;
                }
                if (available === true) {
                    nameChecker.available(name);
                }
                else {
                    nameChecker.unavailable('The Runescape name <b>' + name + '</b> is not available.');
                }
            });
        }
    };
    NameChecker.prototype.available = function (name) {
        $(nameChecker.elements.availability).html('The RuneScape name <b>' + name + '</b> is available.').css({
            color: 'green'
        });
    };
    NameChecker.prototype.checkName = function (name) {
        if (typeof (name) === "undefined") {
            return 0;
        }
        else {
            if (name.length > 12) {
                return 1;
            }
            else if (name.length < 3) {
                return 2;
            }
            else if (name.substring(0, 3) === 'Mod') {
                return 3;
            }
            $.each(this.notAllowed, function (key, value) {
                var decode = atob(value);
                if (name.indexOf(decode) > -1)
                    return 4;
            });
        }
        return 5;
    };
    NameChecker.prototype.unavailable = function (message) {
        $(this.elements.availability).html(message).css({
            color: 'red'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2hhdGJveC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2xhbi50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29kcm9wc19kaWFsb2dGeC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29tYmF0Y2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29udGFjdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvZm9ydW1zLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9saXZlc3RyZWFtLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9tYWluLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9uYW1lY2hlY2tlci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmV3cy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbm90aWZpY2F0aW9ucy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvcmFkaW8udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ25hdHVyZS50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc2lnbnVwLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zdGFmZl9saXN0LnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9zdGVwc19mb3JtLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS91dGlsaXRpZXMudHMiXSwibmFtZXMiOlsiQ2FsY3VsYXRvciIsIkNhbGN1bGF0b3IuY29uc3RydWN0b3IiLCJDYWxjdWxhdG9yLmNhbGN1bGF0ZVhQIiwiQ2FsY3VsYXRvci5jYWxjdWxhdGVMZXZlbCIsIkNhbGN1bGF0b3IuZ2V0SW5mbyIsIkNhbGN1bGF0b3IubG9hZENhbGMiLCJDYWxjdWxhdG9yLnVwZGF0ZUNhbGMiLCJDaGF0Ym94IiwiQ2hhdGJveC5jb25zdHJ1Y3RvciIsIkNoYXRib3guYWRkTWVzc2FnZSIsIkNoYXRib3guZGlzcGxheU1lc3NhZ2UiLCJDaGF0Ym94LmRpc3BsYXlNZXNzYWdlcyIsIkNoYXRib3guZXJyb3IiLCJDaGF0Ym94LmdldFN0YXJ0IiwiQ2hhdGJveC5tb2QiLCJDaGF0Ym94Lm1vZFRvb2xzIiwiQ2hhdGJveC5wYW5lbENoYW5uZWxzIiwiQ2hhdGJveC5wYW5lbENoYXQiLCJDaGF0Ym94LnBhbmVsQ2xvc2UiLCJDaGF0Ym94LnN1Ym1pdE1lc3NhZ2UiLCJDaGF0Ym94LnN3aXRjaENoYW5uZWwiLCJDaGF0Ym94LnVwZGF0ZSIsIkNoYXRib3gudXBkYXRlVGltZUFnbyIsIkNsYW4iLCJDbGFuLmNvbnN0cnVjdG9yIiwiQ2xhbi5zZXRMaXN0ZW4iLCJleHRlbmQiLCJEaWFsb2dGeCIsIkNvbWJhdENhbGN1bGF0b3IiLCJDb21iYXRDYWxjdWxhdG9yLmNvbnN0cnVjdG9yIiwiQ29tYmF0Q2FsY3VsYXRvci5nZXRMZXZlbHMiLCJDb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsIiwiQ29tYmF0Q2FsY3VsYXRvci52YWwiLCJDb250YWN0IiwiQ29udGFjdC5jb25zdHJ1Y3RvciIsIkNvbnRhY3QuZG9uZSIsIkNvbnRhY3QuZXJyb3IiLCJDb250YWN0LnNlbmQiLCJDb250YWN0LnZhbGlkYXRlRW1haWwiLCJDb250YWN0Lndhcm5pbmciLCJGb3J1bXMiLCJGb3J1bXMuY29uc3RydWN0b3IiLCJGb3J1bXMuZG93bnZvdGUiLCJGb3J1bXMucG9sbFZvdGUiLCJGb3J1bXMudXB2b3RlIiwiUG9zdCIsIlBvc3QuY29uc3RydWN0b3IiLCJQb3N0LnF1b3RlIiwiRm9ydW1zVGhyZWFkQ3JlYXRlIiwiRm9ydW1zVGhyZWFkQ3JlYXRlLmNvbnN0cnVjdG9yIiwiRm9ydW1zVGhyZWFkQ3JlYXRlLmFkZFF1ZXN0aW9uIiwiRm9ydW1zVGhyZWFkQ3JlYXRlLnJlbW92ZVF1ZXN0aW9uIiwiRm9ydW1zVGhyZWFkQ3JlYXRlLnNldExpc3RlbmVyIiwiRm9ydW1zVGhyZWFkQ3JlYXRlLnNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24iLCJMaXZlc3RyZWFtUmVzZXQiLCJMaXZlc3RyZWFtUmVzZXQuY29uc3RydWN0b3IiLCJMaXZlc3RyZWFtUmVzZXQucmVzZXQiLCJMaXZlc3RyZWFtUmVzZXQuc3Bpbm5lclJlbW92ZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNlcyIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNPZmZsaW5lIiwiTGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09ubGluZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNVbmtub3duIiwiUnVuZVRpbWUiLCJSdW5lVGltZS5jb25zdHJ1Y3RvciIsIk5hbWVDaGVja2VyIiwiTmFtZUNoZWNrZXIuY29uc3RydWN0b3IiLCJOYW1lQ2hlY2tlci5jaGVjayIsIk5hbWVDaGVja2VyLmF2YWlsYWJsZSIsIk5hbWVDaGVja2VyLmNoZWNrTmFtZSIsIk5hbWVDaGVja2VyLnVuYXZhaWxhYmxlIiwiTmV3cyIsIk5ld3MuY29uc3RydWN0b3IiLCJOZXdzLnNldHVwQWN0aW9ucyIsIk5ld3Muc3VibWl0Q29tbWVudCIsIk5ld3MudG9Db21tZW50cyIsIk5vdGlmaWNhdGlvbnMiLCJOb3RpZmljYXRpb25zLmNvbnN0cnVjdG9yIiwiUmFkaW8iLCJSYWRpby5jb25zdHJ1Y3RvciIsIlJhZGlvLm9wZW5IaXN0b3J5IiwiUmFkaW8ub3BlblRpbWV0YWJsZSIsIlJhZGlvLm9ubGluZVNldHRpbmdzIiwiUmFkaW8ucHVsbEhpZGUiLCJSYWRpby5wdWxsT3BlbiIsIlJhZGlvLnJhZGlvQ2xvc2UiLCJSYWRpby5yYWRpb09wZW4iLCJSYWRpby5yZXF1ZXN0T3BlbiIsIlJhZGlvLnJlcXVlc3RTZW5kIiwiUmFkaW8udXBkYXRlIiwiU2lnbmF0dXJlIiwiU2lnbmF0dXJlLmNvbnN0cnVjdG9yIiwiU2lnbnVwRm9ybSIsIlNpZ251cEZvcm0uY29uc3RydWN0b3IiLCJTaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5IiwiU2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkIiwiU2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5IiwiU2lnbnVwRm9ybS5zdWJtaXQiLCJTaWdudXBGb3JtLnRvZ2dsZUZlZWRiYWNrIiwiU3RhZmZMaXN0IiwiU3RhZmZMaXN0LmNvbnN0cnVjdG9yIiwic3RlcHNGb3JtIiwiVXRpbGl0aWVzIiwiVXRpbGl0aWVzLmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzLmN1cnJlbnRUaW1lIiwiVXRpbGl0aWVzLmZvcm1Ub2tlbiIsIlV0aWxpdGllcy5nZXRBSkFYIiwiVXRpbGl0aWVzLkpTT05EZWNvZGUiLCJVdGlsaXRpZXMucG9zdEFKQVgiLCJVdGlsaXRpZXMuc2Nyb2xsVG8iLCJVdGlsaXRpZXMudGltZUFnbyIsIlV0aWxpdGllcy5wb3N0Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsQ0FBQztBQUNmLElBQU0sVUFBVTtJQU1aQSxTQU5FQSxVQUFVQSxDQU1PQSxJQUFTQTtRQUFUQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFLQTtRQUo1QkEsYUFBUUEsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDbkJBLFNBQUlBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ2ZBLFFBQUdBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ2RBLFVBQUtBLEdBQVFBLEVBQUVBLENBQUNBO1FBRVpBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBO1lBQ1pBLFNBQVNBLEVBQUVBLHdCQUF3QkE7WUFDbkNBLFdBQVdBLEVBQUVBLDBCQUEwQkE7WUFDdkNBLE1BQU1BLEVBQUVBLG9CQUFvQkE7WUFDNUJBLEtBQUtBLEVBQUVBLHlCQUF5QkE7WUFDaENBLFdBQVdBLEVBQUVBLDBCQUEwQkE7U0FDMUNBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBO1lBQ1BBLE9BQU9BLEVBQUVBLG1CQUFtQkE7WUFDNUJBLE9BQU9BLEVBQUVBLGNBQWNBO1NBQzFCQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQTtZQUNSQSxZQUFZQSxFQUFFQSxDQUFDQTtZQUNmQSxXQUFXQSxFQUFFQSxDQUFDQTtZQUNkQSxTQUFTQSxFQUFFQSxDQUFDQTtZQUNaQSxRQUFRQSxFQUFFQSxDQUFDQTtTQUNkQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN2QkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUE7WUFDbEMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLENBQUNBLENBQUNBLDBCQUEwQkEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDaEMsVUFBVSxDQUFDO2dCQUNQLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBO0lBRUpELGdDQUFXQSxHQUFYQSxVQUFZQSxLQUFhQTtRQUN4QkUsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFDWkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsS0FBS0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDL0JBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFREYsbUNBQWNBLEdBQWRBLFVBQWVBLEVBQVVBO1FBQ3hCRyxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUNaQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNQQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUM3QkEsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbERBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO2dCQUM3QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7Z0JBQ2ZBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO1FBQ1pBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRUVILDRCQUFPQSxHQUFQQTtRQUNJSSxJQUFJQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNwREEsSUFBSUEsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLElBQVNBO1lBQzNCLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QixVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLEVBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUM7WUFDRCxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDQSxDQUFDQTtJQUNEQSxDQUFDQTtJQUVESiw2QkFBUUEsR0FBUkE7UUFDSUssSUFBSUEsSUFBSUEsR0FBR0EsRUFBQ0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFDakNBLElBQUlBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3REQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFTQSxJQUFJQTtZQUNuQixJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxLQUFLLEVBQUUsS0FBSztnQkFDM0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNkLElBQUksSUFBSSxNQUFNLENBQUM7Z0JBQ2YsSUFBSSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7Z0JBQ3hELElBQUksSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUN6RCxJQUFJLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztnQkFDdEQsSUFBSSxJQUFJLGtCQUFrQixDQUFDO2dCQUMzQixJQUFJLElBQUksT0FBTyxDQUFDO2dCQUNoQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBO0lBRURMLCtCQUFVQSxHQUFWQTtRQUNJTSxJQUFJQSxZQUFZQSxHQUFHQSxDQUFDQSxFQUNoQkEsV0FBV0EsR0FBR0EsQ0FBQ0EsRUFDZkEsU0FBU0EsR0FBR0EsQ0FBQ0EsRUFDYkEsUUFBUUEsR0FBR0EsQ0FBQ0EsRUFDWkEsVUFBVUEsR0FBR0EsQ0FBQ0EsRUFDZEEsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDZkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN0RUEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFBQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUN4Q0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEZBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBO1FBQ3RDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUNwQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDaENBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQzlCQSxVQUFVQSxHQUFHQSxRQUFRQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNs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Q0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLEdBQUdBLElBQUlBLDBCQUEwQkEsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsMkVBQTJFQSxDQUFDQTtRQUM1SkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsR0FBR0EsSUFBSUEsMEJBQTBCQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSwwRUFBMEVBLENBQUNBO1FBQzNKQSxDQUFDQTtRQUNEQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFDQTtRQUNmQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQTtRQUNkQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsR0FBR0EsSUFBSUEsMEJBQTBCQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxpRkFBaUZBLENBQUNBO1FBQ2xLQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxHQUFHQSxJQUFJQSwwQkFBMEJBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLDZFQUE2RUEsQ0FBQ0E7UUFDOUpBLENBQUNBO1FBQ0RBLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBO1FBQ2ZBLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBO1FBQ2ZBLE1BQU1BLENB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QixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDMUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDOUIsQ0FBQyxDQUFDQSxDQUFDQTtJ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b250ZW50IjpbInZhciBjYWxjdWxhdG9yO1xyXG5jbGFzcyBDYWxjdWxhdG9yIHtcclxuICAgIGNhbGN1bGF0b3I6IGFueTtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIGluZm86IGFueSA9IHt9O1xyXG4gICAgVVJMOiBhbnkgPSB7fTtcclxuICAgIGl0ZW1zOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxjOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50WFA6ICcjY2FsY3VsYXRvci1jdXJyZW50LXhwJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICcjY2FsY3VsYXRvci1kaXNwbGF5LW5hbWUnLFxyXG4gICAgICAgICAgICBzdWJtaXQ6ICcjY2FsY3VsYXRvci1zdWJtaXQnLFxyXG4gICAgICAgICAgICB0YWJsZTogJyNjYWxjdWxhdG9yLXRhYmxlIHRib2R5JyxcclxuICAgICAgICAgICAgdGFyZ2V0TGV2ZWw6ICcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLlVSTCA9IHtcclxuICAgICAgICAgICAgZ2V0Q2FsYzogJy9jYWxjdWxhdG9ycy9sb2FkJyxcclxuICAgICAgICAgICAgZ2V0SW5mbzogJy9nZXQvaGlzY29yZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IHtcclxuICAgICAgICAgICAgbGV2ZWxDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBsZXZlbFRhcmdldDogMCxcclxuICAgICAgICAgICAgWFBDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBYUFRhcmdldDogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdG9yID0gY2FsYztcclxuICAgICAgICAkKHRoaXMuZWxlbWVudHMuc3VibWl0KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5nZXRJbmZvKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5sb2FkQ2FsYygpO1xyXG4gICAgICAgICQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcbiAgICAgICAgICAgIH0sIDI1KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0Y2FsY3VsYXRlWFAobGV2ZWw6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgbGV2ZWw7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKiBNYXRoLnBvdygyLCBpIC8gNy4wKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0b3RhbCAvIDQpO1xyXG5cdH1cclxuXHJcblx0Y2FsY3VsYXRlTGV2ZWwoeHA6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgMTIwOyBpICs9IDEpIHtcclxuXHRcdFx0dG90YWwgKz0gTWF0aC5mbG9vcihpICsgMzAwICsgTWF0aC5wb3coMiwgaSAvIDcpKTtcclxuXHRcdFx0aWYoTWF0aC5mbG9vcih0b3RhbCAvIDQpID4geHApXHJcblx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdGVsc2UgaWYoaSA+PSA5OSlcclxuXHRcdFx0XHRyZXR1cm4gOTk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLnZhbCgpO1xyXG5cdFx0dmFyIGluZm8gPSB1dGlsaXRpZXMuZ2V0QUpBWCh0aGlzLlVSTC5nZXRJbmZvICsgJy8nICsgbmFtZSk7XHJcblx0XHRpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbzogYW55KSB7XHJcblx0XHRcdGluZm8gPSAkLnBhcnNlSlNPTihpbmZvKTtcclxuXHRcdFx0dmFyIHJlbGV2YW50ID0gaW5mb1sxM107XHJcblx0XHRcdGNhbGN1bGF0b3IuaW5mby5sZXZlbEN1cnJlbnQgPSByZWxldmFudFsxXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCA9IHJlbGV2YW50WzJdO1xyXG5cdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMuY3VycmVudFhQKS52YWwoY2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCk7XHJcblx0XHRcdGlmKCQoY2FsY3VsYXRvci5lbGVtZW50cy50YXJnZXRMZXZlbCkudmFsKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwocGFyc2VJbnQoY2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCwgMTApICsgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcblx0XHR9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2FsYygpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHtpZDogdGhpcy5jYWxjdWxhdG9yfTtcclxuICAgICAgICB2YXIgaW5mbyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5nZXRDYWxjLCBkYXRhKTtcclxuICAgICAgICBpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbykge1xyXG4gICAgICAgICAgICBpbmZvID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoaW5mbyk7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0b3IuaXRlbXMgPSBpbmZvO1xyXG4gICAgICAgICAgICAkLmVhY2goY2FsY3VsYXRvci5pdGVtcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLnhwICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD4maW5maW47PC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8L3RyPlwiO1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNhbGMoKSB7XHJcbiAgICAgICAgdmFyIGxldmVsQ3VycmVudCA9IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0ID0gMCxcclxuICAgICAgICAgICAgeHBDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgeHBUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gMCxcclxuICAgICAgICAgICAgYW1vdW50ID0gMDtcclxuICAgICAgICB0aGlzLmluZm8ubGV2ZWxUYXJnZXQgPSBwYXJzZUludCgkKCcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnKS52YWwoKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHRoaXMuaW5mby5sZXZlbFRhcmdldCk7XHJcbiAgICAgICAgaWYodGhpcy5pbmZvLlhQQ3VycmVudCA+IHRoaXMuaW5mby5YUFRhcmdldClcclxuICAgICAgICAgICAgdGhpcy5pbmZvLlhQVGFyZ2V0ID0gdGhpcy5jYWxjdWxhdGVYUChwYXJzZUludCh0aGlzLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuICAgICAgICBsZXZlbEN1cnJlbnQgPSB0aGlzLmluZm8ubGV2ZWxDdXJyZW50O1xyXG4gICAgICAgIGxldmVsVGFyZ2V0ID0gdGhpcy5pbmZvLmxldmVsVGFyZ2V0O1xyXG4gICAgICAgIHhwQ3VycmVudCA9IHRoaXMuaW5mby5YUEN1cnJlbnQ7XHJcbiAgICAgICAgeHBUYXJnZXQgPSB0aGlzLmluZm8uWFBUYXJnZXQ7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IHhwVGFyZ2V0IC0geHBDdXJyZW50O1xyXG4gICAgICAgICQuZWFjaCh0aGlzLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IE1hdGguY2VpbChkaWZmZXJlbmNlIC8gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHApO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBhbW91bnQgPCAwID8gMCA6IGFtb3VudDtcclxuICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJykgdGQ6bnRoLWNoaWxkKDQpJykuaHRtbChhbW91bnQpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxDdXJyZW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuXFxuXFxuXCIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsIDw9IGxldmVsQ3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsID4gbGV2ZWxDdXJyZW50ICYmIGxldmVsVGFyZ2V0ID49IGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtd2FybmluZycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LWRhbmdlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY2hhdGJveDtcclxuY2xhc3MgQ2hhdGJveCB7XHJcblx0Y2hhbm5lbDogc3RyaW5nID0gJyNyYWRpbyc7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGxhc3RJZDogbnVtYmVyID0gMDtcclxuXHRtZXNzYWdlczogYW55ID0gW107XHJcblx0bW9kZXJhdG9yOiBib29sZWFuID0gZmFsc2U7XHJcblx0cGlubmVkOiBhbnkgPSBbXTtcclxuXHR0aW1lczogYW55ID0ge307XHJcblx0dGltZW91dFBpbm5lZDogYW55ID0gbnVsbDtcclxuXHR0aW1lb3V0VXBkYXRlOiBhbnkgPSBudWxsO1xyXG5cdFVSTDogYW55ID0ge307XHJcblxyXG5cdHBpbm5lZERpc3BsYXllZDogYW55ID0gW107XHJcblxyXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjaGFubmVsOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhY3Rpb25zOiAnI2NoYXRib3gtYWN0aW9ucycsXHJcblx0XHRcdGNoYW5uZWxzOiAnI2NoYXRib3gtY2hhbm5lbHMnLFxyXG5cdFx0XHRjaGF0Ym94OiAnI2NoYXRib3gnLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NoYXRib3gtbWVzc2FnZScsXHJcblx0XHRcdG1lc3NhZ2VzOiAnI2NoYXRib3gtbWVzc2FnZXMnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5VUkwgPSB7XHJcblx0XHRcdGdldFN0YXJ0OiAnL2NoYXQvc3RhcnQnLFxyXG5cdFx0XHRnZXRVcGRhdGU6ICcvY2hhdC91cGRhdGUnLFxyXG5cdFx0XHRwb3N0TWVzc2FnZTogJy9jaGF0L3Bvc3QvbWVzc2FnZScsXHJcblx0XHRcdHBvc3RTdGF0dXNDaGFuZ2U6ICcvY2hhdC9wb3N0L3N0YXR1cy9jaGFuZ2UnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy50aW1lcyA9IHtcclxuXHRcdFx0bGFzdEFjdGl2aXR5OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKSxcclxuXHRcdFx0bGFzdFJlZnJlc2g6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsb2FkZWRBdDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKClcclxuXHRcdH07XHJcblx0XHR2YXIgbW9kZXJhdG9yID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L21vZGVyYXRvcicpO1xyXG5cdFx0bW9kZXJhdG9yLmRvbmUoZnVuY3Rpb24obW9kZXJhdG9yOiBzdHJpbmcpIHtcclxuXHRcdFx0bW9kZXJhdG9yID0gJC5wYXJzZUpTT04obW9kZXJhdG9yKTtcclxuXHRcdFx0Y2hhdGJveC5tb2RlcmF0b3IgPSBtb2RlcmF0b3IubW9kID09PSB0cnVlO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnBhbmVsQ2hhdCgpO1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmKGUud2hpY2ggPT09IDEzKVxyXG5cdFx0XHRcdGNoYXRib3guc3VibWl0TWVzc2FnZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhbm5lbHMpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnBhbmVsQ2hhbm5lbHMoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHR9LCA1MDAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZVRpbWVBZ28oKTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogYW55KSB7XHJcblx0XHRpZih0aGlzLmxhc3RJZCA8IG1lc3NhZ2UuaWQpIHtcclxuXHRcdFx0dGhpcy5sYXN0SWQgPSBtZXNzYWdlLmlkO1xyXG5cdFx0fVxyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgPD0gMSkge1xyXG5cdFx0XHR0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoXSA9IG1lc3NhZ2U7XHJcblx0XHRcdHRoaXMudGltZXMubGFzdEFjdGl2aXR5ID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2UobWVzc2FnZSkge1xyXG5cdFx0aWYoIW1lc3NhZ2UpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0aWYgKG1lc3NhZ2Uuc3RhdHVzID09PSAxKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctaGlkZGVuJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMikge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbm5lZCc+XCI7XHJcblx0XHR9IGVsc2UgaWYobWVzc2FnZS5zdGF0dXMgPT09IDMpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1waW5oaWQnPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnJz5cIjtcclxuXHRcdH1cclxuXHRcdGh0bWwgKz0gXCI8dGltZSBjbGFzcz0ncHVsbC1yaWdodCcgZGF0YS10cz0nXCIgKyBtZXNzYWdlLmNyZWF0ZWRfYXQgKyBcIic+XCI7XHJcblx0XHRodG1sICs9IHV0aWxpdGllcy50aW1lQWdvKG1lc3NhZ2UuY3JlYXRlZF9hdCk7XHJcblx0XHRodG1sICs9IFwiPC90aW1lPlwiO1xyXG5cdFx0aHRtbCArPSBcIjxwPlwiO1xyXG5cdFx0aWYoY2hhdGJveC5tb2RlcmF0b3IgPT09IHRydWUpIHtcclxuXHRcdFx0aHRtbCArPSBDaGF0Ym94Lm1vZFRvb2xzKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjxhIGNsYXNzPSdtZW1iZXJzLVwiICsgbWVzc2FnZS5jbGFzc19uYW1lICsgXCInPlwiICsgbWVzc2FnZS5hdXRob3JfbmFtZSArIFwiPC9hPjogXCIgKyBtZXNzYWdlLmNvbnRlbnRzX3BhcnNlZDtcclxuXHRcdGh0bWwgKz0gXCI8L3A+XCI7XHJcblx0XHRodG1sICs9IFwiPC9kaXY+XCI7XHJcblx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZXMpLnByZXBlbmQoaHRtbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2VzKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuaHRtbCgnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uKGluZGV4LCBtZXNzYWdlKSB7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaCh0aGlzLnBpbm5lZCwgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0aWYoY2hhdGJveC5waW5uZWREaXNwbGF5ZWRbbWVzc2FnZS5pZF0gIT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSA9IHRydWU7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZCA9IFtdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldFN0YXJ0KCkge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHR0aW1lOiB0aGlzLnRpbWVzLmxvYWRlZEF0LFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgnY2hhdC9zdGFydCcsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHMpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5tZXNzYWdlcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRjaGF0Ym94LnBpbm5lZCA9IHJlc3VsdHMucGlubmVkO1xyXG5cdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbW9kKGlkOiBhbnksIG5ld1N0YXR1czogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IGlkLFxyXG5cdFx0XHRzdGF0dXM6IG5ld1N0YXR1c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9zdGF0dXMtY2hhbmdlJywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNoYXRib3guZXJyb3IoXCJUaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcGVyZm9ybWluZyB0aGF0IG1vZGVyYXRpb24gY2hhbmdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgbW9kVG9vbHMobWVzc2FnZSkge1xyXG5cdFx0dmFyIHJlcyA9IFwiXCI7XHJcblx0XHRyZXMgKz0gXCI8dWwgY2xhc3M9J2xpc3QtaW5saW5lIGlubGluZSc+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyAlIDIgPT09IDApIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzICsgMSkgKyBcIik7JyB0aXRsZT0nSGlkZSBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtbWludXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDEpICsgXCIpOycgdGl0bGU9J1Nob3cgbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA+PSAyKSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDIpICsgXCIpOycgdGl0bGU9J1VucGluIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1hcnJvdy1jaXJjbGUtZG93biB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAyKSArIFwiKTsnIHRpdGxlPSdQaW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS11cCB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9XHJcblx0XHRyZXMgKz0gXCI8L2xpPlwiO1xyXG5cdFx0cmVzICs9IFwiPC91bD5cIjtcclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDaGFubmVscygpIHtcclxuXHRcdHZhciByZXNwb25zZSA9IHV0aWxpdGllcy5nZXRBSkFYKCcvY2hhdC9jaGFubmVscycpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LXBvcHVwLWNoYW5uZWxzJz5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2Nsb3NlJyBvbmNsaWNrPSdjaGF0Ym94LnBhbmVsY2xvc2UoKTsnPkNsb3NlIDxzcGFuIGFyaWEtaGlkZGVuPSd0cnVlJz4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPSdzci1vbmx5Jz5DbG9zZTwvc3Bhbj48L2J1dHRvbj5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8aDM+Q2hhbm5lbHM8L2gzPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxwIGNsYXNzPSdob2xvLXRleHQnPkN1cnJlbnRseSBvbiA8Yj4jXCIgKyBjaGF0Ym94LmNoYW5uZWwgKyBcIjwvYj48L3A+XCI7XHJcblx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPGEgb25jbGljaz1cXFwiY2hhdGJveC5zd2l0Y2hDaGFubmVsKCdcIiArIHZhbHVlLm5hbWUgKyBcIicpO1xcXCI+I1wiICsgdmFsdWUubmFtZSArIFwiPC9hPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPlwiICsgdmFsdWUubWVzc2FnZXMgKyBcIiBtZXNzYWdlczwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxzcGFuIGNsYXNzPSdob2xvLXRleHQtc2Vjb25kYXJ5Jz5MYXN0IGFjdGl2ZSBcIiArIHV0aWxpdGllcy50aW1lQWdvKHZhbHVlLmxhc3RfbWVzc2FnZSkgKyBcIjwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPC9kaXY+XCI7XHJcblx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykuaHRtbChjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYXQoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LW1lc3NhZ2VzJz48L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1hY3Rpb25zJz5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaHJlZj0nL3RyYW5zcGFyZW5jeS9tYXJrZG93bicgdGFyZ2V0PSdfYmxhbmsnIGlkPSdjaGF0Ym94LW1hcmtkb3duJz5NYXJrZG93bjwvYT5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaWQ9J2NoYXRib3gtY2hhbm5lbHMnPkNoYW5uZWxzPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGlucHV0IHR5cGU9J3RleHQnIGlkPSdjaGF0Ym94LW1lc3NhZ2UnIC8+XCI7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhdGJveCkuaHRtbChjb250ZW50cyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDbG9zZSgpIHtcclxuXHRcdHRoaXMuZ2V0U3RhcnQoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRNZXNzYWdlKCkge1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlLFxyXG5cdFx0XHRyZXNwb25zZTtcclxuXHRcdG1lc3NhZ2UgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50cyxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwucG9zdE1lc3NhZ2UsIG1lc3NhZ2UpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJycpO1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2Utc2VudCcpO1xyXG5cdFx0XHRcdH0sIDE1MDApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3BvbnNlLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IGFyZSBub3QgbG9nZ2VkIGluIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlc3BvbnNlLmVycm9yID09PSAtMikge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IHdlcmUgbXV0ZWQgZm9yIG9uZSBob3VyIGJ5IGEgc3RhZmYgbWVtYmVyIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1RoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yLiAgUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdH0sIDI1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzd2l0Y2hDaGFubmVsKG5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIGRhdGEsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0ZGF0YSA9IHtcclxuXHRcdFx0Y2hhbm5lbDogbmFtZVxyXG5cdFx0fTtcclxuXHRcdHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9jaGFubmVscy9jaGVjaycsIGRhdGEpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0aWYocmVzcG9uc2UudmFsaWQpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmNoYW5uZWwgPSBuYW1lO1xyXG5cdFx0XHRcdGNoYXRib3guZ2V0U3RhcnQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnZXJyb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGlkOiB0aGlzLmxhc3RJZCxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldFVwZGF0ZSwgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVzLmxhc3RSZWZyZXNoID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZXMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjbGVhclRpbWVvdXQoY2hhdGJveC50aW1lb3V0VXBkYXRlKTtcclxuXHRcdFx0Y2hhdGJveC50aW1lb3V0VXBkYXRlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0fSwgMTAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlVGltZUFnbygpIHtcclxuXHRcdHZhciBtZXNzYWdlcyA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuZmluZCgnLm1zZycpO1xyXG5cdFx0JC5lYWNoKG1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdHZhciB0aW1lc3RhbXAgPSAkKHZhbHVlKS5maW5kKCd0aW1lJykuYXR0cignZGF0YS10cycpO1xyXG5cdFx0XHQkKHZhbHVlKS5maW5kKCd0aW1lJykuaHRtbCh1dGlsaXRpZXMudGltZUFnbyh0aW1lc3RhbXApKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG59IiwidmFyIGNsYW47XHJcbmNsYXNzIENsYW4ge1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHZhciB3YXJuaW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctd2FybmluZ3NdXCIpO1xyXG5cdFx0dmFyIHRlbXBCYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWRpYWxvZz1jbGFuLWRpYWxvZy10ZW1wb3JhcnktYmFuc11cIik7XHJcblx0XHR2YXIgYmFucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1kaWFsb2c9Y2xhbi1kaWFsb2ctYmFuc11cIik7XHJcblxyXG5cdFx0dGhpcy5zZXRMaXN0ZW4od2FybmluZ3MpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4odGVtcEJhbnMpO1xyXG5cdFx0dGhpcy5zZXRMaXN0ZW4oYmFucyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuKGRsZ3RyaWdnZXIpIHtcclxuXHRcdGlmKGRsZ3RyaWdnZXIpIHtcclxuXHRcdFx0dmFyIHNvbWVkaWFsb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkbGd0cmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS1kaWFsb2cnKSk7XHJcblx0XHRcdHZhciBkbGcgPSBuZXcgRGlhbG9nRngoc29tZWRpYWxvZyk7XHJcblx0XHRcdGRsZ3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkbGcudG9nZ2xlLmJpbmQoZGxnKSk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiLyoqXHJcbiAqIGRpYWxvZ0Z4LmpzIHYxLjAuMFxyXG4gKiBodHRwOi8vd3d3LmNvZHJvcHMuY29tXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTQsIENvZHJvcHNcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKi9cclxuOyggZnVuY3Rpb24oIHdpbmRvdyApIHtcclxuXHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgc3VwcG9ydCA9IHsgYW5pbWF0aW9ucyA6IE1vZGVybml6ci5jc3NhbmltYXRpb25zIH0sXHJcblx0XHRhbmltRW5kRXZlbnROYW1lcyA9IHsgJ1dlYmtpdEFuaW1hdGlvbicgOiAnd2Via2l0QW5pbWF0aW9uRW5kJywgJ09BbmltYXRpb24nIDogJ29BbmltYXRpb25FbmQnLCAnbXNBbmltYXRpb24nIDogJ01TQW5pbWF0aW9uRW5kJywgJ2FuaW1hdGlvbicgOiAnYW5pbWF0aW9uZW5kJyB9LFxyXG5cdFx0YW5pbUVuZEV2ZW50TmFtZSA9IGFuaW1FbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoICdhbmltYXRpb24nICkgXSxcclxuXHRcdG9uRW5kQW5pbWF0aW9uID0gZnVuY3Rpb24oIGVsLCBjYWxsYmFjayApIHtcclxuXHRcdFx0dmFyIG9uRW5kQ2FsbGJhY2tGbiA9IGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0XHRpZiggc3VwcG9ydC5hbmltYXRpb25zICkge1xyXG5cdFx0XHRcdFx0aWYoIGV2LnRhcmdldCAhPSB0aGlzICkgcmV0dXJuO1xyXG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCBhbmltRW5kRXZlbnROYW1lLCBvbkVuZENhbGxiYWNrRm4gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoIGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyApIHsgY2FsbGJhY2suY2FsbCgpOyB9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmKCBzdXBwb3J0LmFuaW1hdGlvbnMgKSB7XHJcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lciggYW5pbUVuZEV2ZW50TmFtZSwgb25FbmRDYWxsYmFja0ZuICk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0b25FbmRDYWxsYmFja0ZuKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdGZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcclxuXHRcdGZvciggdmFyIGtleSBpbiBiICkge1xyXG5cdFx0XHRpZiggYi5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XHJcblx0XHRcdFx0YVtrZXldID0gYltrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIERpYWxvZ0Z4KCBlbCwgb3B0aW9ucyApIHtcclxuXHRcdHRoaXMuZWwgPSBlbDtcclxuXHRcdHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xyXG5cdFx0ZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcclxuXHRcdHRoaXMuY3RybENsb3NlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnW2RhdGEtZGlhbG9nLWNsb3NlXScgKTtcclxuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuXHRcdC8vIGNhbGxiYWNrc1xyXG5cdFx0b25PcGVuRGlhbG9nIDogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHRcdG9uQ2xvc2VEaWFsb2cgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUuX2luaXRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHJcblx0XHQvLyBjbG9zZSBhY3Rpb25cclxuXHRcdHRoaXMuY3RybENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykgKTtcclxuXHJcblx0XHQvLyBlc2Mga2V5IGNsb3NlcyBkaWFsb2dcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSAyNyAmJiBzZWxmLmlzT3BlbiApIHtcclxuXHRcdFx0XHRzZWxmLnRvZ2dsZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0dGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnLmRpYWxvZ19fb3ZlcmxheScgKS5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpICk7XHJcblx0fVxyXG5cclxuXHREaWFsb2dGeC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRpZiggdGhpcy5pc09wZW4gKSB7XHJcblx0XHRcdGNsYXNzaWUucmVtb3ZlKCB0aGlzLmVsLCAnZGlhbG9nLS1vcGVuJyApO1xyXG5cdFx0XHRjbGFzc2llLmFkZCggc2VsZi5lbCwgJ2RpYWxvZy0tY2xvc2UnICk7XHJcblxyXG5cdFx0XHRvbkVuZEFuaW1hdGlvbiggdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnLmRpYWxvZ19fY29udGVudCcgKSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoIHNlbGYuZWwsICdkaWFsb2ctLWNsb3NlJyApO1xyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0XHQvLyBjYWxsYmFjayBvbiBjbG9zZVxyXG5cdFx0XHR0aGlzLm9wdGlvbnMub25DbG9zZURpYWxvZyggdGhpcyApO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNsYXNzaWUuYWRkKCB0aGlzLmVsLCAnZGlhbG9nLS1vcGVuJyApO1xyXG5cclxuXHRcdFx0Ly8gY2FsbGJhY2sgb24gb3BlblxyXG5cdFx0XHR0aGlzLm9wdGlvbnMub25PcGVuRGlhbG9nKCB0aGlzICk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmlzT3BlbiA9ICF0aGlzLmlzT3BlbjtcclxuXHR9O1xyXG5cclxuXHQvLyBhZGQgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5cdHdpbmRvdy5EaWFsb2dGeCA9IERpYWxvZ0Z4O1xyXG5cclxufSkoIHdpbmRvdyApOyIsInZhciBjb21iYXRDYWxjdWxhdG9yO1xyXG5jbGFzcyBDb21iYXRDYWxjdWxhdG9yIHtcclxuXHRjbGlja3M6IGFueSA9IHt9O1xyXG5cdGdlbmVyYXRlOiBhbnkgPSB7fTtcclxuXHRpbnB1dHM6IGFueSA9IHt9O1xyXG5cdG90aGVyOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmNsaWNrcyA9IHtcclxuXHRcdFx0c3VibWl0OiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdWJtaXQnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5nZW5lcmF0ZSA9IHtcclxuXHRcdFx0bGV2ZWw6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmxldmVsJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaW5wdXRzID0ge1xyXG5cdFx0XHRhdHRhY2s6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmF0dGFjayddXCIsXHJcblx0XHRcdGRlZmVuY2U6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmRlZmVuY2UnXVwiLFxyXG5cdFx0XHRzdHJlbmd0aDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3RyZW5ndGgnXVwiLFxyXG5cdFx0XHRjb25zdGl0dXRpb246IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOmNvbnN0aXR1dGlvbiddXCIsXHJcblx0XHRcdHJhbmdlZDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6cmFuZ2VkJ11cIixcclxuXHRcdFx0cHJheWVyOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpwcmF5ZXInXVwiLFxyXG5cdFx0XHRtYWdpYzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bWFnaWMnXVwiLFxyXG5cdFx0XHRzdW1tb25pbmc6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1bW1vbmluZyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLm90aGVyID0ge1xyXG5cdFx0XHRuYW1lOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpuYW1lJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGxvYWRDb21iYXQ6ICcvY2FsY3VsYXRvcnMvY29tYmF0L2xvYWQnXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmlucHV0cy5hdHRhY2spLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmRlZmVuY2UpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnN0cmVuZ3RoKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5jb25zdGl0dXRpb24pLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnJhbmdlZCkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucHJheWVyKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5tYWdpYykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3VtbW9uaW5nKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmNsaWNrcy5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLmdldExldmVscygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGdldExldmVscygpIHtcclxuXHRcdHZhciBuYW1lID0gJCh0aGlzLm90aGVyLm5hbWUpLnZhbCgpLFxyXG5cdFx0XHRkYXRhID0ge1xyXG5cdFx0XHRcdHJzbjogbmFtZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRsZXZlbHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5sb2FkQ29tYmF0LCBkYXRhKTtcclxuXHRcdGxldmVscy5kb25lKGZ1bmN0aW9uKGxldmVscykge1xyXG5cdFx0XHRsZXZlbHMgPSAkLnBhcnNlSlNPTihsZXZlbHMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmF0dGFjaykudmFsKGxldmVscy5hdHRhY2spO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmRlZmVuY2UpLnZhbChsZXZlbHMuZGVmZW5jZSk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuc3RyZW5ndGgpLnZhbChsZXZlbHMuc3RyZW5ndGgpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLmNvbnN0aXR1dGlvbikudmFsKGxldmVscy5jb25zdGl0dXRpb24pO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnJhbmdlZCkudmFsKGxldmVscy5yYW5nZWQpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnByYXllcikudmFsKGxldmVscy5wcmF5ZXIpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLm1hZ2ljKS52YWwobGV2ZWxzLm1hZ2ljKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdW1tb25pbmcpLnZhbChsZXZlbHMuc3VtbW9uaW5nKTtcclxuXHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHVwZGF0ZUxldmVsKCkge1xyXG5cdFx0dmFyIG1lbGVlID0gdGhpcy52YWwoJ2F0dGFjaycpICsgdGhpcy52YWwoJ3N0cmVuZ3RoJyk7XHJcblx0XHR2YXIgbWFnaWMgPSAyICogdGhpcy52YWwoJ21hZ2ljJyk7XHJcblx0XHR2YXIgcmFuZ2VkID0gMiAqIHRoaXMudmFsKCdyYW5nZWQnKTtcclxuXHRcdHZhciBkZWYgPSB0aGlzLnZhbCgnZGVmZW5jZScpICsgdGhpcy52YWwoJ2NvbnN0aXR1dGlvbicpO1xyXG5cdFx0dmFyIG90aGVyID0gKC41ICogdGhpcy52YWwoJ3ByYXllcicpKSArICguNSAqIHRoaXMudmFsKCdzdW1tb25pbmcnKSk7XHJcblx0XHR2YXIgbGV2ZWwgPSAoMTMvMTApICogTWF0aC5tYXgobWVsZWUsIG1hZ2ljLCByYW5nZWQpICsgZGVmICsgb3RoZXI7XHJcblx0XHRsZXZlbCAqPSAuMjU7XHJcblx0XHRsZXZlbCA9IE1hdGguZmxvb3IobGV2ZWwpO1xyXG5cdFx0JCh0aGlzLmdlbmVyYXRlLmxldmVsKS5odG1sKGxldmVsKTtcclxuXHR9XHJcblx0dmFsKG5hbWU6IHN0cmluZykge1xyXG5cdFx0cmV0dXJuIHBhcnNlSW50KCQoXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6XCIgKyBuYW1lICsgXCInXVwiKS52YWwoKSk7XHJcblx0fVxyXG59IiwidmFyIGNvbnRhY3Q7XHJcbmNsYXNzIENvbnRhY3Qge1xyXG5cdGRhdGE6IGFueSA9IHt9O1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRob29rczogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZGF0YSA9IHtcclxuXHRcdFx0c2VudDogZmFsc2VcclxuXHRcdH07XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRlbWFpbDogJyNjb250YWN0LWVtYWlsJyxcclxuXHRcdFx0ZXJyb3I6ICcjY29udGFjdC1lcnJvcicsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY29udGFjdC1tZXNzYWdlJyxcclxuXHRcdFx0dXNlcm5hbWU6ICcjY29udGFjdC11c2VybmFtZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWhvb2s9J2NvbnRhY3Q6c3VibWl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGZvcm06ICcvY29udGFjdC9zdWJtaXQnXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbnRhY3Quc2VuZCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZG9uZShtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtc3VjY2Vzc1wiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtZGFuZ2VyXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNlbmQoKSB7XHJcblx0XHRpZih0aGlzLmRhdGEuc2VudCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5kb25lKFwiWW91IGhhdmUgYWxyZWFkeSBzZW50IHlvdXIgbWVzc2FnZSFcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGVtYWlsID0gJCh0aGlzLmVsZW1lbnRzLmVtYWlsKS52YWwoKSxcclxuXHRcdFx0bWVzc2FnZSA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlKS52YWwoKSxcclxuXHRcdFx0dXNlcm5hbWUgPSAkKHRoaXMuZWxlbWVudHMudXNlcm5hbWUpLnZhbCgpO1xyXG5cclxuXHRcdC8vIENoZWNrIGVtYWlsXHJcblx0XHRpZih0aGlzLnZhbGlkYXRlRW1haWwoZW1haWwpID09PSBmYWxzZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcnJvcihcIlRoYXQgaXMgbm90IGEgdmFsaWRhdGUgZW1haWwgYWRkcmVzcy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBtZXNzYWdlLFxyXG5cdFx0XHRlbWFpbDogZW1haWwsXHJcblx0XHRcdHVzZXJuYW1lOiB1c2VybmFtZVxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuZm9ybSwgZGF0YSk7XHJcblx0XHR0aGlzLndhcm5pbmcoXCJTZW5kaW5nIG1lc3NhZ2UuLi5cIik7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y29udGFjdC5kYXRhLnNlbnQgPSB0cnVlO1xyXG5cdFx0XHRcdGNvbnRhY3QuZG9uZShcIllvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50LlwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb250YWN0LmVycm9yKFwiVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3Igd2hpbGUgc2VuZGluZyB5b3VyIG1lc3NhZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHZhbGlkYXRlRW1haWwoZW1haWw6IGFueSkge1xyXG5cdFx0dmFyIHJlID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcblx0XHRyZXR1cm4gcmUudGVzdChlbWFpbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgd2FybmluZyhtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikuaHRtbChtZXNzYWdlKTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lcnJvcikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhcInRleHQtd2FybmluZ1wiKTtcclxuXHR9XHJcbn0iLCJ2YXIgZm9ydW1zO1xyXG5jbGFzcyBGb3J1bXMge1xyXG5cdHB1YmxpYyBlbGVtZW50czogYW55ID0ge307XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwb3N0OiBQb3N0ID0gbnVsbDtcclxuXHRwdWJsaWMgdGhyZWFkQ3JlYXRlOiBGb3J1bXNUaHJlYWRDcmVhdGUgPSBudWxsO1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdCdwb3N0RWRpdG9yJzogXCJbcnQtZGF0YT0ncG9zdC5lZGl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHBvbGw6IHtcclxuXHRcdFx0XHR2b3RlOiBcIltydC1ob29rPSdmb3J1bTpwb2xsLnZvdGUnXVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRwb2xsOiB7XHJcblx0XHRcdFx0dm90ZTogJy9mb3J1bXMvcG9sbC92b3RlJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR2b3RlOiBmdW5jdGlvbihpZDogbnVtYmVyKSB7IHJldHVybiAnL2ZvcnVtcy9wb3N0LycgKyBpZCArICcvdm90ZSc7IH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBvc3QgPSBuZXcgUG9zdCgpO1xyXG5cdFx0JCgnLnVwdm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMudXB2b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJy5kb3dudm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMuZG93bnZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JChcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLnBvc3Q6cXVvdGUnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgaWQgPSAkKGUudGFyZ2V0KS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdGZvcnVtcy5wb3N0LnF1b3RlKGlkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnBvbGwudm90ZSkuY2xpY2soZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBkYXRhID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHRcdGZvcnVtcy5wb2xsVm90ZShkYXRhLnF1ZXN0aW9uLCBkYXRhLmFuc3dlcik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb3dudm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAnZG93bidcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwb2xsVm90ZShxdWVzdGlvbklkOiBudW1iZXIsIGFuc3dlcklkOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRhbnN3ZXI6IGFuc3dlcklkLFxyXG5cdFx0XHRxdWVzdGlvbjogcXVlc3Rpb25JZFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucG9sbC52b3RlLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3VsdHMuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQvLyBUaGUgdXNlciB3YXMgbm90IGxvZ2dlZCBpblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBVbmtub3duIGVycm9yXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vIFRPRE86IE1ha2UgYW4gZXJyb3IgZGl2XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwdm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc1Vwdm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0JChwb3N0KS5hZGRDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ3VwJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB2b3RlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMudm90ZShwb3N0SWQpLCBkYXRhKTtcclxuXHRcdHZvdGUuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5jbGFzcyBQb3N0IHtcclxuXHRwdWJsaWMgcXVvdGUoaWQ6IGFueSkge1xyXG5cdFx0dmFyIHNvdXJjZSA9ICQoXCJbcnQtZGF0YT0ncG9zdCNcIiArIGlkICtcIjpzb3VyY2UnXVwiKS5odG1sKCksXHJcblx0XHRcdHBvc3RDb250ZW50cyA9ICQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbCgpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoL1xcbi9nLCAnXFxuPicpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZsdDsvZywgJzwnKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XHJcblx0XHRzb3VyY2UgPSBcIj5cIiArIHNvdXJjZTtcclxuXHRcdGlmKHBvc3RDb250ZW50cy5sZW5ndGggPiAwKVxyXG5cdFx0XHRwb3N0Q29udGVudHMgKz0gXCJcXG5cIjtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbChwb3N0Q29udGVudHMgKyBzb3VyY2UgKyBcIlxcblwiKTtcclxuXHRcdHV0aWxpdGllcy5zY3JvbGxUbygkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKSwgMTAwMCk7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS5mb2N1cygpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRm9ydW1zVGhyZWFkQ3JlYXRlIHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBxdWVzdGlvbnM6IEFycmF5ID0gW107XHJcblx0cHVibGljIHZhbHVlczogYW55ID0ge307XHJcblx0cHVibGljIHZpZXdzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRxdWVzdGlvbkFkZDogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbi5hZGQnXVwiLFxyXG5cdFx0XHRxdWVzdGlvbnM6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb25zJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gQXJyYXkoNTAwKTtcclxuXHRcdHRoaXMudmFsdWVzID0ge1xyXG5cdFx0XHRxdWVzdGlvbnM6IDBcclxuXHRcdH07XHJcblx0XHR0aGlzLnZpZXdzID0ge1xyXG5cdFx0XHRhbnN3ZXI6ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5hbnN3ZXInXVwiKS5odG1sKCksXHJcblx0XHRcdHF1ZXN0aW9uOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24nXVwiKS5odG1sKClcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25BZGQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24oKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRwdWJsaWMgYWRkUXVlc3Rpb24oKSB7XHJcblx0XHR2YXIgaHRtbCA9IHRoaXMudmlld3MucXVlc3Rpb247XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25zKS5hcHBlbmQoaHRtbCk7XHJcblx0XHR0aGlzLnZhbHVlcy5xdWVzdGlvbnMgKz0gMTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZW1vdmVRdWVzdGlvbihudW1iZXI6IG51bWJlcikge1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMuc3BsaWNlKG51bWJlciwgMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuZXIoZWxlbWVudCwgdHlwZSkge1xyXG5cdFx0aWYodHlwZSA9PT0gXCJyZW1vdmUgcXVlc3Rpb25cIikge1xyXG5cdFx0XHR0aGlzLnNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudDogYW55KSB7XHJcblx0XHQkKGVsZW1lbnQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24oJChlbGVtZW50KS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdydC1kYXRhJykpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdGZvcnVtcyA9IG5ldyBGb3J1bXMoKTtcclxufSk7IiwiY2xhc3MgTGl2ZXN0cmVhbVJlc2V0IHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBsYW5nOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdG5vdGU6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6bm90ZSddXCIsXHJcblx0XHRcdHNwaW5uZXI6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3Bpbm5lciddXCIsXHJcblx0XHRcdHN0YXR1czogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzdGF0dXMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5sYW5nID0ge1xyXG5cdFx0XHRjaGVja2luZzogJ2NoZWNraW5nJyxcclxuXHRcdFx0b2ZmbGluZTogJ29mZmxpbmUnLFxyXG5cdFx0XHRvbmxpbmU6ICdvbmxpbmUnLFxyXG5cdFx0XHR1bmtub3duOiAndW5rbm93bidcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRyZXNldDogJy9saXZlc3RyZWFtL3Jlc2V0J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucmVzZXQoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVzZXQoKSB7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDF9KTtcclxuXHRcdHZhciBzdGF0dXMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5yZXNldCwge30pO1xyXG5cdFx0c3RhdHVzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5vbmxpbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lKCk7XHJcblx0XHRcdH0gZWxzZSBpZihyZXN1bHRzLm9ubGluZSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNVbmtub3duKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAwfSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3Bpbm5lclJlbW92ZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zcGlubmVyKS5jc3Moe1xyXG5cdFx0XHRvcGFjaXR5OiAwXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNlcyhjaGVja2luZzogc3RyaW5nLCBvbmxpbmU6IHN0cmluZywgb2ZmbGluZTogc3RyaW5nLCB1bmtub3duOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMubGFuZy5jaGVja2luZyA9IGNoZWNraW5nO1xyXG5cdFx0dGhpcy5sYW5nLm9mZmxpbmUgPSBvZmZsaW5lO1xyXG5cdFx0dGhpcy5sYW5nLm9ubGluZSA9IG9ubGluZTtcclxuXHRcdHRoaXMubGFuZy51bmtub3duID0gdW5rbm93bjtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPZmZsaW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9mZmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LWRhbmdlcicpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09ubGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvbmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNVbmtub3duKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcInVua25vd25cIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXdhcm5pbmcnKTtcclxuXHR9XHJcbn0iLCJ2YXIgcnVuZXRpbWU7XHJcbmNsYXNzIFJ1bmVUaW1lIHtcclxuXHRsb2FkaW5nOnN0cmluZyA9ICcjbG9hZGluZyc7XHJcbn1cclxucnVuZXRpbWUgPSBuZXcgUnVuZVRpbWUoKTtcclxuJChmdW5jdGlvbiAoKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblx0JCgnW2RhdGEtdG9nZ2xlXScpLnRvb2x0aXAoKTtcclxuXHQkKCcuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oKTtcclxuXHQkKCd0Ym9keS5yb3dsaW5rJykucm93bGluaygpO1xyXG5cdCQoJyN0b3AnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHQkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcblx0XHRcdHNjcm9sbFRvcDogMFxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fSk7XHJcblx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaGVpZ2h0ID0gJCgnYm9keScpLmhlaWdodCgpLFxyXG5cdFx0XHRzY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcblx0XHRcdHRvcCA9ICQoJyN0b3AnKTtcclxuXHRcdGlmKHNjcm9sbCA+IGhlaWdodC8xMCkge1xyXG5cdFx0XHRpZighJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZUluKDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZigkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlT3V0KDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblx0JCgnLm5hdmJhciAuZHJvcGRvd24nKS5ob3ZlcihmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuZGVsYXkoNTApLnNsaWRlRG93bigpO1xyXG5cdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5kZWxheSgxMDApLnNsaWRlVXAoKVxyXG5cdH0pO1xyXG59KTsiLCJ2YXIgbmFtZUNoZWNrZXI7XHJcbmNsYXNzIE5hbWVDaGVja2VyIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bm90QWxsb3dlZDogYW55ID0gW107XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0YXZhaWxhYmlsaXR5OiAnI3Jzbi1hdmFpbGFiaWxpdHknLFxyXG5cdFx0XHRjaGVjazogJyNyc24tY2hlY2stZmllbGQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ub3RBbGxvd2VkID0gWydablZqYXc9PScsICdjMmhwZEE9PSddO1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2s6ICcvbmFtZS1jaGVjaydcclxuXHRcdH07XHJcblx0XHQkKFwiW3J0LWhvb2s9J25hbWUuY2hlY2tlcjpzdWJtaXQnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKHZhbHVlOiBhbnkpIHtcclxuXHRcdFx0bmFtZUNoZWNrZXIuY2hlY2soKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRjaGVjaygpIHtcclxuXHRcdHZhciBuYW1lID0gJCgnI3Jzbi1jaGVjay1maWVsZCcpLnZhbCgpO1xyXG5cdFx0dmFyIGNoZWNrTmFtZSA9IHRoaXMuY2hlY2tOYW1lKG5hbWUpO1xyXG5cdFx0aWYoY2hlY2tOYW1lID09PSAwKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJZb3UgZGlkIG5vdCBlbnRlciBhbnl0aGluZy5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSAxKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gaXMgb3ZlciAxMiBjaGFyYWN0ZXJzLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDIpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBpcyB1bmRlciAzIGNoYXJhY3RlcnMuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gMykge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IHN0YXJ0cyB3aXRoIHRoZSB3b3JkIE1vZC5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSA0KSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gY29udGFpbnMgYSBzd2VhciB3b3JkLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDUpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH07XHJcblx0XHRcdHZhciBkZXRhaWxzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuY2hlY2ssIGRhdGEpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuYXZhaWxhYmlsaXR5KS5odG1sKCdMb2FkaW5nLi4uJyk7XHJcblx0XHRcdGRldGFpbHMuZG9uZShmdW5jdGlvbihkZXRhaWxzOiBzdHJpbmcpIHtcclxuXHRcdFx0XHR2YXIgYXZhaWxhYmxlID0gZmFsc2U7XHJcblx0XHRcdFx0aWYoZGV0YWlscy5zdWJzdHJpbmcoMCwgNikgPT09IFwiPGh0bWw+XCIpIHtcclxuXHRcdFx0XHRcdGF2YWlsYWJsZSA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKGF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0bmFtZUNoZWNrZXIuYXZhaWxhYmxlKG5hbWUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRuYW1lQ2hlY2tlci51bmF2YWlsYWJsZSgnVGhlIFJ1bmVzY2FwZSBuYW1lIDxiPicgKyBuYW1lICsgJzwvYj4gaXMgbm90IGF2YWlsYWJsZS4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRhdmFpbGFibGUobmFtZTogc3RyaW5nKSB7XHJcblx0XHQkKG5hbWVDaGVja2VyLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbCgnVGhlIFJ1bmVTY2FwZSBuYW1lIDxiPicgKyBuYW1lICsgJzwvYj4gaXMgYXZhaWxhYmxlLicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdGNvbG9yOiAnZ3JlZW4nXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tOYW1lKG5hbWU6IGFueSkge1xyXG5cdFx0aWYodHlwZW9mKG5hbWUpID09PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMTIpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fSBlbHNlIGlmIChuYW1lLmxlbmd0aCA8IDMpIHtcclxuXHRcdFx0XHRyZXR1cm4gMjtcclxuXHRcdFx0fSBlbHNlIGlmIChuYW1lLnN1YnN0cmluZygwLCAzKSA9PT0gJ01vZCcpIHtcclxuXHRcdFx0XHRyZXR1cm4gMztcclxuXHRcdFx0fVxyXG5cdFx0XHQkLmVhY2godGhpcy5ub3RBbGxvd2VkLCBmdW5jdGlvbiAoa2V5Om51bWJlciwgdmFsdWU6YW55KSB7XHJcblx0XHRcdFx0dmFyIGRlY29kZSA9IGF0b2IodmFsdWUpO1xyXG5cdFx0XHRcdGlmIChuYW1lLmluZGV4T2YoZGVjb2RlKSA+IC0xKVxyXG5cdFx0XHRcdFx0cmV0dXJuIDQ7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIDU7XHJcblx0fVxyXG5cdHVuYXZhaWxhYmxlKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbChtZXNzYWdlKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHRjb2xvcjogJ3JlZCdcclxuXHRcdFx0fSk7XHJcblx0fVxyXG59IiwidmFyIG5ld3M7XHJcbmNsYXNzIE5ld3Mge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRob29rczogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IHtcclxuXHRcdFx0XHRjb250ZW50czogXCIjbmV3cy1jb21tZW50LXRleHRhcmVhXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IHtcclxuXHRcdFx0XHRzdWJtaXQ6IFwiW3J0LWhvb2s9J25ld3MuYXJ0aWNsZTpjb21tZW50LnN1Ym1pdCddXCJcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNvbW1lbnQ6IGZ1bmN0aW9uKGlkOiBhbnkpIHtcclxuXHRcdFx0XHRyZXR1cm4gXCIvbmV3cy9cIiArIGlkICsgXCItbmFtZS9yZXBseVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3ZlcmxheScpO1xyXG5cdFx0dmFyIG92ZXJsYXlDbG9zZSA9IG92ZXJsYXkucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XHJcblx0XHR2YXIgaGVhZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlYWRlcicpO1xyXG5cdFx0dmFyIHN3aXRjaEJ0bm4gPSBoZWFkZXIucXVlcnlTZWxlY3RvcignYnV0dG9uLnNsaWRlci1zd2l0Y2gnKTtcclxuXHRcdHZhciB0b2dnbGVCdG5uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKHNsaWRlc2hvdy5pc0Z1bGxzY3JlZW4pIHtcclxuXHRcdFx0XHRjbGFzc2llLmFkZChzd2l0Y2hCdG5uLCAndmlldy1tYXhpJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoc3dpdGNoQnRubiwgJ3ZpZXctbWF4aScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHRvZ2dsZUN0cmxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFzbGlkZXNob3cuaXNDb250ZW50KSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQoaGVhZGVyLCAnaGlkZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHRvZ2dsZUNvbXBsZXRlQ3RybHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoIXNsaWRlc2hvdy5pc0NvbnRlbnQpIHtcclxuXHRcdFx0XHRjbGFzc2llLnJlbW92ZShoZWFkZXIsICdoaWRlJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR2YXIgc2xpZGVzaG93ID0gbmV3IERyYWdTbGlkZXNob3coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlc2hvdycpLCB7XHJcblx0XHRcdC8vIHRvZ2dsZSBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG1pbmltaXplZCBzbGlkZXNob3dcclxuXHRcdFx0b25Ub2dnbGU6IHRvZ2dsZUJ0bm4sXHJcblx0XHRcdC8vIHRvZ2dsZSB0aGUgbWFpbiBpbWFnZSBhbmQgdGhlIGNvbnRlbnQgdmlld1xyXG5cdFx0XHRvblRvZ2dsZUNvbnRlbnQ6IHRvZ2dsZUN0cmxzLFxyXG5cdFx0XHQvLyB0b2dnbGUgdGhlIG1haW4gaW1hZ2UgYW5kIHRoZSBjb250ZW50IHZpZXcgKHRyaWdnZXJlZCBhZnRlciB0aGUgYW5pbWF0aW9uIGVuZHMpXHJcblx0XHRcdG9uVG9nZ2xlQ29udGVudENvbXBsZXRlOiB0b2dnbGVDb21wbGV0ZUN0cmxzXHJcblx0XHR9KTtcclxuXHRcdHZhciB0b2dnbGVTbGlkZXNob3cgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2xpZGVzaG93LnRvZ2dsZSgpO1xyXG5cdFx0XHR0b2dnbGVCdG5uKCk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGNsb3NlT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjbGFzc2llLmFkZChvdmVybGF5LCAnaGlkZScpO1xyXG5cdFx0fTtcclxuXHRcdC8vIHRvZ2dsZSBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIHNtYWxsIHNsaWRlc2hvd1xyXG5cdFx0c3dpdGNoQnRubi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZVNsaWRlc2hvdyk7XHJcblx0XHQvLyBjbG9zZSBvdmVybGF5XHJcblx0XHRvdmVybGF5Q2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZU92ZXJsYXkpO1xyXG5cclxuXHRcdGlmKGxvY2FsU3RvcmFnZSkge1xyXG5cdFx0XHR2YXIgc2hvd2VkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ25ld3MuaW5mby5zaG93ZWQnKTtcclxuXHRcdFx0aWYoc2hvd2VkID09PSAndHJ1ZScpIHtcclxuXHRcdFx0XHRjbG9zZU92ZXJsYXkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuc2V0dXBBY3Rpb25zKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0dXBBY3Rpb25zKCkge1xyXG5cdFx0JChcImRpdi5pbmZvIGJ1dHRvblwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYobG9jYWxTdG9yYWdlKSB7XHJcblx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25ld3MuaW5mby5zaG93ZWQnLCAndHJ1ZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5ob29rcy5jb21tZW50LnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0dmFyIGNvbnRlbnRzID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCgndGV4dGFyZWEnKS52YWwoKTtcclxuXHRcdFx0bmV3cy5zdWJtaXRDb21tZW50KGlkLCBjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRDb21tZW50KGlkLCBjb250ZW50cykge1xyXG5cdFx0aWYoY29udGVudHMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5jb21tZW50KGlkKSwgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSByZXN1bHRzLnVybDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBlcnJvclxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHRvQ29tbWVudHMoaWQ6IG51bWJlcikge1xyXG5cdFx0JChcIltkYXRhLWNvbnRlbnQ9J2NvbnRlbnQtXCIgKyBpZCArXCInXSBidXR0b24uY29udGVudC1zd2l0Y2hcIikudHJpZ2dlcignY2xpY2snKTtcclxuXHR9XHJcbn0iLCJjbGFzcyBOb3RpZmljYXRpb25zIHtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIHBhdGhzOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucGF0aHMgPSB7XHJcbiAgICAgICAgICAgIG1hcmtSZWFkOiAnL25vdGlmaWNhdGlvbnMvbWFyay1yZWFkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJChcIltydC1ob29rPSdob29rIW5vdGlmaWNhdGlvbnM6bWFyay5yZWFkJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmF0dHIoJ3J0LWRhdGEnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgcmFkaW87XHJcbnZhciBjaGF0Ym94O1xyXG5jbGFzcyBSYWRpbyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdG9ubGluZTogYm9vbGVhbiA9IHRydWU7XHJcblx0cG9wdXA6IGFueSA9IG51bGw7XHJcblx0c3RhdHVzOiBib29sZWFuID0gZmFsc2U7XHJcblx0c3RhdHVzQ2xvc2VkOiBzdHJpbmcgPSAnJztcclxuXHRzdGF0dXNPcGVuOiBzdHJpbmcgPSAnJztcclxuXHRVUkw6IHN0cmluZyA9ICcnO1xyXG5cdHZhck1lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG5cdHZhclN0YXR1czogc3RyaW5nID0gJyc7XHJcblxyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuVVJMID0gJ2h0dHA6Ly9hcHBzLnN0cmVhbWxpY2Vuc2luZy5jb20vcGxheWVyLXBvcHVwLnBocD9zaWQ9MjU3OSZzdHJlYW1faWQ9NDM4Nic7XHJcblx0XHR0aGlzLnN0YXR1c0Nsb3NlZCA9ICd0byBsaXN0ZW4gdG8gUnVuZVRpbWUgUmFkaW8hJztcclxuXHRcdHRoaXMuc3RhdHVzT3BlbiA9ICd0byBjbG9zZSBSdW5lVGltZSBSYWRpbyc7XHJcblx0XHR0aGlzLnZhck1lc3NhZ2UgPSAnI3JhZGlvLW1lc3NhZ2UnO1xyXG5cdFx0dGhpcy52YXJTdGF0dXMgPSAnI3JhZGlvLXN0YXR1cyc7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0c3RhdHVzTWVzc2FnZTogJyNyYWRpby1zdGF0dXMtbWVzc2FnZSdcclxuXHRcdH07XHJcblx0XHQkKCcjcmFkaW8tbGluaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighcmFkaW8uc3RhdHVzKSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9PcGVuKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmFkaW8taGlzdG9yeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuSGlzdG9yeSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ucmVxdWVzdE9wZW4oKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby10aW1ldGFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblRpbWV0YWJsZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5wdWxsSGlkZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3Blbkhpc3RvcnkoKSB7XHJcblx0XHR2YXIgaGlzdG9yeSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9oaXN0b3J5Jyk7XHJcblx0XHRoaXN0b3J5LmRvbmUoZnVuY3Rpb24oaGlzdG9yeTogc3RyaW5nKSB7XHJcblx0XHRcdGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuXHRcdFx0dmFyIG11c2ljID0gbnVsbCxcclxuXHRcdFx0XHRodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlJz48dGhlYWQ+PHRyPjx0ZD5UaW1lPC90ZD48dGQ+QXJ0aXN0PC90ZD48dGQ+TmFtZTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IGhpc3RvcnkubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0bXVzaWMgPSBoaXN0b3J5W3hdO1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3BlblRpbWV0YWJsZSgpIHtcclxuXHRcdHZhciB0aW1ldGFibGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdGltZXRhYmxlJyk7XHJcblx0XHR0aW1ldGFibGUuZG9uZShmdW5jdGlvbih0aW1ldGFibGU6IHN0cmluZykge1xyXG5cdFx0XHR0aW1ldGFibGUgPSAkLnBhcnNlSlNPTih0aW1ldGFibGUpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0ZXh0LWNlbnRlcic+PHRoZWFkPjx0cj48dGQ+Jm5ic3A7PC90ZD48dGQ+TW9uZGF5PC90ZD48dGQ+VHVlc2RheTwvdGQ+PHRkPldlZG5lc2RheTwvdGQ+PHRkPlRodXJzZGF5PC90ZD48dGQ+RnJpZGF5PC90ZD48dGQ+U2F0dXJkYXk8L3RkPjx0ZD5TdW5kYXk8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSAyMzsgeCA8PSB5OyB4KyspIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHRyPjx0ZD5cIiArIHggKyBcIjowMDwvdGQ+XCI7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDY7IGkgPD0gajsgaSsrKSB7XHJcblx0XHRcdFx0XHRodG1sICs9IFwiPHRkPlwiO1xyXG5cdFx0XHRcdFx0aWYodGltZXRhYmxlW2ldICE9PSB1bmRlZmluZWQgJiYgdGltZXRhYmxlW2ldW3hdICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSB0aW1ldGFibGVbaV1beF07XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IFwiJm5ic3A7XCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjwvdGQ+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sICs9IFwiPC90cj5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvbmxpbmVTZXR0aW5ncygpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHRoaXMucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlRoZSByYWRpbyBoYXMgYmVlbiBzZXQgb2ZmbGluZS5cIik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsSGlkZSgpIHtcclxuXHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbCgnJm5ic3A7Jyk7XHJcblx0XHQkKCcjcmFkaW8tcHVsbCcpLndpZHRoKCcnKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS53aWR0aCgnJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsT3Blbihjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvQ2xvc2UoKSB7XHJcblx0XHRpZih0aGlzLnBvcHVwKSB7XHJcblx0XHRcdHRoaXMucG9wdXAuY2xvc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c0Nsb3NlZCk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IGZhbHNlO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cylcclxuXHRcdFx0LnJlbW92ZUNsYXNzKCd0ZXh0LXN1Y2Nlc3MnKVxyXG5cdFx0XHQuYWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJylcclxuXHRcdFx0Lmh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T2ZmXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvT3BlbigpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnBvcHVwID0gd2luZG93Lm9wZW4odGhpcy5VUkwsICdSdW5lVGltZSBSYWRpbycsICd3aWR0aD0zODksaGVpZ2h0PTM1OScpO1xyXG5cdFx0dGhpcy5zdGF0dXMgPSB0cnVlO1xyXG5cdFx0JCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNPcGVuKTtcclxuXHRcdCQodGhpcy52YXJTdGF0dXMpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygndGV4dC1kYW5nZXInKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpLlxyXG5cdFx0XHRodG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9uXCIpO1xyXG5cdFx0dmFyIHBvbGxUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHJhZGlvLnBvcHVwLmNsb3NlZCAhPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xyXG5cdFx0XHRcdHJhZGlvLnJhZGlvQ2xvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVxdWVzdE9wZW4oKSB7XHJcblx0XHR2YXIgcmVxdWVzdCA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnKTtcclxuXHRcdHJlcXVlc3QuZG9uZShmdW5jdGlvbihyZXF1ZXN0OiBzdHJpbmcpIHtcclxuXHRcdFx0cmVxdWVzdCA9ICQucGFyc2VKU09OKHJlcXVlc3QpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKHJlcXVlc3QucmVzcG9uc2UgPT09IDIpIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPGZvcm0gcm9sZT0nZm9ybSc+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1hcnRpc3QnPkFydGlzdCBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtYXJ0aXN0JyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LWFydGlzdCcgcGxhY2Vob2xkZXI9J0FydGlzdCBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtbmFtZSc+U29uZyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtbmFtZScgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1uYW1lJyBwbGFjZWhvbGRlcj0nU29uZyBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxwIGlkPSdyZXF1ZXN0LWJ1dHRvbicgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+UmVxdWVzdDwvcD48L2Rpdj48L2Zvcm0+XCI7XHJcblx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAxKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LXdhcm5pbmcnPkF1dG8gREogY3VycmVudGx5IGRvZXMgbm90IGFjY2VwdCBzb25nIHJlcXVlc3RzLCBzb3JyeSFcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5Zb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gcmVxdWVzdCBhIHNvbmcgZnJvbSB0aGUgREouPC9wPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyYWRpby5wdWxsT3BlbihodG1sKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmFkaW8ucmVxdWVzdFNlbmQoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LCAzMDAwKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZXF1ZXN0U2VuZCgpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQnYXJ0aXN0JzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtYXJ0aXN0JykudmFsdWUsXHJcblx0XHRcdCduYW1lJzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtbmFtZScpLnZhbHVlXHJcblx0XHR9O1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnLCBkYXRhKTtcclxuXHRcdGNvbnRlbnRzLmRvbmUoZnVuY3Rpb24oY29udGVudHM6IHN0cmluZykge1xyXG5cdFx0XHRjb250ZW50cyA9ICQucGFyc2VKU09OKGNvbnRlbnRzKTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihjb250ZW50cy5zZW50ID09PSB0cnVlKSB7XHJcblx0XHRcdFx0aHRtbCA9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+WW91ciByZXF1ZXN0IGhhcyBiZWVuIHNlbnQgdG8gdGhlIERKPC9wPlwiO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+VGhlcmUgd2FzIGFuIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0LiAgVHJ5IGFnYWluP1wiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoaHRtbCk7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucHVsbEhpZGUoKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwoJycpO1xyXG5cdFx0dmFyIHVwZGF0ZSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby91cGRhdGUnKTtcclxuXHRcdHVwZGF0ZS5kb25lKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG5cdFx0XHR1cGRhdGUgPSAkLnBhcnNlSlNPTih1cGRhdGUpO1xyXG5cdFx0XHR2YXIgcmVxdWVzdHNIVE1MID0gXCJcIjtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctbmFtZScpLmh0bWwodXBkYXRlWydzb25nJ11bJ25hbWUnXSk7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLWFydGlzdCcpLmh0bWwodXBkYXRlWydzb25nJ11bJ2FydGlzdCddKTtcclxuXHRcdFx0aWYodXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJBdXRvIERKXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gJycgJiYgdXBkYXRlWydtZXNzYWdlJ10gIT09IC0xKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbCh1cGRhdGVbJ21lc3NhZ2UnXSk7XHJcblx0XHRcdH0gZWxzZSBpZih1cGRhdGVbJ21lc3NhZ2UnXSA9PT0gLTEgJiYgdXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10gKyBcIiBpcyBjdXJyZW50bHkgb24gYWlyIVwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiQXV0byBESiBpcyBjdXJyZW50bHkgb24gYWlyXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gdXBkYXRlWydyZXF1ZXN0cyddLmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gdXBkYXRlWydyZXF1ZXN0cyddW3hdO1xyXG5cdFx0XHRcdGlmKHJlcXVlc3Quc3RhdHVzID09IDApIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwPlwiO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PSAxKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMikge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5cIjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJlcXVlc3RzSFRNTCArPSByZXF1ZXN0LnNvbmdfbmFtZSArIFwiIGJ5IFwiICsgcmVxdWVzdC5zb25nX2FydGlzdDtcclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8L3A+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKHJlcXVlc3RzSFRNTCk7XHJcblxyXG5cdFx0XHRyYWRpby5vbmxpbmUgPSB1cGRhdGUub25saW5lO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJhZGlvLnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAzMDAwMCk7XHJcblx0XHRcdHJhZGlvLm9ubGluZVNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbmF0dXJlO1xyXG5jbGFzcyBTaWduYXR1cmUge1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRzdWJtaXQ6ICcvc2lnbmF0dXJlcydcclxuXHRcdH07XHJcblx0XHR2YXIgdGhlRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduYXR1cmUtZm9ybScpO1xyXG5cdFx0bmV3IHN0ZXBzRm9ybSggdGhlRm9ybSwge1xyXG5cdFx0XHRvblN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHVzZXJuYW1lID0gJCgnI3ExJykudmFsKCk7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0XHR1c2VybmFtZTogdXNlcm5hbWVcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHV0aWxpdGllcy5wb3N0KHNpZ25hdHVyZS5wYXRocy5zdWJtaXQsIGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblx0fVxyXG59IiwidmFyIHNpZ251cEZvcm07XHJcbmNsYXNzIFNpZ251cEZvcm0ge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRkaXNwbGF5TmFtZTogJyNkaXNwbGF5X25hbWUnLFxyXG5cdFx0XHRlbWFpbDogJyNlbWFpbCcsXHJcblx0XHRcdHBhc3N3b3JkOiAnI3Bhc3N3b3JkJyxcclxuXHRcdFx0cGFzc3dvcmQyOiAnI3Bhc3N3b3JkMicsXHJcblx0XHRcdHNlY3VyaXR5Q2hlY2s6ICcjc2VjdXJpdHknXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2tBdmFpbGFiaWxpdHk6ICcvZ2V0L3NpZ251cC8nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQsXHJcblx0XHRcdHRpbWVvdXQgPSA1MDA7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdkaXNwbGF5X25hbWUnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5lbWFpbCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdFbWFpbCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRW1haWwpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nUGFzc3dvcmQpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nUGFzc3dvcmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCdmb3JtJykuc3VibWl0KGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdHNpZ251cEZvcm0uc3VibWl0KGUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja0F2YWlsYWJpbGl0eShmaWVsZDogc3RyaW5nKSB7XHJcblx0XHR2YXIgdmFsID0gJCgnIycgKyBmaWVsZCkudmFsKCk7XHJcblx0XHRpZih2YWwubGVuZ3RoID09PSAwKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR2YXIgdXJsID0gdGhpcy5wYXRocy5jaGVja0F2YWlsYWJpbGl0eSArIGZpZWxkO1xyXG5cdFx0dmFyIGF2YWlsYWJsZTtcclxuXHRcdGlmKGZpZWxkID09PSBcImRpc3BsYXlfbmFtZVwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZGlzcGxheV9uYW1lOiB2YWwgfSk7XHJcblx0XHR9IGVsc2UgaWYoZmllbGQgPT09IFwiZW1haWxcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGVtYWlsOiB2YWwgfSk7XHJcblx0XHR9XHJcblx0XHRhdmFpbGFibGUuZG9uZShmdW5jdGlvbihhdmFpbGFibGU6IHN0cmluZykge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShhdmFpbGFibGUpO1xyXG5cdFx0XHRpZihhdmFpbGFibGUuYXZhaWxhYmxlID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrUGFzc3dvcmQoKSB7XHJcblx0XHR2YXIgdjEgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQpLnZhbCgpLFxyXG5cdFx0XHR2MiA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZDIpLnZhbCgpO1xyXG5cdFx0aWYodjIubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRpZih2MSA9PT0gdjIpIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIHRydWUpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIHRydWUpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgZmFsc2UpO1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkMicsIGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNoZWNrU2VjdXJpdHkoKSB7XHJcblx0XHR2YXIgc2xpZGVyVmFsID0gJCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLnZhbCgpO1xyXG5cdFx0aWYoc2xpZGVyVmFsIDw9IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdub25lJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSBpZihzbGlkZXJWYWwgPiAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnYmxvY2snXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3VibWl0KGU6IGFueSkge1xyXG5cdFx0dmFyIHVzZXJuYW1lID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgndXNlcm5hbWUnKSxcclxuXHRcdFx0ZW1haWwgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpLFxyXG5cdFx0XHRwYXNzID0gdGhpcy5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRpZih1c2VybmFtZSA9PT0gdHJ1ZSAmJiBlbWFpbCA9PT0gdHJ1ZSAmJiBwYXNzID09PSB0cnVlKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR0b2dnbGVGZWVkYmFjayhmaWVsZDogc3RyaW5nLCBzdGF0dXM6IGJvb2xlYW4pIHtcclxuXHRcdGlmKHN0YXR1cyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1yZW1vdmUnKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJjbGFzcyBTdGFmZkxpc3Qge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdmFyIG1lbWJlcnMgPSAkKFwiW3J0LWhvb2s9J2hvb2shc3RhZmYubGlzdDpjYXJkJ11cIik7XHJcbiAgICAgICAgJC5lYWNoKG1lbWJlcnMsIGZ1bmN0aW9uKGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICQodmFsdWUpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHZhbCkuYXR0cigncnQtZGF0YScpO1xyXG4gICAgICAgICAgICAkKHZhbCkuZmluZCgnLmZyb250JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogXCJ1cmwoJy9pbWcvZm9ydW1zL3Bob3Rvcy9cIiArIGlkICsgXCIucG5nJylcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2YWwpLmJpbmQoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2hvdmVyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIHN0ZXBzRm9ybS5qcyB2MS4wLjBcclxuICogaHR0cDovL3d3dy5jb2Ryb3BzLmNvbVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE0LCBDb2Ryb3BzXHJcbiAqIGh0dHA6Ly93d3cuY29kcm9wcy5jb21cclxuICovXHJcbjsoIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcblx0XHRcdCdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcclxuXHRcdFx0J09UcmFuc2l0aW9uJzogJ29UcmFuc2l0aW9uRW5kJyxcclxuXHRcdFx0J21zVHJhbnNpdGlvbic6ICdNU1RyYW5zaXRpb25FbmQnLFxyXG5cdFx0XHQndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJ1xyXG5cdFx0fSxcclxuXHRcdHRyYW5zRW5kRXZlbnROYW1lID0gdHJhbnNFbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoICd0cmFuc2l0aW9uJyApIF0sXHJcblx0XHRzdXBwb3J0ID0geyB0cmFuc2l0aW9ucyA6IE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyB9O1xyXG5cclxuXHRmdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XHJcblx0XHRmb3IoIHZhciBrZXkgaW4gYiApIHtcclxuXHRcdFx0aWYoIGIuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG5cdFx0XHRcdGFba2V5XSA9IGJba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdGVwc0Zvcm0oIGVsLCBvcHRpb25zICkge1xyXG5cdFx0dGhpcy5lbCA9IGVsO1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XHJcblx0XHRleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xyXG5cdFx0dGhpcy5faW5pdCgpO1xyXG5cdH1cclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5vcHRpb25zID0ge1xyXG5cdFx0b25TdWJtaXQgOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dGhpcy5jdXJyZW50ID0gMDtcclxuXHJcblx0XHQvLyBxdWVzdGlvbnNcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gW10uc2xpY2UuY2FsbCggdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCAnb2wucXVlc3Rpb25zID4gbGknICkgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9uc1xyXG5cdFx0dGhpcy5xdWVzdGlvbnNDb3VudCA9IHRoaXMucXVlc3Rpb25zLmxlbmd0aDtcclxuXHRcdC8vIHNob3cgZmlyc3QgcXVlc3Rpb25cclxuXHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMucXVlc3Rpb25zWzBdLCAnY3VycmVudCcgKTtcclxuXHJcblx0XHQvLyBuZXh0IHF1ZXN0aW9uIGNvbnRyb2xcclxuXHRcdHRoaXMuY3RybE5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdidXR0b24ubmV4dCcgKTtcclxuXHJcblx0XHQvLyBwcm9ncmVzcyBiYXJcclxuXHRcdHRoaXMucHJvZ3Jlc3MgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoICdkaXYucHJvZ3Jlc3MnICk7XHJcblxyXG5cdFx0Ly8gcXVlc3Rpb24gbnVtYmVyIHN0YXR1c1xyXG5cdFx0dGhpcy5xdWVzdGlvblN0YXR1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvciggJ3NwYW4ubnVtYmVyJyApO1xyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvbiBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy5jdXJyZW50TnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItY3VycmVudCcgKTtcclxuXHRcdHRoaXMuY3VycmVudE51bS5pbm5lckhUTUwgPSBOdW1iZXIoIHRoaXMuY3VycmVudCArIDEgKTtcclxuXHRcdC8vIHRvdGFsIHF1ZXN0aW9ucyBwbGFjZWhvbGRlclxyXG5cdFx0dGhpcy50b3RhbFF1ZXN0aW9uTnVtID0gdGhpcy5xdWVzdGlvblN0YXR1cy5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5udW1iZXItdG90YWwnICk7XHJcblx0XHR0aGlzLnRvdGFsUXVlc3Rpb25OdW0uaW5uZXJIVE1MID0gdGhpcy5xdWVzdGlvbnNDb3VudDtcclxuXHJcblx0XHQvLyBlcnJvciBtZXNzYWdlXHJcblx0XHR0aGlzLmVycm9yID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCAnc3Bhbi5lcnJvci1tZXNzYWdlJyApO1xyXG5cclxuXHRcdC8vIGluaXQgZXZlbnRzXHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblx0fTtcclxuXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0Ly8gZmlyc3QgaW5wdXRcclxuXHRcdFx0Zmlyc3RFbElucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKSxcclxuXHRcdC8vIGZvY3VzXHJcblx0XHRcdG9uRm9jdXNTdGFydEZuID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Zmlyc3RFbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggc2VsZi5jdHJsTmV4dCwgJ3Nob3cnICk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0Ly8gc2hvdyB0aGUgbmV4dCBxdWVzdGlvbiBjb250cm9sIGZpcnN0IHRpbWUgdGhlIGlucHV0IGdldHMgZm9jdXNlZFxyXG5cdFx0Zmlyc3RFbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXNTdGFydEZuICk7XHJcblxyXG5cdFx0Ly8gc2hvdyBuZXh0IHF1ZXN0aW9uXHJcblx0XHR0aGlzLmN0cmxOZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGZ1bmN0aW9uKCBldiApIHtcclxuXHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0c2VsZi5fbmV4dFF1ZXN0aW9uKCk7XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gcHJlc3NpbmcgZW50ZXIgd2lsbCBqdW1wIHRvIG5leHQgcXVlc3Rpb25cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHR2YXIga2V5Q29kZSA9IGV2LmtleUNvZGUgfHwgZXYud2hpY2g7XHJcblx0XHRcdC8vIGVudGVyXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSAxMyApIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuX25leHRRdWVzdGlvbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gZGlzYWJsZSB0YWJcclxuXHRcdHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXYgKSB7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZXYua2V5Q29kZSB8fCBldi53aGljaDtcclxuXHRcdFx0Ly8gdGFiXHJcblx0XHRcdGlmKCBrZXlDb2RlID09PSA5ICkge1xyXG5cdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9O1xyXG5cclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmKCAhdGhpcy5fdmFsaWRhZGUoKSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNoZWNrIGlmIGZvcm0gaXMgZmlsbGVkXHJcblx0XHRpZiggdGhpcy5jdXJyZW50ID09PSB0aGlzLnF1ZXN0aW9uc0NvdW50IC0gMSApIHtcclxuXHRcdFx0dGhpcy5pc0ZpbGxlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2xlYXIgYW55IHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzXHJcblx0XHR0aGlzLl9jbGVhckVycm9yKCk7XHJcblxyXG5cdFx0Ly8gY3VycmVudCBxdWVzdGlvblxyXG5cdFx0dmFyIGN1cnJlbnRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHJcblx0XHQvLyBpbmNyZW1lbnQgY3VycmVudCBxdWVzdGlvbiBpdGVyYXRvclxyXG5cdFx0Kyt0aGlzLmN1cnJlbnQ7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHByb2dyZXNzIGJhclxyXG5cdFx0dGhpcy5fcHJvZ3Jlc3MoKTtcclxuXHJcblx0XHRpZiggIXRoaXMuaXNGaWxsZWQgKSB7XHJcblx0XHRcdC8vIGNoYW5nZSB0aGUgY3VycmVudCBxdWVzdGlvbiBudW1iZXIvc3RhdHVzXHJcblx0XHRcdHRoaXMuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyKCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgY2xhc3MgXCJzaG93LW5leHRcIiB0byBmb3JtIGVsZW1lbnQgKHN0YXJ0IGFuaW1hdGlvbnMpXHJcblx0XHRcdGNsYXNzaWUuYWRkQ2xhc3MoIHRoaXMuZWwsICdzaG93LW5leHQnICk7XHJcblxyXG5cdFx0XHQvLyByZW1vdmUgY2xhc3MgXCJjdXJyZW50XCIgZnJvbSBjdXJyZW50IHF1ZXN0aW9uIGFuZCBhZGQgaXQgdG8gdGhlIG5leHQgb25lXHJcblx0XHRcdC8vIGN1cnJlbnQgcXVlc3Rpb25cclxuXHRcdFx0dmFyIG5leHRRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb25zWyB0aGlzLmN1cnJlbnQgXTtcclxuXHRcdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggY3VycmVudFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdFx0Y2xhc3NpZS5hZGRDbGFzcyggbmV4dFF1ZXN0aW9uLCAnY3VycmVudCcgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBhZnRlciBhbmltYXRpb24gZW5kcywgcmVtb3ZlIGNsYXNzIFwic2hvdy1uZXh0XCIgZnJvbSBmb3JtIGVsZW1lbnQgYW5kIGNoYW5nZSBjdXJyZW50IHF1ZXN0aW9uIHBsYWNlaG9sZGVyXHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsXHJcblx0XHRcdG9uRW5kVHJhbnNpdGlvbkZuID0gZnVuY3Rpb24oIGV2ICkge1xyXG5cdFx0XHRcdGlmKCBzdXBwb3J0LnRyYW5zaXRpb25zICkge1xyXG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCB0cmFuc0VuZEV2ZW50TmFtZSwgb25FbmRUcmFuc2l0aW9uRm4gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoIHNlbGYuaXNGaWxsZWQgKSB7XHJcblx0XHRcdFx0XHRzZWxmLl9zdWJtaXQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjbGFzc2llLnJlbW92ZUNsYXNzKCBzZWxmLmVsLCAnc2hvdy1uZXh0JyApO1xyXG5cdFx0XHRcdFx0c2VsZi5jdXJyZW50TnVtLmlubmVySFRNTCA9IHNlbGYubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTDtcclxuXHRcdFx0XHRcdHNlbGYucXVlc3Rpb25TdGF0dXMucmVtb3ZlQ2hpbGQoIHNlbGYubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0XHRcdFx0XHQvLyBmb3JjZSB0aGUgZm9jdXMgb24gdGhlIG5leHQgaW5wdXRcclxuXHRcdFx0XHRcdG5leHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKCAnaW5wdXQnICkuZm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0aWYoIHN1cHBvcnQudHJhbnNpdGlvbnMgKSB7XHJcblx0XHRcdHRoaXMucHJvZ3Jlc3MuYWRkRXZlbnRMaXN0ZW5lciggdHJhbnNFbmRFdmVudE5hbWUsIG9uRW5kVHJhbnNpdGlvbkZuICk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0b25FbmRUcmFuc2l0aW9uRm4oKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIHVwZGF0ZXMgdGhlIHByb2dyZXNzIGJhciBieSBzZXR0aW5nIGl0cyB3aWR0aFxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3Byb2dyZXNzID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLnByb2dyZXNzLnN0eWxlLndpZHRoID0gdGhpcy5jdXJyZW50ICogKCAxMDAgLyB0aGlzLnF1ZXN0aW9uc0NvdW50ICkgKyAnJSc7XHJcblx0fVxyXG5cclxuXHQvLyBjaGFuZ2VzIHRoZSBjdXJyZW50IHF1ZXN0aW9uIG51bWJlclxyXG5cdHN0ZXBzRm9ybS5wcm90b3R5cGUuX3VwZGF0ZVF1ZXN0aW9uTnVtYmVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBmaXJzdCwgY3JlYXRlIG5leHQgcXVlc3Rpb24gbnVtYmVyIHBsYWNlaG9sZGVyXHJcblx0XHR0aGlzLm5leHRRdWVzdGlvbk51bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xyXG5cdFx0dGhpcy5uZXh0UXVlc3Rpb25OdW0uY2xhc3NOYW1lID0gJ251bWJlci1uZXh0JztcclxuXHRcdHRoaXMubmV4dFF1ZXN0aW9uTnVtLmlubmVySFRNTCA9IE51bWJlciggdGhpcy5jdXJyZW50ICsgMSApO1xyXG5cdFx0Ly8gaW5zZXJ0IGl0IGluIHRoZSBET01cclxuXHRcdHRoaXMucXVlc3Rpb25TdGF0dXMuYXBwZW5kQ2hpbGQoIHRoaXMubmV4dFF1ZXN0aW9uTnVtICk7XHJcblx0fVxyXG5cclxuXHQvLyBzdWJtaXRzIHRoZSBmb3JtXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm9wdGlvbnMub25TdWJtaXQoIHRoaXMuZWwgKTtcclxuXHR9XHJcblxyXG5cdC8vIFRPRE8gKG5leHQgdmVyc2lvbi4uKVxyXG5cdC8vIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fdmFsaWRhZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGN1cnJlbnQgcXVlc3Rpb27DgsK0cyBpbnB1dFxyXG5cdFx0dmFyIGlucHV0ID0gdGhpcy5xdWVzdGlvbnNbIHRoaXMuY3VycmVudCBdLnF1ZXJ5U2VsZWN0b3IoICdpbnB1dCcgKS52YWx1ZTtcclxuXHRcdGlmKCBpbnB1dCA9PT0gJycgKSB7XHJcblx0XHRcdHRoaXMuX3Nob3dFcnJvciggJ0VNUFRZU1RSJyApO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPIChuZXh0IHZlcnNpb24uLilcclxuXHRzdGVwc0Zvcm0ucHJvdG90eXBlLl9zaG93RXJyb3IgPSBmdW5jdGlvbiggZXJyICkge1xyXG5cdFx0dmFyIG1lc3NhZ2UgPSAnJztcclxuXHRcdHN3aXRjaCggZXJyICkge1xyXG5cdFx0XHRjYXNlICdFTVBUWVNUUicgOlxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnUGxlYXNlIGZpbGwgdGhlIGZpZWxkIGJlZm9yZSBjb250aW51aW5nJztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAnSU5WQUxJREVNQUlMJyA6XHJcblx0XHRcdFx0bWVzc2FnZSA9ICdQbGVhc2UgZmlsbCBhIHZhbGlkIGVtYWlsIGFkZHJlc3MnO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHQvLyAuLi5cclxuXHRcdH07XHJcblx0XHR0aGlzLmVycm9yLmlubmVySFRNTCA9IG1lc3NhZ2U7XHJcblx0XHRjbGFzc2llLmFkZENsYXNzKCB0aGlzLmVycm9yLCAnc2hvdycgKTtcclxuXHR9XHJcblxyXG5cdC8vIGNsZWFycy9oaWRlcyB0aGUgY3VycmVudCBlcnJvciBtZXNzYWdlXHJcblx0c3RlcHNGb3JtLnByb3RvdHlwZS5fY2xlYXJFcnJvciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y2xhc3NpZS5yZW1vdmVDbGFzcyggdGhpcy5lcnJvciwgJ3Nob3cnICk7XHJcblx0fVxyXG5cclxuXHQvLyBhZGQgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5cdHdpbmRvdy5zdGVwc0Zvcm0gPSBzdGVwc0Zvcm07XHJcblxyXG59KSggd2luZG93ICk7IiwidmFyIHV0aWxpdGllcztcclxuY2xhc3MgVXRpbGl0aWVzIHtcclxuICAgIHB1YmxpYyBjdXJyZW50VGltZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZvcm1Ub2tlbih0b2tlbjogc3RyaW5nKSB7XHJcbiAgICAgICAgdG9rZW4gPSBhdG9iKHRva2VuKTtcclxuICAgICAgICAkKCdmb3JtJykuYXBwZW5kKFwiPGlucHV0IHR5cGU9J2hpZGRlbicgbmFtZT0nX3Rva2VuJyB2YWx1ZT0nXCIgKyB0b2tlbiArIFwiJyAvPlwiKTtcclxuXHJcbiAgICAgICAgdmFyIG1ldGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtZXRhJyk7XHJcbiAgICAgICAgbWV0YS5uYW1lID0gJ190b2tlbic7XHJcbiAgICAgICAgbWV0YS5jb250ZW50ID0gdG9rZW47XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobWV0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFKQVgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnaHRtbCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEpTT05EZWNvZGUoanNvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQucGFyc2VKU09OKGpzb24pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvc3RBSkFYKHBhdGg6IHN0cmluZywgZGF0YTogYW55KSB7XHJcbiAgICAgICAgZGF0YS5fdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJfdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzY3JvbGxUbyhlbGVtZW50OiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcFxyXG4gICAgICAgIH0sIHRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0aW1lQWdvKHRzOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbm93VHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcclxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vd1RzIC0gdHM7XHJcbiAgICAgICAgaWYoc2Vjb25kcyA+IDIgKiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYSBmZXcgZGF5cyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ5ZXN0ZXJkYXlcIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDcyMDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDM2MDApICsgXCIgaG91cnMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImFuIGhvdXIgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gMTIwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCkgKyBcIiBtaW51dGVzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDYwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgbWludXRlIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwiIHNlY29uZHMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBzZWNvbmQgYWdvXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwb3N0KHBhdGg6IHN0cmluZywgcGFyYW1zOiBhbnksIG1ldGhvZDogc3RyaW5nKSB7XHJcbiAgICAgICAgbWV0aG9kID0gbWV0aG9kIHx8ICdwb3N0JztcclxuICAgICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnbWV0aG9kJywgbWV0aG9kKTtcclxuICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWN0aW9uJywgcGF0aCk7XHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGlmKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGlkZGVuRmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuRmllbGQuc2V0QXR0cmlidXRlKCduYW1lJywga2V5KTtcclxuICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBwYXJhbXNba2V5XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChoaWRkZW5GaWVsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRva2VuVmFsID0gJChcIm1ldGFbbmFtZT0nX3Rva2VuJ11cIikuYXR0cignY29udGVudCcpO1xyXG4gICAgICAgIHZhciB0b2tlbkZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgnbmFtZScsICdfdG9rZW4nKTtcclxuICAgICAgICB0b2tlbkZpZWxkLnNldEF0dHJpYnV0ZSgndmFsdWUnLCB0b2tlblZhbCk7XHJcblxyXG4gICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQodG9rZW5GaWVsZCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XHJcbiAgICAgICAgZm9ybS5zdWJtaXQoKTtcclxuICAgIH1cclxufVxyXG51dGlsaXRpZXMgPSBuZXcgVXRpbGl0aWVzKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9