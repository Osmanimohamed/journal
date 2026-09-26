#!/usr/bin/env python3
import http.server
import socket
import socketserver
import os
import sys
import webbrowser

PORT = 8000

class JournalHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.webmanifest': 'application/manifest+json',
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
    }

    def end_headers(self):
        # Allow cross-origin and disable caching during dev
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def run():
    # Fix Windows console encoding
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    local_ip = get_local_ip()

    print("=" * 60)
    print("   [+] APPLICATION JOURNAL MEMOIRE DEMARREE !")
    print("=" * 60)
    print(f"\n>> Sur votre PC :")
    print(f"   http://localhost:{PORT}")
    print(f"\n>> Sur votre telephone Android (connecte au meme Wi-Fi) :")
    print(f"   http://{local_ip}:{PORT}")
    print("\nAstuce : Ouvrez cette adresse dans Google Chrome sur Android,")
    print("puis cliquez sur 'Installer l'application' ou 'Ajouter a l'ecran d'accueil'.")
    print("=" * 60)
    print("Appuyez sur Ctrl+C pour arreter le serveur.\n")

    # Ouvrir le navigateur par defaut sur le PC
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    with socketserver.TCPServer(("", PORT), JournalHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServeur arrêté avec succès.")

if __name__ == '__main__':
    run()
