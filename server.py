#!/usr/bin/env python3
import http.server, json, os, pathlib

ROOT = pathlib.Path(__file__).parent
DATA_DIR = ROOT / 'data'

class HouseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    DATA_DIR.mkdir(exist_ok=True)
    addr = ('', 8282)
    httpd = http.server.HTTPServer(addr, HouseHandler)
    print(f'House server running at http://localhost:8282')
    httpd.serve_forever()
