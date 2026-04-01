"""
Fuse DWPA priors (survey + health + device) with observed modality performance and engagement.
"""

from __future__ import annotations

import numpy as np

STRATEGIES = ("video", "audio", "text")


def normalize_dict(weights: dict[str, float]) -> dict[str, float]:
    s = sum(max(v, 0.0) for v in weights.values())
    if s <= 0:
        return {k: 1.0 / len(STRATEGIES) for k in STRATEGIES}
    return {k: max(weights.get(k, 0.0), 0.0) / s for k in STRATEGIES}


def empirical_weights(
    per_modality: dict[str, dict[str, float]],
) -> dict[str, float]:
    """
    per_modality[strategy] = { "quiz": 0-1, "engagement": 0-1, "time_sec": seconds }
    Combine quiz and engagement (time used only as tie-breaker via mild boost).
    """
    out: dict[str, float] = {}
    for s in STRATEGIES:
        block = per_modality.get(s, {})
        q = float(np.clip(block.get("quiz", 0.0), 0.0, 1.0))
        e = float(np.clip(block.get("engagement", 0.0), 0.0, 1.0))
        t = float(max(block.get("time_sec", 0.0), 0.0))
        time_boost = min(0.15, t / (t + 300.0))
        out[s] = max(0.01, 0.55 * q + 0.35 * e + time_boost)
    return normalize_dict(out)


def fuse_dwpa_and_observed(
    dwpa: dict[str, float],
    observed: dict[str, float],
    lambda_blend: float,
) -> dict[str, float]:
    lam = float(np.clip(lambda_blend, 0.0, 1.0))
    fused = {s: lam * dwpa.get(s, 0.0) + (1.0 - lam) * observed.get(s, 0.0) for s in STRATEGIES}
    return normalize_dict(fused)
