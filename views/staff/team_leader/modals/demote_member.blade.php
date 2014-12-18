<div class='modal fade' id='modal-demote-member' tabindex='-1' role='dialog' aria-labelledby='modal-demote-member' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title' id='modal-demote-member'>
                    Demote Member
                </h4>
            </div>
            <div class='modal-body'>
                <p class='text-warning'>
                    Please note that once you click demote that member will be immediately demoted.
                </p>
                <ul class='list-unstyled'>
                    @foreach($members as $member)
                        <li>
                            {!! \Link::name($member->user->id) !!} <button type='button' class='btn btn-info' rt-hook='leader.panel:demote.data' rt-data='{{ $member->user->id }}'>Demote</button>
                        </li>
                    @endforeach
                </ul>
            </div>
            <div class='modal-footer'>
                <button type='button' class='btn btn-default' data-dismiss='modal'>
                    Close
                </button>
            </div>
        </div>
    </div>
</div>