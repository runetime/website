<div class='modal fade' id='modal-clear-chatbox' tabindex='-1' role='dialog' aria-labelledby='modal-clear-chatbox' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title' id='modal-clear-chatbox'>
                    Clear Chatbox
                </h4>
            </div>
            <div class='modal-body'>
                <p>
                    Are you sure you want to clear all of the messages in the chatbox?
                </p>
                <form class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='chatbox-clear-reason'>
                            Reason
                        </label>
                        <div class='col-lg-10'>
                            <textarea id='chatbox-clear-reason' name='chatbox-clear-reason' rows='5' class='width-full' rt-hook='leader.panel:chatbox.reason'></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class='modal-footer'>
                <button type='button' class='btn btn-default' data-dismiss='modal'>
                    Close
                </button>
                <button type='button' class='btn btn-primary' rt-hook='leader.panel:chatbox.clear'>
                    Clear Chatbox
                </button>
            </div>
        </div>
    </div>
</div>