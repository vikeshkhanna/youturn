var flash;
var html5;
var POLL_INTERVAL = 1000;

var appId = 223731717660238;
var redirect_uri = 'https://www.facebook.com/connect/login_success.html'

var RepeatState =
	{
		NO_REPEAT : 0,
		REPEAT : 1
	}
var title = ["Repeat Off", "Repeat On"]
	
var repeatState = RepeatState.NO_REPEAT; //default state - don't repeat

var icon0 = chrome.extension.getURL("icons/icon0.png");
var icon1 = chrome.extension.getURL("icons/icon1.png");


function checkPlayerState()
{
	if( repeatState == RepeatState.REPEAT)
	{
		if(html5 && html5.currentTime == html5.duration) 
		{
				html5.play();
		}
		else if(flash && flash.getPlayerState() == 0) //ended
		{
				flash.seekTo(0, true);
				flash.playVideo();
		}
	}
	
	if(flash || html5) //do not poll if reference is not there 
			setTimeout(checkPlayerState, POLL_INTERVAL); 
}

//handle timer to get player reference
function handleTimeout()
{
	if(checkPlayer()) {
		console.log("<youturn> player ready");
		setTimeout(checkPlayerState, POLL_INTERVAL);  //start polling
	}
	else
	{
		setTimeout(handleTimeout);
	}
}

//Timer based event to get reference to player - onYouTubeReady not working for some reason
function checkPlayer()
{
	flash = document.getElementById('movie_player');
	html5 = document.querySelector('video.video-stream');
	return (flash || html5);
}

function toggleRepeat(sendResponse)
{
	//change repeat state and icon
	if(repeatState == RepeatState.NO_REPEAT)
		repeatState = RepeatState.REPEAT;
	else
		repeatState = RepeatState.NO_REPEAT;
	
	console.log("<youturn> repeatState changed to: " + repeatState);
	
	sendResponse({"toggleIcon" : true, "repeatState" : repeatState, "title" : title[repeatState]});
	
}

//common event handler
function onExtensionMessage(request, sender, sendResponse)
{
	console.log("<youturn> onExtensionMessage called with request: " + request.toString());

	if(request["toggleRepeat"] != undefined)
	{
		console.log("<youturn> toggleRepeat detected");
		toggleRepeat(sendResponse);
	}	
}

function publish_action()
{
	    console.log("<youturn> FB: Publishing action");
	    
            FB.api('/me/sixpackapps:youturn?other=' + window.location.href ,'post');
	    
	    // !!! Not receiving callback - FB.ApiServer._callbacks. method not found - JS SDK is unable to register callbacks for some reason.
            
            //set button style - this could be a false positive
            var img = document.getElementById('youturn_fb_icon');
            img.src = icon1; 
            
            var btn_post_fb = document.getElementById('youturn_fb_post');
            btn_post_fb.disabled = true;
             
            var span = document.getElementById('youturn_fb_span');
            span.innerHTML = "YouShared!";
}

function post_fb()
{
	FB.getLoginStatus(function(response) {
	  if (response.authResponse) {
	    // logged in and connected user, someone you know
	    console.log("<youturn> FB login successful");
	    publish_action();		  
	  }
	  else 
	  {
		//user is not logged in 
		FB.login(function(response) {
		   if (response.authResponse) 
		   {
 		            //Login was successful
 		            console.log("<youturn> FB login successful");
 		            publish_action();
 		    }
		   else 
		   {
		     console.log('<youturn> FB login failed - User cancelled login or did not fully authorize.');
		   }
		 }, {scope: 'publish_actions'});    
	  }});

}

function init_layout()
{
	btn_post_fb = document.createElement('button');
	btn_post_fb.type= "button";
	btn_post_fb.className = "start yt-uix-tooltip-reverse  yt-uix-button yt-uix-button-default yt-uix-tooltip";
	btn_post_fb.role = "button";
	btn_post_fb.title = "Let people know you looped this song!";
	btn_post_fb.style.margin = "10px 0px 10px 0px";
	btn_post_fb.onclick = function(){ post_fb(); }
	btn_post_fb.style.marginLeft = "5px";
	btn_post_fb.id = "youturn_fb_post";
	
	var img = document.createElement('img');
	img.style.className = 'yt-uix-button-icon yt-uix-button-icon-watch-like';
	img.id = "youturn_fb_icon";
	img.src = icon0;
	
	var span = document.createElement('span')
	span.style.className = 'yt-uix-button-content';
	span.innerHTML = "Share your YouTurn";
	span.style.marginLeft = "5px";
	span.style.marginTop = "3px";
	
	span.id = "youturn_fb_span";
	
	btn_post_fb.appendChild(img);
	btn_post_fb.appendChild(span);
		
	var watch_panel = document.getElementById('watch-actions');
	watch_panel.appendChild(btn_post_fb);
}

//init
function init()
{
	init_layout();
	
	console.log("<youturn> init content script called");
	chrome.extension.onRequest.addListener(onExtensionMessage);
	
	var fb = document.createElement('div');
	fb.id = 'fb-root';
	
	var head = $("head").get(0);  // using jquery
	var script2 = document.createElement("script");
	script2.innerHTML = "window.FB = null; FB=null;";
	head.appendChild(script2);
	
	$('body').prepend(fb);
	
	window.fbAsyncInit = function() {
	    	FB.init({
	      appId      : appId, // App ID
	      status     : true, // check login status
	      cookie     : true, // enable cookies to allow the server to access the session
	      xfbml      : true  // parse XFBML
	    });
    	}	
    	
    
    (function(d){
     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     d.getElementsByTagName('head')[0].appendChild(js);
   }(document));
        
        
        $('head').append('<meta property="fb:app_id"' + 'content="' + appId + '" /> <meta property="og:type"  content="video" /> ..\
  <meta property="og:url"         content="http://www.youtube.com/watch?v=dmKeIlJq4gM&ob=av2n" /> <meta property="og:title"       content="Stairway to Heaven" />..\
  <meta property="og:description" content="Share the videos you are YouTurning!" /> <meta property="og:image" content="https://s-static.ak.fbcdn.net/images/devsite/attachment_blank.png" />');
}

$(document).ready(function(){
	init();
});

setTimeout(handleTimeout, 1000);

