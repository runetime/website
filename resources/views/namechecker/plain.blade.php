<!DOCTYPE html>
<html>
	<head>
		<meta name='_token' content='{{ csrf_token() }}' />
		<script src='/js/vendor.js'></script>
		<script src='/js/modules.js'></script>
	</head>
	<body>
		<input id='q1' name='q1' type='text' /> <button onclick='runIt();'>Check Availability</button>
		<span class='final-message hidden'></span>
		<script>
			// Set some initial variables.
			var availability = '#rsn-availability',
					check = '#rsn-check-field',
					notAllowed = ['ZnVjaw==', 'c2hpdA=='],
					paths = {check: '/name-check'};

			// When the button is clicked, run this.
			function runIt() {
				var username = $('#q1').val();
				var data = {
					rsn: username
				};
				var results = utilities.postAJAX(paths.check, data);

				// Wait for when the HTTP Request is done.
				results.done(function (results) {
					var el = $('.final-message'),
						message = 'The Runescape name <b>' + username + '</b> is ',
						className = 'unavailable',
						color = 'red';

					if (results.substring(0, 6) === "<!DOCT") {
						className = 'available';
						color = 'green';
					}

					message = "<p style='color: " + color + ";'>" + message + className + ".</p>";

					// Add the button to try again.
					message += "<br /><a href='/name-check/plain' class='btn btn-primary'>Search Again</a>";

					// Set the result message and show it.
					$(el).html(message);
					$(el).removeClass('hidden').addClass('show');
				});
			}
		</script>
	</body>
</html>
