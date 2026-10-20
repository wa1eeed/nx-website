#!/usr/bin/env python3
"""Local preview server for the site.

python3 -m http.server sends no Cache-Control at all, so a browser is free to
hold on to an HTML page it fetched earlier. That is how an edited page can keep
showing its old self at a plain URL while every cache-busted URL shows the new
one — which is exactly as confusing as it sounds, and it cost us a round trip.

Production does not have this problem: nginx sends `Cache-Control: no-cache`
for HTML (see nginx.conf). This makes the local server behave the same way.

Usage: python3 docs/devserver.py [port]
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Match nginx: revalidate HTML every load, let the ?v= query bust assets.
        path = self.path.split('?', 1)[0]
        if path.endswith('/') or path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
            self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '" 200' not in fmt % args:      # only surface what is not a plain hit
            super().log_message(fmt, *args)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(('', port), partial(NoCacheHandler)).serve_forever()
