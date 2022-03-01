document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startbutton');

    startButton.addEventListener('click', () => {
        chrome.tabs.create({url: chrome.runtime.getURL("player.html")})
    }, false);
}, false);