<div class='modal fade' id='modal-{{ $id}}' tabindex='-1' role='dialog' aria-labelledby='modal-{{ $id }}' area-hidden='true'>
	<div class='modal-dialog'>
		<div class='modal-content'>
			<div class='modal-header'>
				<button type='button' class='close' data-dismiss='modal'>
					<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
				</button>
				<h4 class='modal-title'>
					Add Award
				</h4>
			</div>
			<div class='modal-body'>
				<form class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='award-add-username'>
							Username
						</label>
						<div class='col-lg-10'>
							<input id='award-add-username' class='form-control' type='text' placeholder='Username' required disabled />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='award-add-id'>
							Award
						</label>
						<div class='col-lg-10'>
							<select id='award-add-id'></select>
						</div>
					</div>
				</form>
			</div>
			<div class='modal-footer'>
				<button type='button' class='btn btn-primary' data-dismiss='modal'>
					Close
				</button>
				<button type='button' class='btn btn-success' rt-hook='admin.panel:user.award.add.confirm'>
					Submit
				</button>
			</div>
		</div>
	</div>
</div>