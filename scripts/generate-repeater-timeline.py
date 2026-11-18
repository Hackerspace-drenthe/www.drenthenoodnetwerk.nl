#!/usr/bin/env python3
"""Reconstrueer per repeater de periode waarin deze in de mc-radar data
voorkwam, op basis van de git-historie van data/mc-radar/repeaters.json.

Het historische totaal telt unieke sleutels uit alle snapshots, op basis
van de coördinaten uit die snapshot en de gegeneraliseerde CBS-grens 2025
(via Cartomap). De grafiek en animatie gebruiken de laatste snapshot per
dag. Registraties zijn geen bevestigde installaties.

Output: data/repeater-timeline.json, met onder meer drenthe_boundary
(paren [breedtegraad, lengtegraad]), drenthe_counts (datum → aantal),
drenthe_ever_count (historisch totaal) en snapshot_count (alle snapshots).

Gebruik: python3 scripts/generate-repeater-timeline.py
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA_FILE = "data/mc-radar/repeaters.json"
OUT_FILE = REPO / "data" / "repeater-timeline.json"
BOUNDARY_FILE = REPO / "data" / "drenthe-boundary.json"


def git(*args):
    return subprocess.run(
        ["git", *args], cwd=REPO, capture_output=True, text=True, check=True
    ).stdout


def in_boundary(lat, lon, boundary):
    inside = False
    for (yi, xi), (yj, xj) in zip(boundary, boundary[1:]):
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
    return inside


def main():
    # Alle commits die repeaters.json raakten, oudste eerst, één per dag (laatste van de dag)
    log = git("log", "--format=%H %ad", "--date=short", "--reverse", "--", DATA_FILE)
    snapshots = [line.split() for line in log.splitlines()]
    if not snapshots:
        sys.exit("Geen git-historie gevonden voor " + DATA_FILE)
    per_day = {day: commit for commit, day in snapshots}

    boundary = json.loads(BOUNDARY_FILE.read_text())
    if not boundary or boundary[0] != boundary[-1]:
        sys.exit("Ongeldige provinciegrens: de grens moet een gesloten ring zijn")

    @lru_cache(maxsize=16384)
    def in_drenthe(lat, lon):
        return in_boundary(lat, lon, boundary)

    drenthe_counts = {}
    drenthe_ever = set()
    first_seen = {}   # public_key -> eerste waarneming
    last_active = {}  # public_key -> laatste waarneming
    latest_info = {}  # public_key -> (name, lat, lon)

    for commit, day in snapshots:
        try:
            raw = git("show", f"{commit}:{DATA_FILE}")
            nodes = json.loads(raw)
        except (subprocess.CalledProcessError, json.JSONDecodeError) as err:
            sys.exit(f"Kan snapshot {commit} ({day}) niet lezen: {err}")
        is_daily = per_day[day] == commit
        observed_in_drenthe = set()
        for n in nodes:
            key = n.get("public_key")
            loc = n.get("location")
            if not key or not loc:
                continue
            lat, lon = loc["latitude"], loc["longitude"]
            if in_drenthe(lat, lon):
                observed_in_drenthe.add(key)
            if is_daily:
                first_seen[key] = min(first_seen.get(key, day), day)
                if key not in last_active or day >= last_active[key]:
                    last_active[key] = day
                    latest_info[key] = (n.get("name", "?"), lat, lon)
        drenthe_ever.update(observed_in_drenthe)
        if is_daily:
            drenthe_counts[day] = len(observed_in_drenthe)

    start_day, end_day = min(drenthe_counts), max(drenthe_counts)
    repeaters = [
        {
            "name": latest_info[k][0],
            "lat": round(latest_info[k][1], 6),
            "lon": round(latest_info[k][2], 6),
            "first_seen": day,
            "last_active": last_active[k],
            "gone": last_active[k] != end_day,
        }
        for k, day in sorted(first_seen.items(), key=lambda kv: kv[1])
    ]

    out = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "start": start_day,
        "end": end_day,
        "drenthe_boundary": boundary,
        "drenthe_counts": drenthe_counts,
        "drenthe_ever_count": len(drenthe_ever),
        "snapshot_count": len(snapshots),
        "repeaters": repeaters,
    }
    OUT_FILE.write_text(json.dumps(out, separators=(",", ":")))
    gone = sum(1 for r in repeaters if r["gone"])
    print(f"{len(repeaters)} unieke radarregistraties, {gone} ontbreken in de laatste snapshot")
    print(f"{start_day} → {end_day} ({len(snapshots)} snapshots, {len(drenthe_counts)} meetdagen)")
    print(f"{len(drenthe_ever)} unieke radarregistraties ooit binnen Drenthe")
    print(f"Geschreven: {OUT_FILE.relative_to(REPO)}")


if __name__ == "__main__":
    main()
