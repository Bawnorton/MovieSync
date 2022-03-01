let logged_in_user

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

    chrome.runtime.sendMessage({text: "getemail"}, (response) => {
        logged_in_user = response.email;

        if(!isHost()) {
            setInterval(() => {
                chrome.runtime.sendMessage({text: "getdata"}, (response) => {
                    console.log(response)
                    player.currentTime = parseFloat(response.time);
                    if(response.pause) {
                        player.pause();
                    } else if (player.paused) {
                        player.play();
                    }
                })
            }, 1000)
        } else {
            setInterval(() => {
                chrome.runtime.sendMessage({text: "getdata"}, (response) => {
                    console.log(response)
                })
            }, 1000)
        }
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

