#!/usr/bin/python3.10
import asyncio
import binascii
import logging
import glob
import os
from typing import Optional

import websockets
from websockets.typing import Data

pause: bool = False
name: str = ""
clients = dict()
host: websockets.WebSocketServerProtocol = None


async def end():
    global pause, clients
    logger.info(f"Host {'(Unknown)' if host is None else host.remote_address} Issued Exit Command")
    pause = False
    with open("client.txt", "w") as client_file:
        client_file.write(f"0,0")
    for client in clients.values():
        logger.info(f"Sending Disconnect to {client.remote_address}")
        await client.send("d")
    clients = dict()


async def handler(websocket: websockets.WebSocketServerProtocol):
    global pause, host, name
    logger.info(f"{websocket.remote_address} is Trying to Connect")
    websocket.max_size = 2**32
    count = 1
    expect_upload = False
    video_file = None
    file_name = ""
    while True:
        try:
            try:
                in_stream: Optional[Data] = await websocket.recv()
            except websockets.ConnectionClosedError:
                if websocket.remote_address in clients:
                    clients.pop(websocket.remote_address)
                    logger.warning(f"{websocket.remote_address} Suddenly Disconnected")
                    if host is not None and websocket.remote_address == host.remote_address:
                        logger.warning(f"Host Suddenly Disconnected")
                        await end()
                        host = None
                return
            if in_stream is not None:
                text = str(in_stream)
            else:
                return
            if expect_upload:
                if video_file is None:
                    video_file = open(f"./video/{file_name}", "ab")
                    for client in clients.values():
                        await client.send(f"dd,{file_name}")
                if text == "ud":
                    logger.info(f"Recived File: {file_name}")
                    video_file.close()
                    video_file = None
                    expect_upload = False
                    count = 1

                    for client in clients.values():
                        await client.send(f"cd,{file_name}")
                    continue
                try:
                    video_file.write(in_stream)
                    await websocket.send(f"us,{count}")
                    count += 1
                except binascii.Error:
                    logger.warning(f"Incorrect Padding: {text}")
                continue
            else:
                content = text.split(",")
            try:
                command = content[0]
                data = content[1]
            except IndexError:
                logger.warning(f"Command Missing Data: {in_stream}")
                continue
            if command == "h":
                if host is None:
                    logger.info("Connected")
                    logger.info(f"Setting Host: {websocket.remote_address}")
                    clients[websocket.remote_address] = websocket
                    host = websocket
                    await websocket.send("sh")
                    files = glob.glob('./video/*')
                    if len(files) == 1:
                        file_name = os.path.basename(files[0])
                        await websocket.send(f"cd,{file_name}")
                else:
                    logger.info(f"{websocket.remote_address} Tried to host. Host is {host.remote_address}")
                    await websocket.send("fh")
                    await websocket.send("q")
            elif command == "c":
                if host is None:
                    logger.info(f"There is no Host and {websocket.remote_address} Tried to Connect")
                    await websocket.send("fc")
                    await websocket.send("q")
                else:
                    logger.info("Connected")
                    clients[websocket.remote_address] = websocket
                    await websocket.send("sc")
                    await host.send(f"nc,{websocket.remote_address}")
                    files = glob.glob('./video/*')
                    if len(files) == 1:
                        file_name = os.path.basename(files[0])
                        await websocket.send(f"cd,{file_name}")
            elif command == "ns":
                name = data
                logger.info(f"Server Name Set to '{name}'")
            elif command == "ng":
                logger.info(f"Sending Name to {websocket.remote_address}")
                await websocket.send(f"n,{name}")
            elif command == "u":
                logger.info(f"Updating Timestamp: {data}")
                with open("client.txt", "w") as client_file:
                    client_file.write(f"{data},{'1' if pause else '0'}")
                with open("client.txt", "r+") as client_file:
                    client_data_string = client_file.read()
                    client_data = client_data_string.split(",")
                    pause = client_data[1] == "1"
            elif command == "up":
                file_data = data.split("|")
                file_name = file_data[1]
                logger.info(f"Reciving File With {file_data[0]} Bytes")
                if not os.path.exists('./video/'):
                    os.makedirs('video')
                files = glob.glob('./video/*')
                for f in files:
                    logger.info(f"Removing {os.path.basename(f)}")
                    os.remove(f)
                with open(f"./video/{file_name}", 'w'):
                    pass
                expect_upload = True
            elif command == "p":
                pause_data = data.split("|")
                pause = pause_data[1] == '1'
                logger.info(f"Updating Pause: {'Paused' if pause else 'Resumed'}")
                for client in clients.values():
                    if client == websocket:
                        continue
                    await client.send(f"u,{pause_data[0]}|{pause_data[1]}")
            elif command == "d":
                logger.info(f"{websocket.remote_address} Disconnected")
                clients.pop(websocket.remote_address)
                await websocket.close()
                if host is not None:
                    if websocket.remote_address == host.remote_address:
                        logger.info(f"Host Disconnected")
                        await end()
                        host = None
                    else:
                        await host.send(f"dc,{websocket.remote_address}")
                break
            elif command == "q":
                logger.info(f"Host Issued Exit Command")
                clients.pop(websocket.remote_address)
                await end()
                await websocket.send("q")
                break
            else:
                logger.warning(f"Unknown Command: {in_stream}")
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
    asyncio.run(main())
