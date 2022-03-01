let email;
let ipdata = {ip: "", port: 0};

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
        default:
            break;
    }
})