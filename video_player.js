//Set some variables you will use

//This will control ad playback
var adsManager;

//This will control requesting the ad, and how the ad displays
var adsLoader;

//This will hold the div where the ad actually displays
var adDisplayContainer;

//This variable holds reference to the adContainer element you made earlier
var adContainerElement = document.getElementById('adContainer');

//This variable holds the actual video content element
var videoContent = document.getElementById('contentElement');

//Set the requestAds() function as the callback of the contentElementâ€™s onclick event
videoContent.onclick = requestAds();

//Set an event listener for the end of content to call contentComplete() on the adsLoader. //This triggers any postrolls
videoContent.addEventListener('ended',function() {adsLoader.contentComplete();});

//Create requestAds() function
function requestAds(){
	//Pass adContainerElement to adDisplayContainer object
	var adDisplayContainer = new google.ima.AdDisplayContainer(adContainerElement);	  //Pass adDisplayContainer to adsLoader
	adsLoader = new google.ima.AdsLoader(adDisplayContainer);
	//Create and adsRequest object and set the adTagUrl param to your ad tag
	var adsRequest = new google.ima.AdsRequest();
	//!!! The adTagUrl can be generated via DFP or AdX GUI
        adsRequest.adTagUrl = "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/6337308/VDO_Test&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]";

	//Set the size that both linear and non-linear ads will display
	adsRequest.linearAdSlotWidth = videoContent.width;
	adsRequest.linearAdSlotHeight = videoContent.height;
	adsRequest.nonLinearAdSlotWidth = videoContent.width;
	adsRequest.nonLinearAdSlotHeight = videoContent.height;

	//Set event listener for ADS_MANAGER_LOADED: this is called when the ad loads
	adsLoader.addEventListener(
			google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
			onAdsManagerLoaded);

	//Set event listener for  AD_ERROR; this is called if the ad request fails
	adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);

	//Initialize the adDisplayContainer and the videoElement. This is needed on many
	//mobile browsers so the user doesnâ€™t have to tap â€œplayâ€ twice.

	//Initialize the adDisplayContainer
	adDisplayContainer.initialize();
	
	//Call load on the videoElement to initialize it
	videoContent.load();

	//Now we will actually request the ads!

	//call requestAds() on the adsLoader, and pass in the adsRequest object.
	adsLoader.requestAds(adsRequest);
}

//Now build that callback to handle errors! 
function onAdError(adErrorEvent) {
	//We are logging the error (just for debugging)
	console.log("Ad error: " + adErrorEvent.getError());
	//And destroying the adsManager, if one is returned, so future requests donâ€™t fail
	adsManager.destroy();
}
//We also build the callback for ADS_MANAGER_LOADED
function onAdsManagerLoaded(adsManagerLoadedEvent){
	//The callback has the adsManagerLoadedEvent. We call â€œgetAdsManagerâ€ 
	//and pass in our videoContent element so we can track playback
	//This all goes into that adsManager we created earlier.
	adsManager = adsManagerLoadedEvent.getAdsManager(videoContent);

	//Next we register the required event listeners. You canâ€™t call adsManager.init() 
	//without them! 
	//This calls that onAdError callback, which calls destroy() on the adsManager
	adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,onAdError);
	//This is called when an ad is ready to play; set a function to pause content
	adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, function() {
				videoContent.pause();});
	//This is called when an ad break is over; set a function to play content
	adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, function() {
				videoContent.play();});
	//This is called when all ads are complete; destroy the adsLoader and adsManager; required for scor
	adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function() {
				adsManager.destroy();
				adsLoader.destroy();});

	//Now you can add event listeners for optional events
	var adEvents = [ google.ima.AdEvent.Type.LOADED,
			google.ima.AdEvent.Type.CLICK, 
			google.ima.AdEvent.Type.COMPLETE,
			google.ima.AdEvent.Type.FIRST_QUARTILE,
			google.ima.AdEvent.Type.MIDPOINT, 
			google.ima.AdEvent.Type.PAUSED,
			google.ima.AdEvent.Type.SKIPPED,
			google.ima.AdEvent.Type.STARTED,
			google.ima.AdEvent.Type.THIRD_QUARTILE];
	for (event in adEvents) {
		adsManager.addEventListener(adEvents[event], onAdEvent);
	}


	//Now we play the ads! 
	try {
		//init() will start ad rule playback when it is called
		adsManager.init(videoContent.width, videoContent.height,
				google.ima.ViewMode.FULLSCREEN);
		//Start() will start single ads, and is ignored if an ad rule serves
		adsManager.start();
	} catch (e) {
		console.log('Error starting ads: ' + e);
	}


}

function closeAds() {
	adContainerElement.style.display='none';
}

//Weâ€™ll just log that the event happened for now
function onAdEvent(event) {
	console.log('Ad event: ' + event.type);
	if (event.type=='complete'||event.type=='click'||event.type=='skip'||event.type=='user_close') {
		closeAds();
	}
}

