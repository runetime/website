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
		hPull=$('#pull-height').height();
		hOptions=$('#pull-options').height();
		if(hPull<hOptions){
			$('#pull-height').height(hOptions);
		}
		Radio.updateRequests();
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
		$(this.varStatus).removeClass('text-success').addClass('text-danger').html("<i id='power-button' class='fa fa-power-off'></i>Off");
	}
	/**
	 * Opens the player and sets its status to opened on the variable 'status'
	 * @return {void} 
	 */
	this.openRadio=function openRadio(){
		this.popup=window.open(this.URL,'RuneTime Radio','width=389,height=359');
		this.status=true;
		$(this.varMessage).html(this.statusOpen);
		$(this.varStatus).removeClass('text-danger').addClass('text-success').html("<i id='power-button' class='fa fa-power-off'></i>On");
		var pollTimer=window.setInterval(function(){
			if(Radio.popup.closed!==false){
				window.clearInterval(pollTimer);
				Radio.closeRadio();
			}
		},1000);
	}
	this.openHistory=function openHistory(){
		contents=getAJAX('radio/request/history');
		this.openPull(contents);
	}
	this.openTimetable=function openHistory(){
		contents=getAJAX('radio/request/timetable');
		this.openPull(contents);
	}
	this.openRequest=function openRequest(){
		contents=getAJAX('radio/request/song');
		setTimeout(function(){
			$('#request-button').click(function(){
				Radio.sendRequest();
			});
		},1500);
		this.openPull(contents);
	}
	this.sendRequest=function sendRequest(){
		artist=document.getElementById('request-artist').value;
		name=document.getElementById('request-name').value;
		contents=getAJAX('radio/send/request/'+artist+'/'+name);
		$('#pull-contents').html(contents);
		this.hidePull(2000);
		this.updateRequests();
	}
	this.openPull=function openPull(){
		setTimeout(function(){
			$('#radio-pull').animate({
				width:'50%'
			},1000);
			$('#pull-contents').html(contents);
			$('#radio-pull').removeClass('invisible');
			$('#radio-options').animate({
				width:'50%'
			},1000,function(){
				$('#radio-options').removeClass('col-md-11').addClass('col-md-6');
				$('#radio-pull').removeClass('col-md-1').addClass('col-md-6');
				$('#radio-options').width('');
				$('#radio-pull').width('');
				Radio.sizeEqual();
			});
		},0);
	}
	this.hidePull=function hidePull(delay){
		setTimeout(function(){
			$('#pull-contents').html('&nbsp;');
			$('#radio-pull').animate({
				width:'8.33%'
			},1000);
			$('#radio-options').animate({
				width:'91.66%'
			},1000,function(){
				$('#radio-options').removeClass('col-md-6').addClass('col-md-11');
				$('#radio-pull').removeClass('col-md-6').addClass('col-md-1').addClass('invisible');
				$('#radio-options').width('');
				$('#radio-pull').width('');
			});
		},delay);
		this.moveShoutbox('original');
	}
	this.sizeEqual=function sizeEqual(){
		hPull=$('#radio-pull').height();
		hOptions=$('#radio-options').height();
		console.log(hPull);
		console.log(hOptions);
		if(hPull<hOptions){
			$('#radio-pull').height(hOptions);
			this.moveShoutbox('original');
		}
		else{
			$('#radio-pull').css({
				height:''
			});
			this.moveShoutbox('options');
		}
	}
	this.moveShoutbox=function moveShoutbox(to){
		if(to=="options"){
			$('#shoutbox-holder-radio').css({
				display:'block'
			})
			contents=$('#shoutbox-holder').html();
			$('#shoutbox-holder-radio').html(contents);
			$('#shoutbox-holder').css({
				display:'none'
			})
		}
		if(to=="original"){
			$('#shoutbox-holder-radio').css({
				display:'none'
			});
			$('#shoutbox-holder').css({
				display:'block'
			})
		}
	}
	this.updateRequests=function updateRequests(){
		userRequests=$.parseJSON(getAJAX('radio/requests/current'));
		setTimeout(function(){
			Radio.updateRequests();
		},30000);
		$('#requests-user-current').html('');
		$.each(userRequests,function(index,value){
			if(value.status==1){
				status="text-success";
			}
			else if(value.status==2){
				status="text-danger";
			}
			console.log(value);
			$('#requests-user-current').append("<p class='"+status+"'>"+value.song_artist+" - "+value.song_name+"</p><p class='"+status+"'><small>"+timeAgo(value.time_sent)+"</small></p>");
		});
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
	$('#request-button').click(function(){
		alert(3);
	});
	$('#pull-close').click(function(){
		Radio.hidePull(0);
		Radio.sizeEqual();
		setTimeout(function(){
			Radio.moveShoutbox('original');
		},1100);
	})
});
function getAJAX(path){
	return $.ajax({
		url:path,
		type:'get',
		dataType:'html',
		async:false
	}).responseText;
}
function timeAgo(ts){
    var d=new Date();
    var nowTs=Math.floor(d.getTime()/1000);
    var seconds=nowTs-ts;
    if (seconds>2*24*3600) {
       return "a few days ago";
    }
    if (seconds>24*3600) {
       return "yesterday";
    }
    if (seconds>3600) {
       return "a few hours ago";
    }
    if (seconds>1800) {
       return "Half an hour ago";
    }
    if (seconds>60) {
       return Math.floor(seconds/60)+" minutes ago";
    }
}