// Initialize button with user's preferred color
let pauseVid = document.getElementById("pauseVid");
let playVid = document.getElementById("playVid");
let videoElement = null;

const {executeScript} = chrome.scripting;


// When the button is clicked, inject setPageBackgroundColor into current page
pauseVid.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // noinspection JSCheckFunctionSignatures
    executeScript({
        target: {tabId: tab.id},
        function: pauseThisVideo,
    });
        
    
});

// The body of this function will be execute as a content script inside the
// current page
const pauseThisVideo = () => {
    document.body.getElementsByTagName("video")[0].pause();
    console.log(document.body.getElementsByTagName("video")[0].currentTime);
    fetch("http://162.248.100.184:8000/client.txt").then(function(response) {
    response.text().then(function(text) {
        console.log(text);
    });
  });
    
} 



playVid.addEventListener("click", async () => {
    //console.log(isPlaying);
        
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    //videoElement = document.body.getElementsByTagName("video")[0];

    // noinspection JSCheckFunctionSignatures
    executeScript({
        target: {tabId: tab.id},
        function: playThisVideo,
    });

});



// The body of this function will be execute as a content script inside the
// current page
const playThisVideo = () => {
    document.body.getElementsByTagName("video")[0].play().then(() => {});
} 