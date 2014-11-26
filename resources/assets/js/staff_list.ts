class StaffList {
    constructor() {
        var members = $("[rt-hook='hook!staff.list:card']");
        $.each(members, function(index: number, value: any) {
            var val = $(value);
            var id = $(val).attr('rt-data');
            $(val).find('.front').css({
                'background-image': "url('/img/forums/photos/" + id + ".png')"
            });
            $(val).bind('touchstart', function() {
                $(this).toggleClass('hover');
            });
        });
    }
}