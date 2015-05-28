(function () {
  var about = {};

  about.setListen(dlg_trigger) {
    if (dlg_trigger) {
      var somedialog = document.getElementById(dlg_trigger.getAttribute('data-dialog'));

      var dlg = new DialogFx(somedialog);
      dlg_trigger.addEventListener('click', dlg.toggle.bind(dlg));
    }
  }

  var ads = document.querySelector("[data-dialog=clan-dialog-ads]");
  var radio = document.querySelector("[data-dialog=clan-dialog-radio]");
  var forums = document.querySelector("[data-dialog=clan-dialog-forums]");
  var disclosure = document.querySelector("[data-dialog=clan-dialog-full-disclosure]");
  var members = document.querySelector("[data-dialog=clan-dialog-our-members]");
  var community = document.querySelector("[data-dialog=clan-dialog-community-openness]");

	about.setListen(ads);
	about.setListen(radio);
	about.setListen(forums);
	about.setListen(disclosure);
	about.setListen(members);
	about.setListen(community);
}());
