#!/usr/bin/env python3
import http.server, pathlib

ROOT = pathlib.Path(__file__).parent

class HouseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    addr = ('', 8282)
    httpd = http.server.HTTPServer(addr, HouseHandler)
    print('House server running at http://localhost:8282')
    httpd.serve_forever()
