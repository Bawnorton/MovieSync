let logged_in_user;
let socket;
let data;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileinput')
    const fileInputButton = document.getElementById("fileinputbutton")
    const player = document.getElementById("videoplayer")

    window.onbeforeunload = function() {
        chrome.runtime.sendMessage({text: "disconnect"}, () => {})
    };

    function isHost() {
        return logged_in_user.includes("bnjmnnrtn")
    }

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
    }

    chrome.runtime.sendMessage({text: "getemail"}, (response) => {
        logged_in_user = response.email;
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
            player.style.objectFit = "cover"
            player.style.display = "block"
            if (isHost()) {
                player.setAttribute("controls", "controls")
                chrome.runtime.sendMessage({text: "requestserverdata"}, (response) => {
                    startServer(response.ip, response.port)
                })
            }
        }
    })

    player.addEventListener("pause", () => {
        if (isHost()) {
            chrome.runtime.sendMessage({text: "pause", time: player.currentTime}, () => {})
        }
    })

    player.addEventListener("play", () => {
        if (isHost()) {
            chrome.runtime.sendMessage({text: "play", time: player.currentTime}, () => {})
        }
    })

    document.addEventListener('contextmenu', (event) => {
        if(!isHost()) {
            event.preventDefault();
        }
    }, false)
})

