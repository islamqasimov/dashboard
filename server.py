#!/usr/bin/env python3

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import mimetypes
from urllib.parse import urlparse

# Ensure .js files are served with the correct MIME type
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

CERT_FOLDER = 'public/Certificates' 
VIDEO_FOLDER = 'public/Videos'
# We'll use 'public' as the root for content to keep things clean, 
# or just serve from root if preferred. 
# Plan said "Certificates/" and "Videos/" at root. Let's stick to root folders for simplicity 
# unless we moved them. The mv command didn't move Certificates.
CERT_FOLDER = 'Certificates'
VIDEO_FOLDER = 'Videos'

ALLOWED_EXTENSIONS_IMG = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
ALLOWED_EXTENSIONS_PDF = {'.pdf'}
ALLOWED_EXTENSIONS_VIDEO = {'.mp4', '.webm', '.ogg', '.mov'}

class DashboardHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        
        # Caching Strategy
        # API endpoints: No caching (always fresh data)
        # Static files: Cache for 1 hour (3600 seconds)
        if self.path.startswith('/api'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        else:
            self.send_header('Cache-Control', 'max-age=3600')
            
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # API: Certificates
        if parsed_path.path.rstrip('/') == '/api/certificates':
            self.handle_api_list(CERT_FOLDER, ALLOWED_EXTENSIONS_IMG | ALLOWED_EXTENSIONS_PDF)
            return
            
        # API: Videos (and Photos)
        elif parsed_path.path.rstrip('/') == '/api/videos':
            # Combine video and image extensions for this module
            self.handle_api_list(VIDEO_FOLDER, ALLOWED_EXTENSIONS_VIDEO | ALLOWED_EXTENSIONS_IMG)
            return

        # Serve index.html for root
        elif parsed_path.path == '/' or parsed_path.path == '/index.html':
            self.path = '/index.html'
            
        super().do_GET()

    def handle_api_list(self, folder, allowed_exts):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        try:
            if not os.path.exists(folder):
                os.makedirs(folder, exist_ok=True)
                
            files = []
            for item in os.listdir(folder):
                filepath = os.path.join(folder, item)
                if os.path.isfile(filepath):
                    _, ext = os.path.splitext(item)
                    if ext.lower() in allowed_exts:
                        files.append(item)
            
            files.sort()
            self.wfile.write(json.dumps(files).encode())
        except Exception as e:
            self.wfile.write(json.dumps({'error': str(e)}).encode())

def run_server(port=8000):
    # Ensure folders exist
    os.makedirs(CERT_FOLDER, exist_ok=True)
    os.makedirs(VIDEO_FOLDER, exist_ok=True)
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, DashboardHandler)
    
    print("="*60)
    print("🚀 Dashboard Server Running (Python/React-NoBuild)")
    print(f"   http://localhost:{port}")
    print(f"   API: /api/certificates")
    print(f"   API: /api/videos")
    print("="*60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")

if __name__ == '__main__':
    run_server(port=8000)
