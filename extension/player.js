document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileinput')
    const fileInputButton = document.getElementById("fileinputbutton")
    const player = document.getElementById("videoplayer")

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
        }
    })
})