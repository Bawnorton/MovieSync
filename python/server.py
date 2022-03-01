#!/usr/bin/python3.10
import asyncio
import websockets

timestamp: int = 0
pause: bool = False
clients = set()


async def end(websocket=None):
    global timestamp, pause
    print(f"Host {websocket.remote_address} Issued Exit Command")
    timestamp = 0
    pause = False
    with open("client.txt", "w") as client_file:
        client_file.write(f"0,0")
        await websocket.send("uw")
    for client in clients:
        if client == websocket:
            continue
        print(f"Sending Disconnect to {websocket.remote_address}")
        client.send("q")
        client.close()


async def handler(websocket: websockets.WebSocketServerProtocol):
    global timestamp, pause
    clients.add(websocket)
    print(f"Connected to {websocket.remote_address}")
    while True:
        try:
            data = await websocket.recv()
            if data == "u":
                print("Updating Timestamp")
                with open("client.txt", "w") as client_file:
                    client_file.write(f"{timestamp + 1},{'1' if pause else '0'}")
                    await websocket.send("uw")
                with open("client.txt", "r+") as client_file:
                    client_data_string = client_file.read()
                    client_data = client_data_string.split(",")
                    timestamp = int(client_data[0])
                    pause = client_data[1] == "1"
                    await websocket.send("s")
            elif str(data) == "p":
                print("Updating Pause")
                pause = not pause
                await websocket.send("ps")
            elif str(data) == "d":
                print(f"{websocket.remote_address} Disconnected")
                websocket.close()
                break
            elif str(data) == "q":
                await websocket.send("q")
                break
        except websockets.ConnectionClosedOK:
            pass


async def main():
    async with websockets.serve(handler, "162.248.100.184", 2023):
        print("Started WebSocket Server. Awaiting Client Connection")
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        end()
        print("Interrupted")
