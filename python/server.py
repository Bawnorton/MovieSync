#!/usr/bin/python3.10
import socket
import socketserver
from _thread import *
from http.server import SimpleHTTPRequestHandler

HOST = '162.248.100.184'
PORT = 65432

first_user: bool = False
timestamp: int = 0
pause: bool = False
clients: list = []


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleHTTPRequestHandler.end_headers(self)


def create_http_server():
    handler = CORSRequestHandler

    with socketserver.TCPServer(("", 8000), handler) as httpd:
        print("HTTP Server started at localhost:8000")
        httpd.serve_forever()


def create_server():
    global first_user
    server_socket = socket.socket()
    try:
        server_socket.bind((HOST, PORT))
    except OSError:
        print("No Avaliable Ports")

    start_new_thread(create_http_server, ())

    print("Server Started. Pending Connection to Client...")
    server_socket.listen(5)

    first_user = True

    try:
        while True:
            client, address = server_socket.accept()
            clients.append((client, address))
            print("Connecting to", address)
            start_new_thread(threaded_client, (client, address, first_user))
            first_user = False
    except KeyboardInterrupt:
        end()
        print("Interrupted")


def end(host=None):
    global first_user, timestamp, pause
    first_user = True
    pause = False
    timestamp = 0
    for client in clients:
        if client[0] == host:
            continue
        print("Sending disconnect to", client[1])
        client[0].sendall("q".encode("utf-8"))
    with open("client.txt", "w") as client_file:
        client_file.write(f"{timestamp},{'1' if pause else '0'}")


def threaded_client(connection, address, is_host):
    global timestamp, pause, first_user
    connection.sendall("Connected".encode('utf-8'))
    if is_host:
        connection.sendall("h".encode('utf-8'))
    while True:
        data = connection.recv(1024).decode("utf-8")
        if str(data) == "u":
            if is_host:
                print("Updating Timestamp")
                with open("client.txt", "w") as client_file:
                    client_file.write(f"{timestamp + 1},{'1' if pause else '0'}")
                    connection.sendall("uw".encode("utf-8"))
                with open("client.txt", "r+") as client_file:
                    client_data_string = client_file.read()
                    client_data = client_data_string.split(",")
                    timestamp = int(client_data[0])
                    pause = client_data[1] == "1"
                    connection.sendall("s".encode("utf-8"))
        elif str(data) == "p":
            if is_host:
                print("Updating Pause")
                pause = not pause
                connection.sendall("ps".encode("utf-8"))
        elif str(data) == "d":
            print("Disconnected from", address)
            if is_host:
                print(f"Host Disconnected")
                end(connection)
            break
        elif str(data) == "q":
            print(f"Quit Issued by Host {address}")
            end(connection)
            break
    connection.close()


if __name__ == '__main__':
    create_server()
