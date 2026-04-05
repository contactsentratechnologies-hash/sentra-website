import http.server
import os
import socketserver

os.chdir("/Users/lohan/Desktop/sentra-website")
PORT = 3000

handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
