var clan;
class Clan {
	public constructor() {
		var warnings = document.querySelector("[data-dialog=clan-dialog-warnings]");
		var tempBans = document.querySelector("[data-dialog=clan-dialog-temporary-bans]");
		var bans = document.querySelector("[data-dialog=clan-dialog-bans]");

		this.setListen(warnings);
		this.setListen(tempBans);
		this.setListen(bans);
	}

	public setListen(dlgtrigger) {
		if(dlgtrigger) {
			var somedialog = document.getElementById(dlgtrigger.getAttribute('data-dialog'));
			var dlg = new DialogFx(somedialog);
			dlgtrigger.addEventListener('click', dlg.toggle.bind(dlg));
		}
	}
}