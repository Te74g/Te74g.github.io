import http.server
import socketserver
import urllib.parse
import os

PORT = 3001

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
    }

    def translate_path(self, path):
        # URL デコードを明示的に utf-8 で行う（日本語パス対応）
        path = urllib.parse.unquote(path, encoding='utf-8')
        # クエリ文字列を除去
        path = path.split('?', 1)[0].split('#', 1)[0]
        # パスを正規化
        path = os.path.normpath(path)
        # ルートからの相対パスに変換
        words = path.replace('\\', '/').split('/')
        words = [w for w in words if w and w != '..']
        base = os.getcwd()
        return os.path.join(base, *words)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # suppress logs

class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

with ThreadedServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
