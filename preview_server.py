from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class PreviewHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mjs": "application/javascript",
        ".js": "application/javascript",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        if path.endswith((".mjs", ".js")):
            return "application/javascript"
        return super().guess_type(path)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.path = "/work/preview.html"
        super().do_GET()


ThreadingHTTPServer(("127.0.0.1", 3000), PreviewHandler).serve_forever()
