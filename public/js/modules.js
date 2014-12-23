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
    Utilities.prototype.formToken = function (token) {
        token = atob(token);
        $('form').append("<input type='hidden' name='_token' value='" + token + "' />");
    };
    return Utilities;
})();
utilities = new Utilities();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2FsY3VsYXRvci50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2hhdGJveC50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29tYmF0Y2FsY3VsYXRvci50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvZm9ydW1zLnRzIiwiQzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9saXZlc3RyZWFtLnRzIiwiQzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9tYWluLnRzIiwiQzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9uYW1lY2hlY2tlci50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbm90aWZpY2F0aW9ucy50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvcmFkaW8udHMiLCJDOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsIkM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkNhbGN1bGF0b3IiLCJDYWxjdWxhdG9yLmNvbnN0cnVjdG9yIiwiQ2FsY3VsYXRvci5jYWxjdWxhdGVYUCIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlTGV2ZWwiLCJDYWxjdWxhdG9yLmdldEluZm8iLCJDYWxjdWxhdG9yLmxvYWRDYWxjIiwiQ2FsY3VsYXRvci51cGRhdGVDYWxjIiwiQ2hhdGJveCIsIkNoYXRib3guY29uc3RydWN0b3IiLCJDaGF0Ym94LmFkZE1lc3NhZ2UiLCJDaGF0Ym94LmRpc3BsYXlNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZXMiLCJDaGF0Ym94LmVycm9yIiwiQ2hhdGJveC5nZXRTdGFydCIsIkNoYXRib3gubW9kIiwiQ2hhdGJveC5tb2RUb29scyIsIkNoYXRib3gucGFuZWxDaGFubmVscyIsIkNoYXRib3gucGFuZWxDaGF0IiwiQ2hhdGJveC5wYW5lbENsb3NlIiwiQ2hhdGJveC5zdWJtaXRNZXNzYWdlIiwiQ2hhdGJveC5zd2l0Y2hDaGFubmVsIiwiQ2hhdGJveC51cGRhdGUiLCJDaGF0Ym94LnVwZGF0ZVRpbWVBZ28iLCJDb21iYXRDYWxjdWxhdG9yIiwiQ29tYmF0Q2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzIiwiQ29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCIsIkNvbWJhdENhbGN1bGF0b3IudmFsIiwiRm9ydW1zIiwiRm9ydW1zLmNvbnN0cnVjdG9yIiwiRm9ydW1zLmRvd252b3RlIiwiRm9ydW1zLnBvbGxWb3RlIiwiRm9ydW1zLnVwdm90ZSIsIlBvc3QiLCJQb3N0LmNvbnN0cnVjdG9yIiwiUG9zdC5xdW90ZSIsIkZvcnVtc1RocmVhZENyZWF0ZSIsIkZvcnVtc1RocmVhZENyZWF0ZS5jb25zdHJ1Y3RvciIsIkZvcnVtc1RocmVhZENyZWF0ZS5hZGRRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lciIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uIiwiTGl2ZXN0cmVhbVJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LmNvbnN0cnVjdG9yIiwiTGl2ZXN0cmVhbVJlc2V0LnJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzZXMiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93biIsIlJ1bmVUaW1lIiwiUnVuZVRpbWUuY29uc3RydWN0b3IiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuY2hlY2siLCJOYW1lQ2hlY2tlci5hdmFpbGFibGUiLCJOYW1lQ2hlY2tlci5jaGVja05hbWUiLCJOYW1lQ2hlY2tlci51bmF2YWlsYWJsZSIsIk5vdGlmaWNhdGlvbnMiLCJOb3RpZmljYXRpb25zLmNvbnN0cnVjdG9yIiwiUmFkaW8iLCJSYWRpby5jb25zdHJ1Y3RvciIsIlJhZGlvLmNsb3NlUmFkaW8iLCJSYWRpby5vcGVuUmFkaW8iLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vcGVuUmVxdWVzdCIsIlJhZGlvLnNlbmRSZXF1ZXN0IiwiUmFkaW8ub3BlblB1bGwiLCJSYWRpby5oaWRlUHVsbCIsIlJhZGlvLm9ubGluZVNldHRpbmdzIiwiUmFkaW8udXBkYXRlIiwiU2lnbnVwRm9ybSIsIlNpZ251cEZvcm0uY29uc3RydWN0b3IiLCJTaWdudXBGb3JtLmNoZWNrQXZhaWxhYmlsaXR5IiwiU2lnbnVwRm9ybS5jaGVja1Bhc3N3b3JkIiwiU2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5IiwiU2lnbnVwRm9ybS5zdWJtaXQiLCJTaWdudXBGb3JtLnRvZ2dsZUZlZWRiYWNrIiwiU3RhZmZMaXN0IiwiU3RhZmZMaXN0LmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzIiwiVXRpbGl0aWVzLmNvbnN0cnVjdG9yIiwiVXRpbGl0aWVzLmdldEFKQVgiLCJVdGlsaXRpZXMucG9zdEFKQVgiLCJVdGlsaXRpZXMudGltZUFnbyIsIlV0aWxpdGllcy5jdXJyZW50VGltZSIsIlV0aWxpdGllcy5KU09ORGVjb2RlIiwiVXRpbGl0aWVzLnNjcm9sbFRvIiwiVXRpbGl0aWVzLmZvcm1Ub2tlbiJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLENBQUM7QUFDZixJ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O1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMxQixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM5QixVQUFVLENBQUM7Z0JBQ1YsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMzQixnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBQ0RELG9DQUFTQSxHQUFUQTtRQUNDRSxJQUFJQSxJQUFJQSxHQUFH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LENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURILCtCQUFTQSxHQUFUQSxVQUFVQSxJQUFZQTtRQUNyQkksRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNWQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0NBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ1ZBLENBQUNBO1lBQ0RBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLFVBQVVBLEdBQVVBLEVBQUVBLEtBQVNBO2dCQUN0RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUNBLENBQUNBO1FBQ0pBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ1ZBLENB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SUE7WUFDVkEsS0FBS0EsRUFBRUEsSUFBSUE7U0FDZEEsQ0FBQ0EsQ0FBQ0E7SUFDUEEsQ0FBQ0E7SUFDTUgsMkJBQU9BLEdBQWRBLFVBQWVBLEVBQVVBO1FBQ3JCSSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxFQUNyQ0EsT0FBT0EsR0FBR0EsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzVCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxZQUFZQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsY0FBY0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLE9BQU9BLEdBQUdBLGNBQWNBLENBQUNBO1FBQ3BDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFDTUosK0JBQVdBLEdBQWxCQTtRQUNJSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFDTUwsOEJBQVVBLEdBQWpCQSxVQUFrQkEsSUFBWUE7UUFDMUJNLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzdCQSxDQUFDQTtJQUNNTiw0QkFBUUEsR0FBZkEsVUFBZ0JBLE9BQVlBLEVBQUVBLElBQVlBO1FBQ3RDTyxDQUFDQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUNwQkEsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsR0FBR0E7U0FDckNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ2JBLENBQUNBO0lBRU1QLDZCQUFTQSxHQUFoQkEsVUFBaUJBLEtBQWFBO1FBQzFCUSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsNENBQTRDQSxHQUFHQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNwRkEsQ0FBQ0E7SUFDTFIsZ0JBQUNBO0FBQURBLENBdkRBLEFBdURDQSxJQUFBO0FBQ0QsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMiLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYWxjdWxhdG9yO1xyXG5jbGFzcyBDYWxjdWxhdG9yIHtcclxuICAgIGNhbGN1bGF0b3I6IGFueTtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIGluZm86IGFueSA9IHt9O1xyXG4gICAgVVJMOiBhbnkgPSB7fTtcclxuICAgIGl0ZW1zOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxjOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50WFA6ICcjY2FsY3VsYXRvci1jdXJyZW50LXhwJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICcjY2FsY3VsYXRvci1kaXNwbGF5LW5hbWUnLFxyXG4gICAgICAgICAgICBzdWJtaXQ6ICcjY2FsY3VsYXRvci1zdWJtaXQnLFxyXG4gICAgICAgICAgICB0YWJsZTogJyNjYWxjdWxhdG9yLXRhYmxlIHRib2R5JyxcclxuICAgICAgICAgICAgdGFyZ2V0TGV2ZWw6ICcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLlVSTCA9IHtcclxuICAgICAgICAgICAgZ2V0Q2FsYzogJy9jYWxjdWxhdG9ycy9sb2FkJyxcclxuICAgICAgICAgICAgZ2V0SW5mbzogJy9nZXQvaGlzY29yZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IHtcclxuICAgICAgICAgICAgbGV2ZWxDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBsZXZlbFRhcmdldDogMCxcclxuICAgICAgICAgICAgWFBDdXJyZW50OiAwLFxyXG4gICAgICAgICAgICBYUFRhcmdldDogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdG9yID0gY2FsYztcclxuICAgICAgICAkKHRoaXMuZWxlbWVudHMuc3VibWl0KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5nZXRJbmZvKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5sb2FkQ2FsYygpO1xyXG4gICAgICAgICQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcbiAgICAgICAgICAgIH0sIDI1KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0Y2FsY3VsYXRlWFAobGV2ZWw6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgbGV2ZWw7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKiBNYXRoLnBvdygyLCBpIC8gNy4wKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0b3RhbCAvIDQpO1xyXG5cdH1cclxuXHJcblx0Y2FsY3VsYXRlTGV2ZWwoeHA6IG51bWJlcikge1xyXG5cdFx0dmFyIHRvdGFsID0gMCxcclxuXHRcdFx0aSA9IDA7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgMTIwOyBpICs9IDEpIHtcclxuXHRcdFx0dG90YWwgKz0gTWF0aC5mbG9vcihpICsgMzAwICsgTWF0aC5wb3coMiwgaSAvIDcpKTtcclxuXHRcdFx0aWYoTWF0aC5mbG9vcih0b3RhbCAvIDQpID4geHApXHJcblx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdGVsc2UgaWYoaSA+PSA5OSlcclxuXHRcdFx0XHRyZXR1cm4gOTk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMuZWxlbWVudHMuZGlzcGxheU5hbWUpLnZhbCgpO1xyXG5cdFx0dmFyIGluZm8gPSB1dGlsaXRpZXMuZ2V0QUpBWCh0aGlzLlVSTC5nZXRJbmZvICsgJy8nICsgbmFtZSk7XHJcblx0XHRpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbzogYW55KSB7XHJcblx0XHRcdGluZm8gPSAkLnBhcnNlSlNPTihpbmZvKTtcclxuXHRcdFx0dmFyIHJlbGV2YW50ID0gaW5mb1sxM107XHJcblx0XHRcdGNhbGN1bGF0b3IuaW5mby5sZXZlbEN1cnJlbnQgPSByZWxldmFudFsxXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCA9IHJlbGV2YW50WzJdO1xyXG5cdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMuY3VycmVudFhQKS52YWwoY2FsY3VsYXRvci5pbmZvLlhQQ3VycmVudCk7XHJcblx0XHRcdGlmKCQoY2FsY3VsYXRvci5lbGVtZW50cy50YXJnZXRMZXZlbCkudmFsKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwocGFyc2VJbnQoY2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCwgMTApICsgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FsY3VsYXRvci51cGRhdGVDYWxjKCk7XHJcblx0XHR9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2FsYygpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHtpZDogdGhpcy5jYWxjdWxhdG9yfTtcclxuICAgICAgICB2YXIgaW5mbyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5nZXRDYWxjLCBkYXRhKTtcclxuICAgICAgICBpbmZvLmRvbmUoZnVuY3Rpb24oaW5mbykge1xyXG4gICAgICAgICAgICBpbmZvID0gdXRpbGl0aWVzLkpTT05EZWNvZGUoaW5mbyk7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0b3IuaXRlbXMgPSBpbmZvO1xyXG4gICAgICAgICAgICAkLmVhY2goY2FsY3VsYXRvci5pdGVtcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGQ+XCIgKyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLnhwICsgXCI8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD4maW5maW47PC90ZD5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8L3RyPlwiO1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNhbGMoKSB7XHJcbiAgICAgICAgdmFyIGxldmVsQ3VycmVudCA9IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0ID0gMCxcclxuICAgICAgICAgICAgeHBDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgeHBUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gMCxcclxuICAgICAgICAgICAgYW1vdW50ID0gMDtcclxuICAgICAgICB0aGlzLmluZm8ubGV2ZWxUYXJnZXQgPSBwYXJzZUludCgkKCcjY2FsY3VsYXRvci10YXJnZXQtbGV2ZWwnKS52YWwoKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHRoaXMuaW5mby5sZXZlbFRhcmdldCk7XHJcbiAgICAgICAgaWYodGhpcy5pbmZvLlhQQ3VycmVudCA+IHRoaXMuaW5mby5YUFRhcmdldClcclxuICAgICAgICAgICAgdGhpcy5pbmZvLlhQVGFyZ2V0ID0gdGhpcy5jYWxjdWxhdGVYUChwYXJzZUludCh0aGlzLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuICAgICAgICBsZXZlbEN1cnJlbnQgPSB0aGlzLmluZm8ubGV2ZWxDdXJyZW50O1xyXG4gICAgICAgIGxldmVsVGFyZ2V0ID0gdGhpcy5pbmZvLmxldmVsVGFyZ2V0O1xyXG4gICAgICAgIHhwQ3VycmVudCA9IHRoaXMuaW5mby5YUEN1cnJlbnQ7XHJcbiAgICAgICAgeHBUYXJnZXQgPSB0aGlzLmluZm8uWFBUYXJnZXQ7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IHhwVGFyZ2V0IC0geHBDdXJyZW50O1xyXG4gICAgICAgICQuZWFjaCh0aGlzLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IE1hdGguY2VpbChkaWZmZXJlbmNlIC8gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHApO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBhbW91bnQgPCAwID8gMCA6IGFtb3VudDtcclxuICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJykgdGQ6bnRoLWNoaWxkKDQpJykuaHRtbChhbW91bnQpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxDdXJyZW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuXFxuXFxuXCIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsIDw9IGxldmVsQ3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsID4gbGV2ZWxDdXJyZW50ICYmIGxldmVsVGFyZ2V0ID49IGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtd2FybmluZycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhYmxlICsgJyB0cjpudGgtY2hpbGQoJyArIChpbmRleCArIDEpICsgJyknKS5hdHRyKCdjbGFzcycsICd0ZXh0LWRhbmdlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY2hhdGJveDtcclxuY2xhc3MgQ2hhdGJveCB7XHJcblx0Y2hhbm5lbDogc3RyaW5nID0gJyNyYWRpbyc7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdGxhc3RJZDogbnVtYmVyID0gMDtcclxuXHRtZXNzYWdlczogYW55ID0gW107XHJcblx0bW9kZXJhdG9yOiBib29sZWFuID0gZmFsc2U7XHJcblx0cGlubmVkOiBhbnkgPSBbXTtcclxuXHR0aW1lczogYW55ID0ge307XHJcblx0dGltZW91dFBpbm5lZDogYW55ID0gbnVsbDtcclxuXHR0aW1lb3V0VXBkYXRlOiBhbnkgPSBudWxsO1xyXG5cdFVSTDogYW55ID0ge307XHJcblxyXG5cdHBpbm5lZERpc3BsYXllZDogYW55ID0gW107XHJcblxyXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjaGFubmVsOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRhY3Rpb25zOiAnI2NoYXRib3gtYWN0aW9ucycsXHJcblx0XHRcdGNoYW5uZWxzOiAnI2NoYXRib3gtY2hhbm5lbHMnLFxyXG5cdFx0XHRjaGF0Ym94OiAnI2NoYXRib3gnLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NoYXRib3gtbWVzc2FnZScsXHJcblx0XHRcdG1lc3NhZ2VzOiAnI2NoYXRib3gtbWVzc2FnZXMnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5VUkwgPSB7XHJcblx0XHRcdGdldFN0YXJ0OiAnL2NoYXQvc3RhcnQnLFxyXG5cdFx0XHRnZXRVcGRhdGU6ICcvY2hhdC91cGRhdGUnLFxyXG5cdFx0XHRwb3N0TWVzc2FnZTogJy9jaGF0L3Bvc3QvbWVzc2FnZScsXHJcblx0XHRcdHBvc3RTdGF0dXNDaGFuZ2U6ICcvY2hhdC9wb3N0L3N0YXR1cy9jaGFuZ2UnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy50aW1lcyA9IHtcclxuXHRcdFx0bGFzdEFjdGl2aXR5OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKSxcclxuXHRcdFx0bGFzdFJlZnJlc2g6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsb2FkZWRBdDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKClcclxuXHRcdH07XHJcblx0XHR2YXIgbW9kZXJhdG9yID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L21vZGVyYXRvcicpO1xyXG5cdFx0bW9kZXJhdG9yLmRvbmUoZnVuY3Rpb24obW9kZXJhdG9yOiBzdHJpbmcpIHtcclxuXHRcdFx0bW9kZXJhdG9yID0gJC5wYXJzZUpTT04obW9kZXJhdG9yKTtcclxuXHRcdFx0Y2hhdGJveC5tb2RlcmF0b3IgPSBtb2RlcmF0b3IubW9kID09PSB0cnVlO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnBhbmVsQ2hhdCgpO1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmKGUud2hpY2ggPT09IDEzKVxyXG5cdFx0XHRcdGNoYXRib3guc3VibWl0TWVzc2FnZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhbm5lbHMpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnBhbmVsQ2hhbm5lbHMoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlKCk7XHJcblx0XHR9LCA1MDAwKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZVRpbWVBZ28oKTtcclxuXHRcdH0sIDEwMDApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogYW55KSB7XHJcblx0XHRpZih0aGlzLmxhc3RJZCA8IG1lc3NhZ2UuaWQpIHtcclxuXHRcdFx0dGhpcy5sYXN0SWQgPSBtZXNzYWdlLmlkO1xyXG5cdFx0fVxyXG5cdFx0aWYobWVzc2FnZS5zdGF0dXMgPD0gMSkge1xyXG5cdFx0XHR0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoXSA9IG1lc3NhZ2U7XHJcblx0XHRcdHRoaXMudGltZXMubGFzdEFjdGl2aXR5ID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2UobWVzc2FnZSkge1xyXG5cdFx0aWYoIW1lc3NhZ2UpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0aWYgKG1lc3NhZ2Uuc3RhdHVzID09PSAxKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctaGlkZGVuJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMikge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbm5lZCc+XCI7XHJcblx0XHR9IGVsc2UgaWYobWVzc2FnZS5zdGF0dXMgPT09IDMpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1waW5oaWQnPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnJz5cIjtcclxuXHRcdH1cclxuXHRcdGh0bWwgKz0gXCI8dGltZSBjbGFzcz0ncHVsbC1yaWdodCcgZGF0YS10cz0nXCIgKyBtZXNzYWdlLmNyZWF0ZWRfYXQgKyBcIic+XCI7XHJcblx0XHRodG1sICs9IHV0aWxpdGllcy50aW1lQWdvKG1lc3NhZ2UuY3JlYXRlZF9hdCk7XHJcblx0XHRodG1sICs9IFwiPC90aW1lPlwiO1xyXG5cdFx0aHRtbCArPSBcIjxwPlwiO1xyXG5cdFx0aWYoY2hhdGJveC5tb2RlcmF0b3IgPT09IHRydWUpIHtcclxuXHRcdFx0aHRtbCArPSBDaGF0Ym94Lm1vZFRvb2xzKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjxhIGNsYXNzPSdtZW1iZXJzLVwiICsgbWVzc2FnZS5jbGFzc19uYW1lICsgXCInPlwiICsgbWVzc2FnZS5hdXRob3JfbmFtZSArIFwiPC9hPjogXCIgKyBtZXNzYWdlLmNvbnRlbnRzX3BhcnNlZDtcclxuXHRcdGh0bWwgKz0gXCI8L3A+XCI7XHJcblx0XHRodG1sICs9IFwiPC9kaXY+XCI7XHJcblx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZXMpLnByZXBlbmQoaHRtbCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcGxheU1lc3NhZ2VzKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcclxuXHRcdCQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuaHRtbCgnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uKGluZGV4LCBtZXNzYWdlKSB7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaCh0aGlzLnBpbm5lZCwgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0aWYoY2hhdGJveC5waW5uZWREaXNwbGF5ZWRbbWVzc2FnZS5pZF0gIT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSA9IHRydWU7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjaGF0Ym94LnBpbm5lZERpc3BsYXllZCA9IFtdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBlcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldFN0YXJ0KCkge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHR0aW1lOiB0aGlzLnRpbWVzLmxvYWRlZEF0LFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgnY2hhdC9zdGFydCcsIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHMpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHQkLmVhY2gocmVzdWx0cy5tZXNzYWdlcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRjaGF0Ym94LnBpbm5lZCA9IHJlc3VsdHMucGlubmVkO1xyXG5cdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgbW9kKGlkOiBhbnksIG5ld1N0YXR1czogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IGlkLFxyXG5cdFx0XHRzdGF0dXM6IG5ld1N0YXR1c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9zdGF0dXMtY2hhbmdlJywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNoYXRib3guZXJyb3IoXCJUaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcGVyZm9ybWluZyB0aGF0IG1vZGVyYXRpb24gY2hhbmdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgbW9kVG9vbHMobWVzc2FnZSkge1xyXG5cdFx0dmFyIHJlcyA9IFwiXCI7XHJcblx0XHRyZXMgKz0gXCI8dWwgY2xhc3M9J2xpc3QtaW5saW5lIGlubGluZSc+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyAlIDIgPT09IDApIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzICsgMSkgKyBcIik7JyB0aXRsZT0nSGlkZSBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtbWludXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDEpICsgXCIpOycgdGl0bGU9J1Nob3cgbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMtY2lyY2xlIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8bGk+XCI7XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA+PSAyKSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyAtIDIpICsgXCIpOycgdGl0bGU9J1VucGluIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1hcnJvdy1jaXJjbGUtZG93biB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAyKSArIFwiKTsnIHRpdGxlPSdQaW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS11cCB0ZXh0LWluZm8nPjwvaT48L2E+XCI7XHJcblx0XHR9XHJcblx0XHRyZXMgKz0gXCI8L2xpPlwiO1xyXG5cdFx0cmVzICs9IFwiPC91bD5cIjtcclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDaGFubmVscygpIHtcclxuXHRcdHZhciByZXNwb25zZSA9IHV0aWxpdGllcy5nZXRBSkFYKCcvY2hhdC9jaGFubmVscycpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LXBvcHVwLWNoYW5uZWxzJz5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2Nsb3NlJyBvbmNsaWNrPSdjaGF0Ym94LnBhbmVsY2xvc2UoKTsnPkNsb3NlIDxzcGFuIGFyaWEtaGlkZGVuPSd0cnVlJz4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPSdzci1vbmx5Jz5DbG9zZTwvc3Bhbj48L2J1dHRvbj5cIjtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8aDM+Q2hhbm5lbHM8L2gzPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxwIGNsYXNzPSdob2xvLXRleHQnPkN1cnJlbnRseSBvbiA8Yj4jXCIgKyBjaGF0Ym94LmNoYW5uZWwgKyBcIjwvYj48L3A+XCI7XHJcblx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPGEgb25jbGljaz1cXFwiY2hhdGJveC5zd2l0Y2hDaGFubmVsKCdcIiArIHZhbHVlLm5hbWUgKyBcIicpO1xcXCI+I1wiICsgdmFsdWUubmFtZSArIFwiPC9hPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPlwiICsgdmFsdWUubWVzc2FnZXMgKyBcIiBtZXNzYWdlczwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0XHRjb250ZW50cyArPSBcIjxzcGFuIGNsYXNzPSdob2xvLXRleHQtc2Vjb25kYXJ5Jz5MYXN0IGFjdGl2ZSBcIiArIHV0aWxpdGllcy50aW1lQWdvKHZhbHVlLmxhc3RfbWVzc2FnZSkgKyBcIjwvc3Bhbj48YnIgLz5cIjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPC9kaXY+XCI7XHJcblx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykuaHRtbChjb250ZW50cyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYXQoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSBcIlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LW1lc3NhZ2VzJz48L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGRpdiBpZD0nY2hhdGJveC1hY3Rpb25zJz5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaHJlZj0nL3RyYW5zcGFyZW5jeS9tYXJrZG93bicgdGFyZ2V0PSdfYmxhbmsnIGlkPSdjaGF0Ym94LW1hcmtkb3duJz5NYXJrZG93bjwvYT5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGEgaWQ9J2NoYXRib3gtY2hhbm5lbHMnPkNoYW5uZWxzPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdGNvbnRlbnRzICs9IFwiPGlucHV0IHR5cGU9J3RleHQnIGlkPSdjaGF0Ym94LW1lc3NhZ2UnIC8+XCI7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuY2hhdGJveCkuaHRtbChjb250ZW50cyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcGFuZWxDbG9zZSgpIHtcclxuXHRcdHRoaXMuZ2V0U3RhcnQoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdWJtaXRNZXNzYWdlKCkge1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgpLFxyXG5cdFx0XHRtZXNzYWdlLFxyXG5cdFx0XHRyZXNwb25zZTtcclxuXHRcdG1lc3NhZ2UgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50cyxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwucG9zdE1lc3NhZ2UsIG1lc3NhZ2UpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJycpO1xyXG5cdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2Utc2VudCcpO1xyXG5cdFx0XHRcdH0sIDE1MDApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3BvbnNlLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IGFyZSBub3QgbG9nZ2VkIGluIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlc3BvbnNlLmVycm9yID09PSAtMikge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnWW91IHdlcmUgbXV0ZWQgZm9yIG9uZSBob3VyIGJ5IGEgc3RhZmYgbWVtYmVyIGFuZCBjYW4gbm90IHNlbmQgbWVzc2FnZXMuJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS52YWwoJ1RoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yLiAgUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLWJhZCcpO1xyXG5cdFx0XHRcdH0sIDI1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzd2l0Y2hDaGFubmVsKG5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIGRhdGEsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0ZGF0YSA9IHtcclxuXHRcdFx0Y2hhbm5lbDogbmFtZVxyXG5cdFx0fTtcclxuXHRcdHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKCcvY2hhdC9jaGFubmVscy9jaGVjaycsIGRhdGEpO1xyXG5cdFx0cmVzcG9uc2UuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRyZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHRcdFx0aWYocmVzcG9uc2UudmFsaWQpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmNoYW5uZWwgPSBuYW1lO1xyXG5cdFx0XHRcdGNoYXRib3guZ2V0U3RhcnQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnZXJyb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGlkOiB0aGlzLmxhc3RJZCxcclxuXHRcdFx0Y2hhbm5lbDogdGhpcy5jaGFubmVsXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldFVwZGF0ZSwgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVzLmxhc3RSZWZyZXNoID0gdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdGlmKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0XHRcdGNoYXRib3guYWRkTWVzc2FnZSh2YWx1ZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZXMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjbGVhclRpbWVvdXQoY2hhdGJveC50aW1lb3V0VXBkYXRlKTtcclxuXHRcdFx0Y2hhdGJveC50aW1lb3V0VXBkYXRlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdFx0fSwgMTAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlVGltZUFnbygpIHtcclxuXHRcdHZhciBtZXNzYWdlcyA9ICQodGhpcy5lbGVtZW50cy5tZXNzYWdlcykuZmluZCgnLm1zZycpO1xyXG5cdFx0JC5lYWNoKG1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdHZhciB0aW1lc3RhbXAgPSAkKHZhbHVlKS5maW5kKCd0aW1lJykuYXR0cignZGF0YS10cycpO1xyXG5cdFx0XHQkKHZhbHVlKS5maW5kKCd0aW1lJykuaHRtbCh1dGlsaXRpZXMudGltZUFnbyh0aW1lc3RhbXApKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG59IiwidmFyIGNvbWJhdENhbGN1bGF0b3I7XHJcbmNsYXNzIENvbWJhdENhbGN1bGF0b3Ige1xyXG5cdGNsaWNrczogYW55ID0ge307XHJcblx0Z2VuZXJhdGU6IGFueSA9IHt9O1xyXG5cdGlucHV0czogYW55ID0ge307XHJcblx0b3RoZXI6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuY2xpY2tzID0ge1xyXG5cdFx0XHRzdWJtaXQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmdlbmVyYXRlID0ge1xyXG5cdFx0XHRsZXZlbDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bGV2ZWwnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5pbnB1dHMgPSB7XHJcblx0XHRcdGF0dGFjazogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6YXR0YWNrJ11cIixcclxuXHRcdFx0ZGVmZW5jZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6ZGVmZW5jZSddXCIsXHJcblx0XHRcdHN0cmVuZ3RoOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdHJlbmd0aCddXCIsXHJcblx0XHRcdGNvbnN0aXR1dGlvbjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6Y29uc3RpdHV0aW9uJ11cIixcclxuXHRcdFx0cmFuZ2VkOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpyYW5nZWQnXVwiLFxyXG5cdFx0XHRwcmF5ZXI6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnByYXllciddXCIsXHJcblx0XHRcdG1hZ2ljOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjptYWdpYyddXCIsXHJcblx0XHRcdHN1bW1vbmluZzogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VtbW9uaW5nJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMub3RoZXIgPSB7XHJcblx0XHRcdG5hbWU6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm5hbWUnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0bG9hZENvbWJhdDogJy9jYWxjdWxhdG9ycy9jb21iYXQvbG9hZCdcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaW5wdXRzLmF0dGFjaykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuZGVmZW5jZSkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuc3RyZW5ndGgpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLmNvbnN0aXR1dGlvbikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMucmFuZ2VkKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5wcmF5ZXIpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLm1hZ2ljKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdW1tb25pbmcpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuY2xpY2tzLnN1Ym1pdCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Z2V0TGV2ZWxzKCkge1xyXG5cdFx0dmFyIG5hbWUgPSAkKHRoaXMub3RoZXIubmFtZSkudmFsKCksXHJcblx0XHRcdGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH0sXHJcblx0XHRcdGxldmVscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmxvYWRDb21iYXQsIGRhdGEpO1xyXG5cdFx0bGV2ZWxzLmRvbmUoZnVuY3Rpb24obGV2ZWxzKSB7XHJcblx0XHRcdGxldmVscyA9ICQucGFyc2VKU09OKGxldmVscyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuYXR0YWNrKS52YWwobGV2ZWxzLmF0dGFjayk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuZGVmZW5jZSkudmFsKGxldmVscy5kZWZlbmNlKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5zdHJlbmd0aCkudmFsKGxldmVscy5zdHJlbmd0aCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuY29uc3RpdHV0aW9uKS52YWwobGV2ZWxzLmNvbnN0aXR1dGlvbik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucmFuZ2VkKS52YWwobGV2ZWxzLnJhbmdlZCk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMucHJheWVyKS52YWwobGV2ZWxzLnByYXllcik7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMubWFnaWMpLnZhbChsZXZlbHMubWFnaWMpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN1bW1vbmluZykudmFsKGxldmVscy5zdW1tb25pbmcpO1xyXG5cdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dXBkYXRlTGV2ZWwoKSB7XHJcblx0XHR2YXIgbWVsZWUgPSB0aGlzLnZhbCgnYXR0YWNrJykgKyB0aGlzLnZhbCgnc3RyZW5ndGgnKTtcclxuXHRcdHZhciBtYWdpYyA9IDIgKiB0aGlzLnZhbCgnbWFnaWMnKTtcclxuXHRcdHZhciByYW5nZWQgPSAyICogdGhpcy52YWwoJ3JhbmdlZCcpO1xyXG5cdFx0dmFyIGRlZiA9IHRoaXMudmFsKCdkZWZlbmNlJykgKyB0aGlzLnZhbCgnY29uc3RpdHV0aW9uJyk7XHJcblx0XHR2YXIgb3RoZXIgPSAoLjUgKiB0aGlzLnZhbCgncHJheWVyJykpICsgKC41ICogdGhpcy52YWwoJ3N1bW1vbmluZycpKTtcclxuXHRcdHZhciBsZXZlbCA9ICgxMy8xMCkgKiBNYXRoLm1heChtZWxlZSwgbWFnaWMsIHJhbmdlZCkgKyBkZWYgKyBvdGhlcjtcclxuXHRcdGxldmVsICo9IC4yNTtcclxuXHRcdGxldmVsID0gTWF0aC5mbG9vcihsZXZlbCk7XHJcblx0XHQkKHRoaXMuZ2VuZXJhdGUubGV2ZWwpLmh0bWwobGV2ZWwpO1xyXG5cdH1cclxuXHR2YWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQoJChcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpcIiArIG5hbWUgKyBcIiddXCIpLnZhbCgpKTtcclxuXHR9XHJcbn0iLCJ2YXIgZm9ydW1zO1xyXG5jbGFzcyBGb3J1bXMge1xyXG5cdHB1YmxpYyBlbGVtZW50czogYW55ID0ge307XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBwb3N0OiBQb3N0ID0gbnVsbDtcclxuXHRwdWJsaWMgdGhyZWFkQ3JlYXRlOiBGb3J1bXNUaHJlYWRDcmVhdGUgPSBudWxsO1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdCdwb3N0RWRpdG9yJzogXCJbcnQtZGF0YT0ncG9zdC5lZGl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdHBvbGw6IHtcclxuXHRcdFx0XHR2b3RlOiBcIltydC1ob29rPSdmb3J1bTpwb2xsLnZvdGUnXVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRwb2xsOiB7XHJcblx0XHRcdFx0dm90ZTogJy9mb3J1bXMvcG9sbC92b3RlJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR2b3RlOiBmdW5jdGlvbihpZDogbnVtYmVyKSB7IHJldHVybiAnL2ZvcnVtcy9wb3N0LycgKyBpZCArICcvdm90ZSc7IH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBvc3QgPSBuZXcgUG9zdCgpO1xyXG5cdFx0JCgnLnVwdm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMudXB2b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJy5kb3dudm90ZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBwb3N0SWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHRmb3J1bXMuZG93bnZvdGUocG9zdElkKTtcclxuXHRcdH0pO1xyXG5cdFx0JChcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLnBvc3Q6cXVvdGUnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgaWQgPSAkKGUudGFyZ2V0KS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdGZvcnVtcy5wb3N0LnF1b3RlKGlkKTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnBvbGwudm90ZSkuY2xpY2soZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdHZhciBkYXRhID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHRcdGZvcnVtcy5wb2xsVm90ZShkYXRhLnF1ZXN0aW9uLCBkYXRhLmFuc3dlcik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb3dudm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc0Rvd252b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0J3ZvdGUnOiAnZG93bidcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwb2xsVm90ZShxdWVzdGlvbklkOiBudW1iZXIsIGFuc3dlcklkOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRhbnN3ZXI6IGFuc3dlcklkLFxyXG5cdFx0XHRxdWVzdGlvbjogcXVlc3Rpb25JZFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucG9sbC52b3RlLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKHJlc3VsdHMuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQvLyBUaGUgdXNlciB3YXMgbm90IGxvZ2dlZCBpblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBVbmtub3duIGVycm9yXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vIFRPRE86IE1ha2UgYW4gZXJyb3IgZGl2XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVwdm90ZShwb3N0SWQ6IGFueSkge1xyXG5cdFx0cG9zdElkID0gcG9zdElkLnJlcGxhY2UoXCJwb3N0XCIsIFwiXCIpO1xyXG5cdFx0dmFyIHBvc3QgPSAkKCcjcG9zdCcgKyBwb3N0SWQpLFxyXG5cdFx0XHRpc1Vwdm90ZWQgPSAkKHBvc3QpLmhhc0NsYXNzKCd1cHZvdGUtYWN0aXZlJyksXHJcblx0XHRcdGlzRG93bnZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygnZG93bnZvdGUtYWN0aXZlJyk7XHJcblx0XHRpZihpc1Vwdm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0JChwb3N0KS5hZGRDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ3VwJ1xyXG5cdFx0fTtcclxuXHRcdHZhciB2b3RlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMudm90ZShwb3N0SWQpLCBkYXRhKTtcclxuXHRcdHZvdGUuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTihkYXRhKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5jbGFzcyBQb3N0IHtcclxuXHRwdWJsaWMgcXVvdGUoaWQ6IGFueSkge1xyXG5cdFx0dmFyIHNvdXJjZSA9ICQoXCJbcnQtZGF0YT0ncG9zdCNcIiArIGlkICtcIjpzb3VyY2UnXVwiKS5odG1sKCksXHJcblx0XHRcdHBvc3RDb250ZW50cyA9ICQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbCgpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoL1xcbi9nLCAnXFxuPicpO1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoLyZsdDsvZywgJzwnKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XHJcblx0XHRzb3VyY2UgPSBcIj5cIiArIHNvdXJjZTtcclxuXHRcdGlmKHBvc3RDb250ZW50cy5sZW5ndGggPiAwKVxyXG5cdFx0XHRwb3N0Q29udGVudHMgKz0gXCJcXG5cIjtcclxuXHRcdCQoZm9ydW1zLmVsZW1lbnRzLnBvc3RFZGl0b3IpLnZhbChwb3N0Q29udGVudHMgKyBzb3VyY2UgKyBcIlxcblwiKTtcclxuXHRcdHV0aWxpdGllcy5zY3JvbGxUbygkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKSwgMTAwMCk7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS5mb2N1cygpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRm9ydW1zVGhyZWFkQ3JlYXRlIHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBxdWVzdGlvbnM6IEFycmF5ID0gW107XHJcblx0cHVibGljIHZhbHVlczogYW55ID0ge307XHJcblx0cHVibGljIHZpZXdzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRxdWVzdGlvbkFkZDogXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5xdWVzdGlvbi5hZGQnXVwiLFxyXG5cdFx0XHRxdWVzdGlvbnM6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb25zJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMucXVlc3Rpb25zID0gQXJyYXkoNTAwKTtcclxuXHRcdHRoaXMudmFsdWVzID0ge1xyXG5cdFx0XHRxdWVzdGlvbnM6IDBcclxuXHRcdH07XHJcblx0XHR0aGlzLnZpZXdzID0ge1xyXG5cdFx0XHRhbnN3ZXI6ICQoXCJbcnQtdmlldz0nZm9ydW1zLnRocmVhZC5jcmVhdGU6cG9sbC5hbnN3ZXInXVwiKS5odG1sKCksXHJcblx0XHRcdHF1ZXN0aW9uOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24nXVwiKS5odG1sKClcclxuXHRcdH07XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25BZGQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUuYWRkUXVlc3Rpb24oKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRwdWJsaWMgYWRkUXVlc3Rpb24oKSB7XHJcblx0XHR2YXIgaHRtbCA9IHRoaXMudmlld3MucXVlc3Rpb247XHJcblx0XHQkKHRoaXMuaG9va3MucXVlc3Rpb25zKS5hcHBlbmQoaHRtbCk7XHJcblx0XHR0aGlzLnZhbHVlcy5xdWVzdGlvbnMgKz0gMTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZW1vdmVRdWVzdGlvbihudW1iZXI6IG51bWJlcikge1xyXG5cdFx0dGhpcy5xdWVzdGlvbnMuc3BsaWNlKG51bWJlciwgMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0TGlzdGVuZXIoZWxlbWVudCwgdHlwZSkge1xyXG5cdFx0aWYodHlwZSA9PT0gXCJyZW1vdmUgcXVlc3Rpb25cIikge1xyXG5cdFx0XHR0aGlzLnNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHNldExpc3RlbmVyUmVtb3ZlUXVlc3Rpb24oZWxlbWVudDogYW55KSB7XHJcblx0XHQkKGVsZW1lbnQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZTogYW55KSB7XHJcblx0XHRcdGZvcnVtcy50aHJlYWRDcmVhdGUucmVtb3ZlUXVlc3Rpb24oJChlbGVtZW50KS5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyKCdydC1kYXRhJykpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdGZvcnVtcyA9IG5ldyBGb3J1bXMoKTtcclxufSk7IiwiY2xhc3MgTGl2ZXN0cmVhbVJlc2V0IHtcclxuXHRwdWJsaWMgaG9va3M6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBsYW5nOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcGF0aHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuaG9va3MgPSB7XHJcblx0XHRcdG5vdGU6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6bm90ZSddXCIsXHJcblx0XHRcdHNwaW5uZXI6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3Bpbm5lciddXCIsXHJcblx0XHRcdHN0YXR1czogXCJbcnQtaG9vaz0nbGl2ZXN0cmVhbS5yZXNldDpzdGF0dXMnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5sYW5nID0ge1xyXG5cdFx0XHRjaGVja2luZzogJ2NoZWNraW5nJyxcclxuXHRcdFx0b2ZmbGluZTogJ29mZmxpbmUnLFxyXG5cdFx0XHRvbmxpbmU6ICdvbmxpbmUnLFxyXG5cdFx0XHR1bmtub3duOiAndW5rbm93bidcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRyZXNldDogJy9saXZlc3RyZWFtL3Jlc2V0J1xyXG5cdFx0fTtcclxuXHRcdHRoaXMucmVzZXQoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVzZXQoKSB7XHJcblx0XHQkKCcjbG9hZGluZycpLmNzcyh7IG9wYWNpdHk6IDF9KTtcclxuXHRcdHZhciBzdGF0dXMgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy5yZXNldCwge30pO1xyXG5cdFx0c3RhdHVzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSB1dGlsaXRpZXMuSlNPTkRlY29kZShyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5vbmxpbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT25saW5lKCk7XHJcblx0XHRcdH0gZWxzZSBpZihyZXN1bHRzLm9ubGluZSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxpdmVzdHJlYW1SZXNldC5zdGF0dXNVbmtub3duKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAwfSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3Bpbm5lclJlbW92ZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zcGlubmVyKS5jc3Moe1xyXG5cdFx0XHRvcGFjaXR5OiAwXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNlcyhjaGVja2luZzogc3RyaW5nLCBvbmxpbmU6IHN0cmluZywgb2ZmbGluZTogc3RyaW5nLCB1bmtub3duOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMubGFuZy5jaGVja2luZyA9IGNoZWNraW5nO1xyXG5cdFx0dGhpcy5sYW5nLm9mZmxpbmUgPSBvZmZsaW5lO1xyXG5cdFx0dGhpcy5sYW5nLm9ubGluZSA9IG9ubGluZTtcclxuXHRcdHRoaXMubGFuZy51bmtub3duID0gdW5rbm93bjtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPZmZsaW5lKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcIm9mZmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LWRhbmdlcicpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXR1c09ubGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvbmxpbmVcIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXN1Y2Nlc3MnKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNVbmtub3duKCkge1xyXG5cdFx0JCh0aGlzLmhvb2tzLnN0YXR1cykuaHRtbChcInVua25vd25cIikuXHJcblx0XHRcdHJlbW92ZUNsYXNzKCkuXHJcblx0XHRcdGFkZENsYXNzKCd0ZXh0LXdhcm5pbmcnKTtcclxuXHR9XHJcbn0iLCJ2YXIgcnVuZXRpbWU7XHJcbmNsYXNzIFJ1bmVUaW1lIHtcclxuXHRsb2FkaW5nOnN0cmluZyA9ICcjbG9hZGluZyc7XHJcbn1cclxucnVuZXRpbWUgPSBuZXcgUnVuZVRpbWUoKTtcclxuJChmdW5jdGlvbiAoKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblx0JCgnW2RhdGEtdG9nZ2xlXScpLnRvb2x0aXAoKTtcclxuXHQkKCcuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oKTtcclxuXHQkKCd0Ym9keS5yb3dsaW5rJykucm93bGluaygpO1xyXG5cdCQoJyN0b3AnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHQkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcblx0XHRcdHNjcm9sbFRvcDogMFxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fSk7XHJcblx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaGVpZ2h0ID0gJCgnYm9keScpLmhlaWdodCgpLFxyXG5cdFx0XHRzY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcblx0XHRcdHRvcCA9ICQoJyN0b3AnKTtcclxuXHRcdGlmKHNjcm9sbCA+IGhlaWdodC8xMCkge1xyXG5cdFx0XHRpZighJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZUluKDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZigkKHRvcCkuaGFzQ2xhc3MoJ3NldC12aXMnKSkge1xyXG5cdFx0XHRcdCQodG9wKS5mYWRlT3V0KDIwMCkuXHJcblx0XHRcdFx0XHR0b2dnbGVDbGFzcygnc2V0LXZpcycpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblx0JCgnLm5hdmJhciAuZHJvcGRvd24nKS5ob3ZlcihmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuZGVsYXkoNTApLnNsaWRlRG93bigpO1xyXG5cdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5kZWxheSgxMDApLnNsaWRlVXAoKVxyXG5cdH0pO1xyXG59KTsiLCJ2YXIgbmFtZUNoZWNrZXI7XHJcbmNsYXNzIE5hbWVDaGVja2VyIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bm90QWxsb3dlZDogYW55ID0gW107XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0YXZhaWxhYmlsaXR5OiAnI3Jzbi1hdmFpbGFiaWxpdHknLFxyXG5cdFx0XHRjaGVjazogJyNyc24tY2hlY2stZmllbGQnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ub3RBbGxvd2VkID0gWydablZqYXc9PScsICdjMmhwZEE9PSddO1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0Y2hlY2s6ICcvbmFtZS9jaGVjaydcclxuXHRcdH07XHJcblx0XHQkKFwiW3J0LWhvb2s9J25hbWUuY2hlY2tlcjpzdWJtaXQnXVwiKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKHZhbHVlOiBhbnkpIHtcclxuXHRcdFx0bmFtZUNoZWNrZXIuY2hlY2soKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRjaGVjaygpIHtcclxuXHRcdHZhciBuYW1lID0gJCgnI3Jzbi1jaGVjay1maWVsZCcpLnZhbCgpO1xyXG5cdFx0dmFyIGNoZWNrTmFtZSA9IHRoaXMuY2hlY2tOYW1lKG5hbWUpO1xyXG5cdFx0aWYoY2hlY2tOYW1lID09PSAwKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJZb3UgZGlkIG5vdCBlbnRlciBhbnl0aGluZy5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSAxKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gaXMgb3ZlciAxMiBjaGFyYWN0ZXJzLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDIpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBpcyB1bmRlciAzIGNoYXJhY3RlcnMuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gMykge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IHN0YXJ0cyB3aXRoIHRoZSB3b3JkIE1vZC5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSA0KSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gY29udGFpbnMgYSBzd2VhciB3b3JkLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDUpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0cnNuOiBuYW1lXHJcblx0XHRcdH07XHJcblx0XHRcdHZhciBkZXRhaWxzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuY2hlY2ssIGRhdGEpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuYXZhaWxhYmlsaXR5KS5odG1sKCdMb2FkaW5nLi4uJyk7XHJcblx0XHRcdGRldGFpbHMuZG9uZShmdW5jdGlvbihkZXRhaWxzOiBzdHJpbmcpIHtcclxuXHRcdFx0XHR2YXIgYXZhaWxhYmxlID0gZmFsc2U7XHJcblx0XHRcdFx0aWYoZGV0YWlscy5zdWJzdHJpbmcoMCwgNikgPT09IFwiPGh0bWw+XCIpIHtcclxuXHRcdFx0XHRcdGF2YWlsYWJsZSA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKGF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0bmFtZUNoZWNrZXIuYXZhaWxhYmxlKG5hbWUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRuYW1lQ2hlY2tlci51bmF2YWlsYWJsZSgnVGhlIFJ1bmVzY2FwZSBuYW1lIDxiPicgKyBuYW1lICsgJzwvYj4gaXMgbm90IGF2YWlsYWJsZS4nKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRhdmFpbGFibGUobmFtZTogc3RyaW5nKSB7XHJcblx0XHQkKG5hbWVDaGVja2VyLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbCgnVGhlIFJ1bmVTY2FwZSBuYW1lIDxiPicgKyBuYW1lICsgJzwvYj4gaXMgYXZhaWxhYmxlLicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdGNvbG9yOiAnZ3JlZW4nXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tOYW1lKG5hbWU6IHN0cmluZykge1xyXG5cdFx0aWYodHlwZW9mKG5hbWUpID09PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMTIpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fSBlbHNlIGlmIChuYW1lLmxlbmd0aCA8IDMpIHtcclxuXHRcdFx0XHRyZXR1cm4gMjtcclxuXHRcdFx0fSBlbHNlIGlmIChuYW1lLnN1YnN0cmluZygwLCAzKSA9PT0gJ01vZCcpIHtcclxuXHRcdFx0XHRyZXR1cm4gMztcclxuXHRcdFx0fVxyXG5cdFx0XHQkLmVhY2godGhpcy5ub3RBbGxvd2VkLCBmdW5jdGlvbiAoa2V5Om51bWJlciwgdmFsdWU6YW55KSB7XHJcblx0XHRcdFx0dmFyIGRlY29kZSA9IGF0b2IodmFsdWUpO1xyXG5cdFx0XHRcdGlmIChuYW1lLmluZGV4T2YoZGVjb2RlKSA+IC0xKVxyXG5cdFx0XHRcdFx0cmV0dXJuIDQ7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIDU7XHJcblx0fVxyXG5cdHVuYXZhaWxhYmxlKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbChtZXNzYWdlKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHRjb2xvcjogJ3JlZCdcclxuXHRcdFx0fSk7XHJcblx0fVxyXG59IiwiY2xhc3MgTm90aWZpY2F0aW9ucyB7XHJcbiAgICBlbGVtZW50czogYW55ID0ge307XHJcbiAgICBwYXRoczogYW55ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnBhdGhzID0ge1xyXG4gICAgICAgICAgICBtYXJrUmVhZDogJy9ub3RpZmljYXRpb25zL21hcmstcmVhZCdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoXCJbcnQtaG9vaz0naG9vayFub3RpZmljYXRpb25zOm1hcmsucmVhZCddXCIpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlLnRhcmdldC5hdHRyKCdydC1kYXRhJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwidmFyIHJhZGlvO1xyXG52YXIgY2hhdGJveDtcclxuY2xhc3MgUmFkaW8ge1xyXG5cdGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuXHRwb3B1cDogYW55ID0gbnVsbDtcclxuXHRzdGF0dXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRzdGF0dXNDbG9zZWQ6IHN0cmluZyA9ICcnO1xyXG5cdHN0YXR1c09wZW46IHN0cmluZyA9ICcnO1xyXG5cdFVSTDogc3RyaW5nID0gJyc7XHJcblx0dmFyTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblx0dmFyU3RhdHVzOiBzdHJpbmcgPSAnJztcclxuXHJcblx0b25saW5lOiBib29sZWFuID0gdHJ1ZTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuVVJMID0gJ2h0dHA6Ly9hcHBzLnN0cmVhbWxpY2Vuc2luZy5jb20vcGxheWVyLXBvcHVwLnBocD9zaWQ9MjU3OSZzdHJlYW1faWQ9NDM4Nic7XHJcblx0XHR0aGlzLnN0YXR1c0Nsb3NlZCA9ICd0byBsaXN0ZW4gdG8gUnVuZVRpbWUgUmFkaW8hJztcclxuXHRcdHRoaXMuc3RhdHVzT3BlbiA9ICd0byBjbG9zZSBSdW5lVGltZSBSYWRpbyc7XHJcblx0XHR0aGlzLnZhck1lc3NhZ2UgPSAnI3JhZGlvLW1lc3NhZ2UnO1xyXG5cdFx0dGhpcy52YXJTdGF0dXMgPSAnI3JhZGlvLXN0YXR1cyc7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0c3RhdHVzTWVzc2FnZTogJyNyYWRpby1zdGF0dXMtbWVzc2FnZSdcclxuXHRcdH07XHJcblx0XHQkKCcjcmFkaW8tbGluaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighcmFkaW8uc3RhdHVzKSB7XHJcblx0XHRcdFx0cmFkaW8ub3BlblJhZGlvKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmFkaW8uY2xvc2VSYWRpbygpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1oaXN0b3J5JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLm9wZW5IaXN0b3J5KCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1yZXF1ZXN0JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJhZGlvLm9wZW5SZXF1ZXN0KCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby10aW1ldGFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblRpbWV0YWJsZSgpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI3B1bGwtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8uaGlkZVB1bGwoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRjbG9zZVJhZGlvKCkge1xyXG5cdFx0aWYodGhpcy5wb3B1cCkge1xyXG5cdFx0XHR0aGlzLnBvcHVwLmNsb3NlKCk7XHJcblx0XHR9XHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c0Nsb3NlZCk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IGZhbHNlO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cylcclxuXHRcdFx0LnJlbW92ZUNsYXNzKCd0ZXh0LXN1Y2Nlc3MnKVxyXG5cdFx0XHQuYWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJylcclxuXHRcdFx0Lmh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T2ZmXCIpO1xyXG5cdH1cclxuXHJcblx0b3BlblJhZGlvKCkge1xyXG5cdFx0aWYodGhpcy5vbmxpbmUgIT09IHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR0aGlzLm9ubGluZVNldHRpbmdzKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLnBvcHVwID0gd2luZG93Lm9wZW4odGhpcy5VUkwsICdSdW5lVGltZSBSYWRpbycsICd3aWR0aD0zODksaGVpZ2h0PTM1OScpO1xyXG5cdFx0dGhpcy5zdGF0dXMgPSB0cnVlO1xyXG5cdFx0JCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNPcGVuKTtcclxuXHRcdCQodGhpcy52YXJTdGF0dXMpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygndGV4dC1kYW5nZXInKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpLlxyXG5cdFx0XHRodG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9uXCIpO1xyXG5cdFx0dmFyIHBvbGxUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHJhZGlvLnBvcHVwLmNsb3NlZCAhPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xyXG5cdFx0XHRcdHJhZGlvLmNsb3NlUmFkaW8oKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRvcGVuSGlzdG9yeSgpIHtcclxuXHRcdHZhciBoaXN0b3J5ID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL2hpc3RvcnknKTtcclxuXHRcdGhpc3RvcnkuZG9uZShmdW5jdGlvbihoaXN0b3J5KSB7XHJcblx0XHRcdGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuXHRcdFx0dmFyIG11c2ljID0gbnVsbCxcclxuXHRcdFx0XHRodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlJz48dGhlYWQ+PHRyPjx0ZD5UaW1lPC90ZD48dGQ+QXJ0aXN0PC90ZD48dGQ+TmFtZTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IGhpc3RvcnkubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0bXVzaWMgPSBoaXN0b3J5W3hdO1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ub3BlblB1bGwoaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdG9wZW5UaW1ldGFibGUoKSB7XHJcblx0XHR2YXIgdGltZXRhYmxlID0gdXRpbGl0aWVzLmdldEFKQVgoJ3JhZGlvL3RpbWV0YWJsZScpO1xyXG5cdFx0dGltZXRhYmxlLmRvbmUoZnVuY3Rpb24odGltZXRhYmxlKSB7XHJcblx0XHRcdHRpbWV0YWJsZSA9ICQucGFyc2VKU09OKHRpbWV0YWJsZSk7XHJcblx0XHRcdHZhciBodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlIHRleHQtY2VudGVyJz48dGhlYWQ+PHRyPjx0ZD4mbmJzcDs8L3RkPjx0ZD5Nb25kYXk8L3RkPjx0ZD5UdWVzZGF5PC90ZD48dGQ+V2VkbmVzZGF5PC90ZD48dGQ+VGh1cnNkYXk8L3RkPjx0ZD5GcmlkYXk8L3RkPjx0ZD5TYXR1cmRheTwvdGQ+PHRkPlN1bmRheTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IDIzOyB4IDw9IHk7IHgrKykge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgeCArIFwiOjAwPC90ZD5cIjtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gNjsgaSA8PSBqOyBpKyspIHtcclxuXHRcdFx0XHRcdGh0bWwgKz0gXCI8dGQ+XCI7XHJcblx0XHRcdFx0XHRpZih0aW1ldGFibGVbaV0gIT09IHVuZGVmaW5lZCAmJiB0aW1ldGFibGVbaV1beF0gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IHRpbWV0YWJsZVtpXVt4XTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGh0bWwgKz0gXCImbmJzcDtcIjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGh0bWwgKz0gXCI8L3RkPlwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRodG1sICs9IFwiPC90cj5cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRodG1sICs9IFwiPC90Ym9keT48L3RhYmxlPlwiO1xyXG5cdFx0XHRyYWRpby5vcGVuUHVsbChodG1sKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0b3BlblJlcXVlc3QoKSB7XHJcblx0XHR2YXIgcmVxdWVzdCA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnKTtcclxuXHRcdHJlcXVlc3QuZG9uZShmdW5jdGlvbihyZXF1ZXN0KSB7XHJcblx0XHRcdHJlcXVlc3QgPSAkLnBhcnNlSlNPTihyZXF1ZXN0KTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAyKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxmb3JtIHJvbGU9J2Zvcm0nPjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtYXJ0aXN0Jz5BcnRpc3QgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LWFydGlzdCcgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1hcnRpc3QnIHBsYWNlaG9sZGVyPSdBcnRpc3QgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48bGFiZWwgZm9yPSdyZXF1ZXN0LW5hbWUnPlNvbmcgTmFtZTwvbGFiZWw+PGlucHV0IHR5cGU9J3RleHQnIGlkPSdyZXF1ZXN0LW5hbWUnIGNsYXNzPSdmb3JtLWNvbnRyb2wnIG5hbWU9J3JlcXVlc3QtbmFtZScgcGxhY2Vob2xkZXI9J1NvbmcgTmFtZScgcmVxdWlyZWQgLz48L2Rpdj48ZGl2IGNsYXNzPSdmb3JtLWdyb3VwJz48cCBpZD0ncmVxdWVzdC1idXR0b24nIGNsYXNzPSdidG4gYnRuLXByaW1hcnknPlJlcXVlc3Q8L3A+PC9kaXY+PC9mb3JtPlwiO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5yZXNwb25zZSA9PT0gMSkge1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8cCBjbGFzcz0ndGV4dC13YXJuaW5nJz5BdXRvIERKIGN1cnJlbnRseSBkb2VzIG5vdCBhY2NlcHQgc29uZyByZXF1ZXN0cywgc29ycnkhXCI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+WW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHJlcXVlc3QgYSBzb25nIGZyb20gdGhlIERKLjwvcD5cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRyYWRpby5vcGVuUHVsbChodG1sKTtcclxuXHRcdH0pO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNyZXF1ZXN0LWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRyYWRpby5zZW5kUmVxdWVzdCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sIDMwMDApO1xyXG5cdH1cclxuXHJcblx0c2VuZFJlcXVlc3QoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0XHQnYXJ0aXN0JzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtYXJ0aXN0JykudmFsdWUsXHJcblx0XHRcdFx0J25hbWUnOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVxdWVzdC1uYW1lJykudmFsdWVcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udGVudHM7XHJcblx0XHRjb250ZW50cyA9IHV0aWxpdGllcy5wb3N0QUpBWCgncmFkaW8vcmVxdWVzdC9zb25nJywgZGF0YSk7XHJcblx0XHRjb250ZW50cy5kb25lKGZ1bmN0aW9uKGNvbnRlbnRzKSB7XHJcblx0XHRcdGNvbnRlbnRzID0gJC5wYXJzZUpTT04oY29udGVudHMpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKGNvbnRlbnRzLnNlbnQgPT09IHRydWUpIHtcclxuXHRcdFx0XHRodG1sID0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5Zb3VyIHJlcXVlc3QgaGFzIGJlZW4gc2VudCB0byB0aGUgREo8L3A+XCI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aHRtbCA9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5UaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QuICBUcnkgYWdhaW4/XCI7XHJcblx0XHRcdH1cclxuXHRcdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLmhpZGVQdWxsKCk7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0b3BlblB1bGwoY29udGVudHM6IHN0cmluZykge1xyXG5cdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdCQoJyNyYWRpby1wdWxsJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnNTAlJ1xyXG5cdFx0XHR9KTtcclxuXHRcdCQoJyNyYWRpby1vcHRpb25zJykuY3NzKHtcclxuXHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGhpZGVQdWxsKCkge1xyXG5cdFx0JCgnI3B1bGwtY29udGVudHMnKS5odG1sKCcmbmJzcDsnKTtcclxuXHRcdCQoJyNyYWRpby1wdWxsJykud2lkdGgoJycpLlxyXG5cdFx0XHRhZGRDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcwJSdcclxuXHRcdFx0fSk7XHJcblx0XHQkKCcjcmFkaW8tb3B0aW9ucycpLndpZHRoKCcnKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHR3aWR0aDogJzEwMCUnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9ubGluZVNldHRpbmdzKCkge1xyXG5cdFx0aWYodGhpcy5vbmxpbmUgIT09IHRydWUpIHtcclxuXHRcdFx0dGhpcy5jbG9zZVJhZGlvKCk7XHJcblx0XHRcdCQodGhpcy5lbGVtZW50cy5zdGF0dXNNZXNzYWdlKS5odG1sKFwiVGhlIHJhZGlvIGhhcyBiZWVuIHNldCBvZmZsaW5lLlwiKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQodGhpcy5lbGVtZW50cy5zdGF0dXNNZXNzYWdlKS5odG1sKFwiXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge1xyXG5cdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwoJycpO1xyXG5cdFx0dmFyIHVwZGF0ZSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby91cGRhdGUnKTtcclxuXHRcdHVwZGF0ZS5kb25lKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG5cdFx0XHR1cGRhdGUgPSAkLnBhcnNlSlNPTih1cGRhdGUpO1xyXG5cdFx0XHR2YXIgcmVxdWVzdHNIVE1MID0gXCJcIjtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctbmFtZScpLmh0bWwodXBkYXRlWydzb25nJ11bJ25hbWUnXSk7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLWFydGlzdCcpLmh0bWwodXBkYXRlWydzb25nJ11bJ2FydGlzdCddKTtcclxuXHRcdFx0aWYodXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJBdXRvIERKXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKHVwZGF0ZVsnbWVzc2FnZSddICE9PSAnJyAmJiB1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gLTEpIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKHVwZGF0ZVsnbWVzc2FnZSddKTtcclxuXHRcdFx0fSBlbHNlIGlmKHVwZGF0ZVsnbWVzc2FnZSddID09PSAtMSkge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwoXCJESiBcIiArIHVwZGF0ZVsnZGonXSArIFwiIGlzIGN1cnJlbnRseSBvbiBhaXIhXCIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoXCJbcnQtZGF0YT0ncmFkaW86bWVzc2FnZS5jb250ZW50cyddXCIpLmh0bWwoXCJBdXRvIERKIGlzIGN1cnJlbnRseSBvbiBhaXJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IHVwZGF0ZVsncmVxdWVzdHMnXS5sZW5ndGg7IHggPCB5OyB4KyspIHtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9IHVwZGF0ZVsncmVxdWVzdHMnXVt4XTtcclxuXHRcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PSAwKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cD5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMSkge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+XCI7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09IDIpIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwIGNsYXNzPSd0ZXh0LXdhcm5pbmcnPlwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gcmVxdWVzdC5zb25nX25hbWUgKyBcIiBieSBcIiArIHJlcXVlc3Quc29uZ19hcnRpc3Q7XHJcblx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPC9wPlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKHJlcXVlc3RzSFRNTCk7XHJcblxyXG5cdFx0XHRyYWRpby5vbmxpbmUgPSB1cGRhdGUub25saW5lO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJhZGlvLnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAzMDAwMCk7XHJcblx0XHRcdHJhZGlvLm9ubGluZVNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbnVwRm9ybTtcclxuY2xhc3MgU2lnbnVwRm9ybSB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGRpc3BsYXlOYW1lOiAnI2Rpc3BsYXlfbmFtZScsXHJcblx0XHRcdGVtYWlsOiAnI2VtYWlsJyxcclxuXHRcdFx0cGFzc3dvcmQ6ICcjcGFzc3dvcmQnLFxyXG5cdFx0XHRwYXNzd29yZDI6ICcjcGFzc3dvcmQyJyxcclxuXHRcdFx0c2VjdXJpdHlDaGVjazogJyNzZWN1cml0eSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjaGVja0F2YWlsYWJpbGl0eTogJy9nZXQvc2lnbnVwLydcclxuXHRcdH07XHJcblx0XHR2YXIgc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCxcclxuXHRcdFx0dGltZW91dCA9IDUwMDtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2Rpc3BsYXlfbmFtZScpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVtYWlsKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0VtYWlsKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdFbWFpbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5KCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJ2Zvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5zdWJtaXQoZSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrQXZhaWxhYmlsaXR5KGZpZWxkOiBzdHJpbmcpIHtcclxuXHRcdHZhciB2YWwgPSAkKCcjJyArIGZpZWxkKS52YWwoKTtcclxuXHRcdGlmKHZhbC5sZW5ndGggPT09IDApXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdHZhciB1cmwgPSB0aGlzLnBhdGhzLmNoZWNrQXZhaWxhYmlsaXR5ICsgZmllbGQ7XHJcblx0XHR2YXIgYXZhaWxhYmxlO1xyXG5cdFx0aWYoZmllbGQgPT09IFwiZGlzcGxheV9uYW1lXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBkaXNwbGF5X25hbWU6IHZhbCB9KTtcclxuXHRcdH0gZWxzZSBpZihmaWVsZCA9PT0gXCJlbWFpbFwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZW1haWw6IHZhbCB9KTtcclxuXHRcdH1cclxuXHRcdGF2YWlsYWJsZS5kb25lKGZ1bmN0aW9uKGF2YWlsYWJsZTogc3RyaW5nKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5KU09ORGVjb2RlKGF2YWlsYWJsZSk7XHJcblx0XHRcdGlmKGF2YWlsYWJsZS5hdmFpbGFibGUgPT09IHRydWUpIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tQYXNzd29yZCgpIHtcclxuXHRcdHZhciB2MSA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkudmFsKCksXHJcblx0XHRcdHYyID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikudmFsKCk7XHJcblx0XHRpZih2Mi5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGlmKHYxID09PSB2Mikge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgdHJ1ZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgdHJ1ZSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCBmYWxzZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgZmFsc2UpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hlY2tTZWN1cml0eSgpIHtcclxuXHRcdHZhciBzbGlkZXJWYWwgPSAkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykudmFsKCk7XHJcblx0XHRpZihzbGlkZXJWYWwgPD0gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ25vbmUnXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIGlmKHNsaWRlclZhbCA+IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdibG9jaydcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdWJtaXQoZTogYW55KSB7XHJcblx0XHR2YXIgdXNlcm5hbWUgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCd1c2VybmFtZScpLFxyXG5cdFx0XHRlbWFpbCA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyksXHJcblx0XHRcdHBhc3MgPSB0aGlzLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdGlmKHVzZXJuYW1lID09PSB0cnVlICYmIGVtYWlsID09PSB0cnVlICYmIHBhc3MgPT09IHRydWUpIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRvZ2dsZUZlZWRiYWNrKGZpZWxkOiBzdHJpbmcsIHN0YXR1czogYm9vbGVhbikge1xyXG5cdFx0aWYoc3RhdHVzID09PSB0cnVlKSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsImNsYXNzIFN0YWZmTGlzdCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB2YXIgbWVtYmVycyA9ICQoXCJbcnQtaG9vaz0naG9vayFzdGFmZi5saXN0OmNhcmQnXVwiKTtcclxuICAgICAgICAkLmVhY2gobWVtYmVycywgZnVuY3Rpb24oaW5kZXg6IG51bWJlciwgdmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodmFsKS5hdHRyKCdydC1kYXRhJyk7XHJcbiAgICAgICAgICAgICQodmFsKS5maW5kKCcuZnJvbnQnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgnL2ltZy9mb3J1bXMvcGhvdG9zL1wiICsgaWQgKyBcIi5wbmcnKVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKHZhbCkuYmluZCgndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnaG92ZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgdXRpbGl0aWVzO1xyXG5jbGFzcyBVdGlsaXRpZXMge1xyXG4gICAgcHVibGljIGdldEFKQVgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogcGF0aCxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnaHRtbCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcG9zdEFKQVgocGF0aDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBkYXRhLl90b2tlbiA9ICQoJ21ldGFbbmFtZT1cIl90b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBwYXRoLFxyXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdGltZUFnbyh0czogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5vd1RzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBub3dUcyAtIHRzO1xyXG4gICAgICAgIGlmKHNlY29uZHMgPiAyICogMjQgKiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImEgZmV3IGRheXMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAyNCAqIDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwieWVzdGVyZGF5XCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiA3MjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNlY29uZHMgLyAzNjAwKSArIFwiIGhvdXJzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbiBob3VyIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID49IDEyMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApICsgXCIgbWludXRlcyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+PSA2MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIxIG1pbnV0ZSBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKyBcIiBzZWNvbmRzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjEgc2Vjb25kIGFnb1wiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjdXJyZW50VGltZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgSlNPTkRlY29kZShqc29uOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gJC5wYXJzZUpTT04oanNvbik7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2Nyb2xsVG8oZWxlbWVudDogYW55LCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcDogJChlbGVtZW50KS5vZmZzZXQoKS50b3BcclxuICAgICAgICB9LCB0aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9ybVRva2VuKHRva2VuOiBzdHJpbmcpIHtcclxuICAgICAgICB0b2tlbiA9IGF0b2IodG9rZW4pO1xyXG4gICAgICAgICQoJ2Zvcm0nKS5hcHBlbmQoXCI8aW5wdXQgdHlwZT0naGlkZGVuJyBuYW1lPSdfdG9rZW4nIHZhbHVlPSdcIiArIHRva2VuICsgXCInIC8+XCIpO1xyXG4gICAgfVxyXG59XHJcbnV0aWxpdGllcyA9IG5ldyBVdGlsaXRpZXMoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=