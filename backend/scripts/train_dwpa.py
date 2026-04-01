"""
Optional: fit theta from CSV with header:
  H,V,F,D,strategy
strategy ∈ video,audio,text
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.dwp_engine import (  # noqa: E402
    FEATURE_DIM,
    STRATEGIES,
    gradient_descent_train,
    save_theta,
)


def main():
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("csv", type=Path)
    p.add_argument("-o", "--out", type=Path, default=ROOT / "app" / "services" / "default_theta.json")
    args = p.parse_args()
    strat_to_idx = {s: i for i, s in enumerate(STRATEGIES)}
    rows: list[tuple[list[float], int]] = []
    with open(args.csv, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            strat = row["strategy"].strip().lower()
            rows.append(
                (
                    [
                        1.0,
                        float(row["H"]),
                        float(row["V"]),
                        float(row["F"]),
                        float(row["D"]),
                    ],
                    strat_to_idx[strat],
                )
            )
    n = len(rows)
    X = np.array([x for x, _ in rows], dtype=np.float64)
    y_onehot = np.zeros((n, 3))
    for i, (_, idx) in enumerate(rows):
        y_onehot[i, idx] = 1.0
    theta = gradient_descent_train(X, y_onehot)
    assert theta.shape == (3, FEATURE_DIM)
    save_theta(theta, args.out)
    print("Saved", args.out)


if __name__ == "__main__":
    main()
