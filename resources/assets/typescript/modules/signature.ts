var signature;
class Signature {
	paths: any = {};
	public constructor() {
		this.paths = {
			submit: '/signatures'
		};
		var theForm = document.getElementById('signature-form');
		new stepsForm( theForm, {
			onSubmit: function() {
				var username = $('#q1').val();
				var data = {
					username: username
				};
				utilities.post(signature.paths.submit, data);
			}
		} );
	}
}