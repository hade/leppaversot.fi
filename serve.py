#!/usr/bin/env python3
"""Local preview server with live reload. Standard library only.

    python3 serve.py [port]

Serves the site like `python3 -m http.server` and reloads open pages when a
file changes. CSS changes are swapped in without a reload; any other change
reloads the page and restores the scroll position.
"""

import json
import os
import sys
import threading
import time
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
EVENTS_PATH = "/__livereload"

# Injected before </body> of every HTML page served.
CLIENT = """<script>
(() => {
  const key = "livereload-scroll:" + location.pathname;
  const saved = sessionStorage.getItem(key);
  if (saved !== null) {
    sessionStorage.removeItem(key);
    addEventListener("load", () => scrollTo(0, +saved));
  }
  new EventSource("%s").onmessage = (e) => {
    const changed = JSON.parse(e.data);
    if (changed.every((f) => f.endsWith(".css"))) {
      for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
        const url = new URL(link.href);
        url.searchParams.set("livereload", Date.now());
        link.href = url;
      }
    } else {
      sessionStorage.setItem(key, scrollY);
      location.reload();
    }
  };
})();
</script>
""" % EVENTS_PATH


class Changes:
    """Latest batch of changed files, plus a version number clients wait on."""

    def __init__(self):
        self.cond = threading.Condition()
        self.version = 0
        self.files = []

    def publish(self, files):
        with self.cond:
            self.version += 1
            self.files = files
            self.cond.notify_all()

    def wait(self, version, timeout):
        with self.cond:
            self.cond.wait_for(lambda: self.version != version, timeout)
            return self.version, self.files


changes = Changes()


def ignored(name):
    # Hidden files, and editor backup/swap files (vim also writes a "4913" probe).
    return name.startswith(".") or name.endswith(("~", ".swp", ".swx")) or name == "4913"


def snapshot():
    mtimes = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not ignored(d)]
        for name in filenames:
            if ignored(name):
                continue
            path = os.path.join(dirpath, name)
            try:
                mtimes[path] = os.stat(path).st_mtime_ns
            except FileNotFoundError:
                pass
    return mtimes


def watch():
    before = snapshot()
    while True:
        time.sleep(0.3)
        after = snapshot()
        changed = sorted(
            os.path.relpath(p, ROOT)
            for p in before.keys() | after.keys()
            if before.get(p) != after.get(p)
        )
        before = after
        if changed:
            print("changed:", ", ".join(changed), flush=True)
            changes.publish(changed)


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == EVENTS_PATH:
            return self.stream_events()

        fs_path = self.translate_path(self.path)
        if os.path.isdir(fs_path):
            if not path.endswith("/"):
                return super().do_GET()  # redirects to the trailing-slash URL
            fs_path = os.path.join(fs_path, "index.html")
        if fs_path.endswith(".html") and os.path.isfile(fs_path):
            return self.send_html(fs_path, HTTPStatus.OK)
        if not os.path.exists(fs_path):
            # Like the deployed site: missing pages get 404.html.
            return self.send_html(os.path.join(ROOT, "404.html"), HTTPStatus.NOT_FOUND)
        super().do_GET()

    def send_html(self, fs_path, status):
        try:
            with open(fs_path, encoding="utf-8") as f:
                html = f.read()
        except FileNotFoundError:
            return self.send_error(HTTPStatus.NOT_FOUND)
        i = html.lower().rfind("</body>")
        if i == -1:
            i = len(html)
        body = (html[:i] + CLIENT + html[i:]).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def stream_events(self):
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        version = changes.version
        try:
            while True:
                new_version, files = changes.wait(version, timeout=15)
                if new_version == version:
                    self.wfile.write(b": ping\n\n")  # keepalive; also detects closed tabs
                else:
                    version = new_version
                    self.wfile.write(f"data: {json.dumps(files)}\n\n".encode())
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, format, *args):
        if EVENTS_PATH not in self.path:
            super().log_message(format, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    threading.Thread(target=watch, daemon=True).start()
    server = ThreadingHTTPServer(("", port), partial(Handler, directory=ROOT))
    print(f"Serving at http://localhost:{port}/ with live reload (Ctrl+C to stop)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
