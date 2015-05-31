<?php
/**
 * About
 */
get('about', 'AboutController@getIndex');

/*
 * API
 */
Route::group(['prefix' => 'api'], function () {
    /*
     * Version 1 of the API.
     */
    Route::group(['prefix' => 'v1'], function () {
        get('awards', 'APIController@getAwards');
        post('user', 'APIController@postUser');
    });
});

/*
 * Auth
 */
Route::group([], function () {
    get('auth/login', 'AuthController@getRedirect');
    /*
     * Logged in
     */
    Route::group(['middleware' => 'auth'], function () {
        get('logout', 'AuthController@getLogout');
    });

    /*
     * Not logged in
     */
    Route::group(['middleware' => 'guest'], function () {
        /*
         * Login
         */
        Route::group(['prefix' => 'login'], function () {
            get('/', 'AuthController@getLoginForm');
            post('/', 'AuthController@postLoginForm');
        });

        /*
         * Signup
         */
        Route::group(['prefix' => 'signup'], function () {
            get('/', 'AuthController@getSignupForm');
            post('/', 'AuthController@postSignupForm');
        });

        /*
         * Password Reset
         */
        Route::group(['prefix' => 'password/reset'], function () {
            get('/', 'AuthController@getPasswordEmail');
            post('/', 'AuthController@postPasswordEmail');
            get('{token}', 'AuthController@getPasswordReset');
            post('{token}', 'AuthController@postPasswordReset');
        });
    });
});

/*
 * Awards
 */
Route::group(['prefix' => 'awards'], function () {
    get('/', 'AwardController@getIndex');
    get('{slug}', 'AwardController@getView');
});

/*
 * Calculators
 */
Route::group(['prefix' => 'calculators'], function () {
    get('/', 'CalculatorController@getIndex');
    Route::group(['prefix' => 'combat'], function () {
        get('/', 'CalculatorController@getCombat');
        get('3', 'CalculatorController@getCombat3');
        get('old-school', 'CalculatorController@getCombatOSRS');
        post('/load', 'CalculatorController@getCombatLoad');
    });
    get('{type}', 'CalculatorController@getView');
    post('load', 'CalculatorController@postLoad');
});

/*
 * Chat
 */
Route::group(['prefix' => 'chat'], function () {
    get('channels', 'ChatController@getChannels');
    post('channels/check', 'ChatController@postCheckChannel');
    get('moderator', 'ChatController@getModerator');
    get('pinned', 'ChatController@getPinned');
    post('post/message', 'ChatController@postMessage');
    post('start', 'ChatController@postStart');
    post('update', 'ChatController@postUpdate');
    /*
     * Only moderators can perform
     */
    Route::group(['middleware' => 'staff.moderator'], function () {
        post('status-change', 'ChatController@postStatusChange');
    });
});

/*
 * Clan
 */
get('clan', 'ClanController@getIndex');

/*
 * Contact
 */
Route::group(['prefix' => 'contact'], function () {
    get('/', 'ContactController@getIndex');
    post('submit', 'ContactController@postSubmit');
});

/*
 * Cookies
 */
get('cookies', 'CookieController@getIndex');

/*
 * Donate
 *
 * TODO: WIP, make this Stripe-friendly and
 * allow subscription donations w/ perks.
 */
get('donate', 'DonateController@getIndex');

/*
 * Forums
 */
Route::group(['prefix' => 'forums'], function () {
    get('/', 'ForumController@getIndex');
    get('{id}-{name}', 'ForumController@getSubforum');
    /*
     * Thread
     */
    Route::group(['prefix' => 'thread/{id}-{name}'], function () {
        get('/', 'ForumThreadController@getThread');
        get('last-post', 'ForumThreadController@getLastPost');
        get('page={page}', 'ForumThreadController@getThread');
        /*
         * User-only
         */
        Route::group(['middleware' => 'auth'], function () {
            get('edit', 'ForumThreadController@getThreadEdit');
            post('reply', 'ForumPostController@postReply');
        });
    });

    /*
     * Create Thread
     */
    Route::group(['middleware' => 'auth', 'prefix' => 'create/{id}-{name}'], function () {
        get('/', 'ForumThreadController@getCreate');
        post('/', 'ForumThreadController@postCreate');
    });

    /*
     * Tags
     */
    Route::group(['prefix' => 'tag'], function () {
        get('{name}', 'ForumController@getTagSearch');
    });

    /*
     * Poll
     */
    Route::group(['prefix' => 'poll'], function () {
        post('vote', 'ForumController@postPollVote');
    });

    /*
     * Posts
     */
    Route::group(['middleware' => 'auth', 'prefix' => 'post/{id}'], function () {
        /*
         * Reporting a post
         */
        Route::group(['prefix' => 'report'], function () {
            get('/', 'ForumPostController@getReport');
            post('/', 'ForumPostController@postReport');
        });

        /*
         * Editing a post
         */
        Route::group(['prefix' => 'edit'], function () {
            get('/', 'ForumPostController@getEdit');
            post('/', 'ForumPostController@postEdit');
        });

        /*
         * Post voting
         */
        Route::group(['prefix' => 'vote'], function () {
            post('/', 'ForumPostController@postVote');
        });

        /*
         * Deleting a post
         */
        Route::group(['middleware' => 'staff.moderator'], function () {
            get('delete', 'ForumPostController@getDelete');
        });
    });

    /*
     * Statuses
     */
    Route::group(['prefix' => 'statuses'], function () {
        get('/', 'StatusController@getIndex');
        /*
         * Status routes
         */
        Route::group(['prefix' => '{id}-by{name}'], function () {
            get('/', 'StatusController@getView');
            /*
             * Reply
             */
            Route::group(['middleware' => 'auth'], function () {
                post('reply', 'StatusController@postReply');
            });

            /*
             * Switch Status
             */
            Route::group(['middleware' => 'staff.moderator'], function () {
                get('status={newStatus}', 'StatusController@getStatusSwitch');
            });
        });

        /*
         * Create
         */
        Route::group(['middleware' => 'auth', 'prefix' => 'create'], function () {
            get('/', 'StatusController@getCreate');
            post('/', 'StatusController@postCreate');
        });
    });
});

/*
 * Get
 */
Route::group(['prefix' => 'get'], function () {
    post('signup/email', 'GetController@postEmail');
    post('signup/display_name', 'GetController@postDisplayName');
    get('hiscore/{rsn}', 'GetController@getHiscore');
});

/*
 * Home
 */
get('/', 'HomeController@getIndex');
get('home', 'HomeController@getIndex');

/*
 * Language
 */
Route::group(['prefix' => 'language'], function () {
    /*
     * Set The User's Language
     */
    Route::group(['prefix' => 'set'], function () {
        get('/', 'LanguageController@getSet');
        get('{initials}', 'LanguageController@getChange');
    });
});

/*
 * Legal
 */
Route::group([], function () {
    get('legal/{language}', 'LegalController@getLegal');
    get('privacy', 'LegalController@getPrivacy');
    get('terms', 'LegalController@getTerms');
});

/*
 * Livestream
 */
Route::group(['prefix' => 'livestream'], function () {
    get('/', 'LivestreamController@getIndex');
    get('reset', 'LivestreamController@getReset');
    post('reset', 'LivestreamController@postReset');
});

/*
 * Media
 */
get('media', 'MediaController@getIndex');

/*
 * Members
 */
Route::group(['prefix' => 'members'], function () {
    get('/', 'MembersController@getIndex');
    get('role={searchRole}/prefix={searchPrefix}/order={searchOrder}', 'MembersController@getIndex');
    get('role={searchRole}/prefix={searchPrefix}/order={searchOrder}/page={page}', 'MembersController@getIndex');
});

/*
 * Messenger
 */
Route::group(['middleware' => 'auth', 'prefix' => 'messenger'], function () {
    get('/', 'MessengerController@getIndex');
    get('{id}-{name}', 'MessengerController@getView');
    post('{id}-{name}/reply', 'MessengerController@postReply');
    /*
     * Compose
     */
    Route::group(['prefix' => 'compose'], function () {
        get('/', 'MessengerController@getCreate');
        get('to={id}-{name}', 'MessengerController@getCreate');
        post('/', 'MessengerController@postCreate');
    });
});

/*
 * Name Checker
 */
Route::group(['prefix' => 'name-check'], function () {
    get('/', 'NameCheckerController@getIndex');
    get('plain', 'NameCheckerController@getPlain');
    post('/', 'NameCheckerController@postCheck');
});

/*
 * News
 */
Route::group(['prefix' => 'news'], function () {
    get('/', 'NewsController@getView');
    /*
     * Article
     */
    Route::group(['prefix' => '{id}-{name}'], function () {
        get('/', 'NewsController@getArticle');
        get('comments', 'NewsController@getArticle', ['comments' => true]);
        /*
         * Comment on an article
         */
        Route::group(['middleware' => 'auth'], function () {
            post('reply', 'NewsController@postReply');
        });
    });

    /*
     * Staff only
     */
    Route::group(['middleware' => 'staff'], function () {
        /*
         * Create newspiece
         */
        Route::group(['prefix' => 'create'], function () {
            get('/', 'NewsController@getCreate');
            post('/', 'NewsController@postCreate');
        });
    });

    get('{tag}', 'NewsController@getView');
});

/*
 * Notifications
 */
Route::group(['middleware' => 'auth', 'prefix' => 'notifications'], function () {
    get('/', 'NotificationController@getIndex');
    get('{id}-at{time}', 'NotificationController@getView');
    get('set-all-read', 'NotificationController@getSetAllRead');
});

/*
 * Play
 */
Route::group(['prefix' => 'play'], function () {
    get('/', 'PlayController@getIndex');
    get('3', 'PlayController@get3');
    get('osrs', 'PlayController@getOSRS');
});

/*
 * Profile
 */
Route::group(['prefix' => 'profile/{id}-{name}'], function () {
    get('/', 'ProfileController@getProfileIndex');
    get('awards', 'ProfileController@getProfileAwards');
    get('feed', 'ProfileController@getProfileFeed');
    get('friends', 'ProfileController@getProfileFriends');
});

/*
 * Radio
 */
Route::group(['prefix' => 'radio'], function () {
    get('/', 'RadioController@getIndex');
    get('history', 'RadioController@getHistory');
    get('open', 'RadioController@getOpen');
    get('timetable', 'RadioController@getTimetable');
    get('request/song', 'RadioController@getRequest');
    get('update', 'RadioController@getUpdate');
    /*
     * TODO: Make song requests guest-usable
     */
    Route::group(['middleware' => 'auth'], function () {
        post('request/song', 'RadioController@postRequest');
    });
});

/*
 * Search
 */
post('search', 'SearchController@postSubmit');

/*
 * Settings
 */
Route::group(['middleware' => 'auth', 'prefix' => 'settings'], function () {
    get('/', 'SettingsController@getIndex');
    post('/', 'SettingsController@postIndex');
    get('about-me', 'SettingsController@getAbout');
    post('about-me', 'SettingsController@postAbout');
    get('password', 'SettingsController@getPassword');
    post('password', 'SettingsController@postPassword');
    get('photo', 'SettingsController@getPhoto');
    post('photo', 'SettingsController@postPhoto');
    get('runescape', 'SettingsController@getRunescape');
    post('runescape', 'SettingsController@postRunescape');
    get('signature', 'SettingsController@getSignature');
    post('signature', 'SettingsController@postSignature');
    get('social', 'SettingsController@getSocial');
    post('social', 'SettingsController@postSocial');
});

/*
 * Signatures
 */
Route::group(['prefix' => 'signatures'], function () {
    get('/', 'SignatureController@getIndex');
    post('/', 'SignatureController@postUsername');
    get('username={username}/type={type}', 'SignatureController@getStyle');
    get('username={username}/type={type}/style={style}', 'SignatureController@getFinal');
    get('h{slug}', 'SignatureController@getDisplay');
});

/*
 * Staff
 */
Route::group(['prefix' => 'staff'], function () {
    get('list', 'StaffController@getList');
    /*
     * Only staff can access
     */
    Route::group(['middleware' => 'staff'], function () {
        get('/', 'StaffController@getIndex');
        get('checkup', 'StaffController@getCheckup');
        post('checkup', 'StaffController@postCheckup');
        post('mute', 'StaffController@postUserMute');
        post('report', 'StaffController@postUserReport');

        /*
         * Administrator Panel
         */
        Route::group(['middleware' => 'staff.admin', 'prefix' => 'administrator'], function () {
            get('/', 'StaffAdminController@getIndex');
            /*
             * Checkup Viewing
             */
            Route::group(['prefix' => 'checkups'], function () {
                get('/', 'StaffAdminController@getCheckupList');
                get('{id}/view', 'StaffAdminController@getCheckupView');
                post('mark-completed', 'StaffAdminController@postCheckupMark');
            });

            post('ip-ban', 'StaffAdminController@postIPBan');
            post('radio-stop', 'StaffAdminController@postRadioStop');
            post('staff-demote', 'StaffAdminController@postStaffDemote');
            /*
             * User List
             */
            Route::group(['prefix' => 'users'], function () {
                get('/', 'StaffAdminController@getUserList');
                get('search-all', 'StaffAdminController@getUserSearchAll');
                get('{id}-{name}', 'StaffAdminController@getUserView');
                post('{id}-{name}', 'StaffAdminController@postUserView');
                post('award-add', 'StaffAdminController@postAward');
                post('chatbox-remove', 'StaffAdminController@postUserChatboxRemove');
                post('forum-posts', 'StaffAdminController@postUserForumPosts');
                post('ip-ban', 'StaffAdminController@postIpBan');
                post('search', 'StaffAdminController@postUserSearch');
            });
        });

        /*
         * Moderation Panel
         */
        Route::group(['middleware' => 'staff.moderator', 'prefix' => 'moderation'], function () {
            get('thread/{id}-{name}/status={status}', 'StaffModerationController@getThreadStatusSwitch');
        });

        /*
         * Radio Panel
         */
        Route::group(['middleware' => 'staff.radio', 'prefix' => 'radio'], function () {
            get('/', 'StaffRadioController@getRadioIndex');
            /*
             * Live
             */
            Route::group(['prefix' => 'live'], function () {
                get('/', 'StaffRadioController@getRadioLive');
                post('/', 'StaffRadioController@postRadioLive');
                post('message', 'StaffRadioController@postRadioLiveMessage');
                post('request', 'StaffRadioController@postRadioRequest');
                get('update', 'StaffRadioController@getRadioLiveUpdate');
                get('stop', 'StaffRadioController@getRadioLiveStop');
            });

            /*
             * Messages
             */
            Route::group(['prefix' => 'messages'], function () {
                get('/', 'StaffRadioController@getRadioMessages');
                post('/', 'StaffRadioController@postRadioMessages');
            });

            /*
             * Timetable
             */
            Route::group(['prefix' => 'timetable'], function () {
                get('/', 'StaffRadioController@getRadioTimetable');
                post('/', 'StaffRadioController@postRadioTimetable');
            });
        });

        /*
         * Team Leader Panel
         */
        Route::group(['middleware' => 'staff.team_leader', 'prefix' => 'leader'], function () {
            get('/', 'StaffTeamLeaderController@getIndex');
            post('demote', 'StaffTeamLeaderController@postDemote');
            post('temp-ban', 'StaffTeamLeaderController@postTempBan');
            post('mute', 'StaffTeamLeaderController@postMuteUser');
            post('clear-chatbox', 'StaffTeamLeaderController@postClearChatbox');
            post('chatbox-clear', 'StaffTeamLeaderController@postClearChatbox');
        });
    });
});

/*
 * Tickets
 */
Route::group(['middleware' => 'auth', 'prefix' => 'tickets'], function () {
    get('/', 'TicketController@getIndex');
    /*
     * Viewing and dealing with ticket
     */
    Route::group(['prefix' => '{id}-{name}'], function () {
        get('/', 'TicketController@getView');
        get('close', 'TicketController@getClose');
        post('reply', 'TicketController@postReply');

        /*
         * Must be a staff member
         */
        Route::group(['middleware' => 'staff'], function () {
            get('status/switch={status}', 'TicketController@getStatusSwitch');
        });
    });

    /*
     * Create
     */
    Route::group(['prefix' => 'create'], function () {
        get('/', 'TicketController@getCreate');
        post('/', 'TicketController@postCreate');
    });

    /*
     * Manage: staff only
     */
    Route::group(['prefix' => 'manage'], function () {
        get('/', 'TicketController@getManageIndex');
    });
});

/*
 * Transparency
 */
Route::group(['prefix' => 'transparency'], function () {
    get('/', 'TransparencyController@getIndex');
    get('markdown', 'TransparencyController@getMarkdownIndex');
    get('markdown/reference', 'TransparencyController@getMarkdownReference');
});
