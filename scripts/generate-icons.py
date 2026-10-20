#!/usr/bin/env python3
"""Generate PNG app icons without third-party libraries."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"


def png(width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


def draw_icon(size: int, maskable: bool = False) -> bytes:
    pixels: list[tuple[int, int, int, int]] = []
    ink = (19, 31, 36, 255)
    green = (88, 204, 2, 255)
    gold = (255, 200, 0, 255)
    blue = (28, 176, 246, 255)
    cx = cy = size / 2
    pad = size * 0.18 if maskable else size * 0.08
    radius = (size / 2) - pad
    node_r = max(3, int(size * 0.07))
    for y in range(size):
        for x in range(size):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= radius:
                color = ink
                # Duolingo-like path of three nodes
                nodes = [
                    (cx, cy - radius * 0.46, gold),
                    (cx, cy, blue),
                    (cx, cy + radius * 0.46, green),
                ]
                # connecting bar
                if abs(dx) <= size * 0.045 and abs(dy) <= radius * 0.5:
                    color = (46, 66, 74, 255)
                for nx, ny, node_color in nodes:
                    nd = ((x + 0.5 - nx) ** 2 + (y + 0.5 - ny) ** 2) ** 0.5
                    if nd <= node_r * 1.35:
                        color = node_color
                    elif nd <= node_r * 1.85:
                        color = ink
                pixels.append(color)
            else:
                pixels.append((0, 0, 0, 0) if maskable else ink)
    return png(size, size, pixels)


def write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def main() -> None:
    write(PUBLIC / "apple-touch-icon.png", draw_icon(180))
    write(ICONS / "icon-192.png", draw_icon(192))
    write(ICONS / "icon-512.png", draw_icon(512))
    write(ICONS / "icon-512-maskable.png", draw_icon(512, maskable=True))
    print("icons written")


if __name__ == "__main__":
    main()
