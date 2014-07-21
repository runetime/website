function Radio(){
	/**
	 * Declares all fields' contents
	 * @return {void} 
	 */
	this.setup=function setup(){
		this.URL='http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386';
		this.statusClosed='to listen to RuneTime Radio!';
		this.statusOpen='to close RuneTime Radio';
		this.varHistory='#radio-history';
		this.varMessage='#radio-message';
		this.varPull='#radio-pull';
		this.varRequest='#radio-request';
		this.varSongArtist='#radio-song-artist';
		this.varSongName='#radio-song-name';
		this.varStatus='#radio-status';
		this.varTimetable='#radio-timetable';
	}
	/**
	 * Whether the radio is currently opened or not
	 * @type {Boolean}
	 */
	this.status=false;
	/**
	 * The message to display when the radio is closed
	 * @type {String}
	 */
	this.statusClosed='';
	/**
	 * The message to display when the radio is open
	 * @type {String}
	 */
	this.statusOpen='';
	/**
	 * The string URL of where the player is.  We legally have to open a popup to it.
	 * @type {String}
	 */
	this.URL='';
	this.varHistory='';
	this.varMessage='';
	this.varPull='';
	this.varRequest='';
	this.varSongArtist='';
	this.varSongName='';
	this.varStatus='';
	this.varTimetable='';
	/**
	 * The object of the popup so we can poll it to detect whether it is still open or not
	 * @type {Object}
	 */
	this.popup=null;
	/**
	 * Closes the palyer and sets its status to closed on the variable 'status'
	 * @return {void} 
	 */
	this.closeRadio=function closeRadio(){
		this.popup.close();
		$(this.varMessage).html(this.statusClosed);
		this.status=false;
		$(this.varStatus).removeClass('text-success').addClass('text-danger').html('Off');
	}
	/**
	 * Opens the player and sets its status to opened on the variable 'status'
	 * @return {void} 
	 */
	this.openRadio=function openRadio(){
		this.popup=window.open(this.URL,'RuneTime Radio','width=389,height=359');
		this.status=true;
		$(this.varMessage).html(this.statusOpen);
		$(this.varStatus).removeClass('text-danger').addClass('text-success').html('On');
		var pollTimer=window.setInterval(function(){
			if(Radio.popup.closed!==false){
				window.clearInterval(pollTimer);
				Radio.closeRadio();
			}
		},1000);
	}
}
/**
 * Globally declares the Radio
 * @type {Radio}
 */
var Radio=new Radio();
Radio.setup();

/**
 * Set the listeners for clicks on the various Radio functions
 */
$(function(){
	$('#radio-link').click(function(){
		if(!Radio.status){
			Radio.openRadio();
		}
		else{
			Radio.closeRadio();
		}
	});
	$('#radio-history').click(function(){
		Radio.openHistory();
	});
	$('#radio-request').click(function(){
		Radio.openRequest();
	});
	$('#radio-timetable').click(function(){
		Radio.openTimetable();
	});
});