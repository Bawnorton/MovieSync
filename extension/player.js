let logged_in_user;
let socket;
let connected = false;
let data = {time: 0, pause: false};

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileinput')
    const fileInputButton = document.getElementById('fileinputbutton')
    const player = document.getElementById("videoplayer")
    const ipField = document.getElementById('ipinput')
    const portField = document.getElementById('portinput')
    const connectButton = document.getElementById('connectbutton')

    window.onbeforeunload = function() {
        if (connected) socket.send("d,0")
    };

    function isHost() {
        return logged_in_user.includes("bnjmnnrtn")
    }

    function startServer(ip, port) {
        socket = new WebSocket(`ws://${ip}:${port}`)

        socket.binaryType = "arraybuffer"

        socket.onopen = function() {
            socket.send("Connected")
            connected = true
        };

        socket.onclose = function() {
            connected = false
        }

        socket.onmessage = () => {
            fetch(`http://${ip}:8000/client.txt`).then((response) => {
                response.text().then((text) => {
                    let clientData = text.split(',')
                    data.pause = clientData[1] === '1'
                    data.time = parseFloat(clientData[0])
                    console.log(data)
                    player.currentTime = parseFloat(data.time);
                    if(data.pause) {
                        player.pause();
                    } else if (player.paused) {
                        player.play();
                    }
                });
            });
        }
    }

    chrome.runtime.sendMessage({text: "getemail"}, (response) => {
        logged_in_user = response.email;
    })

    connectButton.addEventListener('click', () => {
        startServer(ipField.value, portField.value)
        console.log(`Connected to: ${ipField.value}:${portField.value}`)
        fileInputButton.style.display = "block"
    })

    fileInputButton.addEventListener('click', () => {
        fileInput.click();
    })

    fileInput.addEventListener('change', () => {
        let file = fileInput.files[0]
        fileInputButton.value = file.name === "" ? "Video File" : file.name;
        fileInputButton.style.color = file.name === "" ? 'grey' : 'white';
        if (file.name !== "") {
            player.src = URL.createObjectURL(file)

            fileInputButton.style.display = "none"
            ipField.style.display = "none"
            portField.style.display = "none"
            connectButton.style.display = "none"

            player.style.objectFit = "cover"
            player.style.display = "block"
            if (isHost()) {
                player.setAttribute("controls", "controls")
            }
        }
    })

    player.addEventListener("pause", () => {
        if (isHost() && connected) {
            console.log("Sending Pause")
            socket.send(`p,${player.currentTime}|1`);
        }
    })

    player.addEventListener("play", () => {
        if (isHost() && connected) {
            console.log("Sending Play")
            socket.send(`p,${player.currentTime}|0`);
        }
    })

    document.addEventListener('contextmenu', (event) => {
        if(!isHost()) {
            event.preventDefault();
        }
    }, false)
})

