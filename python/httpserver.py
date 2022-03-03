#!/usr/bin/python3.10
import socketserver
import time
from http.server import SimpleHTTPRequestHandler
from io import BytesIO


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Expose-Headers", "Access-Control-Allow-Origin")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header('Access-Control-Allow-Methods', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_POST(self):
        content_range = self.headers['Content-Range']
        unit_index = content_range.find(" ")
        difference_index = content_range.find("-")
        start_byte = content_range[unit_index + 1:difference_index]
        end_byte = content_range[difference_index + 1:content_range.find("/")]
        content_length = int(end_byte) - int(start_byte)
        body = self.rfile.read(content_length)
        self.send_response(200)
        self.end_headers()
        response = BytesIO()
        response.write(b'This is POST request. ')
        response.write(f"Headers: {self.headers} ".encode())
        response.write(b'Received: ')
        response.write(body)
        self.wfile.write(response.getvalue())


def create_http_server():
    handler = CORSRequestHandler

    while True:
        try:
            with socketserver.TCPServer(("", 8000), handler) as httpd:
                print("HTTP Server started at localhost:8000")
                httpd.serve_forever()
        except OSError:
            time.sleep(1)


if __name__ == '__main__':
    create_http_server()
