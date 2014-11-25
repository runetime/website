class Notifications {
    elements: any = {};
    paths: any = {};
    constructor() {
        this.paths = {
            markRead: '/notifications/mark-read'
        };
        $("[rt-hook='hook!notifications:mark.read']").bind('click', function(e) {
            console.log(e.target.attr('rt-data'));
        });
    }
}