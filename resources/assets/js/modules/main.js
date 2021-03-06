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
    $('#top').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });
    $(window).scroll(function () {
        var height = $('body').height(), scroll = $(window).scrollTop(), top = $('#top');
        if (scroll > height / 10) {
            if (!$(top).hasClass('set-vis')) {
                $(top).fadeIn(200).
                    toggleClass('set-vis');
            }
        }
        else {
            if ($(top).hasClass('set-vis')) {
                $(top).fadeOut(200).
                    toggleClass('set-vis');
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
