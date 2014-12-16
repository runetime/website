var runetime;
class RuneTime {
	loading:string = '#loading';
}
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
		var height = $('body').height(),
			scroll = $(window).scrollTop(),
			top = $('#top');
		if(scroll > height/10) {
			if(!$(top).hasClass('set-vis')) {
				$(top).fadeIn(200).
					toggleClass('set-vis');
			}
		} else {
			if($(top).hasClass('set-vis')) {
				$(top).fadeOut(200).
					toggleClass('set-vis');
			}
		}
	});
	$('.navbar .dropdown').hover(function() {
		$(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
	}, function() {
		$(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp()
	});
});