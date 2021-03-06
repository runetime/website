<div class='modal fade' id='modal-{{ $id}}' tabindex='-1' role='dialog' aria-labelledby='modal-{{ $id }}' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title'>
                    Remove Chatbox Messages
                </h4>
            </div>
            <div class='modal-body'>
                <form class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='chatbox-remove-username'>
                            Username
                        </label>
                        <div class='col-lg-10'>
                            <input id='chatbox-remove-username' class='form-control' type='text' placeholder='Username' required disabled />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='chatbox-remove-reason'>
                            Reason
                        </label>
                        <div class='col-lg-10'>
                            <textarea id='chatbox-remove-reason' rows='5' class='width-full'></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class='modal-footer'>
                <button type='button' class='btn btn-primary' data-dismiss='modal'>
                    Close
                </button>
                <button type='button' class='btn btn-success' rt-hook='admin.panel:user.chatbox.remove.confirm'>
                    Submit
                </button>
            </div>
        </div>
    </div>
</div>