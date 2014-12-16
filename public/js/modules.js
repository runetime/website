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
    $('.navbar .dropdown').hover(function () {
        $(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
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
        this.elements = {};
        this.popup = null;
        this.status = false;
        this.statusClosed = '';
        this.statusOpen = '';
        this.URL = '';
        this.varMessage = '';
        this.varStatus = '';
        this.online = true;
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
        if (this.popup) {
            this.popup.close();
        }
        $(this.varMessage).html(this.statusClosed);
        this.status = false;
        $(this.varStatus).removeClass('text-success').addClass('text-danger').html("<i id='power-button' class='fa fa-power-off'></i>Off");
    };
    Radio.prototype.openRadio = function () {
        if (this.online !== true) {
            return false;
            this.onlineSettings();
        }
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
    Radio.prototype.onlineSettings = function () {
        if (this.online !== true) {
            this.closeRadio();
            $(this.elements.statusMessage).html("The radio has been set offline.");
        }
        else {
            $(this.elements.statusMessage).html("");
        }
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
            radio.online = update.online;
            setTimeout(function () {
                radio.update();
            }, 30000);
            radio.onlineSettings();
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
        data._token = $('meta[name="_token"]').attr('content');
        return $.ajax({
            url: path,
            type: 'post',
            data: data,
            async: true
        });
    };
    Utilities.timeAgo = function (ts) {
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
    Utilities.currentTime = function () {
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
    Utilities.prototype.formToken = function (token) {
        token = atob(token);
        $('form').append("<input type='hidden' name='_token' value='" + token + "' />");
    };
    return Utilities;
})();
utilities = new Utilities();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2hhdGJveC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29tYmF0Y2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvZm9ydW1zLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9saXZlc3RyZWFtLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9tYWluLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9uYW1lY2hlY2tlci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbm90aWZpY2F0aW9ucy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvcmFkaW8udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkNhbGN1bGF0b3IiLCJDYWxjdWxhdG9yLmNvbnN0cnVjdG9yIiwiQ2FsY3VsYXRvci5jYWxjdWxhdGVYUCIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlTGV2ZWwiLCJDYWxjdWxhdG9yLmdldEluZm8iLCJDYWxjdWxhdG9yLmxvYWRDYWxjIiwiQ2FsY3VsYXRvci51cGRhdGVDYWxjIiwiQ2hhdGJveCIsIkNoYXRib3guY29uc3RydWN0b3IiLCJDaGF0Ym94LmFkZE1lc3NhZ2UiLCJDaGF0Ym94LmRpc3BsYXlNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZXMiLCJDaGF0Ym94LmVycm9yIiwiQ2hhdGJveC5nZXRTdGFydCIsIkNoYXRib3gubW9kIiwiQ2hhdGJveC5tb2RUb29scyIsIkNoYXRib3gucGFuZWxDaGFubmVscyIsIkNoYXRib3gucGFuZWxDaGF0IiwiQ2hhdGJveC5wYW5lbENsb3NlIiwiQ2hhdGJveC5zdWJtaXRNZXNzYWdlIiwiQ2hhdGJveC5zd2l0Y2hDaGFubmVsIiwiQ2hhdGJveC51cGRhdGUiLCJDaGF0Ym94LnVwZGF0ZVRpbWVBZ28iLCJDb21iYXRDYWxjdWxhdG9yIiwiQ29tYmF0Q2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzIiwiQ29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCIsIkNvbWJhdENhbGN1bGF0b3IudmFsIiwiRm9ydW1zIiwiRm9ydW1zLmNvbnN0cnVjdG9yIiwiRm9ydW1zLmRvd252b3RlIiwiRm9ydW1zLnVwdm90ZSIsIlBvc3QiLCJQb3N0LmNvbnN0cnVjdG9yIiwiUG9zdC5xdW90ZSIsIkZvcnVtc1RocmVhZENyZWF0ZSIsIkZvcnVtc1RocmVhZENyZWF0ZS5jb25zdHJ1Y3RvciIsIkZvcnVtc1RocmVhZENyZWF0ZS5hZGRRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lciIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uIiwiTGl2ZXN0cmVhbVJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LmNvbnN0cnVjdG9yIiwiTGl2ZXN0cmVhbVJlc2V0LnJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzZXMiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93biIsIlJ1bmVUaW1lIiwiUnVuZVRpbWUuY29uc3RydWN0b3IiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuY2hlY2siLCJOYW1lQ2hlY2tlci5hdmFpbGFibGUiLCJOYW1lQ2hlY2tlci5jaGVja05hbWUiLCJOYW1lQ2hlY2tlci51bmF2YWlsYWJsZSIsIk5vdGlmaWNhdGlvbnMiLCJOb3RpZmljYXRpb25zLmNvbnN0cnVjdG9yIiwiUmFkaW8iLCJSYWRpby5jb25zdHJ1Y3RvciIsIlJhZGlvLmNsb3NlUmFkaW8iLCJSYWRpby5vcGVuUmFkaW8iLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vcGVuUmVxdWVzdCIsIlJhZGlvLnNlbmRSZXF1ZXN0IiwiUmFkaW8ub3BlblB1bGwiLCJSYWRpby5oaWRlUHVsbCIsIlJhZGlvLm9ubGluZVNldHRpbmdzIiwiUmFkaW8udXBkYXRlIiwiU2lnbnVwRm9ybSIsIlNpZ251cEZvcm0uY29uc3RydWN0b3IiLCJTaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5IiwiU2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkIiwiU2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5IiwiU2lnbnVwRm9ybS5zdWJtaXQiLCJTaWdudXBGb3JtLnRvZ2dsZUZlZWRiYWNrIiwiU3RhZmZMaXN0IiwiU3RhZmZMaXN0LmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzIiwiVXRpbGl0aWVzLmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzLmdldEFKQVgiLCJVdGlsaXRpZXMucG9zdEFKQVgiLCJVdGlsaXRpZXMudGltZUFnbyIsIlV0aWxpdGllcy5jdXJyZW50VGltZSIsIlV0aWxpdGllcy5KU09ORGVjb2RlIiwiVXRpbGl0aWVzLnNjcm9sbFRvIiwiVXRpbGl0aWVzLmZvcm1Ub2tlbiJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLENBQUM7QUFDZixJQUFNLFVBQVU7SUFNWkEsU0FO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Q0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDMUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDOUIsQ0FBQyxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUNERCxvQ0FBU0EsR0FBVEE7UUFDQ0UsSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0Es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QUlBLENBQUNBLENBQUNBO1lBQ0pBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBO1FBQzFCQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNhSixxQkFBV0EsR0FBekJBO1FBQ0lLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUNNTCw4QkFBVUEsR0FBakJBLFVBQWtCQSxJQUFZQTtRQUMxQk0sTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBQ01OLDRCQUFRQSxHQUFmQSxVQUFnQkEsT0FBWUEsRUFBRUEsSUFBWUE7UUFDdENPLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBO1lBQ3BCQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQTtTQUNyQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFFTVAsNkJBQVNBLEdBQWhCQSxVQUFpQkEsS0FBYUE7UUFDMUJRLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSw0Q0FBNENBLEdBQUdBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3BGQSxDQUFDQTtJQUNMUixnQkFBQ0E7QUFBREEsQ0F2REEsQUF1RENBLElBQUE7QUFDRCxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhbGN1bGF0b3I7XHJcbmNsYXNzIENhbGN1bGF0b3Ige1xyXG4gICAgY2FsY3VsYXRvcjogYW55O1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgaW5mbzogYW55ID0ge307XHJcbiAgICBVUkw6IGFueSA9IHt9O1xyXG4gICAgaXRlbXM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbGM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRYUDogJyNjYWxjdWxhdG9yLWN1cnJlbnQteHAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJyNjYWxjdWxhdG9yLWRpc3BsYXktbmFtZScsXHJcbiAgICAgICAgICAgIHN1Ym1pdDogJyNjYWxjdWxhdG9yLXN1Ym1pdCcsXHJcbiAgICAgICAgICAgIHRhYmxlOiAnI2NhbGN1bGF0b3ItdGFibGUgdGJvZHknLFxyXG4gICAgICAgICAgICB0YXJnZXRMZXZlbDogJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuVVJMID0ge1xyXG4gICAgICAgICAgICBnZXRDYWxjOiAnL2NhbGN1bGF0b3JzL2xvYWQnLFxyXG4gICAgICAgICAgICBnZXRJbmZvOiAnL2dldC9oaXNjb3JlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pbmZvID0ge1xyXG4gICAgICAgICAgICBsZXZlbEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0OiAwLFxyXG4gICAgICAgICAgICBYUEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIFhQVGFyZ2V0OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0b3IgPSBjYWxjO1xyXG4gICAgICAgICQodGhpcy5lbGVtZW50cy5zdWJtaXQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYWxjdWxhdG9yLmdldEluZm8oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxvYWRDYWxjKCk7XHJcbiAgICAgICAgJCgnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJykua2V5dXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuICAgICAgICAgICAgfSwgMjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHRjYWxjdWxhdGVYUChsZXZlbDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCBsZXZlbDsgaSArPSAxKSB7XHJcblx0XHRcdHRvdGFsICs9IE1hdGguZmxvb3IoaSArIDMwMCAqIE1hdGgucG93KDIsIGkgLyA3LjApKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBNYXRoLmZsb29yKHRvdGFsIC8gNCk7XHJcblx0fVxyXG5cclxuXHRjYWxjdWxhdGVMZXZlbCh4cDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCAxMjA7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKyBNYXRoLnBvdygyLCBpIC8gNykpO1xyXG5cdFx0XHRpZihNYXRoLmZsb29yKHRvdGFsIC8gNCkgPiB4cClcclxuXHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0ZWxzZSBpZihpID49IDk5KVxyXG5cdFx0XHRcdHJldHVybiA5OTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICB2YXIgbmFtZSA9ICQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkudmFsKCk7XHJcblx0XHR2YXIgaW5mbyA9IHV0aWxpdGllcy5nZXRBSkFYKHRoaXMuVVJMLmdldEluZm8gKyAnLycgKyBuYW1lKTtcclxuXHRcdGluZm8uZG9uZShmdW5jdGlvbihpbmZvOiBhbnkpIHtcclxuXHRcdFx0aW5mbyA9ICQucGFyc2VKU09OKGluZm8pO1xyXG5cdFx0XHR2YXIgcmVsZXZhbnQgPSBpbmZvWzEzXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCA9IHJlbGV2YW50WzFdO1xyXG5cdFx0XHRjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50ID0gcmVsZXZhbnRbMl07XHJcblx0XHRcdCQoY2FsY3VsYXRvci5lbGVtZW50cy5jdXJyZW50WFApLnZhbChjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50KTtcclxuXHRcdFx0aWYoJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwoKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFyZ2V0TGV2ZWwpLnZhbChwYXJzZUludChjYWxjdWxhdG9yLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuXHRcdH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDYWxjKCkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge2lkOiB0aGlzLmNhbGN1bGF0b3J9O1xyXG4gICAgICAgIHZhciBpbmZvID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldENhbGMsIGRhdGEpO1xyXG4gICAgICAgIGluZm8uZG9uZShmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgIGluZm8gPSB1dGlsaXRpZXMuSlNPTkRlY29kZShpbmZvKTtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5pdGVtcyA9IGluZm87XHJcbiAgICAgICAgICAgICQuZWFjaChjYWxjdWxhdG9yLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLm5hbWUgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHAgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPiZpbmZpbjs8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjwvdHI+XCI7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ2FsYygpIHtcclxuICAgICAgICB2YXIgbGV2ZWxDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgbGV2ZWxUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICB4cEN1cnJlbnQgPSAwLFxyXG4gICAgICAgICAgICB4cFRhcmdldCA9IDAsXHJcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgPSAwLFxyXG4gICAgICAgICAgICBhbW91bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuaW5mby5sZXZlbFRhcmdldCA9IHBhcnNlSW50KCQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLnZhbCgpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmluZm8ubGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgIHRoaXMuaW5mby5YUFRhcmdldCA9IHRoaXMuY2FsY3VsYXRlWFAodGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICBpZih0aGlzLmluZm8uWFBDdXJyZW50ID4gdGhpcy5pbmZvLlhQVGFyZ2V0KVxyXG4gICAgICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHBhcnNlSW50KHRoaXMuaW5mby5sZXZlbEN1cnJlbnQsIDEwKSArIDEpO1xyXG4gICAgICAgIGxldmVsQ3VycmVudCA9IHRoaXMuaW5mby5sZXZlbEN1cnJlbnQ7XHJcbiAgICAgICAgbGV2ZWxUYXJnZXQgPSB0aGlzLmluZm8ubGV2ZWxUYXJnZXQ7XHJcbiAgICAgICAgeHBDdXJyZW50ID0gdGhpcy5pbmZvLlhQQ3VycmVudDtcclxuICAgICAgICB4cFRhcmdldCA9IHRoaXMuaW5mby5YUFRhcmdldDtcclxuICAgICAgICBkaWZmZXJlbmNlID0geHBUYXJnZXQgLSB4cEN1cnJlbnQ7XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgYW1vdW50ID0gTWF0aC5jZWlsKGRpZmZlcmVuY2UgLyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS54cCk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGFtb3VudCA8IDAgPyAwIDogYW1vdW50O1xyXG4gICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKSB0ZDpudGgtY2hpbGQoNCknKS5odG1sKGFtb3VudCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbEN1cnJlbnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbFRhcmdldCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG5cXG5cXG5cXG5cIik7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPD0gbGV2ZWxDdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtc3VjY2VzcycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPiBsZXZlbEN1cnJlbnQgJiYgbGV2ZWxUYXJnZXQgPj0gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC13YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtZGFuZ2VyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciBjaGF0Ym94O1xyXG5jbGFzcyBDaGF0Ym94IHtcclxuXHRjaGFubmVsOiBzdHJpbmcgPSAnI3JhZGlvJztcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bGFzdElkOiBudW1iZXIgPSAwO1xyXG5cdG1lc3NhZ2VzOiBhbnkgPSBbXTtcclxuXHRtb2RlcmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwaW5uZWQ6IGFueSA9IFtdO1xyXG5cdHRpbWVzOiBhbnkgPSB7fTtcclxuXHR0aW1lb3V0UGlubmVkOiBhbnkgPSBudWxsO1xyXG5cdHRpbWVvdXRVcGRhdGU6IGFueSA9IG51bGw7XHJcblx0VVJMOiBhbnkgPSB7fTtcclxuXHJcblx0cGlubmVkRGlzcGxheWVkOiBhbnkgPSBbXTtcclxuXHJcblx0Y29uc3RydWN0b3IocHVibGljIGNoYW5uZWw6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jaGFubmVsID0gY2hhbm5lbDtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGFjdGlvbnM6ICcjY2hhdGJveC1hY3Rpb25zJyxcclxuXHRcdFx0Y2hhbm5lbHM6ICcjY2hhdGJveC1jaGFubmVscycsXHJcblx0XHRcdGNoYXRib3g6ICcjY2hhdGJveCcsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY2hhdGJveC1tZXNzYWdlJyxcclxuXHRcdFx0bWVzc2FnZXM6ICcjY2hhdGJveC1tZXNzYWdlcydcclxuXHRcdH07XHJcblx0XHR0aGlzLlVSTCA9IHtcclxuXHRcdFx0Z2V0U3RhcnQ6ICcvY2hhdC9zdGFydCcsXHJcblx0XHRcdGdldFVwZGF0ZTogJy9jaGF0L3VwZGF0ZScsXHJcblx0XHRcdHBvc3RNZXNzYWdlOiAnL2NoYXQvcG9zdC9tZXNzYWdlJyxcclxuXHRcdFx0cG9zdFN0YXR1c0NoYW5nZTogJy9jaGF0L3Bvc3Qvc3RhdHVzL2NoYW5nZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnRpbWVzID0ge1xyXG5cdFx0XHRsYXN0QWN0aXZpdHk6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsYXN0UmVmcmVzaDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCksXHJcblx0XHRcdGxvYWRlZEF0OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKVxyXG5cdFx0fTtcclxuXHRcdHZhciBtb2RlcmF0b3IgPSB1dGlsaXRpZXMuZ2V0QUpBWCgnL2NoYXQvbW9kZXJhdG9yJyk7XHJcblx0XHRtb2RlcmF0b3IuZG9uZShmdW5jdGlvbihtb2RlcmF0b3I6IHN0cmluZykge1xyXG5cdFx0XHRtb2RlcmF0b3IgPSAkLnBhcnNlSlNPTihtb2RlcmF0b3IpO1xyXG5cdFx0XHRjaGF0Ym94Lm1vZGVyYXRvciA9IG1vZGVyYXRvci5tb2QgPT09IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucGFuZWxDaGF0KCk7XHJcblx0XHR0aGlzLmdldFN0YXJ0KCk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0aWYoZS53aGljaCA9PT0gMTMpXHJcblx0XHRcdFx0Y2hhdGJveC5zdWJtaXRNZXNzYWdlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGFubmVscykuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gucGFuZWxDaGFubmVscygpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdH0sIDUwMDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWRkTWVzc2FnZShtZXNzYWdlOiBhbnkpIHtcclxuXHRcdGlmKHRoaXMubGFzdElkIDwgbWVzc2FnZS5pZCkge1xyXG5cdFx0XHR0aGlzLmxhc3RJZCA9IG1lc3NhZ2UuaWQ7XHJcblx0XHR9XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA8PSAxKSB7XHJcblx0XHRcdHRoaXMubWVzc2FnZXNbdGhpcy5tZXNzYWdlcy5sZW5ndGhdID0gbWVzc2FnZTtcclxuXHRcdFx0dGhpcy50aW1lcy5sYXN0QWN0aXZpdHkgPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKSB7XHJcblx0XHRpZighbWVzc2FnZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRpZiAobWVzc2FnZS5zdGF0dXMgPT09IDEpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1oaWRkZW4nPlwiO1xyXG5cdFx0fSBlbHNlIGlmKG1lc3NhZ2Uuc3RhdHVzID09PSAyKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctcGlubmVkJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMykge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbmhpZCc+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cnPlwiO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjx0aW1lIGNsYXNzPSdwdWxsLXJpZ2h0JyBkYXRhLXRzPSdcIiArIG1lc3NhZ2UuY3JlYXRlZF9hdCArIFwiJz5cIjtcclxuXHRcdGh0bWwgKz0gdXRpbGl0aWVzLnRpbWVBZ28obWVzc2FnZS5jcmVhdGVkX2F0KTtcclxuXHRcdGh0bWwgKz0gXCI8L3RpbWU+XCI7XHJcblx0XHRodG1sICs9IFwiPHA+XCI7XHJcblx0XHRpZihjaGF0Ym94Lm1vZGVyYXRvciA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRodG1sICs9IENoYXRib3gubW9kVG9vbHMobWVzc2FnZSk7XHJcblx0XHR9XHJcblx0XHRodG1sICs9IFwiPGEgY2xhc3M9J21lbWJlcnMtXCIgKyBtZXNzYWdlLmNsYXNzX25hbWUgKyBcIic+XCIgKyBtZXNzYWdlLmF1dGhvcl9uYW1lICsgXCI8L2E+OiBcIiArIG1lc3NhZ2UuY29udGVudHNfcGFyc2VkO1xyXG5cdFx0aHRtbCArPSBcIjwvcD5cIjtcclxuXHRcdGh0bWwgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykucHJlcGVuZChodG1sKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZXMoKSB7XHJcblx0XHR2YXIgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdCQuZWFjaChtZXNzYWdlcywgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdH0pO1xyXG5cdFx0JC5lYWNoKHRoaXMucGlubmVkLCBmdW5jdGlvbihpbmRleCwgbWVzc2FnZSkge1xyXG5cdFx0XHRpZihjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkW21lc3NhZ2UuaWRdID0gdHJ1ZTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkID0gW107XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0U3RhcnQoKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoJycpO1xyXG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdHRpbWU6IHRoaXMudGltZXMubG9hZGVkQXQsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdjaGF0L3N0YXJ0JywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLm1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNoYXRib3gucGlubmVkID0gcmVzdWx0cy5waW5uZWQ7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2VzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtb2QoaWQ6IGFueSwgbmV3U3RhdHVzOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRpZDogaWQsXHJcblx0XHRcdHN0YXR1czogbmV3U3RhdHVzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L3N0YXR1cy1jaGFuZ2UnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmdldFN0YXJ0KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2hhdGJveC5lcnJvcihcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwZXJmb3JtaW5nIHRoYXQgbW9kZXJhdGlvbiBjaGFuZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBtb2RUb29scyhtZXNzYWdlKSB7XHJcblx0XHR2YXIgcmVzID0gXCJcIjtcclxuXHRcdHJlcyArPSBcIjx1bCBjbGFzcz0nbGlzdC1pbmxpbmUgaW5saW5lJz5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzICUgMiA9PT0gMCkge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAxKSArIFwiKTsnIHRpdGxlPSdIaWRlIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1taW51cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMSkgKyBcIik7JyB0aXRsZT0nU2hvdyBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtcGx1cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fVxyXG5cdFx0cmVzICs9IFwiPC9saT5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzID49IDIpIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMikgKyBcIik7JyB0aXRsZT0nVW5waW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS1kb3duIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyArIDIpICsgXCIpOycgdGl0bGU9J1BpbiBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtYXJyb3ctY2lyY2xlLXVwIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8L3VsPlwiO1xyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYW5uZWxzKCkge1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L2NoYW5uZWxzJyk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtcG9wdXAtY2hhbm5lbHMnPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nY2xvc2UnIG9uY2xpY2s9J2NoYXRib3gucGFuZWxjbG9zZSgpOyc+Q2xvc2UgPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9J3NyLW9ubHknPkNsb3NlPC9zcGFuPjwvYnV0dG9uPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxoMz5DaGFubmVsczwvaDM+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPHAgY2xhc3M9J2hvbG8tdGV4dCc+Q3VycmVudGx5IG9uIDxiPiNcIiArIGNoYXRib3guY2hhbm5lbCArIFwiPC9iPjwvcD5cIjtcclxuXHRcdFx0JC5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8YSBvbmNsaWNrPVxcXCJjaGF0Ym94LnN3aXRjaENoYW5uZWwoJ1wiICsgdmFsdWUubmFtZSArIFwiJyk7XFxcIj4jXCIgKyB2YWx1ZS5uYW1lICsgXCI8L2E+PGJyIC8+XCI7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8c3BhbiBjbGFzcz0naG9sby10ZXh0LXNlY29uZGFyeSc+XCIgKyB2YWx1ZS5tZXNzYWdlcyArIFwiIG1lc3NhZ2VzPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPkxhc3QgYWN0aXZlIFwiICsgdXRpbGl0aWVzLnRpbWVBZ28odmFsdWUubGFzdF9tZXNzYWdlKSArIFwiPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2hhdCgpIHtcclxuXHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtbWVzc2FnZXMnPjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LWFjdGlvbnMnPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBocmVmPScvdHJhbnNwYXJlbmN5L21hcmtkb3duJyB0YXJnZXQ9J19ibGFuaycgaWQ9J2NoYXRib3gtbWFya2Rvd24nPk1hcmtkb3duPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBpZD0nY2hhdGJveC1jaGFubmVscyc+Q2hhbm5lbHM8L2E+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J2NoYXRib3gtbWVzc2FnZScgLz5cIjtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGF0Ym94KS5odG1sKGNvbnRlbnRzKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENsb3NlKCkge1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdE1lc3NhZ2UoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0bWVzc2FnZSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHRyZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5wb3N0TWVzc2FnZSwgbWVzc2FnZSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHRpZihyZXNwb25zZS5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnJyk7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLXNlbnQnKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0fSwgMTUwMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzcG9uc2UuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3UgYXJlIG5vdCBsb2dnZWQgaW4gYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuZXJyb3IgPT09IC0yKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3Ugd2VyZSBtdXRlZCBmb3Igb25lIGhvdXIgYnkgYSBzdGFmZiBtZW1iZXIgYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3IuICBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0fSwgMjUwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN3aXRjaENoYW5uZWwoKSB7XHJcblx0XHR2YXIgZGF0YSxcclxuXHRcdFx0cmVzcG9uc2U7XHJcblx0XHRkYXRhID0ge1xyXG5cdFx0XHRjaGFubmVsOiBuYW1lXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L2NoYW5uZWxzL2NoZWNrJywgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRpZihyZXNwb25zZS52YWxpZCkge1xyXG5cdFx0XHRcdGNoYXRib3guY2hhbm5lbCA9IG5hbWU7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IHRoaXMubGFzdElkLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwuZ2V0VXBkYXRlLCBkYXRhKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNoYXRib3gudGltZXMubGFzdFJlZnJlc2ggPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNsZWFyVGltZW91dChjaGF0Ym94LnRpbWVvdXRVcGRhdGUpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVvdXRVcGRhdGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAxMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGVUaW1lQWdvKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5maW5kKCcubXNnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0dmFyIHRpbWVzdGFtcCA9ICQodmFsdWUpLmZpbmQoJ3RpbWUnKS5hdHRyKCdkYXRhLXRzJyk7XHJcblx0XHRcdCQodmFsdWUpLmZpbmQoJ3RpbWUnKS5odG1sKHV0aWxpdGllcy50aW1lQWdvKHRpbWVzdGFtcCkpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGVUaW1lQWdvKCk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcbn0iLCJ2YXIgY29tYmF0Q2FsY3VsYXRvcjtcclxuY2xhc3MgQ29tYmF0Q2FsY3VsYXRvciB7XHJcblx0Y2xpY2tzOiBhbnkgPSB7fTtcclxuXHRnZW5lcmF0ZTogYW55ID0ge307XHJcblx0aW5wdXRzOiBhbnkgPSB7fTtcclxuXHRvdGhlcjogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5jbGlja3MgPSB7XHJcblx0XHRcdHN1Ym1pdDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VibWl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuZ2VuZXJhdGUgPSB7XHJcblx0XHRcdGxldmVsOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpsZXZlbCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmlucHV0cyA9IHtcclxuXHRcdFx0YXR0YWNrOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjphdHRhY2snXVwiLFxyXG5cdFx0XHRkZWZlbmNlOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpkZWZlbmNlJ11cIixcclxuXHRcdFx0c3RyZW5ndGg6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN0cmVuZ3RoJ11cIixcclxuXHRcdFx0Y29uc3RpdHV0aW9uOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpjb25zdGl0dXRpb24nXVwiLFxyXG5cdFx0XHRyYW5nZWQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnJhbmdlZCddXCIsXHJcblx0XHRcdHByYXllcjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6cHJheWVyJ11cIixcclxuXHRcdFx0bWFnaWM6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm1hZ2ljJ11cIixcclxuXHRcdFx0c3VtbW9uaW5nOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdW1tb25pbmcnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5vdGhlciA9IHtcclxuXHRcdFx0bmFtZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bmFtZSddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRsb2FkQ29tYmF0OiAnL2NhbGN1bGF0b3JzL2NvbWJhdC9sb2FkJ1xyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5pbnB1dHMuYXR0YWNrKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5kZWZlbmNlKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdHJlbmd0aCkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuY29uc3RpdHV0aW9uKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5yYW5nZWQpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnByYXllcikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMubWFnaWMpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnN1bW1vbmluZykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5jbGlja3Muc3VibWl0KS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29tYmF0Q2FsY3VsYXRvci5nZXRMZXZlbHMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRnZXRMZXZlbHMoKSB7XHJcblx0XHR2YXIgbmFtZSA9ICQodGhpcy5vdGhlci5uYW1lKS52YWwoKSxcclxuXHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHRyc246IG5hbWVcclxuXHRcdFx0fSxcclxuXHRcdFx0bGV2ZWxzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMubG9hZENvbWJhdCwgZGF0YSk7XHJcblx0XHRsZXZlbHMuZG9uZShmdW5jdGlvbihsZXZlbHMpIHtcclxuXHRcdFx0bGV2ZWxzID0gJC5wYXJzZUpTT04obGV2ZWxzKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5hdHRhY2spLnZhbChsZXZlbHMuYXR0YWNrKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5kZWZlbmNlKS52YWwobGV2ZWxzLmRlZmVuY2UpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN0cmVuZ3RoKS52YWwobGV2ZWxzLnN0cmVuZ3RoKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5jb25zdGl0dXRpb24pLnZhbChsZXZlbHMuY29uc3RpdHV0aW9uKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5yYW5nZWQpLnZhbChsZXZlbHMucmFuZ2VkKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5wcmF5ZXIpLnZhbChsZXZlbHMucHJheWVyKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5tYWdpYykudmFsKGxldmVscy5tYWdpYyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuc3VtbW9uaW5nKS52YWwobGV2ZWxzLnN1bW1vbmluZyk7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHR1cGRhdGVMZXZlbCgpIHtcclxuXHRcdHZhciBtZWxlZSA9IHRoaXMudmFsKCdhdHRhY2snKSArIHRoaXMudmFsKCdzdHJlbmd0aCcpO1xyXG5cdFx0dmFyIG1hZ2ljID0gMiAqIHRoaXMudmFsKCdtYWdpYycpO1xyXG5cdFx0dmFyIHJhbmdlZCA9IDIgKiB0aGlzLnZhbCgncmFuZ2VkJyk7XHJcblx0XHR2YXIgZGVmID0gdGhpcy52YWwoJ2RlZmVuY2UnKSArIHRoaXMudmFsKCdjb25zdGl0dXRpb24nKTtcclxuXHRcdHZhciBvdGhlciA9ICguNSAqIHRoaXMudmFsKCdwcmF5ZXInKSkgKyAoLjUgKiB0aGlzLnZhbCgnc3VtbW9uaW5nJykpO1xyXG5cdFx0dmFyIGxldmVsID0gKDEzLzEwKSAqIE1hdGgubWF4KG1lbGVlLCBtYWdpYywgcmFuZ2VkKSArIGRlZiArIG90aGVyO1xyXG5cdFx0bGV2ZWwgKj0gLjI1O1xyXG5cdFx0bGV2ZWwgPSBNYXRoLmZsb29yKGxldmVsKTtcclxuXHRcdCQodGhpcy5nZW5lcmF0ZS5sZXZlbCkuaHRtbChsZXZlbCk7XHJcblx0fVxyXG5cdHZhbChuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHJldHVybiBwYXJzZUludCgkKFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOlwiICsgbmFtZSArIFwiJ11cIikudmFsKCkpO1xyXG5cdH1cclxufSIsInZhciBmb3J1bXM7XHJcbmNsYXNzIEZvcnVtcyB7XHJcblx0cHVibGljIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwb3N0OiBQb3N0ID0gbnVsbDtcclxuXHRwdWJsaWMgdGhyZWFkQ3JlYXRlOiBGb3J1bXNUaHJlYWRDcmVhdGUgPSBudWxsO1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdCdwb3N0RWRpdG9yJzogXCJbcnQtZGF0YT0ncG9zdC5lZGl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdCd2b3RlJzogZnVuY3Rpb24oaWQ6IG51bWJlcikgeyByZXR1cm4gJy9mb3J1bXMvcG9zdC8nICsgaWQgKyAnL3ZvdGUnOyB9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wb3N0ID0gbmV3IFBvc3QoKTtcclxuXHRcdCQoJy51cHZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLnVwdm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcuZG93bnZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLmRvd252b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5wb3N0OnF1b3RlJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGlkID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRmb3J1bXMucG9zdC5xdW90ZShpZCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb3dudm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAnZG93bidcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cHZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzRG93bnZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQndm90ZSc6ICd1cCdcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuY2xhc3MgUG9zdCB7XHJcblx0cHVibGljIHF1b3RlKGlkOiBhbnkpIHtcclxuXHRcdHZhciBzb3VyY2UgPSAkKFwiW3J0LWRhdGE9J3Bvc3QjXCIgKyBpZCArXCI6c291cmNlJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRwb3N0Q29udGVudHMgPSAkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwoKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC9cXG4vZywgJ1xcbj4nKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mbHQ7L2csICc8Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xyXG5cdFx0c291cmNlID0gXCI+XCIgKyBzb3VyY2U7XHJcblx0XHRpZihwb3N0Q29udGVudHMubGVuZ3RoID4gMClcclxuXHRcdFx0cG9zdENvbnRlbnRzICs9IFwiXFxuXCI7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwocG9zdENvbnRlbnRzICsgc291cmNlICsgXCJcXG5cIik7XHJcblx0XHR1dGlsaXRpZXMuc2Nyb2xsVG8oJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvciksIDEwMDApO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikuZm9jdXMoKTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEZvcnVtc1RocmVhZENyZWF0ZSB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcXVlc3Rpb25zOiBBcnJheSA9IFtdO1xyXG5cdHB1YmxpYyB2YWx1ZXM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyB2aWV3czogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25BZGQ6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24uYWRkJ11cIixcclxuXHRcdFx0cXVlc3Rpb25zOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9ucyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnF1ZXN0aW9ucyA9IEFycmF5KDUwMCk7XHJcblx0XHR0aGlzLnZhbHVlcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25zOiAwXHJcblx0XHR9O1xyXG5cdFx0dGhpcy52aWV3cyA9IHtcclxuXHRcdFx0YW5zd2VyOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwuYW5zd2VyJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRxdWVzdGlvbjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uJ11cIikuaHRtbCgpXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9uQWRkKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLmFkZFF1ZXN0aW9uKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHVibGljIGFkZFF1ZXN0aW9uKCkge1xyXG5cdFx0dmFyIGh0bWwgPSB0aGlzLnZpZXdzLnF1ZXN0aW9uO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9ucykuYXBwZW5kKGh0bWwpO1xyXG5cdFx0dGhpcy52YWx1ZXMucXVlc3Rpb25zICs9IDE7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVtb3ZlUXVlc3Rpb24obnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdHRoaXMucXVlc3Rpb25zLnNwbGljZShudW1iZXIsIDEpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldExpc3RlbmVyKGVsZW1lbnQsIHR5cGUpIHtcclxuXHRcdGlmKHR5cGUgPT09IFwicmVtb3ZlIHF1ZXN0aW9uXCIpIHtcclxuXHRcdFx0dGhpcy5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQ6IGFueSkge1xyXG5cdFx0JChlbGVtZW50KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLnJlbW92ZVF1ZXN0aW9uKCQoZWxlbWVudCkucGFyZW50KCkucGFyZW50KCkuYXR0cigncnQtZGF0YScpKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHRmb3J1bXMgPSBuZXcgRm9ydW1zKCk7XHJcbn0pOyIsImNsYXNzIExpdmVzdHJlYW1SZXNldCB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgbGFuZzogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRub3RlOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0Om5vdGUnXVwiLFxyXG5cdFx0XHRzcGlubmVyOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnNwaW5uZXInXVwiLFxyXG5cdFx0XHRzdGF0dXM6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3RhdHVzJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMubGFuZyA9IHtcclxuXHRcdFx0Y2hlY2tpbmc6ICdjaGVja2luZycsXHJcblx0XHRcdG9mZmxpbmU6ICdvZmZsaW5lJyxcclxuXHRcdFx0b25saW5lOiAnb25saW5lJyxcclxuXHRcdFx0dW5rbm93bjogJ3Vua25vd24nXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0cmVzZXQ6ICcvbGl2ZXN0cmVhbS9yZXNldCdcclxuXHRcdH07XHJcblx0XHR0aGlzLnJlc2V0KCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlc2V0KCkge1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAxfSk7XHJcblx0XHR2YXIgc3RhdHVzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucmVzZXQsIHt9KTtcclxuXHRcdHN0YXR1cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gdXRpbGl0aWVzLkpTT05EZWNvZGUocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMub25saW5lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09ubGluZSgpO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVzdWx0cy5vbmxpbmUgPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93bigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNwaW5uZXJSZW1vdmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3Bpbm5lcikuY3NzKHtcclxuXHRcdFx0b3BhY2l0eTogMFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzZXMoY2hlY2tpbmc6IHN0cmluZywgb25saW5lOiBzdHJpbmcsIG9mZmxpbmU6IHN0cmluZywgdW5rbm93bjogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmxhbmcuY2hlY2tpbmcgPSBjaGVja2luZztcclxuXHRcdHRoaXMubGFuZy5vZmZsaW5lID0gb2ZmbGluZTtcclxuXHRcdHRoaXMubGFuZy5vbmxpbmUgPSBvbmxpbmU7XHJcblx0XHR0aGlzLmxhbmcudW5rbm93biA9IHVua25vd247XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT2ZmbGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvZmZsaW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1kYW5nZXInKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPbmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib25saW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzVW5rbm93bigpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJ1bmtub3duXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC13YXJuaW5nJyk7XHJcblx0fVxyXG59IiwidmFyIHJ1bmV0aW1lO1xyXG5jbGFzcyBSdW5lVGltZSB7XHJcblx0bG9hZGluZzpzdHJpbmcgPSAnI2xvYWRpbmcnO1xyXG59XHJcbnJ1bmV0aW1lID0gbmV3IFJ1bmVUaW1lKCk7XHJcbiQoZnVuY3Rpb24gKCkge1xyXG5cdFwidXNlIHN0cmljdFwiO1xyXG5cdCQoJ1tkYXRhLXRvZ2dsZV0nKS50b29sdGlwKCk7XHJcblx0JCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCk7XHJcblx0JCgndGJvZHkucm93bGluaycpLnJvd2xpbmsoKTtcclxuXHQkKCcjdG9wJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0JCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG5cdFx0XHRzY3JvbGxUb3A6IDBcclxuXHRcdH0sIDEwMDApO1xyXG5cdH0pO1xyXG5cdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGhlaWdodCA9ICQoJ2JvZHknKS5oZWlnaHQoKSxcclxuXHRcdFx0c2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxyXG5cdFx0XHR0b3AgPSAkKCcjdG9wJyk7XHJcblx0XHRpZihzY3JvbGwgPiBoZWlnaHQvMTApIHtcclxuXHRcdFx0aWYoISQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVJbigyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYoJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZU91dCgyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdCQoJy5uYXZiYXIgLmRyb3Bkb3duJykuaG92ZXIoZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDI1MCkuc2xpZGVEb3duKCk7XHJcblx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDEwMCkuc2xpZGVVcCgpXHJcblx0fSk7XHJcbn0pOyIsInZhciBuYW1lQ2hlY2tlcjtcclxuY2xhc3MgTmFtZUNoZWNrZXIge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRub3RBbGxvd2VkOiBhbnkgPSBbXTtcclxuXHRwYXRoczogYW55ID0ge307XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhdmFpbGFiaWxpdHk6ICcjcnNuLWF2YWlsYWJpbGl0eScsXHJcblx0XHRcdGNoZWNrOiAnI3Jzbi1jaGVjay1maWVsZCdcclxuXHRcdH07XHJcblx0XHR0aGlzLm5vdEFsbG93ZWQgPSBbJ1puVmphdz09JywgJ2MyaHBkQT09J107XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjaGVjazogJy9uYW1lL2NoZWNrJ1xyXG5cdFx0fTtcclxuXHRcdCQoXCJbcnQtaG9vaz0nbmFtZS5jaGVja2VyOnN1Ym1pdCddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24odmFsdWU6IGFueSkge1xyXG5cdFx0XHRuYW1lQ2hlY2tlci5jaGVjaygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGNoZWNrKCkge1xyXG5cdFx0dmFyIG5hbWUgPSAkKCcjcnNuLWNoZWNrLWZpZWxkJykudmFsKCk7XHJcblx0XHR2YXIgY2hlY2tOYW1lID0gdGhpcy5jaGVja05hbWUobmFtZSk7XHJcblx0XHRpZihjaGVja05hbWUgPT09IDApIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIllvdSBkaWQgbm90IGVudGVyIGFueXRoaW5nLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDEpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBpcyBvdmVyIDEyIGNoYXJhY3RlcnMuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gMikge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IGlzIHVuZGVyIDMgY2hhcmFjdGVycy5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSAzKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gc3RhcnRzIHdpdGggdGhlIHdvcmQgTW9kLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDQpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBjb250YWlucyBhIHN3ZWFyIHdvcmQuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gNSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0XHRyc246IG5hbWVcclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIGRldGFpbHMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5jaGVjaywgZGF0YSk7XHJcblx0XHRcdCQodGhpcy5lbGVtZW50cy5hdmFpbGFiaWxpdHkpLmh0bWwoJ0xvYWRpbmcuLi4nKTtcclxuXHRcdFx0ZGV0YWlscy5kb25lKGZ1bmN0aW9uKGRldGFpbHM6IHN0cmluZykge1xyXG5cdFx0XHRcdHZhciBhdmFpbGFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRpZihkZXRhaWxzLnN1YnN0cmluZygwLCA2KSA9PT0gXCI8aHRtbD5cIikge1xyXG5cdFx0XHRcdFx0YXZhaWxhYmxlID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoYXZhaWxhYmxlID09PSB0cnVlKSB7XHJcblx0XHRcdFx0XHRuYW1lQ2hlY2tlci5hdmFpbGFibGUobmFtZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG5hbWVDaGVja2VyLnVuYXZhaWxhYmxlKCdUaGUgUnVuZXNjYXBlIG5hbWUgPGI+JyArIG5hbWUgKyAnPC9iPiBpcyBub3QgYXZhaWxhYmxlLicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdGF2YWlsYWJsZShuYW1lOiBzdHJpbmcpIHtcclxuXHRcdCQobmFtZUNoZWNrZXIuZWxlbWVudHMuYXZhaWxhYmlsaXR5KS5odG1sKCdUaGUgUnVuZVNjYXBlIG5hbWUgPGI+JyArIG5hbWUgKyAnPC9iPiBpcyBhdmFpbGFibGUuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0Y29sb3I6ICdncmVlbidcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja05hbWUobmFtZTogc3RyaW5nKSB7XHJcblx0XHRpZih0eXBlb2YobmFtZSkgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAobmFtZS5sZW5ndGggPiAxMikge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9IGVsc2UgaWYgKG5hbWUubGVuZ3RoIDwgMykge1xyXG5cdFx0XHRcdHJldHVybiAyO1xyXG5cdFx0XHR9IGVsc2UgaWYgKG5hbWUuc3Vic3RyaW5nKDAsIDMpID09PSAnTW9kJykge1xyXG5cdFx0XHRcdHJldHVybiAzO1xyXG5cdFx0XHR9XHJcblx0XHRcdCQuZWFjaCh0aGlzLm5vdEFsbG93ZWQsIGZ1bmN0aW9uIChrZXk6bnVtYmVyLCB2YWx1ZTphbnkpIHtcclxuXHRcdFx0XHR2YXIgZGVjb2RlID0gYXRvYih2YWx1ZSk7XHJcblx0XHRcdFx0aWYgKG5hbWUuaW5kZXhPZihkZWNvZGUpID4gLTEpXHJcblx0XHRcdFx0XHRyZXR1cm4gNDtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gNTtcclxuXHR9XHJcblx0dW5hdmFpbGFibGUobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuYXZhaWxhYmlsaXR5KS5odG1sKG1lc3NhZ2UpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdGNvbG9yOiAncmVkJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn0iLCJjbGFzcyBOb3RpZmljYXRpb25zIHtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIHBhdGhzOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucGF0aHMgPSB7XHJcbiAgICAgICAgICAgIG1hcmtSZWFkOiAnL25vdGlmaWNhdGlvbnMvbWFyay1yZWFkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJChcIltydC1ob29rPSdob29rIW5vdGlmaWNhdGlvbnM6bWFyay5yZWFkJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmF0dHIoJ3J0LWRhdGEnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgcmFkaW87XHJcbnZhciBjaGF0Ym94O1xyXG5jbGFzcyBSYWRpbyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHBvcHVwOiBhbnkgPSBudWxsO1xyXG5cdHN0YXR1czogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdHN0YXR1c0Nsb3NlZDogc3RyaW5nID0gJyc7XHJcblx0c3RhdHVzT3Blbjogc3RyaW5nID0gJyc7XHJcblx0VVJMOiBzdHJpbmcgPSAnJztcclxuXHR2YXJNZXNzYWdlOiBzdHJpbmcgPSAnJztcclxuXHR2YXJTdGF0dXM6IHN0cmluZyA9ICcnO1xyXG5cclxuXHRvbmxpbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5VUkwgPSAnaHR0cDovL2FwcHMuc3RyZWFtbGljZW5zaW5nLmNvbS9wbGF5ZXItcG9wdXAucGhwP3NpZD0yNTc5JnN0cmVhbV9pZD00Mzg2JztcclxuXHRcdHRoaXMuc3RhdHVzQ2xvc2VkID0gJ3RvIGxpc3RlbiB0byBSdW5lVGltZSBSYWRpbyEnO1xyXG5cdFx0dGhpcy5zdGF0dXNPcGVuID0gJ3RvIGNsb3NlIFJ1bmVUaW1lIFJhZGlvJztcclxuXHRcdHRoaXMudmFyTWVzc2FnZSA9ICcjcmFkaW8tbWVzc2FnZSc7XHJcblx0XHR0aGlzLnZhclN0YXR1cyA9ICcjcmFkaW8tc3RhdHVzJztcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRzdGF0dXNNZXNzYWdlOiAnI3JhZGlvLXN0YXR1cy1tZXNzYWdlJ1xyXG5cdFx0fTtcclxuXHRcdCQoJyNyYWRpby1saW5rJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFyYWRpby5zdGF0dXMpIHtcclxuXHRcdFx0XHRyYWRpby5vcGVuUmFkaW8oKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyYWRpby5jbG9zZVJhZGlvKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLWhpc3RvcnknKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3Blbkhpc3RvcnkoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblJlcXVlc3QoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLXRpbWV0YWJsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuVGltZXRhYmxlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNyZXF1ZXN0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5oaWRlUHVsbCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGNsb3NlUmFkaW8oKSB7XHJcblx0XHRpZih0aGlzLnBvcHVwKSB7XHJcblx0XHRcdHRoaXMucG9wdXAuY2xvc2UoKTtcclxuXHRcdH1cclxuXHRcdCQodGhpcy52YXJNZXNzYWdlKS5odG1sKHRoaXMuc3RhdHVzQ2xvc2VkKTtcclxuXHRcdHRoaXMuc3RhdHVzID0gZmFsc2U7XHJcblx0XHQkKHRoaXMudmFyU3RhdHVzKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ3RleHQtc3VjY2VzcycpXHJcblx0XHRcdC5hZGRDbGFzcygndGV4dC1kYW5nZXInKVxyXG5cdFx0XHQuaHRtbChcIjxpIGlkPSdwb3dlci1idXR0b24nIGNsYXNzPSdmYSBmYS1wb3dlci1vZmYnPjwvaT5PZmZcIik7XHJcblx0fVxyXG5cclxuXHRvcGVuUmFkaW8oKSB7XHJcblx0XHRpZih0aGlzLm9ubGluZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdHRoaXMub25saW5lU2V0dGluZ3MoKTtcclxuXHRcdH1cclxuXHRcdHRoaXMucG9wdXAgPSB3aW5kb3cub3Blbih0aGlzLlVSTCwgJ1J1bmVUaW1lIFJhZGlvJywgJ3dpZHRoPTM4OSxoZWlnaHQ9MzU5Jyk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IHRydWU7XHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c09wZW4pO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cykuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCd0ZXh0LWRhbmdlcicpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJykuXHJcblx0XHRcdGh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T25cIik7XHJcblx0XHR2YXIgcG9sbFRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYocmFkaW8ucG9wdXAuY2xvc2VkICE9PSBmYWxzZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHBvbGxUaW1lcik7XHJcblx0XHRcdFx0cmFkaW8uY2xvc2VSYWRpbygpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcblxyXG5cdG9wZW5IaXN0b3J5KCkge1xyXG5cdFx0dmFyIGhpc3RvcnkgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vaGlzdG9yeScpO1xyXG5cdFx0aGlzdG9yeS5kb25lKGZ1bmN0aW9uKGhpc3RvcnkpIHtcclxuXHRcdFx0aGlzdG9yeSA9ICQucGFyc2VKU09OKGhpc3RvcnkpO1xyXG5cdFx0XHR2YXIgbXVzaWMgPSBudWxsLFxyXG5cdFx0XHRcdGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0ndGFibGUnPjx0aGVhZD48dHI+PHRkPlRpbWU8L3RkPjx0ZD5BcnRpc3Q8L3RkPjx0ZD5OYW1lPC90ZD48L3RyPjwvdGhlYWQ+PHRib2R5PlwiO1xyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gaGlzdG9yeS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuXHRcdFx0XHRtdXNpYyA9IGhpc3RvcnlbeF07XHJcblx0XHRcdFx0aHRtbCArPSBcIjx0cj48dGQ+XCIgKyB1dGlsaXRpZXMudGltZUFnbyhtdXNpYy5jcmVhdGVkX2F0KSArIFwiPC90ZD48dGQ+IFwiICsgbXVzaWMuYXJ0aXN0ICsgXCI8L3RkPjx0ZD5cIiArIG11c2ljLnNvbmcgKyBcIjwvdGQ+PC90cj5cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRodG1sICs9IFwiPC90Ym9keT48L3RhYmxlPlwiO1xyXG5cdFx0XHRyYWRpby5vcGVuUHVsbChodG1sKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0b3BlblRpbWV0YWJsZSgpIHtcclxuXHRcdHZhciB0aW1ldGFibGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdGltZXRhYmxlJyk7XHJcblx0XHR0aW1ldGFibGUuZG9uZShmdW5jdGlvbih0aW1ldGFibGUpIHtcclxuXHRcdFx0dGltZXRhYmxlID0gJC5wYXJzZUpTT04odGltZXRhYmxlKTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIjx0YWJsZSBjbGFzcz0ndGFibGUgdGV4dC1jZW50ZXInPjx0aGVhZD48dHI+PHRkPiZuYnNwOzwvdGQ+PHRkPk1vbmRheTwvdGQ+PHRkPlR1ZXNkYXk8L3RkPjx0ZD5XZWRuZXNkYXk8L3RkPjx0ZD5UaHVyc2RheTwvdGQ+PHRkPkZyaWRheTwvdGQ+PHRkPlNhdHVyZGF5PC90ZD48dGQ+U3VuZGF5PC90ZD48L3RyPjwvdGhlYWQ+PHRib2R5PlwiO1xyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gMjM7IHggPD0geTsgeCsrKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjx0cj48dGQ+XCIgKyB4ICsgXCI6MDA8L3RkPlwiO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDAsIGogPSA2OyBpIDw9IGo7IGkrKykge1xyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjx0ZD5cIjtcclxuXHRcdFx0XHRcdGlmKHRpbWV0YWJsZVtpXSAhPT0gdW5kZWZpbmVkICYmIHRpbWV0YWJsZVtpXVt4XSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdGh0bWwgKz0gdGltZXRhYmxlW2ldW3hdO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSBcIiZuYnNwO1wiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjwvdGQ+XCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGh0bWwgKz0gXCI8L3RyPlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLm9wZW5QdWxsKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvcGVuUmVxdWVzdCgpIHtcclxuXHRcdHZhciByZXF1ZXN0ID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3JlcXVlc3Qvc29uZycpO1xyXG5cdFx0cmVxdWVzdC5kb25lKGZ1bmN0aW9uKHJlcXVlc3QpIHtcclxuXHRcdFx0cmVxdWVzdCA9ICQucGFyc2VKU09OKHJlcXVlc3QpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKHJlcXVlc3QucmVzcG9uc2UgPT09IDIpIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPGZvcm0gcm9sZT0nZm9ybSc+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1hcnRpc3QnPkFydGlzdCBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtYXJ0aXN0JyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LWFydGlzdCcgcGxhY2Vob2xkZXI9J0FydGlzdCBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtbmFtZSc+U29uZyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtbmFtZScgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1uYW1lJyBwbGFjZWhvbGRlcj0nU29uZyBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxwIGlkPSdyZXF1ZXN0LWJ1dHRvbicgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+UmVxdWVzdDwvcD48L2Rpdj48L2Zvcm0+XCI7XHJcblx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAxKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LXdhcm5pbmcnPkF1dG8gREogY3VycmVudGx5IGRvZXMgbm90IGFjY2VwdCBzb25nIHJlcXVlc3RzLCBzb3JyeSFcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5Zb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gcmVxdWVzdCBhIHNvbmcgZnJvbSB0aGUgREouPC9wPlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJhZGlvLm9wZW5QdWxsKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJhZGlvLnNlbmRSZXF1ZXN0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMzAwMCk7XHJcblx0fVxyXG5cclxuXHRzZW5kUmVxdWVzdCgpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdCdhcnRpc3QnOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVxdWVzdC1hcnRpc3QnKS52YWx1ZSxcclxuXHRcdFx0XHQnbmFtZSc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXF1ZXN0LW5hbWUnKS52YWx1ZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250ZW50cztcclxuXHRcdGNvbnRlbnRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnLCBkYXRhKTtcclxuXHRcdGNvbnRlbnRzLmRvbmUoZnVuY3Rpb24oY29udGVudHMpIHtcclxuXHRcdFx0Y29udGVudHMgPSAkLnBhcnNlSlNPTihjb250ZW50cyk7XHJcblx0XHRcdHZhciBodG1sID0gXCJcIjtcclxuXHRcdFx0aWYoY29udGVudHMuc2VudCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LXN1Y2Nlc3MnPllvdXIgcmVxdWVzdCBoYXMgYmVlbiBzZW50IHRvIHRoZSBESjwvcD5cIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1kYW5nZXInPlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC4gIFRyeSBhZ2Fpbj9cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoaHRtbCk7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuaGlkZVB1bGwoKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRvcGVuUHVsbChjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0aGlkZVB1bGwoKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoJyZuYnNwOycpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS53aWR0aCgnJykuXHJcblx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHR3aWR0aDogJzAlJ1xyXG5cdFx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1vcHRpb25zJykud2lkdGgoJycpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMTAwJSdcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb25saW5lU2V0dGluZ3MoKSB7XHJcblx0XHRpZih0aGlzLm9ubGluZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHR0aGlzLmNsb3NlUmFkaW8oKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLnN0YXR1c01lc3NhZ2UpLmh0bWwoXCJUaGUgcmFkaW8gaGFzIGJlZW4gc2V0IG9mZmxpbmUuXCIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLnN0YXR1c01lc3NhZ2UpLmh0bWwoXCJcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSB7XHJcblx0XHQkKCcjcmVxdWVzdHMtdXNlci1jdXJyZW50JykuaHRtbCgnJyk7XHJcblx0XHR2YXIgdXBkYXRlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3VwZGF0ZScpO1xyXG5cdFx0dXBkYXRlLmRvbmUoZnVuY3Rpb24odXBkYXRlKSB7XHJcblx0XHRcdHVwZGF0ZSA9ICQucGFyc2VKU09OKHVwZGF0ZSk7XHJcblx0XHRcdHZhciByZXF1ZXN0c0hUTUwgPSBcIlwiO1xyXG5cdFx0XHQkKCcjcmFkaW8tc29uZy1uYW1lJykuaHRtbCh1cGRhdGVbJ3NvbmcnXVsnbmFtZSddKTtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctYXJ0aXN0JykuaHRtbCh1cGRhdGVbJ3NvbmcnXVsnYXJ0aXN0J10pO1xyXG5cdFx0XHRpZih1cGRhdGVbJ2RqJ10gIT09IG51bGwgJiYgdXBkYXRlWydkaiddICE9PSAnJykge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnI3JhZGlvLWRqJykuaHRtbChcIkF1dG8gREpcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYodXBkYXRlWydtZXNzYWdlJ10gIT09ICcnICYmIHVwZGF0ZVsnbWVzc2FnZSddICE9PSAtMSkge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwodXBkYXRlWydtZXNzYWdlJ10pO1xyXG5cdFx0XHR9IGVsc2UgaWYodXBkYXRlWydtZXNzYWdlJ10gPT09IC0xKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkRKIFwiICsgdXBkYXRlWydkaiddICsgXCIgaXMgY3VycmVudGx5IG9uIGFpciFcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbChcIkF1dG8gREogaXMgY3VycmVudGx5IG9uIGFpclwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gdXBkYXRlWydyZXF1ZXN0cyddLmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gdXBkYXRlWydyZXF1ZXN0cyddW3hdO1xyXG5cdFx0XHRcdGlmKHJlcXVlc3Quc3RhdHVzID09IDApIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwPlwiO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PSAxKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMikge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtd2FybmluZyc+XCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJlcXVlc3RzSFRNTCArPSByZXF1ZXN0LnNvbmdfbmFtZSArIFwiIGJ5IFwiICsgcmVxdWVzdC5zb25nX2FydGlzdDtcclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8L3A+XCI7XHJcblx0XHRcdH1cclxuXHRcdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwocmVxdWVzdHNIVE1MKTtcclxuXHJcblx0XHRcdHJhZGlvLm9ubGluZSA9IHVwZGF0ZS5vbmxpbmU7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmFkaW8udXBkYXRlKCk7XHJcblx0XHRcdH0sIDMwMDAwKTtcclxuXHRcdFx0cmFkaW8ub25saW5lU2V0dGluZ3MoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufSIsInZhciBzaWdudXBGb3JtO1xyXG5jbGFzcyBTaWdudXBGb3JtIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0ZGlzcGxheU5hbWU6ICcjZGlzcGxheV9uYW1lJyxcclxuXHRcdFx0ZW1haWw6ICcjZW1haWwnLFxyXG5cdFx0XHRwYXNzd29yZDogJyNwYXNzd29yZCcsXHJcblx0XHRcdHBhc3N3b3JkMjogJyNwYXNzd29yZDInLFxyXG5cdFx0XHRzZWN1cml0eUNoZWNrOiAnI3NlY3VyaXR5J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrQXZhaWxhYmlsaXR5OiAnL2dldC9zaWdudXAvJ1xyXG5cdFx0fTtcclxuXHRcdHZhciBzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdFbWFpbCxcclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkLFxyXG5cdFx0XHR0aW1lb3V0ID0gNTAwO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmRpc3BsYXlOYW1lKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZGlzcGxheV9uYW1lJyk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZW1haWwpLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZihzdG9wcGVkVHlwaW5nRW1haWwpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc3RvcHBlZFR5cGluZ0VtYWlsKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5KCdlbWFpbCcpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ1Bhc3N3b3JkKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdQYXNzd29yZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ1Bhc3N3b3JkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkKCk7XHJcblx0XHRcdH0sIHRpbWVvdXQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzaWdudXBGb3JtLmNoZWNrU2VjdXJpdHkoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRzaWdudXBGb3JtLnN1Ym1pdChlKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tBdmFpbGFiaWxpdHkoZmllbGQ6IHN0cmluZykge1xyXG5cdFx0dmFyIHZhbCA9ICQoJyMnICsgZmllbGQpLnZhbCgpO1xyXG5cdFx0aWYodmFsLmxlbmd0aCA9PT0gMClcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0dmFyIHVybCA9IHRoaXMucGF0aHMuY2hlY2tBdmFpbGFiaWxpdHkgKyBmaWVsZDtcclxuXHRcdHZhciBhdmFpbGFibGU7XHJcblx0XHRpZihmaWVsZCA9PT0gXCJkaXNwbGF5X25hbWVcIikge1xyXG5cdFx0XHRhdmFpbGFibGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodXJsLCB7IGRpc3BsYXlfbmFtZTogdmFsIH0pO1xyXG5cdFx0fSBlbHNlIGlmKGZpZWxkID09PSBcImVtYWlsXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBlbWFpbDogdmFsIH0pO1xyXG5cdFx0fVxyXG5cdFx0YXZhaWxhYmxlLmRvbmUoZnVuY3Rpb24oYXZhaWxhYmxlOiBzdHJpbmcpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoYXZhaWxhYmxlKTtcclxuXHRcdFx0aWYoYXZhaWxhYmxlLmF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtc3VjY2VzcycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjaGVja1Bhc3N3b3JkKCkge1xyXG5cdFx0dmFyIHYxID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkKS52YWwoKSxcclxuXHRcdFx0djIgPSAkKHRoaXMuZWxlbWVudHMucGFzc3dvcmQyKS52YWwoKTtcclxuXHRcdGlmKHYyLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0aWYodjEgPT09IHYyKSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCB0cnVlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCB0cnVlKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZCcsIGZhbHNlKTtcclxuXHRcdFx0XHR0aGlzLnRvZ2dsZUZlZWRiYWNrKCdwYXNzd29yZDInLCBmYWxzZSk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjaGVja1NlY3VyaXR5KCkge1xyXG5cdFx0dmFyIHNsaWRlclZhbCA9ICQodGhpcy5lbGVtZW50cy5zZWN1cml0eUNoZWNrKS52YWwoKTtcclxuXHRcdGlmKHNsaWRlclZhbCA8PSAxMCkge1xyXG5cdFx0XHQkKCdmb3JtIGJ1dHRvbicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcblx0XHRcdCQoJ2Zvcm0gLnRleHQtZGFuZ2VyJykuY3NzKHtcclxuXHRcdFx0XHRkaXNwbGF5OiAnbm9uZSdcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2UgaWYoc2xpZGVyVmFsID4gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ2Jsb2NrJ1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN1Ym1pdChlOiBhbnkpIHtcclxuXHRcdHZhciB1c2VybmFtZSA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ3VzZXJuYW1lJyksXHJcblx0XHRcdGVtYWlsID0gdGhpcy5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKSxcclxuXHRcdFx0cGFzcyA9IHRoaXMuY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0aWYodXNlcm5hbWUgPT09IHRydWUgJiYgZW1haWwgPT09IHRydWUgJiYgcGFzcyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dG9nZ2xlRmVlZGJhY2soZmllbGQ6IHN0cmluZywgc3RhdHVzOiBib29sZWFuKSB7XHJcblx0XHRpZihzdGF0dXMgPT09IHRydWUpIHtcclxuXHRcdFx0JCgnI3NpZ251cC0nICsgZmllbGQpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRmaW5kKCcuY29sLWxnLTEwJykuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmhlbHAtYmxvY2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tcmVtb3ZlJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdzaG93Jyk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiY2xhc3MgU3RhZmZMaXN0IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHZhciBtZW1iZXJzID0gJChcIltydC1ob29rPSdob29rIXN0YWZmLmxpc3Q6Y2FyZCddXCIpO1xyXG4gICAgICAgICQuZWFjaChtZW1iZXJzLCBmdW5jdGlvbihpbmRleDogbnVtYmVyLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkKHZhbHVlKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh2YWwpLmF0dHIoJ3J0LWRhdGEnKTtcclxuICAgICAgICAgICAgJCh2YWwpLmZpbmQoJy5mcm9udCcpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCcvaW1nL2ZvcnVtcy9waG90b3MvXCIgKyBpZCArIFwiLnBuZycpXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmFsKS5iaW5kKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciB1dGlsaXRpZXM7XHJcbmNsYXNzIFV0aWxpdGllcyB7XHJcbiAgICBnZXRBSkFYKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHBhdGgsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcG9zdEFKQVgocGF0aDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBkYXRhLl90b2tlbiA9ICQoJ21ldGFbbmFtZT1cIl90b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBwYXRoLFxyXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc3RhdGljIHRpbWVBZ28odHM6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBub3dUcyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxyXG4gICAgICAgICAgICBzZWNvbmRzID0gbm93VHMgLSB0cztcclxuICAgICAgICBpZihzZWNvbmRzID4gMiAqIDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhIGZldyBkYXlzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMjQgKiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInllc3RlcmRheVwiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gNzIwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzZWNvbmRzIC8gMzYwMCkgKyBcIiBob3VycyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW4gaG91ciBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+PSAxMjApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKSArIFwiIG1pbnV0ZXMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gNjApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBtaW51dGUgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWNvbmRzICsgXCIgc2Vjb25kcyBhZ29cIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIxIHNlY29uZCBhZ29cIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc3RhdGljIGN1cnJlbnRUaW1lKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBKU09ORGVjb2RlKGpzb246IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAkLnBhcnNlSlNPTihqc29uKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzY3JvbGxUbyhlbGVtZW50OiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcFxyXG4gICAgICAgIH0sIHRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmb3JtVG9rZW4odG9rZW46IHN0cmluZykge1xyXG4gICAgICAgIHRva2VuID0gYXRvYih0b2tlbik7XHJcbiAgICAgICAgJCgnZm9ybScpLmFwcGVuZChcIjxpbnB1dCB0eXBlPSdoaWRkZW4nIG5hbWU9J190b2tlbicgdmFsdWU9J1wiICsgdG9rZW4gKyBcIicgLz5cIik7XHJcbiAgICB9XHJcbn1cclxudXRpbGl0aWVzID0gbmV3IFV0aWxpdGllcygpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==