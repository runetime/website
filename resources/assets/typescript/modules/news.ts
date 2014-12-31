var news;
class News {
	elements: any = {};
	hooks: any = {};
	paths: any = {};
	public constructor() {
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
			comment: function(id: any) {
				return "/news/" + id + "-name/reply"
			}
		};

		var overlay = document.getElementById('overlay');
		var overlayClose = overlay.querySelector('button');
		var header = document.getElementById('header');
		var switchBtnn = header.querySelector('button.slider-switch');
		var toggleBtnn = function() {
			if(slideshow.isFullscreen) {
				classie.add(switchBtnn, 'view-maxi');
			} else {
				classie.remove(switchBtnn, 'view-maxi');
			}
		};
		var toggleCtrls = function() {
			if(!slideshow.isContent) {
				classie.add(header, 'hide');
			}
		};
		var toggleCompleteCtrls = function() {
			if(!slideshow.isContent) {
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
		var toggleSlideshow = function() {
			slideshow.toggle();
			toggleBtnn();
		};
		var closeOverlay = function() {
			classie.add(overlay, 'hide');
		};
		// toggle between fullscreen and small slideshow
		switchBtnn.addEventListener('click', toggleSlideshow);
		// close overlay
		overlayClose.addEventListener('click', closeOverlay);

		if(localStorage) {
			var showed = localStorage.getItem('news.info.showed');
			if(showed === 'true') {
				closeOverlay();
			}
		}

		this.setupActions();
	}

	public setupActions() {
		$("div.info button").click(function() {
			if(localStorage) {
				localStorage.setItem('news.info.showed', 'true');
			}
		});
		$(this.hooks.comment.submit).click(function(e: any) {
			var id = $(e.target).parent().attr('rt-data');
			var contents = $(e.target).parent().find('textarea').val();
			news.submitComment(id, contents);
		});
	}

	public submitComment(id, contents) {
		if(contents.length == 0) {
			return 0;
		}
		var data = {
			contents: contents
		};
		var results = utilities.postAJAX(this.paths.comment(id), data);
		results.done(function(results: string) {
			results = $.parseJSON(results);
			if(results.done === true) {
				window.location.href = results.url;
			} else {
				// error
			}
		})
	}

	public toComments(id: number) {
		$("[data-content='content-" + id +"'] button.content-switch").trigger('click');
	}
}