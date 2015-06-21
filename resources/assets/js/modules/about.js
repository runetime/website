var about;
var About = (function () {
    function About() {
        var ads = document.querySelector("[data-dialog=clan-dialog-ads]");
        var radio = document.querySelector("[data-dialog=clan-dialog-radio]");
        var forums = document.querySelector("[data-dialog=clan-dialog-forums]");
        var disclosure = document.querySelector("[data-dialog=clan-dialog-full-disclosure]");
        var members = document.querySelector("[data-dialog=clan-dialog-our-members]");
        var community = document.querySelector("[data-dialog=clan-dialog-community-openness]");
        this.setListen(ads);
        this.setListen(radio);
        this.setListen(forums);
        this.setListen(disclosure);
        this.setListen(members);
        this.setListen(community);
        console.log(1);
    }
    About.prototype.setListen = function (dlgtrigger) {
        if (dlgtrigger) {
            var somedialog = document.getElementById(dlgtrigger.getAttribute('data-dialog'));
            var dlg = new DialogFx(somedialog);
            dlgtrigger.addEventListener('click', dlg.toggle.bind(dlg));
        }
    };
    return About;
})();
