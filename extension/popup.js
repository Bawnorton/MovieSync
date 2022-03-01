
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startbutton');
    const ipField = document.getElementById('ipinput')
    const portField = document.getElementById('portinput')
    startButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({text: "startserver", ip: ipField.value, port: portField.value}, (response) => {
            if (response != null) {
                alert(response.error)
            } else {
                chrome.tabs.create({url: chrome.runtime.getURL("player.html")})
            }
        })
    }, false);
}, false);