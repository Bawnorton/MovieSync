#!/usr/bin/python3.10
import asyncio
import logging

import websockets

pause: bool = False
clients = dict()


async def end(websocket=None):
    global pause
    logger.info(f"Host {'(Unknown)' if websocket is None else websocket.remote_address} Issued Exit Command")
    pause = False
    with open("client.txt", "w") as client_file:
        client_file.write(f"0,0")
    for client in clients.values():
        if client == websocket:
            continue
        logger.info(f"Sending Disconnect to {client.remote_address}")
        await client.send("q")
        await client.close()


async def handler(websocket: websockets.WebSocketServerProtocol):
    global pause
    clients[websocket.remote_address] = websocket
    logger.info(f"Connecting to {websocket.remote_address}")
    while True:
        try:
            in_stream = await websocket.recv()
            content = in_stream.split(",")
            try:
                command = content[0]
                data = content[1]
            except IndexError:
                if in_stream != "":
                    logger.info(in_stream)
                continue
            if command == "u":
                logger.info(f"Updating Timestamp: {data}")
                with open("client.txt", "w") as client_file:
                    client_file.write(f"{data},{'1' if pause else '0'}")
                with open("client.txt", "r+") as client_file:
                    client_data_string = client_file.read()
                    client_data = client_data_string.split(",")
                    pause = client_data[1] == "1"
            elif command == "p":
                pause_data = data.split("|")
                pause = pause_data[1] == '1'
                logger.info(f"Updating Pause: {'Paused' if pause else 'Resumed'}")
                with open("client.txt", "w") as client_file:
                    client_file.write(f"{pause_data[0]},{'1' if pause else '0'}")
                    for client in clients.values():
                        if client != websocket:
                            await client.send('u')
            elif command == "d":
                logger.info(f"{websocket.remote_address} Disconnected")
                await websocket.close()
                break
            elif command == "q":
                await websocket.send("q")
                break
        except websockets.ConnectionClosedOK:
            pass


async def main():
    async with websockets.serve(handler, "162.248.100.184", 2023):
        logger.info("Started WebSocket Server. Awaiting Client Connection")
        await asyncio.Future()


if __name__ == "__main__":
    logging.basicConfig(
        format='▸ %(asctime)s.%(msecs)03d %(filename)s:%(lineno)03d %(levelname)s %(message)s',
        level=logging.INFO,
        datefmt='%H:%M:%S')
    logger = logging.getLogger()
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        asyncio.run(end())
