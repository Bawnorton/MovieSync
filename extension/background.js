let email;
let socket;
let data;
let connected = false;

chrome.identity.getProfileUserInfo((info) => {
    email = info.email;
})

function startServer(ip, port) {
    socket = new WebSocket(`ws://${ip}:${port}`)

    socket.binaryType = "arraybuffer"

    socket.onopen = function() {
        connected = true;
        socket.send("Connected")
    };

    socket.onclose = function() {
        connected = false;
    }

    socket.onmessage = (event) => {
        if (event.data === "u") {
            fetch(`http://${ip}:8000/client.txt`).then((response) => {
                response.text().then((text) => {
                    data = text.split(',')
                });
            });
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.text) {
        case "getdata":
            sendResponse({time: data[0], pause: data[1] === '1'})
            break;
        case "startserver":
            try {
                startServer(request.ip, request.port)
            } catch (err) {
                sendResponse({error: "Cannot Find Server"})
            }
            break;
        case "getemail":
            sendResponse({email: email})
            break;
        case "pause":
            if (connected) socket.send(`p,${request.time}|1`)
            sendResponse({text: ""})
            break;
        case "play":
            if (connected) socket.send(`p,${request.time}|0`)
            sendResponse({text: ""})
            break;
        case "disconnect":
            if (connected) socket.send("d,")
            sendResponse({text: ""})
            break;
        default:
            break;
    }
})