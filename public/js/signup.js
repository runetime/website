$(function(){
	$('#security').bind('change',function(e){
		sliderVal=e.target.value;
		if(sliderVal<=10){
			$('form button').removeAttr('disabled');
			$('form .text-danger').css({
				'display':'none'
			});
		}
		else if(sliderVal>10){
			$('form button').attr('disabled','disabled');
			$('form .text-danger').css({
				'display':'block'
			});
		}
	});
})