"""A deliberately small Windows pointer companion for an armed local JARVIS session."""
import ctypes
import json
import os
import sys

user32 = ctypes.windll.user32
dry_run = os.environ.get("JARVIS_DESKTOP_DRY_RUN") == "1"
print('{"ready":true}', flush=True)

def desktop_bounds():
    # Cover the Windows virtual desktop, including monitors positioned left or above the primary one.
    left, top = user32.GetSystemMetrics(76), user32.GetSystemMetrics(77)
    width, height = user32.GetSystemMetrics(78), user32.GetSystemMetrics(79)
    return left, top, max(1, width), max(1, height)

def act(item):
    action = item.get("action")
    if action == "move":
        x, y = item.get("x"), item.get("y")
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            return
        if not dry_run:
            left, top, width, height = desktop_bounds()
            user32.SetCursorPos(left + round(max(0, min(1, x)) * (width - 1)), top + round(max(0, min(1, y)) * (height - 1)))
    elif action == "click" and not dry_run:
        user32.mouse_event(0x0002, 0, 0, 0, 0)
        user32.mouse_event(0x0004, 0, 0, 0, 0)
    elif action == "scroll":
        delta = item.get("delta")
        if isinstance(delta, int) and not dry_run:
            user32.mouse_event(0x0800, 0, 0, max(-1200, min(1200, delta)), 0)

for line in sys.stdin:
    try:
        act(json.loads(line))
    except (ValueError, TypeError):
        pass
