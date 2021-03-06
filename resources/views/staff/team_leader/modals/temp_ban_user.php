<div class='modal fade' id='modal-temp-ban-user' tabindex='-1' role='dialog' aria-labelledby='modal-temp-ban-user' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title' id='modal-temp-ban-user'>
                    Temporarily Ban User
                </h4>
            </div>
            <div class='modal-body'>
                <form class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='ban-username'>
                            Username
                        </label>
                        <div class='col-lg-10'>
                            <input id='ban-username' class='form-control' type='text' placeholder='User Name Here' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='ban-reason'>
                            Reason
                        </label>
                        <div class='col-lg-10'>
                            <textarea id='ban-reason' rows='5' class='width-full'></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class='modal-footer'>
                <button type='button' class='btn btn-default' data-dismiss='modal'>
                    Close
                </button>
                <button type='button' class='btn btn-primary' rt-hook='leader.panel:ban.submit'>
                    Ban User
                </button>
            </div>
        </div>
    </div>
</div>
