# MovieSync
Python VPS / WebServer and JS Chrome Extension to sync the playing of local movie files.

## Chrome Extension Usage:
- Click `Start` in the extension
- Input VPS IP and Port 2023
- If Hosting a room click `Host`
  - Enter room name and click `Start 
- If Connecting to a room `Connect`

Host controls the video position and whenever it is paused or not. 
They also determine which video file will be avaliable to clients.

### Downloading:
- Video file name will appear above the Download button, click `Download` to get it
- Once downloaded, click `Video Input` field and select the file
- Video will now appear below

### Uploading (Host):
- Select a video file in the `Video Input` menu
- Upload the video file by pressing `Upload` 

## Chrome Extension Installation:
#### Until Google Approves
- Click `Code` and then `Download ZIP`
- Extract Downloaded ZIP to some directory
- Go to Chrome Extensions Page (chrome://extensions/)
- Enable `Developer Mode` in top right
- Click `Load Unpacked` in top left
- Navigate to where you extracted the ZIP
- Select `extensions` folder

## Python Server Installation:
Depends on: python3.10, websockets

- Click `Code` and then `Download ZIP`
- Extract Downloaded ZIP in some directory
- Add `server.py` to VPS
- Move to `server.py` dir
- Modify shebang in `./server.py` to point to python 3.10
  - Currently set to `#!/usr/bin/python3.10` can be changed with `nano ./server.py`
- Run `chmod +x ./server.py`
- Run `./server.py`
