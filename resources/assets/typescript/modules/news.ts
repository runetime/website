var news;
class News {
	public constructor() {
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
	}
}