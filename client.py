#!/Users/benjamin/.pyenv/shims/python
try:
    import socket
    import time
except ImportError as e:
    raise ImportError(f"Cannot find library: {e.msg}\nUse \"pip import [name]\" to install library")


HOST = '162.248.100.184'
PORT = 65432


def create_client():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.connect((HOST, PORT))
        except ConnectionRefusedError:
            print(f"No server found at {HOST}:{PORT}")
            return
        address = s.getpeername()
        print("Connecting to", address)
        try:
            while True:
                to_send = "u"
                try:
                    s.sendall(to_send.encode('utf-8'))
                except BrokenPipeError:
                    print("Lost connection to", address)
                    break
                data = s.recv(1024).decode('utf-8')
                if "h" in data:
                    print("You are host")
                elif data == "uws":
                    print("Update to server successful")
                elif data == "ps":
                    print("Pause successful")
                elif "q" in data:
                    print("Server issued exit command")
                    break
                else:
                    print(data)
                time.sleep(1)
        except KeyboardInterrupt:
            s.sendall("d".encode('utf-8'))
            time.sleep(0.2)
        s.close()


if __name__ == "__main__":
    create_client()
