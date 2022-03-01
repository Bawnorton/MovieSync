chrome.action.onClicked.addListener(() => {
    let socket;
    let connected = false;
    const host = "162.248.100.184:2023"
    socket = new WebSocket(`ws://${host}`)

    socket.binaryType = "arraybuffer"

    socket.onopen = function() {
        connected = true;
        socket.send("Connected")
    };

    socket.onclose = function() {
        connected = false;
    }

    socket.onmessage = function (event) {
        switch (event.data) {
            case "uw":
                console.log("Updated Timestamp")
                break;
            case "s":
                console.log("Updated Client Info")
                break;
            case "p":
                console.log("Pause Updated")
                break;
            case "q":
                console.log("Server Issued Exit Command")
                break;
            default:
                console.log(event.data)
        }
    };

    setInterval(() => {
        if (connected){
            socket.send("u")
        }
    }, 1000)

    console.log('started');
        fetch("http://162.248.100.184:8000/client.txt").then(function(response) {
        response.text().then(function(text) {
            console.log(text);
        });
    });
});