var calculator,Calculator=function(){function t(t){this.calc=t,this.elements={},this.info={},this.URL={},this.items={},this.elements={currentXP:"#calculator-current-xp",displayName:"#calculator-display-name",submit:"#calculator-submit",table:"#calculator-table tbody",targetLevel:"#calculator-target-level"},this.URL={getCalc:"/calculators/load",getInfo:"/get/hiscore"},this.info={levelCurrent:0,levelTarget:0,XPCurrent:0,XPTarget:0},this.calculator=t,$(this.elements.submit).bind("click",function(){calculator.getInfo()}),this.loadCalc(),$("#calculator-target-level").keyup(function(){setTimeout(function(){calculator.updateCalc()},25)})}return t.prototype.getInfo=function(){$(this.elements.displayName).val()},t.prototype.loadCalc=function(){var t={id:this.calculator},e=utilities.postAJAX(this.URL.getCalc,t);e.done(function(t){t=utilities.JSONDecode(t),calculator.items=t,$.each(calculator.items,function(t){var e="";e+="<tr>",e+="<td>"+calculator.items[t].name+"</td>",e+="<td>"+calculator.items[t].level+"</td>",e+="<td>"+calculator.items[t].xp+"</td>",e+="<td>&infin;</td>",e+="</tr>",$(calculator.elements.table).append(e)})})},t.prototype.calculateXP=function(t){var e=0,s=0;for(s=1;t>s;s+=1)e+=Math.floor(s+300*Math.pow(2,s/7));return Math.floor(e/4)},t.prototype.calculateLevel=function(t){var e=0,s=0;for(s=1;120>s;s+=1){if(e+=Math.floor(s+300+Math.pow(2,s/7)),Math.floor(e/4)>t)return s;if(s>=99)return 99}},t.prototype.updateCalc=function(){var t=0,e=0,s=0,a=0,o=0,i=0;this.info.levelTarget=parseInt($("#calculator-target-level").val()),console.log(this.info.levelTarget),this.info.XPTarget=this.calculateXP(this.info.levelTarget),this.info.XPCurrent>this.info.XPTarget&&(this.info.XPTarget=this.calculateXP(parseInt(this.info.levelCurrent,10)+1)),t=this.info.levelCurrent,e=this.info.levelTarget,s=this.info.XPCurrent,a=this.info.XPTarget,o=a-s,$.each(this.items,function(s){i=Math.ceil(o/calculator.items[s].xp),i=0>i?0:i,$(calculator.elements.table+" tr:nth-child("+(s+1)+") td:nth-child(4)").html(i),console.log(calculator.items[s].name),console.log(calculator.items[s].level),console.log(t),console.log(e),console.log(calculator.items[s].level),console.log("\n\n\n\n\n"),calculator.items[s].level<=t?$(calculator.elements.table+" tr:nth-child("+(s+1)+")").attr("class","text-success"):calculator.items[s].level>t&&e>=calculator.items[s].level?$(calculator.elements.table+" tr:nth-child("+(s+1)+")").attr("class","text-warning"):$(calculator.elements.table+" tr:nth-child("+(s+1)+")").attr("class","text-danger")})},t}(),chatbox,Chatbox=function(){function t(t){this.channel=t,this.channel="#radio",this.elements={},this.lastId=0,this.messages=[],this.times={},this.updateTimeout=null,this.URL={},this.channel=t,this.elements={actions:"#chatbox-actions",channels:"#chatbox-channels",chatbox:"#chatbox",message:"#chatbox-message",messages:"#chatbox-messages"},this.URL={getStart:"/chat/start",getUpdate:"/chat/update",postMessage:"/chat/post/message",postStatusChange:"/chat/post/status/change"},this.times={lastActivity:utilities.currentTime(),lastRefresh:utilities.currentTime(),loadedAt:utilities.currentTime()},this.panelChat(),this.getStart(),$(this.elements.message).keypress(function(t){13===t.which&&chatbox.submitMessage()}),$(this.elements.channels).bind("click",function(){chatbox.Panels.channels()}),setTimeout(function(){chatbox.update()},5e3),setTimeout(function(){chatbox.updateTimeAgo()},1e3)}return t.prototype.addMessage=function(t){this.lastId=t.id,this.messages.push(t),this.times.lastActivity=utilities.currentTime(),this.displayMessages()},t.prototype.displayMessages=function(){var t=$(this.messages).size()-20;0>t&&(t=0);var e=$(this.messages).slice(t);$(this.elements.messages).html(""),$.each(e,function(t,e){var s="";s+="<div id='"+e.uuid+"' class='msg'>",s+="<time class='pull-right' data-ts='"+e.created_at+"'>",s+=utilities.timeAgo(e.created_at),s+="</time>",s+="<p>",s+="<a class='members-"+e.class_name+"'>"+e.author_name+"</a>: "+e.contents_parsed,s+="</p>",s+="</div>",$(chatbox.elements.messages).prepend(s)})},t.prototype.getStart=function(){$(this.elements.messages).html("");var t={time:this.times.loadedAt,channel:this.channel},e=utilities.postAJAX("chat/start",t);e.done(function(t){t=$.parseJSON(t),$.each(t,function(t,e){chatbox.addMessage(e)})})},t.prototype.panelChannels=function(){var t=utilities.getAJAX("/chat/channels");t.done(function(t){var e="";t=$.parseJSON(t),e+="<div id='chatbox-popup-channels'>",e+="<button type='button' class='close' onclick='chatbox.panelclose();'>Close <span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>",e+="<h3>Channels</h3>",e+="<p class='holo-text'>Currently on <b>#"+chatbox.channel+"</b></p>",$.each(t,function(t,s){e+="<a onclick=\"chatbox.switchChannel('"+s.name+"');\">#"+s.name+"</a><br />",e+="<span class='holo-text-secondary'>"+s.messages+" messages</span><br />",e+="<span class='holo-text-secondary'>Last active "+utilities.timeAgo(s.last_message)+"</span><br />"}),e+="</div>",$(chatbox.elements.messages).html(e)})},t.prototype.panelChat=function(){var t="";t+="<div id='chatbox-messages'></div>",t+="<div id='chatbox-actions'>",t+="<a href='/transparency/markdown' target='_blank' id='chatbox-markdown'>Markdown</a>",t+="<a id='chatbox-channels'>Channels</a>",t+="</div>",t+="<input type='text' id='chatbox-message' />",$(this.elements.chatbox).html(t)},t.prototype.panelClose=function(){this.getStart()},t.prototype.submitMessage=function(){var t,e,s=$(this.elements.message).val();t={contents:s,channel:this.channel},e=utilities.postAJAX(this.URL.postMessage,t),e.done(function(t){t=$.parseJSON(t),chatbox.update(),t.sent===!0&&($(chatbox.elements.message).val(""),$(chatbox.elements.message).toggleClass("message-sent"),setTimeout(function(){$(chatbox.elements.message).toggleClass("message-sent")},1500))})},t.prototype.switchChannel=function(){var t,e;t={channel:name},e=utilities.postAJAX("/chat/channels/check",t),e.done(function(t){t=$.parseJSON(t),t.valid?(chatbox.channel=name,chatbox.getStart()):console.log("error")})},t.prototype.update=function(){var t={id:this.lastId,channel:this.channel},e=utilities.postAJAX(this.URL.getUpdate,t);e.done(function(t){t=$.parseJSON(t),chatbox.times.lastRefresh=utilities.currentTime(),$.each(t,function(t,e){chatbox.addMessage(e)}),clearTimeout(chatbox.updateTimeout),chatbox.updateTimeout=setTimeout(function(){chatbox.update()},5500)})},t.prototype.updateTimeAgo=function(){var t=$(this.elements.messages).find(".msg");$.each(t,function(t,e){var s=$(e).find("time").attr("data-ts");$(e).find("time").html(utilities.timeAgo(s))}),setTimeout(function(){chatbox.updateTimeAgo()},1e3)},t}(),combatCalculator,CombatCalculator=function(){function t(){this.clicks={},this.generate={},this.inputs={},this.other={},this.paths={},this.clicks={submit:"[rt-data='combat.calculator:submit']"},this.generate={level:"[rt-data='combat.calculator:level']"},this.inputs={attack:"[rt-data='combat.calculator:attack']",defence:"[rt-data='combat.calculator:defence']",strength:"[rt-data='combat.calculator:strength']",constitution:"[rt-data='combat.calculator:constitution']",ranged:"[rt-data='combat.calculator:ranged']",prayer:"[rt-data='combat.calculator:prayer']",magic:"[rt-data='combat.calculator:magic']",summoning:"[rt-data='combat.calculator:summoning']"},this.other={name:"[rt-data='combat.calculator:name']"},this.paths={loadCombat:"/calculators/combat/load"},$(this.inputs.attack).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.defence).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.strength).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.constitution).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.ranged).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.prayer).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.magic).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.inputs.summoning).keyup(function(){setTimeout(function(){combatCalculator.updateLevel()},25)}),$(this.clicks.submit).click(function(){combatCalculator.getLevels()})}return t.prototype.getLevels=function(){var t=$(this.other.name).val(),e={rsn:t},s=utilities.postAJAX(this.paths.loadCombat,e);s.done(function(t){t=$.parseJSON(t),$(combatCalculator.inputs.attack).val(t.attack),$(combatCalculator.inputs.defence).val(t.defence),$(combatCalculator.inputs.strength).val(t.strength),$(combatCalculator.inputs.constitution).val(t.constitution),$(combatCalculator.inputs.ranged).val(t.ranged),$(combatCalculator.inputs.prayer).val(t.prayer),$(combatCalculator.inputs.magic).val(t.magic),$(combatCalculator.inputs.summoning).val(t.summoning),combatCalculator.updateLevel()})},t.prototype.updateLevel=function(){var t=this.val("attack")+this.val("strength"),e=2*this.val("magic"),s=2*this.val("ranged"),a=this.val("defence")+this.val("constitution"),o=.5*this.val("prayer")+.5*this.val("summoning"),i=1.3*Math.max(t,e,s)+a+o;i*=.25,i=Math.floor(i),$(this.generate.level).html(i)},t.prototype.val=function(t){return parseInt($("[rt-data='combat.calculator:"+t+"']").val())},t}(),forums,Forums=function(){function t(){this.elements={},this.paths={},this.post=null,this.threadCreate=null,this.elements={postEditor:"[rt-data='post.edit']"},this.paths={vote:function(t){return"/forums/post/"+t+"/vote"}},this.post=new Post,$(".upvote").bind("click",function(t){var e=$(t.target).parent().parent().parent().parent().parent().attr("id");forums.upvote(e)}),$(".downvote").bind("click",function(t){var e=$(t.target).parent().parent().parent().parent().parent().attr("id");forums.downvote(e)}),$("[rt-hook='forums.thread.post:quote']").bind("click",function(t){var e=$(t.target).attr("rt-data");forums.post.quote(e)})}return t.prototype.downvote=function(t){t=t.replace("post","");var e=$("#post"+t),s=$(e).hasClass("upvote-active"),a=$(e).hasClass("downvote-active");a===!0?$(e).removeClass("downvote-active"):$(e).addClass("downvote-active"),s===!0&&$(e).removeClass("upvote-active");var o={vote:"down"},i=utilities.postAJAX(this.paths.vote(t),o);i.done(function(t){t=$.parseJSON(t)})},t.prototype.upvote=function(t){t=t.replace("post","");var e=$("#post"+t),s=$(e).hasClass("upvote-active"),a=$(e).hasClass("downvote-active");s===!0?$(e).removeClass("upvote-active"):$(e).addClass("upvote-active"),a===!0&&$(e).removeClass("downvote-active");var o={vote:"up"},i=utilities.postAJAX(this.paths.vote(t),o);i.done(function(t){t=$.parseJSON(t)})},t}(),Post=function(){function t(){}return t.prototype.quote=function(t){var e=$("[rt-data='post#"+t+":source']").html(),s=$(forums.elements.postEditor).val();e=e.replace(/\n/g,"\n>"),e=e.replace(/&lt;/g,"<"),e=e.replace(/&gt;/g,">"),e=">"+e,s.length>0&&(s+="\n"),$(forums.elements.postEditor).val(s+e+"\n"),utilities.scrollTo($(forums.elements.postEditor),1e3),$(forums.elements.postEditor).focus()},t}(),ForumsThreadCreate=function(){function t(){this.hooks={},this.questions=[],this.values={},this.views={},this.hooks={questionAdd:"[rt-hook='forums.thread.create:poll.question.add']",questions:"[rt-hook='forums.thread.create:poll.questions']"},this.questions=Array(500),this.values={questions:0},this.views={answer:$("[rt-view='forums.thread.create:poll.answer']").html(),question:$("[rt-view='forums.thread.create:poll.question']").html()},$(this.hooks.questionAdd).bind("click",function(){forums.threadCreate.addQuestion()})}return t.prototype.addQuestion=function(){var t=this.views.question;$(this.hooks.questions).append(t),this.values.questions+=1},t.prototype.removeQuestion=function(t){this.questions.splice(t,1)},t.prototype.setListener=function(t,e){"remove question"===e&&this.setListenerRemoveQuestion(t)},t.prototype.setListenerRemoveQuestion=function(t){$(t).bind("click",function(){forums.threadCreate.removeQuestion($(t).parent().parent().attr("rt-data"))})},t}();$(function(){forums=new Forums});var LivestreamReset=function(){function t(){this.hooks={},this.lang={},this.paths={},this.hooks={note:"[rt-hook='livestream.reset:note']",spinner:"[rt-hook='livestream.reset:spinner']",status:"[rt-hook='livestream.reset:status']"},this.lang={checking:"checking",offline:"offline",online:"online",unknown:"unknown"},this.paths={reset:"/livestream/reset"},this.reset()}return t.prototype.reset=function(){$("#loading").css({opacity:1});var t=utilities.postAJAX(this.paths.reset,{});t.done(function(t){t=utilities.JSONDecode(t),t.online===!0?livestreamReset.statusOnline():t.online===!1?livestreamReset.statusOffline():livestreamReset.statusUnknown(),livestreamReset.spinnerRemove()}),$("#loading").css({opacity:0})},t.prototype.spinnerRemove=function(){$(this.hooks.spinner).css({opacity:0})},t.prototype.statuses=function(t,e,s,a){this.lang.checking=t,this.lang.offline=s,this.lang.online=e,this.lang.unknown=a},t.prototype.statusOffline=function(){$(this.hooks.status).html("offline").removeClass().addClass("text-danger")},t.prototype.statusOnline=function(){$(this.hooks.status).html("online").removeClass().addClass("text-success")},t.prototype.statusUnknown=function(){$(this.hooks.status).html("unknown").removeClass().addClass("text-warning")},t}(),nameChecker,NameChecker=function(){function t(){this.elements={},this.notAllowed=[],this.paths={},this.elements={availability:"#rsn-availability",check:"#rsn-check-field"},this.notAllowed=["ZnVjaw==","c2hpdA=="],this.paths={check:"/name/check"},$("[rt-hook='name.checker:submit']").bind("click",function(){nameChecker.check()})}return t.prototype.check=function(){var t=$("#rsn-check-field").val(),e=this.checkName(t);if(0===e)this.unavailable("You did not enter anything.");else if(1===e)this.unavailable("The name <b>"+t+"</b> is over 12 characters.");else if(2===e)this.unavailable("The name <b>"+t+"</b> is under 3 characters.");else if(3===e)this.unavailable("The name <b>"+t+"</b> starts with the word Mod.");else if(4===e)this.unavailable("The name <b>"+t+"</b> contains a swear word.");else if(5===e){var s={rsn:t},a=utilities.postAJAX(this.paths.check,s);$(this.elements.availability).html("Loading..."),a.done(function(e){var s=!1;"<html>"===e.substring(0,6)&&(s=!0),s===!0?nameChecker.available(t):nameChecker.unavailable("The Runescape name <b>"+t+"</b> is not available.")})}},t.prototype.available=function(t){$(nameChecker.elements.availability).html("The RuneScape name <b>"+t+"</b> is available.").css({color:"green"})},t.prototype.checkName=function(t){return"undefined"==typeof t?0:t.length>12?1:t.length<3?2:"Mod"===t.substring(0,3)?3:($.each(this.notAllowed,function(e,s){var a=atob(s);return t.indexOf(a)>-1?4:void 0}),5)},t.prototype.unavailable=function(t){$(this.elements.availability).html(t).css({color:"red"})},t}(),Notifications=function(){function t(){this.elements={},this.paths={},this.paths={markRead:"/notifications/mark-read"},$("[rt-hook='hook!notifications:mark.read']").bind("click",function(t){console.log(t.target.attr("rt-data"))})}return t}(),radio,chatbox,Radio=function(){function t(){this.popup=null,this.status=!1,this.statusClosed="",this.statusOpen="",this.URL="",this.varMessage="",this.varStatus="",this.URL="http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386",this.statusClosed="to listen to RuneTime Radio!",this.statusOpen="to close RuneTime Radio",this.varMessage="#radio-message",this.varStatus="#radio-status",this.update(),$("#radio-link").click(function(){radio.status?radio.closeRadio():radio.openRadio()}),$("#radio-history").click(function(){radio.openHistory()}),$("#radio-request").click(function(){radio.openRequest()}),$("#radio-timetable").click(function(){radio.openTimetable()}),$("#request-button").click(function(){}),$("#pull-close").click(function(){radio.hidePull()})}return t.prototype.closeRadio=function(){this.popup.close(),$(this.varMessage).html(this.statusClosed),this.status=!1,$(this.varStatus).removeClass("text-success").addClass("text-danger").html("<i id='power-button' class='fa fa-power-off'></i>Off")},t.prototype.openRadio=function(){this.popup=window.open(this.URL,"RuneTime Radio","width=389,height=359"),this.status=!0,$(this.varMessage).html(this.statusOpen),$(this.varStatus).removeClass("text-danger").addClass("text-success").html("<i id='power-button' class='fa fa-power-off'></i>On");var t=window.setInterval(function(){radio.popup.closed!==!1&&(window.clearInterval(t),radio.closeRadio())},1e3)},t.prototype.openHistory=function(){var t=utilities.getAJAX("radio/history");t.done(function(t){t=$.parseJSON(t);for(var e=null,s="<table class='table'><thead><tr><td>Time</td><td>Artist</td><td>Name</td></tr></thead><tbody>",a=0,o=t.length;o>a;a++)e=t[a],s+="<tr><td>"+utilities.timeAgo(e.created_at)+"</td><td> "+e.artist+"</td><td>"+e.song+"</td></tr>";s+="</tbody></table>",radio.openPull(s)})},t.prototype.openTimetable=function(){var t=utilities.getAJAX("radio/timetable");t.done(function(t){t=$.parseJSON(t);for(var e="<table class='table text-center'><thead><tr><td>&nbsp;</td><td>Monday</td><td>Tuesday</td><td>Wednesday</td><td>Thursday</td><td>Friday</td><td>Saturday</td><td>Sunday</td></tr></thead><tbody>",s=0,a=23;a>=s;s++){e+="<tr><td>"+s+":00</td>";for(var o=0,i=6;i>=o;o++)e+="<td>",e+=void 0!==t[o]&&void 0!==t[o][s]?t[o][s]:"&nbsp;",e+="</td>";e+="</tr>"}e+="</tbody></table>",radio.openPull(e)})},t.prototype.openRequest=function(){var t=utilities.getAJAX("radio/request/song");t.done(function(t){t=$.parseJSON(t);var e="";e+=2===t.response?"<form role='form'><div class='form-group'><label for='request-artist'>Artist Name</label><input type='text' id='request-artist' class='form-control' name='request-artist' placeholder='Artist Name' required /></div><div class='form-group'><label for='request-name'>Song Name</label><input type='text' id='request-name' class='form-control' name='request-name' placeholder='Song Name' required /></div><div class='form-group'><p id='request-button' class='btn btn-primary'>Request</p></div></form>":1===t.response?"<p class='text-warning'>Auto DJ currently does not accept song requests, sorry!":"<p class='text-danger'>You must be logged in to request a song from the DJ.</p>",radio.openPull(e)}),setTimeout(function(){$("#request-button").click(function(){radio.sendRequest()})},3e3)},t.prototype.sendRequest=function(){var t,e={artist:document.getElementById("request-artist").value,name:document.getElementById("request-name").value};t=utilities.postAJAX("radio/request/song",e),t.done(function(t){t=$.parseJSON(t);var e="";e=t.sent===!0?"<p class='text-success'>Your request has been sent to the DJ</p>":"<p class='text-danger'>There was an error while processing your request.  Try again?",$("#pull-contents").html(e)}),this.hidePull(),this.update()},t.prototype.openPull=function(t){$("#pull-contents").html(t),$("#radio-pull").removeClass("hidden").css({width:"50%"}),$("#radio-options").css({width:"50%"})},t.prototype.hidePull=function(){$("#pull-contents").html("&nbsp;"),$("#radio-pull").width("").addClass("hidden").css({width:"0%"}),$("#radio-options").width("").css({width:"100%"})},t.prototype.update=function(){$("#requests-user-current").html("");var t=utilities.getAJAX("radio/update");t.done(function(t){t=$.parseJSON(t);var e="";$("#radio-song-name").html(t.song.name),$("#radio-song-artist").html(t.song.artist),$("#radio-dj").html(null!==t.dj&&""!==t.dj?"DJ "+t.dj:"Auto DJ"),$("[rt-data='radio:message.contents']").html(""!==t.message?t.message:"Auto DJ is currently on air");for(var s=0,a=t.requests.length;a>s;s++){var o=t.requests[s];0==o.status?e+="<p>":1==o.status?e+="<p class='text-success'>":2==o.status&&(e+="<p class='text-warning'>"),e+=o.song_name+" by "+o.song_artist,e+="</p>"}$("#requests-user-current").html(e),setTimeout(function(){radio.update()},3e4)})},t}(),signupForm,SignupForm=function(){function t(){this.elements={},this.paths={},this.elements={displayName:"#display_name",email:"#email",password:"#password",password2:"#password2",securityCheck:"#security"},this.paths={checkAvailability:"/get/signup/"};var t,e,s,a=500;$(this.elements.displayName).bind("input",function(){t&&clearTimeout(t),t=setTimeout(function(){signupForm.checkAvailability("display_name")},a)}),$(this.elements.email).bind("input",function(){e&&clearTimeout(e),e=setTimeout(function(){signupForm.checkAvailability("email")},a)}),$(this.elements.password).bind("input",function(){s&&clearTimeout(s),s=setTimeout(function(){signupForm.checkPassword()},a)}),$(this.elements.password2).bind("input",function(){s&&clearTimeout(s),s=setTimeout(function(){signupForm.checkPassword()},a)}),$(this.elements.securityCheck).bind("change",function(){signupForm.checkSecurity()}),$("form").submit(function(t){signupForm.submit(t)})}return t.prototype.checkAvailability=function(t){var e=$("#"+t).val();if(0===e.length)return!1;var s,a=this.paths.checkAvailability+t;"display_name"===t?s=utilities.postAJAX(a,{display_name:e}):"email"===t&&(s=utilities.postAJAX(a,{email:e})),s.done(function(e){return e=utilities.JSONDecode(e),e.available===!0?($("#signup-"+t).removeClass("has-error").addClass("has-success").find(".col-lg-10").find(".help-block").removeClass("show").addClass("hidden").parent().find(".glyphicon-ok").removeClass("hidden").addClass("show").parent().find(".glyphicon-remove").removeClass("show").addClass("hidden"),!0):($("#signup-"+t).removeClass("has-success").addClass("has-error").find(".col-lg-10").find(".help-block").removeClass("hidden").addClass("show").parent().find(".glyphicon-remove").removeClass("hidden").addClass("show").parent().find(".glyphicon-ok").removeClass("show").addClass("hidden"),!1)})},t.prototype.checkPassword=function(){var t=$(this.elements.password).val(),e=$(this.elements.password2).val();return e.length>0?t===e?(this.toggleFeedback("password",!0),this.toggleFeedback("password2",!0),!0):(this.toggleFeedback("password",!1),this.toggleFeedback("password2",!1),!1):void 0},t.prototype.checkSecurity=function(){var t=$(this.elements.securityCheck).val();10>=t?($("form button").removeAttr("disabled"),$("form .text-danger").css({display:"none"})):t>10&&($("form button").attr("disabled","disabled"),$("form .text-danger").css({display:"block"}))},t.prototype.submit=function(t){var e=this.checkAvailability("username"),s=this.checkAvailability("email"),a=this.checkPassword();return e===!0&&s===!0&&a===!0?(t.preventDefault(),!0):void t.preventDefault()},t.prototype.toggleFeedback=function(t,e){e===!0?$("#signup-"+t).removeClass("has-error").addClass("has-success").find(".col-lg-10").find(".glyphicon-ok").removeClass("hidden").addClass("show").parent().find(".glyphicon-remove").removeClass("show").addClass("hidden").parent().find(".help-block").removeClass("show").addClass("hidden"):$("#signup-"+t).removeClass("has-success").addClass("has-error").find(".col-lg-10").find(".glyphicon-remove").removeClass("hidden").addClass("show").parent().find(".glyphicon-ok").removeClass("show").addClass("hidden").parent().find(".help-block").removeClass("hidden").addClass("show")},t}(),StaffList=function(){function t(){var t=$("[rt-hook='hook!staff.list:card']");$.each(t,function(t,e){var s=$(e),a=$(s).attr("rt-data");$(s).find(".front").css({"background-image":"url('/img/forums/photos/"+a+".png')"}),$(s).bind("touchstart",function(){$(this).toggleClass("hover")})})}return t}(),utilities,Utilities=function(){function t(){}return t.prototype.getAJAX=function(t){return $.ajax({url:t,type:"get",dataType:"html",async:!0})},t.prototype.postAJAX=function(t,e){return $.ajax({url:t,type:"post",data:e,async:!0})},t.prototype.timeAgo=function(t){var e=Math.floor(Date.now()/1e3),s=e-t;return s>172800?"a few days ago":s>86400?"yesterday":s>7200?Math.floor(s/3600)+" hours ago":s>3600?"an hour ago":s>=120?Math.floor(s/60)+" minutes ago":s>=60?"1 minute ago":s>1?s+" seconds ago":"1 second ago"},t.prototype.currentTime=function(){return Math.floor(Date.now()/1e3)},t.prototype.JSONDecode=function(t){return $.parseJSON(t)},t.prototype.scrollTo=function(t,e){$("html, body").animate({scrollTop:$(t).offset().top},e)},t}();utilities=new Utilities;