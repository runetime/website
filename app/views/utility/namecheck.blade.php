<html>
	<head>
		<style type='text/css'>
			label,p{
				color:rgba(255,255,255,1);
				font:normal 13px helvetica, arial, sans-serif;
			}
		</style>
		<script src='http://code.jquery.com/jquery-2.1.1.min.js'></script>
		<script>
			function RSNCheck(){
				var name = null,
					data = null,
					path = null,
					details = null,
					available = false,
					nameAllowed = true,
					url = '/utility/name-check';
				name = document.getElementById('rsn-check-field').value;
				path = url;
				data = {rsn: name};
				if(typeof(name) != "undefined"){
					if (name.length > 12) {
						nameAllowed = false;
					}
					if (name.length < 3) {
						nameAllowed = false;
					}
					if (name.substring(0,3) === 'Mod') {
						nameAllowed = false;
					}
					var notAllowed=['ZnVjaw==','c2hpdA=='];
					$.each(notAllowed,function(key,value){
						decode=atob(value);
						if (name.indexOf(decode) > -1) {
							nameAllowed = false;
						}
					});
					if (nameAllowed === true) {
						details = $.ajax({
							url: path,
							type: 'post',
							data: data,
							async: false
						}).responseText;
						if (details.substring(0,6) === '<html>') {
							available = true;
						}
						if (available === true) {
							$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is available.');
							$('#rsn-availability').css({
								color: 'green',
							});
						} else {
							$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is not available.');
							$('#rsn-availability').css({
								color: 'red',
							});
						}
					} else {
						$('#rsn-availability').html('The Runescape name <b>' + name + '</b> is not appropriate, is too long (over 12 characters), or too short (under 3 characters).');
						$('#rsn-availability').css({
							color: 'red',
						});
					}
				}
			}
		</script>
	</head>
	<body>
		<label for='rsn-check'>
			Enter Name
		</label>
		<input type='text' id='rsn-check-field' placeholder='Runescape Username' />
		<input type='submit' value='Check for Availability' id='rsn-check-submit' onclick='RSNCheck();' />
		<p id='rsn-availability'></p>
	</body>
</html>