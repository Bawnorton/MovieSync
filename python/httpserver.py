#!/usr/bin/python3.10
import socketserver
from http.server import SimpleHTTPRequestHandler


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleHTTPRequestHandler.end_headers(self)


def create_http_server():
    handler = CORSRequestHandler

    with socketserver.TCPServer(("", 8000), handler) as httpd:
        print("HTTP Server started at localhost:8000")
        httpd.serve_forever()


if __name__ == '__main__':
    create_http_server()
