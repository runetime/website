<div class='modal fade' id='modal-radio-stop' tabindex='-1' role='dialog' aria-labelledby='modal-radio-stop' area-hidden='true'>
	<div class='modal-dialog'>
		<div class='modal-content'>
			<div class='modal-header'>
				<button type='button' class='close' data-dismiss='modal'>
					<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
				</button>
				<h4 class='modal-title' id='modal-demote-member'>
					Emergency Radio Stop
				</h4>
			</div>
			<div class='modal-body'>
				<p class='text-warning'>
					Are you sure you want to stop the radio?
				</p>
			</div>
			<div class='modal-footer'>
				<button type='button' class='btn btn-primary' data-dismiss='modal'>
					No
				</button>
				<button type='button' class='btn btn-success' rt-hook='admin.panel:radio.stop.confirm'>
					Yes
				</button>
			</div>
		</div>
	</div>
</div>