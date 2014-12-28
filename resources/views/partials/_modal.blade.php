<div class='modal fade' id='modal-{{ $id }}' tabindex='-1' role='dialog' aria-labelledby='modal-{{ $id }}' area-hidden='true'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal'>
                    <span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
                </button>
                <h4 class='modal-title' id='modal-demote-member'>
                    @yield('name')
                </h4>
            </div>
            <div class='modal-body'>
@yield('body')
            </div>
            <div class='modal-footer'>
@yield('footer')
            </div>
        </div>
    </div>
</div>