let email;
let ipdata = {ip: "", port: 0};
let connected = false;

chrome.identity.getProfileUserInfo((info) => {
    email = info.email;
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.text) {
        case "sendserverdata":
            ipdata.ip = request.ip;
            ipdata.port = request.port;
            sendResponse({text: ""});
            break;
        case "requestserverdata":
            sendResponse({ip: ipdata.ip, port: ipdata.port});
            break;
        case "getemail":
            sendResponse({email: email});
            break;
        case "pause":
            if (connected) socket.send(`p,${request.time}|1`);
            sendResponse({text: ""});
            break;
        case "play":
            if (connected) socket.send(`p,${request.time}|0`);
            sendResponse({text: ""});
            break;
        case "disconnect":
            if (connected) socket.send("d,0");
            sendResponse({text: ""});
            break;
        default:
            break;
    }
})