let logged_in_user
let socket
let file
let connected = false
let host = false
let data = {time: 0, pause: false}

document.addEventListener('DOMContentLoaded', () => {
    const ipField = document.getElementById('ipinput')
    const portField = document.getElementById('portinput')
    const nameField = document.getElementById('nameinput')
    const fileInput = document.getElementById('fileinput')
    const fileInputButton = document.getElementById('fileinputbutton')
    const connectButton = document.getElementById('connectbutton')
    const hostButton = document.getElementById('hostbutton')
    const uploadButton = document.getElementById('uploadbutton')
    const downloadButton = document.getElementById('downloadbutton')
    const startButton = document.getElementById('startbutton')
    const errorLabel = document.getElementById('errorlabel')
    const ipLabel = document.getElementById('iplabel')
    const statusLabel = document.getElementById('statuslabel')
    const nameLabel = document.getElementById('namelabel')
    const serverTable = document.getElementById('servertable')
    const nameTable = document.getElementById('nametable')
    const player = document.getElementById('videoplayer')
    const containers = document.getElementsByClassName('Container')
    const downloadContainer = document.getElementById('downloadcontainer')
    const progress = document.getElementById('progress')
    const progressBar = document.getElementById('progressbar')


    window.onbeforeunload = function() {
        if (connected) socket.send("d,-")
    }

    function startConnection(host) {
        try {
            startServer(ipField.value, portField.value, () => {
                if (connected) {
                    socket.send(host ? "h,-" : "c,-")
                    serverTable.style.display = "none"
                    ipLabel.innerText = `${ipField.value}:${portField.value}`
                    statusLabel.innerText = host ? "Host" : "Client"
                    if(host) {
                        nameTable.style.display = "table"
                    } else {
                        uploadButton.style.display = "none"
                        downloadButton.disabled = true;
                        fileInputButton.style.marginRight = 0
                        for (let container of containers) {
                            container.style.display = "block"
                        }
                        socket.send("ng,-")
                    }
                } else {
                    errorLabel.style.display = "block"
                    errorLabel.textContent = "Cannot Connect to Server"
                }
            })
        } catch (err) {
            errorLabel.style.display = "block"
            errorLabel.textContent = "Invalid Server Address"
        }
    }

    function reset(message) {
        serverTable.style.display = "table"
        nameTable.style.display = "none"
        for (let container of containers) {
            container.style.display = "none"
        }
        errorLabel.style.display = "block"
        if(message) {
            errorLabel.textContent = message
        }
    }

    function startServer(ip, port, callback) {
        socket = new WebSocket(`ws://${ip}:${port}`)

        socket.binaryType = "arraybuffer"

        socket.onerror = () => {
            connected = false
            callback()
        }

        socket.onopen = () => {
            connected = true
            callback()
        }

        socket.onclose = () => {
            connected = false
        }

        socket.onmessage = (event) => {
            if (event.data === "q") {
                console.log("Server Issued Disconnect")
                socket.close()
            } else if (event.data === "d") {
                console.warn("Host Disconnected")
                socket.close()
                reset("Host Disconnected")
            } else if (event.data === "sh") {
                console.log("Successfully Connected as Host")
                host = true
            } else if (event.data === "sc") {
                console.log("Successfully Connected as Client")
            } else if (event.data === "fc") {
                console.error("Failed to Connect as Client")
                reset("Server has no Host")
            } else if (event.data === "fh") {
                console.error("Failed to Connect as Host")
                reset("Server Already has a Host")
            } else if (event.data.startsWith('n')) {
                nameLabel.innerText = event.data.substring(2)
                console.log("Server Name Set")
            } else if (event.data === "u") {
                fetch(`http://${ip}:8000/client.txt`).then((response) => {
                    response.text().then((text) => {
                        let clientData = text.split(',')
                        data.pause = clientData[1] === '1'
                        data.time = parseFloat(clientData[0])
                        console.log(data)
                        player.currentTime = parseFloat(data.time)
                        if (data.pause) {
                            player.pause()
                        } else if (player.paused) {
                            player.play()
                        }
                    })
                })
            } else {
                console.log(`Unknown Command: ${event.data}`)
            }
        }
    }

    chrome.runtime.sendMessage({text: "getemail"}, (response) => {
        logged_in_user = response.email
    })

    connectButton.addEventListener('click', () => {
        console.log(`Connecting to: ${ipField.value}:${portField.value}`)
        startConnection(false)
    })

    hostButton.addEventListener('click', () => {
        console.log(`Hosting Connection to: ${ipField.value}:${portField.value}`)
        startConnection(true)
    })

    startButton.addEventListener('click', () => {
        nameTable.style.display = "none"
        nameLabel.textContent = nameField.value
        for (let container of containers) {
            container.style.display = "block"
        }
        downloadContainer.style.display = "none"
        socket.send(`ns,${nameField.value}`)
    })

    fileInputButton.addEventListener('click', () => {
        fileInput.click()
    })

    fileInput.addEventListener('change', () => {
        file = fileInput.files[0]
        fileInputButton.value = file.name === "" ? "Video File" : file.name
        fileInputButton.style.color = file.name === "" ? 'grey' : 'white'

        if (file && file.name !== "") {
            player.src = URL.createObjectURL(file)
            player.style.objectFit = "cover"
            player.style.display = "block"
            if (host) {
                player.setAttribute("controls", "controls")
            }
        }
    })

    let startUpload = false
    let uploader = setInterval(() => {
        if(startUpload) {
            let sliceSize = 1000 * 1024
            const numChunks = Math.ceil(file.size / sliceSize)
            let count = 0
            function uploadNextSlice(start) {
                count++
                let nextSlice = Math.min(start + sliceSize, file.size)
                console.log(`Uploading Slice ${count}/${numChunks}`)
                let blob = file.slice(start, nextSlice)
                let reader = new FileReader()
                reader.onloadend = (event) => {
                    if(event.target.readyState !== FileReader.DONE) {
                        return
                    }
                    let binaryFileData = event.target.result
                    fetch(`http://${ipField.value}:8000/video`, {
                        method: "POST",
                        headers: {"Content-Range": `${blob.size}`},
                        data: binaryFileData
                    }).then((response) => {
                        let percentDone = (start + sliceSize) / file.size * 100
                        console.log(percentDone)
                        progressBar.style.width = `${percentDone}%`
                        if(nextSlice < file.size) {
                            uploadNextSlice(nextSlice)
                        }
                        return response.text()
                    }).then((data) => {
                        console.log(data)
                    })

                }
                reader.readAsArrayBuffer(blob)
            }
            uploadNextSlice(0)
            clearInterval(uploader)
        }
    }, 1000)

    uploadButton.addEventListener('click', () => {
        file = fileInput.files[0]
        if(file && file.name !== "") {
            progress.style.display = "block"
            startUpload = true
        }
    })

    player.addEventListener("pause", () => {
        if (host && connected) {
            console.log("Sending Pause")
            socket.send(`p,${player.currentTime}|1`)
        }
    })

    player.addEventListener("play", () => {
        if (host && connected) {
            console.log("Sending Play")
            socket.send(`p,${player.currentTime}|0`)
        }
    })

    document.addEventListener('contextmenu', (event) => {
        if(connected && !host) {
            event.preventDefault()
        }
    }, false)
})

