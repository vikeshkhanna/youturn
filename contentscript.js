var flash;
var html5;
var POLL_INTERVAL = 1000;

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
		if (html5 && html5.currentTime == html5.duration) 
		{
				html5.play();
		}
		else if(flash && flash.getPlayerState() == 0) //ended
		{
				flash.seekTo(0, true);
				flash.pauseVideo();
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
	movie_player = document.getElementById('movie_player');
	
	if(movie_player && movie_player.type!=undefined && movie_player.type.indexOf("flash")!=-1)
	{
		flash = movie_player;
	}
	
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


//init
function init()
{
	
	console.log("<youturn> init content script called");
	chrome.extension.onRequest.addListener(onExtensionMessage);
}

$(document).ready(function(){
	init();
});

setTimeout(handleTimeout, 1000);

