<div class='modal fade' id='modal-mute-user' tabindex='-1' role='dialog' aria-labelledby='modal-mute-user' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title' id='modal-mute-user'>
                    Mute User
                </h4>
            </div>
            <div class='modal-body'>
                <form class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='mute-username'>
                            Username
                        </label>
                        <div class='col-lg-10'>
                            <input id='mute-username' class='form-control' type='text' placeholder='User Name Here' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='mute-time'>
                            Time in Hours
                        </label>
                        <div class='col-lg-10'>
                            <input id='mute-time' class='form-control' type='text' placeholder='ex: 3, 7, 48' required />
										<span class='help-block'>
											Type "infinite" for a permanent mute.
										</span>
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='mute-reason'>
                            Reason
                        </label>
                        <div class='col-lg-10'>
                            <textarea id='mute-reason' rows='5' class='width-full'></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class='modal-footer'>
                <button type='button' class='btn btn-default' data-dismiss='modal'>
                    Close
                </button>
                <button type='button' class='btn btn-primary' rt-hook='leader.panel:mute.submit'>
                    Mute User
                </button>
            </div>
        </div>
    </div>
</div>