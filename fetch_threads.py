#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

START_URL = "https://lavender.5ch.io/test/read.cgi/net/1783485538/"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
THREAD_URL_RE = re.compile(rb"https?://(?:lavender\.)?5ch\.(?:io|net)/test/read\.cgi/net/(\d+)/?", re.I)
TITLE_RE = re.compile(r"VRChat\s*晒しスレ\s*(\d+)", re.I)


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data:
            self.parts.append(data)

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag.lower() in {"br", "p", "div", "li", "dt", "dd", "h1", "h2", "h3"}:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"p", "div", "li", "dt", "dd", "h1", "h2", "h3"}:
            self.parts.append("\n")


def decode_body(body: bytes, content_type: str) -> str:
    candidates: list[str] = []
    m = re.search(r"charset=([\w-]+)", content_type or "", re.I)
    if m:
        candidates.append(m.group(1))
    head = body[:4096].decode("ascii", errors="ignore")
    m = re.search(r"charset=[\"']?([\w-]+)", head, re.I)
    if m:
        candidates.append(m.group(1))
    candidates += ["utf-8", "cp932", "euc-jp"]
    for enc in candidates:
        try:
            return body.decode(enc)
        except (UnicodeDecodeError, LookupError):
            pass
    return body.decode("utf-8", errors="replace")


def fetch(url: str, attempts: int = 5) -> tuple[bytes, str, str]:
    last: Exception | None = None
    for i in range(attempts):
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                "Referer": "https://lavender.5ch.io/net/",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read(), response.headers.get("Content-Type", ""), response.geturl()
        except Exception as exc:
            last = exc
            time.sleep(min(2 ** i, 12))
    raise RuntimeError(f"failed to fetch {url}: {last}")


def extract_text(decoded: str) -> str:
    parser = TextExtractor()
    parser.feed(decoded)
    text = "".join(parser.parts)
    text = html.unescape(text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[\t\u00a0]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def thread_no(text: str) -> int | None:
    m = TITLE_RE.search(text[:10000])
    return int(m.group(1)) if m else None


def previous_url(body: bytes, decoded: str, current_id: str, current_no: int | None) -> str | None:
    for marker in ("前スレ", "前々スレ"):
        pos = decoded.find(marker)
        if pos >= 0:
            snippet = decoded[pos:pos + 12000]
            m = re.search(r"https?://(?:lavender\.)?5ch\.(?:io|net)/test/read\.cgi/net/(\d+)/?", snippet, re.I)
            if m and m.group(1) != current_id:
                return f"https://lavender.5ch.io/test/read.cgi/net/{m.group(1)}/"

    seen: set[bytes] = set()
    for m in THREAD_URL_RE.finditer(body[:120000]):
        tid = m.group(1)
        if tid in seen or tid.decode() == current_id:
            continue
        seen.add(tid)
        return f"https://lavender.5ch.io/test/read.cgi/net/{tid.decode()}/"
    return None


def main() -> int:
    out_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "target/classes/threads")
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, object]] = []
    url = START_URL
    visited: set[str] = set()

    while url and len(manifest) < 80:
        tid_match = re.search(r"/(\d+)/?$", url)
        if not tid_match:
            raise RuntimeError(f"cannot extract thread id from {url}")
        tid = tid_match.group(1)
        if tid in visited:
            raise RuntimeError(f"thread loop detected at {tid}")
        visited.add(tid)

        body, ctype, final_url = fetch(url)
        decoded = decode_body(body, ctype)
        text = extract_text(decoded)
        no = thread_no(text)

        raw_path = out_dir / f"{tid}.html"
        text_path = out_dir / f"{tid}.txt"
        raw_path.write_bytes(body)
        text_path.write_text(text, encoding="utf-8")

        prev = previous_url(body, decoded, tid, no)
        manifest.append({
            "thread_no": no,
            "thread_id": tid,
            "requested_url": url,
            "final_url": final_url,
            "content_type": ctype,
            "bytes": len(body),
            "text_chars": len(text),
            "previous_url": prev,
        })
        print(json.dumps(manifest[-1], ensure_ascii=False), flush=True)

        if no == 1:
            break
        if not prev:
            raise RuntimeError(f"previous thread link not found for thread {no} ({tid})")
        url = prev
        time.sleep(0.7)

    numbers = [x.get("thread_no") for x in manifest if isinstance(x.get("thread_no"), int)]
    expected = set(range(1, 61))
    actual = set(numbers)
    missing = sorted(expected - actual)
    duplicates = sorted({n for n in actual if numbers.count(n) > 1})
    status = {
        "count": len(manifest),
        "thread_numbers": numbers,
        "missing_1_to_60": missing,
        "duplicate_numbers": duplicates,
        "complete_1_to_60": not missing and max(actual, default=0) >= 60,
    }
    (out_dir / "manifest.json").write_text(
        json.dumps({"threads": manifest, "status": status}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(status, ensure_ascii=False), flush=True)
    return 0 if status["complete_1_to_60"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
