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
        var displayed = 20;
        var msgAmount = this.messages.length;
        if (msgAmount > displayed) {
            var messages = this.messages.slice(msgAmount - displayed, displayed);
        }
        else {
            var messages = this.messages;
        }
        var messages2 = messages;
        messages = [];
        var ii = messages2.length;
        for (var i = ii - 1; i !== 0; i--) {
            messages.push(messages2[i]);
        }
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
    Chatbox.prototype.switchChannel = function () {
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

var forums;
var Forums = (function () {
    function Forums() {
        this.elements = {};
        this.paths = {};
        this.post = null;
        this.threadCreate = null;
        this.elements = {
            'postEditor': "[rt-data='post.edit']"
        };
        this.paths = {
            'vote': function (id) {
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
            check: '/name/check'
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
        $('#radio-link').click(function () {
            if (!radio.status) {
                radio.openRadio();
            }
            else {
                radio.closeRadio();
            }
        });
        $('#radio-history').click(function () {
            radio.openHistory();
        });
        $('#radio-request').click(function () {
            radio.openRequest();
        });
        $('#radio-timetable').click(function () {
            radio.openTimetable();
        });
        $('#request-button').click(function () {
        });
        $('#pull-close').click(function () {
            radio.hidePull();
        });
    }
    Radio.prototype.closeRadio = function () {
        this.popup.close();
        $(this.varMessage).html(this.statusClosed);
        this.status = false;
        $(this.varStatus).removeClass('text-success').addClass('text-danger').html("<i id='power-button' class='fa fa-power-off'></i>Off");
    };
    Radio.prototype.openRadio = function () {
        this.popup = window.open(this.URL, 'RuneTime Radio', 'width=389,height=359');
        this.status = true;
        $(this.varMessage).html(this.statusOpen);
        $(this.varStatus).removeClass('text-danger').addClass('text-success').html("<i id='power-button' class='fa fa-power-off'></i>On");
        var pollTimer = window.setInterval(function () {
            if (radio.popup.closed !== false) {
                window.clearInterval(pollTimer);
                radio.closeRadio();
            }
        }, 1000);
    };
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
            radio.openPull(html);
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
            radio.openPull(html);
        });
    };
    Radio.prototype.openRequest = function () {
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
            radio.openPull(html);
        });
        setTimeout(function () {
            $('#request-button').click(function () {
                radio.sendRequest();
            });
        }, 3000);
    };
    Radio.prototype.sendRequest = function () {
        var data = {
            'artist': document.getElementById('request-artist').value,
            'name': document.getElementById('request-name').value
        }, contents;
        contents = utilities.postAJAX('radio/request/song', data);
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
        this.hidePull();
        this.update();
    };
    Radio.prototype.openPull = function (contents) {
        $('#pull-contents').html(contents);
        $('#radio-pull').removeClass('hidden').css({
            width: '50%'
        });
        $('#radio-options').css({
            width: '50%'
        });
    };
    Radio.prototype.hidePull = function () {
        $('#pull-contents').html('&nbsp;');
        $('#radio-pull').width('').addClass('hidden').css({
            width: '0%'
        });
        $('#radio-options').width('').css({
            width: '100%'
        });
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
            else if (update['message'] === -1) {
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
                    requestsHTML += "<p class='text-warning'>";
                }
                requestsHTML += request.song_name + " by " + request.song_artist;
                requestsHTML += "</p>";
            }
            $('#requests-user-current').html(requestsHTML);
            setTimeout(function () {
                radio.update();
            }, 30000);
        });
    };
    return Radio;
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

var utilities;
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.prototype.getAJAX = function (path) {
        return $.ajax({
            url: path,
            type: 'get',
            dataType: 'html',
            async: true
        });
    };
    Utilities.prototype.postAJAX = function (path, data) {
        return $.ajax({
            url: path,
            type: 'post',
            data: data,
            async: true
        });
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
    Utilities.prototype.currentTime = function () {
        return Math.floor(Date.now() / 1000);
    };
    Utilities.prototype.JSONDecode = function (json) {
        return $.parseJSON(json);
    };
    Utilities.prototype.scrollTo = function (element, time) {
        $('html, body').animate({
            scrollTop: $(element).offset().top
        }, time);
    };
    return Utilities;
})();
utilities = new Utilities();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2hhdGJveC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29tYmF0Y2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvZm9ydW1zLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9saXZlc3RyZWFtLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9tYWluLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9uYW1lY2hlY2tlci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbm90aWZpY2F0aW9ucy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvcmFkaW8udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkNhbGN1bGF0b3IiLCJDYWxjdWxhdG9yLmNvbnN0cnVjdG9yIiwiQ2FsY3VsYXRvci5jYWxjdWxhdGVYUCIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlTGV2ZWwiLCJDYWxjdWxhdG9yLmdldEluZm8iLCJDYWxjdWxhdG9yLmxvYWRDYWxjIiwiQ2FsY3VsYXRvci51cGRhdGVDYWxjIiwiQ2hhdGJveCIsIkNoYXRib3guY29uc3RydWN0b3IiLCJDaGF0Ym94LmFkZE1lc3NhZ2UiLCJDaGF0Ym94LmRpc3BsYXlNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZXMiLCJDaGF0Ym94LmVycm9yIiwiQ2hhdGJveC5nZXRTdGFydCIsIkNoYXRib3gubW9kIiwiQ2hhdGJveC5tb2RUb29scyIsIkNoYXRib3gucGFuZWxDaGFubmVscyIsIkNoYXRib3gucGFuZWxDaGF0IiwiQ2hhdGJveC5wYW5lbENsb3NlIiwiQ2hhdGJveC5zdWJtaXRNZXNzYWdlIiwiQ2hhdGJveC5zd2l0Y2hDaGFubmVsIiwiQ2hhdGJveC51cGRhdGUiLCJDaGF0Ym94LnVwZGF0ZVRpbWVBZ28iLCJDb21iYXRDYWxjdWxhdG9yIiwiQ29tYmF0Q2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzIiwiQ29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCIsIkNvbWJhdENhbGN1bGF0b3IudmFsIiwiRm9ydW1zIiwiRm9ydW1zLmNvbnN0cnVjdG9yIiwiRm9ydW1zLmRvd252b3RlIiwiRm9ydW1zLnVwdm90ZSIsIlBvc3QiLCJQb3N0LmNvbnN0cnVjdG9yIiwiUG9zdC5xdW90ZSIsIkZvcnVtc1RocmVhZENyZWF0ZSIsIkZvcnVtc1RocmVhZENyZWF0ZS5jb25zdHJ1Y3RvciIsIkZvcnVtc1RocmVhZENyZWF0ZS5hZGRRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lciIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uIiwiTGl2ZXN0cmVhbVJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LmNvbnN0cnVjdG9yIiwiTGl2ZXN0cmVhbVJlc2V0LnJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzZXMiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93biIsIlJ1bmVUaW1lIiwiUnVuZVRpbWUuY29uc3RydWN0b3IiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuY2hlY2siLCJOYW1lQ2hlY2tlci5hdmFpbGFibGUiLCJOYW1lQ2hlY2tlci5jaGVja05hbWUiLCJOYW1lQ2hlY2tlci51bmF2YWlsYWJsZSIsIk5vdGlmaWNhdGlvbnMiLCJOb3RpZmljYXRpb25zLmNvbnN0cnVjdG9yIiwiUmFkaW8iLCJSYWRpby5jb25zdHJ1Y3RvciIsIlJhZGlvLmNsb3NlUmFkaW8iLCJSYWRpby5vcGVuUmFkaW8iLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vcGVuUmVxdWVzdCIsIlJhZGlvLnNlbmRSZXF1ZXN0IiwiUmFkaW8ub3BlblB1bGwiLCJSYWRpby5oaWRlUHVsbCIsIlJhZGlvLnVwZGF0ZSIsIlNpZ251cEZvcm0iLCJTaWdudXBGb3JtLmNvbnN0cnVjdG9yIiwiU2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSIsIlNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCIsIlNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSIsIlNpZ251cEZvcm0uc3VibWl0IiwiU2lnbnVwRm9ybS50b2dnbGVGZWVkYmFjayIsIlN0YWZmTGlzdCIsIlN0YWZmTGlzdC5jb25zdHJ1Y3RvciIsIlV0aWxpdGllcyIsIlV0aWxpdGllcy5jb25zdHJ1Y3RvciIsIlV0aWxpdGllcy5nZXRBSkFYIiwiVXRpbGl0aWVzLnBvc3RBSkFYIiwiVXRpbGl0aWVzLnRpbWVBZ28iLCJVdGlsaXRpZXMuY3VycmVudFRpbWUiLCJVdGlsaXRpZXMuSlNPTkRlY29kZSIsIlV0aWxpdGllcy5zY3JvbGxUbyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLENBQUM7QUFDZixJQUFNLFVBQVU7SUFNWkEsU0FORUEsVUFBVUEsQ0FNT0EsSUFBU0E7UUFBVEMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBS0E7UUFKNUJBLGFBQVFBLEdBQVFBLEVBQUVBLENBQUNBO1FBQ25CQSxTQUFJQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNmQSxRQUFHQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNkQSxVQUFLQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUVaQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQTtZQUNaQSxTQUFTQSxFQUFFQSx3QkFBd0JBO1lBQ25DQSxXQUFXQSxFQUFFQSwwQkFBMEJBO1lBQ3ZDQSxNQUFNQSxFQUFFQSxvQkFBb0JBO1lBQzVCQSxLQUFLQSxFQUFFQSx5QkFBeUJBO1lBQ2hDQSxXQUFXQSxFQUFFQSwwQkFBMEJBO1NBQzFDQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQTtZQUNQQSxPQUFPQSxFQUFFQSxtQkFBbUJBO1lBQzVCQSxPQUFPQSxFQUFFQSxjQUFjQTtTQUMxQkEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0E7WUFDUkEsWUFBWUEsRUFBRUEsQ0FBQ0E7WUFDZkEsV0FBV0EsRUFBRUEsQ0FBQ0E7WUFDZEEsU0FBU0EsRUFBRUEsQ0FBQ0E7WUFDWkEsUUFBUUEsRUFBRUEsQ0FBQ0E7U0FDZEEsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdkJBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBO1lBQ2xDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUNBLENBQUNBO1FBQ0hBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ2hCQSxDQUFDQSxDQUFDQSwwQkFBMEJBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1lBQ2hDLFVBQVUsQ0FBQztnQkFDUCxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDNUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQTtJQUVKRCxnQ0FBV0EsR0FBWEEsVUFBWUEsS0FBYUE7UUFDeEJFLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEVBQ1pBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ1BBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEtBQUtBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBO1lBQy9CQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBO0lBRURGLG1DQUFjQSxHQUFkQSxVQUFlQSxFQUFVQTtRQUN4QkcsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFDWkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0JBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxFQUFFQSxDQUFBQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDN0JBLE1BQU1BLENBQUNBLENBQUNBLENB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LElBQUlBLDBCQUEwQkEsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsMkVBQTJFQSxDQUFDQTtRQUM1SkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsR0FBR0EsSUFBSUEsMEJBQTBCQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSwwRUFBMEVBLENBQUNBO1FBQzNKQSxDQUFDQTtRQUNEQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFDQTtRQUNmQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQTtRQUNkQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsR0FBR0EsSUFBSUEsMEJBQTBCQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxpRkFBaUZBLENBQUNBO1FBQ2xLQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxHQUFHQSxJQUFJQSwwQkFBMEJBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLDZFQUE2RUEsQ0FBQ0E7UUFDOUpBLENBQUNBO1FBQ0RBLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBO1FBQ2ZBLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBO1FBQ2ZBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ1pBLENBQUNBO0lBRU1SLCtCQUFhQSxHQUFwQkE7UUFDQ1MsSUFBSUEsUUFBUUEsR0FBR0EsU0FBU0EsQ0FBQ0Es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aEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM1QixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM3QixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNqQyxVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMxQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM5QixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBQ0RELG9DQUFTQSxHQUFUQTtRQUNDRSxJQUFJQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUNsQ0EsSUFBSUEsR0FBR0E7WUFDTkEsR0FBR0EsRUFBRUEsSUFBSUE7U0FDVEEsRUFDREEsTUFBTUEsR0FBR0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDMURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVNBLE1BQU1BO1lBQzFCLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0QsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUNERixzQ0FBV0EsR0FBWEE7UUFDQ0csSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdERBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ2xDQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNwQ0EsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDekRBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JFQSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNuRUEsS0FBS0EsSUFBSUEsR0FBR0EsQ0FBQ0E7UUFDYkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUNESCw4QkFBR0EsR0FBSEEsVUFBSUEsSUFBWUE7UUFDZkksTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsOEJBQThCQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7SUFDRkosdUJBQUNBO0FBQURBLENB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LEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLE9BQU9BLEdBQUdBLGNBQWNBLENBQUNBO1FBQ3BDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFDREosK0JBQVdBLEdBQVhBO1FBQ0lLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUNETCw4QkFBVUEsR0FBVkEsVUFBV0EsSUFBWUE7UUFDbkJNLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzdCQSxDQUFDQTtJQUNETiw0QkFBUUEsR0FBUkEsVUFBU0EsT0FBWUEsRUFBRUEsSUFBWUE7UUFDL0JPLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBO1lBQ3BCQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQTtTQUNyQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFDTFAsZ0JBQUNBO0FBQURBLENBakRBLEFBaURDQSxJQUFBO0FBQ0QsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYWxjdWxhdG9yO1xyXG5jbGFzcyBDYWxjdWxhdG9yIHtcclxuICAgIGNhbGN1bGF0b3I6IGFueTtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIGluZm86IGFueSA9IHt9O1xyXG4gICAgVVJMOiBhbnkgPSB7fTtcclxuICAgIGl0ZW1zOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxjOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50WFA6ICcjY2FsY3VsYXRvci1jdXJyZW50LXhwJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICcjY2FsY3VsYXRvci1kaXNwbGF5LW5hbWUnLFxyXG4gICAgICAgICAgICBzdWJtaXQ6ICcjY2FsY3VsYXRvci1zdWJtaXQnLFxyXG4gICAgICAgICAgICB0YWJsZTogJyNjYWxjdWxhdG9yLXRhYmxlIHRib2R5JyxcclxuICAgICAgICAgICAgdGFyZ2V0TGV2ZWw6ICcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLlVSTCA9IHtcclxuICAgICAgICAgICAgZ2V0Q2FsYzogJy9jYWxjdWxhdG9ycy9sb2FkJyxcclxuICAgICAgICAgICAgZ2V0SW5mbzogJy9nZXQvaGlzY29yZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IHtcclxuICAgICAgICAgICAgbGV2ZWxDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBsZXZlbFRhcmdldDogMCxcclxuICAgICAgICAgICAgWFBDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBYUFRhcmdldDogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdG9yID0gY2FsYztcclxuICAgICAgICAkKHRoaXMuZWxlbWVudHMuc3VibWl0KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5nZXRJbmZvKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5sb2FkQ2FsYygpO1xyXG4gICAgICAgICQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcbiAgICAgICAgICAgIH0sIDI1KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0Y2FsY3VsYXRlWFAobGV2ZWw6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgbGV2ZWw7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKiBNYXRoLnBvdygyLCBpIC8gNy4wKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0b3RhbCAvIDQpO1xyXG5cdH1cclxuXHJcblx0Y2FsY3VsYXRlTGV2ZWwoeHA6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgMTIwOyBpICs9IDEpIHtcclxuXHRcdFx0dG90YWwgKz0gTWF0aC5mbG9vcihpICsgMzAwICsgTWF0aC5wb3coMiwgaSAvIDcpKTtcclxuXHRcdFx0aWYoTWF0aC5mbG9vcih0b3RhbCAvIDQpID4geHApXHJcblx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdGVsc2UgaWYoaSA+PSA5OSlcclxuXHRcdFx0XHRyZXR1cm4gOTk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLnZhbCgpO1xyXG5cdFx0dmFyIGluZm8gPSB1dGlsaXRpZXMuZ2V0QUpBWCh0aGlzLlVSTC5nZXRJbmZvICsgJy8nICsgbmFtZSk7XHJcblx0XHRpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbzogYW55KSB7XHJcblx0XHRcdGluZm8gPSAkLnBhcnNlSlNPTihpbmZvKTtcclxuXHRcdFx0dmFyIHJlbGV2YW50ID0gaW5mb1sxM107XHJcblx0XHRcdGNhbGN1bGF0b3IuaW5mby5sZXZlbEN1cnJlbnQgPSByZWxldmFudFsxXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCA9IHJlbGV2YW50WzJdO1xyXG5cdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMuY3VycmVudFhQKS52YWwoY2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCk7XHJcblx0XHRcdGlmKCQoY2FsY3VsYXRvci5lbGVtZW50cy50YXJnZXRMZXZlbCkudmFsKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwocGFyc2VJbnQoY2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCwgMTApICsgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcblx0XHR9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2FsYygpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHtpZDogdGhpcy5jYWxjdWxhdG9yfTtcclxuICAgICAgICB2YXIgaW5mbyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5nZXRDYWxjLCBkYXRhKTtcclxuICAgICAgICBpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbykge1xyXG4gICAgICAgICAgICBpbmZvID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoaW5mbyk7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0b3IuaXRlbXMgPSBpbmZvO1xyXG4gICAgICAgICAgICAkLmVhY2goY2FsY3VsYXRvci5pdGVtcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLnhwICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD4maW5maW47PC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8L3RyPlwiO1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNhbGMoKSB7XHJcbiAgICAgICAgdmFyIGxldmVsQ3VycmVudCA9IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0ID0gMCxcclxuICAgICAgICAgICAgeHBDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgeHBUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gMCxcclxuICAgICAgICAgICAgYW1vdW50ID0gMDtcclxuICAgICAgICB0aGlzLmluZm8ubGV2ZWxUYXJnZXQgPSBwYXJzZUludCgkKCcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnKS52YWwoKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHRoaXMuaW5mby5sZXZlbFRhcmdldCk7XHJcbiAgICAgICAgaWYodGhpcy5pbmZvLlhQQ3VycmVudCA+IHRoaXMuaW5mby5YUFRhcmdldClcclxuICAgICAgICAgICAgdGhpcy5pbmZvLlhQVGFyZ2V0ID0gdGhpcy5jYWxjdWxhdGVYUChwYXJzZUludCh0aGlzLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuICAgICAgICBsZXZlbEN1cnJlbnQgPSB0aGlzLmluZm8ubGV2ZWxDdXJyZW50O1xyXG4gICAgICAgIGxldmVsVGFyZ2V0ID0gdGhpcy5pbmZvLmxldmVsVGFyZ2V0O1xyXG4gICAgICAgIHhwQ3VycmVudCA9IHRoaXMuaW5mby5YUEN1cnJlbnQ7XHJcbiAgICAgICAgeHBUYXJnZXQgPSB0aGlzLmluZm8uWFBUYXJnZXQ7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IHhwVGFyZ2V0IC0geHBDdXJyZW50O1xyXG4gICAgICAgICQuZWFjaCh0aGlzLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IE1hdGguY2VpbChkaWZmZXJlbmNlIC8gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHApO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBhbW91bnQgPCAwID8gMCA6IGFtb3VudDtcclxuICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJykgdGQ6bnRoLWNoaWxkKDQpJykuaHRtbChhbW91bnQpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxDdXJyZW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuXFxuXFxuXCIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsIDw9IGxldmVsQ3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsID4gbGV2ZWxDdXJyZW50ICYmIGxldmVsVGFyZ2V0ID49IGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtd2FybmluZycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LWRhbmdlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY2hhdGJveDtcclxuY2xhc3MgQ2hhdGJveCB7XHJcblx0Y2hhbm5lbDogc3RyaW5nID0gJyNyYWRpbyc7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGxhc3RJZDogbnVtYmVyID0gMDtcclxuXHRtZXNzYWdlczogYW55ID0gW107XHJcblx0bW9kZXJhdG9yOiBib29sZWFuID0gZmFsc2U7XHJcblx0cGlubmVkOiBhbnkgPSBbXTtcclxuXHR0aW1lczogYW55ID0ge307XHJcblx0dGltZW91dFBpbm5lZDogYW55ID0gbnVsbDtcclxuXHR0aW1lb3V0VXBkYXRlOiBhbnkgPSBudWxsO1xyXG5cdFVSTDogYW55ID0ge307XHJcblxyXG5cdHBpbm5lZERpc3BsYXllZDogYW55ID0gW107XHJcblxyXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjaGFubmVsOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhY3Rpb25zOiAnI2NoYXRib3gtYWN0aW9ucycsXHJcblx0XHRcdGNoYW5uZWxzOiAnI2NoYXRib3gtY2hhbm5lbHMnLFxyXG5cdFx0XHRjaGF0Ym94OiAnI2NoYXRib3gnLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NoYXRib3gtbWVzc2FnZScsXHJcblx0XHRcdG1lc3NhZ2VzOiAnI2NoYXRib3gtbWVzc2FnZXMnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5VUkwgPSB7XHJcblx0XHRcdGdldFN0YXJ0OiAnL2NoYXQvc3RhcnQnLFxyXG5cdFx0XHRnZXRVcGRhdGU6ICcvY2hhdC91cGRhdGUnLFxyXG5cdFx0XHRwb3N0TWVzc2FnZTogJy9jaGF0L3Bvc3QvbWVzc2FnZScsXHJcblx0XHRcdHBvc3RTdGF0dXNDaGFuZ2U6ICcvY2hhdC9wb3N0L3N0YXR1cy9jaGFuZ2UnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy50aW1lcyA9IHtcclxuXHRcdFx0bGFzdEFjdGl2aXR5OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKSxcclxuXHRcdFx0bGFzdFJlZnJlc2g6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsb2FkZWRBdDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKClcclxuXHRcdH07XHJcblx0XHR2YXIgbW9kZXJhdG9yID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L21vZGVyYXRvcicpO1xyXG5cdFx0bW9kZXJhdG9yLmRvbmUoZnVuY3Rpb24obW9kZXJhdG9yOiBzdHJpbmcpIHtcclxuXHRcdFx0bW9kZXJhdG9yID0gJC5wYXJzZUpTT04obW9kZXJhdG9yKTtcclxuXHRcdFx0Y2hhdGJveC5tb2RlcmF0b3IgPSBtb2RlcmF0b3IubW9kID09PSB0cnVlO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnBhbmVsQ2hhdCgpO1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmKGUud2hpY2ggPT09IDEzKVxyXG5cdFx0XHRcdGNoYXRib3guc3VibWl0TWVzc2FnZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhbm5lbHMpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnBhbmVsQ2hhbm5lbHMoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHR9LCA1MDAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZVRpbWVBZ28oKTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogYW55KSB7XHJcblx0XHRpZih0aGlzLmxhc3RJZCA8IG1lc3NhZ2UuaWQpIHtcclxuXHRcdFx0dGhpcy5sYXN0SWQgPSBtZXNzYWdlLmlkO1xyXG5cdFx0fVxyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgPD0gMSkge1xyXG5cdFx0XHR0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoXSA9IG1lc3NhZ2U7XHJcblx0XHRcdHRoaXMudGltZXMubGFzdEFjdGl2aXR5ID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2UobWVzc2FnZSkge1xyXG5cdFx0aWYoIW1lc3NhZ2UpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0aWYgKG1lc3NhZ2Uuc3RhdHVzID09PSAxKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctaGlkZGVuJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMikge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbm5lZCc+XCI7XHJcblx0XHR9IGVsc2UgaWYobWVzc2FnZS5zdGF0dXMgPT09IDMpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1waW5oaWQnPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnJz5cIjtcclxuXHRcdH1cclxuXHRcdGh0bWwgKz0gXCI8dGltZSBjbGFzcz0ncHVsbC1yaWdodCcgZGF0YS10cz0nXCIgKyBtZXNzYWdlLmNyZWF0ZWRfYXQgKyBcIic+XCI7XHJcblx0XHRodG1sICs9IHV0aWxpdGllcy50aW1lQWdvKG1lc3NhZ2UuY3JlYXRlZF9hdCk7XHJcblx0XHRodG1sICs9IFwiPC90aW1lPlwiO1xyXG5cdFx0aHRtbCArPSBcIjxwPlwiO1xyXG5cdFx0aWYoY2hhdGJveC5tb2RlcmF0b3IgPT09IHRydWUpIHtcclxuXHRcdFx0aHRtbCArPSBDaGF0Ym94Lm1vZFRvb2xzKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjxhIGNsYXNzPSdtZW1iZXJzLVwiICsgbWVzc2FnZS5jbGFzc19uYW1lICsgXCInPlwiICsgbWVzc2FnZS5hdXRob3JfbmFtZSArIFwiPC9hPjogXCIgKyBtZXNzYWdlLmNvbnRlbnRzX3BhcnNlZDtcclxuXHRcdGh0bWwgKz0gXCI8L3A+XCI7XHJcblx0XHRodG1sICs9IFwiPC9kaXY+XCI7XHJcblx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZXMpLnByZXBlbmQoaHRtbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2VzKCkge1xyXG5cdFx0dmFyIGRpc3BsYXllZCA9IDIwO1xyXG5cdFx0dmFyIG1zZ0Ftb3VudCA9IHRoaXMubWVzc2FnZXMubGVuZ3RoO1xyXG5cdFx0aWYobXNnQW1vdW50ID4gZGlzcGxheWVkKSB7XHJcblx0XHRcdHZhciBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuc2xpY2UobXNnQW1vdW50IC0gZGlzcGxheWVkLCBkaXNwbGF5ZWQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcclxuXHRcdH1cclxuXHRcdHZhciBtZXNzYWdlczIgPSBtZXNzYWdlcztcclxuXHRcdG1lc3NhZ2VzID0gW107XHJcblx0XHR2YXIgaWkgPSBtZXNzYWdlczIubGVuZ3RoO1xyXG5cdFx0Zm9yICh2YXIgaSA9IGlpIC0gMTsgaSAhPT0gMDsgaS0tKSB7XHJcblx0XHRcdG1lc3NhZ2VzLnB1c2gobWVzc2FnZXMyW2ldKTtcclxuXHRcdH1cclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuaHRtbCgnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uKGluZGV4LCBtZXNzYWdlKSB7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaCh0aGlzLnBpbm5lZCwgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0aWYoY2hhdGJveC5waW5uZWREaXNwbGF5ZWRbbWVzc2FnZS5pZF0gIT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSA9IHRydWU7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZCA9IFtdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldFN0YXJ0KCkge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHR0aW1lOiB0aGlzLnRpbWVzLmxvYWRlZEF0LFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgnY2hhdC9zdGFydCcsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHMpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5tZXNzYWdlcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRjaGF0Ym94LnBpbm5lZCA9IHJlc3VsdHMucGlubmVkO1xyXG5cdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbW9kKGlkOiBhbnksIG5ld1N0YXR1czogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IGlkLFxyXG5cdFx0XHRzdGF0dXM6IG5ld1N0YXR1c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9zdGF0dXMtY2hhbmdlJywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNoYXRib3guZXJyb3IoXCJUaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcGVyZm9ybWluZyB0aGF0IG1vZGVyYXRpb24gY2hhbmdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgbW9kVG9vbHMobWVzc2FnZSkge1xyXG5cdFx0dmFyIHJlcyA9IFwiXCI7XHJcblx0XHRyZXMgKz0gXCI8dWwgY2xhc3M9J2xpc3QtaW5saW5lIGlubGluZSc+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyAlIDIgPT09IDApIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzICsgMSkgKyBcIik7JyB0aXRsZT0nSGlkZSBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtbWludXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDEpICsgXCIpOycgdGl0bGU9J1Nob3cgbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA+PSAyKSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDIpICsgXCIpOycgdGl0bGU9J1VucGluIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1hcnJvdy1jaXJjbGUtZG93biB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAyKSArIFwiKTsnIHRpdGxlPSdQaW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS11cCB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9XHJcblx0XHRyZXMgKz0gXCI8L2xpPlwiO1xyXG5cdFx0cmVzICs9IFwiPC91bD5cIjtcclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDaGFubmVscygpIHtcclxuXHRcdHZhciByZXNwb25zZSA9IHV0aWxpdGllcy5nZXRBSkFYKCcvY2hhdC9jaGFubmVscycpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LXBvcHVwLWNoYW5uZWxzJz5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2Nsb3NlJyBvbmNsaWNrPSdjaGF0Ym94LnBhbmVsY2xvc2UoKTsnPkNsb3NlIDxzcGFuIGFyaWEtaGlkZGVuPSd0cnVlJz4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPSdzci1vbmx5Jz5DbG9zZTwvc3Bhbj48L2J1dHRvbj5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8aDM+Q2hhbm5lbHM8L2gzPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxwIGNsYXNzPSdob2xvLXRleHQnPkN1cnJlbnRseSBvbiA8Yj4jXCIgKyBjaGF0Ym94LmNoYW5uZWwgKyBcIjwvYj48L3A+XCI7XHJcblx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPGEgb25jbGljaz1cXFwiY2hhdGJveC5zd2l0Y2hDaGFubmVsKCdcIiArIHZhbHVlLm5hbWUgKyBcIicpO1xcXCI+I1wiICsgdmFsdWUubmFtZSArIFwiPC9hPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPlwiICsgdmFsdWUubWVzc2FnZXMgKyBcIiBtZXNzYWdlczwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxzcGFuIGNsYXNzPSdob2xvLXRleHQtc2Vjb25kYXJ5Jz5MYXN0IGFjdGl2ZSBcIiArIHV0aWxpdGllcy50aW1lQWdvKHZhbHVlLmxhc3RfbWVzc2FnZSkgKyBcIjwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPC9kaXY+XCI7XHJcblx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykuaHRtbChjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYXQoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LW1lc3NhZ2VzJz48L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1hY3Rpb25zJz5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaHJlZj0nL3RyYW5zcGFyZW5jeS9tYXJrZG93bicgdGFyZ2V0PSdfYmxhbmsnIGlkPSdjaGF0Ym94LW1hcmtkb3duJz5NYXJrZG93bjwvYT5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaWQ9J2NoYXRib3gtY2hhbm5lbHMnPkNoYW5uZWxzPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGlucHV0IHR5cGU9J3RleHQnIGlkPSdjaGF0Ym94LW1lc3NhZ2UnIC8+XCI7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhdGJveCkuaHRtbChjb250ZW50cyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDbG9zZSgpIHtcclxuXHRcdHRoaXMuZ2V0U3RhcnQoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRNZXNzYWdlKCkge1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlLFxyXG5cdFx0XHRyZXNwb25zZTtcclxuXHRcdG1lc3NhZ2UgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50cyxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwucG9zdE1lc3NhZ2UsIG1lc3NhZ2UpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJycpO1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2Utc2VudCcpO1xyXG5cdFx0XHRcdH0sIDE1MDApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3BvbnNlLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IGFyZSBub3QgbG9nZ2VkIGluIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlc3BvbnNlLmVycm9yID09PSAtMikge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IHdlcmUgbXV0ZWQgZm9yIG9uZSBob3VyIGJ5IGEgc3RhZmYgbWVtYmVyIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1RoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yLiAgUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdH0sIDI1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzd2l0Y2hDaGFubmVsKCkge1xyXG5cdFx0dmFyIGRhdGEsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0ZGF0YSA9IHtcclxuXHRcdFx0Y2hhbm5lbDogbmFtZVxyXG5cdFx0fTtcclxuXHRcdHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9jaGFubmVscy9jaGVjaycsIGRhdGEpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0aWYocmVzcG9uc2UudmFsaWQpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmNoYW5uZWwgPSBuYW1lO1xyXG5cdFx0XHRcdGNoYXRib3guZ2V0U3RhcnQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnZXJyb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGlkOiB0aGlzLmxhc3RJZCxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldFVwZGF0ZSwgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVzLmxhc3RSZWZyZXNoID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZXMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjbGVhclRpbWVvdXQoY2hhdGJveC50aW1lb3V0VXBkYXRlKTtcclxuXHRcdFx0Y2hhdGJveC50aW1lb3V0VXBkYXRlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0fSwgMTAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlVGltZUFnbygpIHtcclxuXHRcdHZhciBtZXNzYWdlcyA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuZmluZCgnLm1zZycpO1xyXG5cdFx0JC5lYWNoKG1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdHZhciB0aW1lc3RhbXAgPSAkKHZhbHVlKS5maW5kKCd0aW1lJykuYXR0cignZGF0YS10cycpO1xyXG5cdFx0XHQkKHZhbHVlKS5maW5kKCd0aW1lJykuaHRtbCh1dGlsaXRpZXMudGltZUFnbyh0aW1lc3RhbXApKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG59IiwidmFyIGNvbWJhdENhbGN1bGF0b3I7XHJcbmNsYXNzIENvbWJhdENhbGN1bGF0b3Ige1xyXG5cdGNsaWNrczogYW55ID0ge307XHJcblx0Z2VuZXJhdGU6IGFueSA9IHt9O1xyXG5cdGlucHV0czogYW55ID0ge307XHJcblx0b3RoZXI6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuY2xpY2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmdlbmVyYXRlID0ge1xyXG5cdFx0XHRsZXZlbDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bGV2ZWwnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5pbnB1dHMgPSB7XHJcblx0XHRcdGF0dGFjazogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6YXR0YWNrJ11cIixcclxuXHRcdFx0ZGVmZW5jZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6ZGVmZW5jZSddXCIsXHJcblx0XHRcdHN0cmVuZ3RoOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdHJlbmd0aCddXCIsXHJcblx0XHRcdGNvbnN0aXR1dGlvbjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6Y29uc3RpdHV0aW9uJ11cIixcclxuXHRcdFx0cmFuZ2VkOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpyYW5nZWQnXVwiLFxyXG5cdFx0XHRwcmF5ZXI6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnByYXllciddXCIsXHJcblx0XHRcdG1hZ2ljOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjptYWdpYyddXCIsXHJcblx0XHRcdHN1bW1vbmluZzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VtbW9uaW5nJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMub3RoZXIgPSB7XHJcblx0XHRcdG5hbWU6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm5hbWUnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0bG9hZENvbWJhdDogJy9jYWxjdWxhdG9ycy9jb21iYXQvbG9hZCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaW5wdXRzLmF0dGFjaykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuZGVmZW5jZSkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3RyZW5ndGgpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmNvbnN0aXR1dGlvbikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucmFuZ2VkKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5wcmF5ZXIpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLm1hZ2ljKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdW1tb25pbmcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuY2xpY2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Z2V0TGV2ZWxzKCkge1xyXG5cdFx0dmFyIG5hbWUgPSAkKHRoaXMub3RoZXIubmFtZSkudmFsKCksXHJcblx0XHRcdGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH0sXHJcblx0XHRcdGxldmVscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmxvYWRDb21iYXQsIGRhdGEpO1xyXG5cdFx0bGV2ZWxzLmRvbmUoZnVuY3Rpb24obGV2ZWxzKSB7XHJcblx0XHRcdGxldmVscyA9ICQucGFyc2VKU09OKGxldmVscyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuYXR0YWNrKS52YWwobGV2ZWxzLmF0dGFjayk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuZGVmZW5jZSkudmFsKGxldmVscy5kZWZlbmNlKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdHJlbmd0aCkudmFsKGxldmVscy5zdHJlbmd0aCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuY29uc3RpdHV0aW9uKS52YWwobGV2ZWxzLmNvbnN0aXR1dGlvbik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucmFuZ2VkKS52YWwobGV2ZWxzLnJhbmdlZCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucHJheWVyKS52YWwobGV2ZWxzLnByYXllcik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMubWFnaWMpLnZhbChsZXZlbHMubWFnaWMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN1bW1vbmluZykudmFsKGxldmVscy5zdW1tb25pbmcpO1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dXBkYXRlTGV2ZWwoKSB7XHJcblx0XHR2YXIgbWVsZWUgPSB0aGlzLnZhbCgnYXR0YWNrJykgKyB0aGlzLnZhbCgnc3RyZW5ndGgnKTtcclxuXHRcdHZhciBtYWdpYyA9IDIgKiB0aGlzLnZhbCgnbWFnaWMnKTtcclxuXHRcdHZhciByYW5nZWQgPSAyICogdGhpcy52YWwoJ3JhbmdlZCcpO1xyXG5cdFx0dmFyIGRlZiA9IHRoaXMudmFsKCdkZWZlbmNlJykgKyB0aGlzLnZhbCgnY29uc3RpdHV0aW9uJyk7XHJcblx0XHR2YXIgb3RoZXIgPSAoLjUgKiB0aGlzLnZhbCgncHJheWVyJykpICsgKC41ICogdGhpcy52YWwoJ3N1bW1vbmluZycpKTtcclxuXHRcdHZhciBsZXZlbCA9ICgxMy8xMCkgKiBNYXRoLm1heChtZWxlZSwgbWFnaWMsIHJhbmdlZCkgKyBkZWYgKyBvdGhlcjtcclxuXHRcdGxldmVsICo9IC4yNTtcclxuXHRcdGxldmVsID0gTWF0aC5mbG9vcihsZXZlbCk7XHJcblx0XHQkKHRoaXMuZ2VuZXJhdGUubGV2ZWwpLmh0bWwobGV2ZWwpO1xyXG5cdH1cclxuXHR2YWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQoJChcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpcIiArIG5hbWUgKyBcIiddXCIpLnZhbCgpKTtcclxuXHR9XHJcbn0iLCJ2YXIgZm9ydW1zO1xyXG5jbGFzcyBGb3J1bXMge1xyXG5cdHB1YmxpYyBlbGVtZW50czogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcG9zdDogUG9zdCA9IG51bGw7XHJcblx0cHVibGljIHRocmVhZENyZWF0ZTogRm9ydW1zVGhyZWFkQ3JlYXRlID0gbnVsbDtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHQncG9zdEVkaXRvcic6IFwiW3J0LWRhdGE9J3Bvc3QuZWRpdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHQndm90ZSc6IGZ1bmN0aW9uKGlkOiBudW1iZXIpIHsgcmV0dXJuICcvZm9ydW1zL3Bvc3QvJyArIGlkICsgJy92b3RlJzsgfVxyXG5cdFx0fTtcclxuXHRcdHRoaXMucG9zdCA9IG5ldyBQb3N0KCk7XHJcblx0XHQkKCcudXB2b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy51cHZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnLmRvd252b3RlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIHBvc3RJZCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XHJcblx0XHRcdGZvcnVtcy5kb3dudm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQucG9zdDpxdW90ZSddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZS50YXJnZXQpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0Zm9ydW1zLnBvc3QucXVvdGUoaWQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZG93bnZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ2Rvd24nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXB2b3RlKHBvc3RJZDogYW55KSB7XHJcblx0XHRwb3N0SWQgPSBwb3N0SWQucmVwbGFjZShcInBvc3RcIiwgXCJcIik7XHJcblx0XHR2YXIgcG9zdCA9ICQoJyNwb3N0JyArIHBvc3RJZCksXHJcblx0XHRcdGlzVXB2b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKSxcclxuXHRcdFx0aXNEb3dudm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAndXAnXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbmNsYXNzIFBvc3Qge1xyXG5cdHB1YmxpYyBxdW90ZShpZDogYW55KSB7XHJcblx0XHR2YXIgc291cmNlID0gJChcIltydC1kYXRhPSdwb3N0I1wiICsgaWQgK1wiOnNvdXJjZSddXCIpLmh0bWwoKSxcclxuXHRcdFx0cG9zdENvbnRlbnRzID0gJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKCk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXFxuL2csICdcXG4+Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmx0Oy9nLCAnPCcpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZndDsvZywgJz4nKTtcclxuXHRcdHNvdXJjZSA9IFwiPlwiICsgc291cmNlO1xyXG5cdFx0aWYocG9zdENvbnRlbnRzLmxlbmd0aCA+IDApXHJcblx0XHRcdHBvc3RDb250ZW50cyArPSBcIlxcblwiO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikudmFsKHBvc3RDb250ZW50cyArIHNvdXJjZSArIFwiXFxuXCIpO1xyXG5cdFx0dXRpbGl0aWVzLnNjcm9sbFRvKCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLCAxMDAwKTtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLmZvY3VzKCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBGb3J1bXNUaHJlYWRDcmVhdGUge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIHF1ZXN0aW9uczogQXJyYXkgPSBbXTtcclxuXHRwdWJsaWMgdmFsdWVzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgdmlld3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHF1ZXN0aW9uQWRkOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uLmFkZCddXCIsXHJcblx0XHRcdHF1ZXN0aW9uczogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbnMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMgPSBBcnJheSg1MDApO1xyXG5cdFx0dGhpcy52YWx1ZXMgPSB7XHJcblx0XHRcdHF1ZXN0aW9uczogMFxyXG5cdFx0fTtcclxuXHRcdHRoaXMudmlld3MgPSB7XHJcblx0XHRcdGFuc3dlcjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLmFuc3dlciddXCIpLmh0bWwoKSxcclxuXHRcdFx0cXVlc3Rpb246ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbiddXCIpLmh0bWwoKVxyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbkFkZCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5hZGRRdWVzdGlvbigpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHB1YmxpYyBhZGRRdWVzdGlvbigpIHtcclxuXHRcdHZhciBodG1sID0gdGhpcy52aWV3cy5xdWVzdGlvbjtcclxuXHRcdCQodGhpcy5ob29rcy5xdWVzdGlvbnMpLmFwcGVuZChodG1sKTtcclxuXHRcdHRoaXMudmFsdWVzLnF1ZXN0aW9ucyArPSAxO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlbW92ZVF1ZXN0aW9uKG51bWJlcjogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnF1ZXN0aW9ucy5zcGxpY2UobnVtYmVyLCAxKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXRMaXN0ZW5lcihlbGVtZW50LCB0eXBlKSB7XHJcblx0XHRpZih0eXBlID09PSBcInJlbW92ZSBxdWVzdGlvblwiKSB7XHJcblx0XHRcdHRoaXMuc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0TGlzdGVuZXJSZW1vdmVRdWVzdGlvbihlbGVtZW50OiBhbnkpIHtcclxuXHRcdCQoZWxlbWVudCkuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0Zm9ydW1zLnRocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbigkKGVsZW1lbnQpLnBhcmVudCgpLnBhcmVudCgpLmF0dHIoJ3J0LWRhdGEnKSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0Zm9ydW1zID0gbmV3IEZvcnVtcygpO1xyXG59KTsiLCJjbGFzcyBMaXZlc3RyZWFtUmVzZXQge1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIGxhbmc6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwYXRoczogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0bm90ZTogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpub3RlJ11cIixcclxuXHRcdFx0c3Bpbm5lcjogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzcGlubmVyJ11cIixcclxuXHRcdFx0c3RhdHVzOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnN0YXR1cyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmxhbmcgPSB7XHJcblx0XHRcdGNoZWNraW5nOiAnY2hlY2tpbmcnLFxyXG5cdFx0XHRvZmZsaW5lOiAnb2ZmbGluZScsXHJcblx0XHRcdG9ubGluZTogJ29ubGluZScsXHJcblx0XHRcdHVua25vd246ICd1bmtub3duJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdHJlc2V0OiAnL2xpdmVzdHJlYW0vcmVzZXQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5yZXNldCgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZXNldCgpIHtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMX0pO1xyXG5cdFx0dmFyIHN0YXR1cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnJlc2V0LCB7fSk7XHJcblx0XHRzdGF0dXMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9IHV0aWxpdGllcy5KU09ORGVjb2RlKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLm9ubGluZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIGlmKHJlc3VsdHMub25saW5lID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNPZmZsaW5lKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c1Vua25vd24oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3Bpbm5lclJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDB9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzcGlubmVyUmVtb3ZlKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnNwaW5uZXIpLmNzcyh7XHJcblx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c2VzKGNoZWNraW5nOiBzdHJpbmcsIG9ubGluZTogc3RyaW5nLCBvZmZsaW5lOiBzdHJpbmcsIHVua25vd246IHN0cmluZykge1xyXG5cdFx0dGhpcy5sYW5nLmNoZWNraW5nID0gY2hlY2tpbmc7XHJcblx0XHR0aGlzLmxhbmcub2ZmbGluZSA9IG9mZmxpbmU7XHJcblx0XHR0aGlzLmxhbmcub25saW5lID0gb25saW5lO1xyXG5cdFx0dGhpcy5sYW5nLnVua25vd24gPSB1bmtub3duO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09mZmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib2ZmbGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT25saW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9ubGluZVwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c1Vua25vd24oKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwidW5rbm93blwiKS5cclxuXHRcdFx0cmVtb3ZlQ2xhc3MoKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtd2FybmluZycpO1xyXG5cdH1cclxufSIsInZhciBydW5ldGltZTtcclxuY2xhc3MgUnVuZVRpbWUge1xyXG5cdGxvYWRpbmc6c3RyaW5nID0gJyNsb2FkaW5nJztcclxufVxyXG5ydW5ldGltZSA9IG5ldyBSdW5lVGltZSgpO1xyXG4kKGZ1bmN0aW9uICgpIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHQkKCdbZGF0YS10b2dnbGVdJykudG9vbHRpcCgpO1xyXG5cdCQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigpO1xyXG5cdCQoJ3Rib2R5LnJvd2xpbmsnKS5yb3dsaW5rKCk7XHJcblx0JCgnI3RvcCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdCQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuXHRcdFx0c2Nyb2xsVG9wOiAwXHJcblx0XHR9LCAxMDAwKTtcclxuXHR9KTtcclxuXHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBoZWlnaHQgPSAkKCdib2R5JykuaGVpZ2h0KCksXHJcblx0XHRcdHNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuXHRcdFx0dG9wID0gJCgnI3RvcCcpO1xyXG5cdFx0aWYoc2Nyb2xsID4gaGVpZ2h0LzEwKSB7XHJcblx0XHRcdGlmKCEkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlSW4oMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKCQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVPdXQoMjAwKS5cclxuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKCdzZXQtdmlzJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxufSk7IiwidmFyIG5hbWVDaGVja2VyO1xyXG5jbGFzcyBOYW1lQ2hlY2tlciB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdG5vdEFsbG93ZWQ6IGFueSA9IFtdO1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGF2YWlsYWJpbGl0eTogJyNyc24tYXZhaWxhYmlsaXR5JyxcclxuXHRcdFx0Y2hlY2s6ICcjcnNuLWNoZWNrLWZpZWxkJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMubm90QWxsb3dlZCA9IFsnWm5WamF3PT0nLCAnYzJocGRBPT0nXTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrOiAnL25hbWUvY2hlY2snXHJcblx0XHR9O1xyXG5cdFx0JChcIltydC1ob29rPSduYW1lLmNoZWNrZXI6c3VibWl0J11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbih2YWx1ZTogYW55KSB7XHJcblx0XHRcdG5hbWVDaGVja2VyLmNoZWNrKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Y2hlY2soKSB7XHJcblx0XHR2YXIgbmFtZSA9ICQoJyNyc24tY2hlY2stZmllbGQnKS52YWwoKTtcclxuXHRcdHZhciBjaGVja05hbWUgPSB0aGlzLmNoZWNrTmFtZShuYW1lKTtcclxuXHRcdGlmKGNoZWNrTmFtZSA9PT0gMCkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiWW91IGRpZCBub3QgZW50ZXIgYW55dGhpbmcuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gMSkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IGlzIG92ZXIgMTIgY2hhcmFjdGVycy5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSAyKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gaXMgdW5kZXIgMyBjaGFyYWN0ZXJzLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDMpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBzdGFydHMgd2l0aCB0aGUgd29yZCBNb2QuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gNCkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IGNvbnRhaW5zIGEgc3dlYXIgd29yZC5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSA1KSB7XHJcblx0XHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdHJzbjogbmFtZVxyXG5cdFx0XHR9O1xyXG5cdFx0XHR2YXIgZGV0YWlscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmNoZWNrLCBkYXRhKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbCgnTG9hZGluZy4uLicpO1xyXG5cdFx0XHRkZXRhaWxzLmRvbmUoZnVuY3Rpb24oZGV0YWlsczogc3RyaW5nKSB7XHJcblx0XHRcdFx0dmFyIGF2YWlsYWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdGlmKGRldGFpbHMuc3Vic3RyaW5nKDAsIDYpID09PSBcIjxodG1sPlwiKSB7XHJcblx0XHRcdFx0XHRhdmFpbGFibGUgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihhdmFpbGFibGUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRcdG5hbWVDaGVja2VyLmF2YWlsYWJsZShuYW1lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0bmFtZUNoZWNrZXIudW5hdmFpbGFibGUoJ1RoZSBSdW5lc2NhcGUgbmFtZSA8Yj4nICsgbmFtZSArICc8L2I+IGlzIG5vdCBhdmFpbGFibGUuJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0YXZhaWxhYmxlKG5hbWU6IHN0cmluZykge1xyXG5cdFx0JChuYW1lQ2hlY2tlci5lbGVtZW50cy5hdmFpbGFiaWxpdHkpLmh0bWwoJ1RoZSBSdW5lU2NhcGUgbmFtZSA8Yj4nICsgbmFtZSArICc8L2I+IGlzIGF2YWlsYWJsZS4nKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHRjb2xvcjogJ2dyZWVuJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrTmFtZShuYW1lOiBzdHJpbmcpIHtcclxuXHRcdGlmKHR5cGVvZihuYW1lKSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEyKSB7XHJcblx0XHRcdFx0cmV0dXJuIDE7XHJcblx0XHRcdH0gZWxzZSBpZiAobmFtZS5sZW5ndGggPCAzKSB7XHJcblx0XHRcdFx0cmV0dXJuIDI7XHJcblx0XHRcdH0gZWxzZSBpZiAobmFtZS5zdWJzdHJpbmcoMCwgMykgPT09ICdNb2QnKSB7XHJcblx0XHRcdFx0cmV0dXJuIDM7XHJcblx0XHRcdH1cclxuXHRcdFx0JC5lYWNoKHRoaXMubm90QWxsb3dlZCwgZnVuY3Rpb24gKGtleTpudW1iZXIsIHZhbHVlOmFueSkge1xyXG5cdFx0XHRcdHZhciBkZWNvZGUgPSBhdG9iKHZhbHVlKTtcclxuXHRcdFx0XHRpZiAobmFtZS5pbmRleE9mKGRlY29kZSkgPiAtMSlcclxuXHRcdFx0XHRcdHJldHVybiA0O1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiA1O1xyXG5cdH1cclxuXHR1bmF2YWlsYWJsZShtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5hdmFpbGFiaWxpdHkpLmh0bWwobWVzc2FnZSkuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0Y29sb3I6ICdyZWQnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSIsImNsYXNzIE5vdGlmaWNhdGlvbnMge1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgcGF0aHM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wYXRocyA9IHtcclxuICAgICAgICAgICAgbWFya1JlYWQ6ICcvbm90aWZpY2F0aW9ucy9tYXJrLXJlYWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKFwiW3J0LWhvb2s9J2hvb2shbm90aWZpY2F0aW9uczptYXJrLnJlYWQnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZS50YXJnZXQuYXR0cigncnQtZGF0YScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciByYWRpbztcclxudmFyIGNoYXRib3g7XHJcbmNsYXNzIFJhZGlvIHtcclxuICAgIHBvcHVwOiBhbnkgPSBudWxsO1xyXG4gICAgc3RhdHVzOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBzdGF0dXNDbG9zZWQ6IHN0cmluZyA9ICcnO1xyXG4gICAgc3RhdHVzT3Blbjogc3RyaW5nID0gJyc7XHJcbiAgICBVUkw6IHN0cmluZyA9ICcnO1xyXG4gICAgdmFyTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcbiAgICB2YXJTdGF0dXM6IHN0cmluZyA9ICcnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5VUkwgPSAnaHR0cDovL2FwcHMuc3RyZWFtbGljZW5zaW5nLmNvbS9wbGF5ZXItcG9wdXAucGhwP3NpZD0yNTc5JnN0cmVhbV9pZD00Mzg2JztcclxuICAgICAgICB0aGlzLnN0YXR1c0Nsb3NlZCA9ICd0byBsaXN0ZW4gdG8gUnVuZVRpbWUgUmFkaW8hJztcclxuICAgICAgICB0aGlzLnN0YXR1c09wZW4gPSAndG8gY2xvc2UgUnVuZVRpbWUgUmFkaW8nO1xyXG4gICAgICAgIHRoaXMudmFyTWVzc2FnZSA9ICcjcmFkaW8tbWVzc2FnZSc7XHJcbiAgICAgICAgdGhpcy52YXJTdGF0dXMgPSAnI3JhZGlvLXN0YXR1cyc7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAkKCcjcmFkaW8tbGluaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZighcmFkaW8uc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICByYWRpby5vcGVuUmFkaW8oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJhZGlvLmNsb3NlUmFkaW8oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNyYWRpby1oaXN0b3J5JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJhZGlvLm9wZW5IaXN0b3J5KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmFkaW8ub3BlblJlcXVlc3QoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcmFkaW8tdGltZXRhYmxlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJhZGlvLm9wZW5UaW1ldGFibGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByYWRpby5oaWRlUHVsbCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgY2xvc2VSYWRpbygpIHtcclxuICAgICAgICB0aGlzLnBvcHVwLmNsb3NlKCk7XHJcbiAgICAgICAgJCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNDbG9zZWQpO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgJCh0aGlzLnZhclN0YXR1cykuXHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKCd0ZXh0LXN1Y2Nlc3MnKS5cclxuICAgICAgICAgICAgYWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJykuXHJcbiAgICAgICAgICAgIGh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T2ZmXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5SYWRpbygpIHtcclxuICAgICAgICB0aGlzLnBvcHVwID0gd2luZG93Lm9wZW4odGhpcy5VUkwsICdSdW5lVGltZSBSYWRpbycsICd3aWR0aD0zODksaGVpZ2h0PTM1OScpO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gdHJ1ZTtcclxuICAgICAgICAkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c09wZW4pO1xyXG4gICAgICAgICQodGhpcy52YXJTdGF0dXMpLlxyXG4gICAgICAgICAgICByZW1vdmVDbGFzcygndGV4dC1kYW5nZXInKS5cclxuICAgICAgICAgICAgYWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpLlxyXG4gICAgICAgICAgICBodG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9uXCIpO1xyXG4gICAgICAgIHZhciBwb2xsVGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZihyYWRpby5wb3B1cC5jbG9zZWQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xyXG4gICAgICAgICAgICAgICAgcmFkaW8uY2xvc2VSYWRpbygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbkhpc3RvcnkoKSB7XHJcbiAgICAgICAgdmFyIGhpc3RvcnkgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vaGlzdG9yeScpO1xyXG4gICAgICAgIGhpc3RvcnkuZG9uZShmdW5jdGlvbihoaXN0b3J5KSB7XHJcbiAgICAgICAgICAgIGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuICAgICAgICAgICAgdmFyIG11c2ljID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0ndGFibGUnPjx0aGVhZD48dHI+PHRkPlRpbWU8L3RkPjx0ZD5BcnRpc3Q8L3RkPjx0ZD5OYW1lPC90ZD48L3RyPjwvdGhlYWQ+PHRib2R5PlwiO1xyXG4gICAgICAgICAgICBmb3IodmFyIHggPSAwLCB5ID0gaGlzdG9yeS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuICAgICAgICAgICAgICAgIG11c2ljID0gaGlzdG9yeVt4XTtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuICAgICAgICAgICAgcmFkaW8ub3BlblB1bGwoaHRtbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlblRpbWV0YWJsZSgpIHtcclxuICAgICAgICB2YXIgdGltZXRhYmxlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3RpbWV0YWJsZScpO1xyXG4gICAgICAgIHRpbWV0YWJsZS5kb25lKGZ1bmN0aW9uKHRpbWV0YWJsZSkge1xyXG4gICAgICAgICAgICB0aW1ldGFibGUgPSAkLnBhcnNlSlNPTih0aW1ldGFibGUpO1xyXG4gICAgICAgICAgICB2YXIgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0ZXh0LWNlbnRlcic+PHRoZWFkPjx0cj48dGQ+Jm5ic3A7PC90ZD48dGQ+TW9uZGF5PC90ZD48dGQ+VHVlc2RheTwvdGQ+PHRkPldlZG5lc2RheTwvdGQ+PHRkPlRodXJzZGF5PC90ZD48dGQ+RnJpZGF5PC90ZD48dGQ+U2F0dXJkYXk8L3RkPjx0ZD5TdW5kYXk8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcbiAgICAgICAgICAgIGZvcih2YXIgeCA9IDAsIHkgPSAyMzsgeCA8PSB5OyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgeCArIFwiOjAwPC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDAsIGogPSA2OyBpIDw9IGo7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGltZXRhYmxlW2ldICE9PSB1bmRlZmluZWQgJiYgdGltZXRhYmxlW2ldW3hdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSB0aW1ldGFibGVbaV1beF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIiZuYnNwO1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IFwiPC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8L3RyPlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcbiAgICAgICAgICAgIHJhZGlvLm9wZW5QdWxsKGh0bWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5SZXF1ZXN0KCkge1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3JlcXVlc3Qvc29uZycpO1xyXG4gICAgICAgIHJlcXVlc3QuZG9uZShmdW5jdGlvbihyZXF1ZXN0KSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3QgPSAkLnBhcnNlSlNPTihyZXF1ZXN0KTtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPGZvcm0gcm9sZT0nZm9ybSc+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1hcnRpc3QnPkFydGlzdCBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtYXJ0aXN0JyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LWFydGlzdCcgcGxhY2Vob2xkZXI9J0FydGlzdCBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtbmFtZSc+U29uZyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtbmFtZScgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1uYW1lJyBwbGFjZWhvbGRlcj0nU29uZyBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxwIGlkPSdyZXF1ZXN0LWJ1dHRvbicgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+UmVxdWVzdDwvcD48L2Rpdj48L2Zvcm0+XCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtd2FybmluZyc+QXV0byBESiBjdXJyZW50bHkgZG9lcyBub3QgYWNjZXB0IHNvbmcgcmVxdWVzdHMsIHNvcnJ5IVwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+WW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHJlcXVlc3QgYSBzb25nIGZyb20gdGhlIERKLjwvcD5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByYWRpby5vcGVuUHVsbChodG1sKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmFkaW8uc2VuZFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZFJlcXVlc3QoKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAnYXJ0aXN0JzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtYXJ0aXN0JykudmFsdWUsXHJcbiAgICAgICAgICAgICAgICAnbmFtZSc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LW5hbWUnKS52YWx1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250ZW50cztcclxuICAgICAgICBjb250ZW50cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJywgZGF0YSk7XHJcbiAgICAgICAgY29udGVudHMuZG9uZShmdW5jdGlvbihjb250ZW50cykge1xyXG4gICAgICAgICAgICBjb250ZW50cyA9ICQucGFyc2VKU09OKGNvbnRlbnRzKTtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZihjb250ZW50cy5zZW50ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5Zb3VyIHJlcXVlc3QgaGFzIGJlZW4gc2VudCB0byB0aGUgREo8L3A+XCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC4gIFRyeSBhZ2Fpbj9cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5oaWRlUHVsbCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlblB1bGwoY29udGVudHM6IHN0cmluZykge1xyXG4gICAgICAgICQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbChjb250ZW50cyk7XHJcbiAgICAgICAgJCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcbiAgICAgICAgICAgIGNzcyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzUwJSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG4gICAgICAgICAgICB3aWR0aDogJzUwJSdcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlUHVsbCgpIHtcclxuICAgICAgICAkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoJyZuYnNwOycpO1xyXG4gICAgICAgICQoJyNyYWRpby1wdWxsJykud2lkdGgoJycpLlxyXG4gICAgICAgICAgICBhZGRDbGFzcygnaGlkZGVuJykuXHJcbiAgICAgICAgICAgIGNzcyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzAlJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcmFkaW8tb3B0aW9ucycpLndpZHRoKCcnKS5cclxuICAgICAgICAgICAgY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgICQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKCcnKTtcclxuICAgICAgICB2YXIgdXBkYXRlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3VwZGF0ZScpO1xyXG4gICAgICAgIHVwZGF0ZS5kb25lKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG4gICAgICAgICAgICB1cGRhdGUgPSAkLnBhcnNlSlNPTih1cGRhdGUpO1xyXG4gICAgICAgICAgICB2YXIgcmVxdWVzdHNIVE1MID0gXCJcIjtcclxuICAgICAgICAgICAgJCgnI3JhZGlvLXNvbmctbmFtZScpLmh0bWwodXBkYXRlWydzb25nJ11bJ25hbWUnXSk7XHJcbiAgICAgICAgICAgICQoJyNyYWRpby1zb25nLWFydGlzdCcpLmh0bWwodXBkYXRlWydzb25nJ11bJ2FydGlzdCddKTtcclxuICAgICAgICAgICAgaWYodXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQoJyNyYWRpby1kaicpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjcmFkaW8tZGonKS5odG1sKFwiQXV0byBESlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gJycgJiYgdXBkYXRlWydtZXNzYWdlJ10gIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKHVwZGF0ZVsnbWVzc2FnZSddKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHVwZGF0ZVsnbWVzc2FnZSddID09PSAtMSkge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSArIFwiIGlzIGN1cnJlbnRseSBvbiBhaXIhXCIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkF1dG8gREogaXMgY3VycmVudGx5IG9uIGFpclwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IodmFyIHggPSAwLCB5ID0gdXBkYXRlWydyZXF1ZXN0cyddLmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB1cGRhdGVbJ3JlcXVlc3RzJ11beF07XHJcbiAgICAgICAgICAgICAgICBpZihyZXF1ZXN0LnN0YXR1cyA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdHNIVE1MICs9IFwiPHA+XCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RzSFRNTCArPSBcIjxwIGNsYXNzPSd0ZXh0LXN1Y2Nlc3MnPlwiO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC13YXJuaW5nJz5cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RzSFRNTCArPSByZXF1ZXN0LnNvbmdfbmFtZSArIFwiIGJ5IFwiICsgcmVxdWVzdC5zb25nX2FydGlzdDtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RzSFRNTCArPSBcIjwvcD5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcjcmVxdWVzdHMtdXNlci1jdXJyZW50JykuaHRtbChyZXF1ZXN0c0hUTUwpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmFkaW8udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH0sIDMwMDAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciBzaWdudXBGb3JtO1xyXG5jbGFzcyBTaWdudXBGb3JtIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0ZGlzcGxheU5hbWU6ICcjZGlzcGxheV9uYW1lJyxcclxuXHRcdFx0ZW1haWw6ICcjZW1haWwnLFxyXG5cdFx0XHRwYXNzd29yZDogJyNwYXNzd29yZCcsXHJcblx0XHRcdHBhc3N3b3JkMjogJyNwYXNzd29yZDInLFxyXG5cdFx0XHRzZWN1cml0eUNoZWNrOiAnI3NlY3VyaXR5J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrQXZhaWxhYmlsaXR5OiAnL2dldC9zaWdudXAvJ1xyXG5cdFx0fTtcclxuXHRcdHZhciBzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkLFxyXG5cdFx0XHR0aW1lb3V0ID0gNTAwO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmRpc3BsYXlOYW1lKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZGlzcGxheV9uYW1lJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZW1haWwpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRW1haWwpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0VtYWlsKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzaWdudXBGb3JtLmNoZWNrU2VjdXJpdHkoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRzaWdudXBGb3JtLnN1Ym1pdChlKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tBdmFpbGFiaWxpdHkoZmllbGQ6IHN0cmluZykge1xyXG5cdFx0dmFyIHZhbCA9ICQoJyMnICsgZmllbGQpLnZhbCgpO1xyXG5cdFx0aWYodmFsLmxlbmd0aCA9PT0gMClcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0dmFyIHVybCA9IHRoaXMucGF0aHMuY2hlY2tBdmFpbGFiaWxpdHkgKyBmaWVsZDtcclxuXHRcdHZhciBhdmFpbGFibGU7XHJcblx0XHRpZihmaWVsZCA9PT0gXCJkaXNwbGF5X25hbWVcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGRpc3BsYXlfbmFtZTogdmFsIH0pO1xyXG5cdFx0fSBlbHNlIGlmKGZpZWxkID09PSBcImVtYWlsXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBlbWFpbDogdmFsIH0pO1xyXG5cdFx0fVxyXG5cdFx0YXZhaWxhYmxlLmRvbmUoZnVuY3Rpb24oYXZhaWxhYmxlOiBzdHJpbmcpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoYXZhaWxhYmxlKTtcclxuXHRcdFx0aWYoYXZhaWxhYmxlLmF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja1Bhc3N3b3JkKCkge1xyXG5cdFx0dmFyIHYxID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS52YWwoKSxcclxuXHRcdFx0djIgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS52YWwoKTtcclxuXHRcdGlmKHYyLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0aWYodjEgPT09IHYyKSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCB0cnVlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCB0cnVlKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIGZhbHNlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCBmYWxzZSk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjaGVja1NlY3VyaXR5KCkge1xyXG5cdFx0dmFyIHNsaWRlclZhbCA9ICQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS52YWwoKTtcclxuXHRcdGlmKHNsaWRlclZhbCA8PSAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnbm9uZSdcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2UgaWYoc2xpZGVyVmFsID4gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ2Jsb2NrJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN1Ym1pdChlOiBhbnkpIHtcclxuXHRcdHZhciB1c2VybmFtZSA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ3VzZXJuYW1lJyksXHJcblx0XHRcdGVtYWlsID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKSxcclxuXHRcdFx0cGFzcyA9IHRoaXMuY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0aWYodXNlcm5hbWUgPT09IHRydWUgJiYgZW1haWwgPT09IHRydWUgJiYgcGFzcyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dG9nZ2xlRmVlZGJhY2soZmllbGQ6IHN0cmluZywgc3RhdHVzOiBib29sZWFuKSB7XHJcblx0XHRpZihzdGF0dXMgPT09IHRydWUpIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93Jyk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiY2xhc3MgU3RhZmZMaXN0IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHZhciBtZW1iZXJzID0gJChcIltydC1ob29rPSdob29rIXN0YWZmLmxpc3Q6Y2FyZCddXCIpO1xyXG4gICAgICAgICQuZWFjaChtZW1iZXJzLCBmdW5jdGlvbihpbmRleDogbnVtYmVyLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkKHZhbHVlKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh2YWwpLmF0dHIoJ3J0LWRhdGEnKTtcclxuICAgICAgICAgICAgJCh2YWwpLmZpbmQoJy5mcm9udCcpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCcvaW1nL2ZvcnVtcy9waG90b3MvXCIgKyBpZCArIFwiLnBuZycpXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmFsKS5iaW5kKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciB1dGlsaXRpZXM7XHJcbmNsYXNzIFV0aWxpdGllcyB7XHJcbiAgICBnZXRBSkFYKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcG9zdEFKQVgocGF0aDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBwYXRoLFxyXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aW1lQWdvKHRzOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbm93VHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcclxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vd1RzIC0gdHM7XHJcbiAgICAgICAgaWYoc2Vjb25kcyA+IDIgKiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYSBmZXcgZGF5cyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ5ZXN0ZXJkYXlcIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDcyMDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDM2MDApICsgXCIgaG91cnMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImFuIGhvdXIgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gMTIwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCkgKyBcIiBtaW51dGVzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDYwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgbWludXRlIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwiIHNlY29uZHMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBzZWNvbmQgYWdvXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY3VycmVudFRpbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG4gICAgfVxyXG4gICAgSlNPTkRlY29kZShqc29uOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gJC5wYXJzZUpTT04oanNvbik7XHJcbiAgICB9XHJcbiAgICBzY3JvbGxUbyhlbGVtZW50OiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcFxyXG4gICAgICAgIH0sIHRpbWUpO1xyXG4gICAgfVxyXG59XHJcbnV0aWxpdGllcyA9IG5ldyBVdGlsaXRpZXMoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=