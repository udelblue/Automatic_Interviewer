


var mic = true;
var cam = true;
if(DetectRTC.hasMicrophone  === false) {
	alert('Device does not have microphone.');
	mic = false;	
}

if(DetectRTC.hasWebcam  === false) {
	alert('Device does not have web cam.');
	cam = false;	
}

if(mic === false | cam === false)
	{
	$(location).attr('href', '/interview/unable?mic=' + mic + '&cam=' + cam) ;
	}