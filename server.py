import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Handle clean URLs /login -> /login.html
        path_clean = self.path.split('?')[0].rstrip('/')
        if path_clean == '/login':
            query = ('?' + self.path.split('?')[1]) if '?' in self.path else ''
            self.send_response(302)
            self.send_header('Location', '/login.html' + query)
            self.end_headers()
            return
        super().do_GET()

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

