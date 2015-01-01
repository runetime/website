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
		$(this).find('.dropdown-menu').first().stop(true, true).delay(50).slideDown();
	}, function() {
		$(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp()
	});
});

var toggleSearch;
/**
 * Tympanus codrops
 * Morph search
 */
$(function() {
	var morphSearch = document.getElementById( 'morphsearch' ),
		input = morphSearch.querySelector( 'input.morphsearch-input' ),
		ctrlClose = morphSearch.querySelector( 'span.morphsearch-close' ),
		isOpen = false;
	// show/hide search area
	toggleSearch = function(action) {
			var offsets = morphsearch.getBoundingClientRect();
			if( action === 'close' ) {
				classie.remove( morphSearch, 'open' );

				// trick to hide input text once the search overlay closes
				// todo: hardcoded times, should be done after transition ends
				if( input.value !== '' ) {
					setTimeout(function() {
						classie.add( morphSearch, 'hideInput' );
						setTimeout(function() {
							classie.remove( morphSearch, 'hideInput' );
							input.value = '';
						}, 300 );
					}, 500);
				}

				input.blur();
			}
			else {
				classie.add( morphSearch, 'open' );
			}
			isOpen = !isOpen;
		};

	// events
	ctrlClose.addEventListener( 'click', toggleSearch );
	// esc key closes search overlay
	// keyboard navigation events
	document.addEventListener( 'keydown', function( ev ) {
		var keyCode = ev.keyCode || ev.which;
		if( keyCode === 27 && isOpen ) {
			toggleSearch(ev);
		}
	} );


	/***** for demo purposes only: don't allow to submit the form *****/
	morphSearch.querySelector( 'button[type="submit"]' ).addEventListener( 'click', function(ev) { ev.preventDefault(); } );
});

$(function() {
	$('#search-glass').click(function() {
		var form = $("#morphsearch");
		var input = $(".morphsearch-input");
		if($(form).css('display') == 'none') {
			$(form).css('display', 'block');
		} else {
			$(form).css('display', 'none');
		}

		toggleSearch('focus');
	});
	$('.morphsearch-close').click(function() {
		var form = $("#morphsearch");
		$(form).animate({
			opacity: 0
		}, 500);
		setTimeout(function() {
			toggleSearch('close');
		}, 500);
		setTimeout(function() {
			$("#morphsearch").css({
				opacity: 1
			});
			$(".morphsearch").css({
				display: 'none'
			});
		}, 1000);
	})
});