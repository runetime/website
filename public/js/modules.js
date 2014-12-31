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
    return Utilities;
})();
utilities = new Utilities();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY2hhdGJveC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29tYmF0Y2FsY3VsYXRvci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvY29udGFjdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvZm9ydW1zLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9saXZlc3RyZWFtLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9tYWluLnRzIiwiYzovdmFncmFudC9wcm9qZWN0cy9wZXJzb25hbC9ydW5ldGltZS9uYW1lY2hlY2tlci50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbmV3cy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvbm90aWZpY2F0aW9ucy50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvcmFkaW8udHMiLCJjOi92YWdyYW50L3Byb2plY3RzL3BlcnNvbmFsL3J1bmV0aW1lL3NpZ251cC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvc3RhZmZfbGlzdC50cyIsImM6L3ZhZ3JhbnQvcHJvamVjdHMvcGVyc29uYWwvcnVuZXRpbWUvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIkNhbGN1bGF0b3IiLCJDYWxjdWxhdG9yLmNvbnN0cnVjdG9yIiwiQ2FsY3VsYXRvci5jYWxjdWxhdGVYUCIsIkNhbGN1bGF0b3IuY2FsY3VsYXRlTGV2ZWwiLCJDYWxjdWxhdG9yLmdldEluZm8iLCJDYWxjdWxhdG9yLmxvYWRDYWxjIiwiQ2FsY3VsYXRvci51cGRhdGVDYWxjIiwiQ2hhdGJveCIsIkNoYXRib3guY29uc3RydWN0b3IiLCJDaGF0Ym94LmFkZE1lc3NhZ2UiLCJDaGF0Ym94LmRpc3BsYXlNZXNzYWdlIiwiQ2hhdGJveC5kaXNwbGF5TWVzc2FnZXMiLCJDaGF0Ym94LmVycm9yIiwiQ2hhdGJveC5nZXRTdGFydCIsIkNoYXRib3gubW9kIiwiQ2hhdGJveC5tb2RUb29scyIsIkNoYXRib3gucGFuZWxDaGFubmVscyIsIkNoYXRib3gucGFuZWxDaGF0IiwiQ2hhdGJveC5wYW5lbENsb3NlIiwiQ2hhdGJveC5zdWJtaXRNZXNzYWdlIiwiQ2hhdGJveC5zd2l0Y2hDaGFubmVsIiwiQ2hhdGJveC51cGRhdGUiLCJDaGF0Ym94LnVwZGF0ZVRpbWVBZ28iLCJDb21iYXRDYWxjdWxhdG9yIiwiQ29tYmF0Q2FsY3VsYXRvci5jb25zdHJ1Y3RvciIsIkNvbWJhdENhbGN1bGF0b3IuZ2V0TGV2ZWxzIiwiQ29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCIsIkNvbWJhdENhbGN1bGF0b3IudmFsIiwiQ29udGFjdCIsIkNvbnRhY3QuY29uc3RydWN0b3IiLCJDb250YWN0LmRvbmUiLCJDb250YWN0LmVycm9yIiwiQ29udGFjdC5zZW5kIiwiQ29udGFjdC52YWxpZGF0ZUVtYWlsIiwiQ29udGFjdC53YXJuaW5nIiwiRm9ydW1zIiwiRm9ydW1zLmNvbnN0cnVjdG9yIiwiRm9ydW1zLmRvd252b3RlIiwiRm9ydW1zLnBvbGxWb3RlIiwiRm9ydW1zLnVwdm90ZSIsIlBvc3QiLCJQb3N0LmNvbnN0cnVjdG9yIiwiUG9zdC5xdW90ZSIsIkZvcnVtc1RocmVhZENyZWF0ZSIsIkZvcnVtc1RocmVhZENyZWF0ZS5jb25zdHJ1Y3RvciIsIkZvcnVtc1RocmVhZENyZWF0ZS5hZGRRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5yZW1vdmVRdWVzdGlvbiIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lciIsIkZvcnVtc1RocmVhZENyZWF0ZS5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uIiwiTGl2ZXN0cmVhbVJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LmNvbnN0cnVjdG9yIiwiTGl2ZXN0cmVhbVJlc2V0LnJlc2V0IiwiTGl2ZXN0cmVhbVJlc2V0LnNwaW5uZXJSZW1vdmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzZXMiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzT2ZmbGluZSIsIkxpdmVzdHJlYW1SZXNldC5zdGF0dXNPbmxpbmUiLCJMaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93biIsIlJ1bmVUaW1lIiwiUnVuZVRpbWUuY29uc3RydWN0b3IiLCJOYW1lQ2hlY2tlciIsIk5hbWVDaGVja2VyLmNvbnN0cnVjdG9yIiwiTmFtZUNoZWNrZXIuY2hlY2siLCJOYW1lQ2hlY2tlci5hdmFpbGFibGUiLCJOYW1lQ2hlY2tlci5jaGVja05hbWUiLCJOYW1lQ2hlY2tlci51bmF2YWlsYWJsZSIsIk5ld3MiLCJOZXdzLmNvbnN0cnVjdG9yIiwiTmV3cy5zZXR1cEFjdGlvbnMiLCJOZXdzLnN1Ym1pdENvbW1lbnQiLCJOb3RpZmljYXRpb25zIiwiTm90aWZpY2F0aW9ucy5jb25zdHJ1Y3RvciIsIlJhZGlvIiwiUmFkaW8uY29uc3RydWN0b3IiLCJSYWRpby5vcGVuSGlzdG9yeSIsIlJhZGlvLm9wZW5UaW1ldGFibGUiLCJSYWRpby5vbmxpbmVTZXR0aW5ncyIsIlJhZGlvLnB1bGxIaWRlIiwiUmFkaW8ucHVsbE9wZW4iLCJSYWRpby5yYWRpb0Nsb3NlIiwiUmFkaW8ucmFkaW9PcGVuIiwiUmFkaW8ucmVxdWVzdE9wZW4iLCJSYWRpby5yZXF1ZXN0U2VuZCIsIlJhZGlvLnVwZGF0ZSIsIlNpZ251cEZvcm0iLCJTaWdudXBGb3JtLmNvbnN0cnVjdG9yIiwiU2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSIsIlNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCIsIlNpZ251cEZvcm0uY2hlY2tTZWN1cml0eSIsIlNpZ251cEZvcm0uc3VibWl0IiwiU2lnbnVwRm9ybS50b2dnbGVGZWVkYmFjayIsIlN0YWZmTGlzdCIsIlN0YWZmTGlzdC5jb25zdHJ1Y3RvciIsIlV0aWxpdGllcyIsIlV0aWxpdGllcy5jb25zdHJ1Y3RvciIsIlV0aWxpdGllcy5jdXJyZW50VGltZSIsIlV0aWxpdGllcy5mb3JtVG9rZW4iLCJVdGlsaXRpZXMuZ2V0QUpBWCIsIlV0aWxpdGllcy5KU09ORGVjb2RlIiwiVXRpbGl0aWVzLnBvc3RBSkFYIiwiVXRpbGl0aWVzLnNjcm9sbFRvIiwiVXRpbGl0aWVzLnRpbWVBZ28iXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxDQUFDO0FBQ2YsSUFBTSxVQUFVO0lBTVpBLFNBTkVBLFVBQVVBLENBTU9BLElBQVNBO1FBQVRDLFNBQUlBLEdBQUpBLElBQUlBLENBQUtBO1FBSjVCQSxhQUFRQSxHQUFRQSxFQUFFQSxDQUFDQTtRQUNuQkEsU0FBSUEsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDZkEsUUFBR0EsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFDZEEsVUFBS0EsR0FBUUEsRUFBRUEsQ0FBQ0E7UUFFWkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0E7WUFDWkEsU0FBU0EsRUFBRUEsd0JBQXdCQTtZQUNuQ0EsV0FBV0EsRUFBRUEsMEJBQTBCQTtZQUN2Q0EsTUFBTUEsRUFBRUEsb0JBQW9CQTtZQUM1QkEsS0FBS0EsRUFBRUEseUJBQXlCQTtZQUNoQ0EsV0FBV0EsRUFBRUEsMEJBQTBCQTtTQUMxQ0EsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0E7WUFDUEEsT0FBT0EsRUFBRUEsbUJBQW1CQTtZQUM1QkEsT0FBT0EsRUFBRUEsY0FBY0E7U0FDMUJBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBO1lBQ1JBLFlBQVlBLEVBQUVBLENBQUNBO1lBQ2ZBLFdBQVdBLEVBQUVBLENBQUNBO1lBQ2RBLFNBQVNBLEVBQUVBLENBQUNBO1lBQ1pBLFFBQVFBLEVBQUVBLENBQUNBO1NBQ2RBLENBQUNBO1FBQ0ZBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3ZCQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQTtZQUNsQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUNoQkEsQ0FBQ0EsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNoQyxVQUFVLENBQUM7Z0JBQ1AsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzVCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDUEEsQ0FBQ0E7SUFFSkQsZ0NBQVdBLEdBQVhBLFVBQVlBLEtBQWFBO1FBQ3hCRSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUNaQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNQQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxLQUFLQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUMvQkEsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUVERixtQ0FBY0EsR0FBZEEsVUFBZUEsRUFBVUE7UUFDeEJHLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLEVBQ1pBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ1BBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBO1lBQzdCQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsREEsRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7Z0JBQzdCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNWQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDZkEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDWkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRUgsNEJBQU9BLEdBQVBBO1FBQ0lJLElBQUlBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3BEQSxJQUFJQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxHQUFHQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM1REEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsSUFBU0E7WUFDM0IsSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZ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Q0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDN0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDakMsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDM0IsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDMUIsVUFBVSxDQUFDO2dCQUNWLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FB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Q3JEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxFQUFFQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsT0FBT0EsR0FBR0EsY0FBY0EsQ0FBQ0E7UUFDcENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ0pBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBO1FBQzFCQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNMUixnQkFBQ0E7QUFBREEsQ0FqRUEsQUFpRUNBLElBQUE7QUFDRCxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhbGN1bGF0b3I7XHJcbmNsYXNzIENhbGN1bGF0b3Ige1xyXG4gICAgY2FsY3VsYXRvcjogYW55O1xyXG4gICAgZWxlbWVudHM6IGFueSA9IHt9O1xyXG4gICAgaW5mbzogYW55ID0ge307XHJcbiAgICBVUkw6IGFueSA9IHt9O1xyXG4gICAgaXRlbXM6IGFueSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbGM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRYUDogJyNjYWxjdWxhdG9yLWN1cnJlbnQteHAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJyNjYWxjdWxhdG9yLWRpc3BsYXktbmFtZScsXHJcbiAgICAgICAgICAgIHN1Ym1pdDogJyNjYWxjdWxhdG9yLXN1Ym1pdCcsXHJcbiAgICAgICAgICAgIHRhYmxlOiAnI2NhbGN1bGF0b3ItdGFibGUgdGJvZHknLFxyXG4gICAgICAgICAgICB0YXJnZXRMZXZlbDogJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuVVJMID0ge1xyXG4gICAgICAgICAgICBnZXRDYWxjOiAnL2NhbGN1bGF0b3JzL2xvYWQnLFxyXG4gICAgICAgICAgICBnZXRJbmZvOiAnL2dldC9oaXNjb3JlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pbmZvID0ge1xyXG4gICAgICAgICAgICBsZXZlbEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIGxldmVsVGFyZ2V0OiAwLFxyXG4gICAgICAgICAgICBYUEN1cnJlbnQ6IDAsXHJcbiAgICAgICAgICAgIFhQVGFyZ2V0OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0b3IgPSBjYWxjO1xyXG4gICAgICAgICQodGhpcy5lbGVtZW50cy5zdWJtaXQpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYWxjdWxhdG9yLmdldEluZm8oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxvYWRDYWxjKCk7XHJcbiAgICAgICAgJCgnI2NhbGN1bGF0b3ItdGFyZ2V0LWxldmVsJykua2V5dXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuICAgICAgICAgICAgfSwgMjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHRjYWxjdWxhdGVYUChsZXZlbDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCBsZXZlbDsgaSArPSAxKSB7XHJcblx0XHRcdHRvdGFsICs9IE1hdGguZmxvb3IoaSArIDMwMCAqIE1hdGgucG93KDIsIGkgLyA3LjApKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBNYXRoLmZsb29yKHRvdGFsIC8gNCk7XHJcblx0fVxyXG5cclxuXHRjYWxjdWxhdGVMZXZlbCh4cDogbnVtYmVyKSB7XHJcblx0XHR2YXIgdG90YWwgPSAwLFxyXG5cdFx0XHRpID0gMDtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCAxMjA7IGkgKz0gMSkge1xyXG5cdFx0XHR0b3RhbCArPSBNYXRoLmZsb29yKGkgKyAzMDAgKyBNYXRoLnBvdygyLCBpIC8gNykpO1xyXG5cdFx0XHRpZihNYXRoLmZsb29yKHRvdGFsIC8gNCkgPiB4cClcclxuXHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0ZWxzZSBpZihpID49IDk5KVxyXG5cdFx0XHRcdHJldHVybiA5OTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICB2YXIgbmFtZSA9ICQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkudmFsKCk7XHJcblx0XHR2YXIgaW5mbyA9IHV0aWxpdGllcy5nZXRBSkFYKHRoaXMuVVJMLmdldEluZm8gKyAnLycgKyBuYW1lKTtcclxuXHRcdGluZm8uZG9uZShmdW5jdGlvbihpbmZvOiBhbnkpIHtcclxuXHRcdFx0aW5mbyA9ICQucGFyc2VKU09OKGluZm8pO1xyXG5cdFx0XHR2YXIgcmVsZXZhbnQgPSBpbmZvWzEzXTtcclxuXHRcdFx0Y2FsY3VsYXRvci5pbmZvLmxldmVsQ3VycmVudCA9IHJlbGV2YW50WzFdO1xyXG5cdFx0XHRjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50ID0gcmVsZXZhbnRbMl07XHJcblx0XHRcdCQoY2FsY3VsYXRvci5lbGVtZW50cy5jdXJyZW50WFApLnZhbChjYWxjdWxhdG9yLmluZm8uWFBDdXJyZW50KTtcclxuXHRcdFx0aWYoJChjYWxjdWxhdG9yLmVsZW1lbnRzLnRhcmdldExldmVsKS52YWwoKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFyZ2V0TGV2ZWwpLnZhbChwYXJzZUludChjYWxjdWxhdG9yLmluZm8ubGV2ZWxDdXJyZW50LCAxMCkgKyAxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWxjdWxhdG9yLnVwZGF0ZUNhbGMoKTtcclxuXHRcdH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDYWxjKCkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge2lkOiB0aGlzLmNhbGN1bGF0b3J9O1xyXG4gICAgICAgIHZhciBpbmZvID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMuVVJMLmdldENhbGMsIGRhdGEpO1xyXG4gICAgICAgIGluZm8uZG9uZShmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgIGluZm8gPSB1dGlsaXRpZXMuSlNPTkRlY29kZShpbmZvKTtcclxuICAgICAgICAgICAgY2FsY3VsYXRvci5pdGVtcyA9IGluZm87XHJcbiAgICAgICAgICAgICQuZWFjaChjYWxjdWxhdG9yLml0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZD5cIiArIGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLm5hbWUgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPlwiICsgY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ueHAgKyBcIjwvdGQ+XCI7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRkPiZpbmZpbjs8L3RkPlwiO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjwvdHI+XCI7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ2FsYygpIHtcclxuICAgICAgICB2YXIgbGV2ZWxDdXJyZW50ID0gMCxcclxuICAgICAgICAgICAgbGV2ZWxUYXJnZXQgPSAwLFxyXG4gICAgICAgICAgICB4cEN1cnJlbnQgPSAwLFxyXG4gICAgICAgICAgICB4cFRhcmdldCA9IDAsXHJcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgPSAwLFxyXG4gICAgICAgICAgICBhbW91bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuaW5mby5sZXZlbFRhcmdldCA9IHBhcnNlSW50KCQoJyNjYWxjdWxhdG9yLXRhcmdldC1sZXZlbCcpLnZhbCgpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmluZm8ubGV2ZWxUYXJnZXQpO1xyXG4gICAgICAgIHRoaXMuaW5mby5YUFRhcmdldCA9IHRoaXMuY2FsY3VsYXRlWFAodGhpcy5pbmZvLmxldmVsVGFyZ2V0KTtcclxuICAgICAgICBpZih0aGlzLmluZm8uWFBDdXJyZW50ID4gdGhpcy5pbmZvLlhQVGFyZ2V0KVxyXG4gICAgICAgICAgICB0aGlzLmluZm8uWFBUYXJnZXQgPSB0aGlzLmNhbGN1bGF0ZVhQKHBhcnNlSW50KHRoaXMuaW5mby5sZXZlbEN1cnJlbnQsIDEwKSArIDEpO1xyXG4gICAgICAgIGxldmVsQ3VycmVudCA9IHRoaXMuaW5mby5sZXZlbEN1cnJlbnQ7XHJcbiAgICAgICAgbGV2ZWxUYXJnZXQgPSB0aGlzLmluZm8ubGV2ZWxUYXJnZXQ7XHJcbiAgICAgICAgeHBDdXJyZW50ID0gdGhpcy5pbmZvLlhQQ3VycmVudDtcclxuICAgICAgICB4cFRhcmdldCA9IHRoaXMuaW5mby5YUFRhcmdldDtcclxuICAgICAgICBkaWZmZXJlbmNlID0geHBUYXJnZXQgLSB4cEN1cnJlbnQ7XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgYW1vdW50ID0gTWF0aC5jZWlsKGRpZmZlcmVuY2UgLyBjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS54cCk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGFtb3VudCA8IDAgPyAwIDogYW1vdW50O1xyXG4gICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKSB0ZDpudGgtY2hpbGQoNCknKS5odG1sKGFtb3VudCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjYWxjdWxhdG9yLml0ZW1zW2luZGV4XS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbEN1cnJlbnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXZlbFRhcmdldCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbGN1bGF0b3IuaXRlbXNbaW5kZXhdLmxldmVsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG5cXG5cXG5cXG5cIik7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPD0gbGV2ZWxDdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtc3VjY2VzcycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwgPiBsZXZlbEN1cnJlbnQgJiYgbGV2ZWxUYXJnZXQgPj0gY2FsY3VsYXRvci5pdGVtc1tpbmRleF0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICQoY2FsY3VsYXRvci5lbGVtZW50cy50YWJsZSArICcgdHI6bnRoLWNoaWxkKCcgKyAoaW5kZXggKyAxKSArICcpJykuYXR0cignY2xhc3MnLCAndGV4dC13YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGNhbGN1bGF0b3IuZWxlbWVudHMudGFibGUgKyAnIHRyOm50aC1jaGlsZCgnICsgKGluZGV4ICsgMSkgKyAnKScpLmF0dHIoJ2NsYXNzJywgJ3RleHQtZGFuZ2VyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsInZhciBjaGF0Ym94O1xyXG5jbGFzcyBDaGF0Ym94IHtcclxuXHRjaGFubmVsOiBzdHJpbmcgPSAnI3JhZGlvJztcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0bGFzdElkOiBudW1iZXIgPSAwO1xyXG5cdG1lc3NhZ2VzOiBhbnkgPSBbXTtcclxuXHRtb2RlcmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwaW5uZWQ6IGFueSA9IFtdO1xyXG5cdHRpbWVzOiBhbnkgPSB7fTtcclxuXHR0aW1lb3V0UGlubmVkOiBhbnkgPSBudWxsO1xyXG5cdHRpbWVvdXRVcGRhdGU6IGFueSA9IG51bGw7XHJcblx0VVJMOiBhbnkgPSB7fTtcclxuXHJcblx0cGlubmVkRGlzcGxheWVkOiBhbnkgPSBbXTtcclxuXHJcblx0Y29uc3RydWN0b3IocHVibGljIGNoYW5uZWw6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jaGFubmVsID0gY2hhbm5lbDtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGFjdGlvbnM6ICcjY2hhdGJveC1hY3Rpb25zJyxcclxuXHRcdFx0Y2hhbm5lbHM6ICcjY2hhdGJveC1jaGFubmVscycsXHJcblx0XHRcdGNoYXRib3g6ICcjY2hhdGJveCcsXHJcblx0XHRcdG1lc3NhZ2U6ICcjY2hhdGJveC1tZXNzYWdlJyxcclxuXHRcdFx0bWVzc2FnZXM6ICcjY2hhdGJveC1tZXNzYWdlcydcclxuXHRcdH07XHJcblx0XHR0aGlzLlVSTCA9IHtcclxuXHRcdFx0Z2V0U3RhcnQ6ICcvY2hhdC9zdGFydCcsXHJcblx0XHRcdGdldFVwZGF0ZTogJy9jaGF0L3VwZGF0ZScsXHJcblx0XHRcdHBvc3RNZXNzYWdlOiAnL2NoYXQvcG9zdC9tZXNzYWdlJyxcclxuXHRcdFx0cG9zdFN0YXR1c0NoYW5nZTogJy9jaGF0L3Bvc3Qvc3RhdHVzL2NoYW5nZSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnRpbWVzID0ge1xyXG5cdFx0XHRsYXN0QWN0aXZpdHk6IHV0aWxpdGllcy5jdXJyZW50VGltZSgpLFxyXG5cdFx0XHRsYXN0UmVmcmVzaDogdXRpbGl0aWVzLmN1cnJlbnRUaW1lKCksXHJcblx0XHRcdGxvYWRlZEF0OiB1dGlsaXRpZXMuY3VycmVudFRpbWUoKVxyXG5cdFx0fTtcclxuXHRcdHZhciBtb2RlcmF0b3IgPSB1dGlsaXRpZXMuZ2V0QUpBWCgnL2NoYXQvbW9kZXJhdG9yJyk7XHJcblx0XHRtb2RlcmF0b3IuZG9uZShmdW5jdGlvbihtb2RlcmF0b3I6IHN0cmluZykge1xyXG5cdFx0XHRtb2RlcmF0b3IgPSAkLnBhcnNlSlNPTihtb2RlcmF0b3IpO1xyXG5cdFx0XHRjaGF0Ym94Lm1vZGVyYXRvciA9IG1vZGVyYXRvci5tb2QgPT09IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucGFuZWxDaGF0KCk7XHJcblx0XHR0aGlzLmdldFN0YXJ0KCk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0aWYoZS53aGljaCA9PT0gMTMpXHJcblx0XHRcdFx0Y2hhdGJveC5zdWJtaXRNZXNzYWdlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGFubmVscykuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gucGFuZWxDaGFubmVscygpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGUoKTtcclxuXHRcdH0sIDUwMDApO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNoYXRib3gudXBkYXRlVGltZUFnbygpO1xyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWRkTWVzc2FnZShtZXNzYWdlOiBhbnkpIHtcclxuXHRcdGlmKHRoaXMubGFzdElkIDwgbWVzc2FnZS5pZCkge1xyXG5cdFx0XHR0aGlzLmxhc3RJZCA9IG1lc3NhZ2UuaWQ7XHJcblx0XHR9XHJcblx0XHRpZihtZXNzYWdlLnN0YXR1cyA8PSAxKSB7XHJcblx0XHRcdHRoaXMubWVzc2FnZXNbdGhpcy5tZXNzYWdlcy5sZW5ndGhdID0gbWVzc2FnZTtcclxuXHRcdFx0dGhpcy50aW1lcy5sYXN0QWN0aXZpdHkgPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKSB7XHJcblx0XHRpZighbWVzc2FnZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRpZiAobWVzc2FnZS5zdGF0dXMgPT09IDEpIHtcclxuXHRcdFx0aHRtbCArPSBcIjxkaXYgaWQ9J1wiICsgbWVzc2FnZS5pZCArIFwiJyBjbGFzcz0nbXNnIG1zZy1oaWRkZW4nPlwiO1xyXG5cdFx0fSBlbHNlIGlmKG1lc3NhZ2Uuc3RhdHVzID09PSAyKSB7XHJcblx0XHRcdGh0bWwgKz0gXCI8ZGl2IGlkPSdcIiArIG1lc3NhZ2UuaWQgKyBcIicgY2xhc3M9J21zZyBtc2ctcGlubmVkJz5cIjtcclxuXHRcdH0gZWxzZSBpZihtZXNzYWdlLnN0YXR1cyA9PT0gMykge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cgbXNnLXBpbmhpZCc+XCI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRodG1sICs9IFwiPGRpdiBpZD0nXCIgKyBtZXNzYWdlLmlkICsgXCInIGNsYXNzPSdtc2cnPlwiO1xyXG5cdFx0fVxyXG5cdFx0aHRtbCArPSBcIjx0aW1lIGNsYXNzPSdwdWxsLXJpZ2h0JyBkYXRhLXRzPSdcIiArIG1lc3NhZ2UuY3JlYXRlZF9hdCArIFwiJz5cIjtcclxuXHRcdGh0bWwgKz0gdXRpbGl0aWVzLnRpbWVBZ28obWVzc2FnZS5jcmVhdGVkX2F0KTtcclxuXHRcdGh0bWwgKz0gXCI8L3RpbWU+XCI7XHJcblx0XHRodG1sICs9IFwiPHA+XCI7XHJcblx0XHRpZihjaGF0Ym94Lm1vZGVyYXRvciA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRodG1sICs9IENoYXRib3gubW9kVG9vbHMobWVzc2FnZSk7XHJcblx0XHR9XHJcblx0XHRodG1sICs9IFwiPGEgY2xhc3M9J21lbWJlcnMtXCIgKyBtZXNzYWdlLmNsYXNzX25hbWUgKyBcIic+XCIgKyBtZXNzYWdlLmF1dGhvcl9uYW1lICsgXCI8L2E+OiBcIiArIG1lc3NhZ2UuY29udGVudHNfcGFyc2VkO1xyXG5cdFx0aHRtbCArPSBcIjwvcD5cIjtcclxuXHRcdGh0bWwgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlcykucHJlcGVuZChodG1sKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwbGF5TWVzc2FnZXMoKSB7XHJcblx0XHR2YXIgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKCcnKTtcclxuXHRcdCQuZWFjaChtZXNzYWdlcywgZnVuY3Rpb24oaW5kZXgsIG1lc3NhZ2UpIHtcclxuXHRcdFx0Y2hhdGJveC5kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcclxuXHRcdH0pO1xyXG5cdFx0JC5lYWNoKHRoaXMucGlubmVkLCBmdW5jdGlvbihpbmRleCwgbWVzc2FnZSkge1xyXG5cdFx0XHRpZihjaGF0Ym94LnBpbm5lZERpc3BsYXllZFttZXNzYWdlLmlkXSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkW21lc3NhZ2UuaWRdID0gdHJ1ZTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGNoYXRib3gucGlubmVkRGlzcGxheWVkID0gW107XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0U3RhcnQoKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMubWVzc2FnZXMpLmh0bWwoJycpO1xyXG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdHRpbWU6IHRoaXMudGltZXMubG9hZGVkQXQsXHJcblx0XHRcdGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdjaGF0L3N0YXJ0JywgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdCQuZWFjaChyZXN1bHRzLm1lc3NhZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNoYXRib3gucGlubmVkID0gcmVzdWx0cy5waW5uZWQ7XHJcblx0XHRcdGNoYXRib3guZGlzcGxheU1lc3NhZ2VzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBtb2QoaWQ6IGFueSwgbmV3U3RhdHVzOiBudW1iZXIpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRpZDogaWQsXHJcblx0XHRcdHN0YXR1czogbmV3U3RhdHVzXHJcblx0XHR9O1xyXG5cdFx0dmFyIHJlc3VsdHMgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L3N0YXR1cy1jaGFuZ2UnLCBkYXRhKTtcclxuXHRcdHJlc3VsdHMuZG9uZShmdW5jdGlvbihyZXN1bHRzOiBzdHJpbmcpIHtcclxuXHRcdFx0cmVzdWx0cyA9ICQucGFyc2VKU09OKHJlc3VsdHMpO1xyXG5cdFx0XHRpZihyZXN1bHRzLmRvbmUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRjaGF0Ym94LmdldFN0YXJ0KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2hhdGJveC5lcnJvcihcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBwZXJmb3JtaW5nIHRoYXQgbW9kZXJhdGlvbiBjaGFuZ2UuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBtb2RUb29scyhtZXNzYWdlKSB7XHJcblx0XHR2YXIgcmVzID0gXCJcIjtcclxuXHRcdHJlcyArPSBcIjx1bCBjbGFzcz0nbGlzdC1pbmxpbmUgaW5saW5lJz5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzICUgMiA9PT0gMCkge1xyXG5cdFx0XHRyZXMgKz0gXCI8YSBvbmNsaWNrPSdjaGF0Ym94Lm1vZChcIiArIG1lc3NhZ2UuaWQgKyBcIiwgXCIgKyAobWVzc2FnZS5zdGF0dXMgKyAxKSArIFwiKTsnIHRpdGxlPSdIaWRlIG1lc3NhZ2UnPjxpIGNsYXNzPSdmYSBmYS1taW51cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMSkgKyBcIik7JyB0aXRsZT0nU2hvdyBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtcGx1cy1jaXJjbGUgdGV4dC1pbmZvJz48L2k+PC9hPlwiO1xyXG5cdFx0fVxyXG5cdFx0cmVzICs9IFwiPC9saT5cIjtcclxuXHRcdHJlcyArPSBcIjxsaT5cIjtcclxuXHRcdGlmKG1lc3NhZ2Uuc3RhdHVzID49IDIpIHtcclxuXHRcdFx0cmVzICs9IFwiPGEgb25jbGljaz0nY2hhdGJveC5tb2QoXCIgKyBtZXNzYWdlLmlkICsgXCIsIFwiICsgKG1lc3NhZ2Uuc3RhdHVzIC0gMikgKyBcIik7JyB0aXRsZT0nVW5waW4gbWVzc2FnZSc+PGkgY2xhc3M9J2ZhIGZhLWFycm93LWNpcmNsZS1kb3duIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlcyArPSBcIjxhIG9uY2xpY2s9J2NoYXRib3gubW9kKFwiICsgbWVzc2FnZS5pZCArIFwiLCBcIiArIChtZXNzYWdlLnN0YXR1cyArIDIpICsgXCIpOycgdGl0bGU9J1BpbiBtZXNzYWdlJz48aSBjbGFzcz0nZmEgZmEtYXJyb3ctY2lyY2xlLXVwIHRleHQtaW5mbyc+PC9pPjwvYT5cIjtcclxuXHRcdH1cclxuXHRcdHJlcyArPSBcIjwvbGk+XCI7XHJcblx0XHRyZXMgKz0gXCI8L3VsPlwiO1xyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENoYW5uZWxzKCkge1xyXG5cdFx0dmFyIHJlc3BvbnNlID0gdXRpbGl0aWVzLmdldEFKQVgoJy9jaGF0L2NoYW5uZWxzJyk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtcG9wdXAtY2hhbm5lbHMnPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nY2xvc2UnIG9uY2xpY2s9J2NoYXRib3gucGFuZWxjbG9zZSgpOyc+Q2xvc2UgPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9J3NyLW9ubHknPkNsb3NlPC9zcGFuPjwvYnV0dG9uPlwiO1xyXG5cdFx0XHRjb250ZW50cyArPSBcIjxoMz5DaGFubmVsczwvaDM+XCI7XHJcblx0XHRcdGNvbnRlbnRzICs9IFwiPHAgY2xhc3M9J2hvbG8tdGV4dCc+Q3VycmVudGx5IG9uIDxiPiNcIiArIGNoYXRib3guY2hhbm5lbCArIFwiPC9iPjwvcD5cIjtcclxuXHRcdFx0JC5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8YSBvbmNsaWNrPVxcXCJjaGF0Ym94LnN3aXRjaENoYW5uZWwoJ1wiICsgdmFsdWUubmFtZSArIFwiJyk7XFxcIj4jXCIgKyB2YWx1ZS5uYW1lICsgXCI8L2E+PGJyIC8+XCI7XHJcblx0XHRcdFx0Y29udGVudHMgKz0gXCI8c3BhbiBjbGFzcz0naG9sby10ZXh0LXNlY29uZGFyeSc+XCIgKyB2YWx1ZS5tZXNzYWdlcyArIFwiIG1lc3NhZ2VzPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHRcdGNvbnRlbnRzICs9IFwiPHNwYW4gY2xhc3M9J2hvbG8tdGV4dC1zZWNvbmRhcnknPkxhc3QgYWN0aXZlIFwiICsgdXRpbGl0aWVzLnRpbWVBZ28odmFsdWUubGFzdF9tZXNzYWdlKSArIFwiPC9zcGFuPjxiciAvPlwiO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0Y29udGVudHMgKz0gXCI8L2Rpdj5cIjtcclxuXHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2VzKS5odG1sKGNvbnRlbnRzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHBhbmVsQ2hhdCgpIHtcclxuXHRcdHZhciBjb250ZW50cyA9IFwiXCI7XHJcblx0XHRjb250ZW50cyArPSBcIjxkaXYgaWQ9J2NoYXRib3gtbWVzc2FnZXMnPjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8ZGl2IGlkPSdjaGF0Ym94LWFjdGlvbnMnPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBocmVmPScvdHJhbnNwYXJlbmN5L21hcmtkb3duJyB0YXJnZXQ9J19ibGFuaycgaWQ9J2NoYXRib3gtbWFya2Rvd24nPk1hcmtkb3duPC9hPlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8YSBpZD0nY2hhdGJveC1jaGFubmVscyc+Q2hhbm5lbHM8L2E+XCI7XHJcblx0XHRjb250ZW50cyArPSBcIjwvZGl2PlwiO1xyXG5cdFx0Y29udGVudHMgKz0gXCI8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J2NoYXRib3gtbWVzc2FnZScgLz5cIjtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5jaGF0Ym94KS5odG1sKGNvbnRlbnRzKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwYW5lbENsb3NlKCkge1xyXG5cdFx0dGhpcy5nZXRTdGFydCgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN1Ym1pdE1lc3NhZ2UoKSB7XHJcblx0XHR2YXIgY29udGVudHMgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UsXHJcblx0XHRcdHJlc3BvbnNlO1xyXG5cdFx0bWVzc2FnZSA9IHtcclxuXHRcdFx0Y29udGVudHM6IGNvbnRlbnRzLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHRyZXNwb25zZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLlVSTC5wb3N0TWVzc2FnZSwgbWVzc2FnZSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHRpZihyZXNwb25zZS5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnJyk7XHJcblx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnRvZ2dsZUNsYXNzKCdtZXNzYWdlLXNlbnQnKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdCQoY2hhdGJveC5lbGVtZW50cy5tZXNzYWdlKS50b2dnbGVDbGFzcygnbWVzc2FnZS1zZW50Jyk7XHJcblx0XHRcdFx0fSwgMTUwMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYocmVzcG9uc2UuZXJyb3IgPT09IC0xKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3UgYXJlIG5vdCBsb2dnZWQgaW4gYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuZXJyb3IgPT09IC0yKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudmFsKCdZb3Ugd2VyZSBtdXRlZCBmb3Igb25lIGhvdXIgYnkgYSBzdGFmZiBtZW1iZXIgYW5kIGNhbiBub3Qgc2VuZCBtZXNzYWdlcy4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChjaGF0Ym94LmVsZW1lbnRzLm1lc3NhZ2UpLnZhbCgnVGhlcmUgd2FzIGFuIHVua25vd24gZXJyb3IuICBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQkKGNoYXRib3guZWxlbWVudHMubWVzc2FnZSkudG9nZ2xlQ2xhc3MoJ21lc3NhZ2UtYmFkJyk7XHJcblx0XHRcdFx0fSwgMjUwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN3aXRjaENoYW5uZWwobmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgZGF0YSxcclxuXHRcdFx0cmVzcG9uc2U7XHJcblx0XHRkYXRhID0ge1xyXG5cdFx0XHRjaGFubmVsOiBuYW1lXHJcblx0XHR9O1xyXG5cdFx0cmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgoJy9jaGF0L2NoYW5uZWxzL2NoZWNrJywgZGF0YSk7XHJcblx0XHRyZXNwb25zZS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cdFx0XHRpZihyZXNwb25zZS52YWxpZCkge1xyXG5cdFx0XHRcdGNoYXRib3guY2hhbm5lbCA9IG5hbWU7XHJcblx0XHRcdFx0Y2hhdGJveC5nZXRTdGFydCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGUoKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0aWQ6IHRoaXMubGFzdElkLFxyXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWxcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzcG9uc2UgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5VUkwuZ2V0VXBkYXRlLCBkYXRhKTtcclxuXHRcdHJlc3BvbnNlLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0cmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblx0XHRcdGNoYXRib3gudGltZXMubGFzdFJlZnJlc2ggPSB1dGlsaXRpZXMuY3VycmVudFRpbWUoKTtcclxuXHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG5cdFx0XHRcdFx0Y2hhdGJveC5hZGRNZXNzYWdlKHZhbHVlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRjaGF0Ym94LmRpc3BsYXlNZXNzYWdlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNsZWFyVGltZW91dChjaGF0Ym94LnRpbWVvdXRVcGRhdGUpO1xyXG5cdFx0XHRjaGF0Ym94LnRpbWVvdXRVcGRhdGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjaGF0Ym94LnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAxMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGRhdGVUaW1lQWdvKCkge1xyXG5cdFx0dmFyIG1lc3NhZ2VzID0gJCh0aGlzLmVsZW1lbnRzLm1lc3NhZ2VzKS5maW5kKCcubXNnJyk7XHJcblx0XHQkLmVhY2gobWVzc2FnZXMsIGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuXHRcdFx0dmFyIHRpbWVzdGFtcCA9ICQodmFsdWUpLmZpbmQoJ3RpbWUnKS5hdHRyKCdkYXRhLXRzJyk7XHJcblx0XHRcdCQodmFsdWUpLmZpbmQoJ3RpbWUnKS5odG1sKHV0aWxpdGllcy50aW1lQWdvKHRpbWVzdGFtcCkpO1xyXG5cdFx0fSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y2hhdGJveC51cGRhdGVUaW1lQWdvKCk7XHJcblx0XHR9LCAxMDAwKTtcclxuXHR9XHJcbn0iLCJ2YXIgY29tYmF0Q2FsY3VsYXRvcjtcclxuY2xhc3MgQ29tYmF0Q2FsY3VsYXRvciB7XHJcblx0Y2xpY2tzOiBhbnkgPSB7fTtcclxuXHRnZW5lcmF0ZTogYW55ID0ge307XHJcblx0aW5wdXRzOiBhbnkgPSB7fTtcclxuXHRvdGhlcjogYW55ID0ge307XHJcblx0cGF0aHM6IGFueSA9IHt9O1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5jbGlja3MgPSB7XHJcblx0XHRcdHN1Ym1pdDogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6c3VibWl0J11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMuZ2VuZXJhdGUgPSB7XHJcblx0XHRcdGxldmVsOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpsZXZlbCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmlucHV0cyA9IHtcclxuXHRcdFx0YXR0YWNrOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjphdHRhY2snXVwiLFxyXG5cdFx0XHRkZWZlbmNlOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpkZWZlbmNlJ11cIixcclxuXHRcdFx0c3RyZW5ndGg6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnN0cmVuZ3RoJ11cIixcclxuXHRcdFx0Y29uc3RpdHV0aW9uOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpjb25zdGl0dXRpb24nXVwiLFxyXG5cdFx0XHRyYW5nZWQ6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOnJhbmdlZCddXCIsXHJcblx0XHRcdHByYXllcjogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6cHJheWVyJ11cIixcclxuXHRcdFx0bWFnaWM6IFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOm1hZ2ljJ11cIixcclxuXHRcdFx0c3VtbW9uaW5nOiBcIltydC1kYXRhPSdjb21iYXQuY2FsY3VsYXRvcjpzdW1tb25pbmcnXVwiXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5vdGhlciA9IHtcclxuXHRcdFx0bmFtZTogXCJbcnQtZGF0YT0nY29tYmF0LmNhbGN1bGF0b3I6bmFtZSddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRsb2FkQ29tYmF0OiAnL2NhbGN1bGF0b3JzL2NvbWJhdC9sb2FkJ1xyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5pbnB1dHMuYXR0YWNrKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5kZWZlbmNlKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5zdHJlbmd0aCkua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMuY29uc3RpdHV0aW9uKS5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb21iYXRDYWxjdWxhdG9yLnVwZGF0ZUxldmVsKCk7XHJcblx0XHRcdH0sIDI1KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmlucHV0cy5yYW5nZWQpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnByYXllcikua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5pbnB1dHMubWFnaWMpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdFx0fSwgMjUpO1xyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaW5wdXRzLnN1bW1vbmluZykua2V5dXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29tYmF0Q2FsY3VsYXRvci51cGRhdGVMZXZlbCgpO1xyXG5cdFx0XHR9LCAyNSk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5jbGlja3Muc3VibWl0KS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29tYmF0Q2FsY3VsYXRvci5nZXRMZXZlbHMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRnZXRMZXZlbHMoKSB7XHJcblx0XHR2YXIgbmFtZSA9ICQodGhpcy5vdGhlci5uYW1lKS52YWwoKSxcclxuXHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHRyc246IG5hbWVcclxuXHRcdFx0fSxcclxuXHRcdFx0bGV2ZWxzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMubG9hZENvbWJhdCwgZGF0YSk7XHJcblx0XHRsZXZlbHMuZG9uZShmdW5jdGlvbihsZXZlbHMpIHtcclxuXHRcdFx0bGV2ZWxzID0gJC5wYXJzZUpTT04obGV2ZWxzKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5hdHRhY2spLnZhbChsZXZlbHMuYXR0YWNrKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5kZWZlbmNlKS52YWwobGV2ZWxzLmRlZmVuY2UpO1xyXG5cdFx0XHQkKGNvbWJhdENhbGN1bGF0b3IuaW5wdXRzLnN0cmVuZ3RoKS52YWwobGV2ZWxzLnN0cmVuZ3RoKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5jb25zdGl0dXRpb24pLnZhbChsZXZlbHMuY29uc3RpdHV0aW9uKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5yYW5nZWQpLnZhbChsZXZlbHMucmFuZ2VkKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5wcmF5ZXIpLnZhbChsZXZlbHMucHJheWVyKTtcclxuXHRcdFx0JChjb21iYXRDYWxjdWxhdG9yLmlucHV0cy5tYWdpYykudmFsKGxldmVscy5tYWdpYyk7XHJcblx0XHRcdCQoY29tYmF0Q2FsY3VsYXRvci5pbnB1dHMuc3VtbW9uaW5nKS52YWwobGV2ZWxzLnN1bW1vbmluZyk7XHJcblx0XHRcdGNvbWJhdENhbGN1bGF0b3IudXBkYXRlTGV2ZWwoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHR1cGRhdGVMZXZlbCgpIHtcclxuXHRcdHZhciBtZWxlZSA9IHRoaXMudmFsKCdhdHRhY2snKSArIHRoaXMudmFsKCdzdHJlbmd0aCcpO1xyXG5cdFx0dmFyIG1hZ2ljID0gMiAqIHRoaXMudmFsKCdtYWdpYycpO1xyXG5cdFx0dmFyIHJhbmdlZCA9IDIgKiB0aGlzLnZhbCgncmFuZ2VkJyk7XHJcblx0XHR2YXIgZGVmID0gdGhpcy52YWwoJ2RlZmVuY2UnKSArIHRoaXMudmFsKCdjb25zdGl0dXRpb24nKTtcclxuXHRcdHZhciBvdGhlciA9ICguNSAqIHRoaXMudmFsKCdwcmF5ZXInKSkgKyAoLjUgKiB0aGlzLnZhbCgnc3VtbW9uaW5nJykpO1xyXG5cdFx0dmFyIGxldmVsID0gKDEzLzEwKSAqIE1hdGgubWF4KG1lbGVlLCBtYWdpYywgcmFuZ2VkKSArIGRlZiArIG90aGVyO1xyXG5cdFx0bGV2ZWwgKj0gLjI1O1xyXG5cdFx0bGV2ZWwgPSBNYXRoLmZsb29yKGxldmVsKTtcclxuXHRcdCQodGhpcy5nZW5lcmF0ZS5sZXZlbCkuaHRtbChsZXZlbCk7XHJcblx0fVxyXG5cdHZhbChuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHJldHVybiBwYXJzZUludCgkKFwiW3J0LWRhdGE9J2NvbWJhdC5jYWxjdWxhdG9yOlwiICsgbmFtZSArIFwiJ11cIikudmFsKCkpO1xyXG5cdH1cclxufSIsInZhciBjb250YWN0O1xyXG5jbGFzcyBDb250YWN0IHtcclxuXHRkYXRhOiBhbnkgPSB7fTtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0aG9va3M6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7XHJcblx0XHRcdHNlbnQ6IGZhbHNlXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0ZW1haWw6ICcjY29udGFjdC1lbWFpbCcsXHJcblx0XHRcdGVycm9yOiAnI2NvbnRhY3QtZXJyb3InLFxyXG5cdFx0XHRtZXNzYWdlOiAnI2NvbnRhY3QtbWVzc2FnZScsXHJcblx0XHRcdHVzZXJuYW1lOiAnI2NvbnRhY3QtdXNlcm5hbWUnXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0c3VibWl0OiBcIltydC1ob29rPSdjb250YWN0OnN1Ym1pdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRmb3JtOiAnL2NvbnRhY3Qvc3VibWl0J1xyXG5cdFx0fTtcclxuXHRcdCQodGhpcy5ob29rcy5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb250YWN0LnNlbmQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRvbmUobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LWRhbmdlclwiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZW5kKCkge1xyXG5cdFx0aWYodGhpcy5kYXRhLnNlbnQgPT09IHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZG9uZShcIllvdSBoYXZlIGFscmVhZHkgc2VudCB5b3VyIG1lc3NhZ2UhXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBlbWFpbCA9ICQodGhpcy5lbGVtZW50cy5lbWFpbCkudmFsKCksXHJcblx0XHRcdG1lc3NhZ2UgPSAkKHRoaXMuZWxlbWVudHMubWVzc2FnZSkudmFsKCksXHJcblx0XHRcdHVzZXJuYW1lID0gJCh0aGlzLmVsZW1lbnRzLnVzZXJuYW1lKS52YWwoKTtcclxuXHJcblx0XHQvLyBDaGVjayBlbWFpbFxyXG5cdFx0aWYodGhpcy52YWxpZGF0ZUVtYWlsKGVtYWlsKSA9PT0gZmFsc2UpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZXJyb3IoXCJUaGF0IGlzIG5vdCBhIHZhbGlkYXRlIGVtYWlsIGFkZHJlc3MuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRjb250ZW50czogbWVzc2FnZSxcclxuXHRcdFx0ZW1haWw6IGVtYWlsLFxyXG5cdFx0XHR1c2VybmFtZTogdXNlcm5hbWVcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmZvcm0sIGRhdGEpO1xyXG5cdFx0dGhpcy53YXJuaW5nKFwiU2VuZGluZyBtZXNzYWdlLi4uXCIpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdGNvbnRhY3QuZGF0YS5zZW50ID0gdHJ1ZTtcclxuXHRcdFx0XHRjb250YWN0LmRvbmUoXCJZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudC5cIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29udGFjdC5lcnJvcihcIlRoZXJlIHdhcyBhbiB1bmtub3duIGVycm9yIHdoaWxlIHNlbmRpbmcgeW91ciBtZXNzYWdlLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBhbnkpIHtcclxuXHRcdHZhciByZSA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG5cdFx0cmV0dXJuIHJlLnRlc3QoZW1haWwpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHdhcm5pbmcobWVzc2FnZTogc3RyaW5nKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLmh0bWwobWVzc2FnZSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudHMuZXJyb3IpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoXCJ0ZXh0LXdhcm5pbmdcIik7XHJcblx0fVxyXG59IiwidmFyIGZvcnVtcztcclxuY2xhc3MgRm9ydW1zIHtcclxuXHRwdWJsaWMgZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyBob29rczogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcG9zdDogUG9zdCA9IG51bGw7XHJcblx0cHVibGljIHRocmVhZENyZWF0ZTogRm9ydW1zVGhyZWFkQ3JlYXRlID0gbnVsbDtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHQncG9zdEVkaXRvcic6IFwiW3J0LWRhdGE9J3Bvc3QuZWRpdCddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRwb2xsOiB7XHJcblx0XHRcdFx0dm90ZTogXCJbcnQtaG9vaz0nZm9ydW06cG9sbC52b3RlJ11cIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0cG9sbDoge1xyXG5cdFx0XHRcdHZvdGU6ICcvZm9ydW1zL3BvbGwvdm90ZSdcclxuXHRcdFx0fSxcclxuXHRcdFx0dm90ZTogZnVuY3Rpb24oaWQ6IG51bWJlcikgeyByZXR1cm4gJy9mb3J1bXMvcG9zdC8nICsgaWQgKyAnL3ZvdGUnOyB9XHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wb3N0ID0gbmV3IFBvc3QoKTtcclxuXHRcdCQoJy51cHZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLnVwdm90ZShwb3N0SWQpO1xyXG5cdFx0fSk7XHJcblx0XHQkKCcuZG93bnZvdGUnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgcG9zdElkID0gJChlLnRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcclxuXHRcdFx0Zm9ydW1zLmRvd252b3RlKHBvc3RJZCk7XHJcblx0XHR9KTtcclxuXHRcdCQoXCJbcnQtaG9vaz0nZm9ydW1zLnRocmVhZC5wb3N0OnF1b3RlJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlOiBhbnkpIHtcclxuXHRcdFx0dmFyIGlkID0gJChlLnRhcmdldCkuYXR0cigncnQtZGF0YScpO1xyXG5cdFx0XHRmb3J1bXMucG9zdC5xdW90ZShpZCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5ob29rcy5wb2xsLnZvdGUpLmNsaWNrKGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9ICQoZS50YXJnZXQpLmF0dHIoJ3J0LWRhdGEnKTtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0XHRmb3J1bXMucG9sbFZvdGUoZGF0YS5xdWVzdGlvbiwgZGF0YS5hbnN3ZXIpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZG93bnZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNEb3dudm90ZWQgPT09IHRydWUpXHJcblx0XHRcdCQocG9zdCkucmVtb3ZlQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkKHBvc3QpLmFkZENsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzVXB2b3RlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0JChwb3N0KS5yZW1vdmVDbGFzcygndXB2b3RlLWFjdGl2ZScpO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdCd2b3RlJzogJ2Rvd24nXHJcblx0XHR9O1xyXG5cdFx0dmFyIHZvdGUgPSB1dGlsaXRpZXMucG9zdEFKQVgodGhpcy5wYXRocy52b3RlKHBvc3RJZCksIGRhdGEpO1xyXG5cdFx0dm90ZS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9ICQucGFyc2VKU09OKGRhdGEpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcG9sbFZvdGUocXVlc3Rpb25JZDogbnVtYmVyLCBhbnN3ZXJJZDogbnVtYmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0YW5zd2VyOiBhbnN3ZXJJZCxcclxuXHRcdFx0cXVlc3Rpb246IHF1ZXN0aW9uSWRcclxuXHRcdH07XHJcblx0XHR2YXIgcmVzdWx0cyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnBvbGwudm90ZSwgZGF0YSk7XHJcblx0XHRyZXN1bHRzLmRvbmUoZnVuY3Rpb24ocmVzdWx0czogc3RyaW5nKSB7XHJcblx0XHRcdHJlc3VsdHMgPSAkLnBhcnNlSlNPTihyZXN1bHRzKTtcclxuXHRcdFx0aWYocmVzdWx0cy5kb25lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnJlcGxhY2Uod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZihyZXN1bHRzLmVycm9yID09PSAtMSkge1xyXG5cdFx0XHRcdFx0Ly8gVGhlIHVzZXIgd2FzIG5vdCBsb2dnZWQgaW5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gVW5rbm93biBlcnJvclxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvLyBUT0RPOiBNYWtlIGFuIGVycm9yIGRpdlxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cHZvdGUocG9zdElkOiBhbnkpIHtcclxuXHRcdHBvc3RJZCA9IHBvc3RJZC5yZXBsYWNlKFwicG9zdFwiLCBcIlwiKTtcclxuXHRcdHZhciBwb3N0ID0gJCgnI3Bvc3QnICsgcG9zdElkKSxcclxuXHRcdFx0aXNVcHZvdGVkID0gJChwb3N0KS5oYXNDbGFzcygndXB2b3RlLWFjdGl2ZScpLFxyXG5cdFx0XHRpc0Rvd252b3RlZCA9ICQocG9zdCkuaGFzQ2xhc3MoJ2Rvd252b3RlLWFjdGl2ZScpO1xyXG5cdFx0aWYoaXNVcHZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCd1cHZvdGUtYWN0aXZlJyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQocG9zdCkuYWRkQ2xhc3MoJ3Vwdm90ZS1hY3RpdmUnKTtcclxuXHRcdGlmKGlzRG93bnZvdGVkID09PSB0cnVlKVxyXG5cdFx0XHQkKHBvc3QpLnJlbW92ZUNsYXNzKCdkb3dudm90ZS1hY3RpdmUnKTtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQndm90ZSc6ICd1cCdcclxuXHRcdH07XHJcblx0XHR2YXIgdm90ZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLnZvdGUocG9zdElkKSwgZGF0YSk7XHJcblx0XHR2b3RlLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRkYXRhID0gJC5wYXJzZUpTT04oZGF0YSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuY2xhc3MgUG9zdCB7XHJcblx0cHVibGljIHF1b3RlKGlkOiBhbnkpIHtcclxuXHRcdHZhciBzb3VyY2UgPSAkKFwiW3J0LWRhdGE9J3Bvc3QjXCIgKyBpZCArXCI6c291cmNlJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRwb3N0Q29udGVudHMgPSAkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwoKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC9cXG4vZywgJ1xcbj4nKTtcclxuXHRcdHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC8mbHQ7L2csICc8Jyk7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xyXG5cdFx0c291cmNlID0gXCI+XCIgKyBzb3VyY2U7XHJcblx0XHRpZihwb3N0Q29udGVudHMubGVuZ3RoID4gMClcclxuXHRcdFx0cG9zdENvbnRlbnRzICs9IFwiXFxuXCI7XHJcblx0XHQkKGZvcnVtcy5lbGVtZW50cy5wb3N0RWRpdG9yKS52YWwocG9zdENvbnRlbnRzICsgc291cmNlICsgXCJcXG5cIik7XHJcblx0XHR1dGlsaXRpZXMuc2Nyb2xsVG8oJChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvciksIDEwMDApO1xyXG5cdFx0JChmb3J1bXMuZWxlbWVudHMucG9zdEVkaXRvcikuZm9jdXMoKTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEZvcnVtc1RocmVhZENyZWF0ZSB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgcXVlc3Rpb25zOiBBcnJheSA9IFtdO1xyXG5cdHB1YmxpYyB2YWx1ZXM6IGFueSA9IHt9O1xyXG5cdHB1YmxpYyB2aWV3czogYW55ID0ge307XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ob29rcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25BZGQ6IFwiW3J0LWhvb2s9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwucXVlc3Rpb24uYWRkJ11cIixcclxuXHRcdFx0cXVlc3Rpb25zOiBcIltydC1ob29rPSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9ucyddXCJcclxuXHRcdH07XHJcblx0XHR0aGlzLnF1ZXN0aW9ucyA9IEFycmF5KDUwMCk7XHJcblx0XHR0aGlzLnZhbHVlcyA9IHtcclxuXHRcdFx0cXVlc3Rpb25zOiAwXHJcblx0XHR9O1xyXG5cdFx0dGhpcy52aWV3cyA9IHtcclxuXHRcdFx0YW5zd2VyOiAkKFwiW3J0LXZpZXc9J2ZvcnVtcy50aHJlYWQuY3JlYXRlOnBvbGwuYW5zd2VyJ11cIikuaHRtbCgpLFxyXG5cdFx0XHRxdWVzdGlvbjogJChcIltydC12aWV3PSdmb3J1bXMudGhyZWFkLmNyZWF0ZTpwb2xsLnF1ZXN0aW9uJ11cIikuaHRtbCgpXHJcblx0XHR9O1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9uQWRkKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLmFkZFF1ZXN0aW9uKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHVibGljIGFkZFF1ZXN0aW9uKCkge1xyXG5cdFx0dmFyIGh0bWwgPSB0aGlzLnZpZXdzLnF1ZXN0aW9uO1xyXG5cdFx0JCh0aGlzLmhvb2tzLnF1ZXN0aW9ucykuYXBwZW5kKGh0bWwpO1xyXG5cdFx0dGhpcy52YWx1ZXMucXVlc3Rpb25zICs9IDE7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVtb3ZlUXVlc3Rpb24obnVtYmVyOiBudW1iZXIpIHtcclxuXHRcdHRoaXMucXVlc3Rpb25zLnNwbGljZShudW1iZXIsIDEpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldExpc3RlbmVyKGVsZW1lbnQsIHR5cGUpIHtcclxuXHRcdGlmKHR5cGUgPT09IFwicmVtb3ZlIHF1ZXN0aW9uXCIpIHtcclxuXHRcdFx0dGhpcy5zZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzZXRMaXN0ZW5lclJlbW92ZVF1ZXN0aW9uKGVsZW1lbnQ6IGFueSkge1xyXG5cdFx0JChlbGVtZW50KS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHRmb3J1bXMudGhyZWFkQ3JlYXRlLnJlbW92ZVF1ZXN0aW9uKCQoZWxlbWVudCkucGFyZW50KCkucGFyZW50KCkuYXR0cigncnQtZGF0YScpKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHRmb3J1bXMgPSBuZXcgRm9ydW1zKCk7XHJcbn0pOyIsImNsYXNzIExpdmVzdHJlYW1SZXNldCB7XHJcblx0cHVibGljIGhvb2tzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgbGFuZzogYW55ID0ge307XHJcblx0cHVibGljIHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRub3RlOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0Om5vdGUnXVwiLFxyXG5cdFx0XHRzcGlubmVyOiBcIltydC1ob29rPSdsaXZlc3RyZWFtLnJlc2V0OnNwaW5uZXInXVwiLFxyXG5cdFx0XHRzdGF0dXM6IFwiW3J0LWhvb2s9J2xpdmVzdHJlYW0ucmVzZXQ6c3RhdHVzJ11cIlxyXG5cdFx0fTtcclxuXHRcdHRoaXMubGFuZyA9IHtcclxuXHRcdFx0Y2hlY2tpbmc6ICdjaGVja2luZycsXHJcblx0XHRcdG9mZmxpbmU6ICdvZmZsaW5lJyxcclxuXHRcdFx0b25saW5lOiAnb25saW5lJyxcclxuXHRcdFx0dW5rbm93bjogJ3Vua25vd24nXHJcblx0XHR9O1xyXG5cdFx0dGhpcy5wYXRocyA9IHtcclxuXHRcdFx0cmVzZXQ6ICcvbGl2ZXN0cmVhbS9yZXNldCdcclxuXHRcdH07XHJcblx0XHR0aGlzLnJlc2V0KCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlc2V0KCkge1xyXG5cdFx0JCgnI2xvYWRpbmcnKS5jc3MoeyBvcGFjaXR5OiAxfSk7XHJcblx0XHR2YXIgc3RhdHVzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMucmVzZXQsIHt9KTtcclxuXHRcdHN0YXR1cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gdXRpbGl0aWVzLkpTT05EZWNvZGUocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMub25saW5lID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09ubGluZSgpO1xyXG5cdFx0XHR9IGVsc2UgaWYocmVzdWx0cy5vbmxpbmUgPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0bGl2ZXN0cmVhbVJlc2V0LnN0YXR1c09mZmxpbmUoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsaXZlc3RyZWFtUmVzZXQuc3RhdHVzVW5rbm93bigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxpdmVzdHJlYW1SZXNldC5zcGlubmVyUmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNsb2FkaW5nJykuY3NzKHsgb3BhY2l0eTogMH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNwaW5uZXJSZW1vdmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3Bpbm5lcikuY3NzKHtcclxuXHRcdFx0b3BhY2l0eTogMFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzZXMoY2hlY2tpbmc6IHN0cmluZywgb25saW5lOiBzdHJpbmcsIG9mZmxpbmU6IHN0cmluZywgdW5rbm93bjogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmxhbmcuY2hlY2tpbmcgPSBjaGVja2luZztcclxuXHRcdHRoaXMubGFuZy5vZmZsaW5lID0gb2ZmbGluZTtcclxuXHRcdHRoaXMubGFuZy5vbmxpbmUgPSBvbmxpbmU7XHJcblx0XHR0aGlzLmxhbmcudW5rbm93biA9IHVua25vd247XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzT2ZmbGluZSgpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJvZmZsaW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1kYW5nZXInKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0dXNPbmxpbmUoKSB7XHJcblx0XHQkKHRoaXMuaG9va3Muc3RhdHVzKS5odG1sKFwib25saW5lXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdHVzVW5rbm93bigpIHtcclxuXHRcdCQodGhpcy5ob29rcy5zdGF0dXMpLmh0bWwoXCJ1bmtub3duXCIpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygpLlxyXG5cdFx0XHRhZGRDbGFzcygndGV4dC13YXJuaW5nJyk7XHJcblx0fVxyXG59IiwidmFyIHJ1bmV0aW1lO1xyXG5jbGFzcyBSdW5lVGltZSB7XHJcblx0bG9hZGluZzpzdHJpbmcgPSAnI2xvYWRpbmcnO1xyXG59XHJcbnJ1bmV0aW1lID0gbmV3IFJ1bmVUaW1lKCk7XHJcbiQoZnVuY3Rpb24gKCkge1xyXG5cdFwidXNlIHN0cmljdFwiO1xyXG5cdCQoJ1tkYXRhLXRvZ2dsZV0nKS50b29sdGlwKCk7XHJcblx0JCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCk7XHJcblx0JCgndGJvZHkucm93bGluaycpLnJvd2xpbmsoKTtcclxuXHQkKCcjdG9wJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0JCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG5cdFx0XHRzY3JvbGxUb3A6IDBcclxuXHRcdH0sIDEwMDApO1xyXG5cdH0pO1xyXG5cdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGhlaWdodCA9ICQoJ2JvZHknKS5oZWlnaHQoKSxcclxuXHRcdFx0c2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxyXG5cdFx0XHR0b3AgPSAkKCcjdG9wJyk7XHJcblx0XHRpZihzY3JvbGwgPiBoZWlnaHQvMTApIHtcclxuXHRcdFx0aWYoISQodG9wKS5oYXNDbGFzcygnc2V0LXZpcycpKSB7XHJcblx0XHRcdFx0JCh0b3ApLmZhZGVJbigyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYoJCh0b3ApLmhhc0NsYXNzKCdzZXQtdmlzJykpIHtcclxuXHRcdFx0XHQkKHRvcCkuZmFkZU91dCgyMDApLlxyXG5cdFx0XHRcdFx0dG9nZ2xlQ2xhc3MoJ3NldC12aXMnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdCQoJy5uYXZiYXIgLmRyb3Bkb3duJykuaG92ZXIoZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLmRlbGF5KDUwKS5zbGlkZURvd24oKTtcclxuXHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuZGVsYXkoMTAwKS5zbGlkZVVwKClcclxuXHR9KTtcclxufSk7IiwidmFyIG5hbWVDaGVja2VyO1xyXG5jbGFzcyBOYW1lQ2hlY2tlciB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdG5vdEFsbG93ZWQ6IGFueSA9IFtdO1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGF2YWlsYWJpbGl0eTogJyNyc24tYXZhaWxhYmlsaXR5JyxcclxuXHRcdFx0Y2hlY2s6ICcjcnNuLWNoZWNrLWZpZWxkJ1xyXG5cdFx0fTtcclxuXHRcdHRoaXMubm90QWxsb3dlZCA9IFsnWm5WamF3PT0nLCAnYzJocGRBPT0nXTtcclxuXHRcdHRoaXMucGF0aHMgPSB7XHJcblx0XHRcdGNoZWNrOiAnL25hbWUtY2hlY2snXHJcblx0XHR9O1xyXG5cdFx0JChcIltydC1ob29rPSduYW1lLmNoZWNrZXI6c3VibWl0J11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbih2YWx1ZTogYW55KSB7XHJcblx0XHRcdG5hbWVDaGVja2VyLmNoZWNrKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Y2hlY2soKSB7XHJcblx0XHR2YXIgbmFtZSA9ICQoJyNyc24tY2hlY2stZmllbGQnKS52YWwoKTtcclxuXHRcdHZhciBjaGVja05hbWUgPSB0aGlzLmNoZWNrTmFtZShuYW1lKTtcclxuXHRcdGlmKGNoZWNrTmFtZSA9PT0gMCkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiWW91IGRpZCBub3QgZW50ZXIgYW55dGhpbmcuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gMSkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IGlzIG92ZXIgMTIgY2hhcmFjdGVycy5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSAyKSB7XHJcblx0XHRcdHRoaXMudW5hdmFpbGFibGUoXCJUaGUgbmFtZSA8Yj5cIiArIG5hbWUgKyBcIjwvYj4gaXMgdW5kZXIgMyBjaGFyYWN0ZXJzLlwiKTtcclxuXHRcdH0gZWxzZSBpZihjaGVja05hbWUgPT09IDMpIHtcclxuXHRcdFx0dGhpcy51bmF2YWlsYWJsZShcIlRoZSBuYW1lIDxiPlwiICsgbmFtZSArIFwiPC9iPiBzdGFydHMgd2l0aCB0aGUgd29yZCBNb2QuXCIpO1xyXG5cdFx0fSBlbHNlIGlmKGNoZWNrTmFtZSA9PT0gNCkge1xyXG5cdFx0XHR0aGlzLnVuYXZhaWxhYmxlKFwiVGhlIG5hbWUgPGI+XCIgKyBuYW1lICsgXCI8L2I+IGNvbnRhaW5zIGEgc3dlYXIgd29yZC5cIik7XHJcblx0XHR9IGVsc2UgaWYoY2hlY2tOYW1lID09PSA1KSB7XHJcblx0XHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdHJzbjogbmFtZVxyXG5cdFx0XHR9O1xyXG5cdFx0XHR2YXIgZGV0YWlscyA9IHV0aWxpdGllcy5wb3N0QUpBWCh0aGlzLnBhdGhzLmNoZWNrLCBkYXRhKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnRzLmF2YWlsYWJpbGl0eSkuaHRtbCgnTG9hZGluZy4uLicpO1xyXG5cdFx0XHRkZXRhaWxzLmRvbmUoZnVuY3Rpb24oZGV0YWlsczogc3RyaW5nKSB7XHJcblx0XHRcdFx0dmFyIGF2YWlsYWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdGlmKGRldGFpbHMuc3Vic3RyaW5nKDAsIDYpID09PSBcIjxodG1sPlwiKSB7XHJcblx0XHRcdFx0XHRhdmFpbGFibGUgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihhdmFpbGFibGUgPT09IHRydWUpIHtcclxuXHRcdFx0XHRcdG5hbWVDaGVja2VyLmF2YWlsYWJsZShuYW1lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0bmFtZUNoZWNrZXIudW5hdmFpbGFibGUoJ1RoZSBSdW5lc2NhcGUgbmFtZSA8Yj4nICsgbmFtZSArICc8L2I+IGlzIG5vdCBhdmFpbGFibGUuJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0YXZhaWxhYmxlKG5hbWU6IHN0cmluZykge1xyXG5cdFx0JChuYW1lQ2hlY2tlci5lbGVtZW50cy5hdmFpbGFiaWxpdHkpLmh0bWwoJ1RoZSBSdW5lU2NhcGUgbmFtZSA8Yj4nICsgbmFtZSArICc8L2I+IGlzIGF2YWlsYWJsZS4nKS5cclxuXHRcdFx0Y3NzKHtcclxuXHRcdFx0XHRjb2xvcjogJ2dyZWVuJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrTmFtZShuYW1lOiBhbnkpIHtcclxuXHRcdGlmKHR5cGVvZihuYW1lKSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEyKSB7XHJcblx0XHRcdFx0cmV0dXJuIDE7XHJcblx0XHRcdH0gZWxzZSBpZiAobmFtZS5sZW5ndGggPCAzKSB7XHJcblx0XHRcdFx0cmV0dXJuIDI7XHJcblx0XHRcdH0gZWxzZSBpZiAobmFtZS5zdWJzdHJpbmcoMCwgMykgPT09ICdNb2QnKSB7XHJcblx0XHRcdFx0cmV0dXJuIDM7XHJcblx0XHRcdH1cclxuXHRcdFx0JC5lYWNoKHRoaXMubm90QWxsb3dlZCwgZnVuY3Rpb24gKGtleTpudW1iZXIsIHZhbHVlOmFueSkge1xyXG5cdFx0XHRcdHZhciBkZWNvZGUgPSBhdG9iKHZhbHVlKTtcclxuXHRcdFx0XHRpZiAobmFtZS5pbmRleE9mKGRlY29kZSkgPiAtMSlcclxuXHRcdFx0XHRcdHJldHVybiA0O1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiA1O1xyXG5cdH1cclxuXHR1bmF2YWlsYWJsZShtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5hdmFpbGFiaWxpdHkpLmh0bWwobWVzc2FnZSkuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0Y29sb3I6ICdyZWQnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSIsInZhciBuZXdzO1xyXG5jbGFzcyBOZXdzIHtcclxuXHRlbGVtZW50czogYW55ID0ge307XHJcblx0aG9va3M6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmVsZW1lbnRzID0ge1xyXG5cdFx0XHRjb21tZW50OiB7XHJcblx0XHRcdFx0Y29udGVudHM6IFwiI25ld3MtY29tbWVudC10ZXh0YXJlYVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLmhvb2tzID0ge1xyXG5cdFx0XHRjb21tZW50OiB7XHJcblx0XHRcdFx0c3VibWl0OiBcIltydC1ob29rPSduZXdzLmFydGljbGU6Y29tbWVudC5zdWJtaXQnXVwiXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjb21tZW50OiBmdW5jdGlvbihpZDogYW55KSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiL25ld3MvXCIgKyBpZCArIFwiLW5hbWUvcmVwbHlcIlxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ292ZXJsYXknKTtcclxuXHRcdHZhciBvdmVybGF5Q2xvc2UgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpO1xyXG5cdFx0dmFyIGhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZWFkZXInKTtcclxuXHRcdHZhciBzd2l0Y2hCdG5uID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zbGlkZXItc3dpdGNoJyk7XHJcblx0XHR2YXIgdG9nZ2xlQnRubiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihzbGlkZXNob3cuaXNGdWxsc2NyZWVuKSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5hZGQoc3dpdGNoQnRubiwgJ3ZpZXctbWF4aScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNsYXNzaWUucmVtb3ZlKHN3aXRjaEJ0bm4sICd2aWV3LW1heGknKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciB0b2dnbGVDdHJscyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighc2xpZGVzaG93LmlzQ29udGVudCkge1xyXG5cdFx0XHRcdGNsYXNzaWUuYWRkKGhlYWRlciwgJ2hpZGUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHZhciB0b2dnbGVDb21wbGV0ZUN0cmxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCFzbGlkZXNob3cuaXNDb250ZW50KSB7XHJcblx0XHRcdFx0Y2xhc3NpZS5yZW1vdmUoaGVhZGVyLCAnaGlkZScpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0dmFyIHNsaWRlc2hvdyA9IG5ldyBEcmFnU2xpZGVzaG93KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbGlkZXNob3cnKSwge1xyXG5cdFx0XHQvLyB0b2dnbGUgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBtaW5pbWl6ZWQgc2xpZGVzaG93XHJcblx0XHRcdG9uVG9nZ2xlOiB0b2dnbGVCdG5uLFxyXG5cdFx0XHQvLyB0b2dnbGUgdGhlIG1haW4gaW1hZ2UgYW5kIHRoZSBjb250ZW50IHZpZXdcclxuXHRcdFx0b25Ub2dnbGVDb250ZW50OiB0b2dnbGVDdHJscyxcclxuXHRcdFx0Ly8gdG9nZ2xlIHRoZSBtYWluIGltYWdlIGFuZCB0aGUgY29udGVudCB2aWV3ICh0cmlnZ2VyZWQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBlbmRzKVxyXG5cdFx0XHRvblRvZ2dsZUNvbnRlbnRDb21wbGV0ZTogdG9nZ2xlQ29tcGxldGVDdHJsc1xyXG5cdFx0fSk7XHJcblx0XHR2YXIgdG9nZ2xlU2xpZGVzaG93ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNsaWRlc2hvdy50b2dnbGUoKTtcclxuXHRcdFx0dG9nZ2xlQnRubigpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBjbG9zZU92ZXJsYXkgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0Y2xhc3NpZS5hZGQob3ZlcmxheSwgJ2hpZGUnKTtcclxuXHRcdH07XHJcblx0XHQvLyB0b2dnbGUgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBzbWFsbCBzbGlkZXNob3dcclxuXHRcdHN3aXRjaEJ0bm4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVTbGlkZXNob3cpO1xyXG5cdFx0Ly8gY2xvc2Ugb3ZlcmxheVxyXG5cdFx0b3ZlcmxheUNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VPdmVybGF5KTtcclxuXHJcblx0XHRpZihsb2NhbFN0b3JhZ2UpIHtcclxuXHRcdFx0dmFyIHNob3dlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCduZXdzLmluZm8uc2hvd2VkJyk7XHJcblx0XHRcdGlmKHNob3dlZCA9PT0gJ3RydWUnKSB7XHJcblx0XHRcdFx0Y2xvc2VPdmVybGF5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnNldHVwQWN0aW9ucygpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldHVwQWN0aW9ucygpIHtcclxuXHRcdCQoXCJkaXYuaW5mbyBidXR0b25cIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKGxvY2FsU3RvcmFnZSkge1xyXG5cdFx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCduZXdzLmluZm8uc2hvd2VkJywgJ3RydWUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMuaG9va3MuY29tbWVudC5zdWJtaXQpLmNsaWNrKGZ1bmN0aW9uKGU6IGFueSkge1xyXG5cdFx0XHR2YXIgaWQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5hdHRyKCdydC1kYXRhJyk7XHJcblx0XHRcdHZhciBjb250ZW50cyA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmZpbmQoJ3RleHRhcmVhJykudmFsKCk7XHJcblx0XHRcdG5ld3Muc3VibWl0Q29tbWVudChpZCwgY29udGVudHMpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3VibWl0Q29tbWVudChpZCwgY29udGVudHMpIHtcclxuXHRcdGlmKGNvbnRlbnRzLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdGNvbnRlbnRzOiBjb250ZW50c1xyXG5cdFx0fTtcclxuXHRcdHZhciByZXN1bHRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKHRoaXMucGF0aHMuY29tbWVudChpZCksIGRhdGEpO1xyXG5cdFx0cmVzdWx0cy5kb25lKGZ1bmN0aW9uKHJlc3VsdHM6IHN0cmluZykge1xyXG5cdFx0XHRyZXN1bHRzID0gJC5wYXJzZUpTT04ocmVzdWx0cyk7XHJcblx0XHRcdGlmKHJlc3VsdHMuZG9uZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzdWx0cy51cmw7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZXJyb3JcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcbn0iLCJjbGFzcyBOb3RpZmljYXRpb25zIHtcclxuICAgIGVsZW1lbnRzOiBhbnkgPSB7fTtcclxuICAgIHBhdGhzOiBhbnkgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucGF0aHMgPSB7XHJcbiAgICAgICAgICAgIG1hcmtSZWFkOiAnL25vdGlmaWNhdGlvbnMvbWFyay1yZWFkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJChcIltydC1ob29rPSdob29rIW5vdGlmaWNhdGlvbnM6bWFyay5yZWFkJ11cIikuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmF0dHIoJ3J0LWRhdGEnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgcmFkaW87XHJcbnZhciBjaGF0Ym94O1xyXG5jbGFzcyBSYWRpbyB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdG9ubGluZTogYm9vbGVhbiA9IHRydWU7XHJcblx0cG9wdXA6IGFueSA9IG51bGw7XHJcblx0c3RhdHVzOiBib29sZWFuID0gZmFsc2U7XHJcblx0c3RhdHVzQ2xvc2VkOiBzdHJpbmcgPSAnJztcclxuXHRzdGF0dXNPcGVuOiBzdHJpbmcgPSAnJztcclxuXHRVUkw6IHN0cmluZyA9ICcnO1xyXG5cdHZhck1lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG5cdHZhclN0YXR1czogc3RyaW5nID0gJyc7XHJcblxyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuVVJMID0gJ2h0dHA6Ly9hcHBzLnN0cmVhbWxpY2Vuc2luZy5jb20vcGxheWVyLXBvcHVwLnBocD9zaWQ9MjU3OSZzdHJlYW1faWQ9NDM4Nic7XHJcblx0XHR0aGlzLnN0YXR1c0Nsb3NlZCA9ICd0byBsaXN0ZW4gdG8gUnVuZVRpbWUgUmFkaW8hJztcclxuXHRcdHRoaXMuc3RhdHVzT3BlbiA9ICd0byBjbG9zZSBSdW5lVGltZSBSYWRpbyc7XHJcblx0XHR0aGlzLnZhck1lc3NhZ2UgPSAnI3JhZGlvLW1lc3NhZ2UnO1xyXG5cdFx0dGhpcy52YXJTdGF0dXMgPSAnI3JhZGlvLXN0YXR1cyc7XHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0dGhpcy5lbGVtZW50cyA9IHtcclxuXHRcdFx0c3RhdHVzTWVzc2FnZTogJyNyYWRpby1zdGF0dXMtbWVzc2FnZSdcclxuXHRcdH07XHJcblx0XHQkKCcjcmFkaW8tbGluaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZighcmFkaW8uc3RhdHVzKSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9PcGVuKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmFkaW8ucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcmFkaW8taGlzdG9yeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5vcGVuSGlzdG9yeSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JhZGlvLXJlcXVlc3QnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ucmVxdWVzdE9wZW4oKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNyYWRpby10aW1ldGFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0cmFkaW8ub3BlblRpbWV0YWJsZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCgnI3JlcXVlc3QtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjcHVsbC1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyYWRpby5wdWxsSGlkZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3Blbkhpc3RvcnkoKSB7XHJcblx0XHR2YXIgaGlzdG9yeSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9oaXN0b3J5Jyk7XHJcblx0XHRoaXN0b3J5LmRvbmUoZnVuY3Rpb24oaGlzdG9yeTogc3RyaW5nKSB7XHJcblx0XHRcdGhpc3RvcnkgPSAkLnBhcnNlSlNPTihoaXN0b3J5KTtcclxuXHRcdFx0dmFyIG11c2ljID0gbnVsbCxcclxuXHRcdFx0XHRodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYmxlJz48dGhlYWQ+PHRyPjx0ZD5UaW1lPC90ZD48dGQ+QXJ0aXN0PC90ZD48dGQ+TmFtZTwvdGQ+PC90cj48L3RoZWFkPjx0Ym9keT5cIjtcclxuXHRcdFx0Zm9yKHZhciB4ID0gMCwgeSA9IGhpc3RvcnkubGVuZ3RoOyB4IDwgeTsgeCsrKSB7XHJcblx0XHRcdFx0bXVzaWMgPSBoaXN0b3J5W3hdO1xyXG5cdFx0XHRcdGh0bWwgKz0gXCI8dHI+PHRkPlwiICsgdXRpbGl0aWVzLnRpbWVBZ28obXVzaWMuY3JlYXRlZF9hdCkgKyBcIjwvdGQ+PHRkPiBcIiArIG11c2ljLmFydGlzdCArIFwiPC90ZD48dGQ+XCIgKyBtdXNpYy5zb25nICsgXCI8L3RkPjwvdHI+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGh0bWwgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCI7XHJcblx0XHRcdHJhZGlvLnB1bGxPcGVuKGh0bWwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgb3BlblRpbWV0YWJsZSgpIHtcclxuXHRcdHZhciB0aW1ldGFibGUgPSB1dGlsaXRpZXMuZ2V0QUpBWCgncmFkaW8vdGltZXRhYmxlJyk7XHJcblx0XHR0aW1ldGFibGUuZG9uZShmdW5jdGlvbih0aW1ldGFibGU6IHN0cmluZykge1xyXG5cdFx0XHR0aW1ldGFibGUgPSAkLnBhcnNlSlNPTih0aW1ldGFibGUpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0ZXh0LWNlbnRlcic+PHRoZWFkPjx0cj48dGQ+Jm5ic3A7PC90ZD48dGQ+TW9uZGF5PC90ZD48dGQ+VHVlc2RheTwvdGQ+PHRkPldlZG5lc2RheTwvdGQ+PHRkPlRodXJzZGF5PC90ZD48dGQ+RnJpZGF5PC90ZD48dGQ+U2F0dXJkYXk8L3RkPjx0ZD5TdW5kYXk8L3RkPjwvdHI+PC90aGVhZD48dGJvZHk+XCI7XHJcblx0XHRcdGZvcih2YXIgeCA9IDAsIHkgPSAyMzsgeCA8PSB5OyB4KyspIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHRyPjx0ZD5cIiArIHggKyBcIjowMDwvdGQ+XCI7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDY7IGkgPD0gajsgaSsrKSB7XHJcblx0XHRcdFx0XHRodG1sICs9IFwiPHRkPlwiO1xyXG5cdFx0XHRcdFx0aWYodGltZXRhYmxlW2ldICE9PSB1bmRlZmluZWQgJiYgdGltZXRhYmxlW2ldW3hdICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0aHRtbCArPSB0aW1ldGFibGVbaV1beF07XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRodG1sICs9IFwiJm5ic3A7XCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aHRtbCArPSBcIjwvdGQ+XCI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sICs9IFwiPC90cj5cIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aHRtbCArPSBcIjwvdGJvZHk+PC90YWJsZT5cIjtcclxuXHRcdFx0cmFkaW8ucHVsbE9wZW4oaHRtbCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvbmxpbmVTZXR0aW5ncygpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHRoaXMucmFkaW9DbG9zZSgpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlRoZSByYWRpbyBoYXMgYmVlbiBzZXQgb2ZmbGluZS5cIik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudHMuc3RhdHVzTWVzc2FnZSkuaHRtbChcIlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsSGlkZSgpIHtcclxuXHRcdCQoJyNwdWxsLWNvbnRlbnRzJykuaHRtbCgnJm5ic3A7Jyk7XHJcblx0XHQkKCcjcmFkaW8tcHVsbCcpLndpZHRoKCcnKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRjc3Moe1xyXG5cdFx0XHRcdHdpZHRoOiAnMCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS53aWR0aCgnJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICcxMDAlJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBwdWxsT3Blbihjb250ZW50czogc3RyaW5nKSB7XHJcblx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoY29udGVudHMpO1xyXG5cdFx0JCgnI3JhZGlvLXB1bGwnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdGNzcyh7XHJcblx0XHRcdFx0d2lkdGg6ICc1MCUnXHJcblx0XHRcdH0pO1xyXG5cdFx0JCgnI3JhZGlvLW9wdGlvbnMnKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogJzUwJSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvQ2xvc2UoKSB7XHJcblx0XHRpZih0aGlzLnBvcHVwKSB7XHJcblx0XHRcdHRoaXMucG9wdXAuY2xvc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKHRoaXMudmFyTWVzc2FnZSkuaHRtbCh0aGlzLnN0YXR1c0Nsb3NlZCk7XHJcblx0XHR0aGlzLnN0YXR1cyA9IGZhbHNlO1xyXG5cdFx0JCh0aGlzLnZhclN0YXR1cylcclxuXHRcdFx0LnJlbW92ZUNsYXNzKCd0ZXh0LXN1Y2Nlc3MnKVxyXG5cdFx0XHQuYWRkQ2xhc3MoJ3RleHQtZGFuZ2VyJylcclxuXHRcdFx0Lmh0bWwoXCI8aSBpZD0ncG93ZXItYnV0dG9uJyBjbGFzcz0nZmEgZmEtcG93ZXItb2ZmJz48L2k+T2ZmXCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJhZGlvT3BlbigpIHtcclxuXHRcdGlmKHRoaXMub25saW5lICE9PSB0cnVlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnBvcHVwID0gd2luZG93Lm9wZW4odGhpcy5VUkwsICdSdW5lVGltZSBSYWRpbycsICd3aWR0aD0zODksaGVpZ2h0PTM1OScpO1xyXG5cdFx0dGhpcy5zdGF0dXMgPSB0cnVlO1xyXG5cdFx0JCh0aGlzLnZhck1lc3NhZ2UpLmh0bWwodGhpcy5zdGF0dXNPcGVuKTtcclxuXHRcdCQodGhpcy52YXJTdGF0dXMpLlxyXG5cdFx0XHRyZW1vdmVDbGFzcygndGV4dC1kYW5nZXInKS5cclxuXHRcdFx0YWRkQ2xhc3MoJ3RleHQtc3VjY2VzcycpLlxyXG5cdFx0XHRodG1sKFwiPGkgaWQ9J3Bvd2VyLWJ1dHRvbicgY2xhc3M9J2ZhIGZhLXBvd2VyLW9mZic+PC9pPk9uXCIpO1xyXG5cdFx0dmFyIHBvbGxUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHJhZGlvLnBvcHVwLmNsb3NlZCAhPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xyXG5cdFx0XHRcdHJhZGlvLnJhZGlvQ2xvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVxdWVzdE9wZW4oKSB7XHJcblx0XHR2YXIgcmVxdWVzdCA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnKTtcclxuXHRcdHJlcXVlc3QuZG9uZShmdW5jdGlvbihyZXF1ZXN0OiBzdHJpbmcpIHtcclxuXHRcdFx0cmVxdWVzdCA9ICQucGFyc2VKU09OKHJlcXVlc3QpO1xyXG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XHJcblx0XHRcdGlmKHJlcXVlc3QucmVzcG9uc2UgPT09IDIpIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPGZvcm0gcm9sZT0nZm9ybSc+PGRpdiBjbGFzcz0nZm9ybS1ncm91cCc+PGxhYmVsIGZvcj0ncmVxdWVzdC1hcnRpc3QnPkFydGlzdCBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtYXJ0aXN0JyBjbGFzcz0nZm9ybS1jb250cm9sJyBuYW1lPSdyZXF1ZXN0LWFydGlzdCcgcGxhY2Vob2xkZXI9J0FydGlzdCBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxsYWJlbCBmb3I9J3JlcXVlc3QtbmFtZSc+U29uZyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3JlcXVlc3QtbmFtZScgY2xhc3M9J2Zvcm0tY29udHJvbCcgbmFtZT0ncmVxdWVzdC1uYW1lJyBwbGFjZWhvbGRlcj0nU29uZyBOYW1lJyByZXF1aXJlZCAvPjwvZGl2PjxkaXYgY2xhc3M9J2Zvcm0tZ3JvdXAnPjxwIGlkPSdyZXF1ZXN0LWJ1dHRvbicgY2xhc3M9J2J0biBidG4tcHJpbWFyeSc+UmVxdWVzdDwvcD48L2Rpdj48L2Zvcm0+XCI7XHJcblx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnJlc3BvbnNlID09PSAxKSB7XHJcblx0XHRcdFx0aHRtbCArPSBcIjxwIGNsYXNzPSd0ZXh0LXdhcm5pbmcnPkF1dG8gREogY3VycmVudGx5IGRvZXMgbm90IGFjY2VwdCBzb25nIHJlcXVlc3RzLCBzb3JyeSFcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRodG1sICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5Zb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gcmVxdWVzdCBhIHNvbmcgZnJvbSB0aGUgREouPC9wPlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyYWRpby5wdWxsT3BlbihodG1sKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcjcmVxdWVzdC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmFkaW8ucmVxdWVzdFNlbmQoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LCAzMDAwKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZXF1ZXN0U2VuZCgpIHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHQnYXJ0aXN0JzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtYXJ0aXN0JykudmFsdWUsXHJcblx0XHRcdCduYW1lJzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcXVlc3QtbmFtZScpLnZhbHVlXHJcblx0XHR9O1xyXG5cdFx0dmFyIGNvbnRlbnRzID0gdXRpbGl0aWVzLnBvc3RBSkFYKCdyYWRpby9yZXF1ZXN0L3NvbmcnLCBkYXRhKTtcclxuXHRcdGNvbnRlbnRzLmRvbmUoZnVuY3Rpb24oY29udGVudHM6IHN0cmluZykge1xyXG5cdFx0XHRjb250ZW50cyA9ICQucGFyc2VKU09OKGNvbnRlbnRzKTtcclxuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHRpZihjb250ZW50cy5zZW50ID09PSB0cnVlKSB7XHJcblx0XHRcdFx0aHRtbCA9IFwiPHAgY2xhc3M9J3RleHQtc3VjY2Vzcyc+WW91ciByZXF1ZXN0IGhhcyBiZWVuIHNlbnQgdG8gdGhlIERKPC9wPlwiO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGh0bWwgPSBcIjxwIGNsYXNzPSd0ZXh0LWRhbmdlcic+VGhlcmUgd2FzIGFuIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0LiAgVHJ5IGFnYWluP1wiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKCcjcHVsbC1jb250ZW50cycpLmh0bWwoaHRtbCk7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMucHVsbEhpZGUoKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdXBkYXRlKCkge1xyXG5cdFx0JCgnI3JlcXVlc3RzLXVzZXItY3VycmVudCcpLmh0bWwoJycpO1xyXG5cdFx0dmFyIHVwZGF0ZSA9IHV0aWxpdGllcy5nZXRBSkFYKCdyYWRpby91cGRhdGUnKTtcclxuXHRcdHVwZGF0ZS5kb25lKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG5cdFx0XHR1cGRhdGUgPSAkLnBhcnNlSlNPTih1cGRhdGUpO1xyXG5cdFx0XHR2YXIgcmVxdWVzdHNIVE1MID0gXCJcIjtcclxuXHRcdFx0JCgnI3JhZGlvLXNvbmctbmFtZScpLmh0bWwodXBkYXRlWydzb25nJ11bJ25hbWUnXSk7XHJcblx0XHRcdCQoJyNyYWRpby1zb25nLWFydGlzdCcpLmh0bWwodXBkYXRlWydzb25nJ11bJ2FydGlzdCddKTtcclxuXHRcdFx0aWYodXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKCcjcmFkaW8tZGonKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyNyYWRpby1kaicpLmh0bWwoXCJBdXRvIERKXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih1cGRhdGVbJ21lc3NhZ2UnXSAhPT0gJycgJiYgdXBkYXRlWydtZXNzYWdlJ10gIT09IC0xKSB7XHJcblx0XHRcdFx0JChcIltydC1kYXRhPSdyYWRpbzptZXNzYWdlLmNvbnRlbnRzJ11cIikuaHRtbCh1cGRhdGVbJ21lc3NhZ2UnXSk7XHJcblx0XHRcdH0gZWxzZSBpZih1cGRhdGVbJ21lc3NhZ2UnXSA9PT0gLTEgJiYgdXBkYXRlWydkaiddICE9PSBudWxsICYmIHVwZGF0ZVsnZGonXSAhPT0gJycpIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiREogXCIgKyB1cGRhdGVbJ2RqJ10gKyBcIiBpcyBjdXJyZW50bHkgb24gYWlyIVwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKFwiW3J0LWRhdGE9J3JhZGlvOm1lc3NhZ2UuY29udGVudHMnXVwiKS5odG1sKFwiQXV0byBESiBpcyBjdXJyZW50bHkgb24gYWlyXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IodmFyIHggPSAwLCB5ID0gdXBkYXRlWydyZXF1ZXN0cyddLmxlbmd0aDsgeCA8IHk7IHgrKykge1xyXG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gdXBkYXRlWydyZXF1ZXN0cyddW3hdO1xyXG5cdFx0XHRcdGlmKHJlcXVlc3Quc3RhdHVzID09IDApIHtcclxuXHRcdFx0XHRcdHJlcXVlc3RzSFRNTCArPSBcIjxwPlwiO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PSAxKSB7XHJcblx0XHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8cCBjbGFzcz0ndGV4dC1zdWNjZXNzJz5cIjtcclxuXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT0gMikge1xyXG5cdFx0XHRcdFx0cmVxdWVzdHNIVE1MICs9IFwiPHAgY2xhc3M9J3RleHQtZGFuZ2VyJz5cIjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJlcXVlc3RzSFRNTCArPSByZXF1ZXN0LnNvbmdfbmFtZSArIFwiIGJ5IFwiICsgcmVxdWVzdC5zb25nX2FydGlzdDtcclxuXHRcdFx0XHRyZXF1ZXN0c0hUTUwgKz0gXCI8L3A+XCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoJyNyZXF1ZXN0cy11c2VyLWN1cnJlbnQnKS5odG1sKHJlcXVlc3RzSFRNTCk7XHJcblxyXG5cdFx0XHRyYWRpby5vbmxpbmUgPSB1cGRhdGUub25saW5lO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJhZGlvLnVwZGF0ZSgpO1xyXG5cdFx0XHR9LCAzMDAwMCk7XHJcblx0XHRcdHJhZGlvLm9ubGluZVNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJ2YXIgc2lnbnVwRm9ybTtcclxuY2xhc3MgU2lnbnVwRm9ybSB7XHJcblx0ZWxlbWVudHM6IGFueSA9IHt9O1xyXG5cdHBhdGhzOiBhbnkgPSB7fTtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZWxlbWVudHMgPSB7XHJcblx0XHRcdGRpc3BsYXlOYW1lOiAnI2Rpc3BsYXlfbmFtZScsXHJcblx0XHRcdGVtYWlsOiAnI2VtYWlsJyxcclxuXHRcdFx0cGFzc3dvcmQ6ICcjcGFzc3dvcmQnLFxyXG5cdFx0XHRwYXNzd29yZDI6ICcjcGFzc3dvcmQyJyxcclxuXHRcdFx0c2VjdXJpdHlDaGVjazogJyNzZWN1cml0eSdcclxuXHRcdH07XHJcblx0XHR0aGlzLnBhdGhzID0ge1xyXG5cdFx0XHRjaGVja0F2YWlsYWJpbGl0eTogJy9nZXQvc2lnbnVwLydcclxuXHRcdH07XHJcblx0XHR2YXIgc3RvcHBlZFR5cGluZ0Rpc3BsYXlOYW1lLFxyXG5cdFx0XHRzdG9wcGVkVHlwaW5nRW1haWwsXHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCxcclxuXHRcdFx0dGltZW91dCA9IDUwMDtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5kaXNwbGF5TmFtZSkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nRGlzcGxheU5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdEaXNwbGF5TmFtZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tBdmFpbGFiaWxpdHkoJ2Rpc3BsYXlfbmFtZScpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLmVtYWlsKS5iaW5kKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYoc3RvcHBlZFR5cGluZ0VtYWlsKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHN0b3BwZWRUeXBpbmdFbWFpbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RvcHBlZFR5cGluZ0VtYWlsID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2lnbnVwRm9ybS5jaGVja0F2YWlsYWJpbGl0eSgnZW1haWwnKTtcclxuXHRcdFx0fSwgdGltZW91dCk7XHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikuYmluZCgnaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmKHN0b3BwZWRUeXBpbmdQYXNzd29yZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzdG9wcGVkVHlwaW5nUGFzc3dvcmQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0b3BwZWRUeXBpbmdQYXNzd29yZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNpZ251cEZvcm0uY2hlY2tQYXNzd29yZCgpO1xyXG5cdFx0XHR9LCB0aW1lb3V0KTtcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmVsZW1lbnRzLnNlY3VyaXR5Q2hlY2spLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5jaGVja1NlY3VyaXR5KCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJ2Zvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0c2lnbnVwRm9ybS5zdWJtaXQoZSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNoZWNrQXZhaWxhYmlsaXR5KGZpZWxkOiBzdHJpbmcpIHtcclxuXHRcdHZhciB2YWwgPSAkKCcjJyArIGZpZWxkKS52YWwoKTtcclxuXHRcdGlmKHZhbC5sZW5ndGggPT09IDApXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdHZhciB1cmwgPSB0aGlzLnBhdGhzLmNoZWNrQXZhaWxhYmlsaXR5ICsgZmllbGQ7XHJcblx0XHR2YXIgYXZhaWxhYmxlO1xyXG5cdFx0aWYoZmllbGQgPT09IFwiZGlzcGxheV9uYW1lXCIpIHtcclxuXHRcdFx0YXZhaWxhYmxlID0gdXRpbGl0aWVzLnBvc3RBSkFYKHVybCwgeyBkaXNwbGF5X25hbWU6IHZhbCB9KTtcclxuXHRcdH0gZWxzZSBpZihmaWVsZCA9PT0gXCJlbWFpbFwiKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5wb3N0QUpBWCh1cmwsIHsgZW1haWw6IHZhbCB9KTtcclxuXHRcdH1cclxuXHRcdGF2YWlsYWJsZS5kb25lKGZ1bmN0aW9uKGF2YWlsYWJsZTogc3RyaW5nKSB7XHJcblx0XHRcdGF2YWlsYWJsZSA9IHV0aWxpdGllcy5KU09ORGVjb2RlKGF2YWlsYWJsZSk7XHJcblx0XHRcdGlmKGF2YWlsYWJsZS5hdmFpbGFibGUgPT09IHRydWUpIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLW9rJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLXN1Y2Nlc3MnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoYXMtZXJyb3InKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdFx0cGFyZW50KCkuXHJcblx0XHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdFx0ZmluZCgnLmdseXBoaWNvbi1vaycpLlxyXG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y2hlY2tQYXNzd29yZCgpIHtcclxuXHRcdHZhciB2MSA9ICQodGhpcy5lbGVtZW50cy5wYXNzd29yZCkudmFsKCksXHJcblx0XHRcdHYyID0gJCh0aGlzLmVsZW1lbnRzLnBhc3N3b3JkMikudmFsKCk7XHJcblx0XHRpZih2Mi5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGlmKHYxID09PSB2Mikge1xyXG5cdFx0XHRcdHRoaXMudG9nZ2xlRmVlZGJhY2soJ3Bhc3N3b3JkJywgdHJ1ZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgdHJ1ZSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQnLCBmYWxzZSk7XHJcblx0XHRcdFx0dGhpcy50b2dnbGVGZWVkYmFjaygncGFzc3dvcmQyJywgZmFsc2UpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hlY2tTZWN1cml0eSgpIHtcclxuXHRcdHZhciBzbGlkZXJWYWwgPSAkKHRoaXMuZWxlbWVudHMuc2VjdXJpdHlDaGVjaykudmFsKCk7XHJcblx0XHRpZihzbGlkZXJWYWwgPD0gMTApIHtcclxuXHRcdFx0JCgnZm9ybSBidXR0b24nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHQkKCdmb3JtIC50ZXh0LWRhbmdlcicpLmNzcyh7XHJcblx0XHRcdFx0ZGlzcGxheTogJ25vbmUnXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIGlmKHNsaWRlclZhbCA+IDEwKSB7XHJcblx0XHRcdCQoJ2Zvcm0gYnV0dG9uJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuXHRcdFx0JCgnZm9ybSAudGV4dC1kYW5nZXInKS5jc3Moe1xyXG5cdFx0XHRcdGRpc3BsYXk6ICdibG9jaydcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdWJtaXQoZTogYW55KSB7XHJcblx0XHR2YXIgdXNlcm5hbWUgPSB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5KCd1c2VybmFtZScpLFxyXG5cdFx0XHRlbWFpbCA9IHRoaXMuY2hlY2tBdmFpbGFiaWxpdHkoJ2VtYWlsJyksXHJcblx0XHRcdHBhc3MgPSB0aGlzLmNoZWNrUGFzc3dvcmQoKTtcclxuXHRcdGlmKHVzZXJuYW1lID09PSB0cnVlICYmIGVtYWlsID09PSB0cnVlICYmIHBhc3MgPT09IHRydWUpIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRvZ2dsZUZlZWRiYWNrKGZpZWxkOiBzdHJpbmcsIHN0YXR1czogYm9vbGVhbikge1xyXG5cdFx0aWYoc3RhdHVzID09PSB0cnVlKSB7XHJcblx0XHRcdCQoJyNzaWdudXAtJyArIGZpZWxkKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGFzLWVycm9yJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0ZmluZCgnLmNvbC1sZy0xMCcpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnaGlkZGVuJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdzaG93JykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hpZGRlbicpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5oZWxwLWJsb2NrJykuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ3Nob3cnKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnaGlkZGVuJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKCcjc2lnbnVwLScgKyBmaWVsZCkuXHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoJ2hhcy1zdWNjZXNzJykuXHJcblx0XHRcdFx0YWRkQ2xhc3MoJ2hhcy1lcnJvcicpLlxyXG5cdFx0XHRcdGZpbmQoJy5jb2wtbGctMTAnKS5cclxuXHRcdFx0XHRmaW5kKCcuZ2x5cGhpY29uLXJlbW92ZScpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdHBhcmVudCgpLlxyXG5cdFx0XHRcdGZpbmQoJy5nbHlwaGljb24tb2snKS5cclxuXHRcdFx0XHRyZW1vdmVDbGFzcygnc2hvdycpLlxyXG5cdFx0XHRcdGFkZENsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRwYXJlbnQoKS5cclxuXHRcdFx0XHRmaW5kKCcuaGVscC1ibG9jaycpLlxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKCdoaWRkZW4nKS5cclxuXHRcdFx0XHRhZGRDbGFzcygnc2hvdycpO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsImNsYXNzIFN0YWZmTGlzdCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB2YXIgbWVtYmVycyA9ICQoXCJbcnQtaG9vaz0naG9vayFzdGFmZi5saXN0OmNhcmQnXVwiKTtcclxuICAgICAgICAkLmVhY2gobWVtYmVycywgZnVuY3Rpb24oaW5kZXg6IG51bWJlciwgdmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodmFsKS5hdHRyKCdydC1kYXRhJyk7XHJcbiAgICAgICAgICAgICQodmFsKS5maW5kKCcuZnJvbnQnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgnL2ltZy9mb3J1bXMvcGhvdG9zL1wiICsgaWQgKyBcIi5wbmcnKVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKHZhbCkuYmluZCgndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnaG92ZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJ2YXIgdXRpbGl0aWVzO1xyXG5jbGFzcyBVdGlsaXRpZXMge1xyXG4gICAgcHVibGljIGN1cnJlbnRUaW1lKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9ybVRva2VuKHRva2VuOiBzdHJpbmcpIHtcclxuICAgICAgICB0b2tlbiA9IGF0b2IodG9rZW4pO1xyXG4gICAgICAgICQoJ2Zvcm0nKS5hcHBlbmQoXCI8aW5wdXQgdHlwZT0naGlkZGVuJyBuYW1lPSdfdG9rZW4nIHZhbHVlPSdcIiArIHRva2VuICsgXCInIC8+XCIpO1xyXG5cclxuICAgICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21ldGEnKTtcclxuICAgICAgICBtZXRhLm5hbWUgPSAnX3Rva2VuJztcclxuICAgICAgICBtZXRhLmNvbnRlbnQgPSB0b2tlbjtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChtZXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QUpBWChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBwYXRoLFxyXG4gICAgICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICAgICAgZGF0YVR5cGU6ICdodG1sJyxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgSlNPTkRlY29kZShqc29uOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gJC5wYXJzZUpTT04oanNvbik7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcG9zdEFKQVgocGF0aDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBkYXRhLl90b2tlbiA9ICQoJ21ldGFbbmFtZT1cIl90b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBwYXRoLFxyXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNjcm9sbFRvKGVsZW1lbnQ6IGFueSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBzY3JvbGxUb3A6ICQoZWxlbWVudCkub2Zmc2V0KCkudG9wXHJcbiAgICAgICAgfSwgdGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRpbWVBZ28odHM6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBub3dUcyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxyXG4gICAgICAgICAgICBzZWNvbmRzID0gbm93VHMgLSB0cztcclxuICAgICAgICBpZihzZWNvbmRzID4gMiAqIDI0ICogMzYwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhIGZldyBkYXlzIGFnb1wiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gMjQgKiAzNjAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInllc3RlcmRheVwiO1xyXG4gICAgICAgIH0gZWxzZSBpZihzZWNvbmRzID4gNzIwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzZWNvbmRzIC8gMzYwMCkgKyBcIiBob3VycyBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+IDM2MDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW4gaG91ciBhZ29cIjtcclxuICAgICAgICB9IGVsc2UgaWYoc2Vjb25kcyA+PSAxMjApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKSArIFwiIG1pbnV0ZXMgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPj0gNjApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiMSBtaW51dGUgYWdvXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmKHNlY29uZHMgPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWNvbmRzICsgXCIgc2Vjb25kcyBhZ29cIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIxIHNlY29uZCBhZ29cIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxudXRpbGl0aWVzID0gbmV3IFV0aWxpdGllcygpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==