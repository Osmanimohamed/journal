import http.server
import socketserver
import threading
import urllib.request
import json
import os
import sys

os.chdir(r"c:\Users\DELL\Desktop\journal")

PORT = 8899

class TestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.webmanifest': 'application/manifest+json',
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
    }

httpd = socketserver.TCPServer(("127.0.0.1", PORT), TestHandler)
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()

endpoints = [
    '/',
    '/index.html',
    '/styles.css',
    '/db.js',
    '/speech.js',
    '/app.js',
    '/manifest.json',
    '/sw.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
]

print("Testing web server and assets:")
success = True
for ep in endpoints:
    url = f"http://127.0.0.1:{PORT}{ep}"
    try:
        req = urllib.request.urlopen(url, timeout=3)
        status = req.status
        content_type = req.headers.get('Content-Type')
        content_len = len(req.read())
        print(f"  [OK] {ep:20} -> Status: {status}, Size: {content_len:6} bytes, Type: {content_type}")
    except Exception as e:
        print(f"  [FAIL] {ep:20} -> Error: {e}")
        success = False

# Verify manifest JSON
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)
    assert manifest['name'] == 'Journal Mémoire - Carnet Personnel'
    assert len(manifest['icons']) == 2
    print("  [OK] manifest.json validation passed")

httpd.shutdown()
if success:
    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
else:
    sys.exit(1)
