var StaffList = (function () {
    function StaffList() {
        var members = $("[rt-hook='hook!staff.list:card']");
        $.each(members, function (index, value) {
            var val = $(value);
            var id = $(val).attr('rt-data');
            var src = "";
            if (id == 'no') {
                src = $(val).attr('rt-data2');
            }
            else {
                src = id;
            }
            $(val).find('.front').css({
                'background-image': "url('/img/forums/photos/" + src + ".png')"
            });
            $(val).bind('touchstart', function () {
                $(this).toggleClass('hover');
            });
        });
    }
    return StaffList;
})();
