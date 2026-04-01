"""
DWPA — Dynamic Weighted Probability Allocation

The thesis defines a linear hypothesis in H, V, F, D per strategy α ∈ {video, audio, text},
then maps to probabilities. For three mutually exclusive strategies, multinomial logistic
regression (softmax over logits) is the standard multi-class extension of the sigmoid
used in binary logistic regression; each logit z_α = θ_α^T x with x = [1, H, V, F, D].

P(α) = exp(z_α) / Σ_β exp(z_β)

Default θ can be replaced after training on survey data (e.g. your n=388 sample).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np

STRATEGIES = ("video", "audio", "text")
FEATURE_DIM = 5  # bias + H, V, F, D


def _default_theta() -> np.ndarray:
    """
    Shape (3, 5): rows [video, audio, text].
    Hand-tuned priors: higher vision issues favor audio; higher hearing favors text/video;
    low device score slightly favors text; focus issues slightly favor shorter video chunks
    (represented as mild video penalty when F high — adjusted via V/H).
    Replace with trained weights from your gradient-descent / survey fit.
    """
    return np.array(
        [
            [0.35, -0.4, 0.25, -0.2, 0.5],  # video
            [0.2, 0.55, -0.15, -0.1, 0.15],  # audio
            [0.1, -0.2, -0.15, 0.35, -0.25],  # text
        ],
        dtype=np.float64,
    )


def load_theta(path: Path | None = None) -> np.ndarray:
    if path is None:
        here = Path(__file__).resolve().parent
        path = here / "default_theta.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            data: Any = json.load(f)
        arr = np.array(data["theta"], dtype=np.float64)
        if arr.shape != (3, FEATURE_DIM):
            raise ValueError(f"theta must be (3, {FEATURE_DIM}), got {arr.shape}")
        return arr
    return _default_theta()


def feature_vector(
    *,
    hearing: float,
    vision: float,
    focus: float,
    device: float,
) -> np.ndarray:
    """x = [1, H, V, F, D] with all in [0,1]."""
    h = float(np.clip(hearing, 0.0, 1.0))
    v = float(np.clip(vision, 0.0, 1.0))
    f = float(np.clip(focus, 0.0, 1.0))
    d = float(np.clip(device, 0.0, 1.0))
    return np.array([1.0, h, v, f, d], dtype=np.float64)


def softmax(logits: np.ndarray) -> np.ndarray:
    z = logits - np.max(logits)
    e = np.exp(z)
    return e / np.sum(e)


def predict_strategy_probs(
    theta: np.ndarray,
    *,
    hearing: float,
    vision: float,
    focus: float,
    device: float,
) -> dict[str, float]:
    x = feature_vector(hearing=hearing, vision=vision, focus=focus, device=device)
    logits = theta @ x
    p = softmax(logits)
    return {s: float(p[i]) for i, s in enumerate(STRATEGIES)}


def cross_entropy_loss(theta: np.ndarray, X: np.ndarray, y_onehot: np.ndarray) -> float:
    """X: (n, 5), y_onehot: (n, 3)."""
    logits = X @ theta.T
    logits = logits - logits.max(axis=1, keepdims=True)
    exp = np.exp(logits)
    prob = exp / exp.sum(axis=1, keepdims=True)
    n = X.shape[0]
    return float(-np.sum(y_onehot * np.log(prob + 1e-12)) / n)


def gradient_descent_train(
    X: np.ndarray,
    y_onehot: np.ndarray,
    *,
    lr: float = 0.15,
    iterations: int = 4000,
    l2: float = 1e-3,
) -> np.ndarray:
    """
    Full-batch gradient descent on multinomial logistic loss + L2 on weights (no L2 on bias).
    """
    n, d = X.shape
    k = y_onehot.shape[1]
    theta = np.zeros((k, d), dtype=np.float64)
    for _ in range(iterations):
        logits = X @ theta.T
        logits = logits - logits.max(axis=1, keepdims=True)
        exp = np.exp(logits)
        prob = exp / exp.sum(axis=1, keepdims=True)
        grad = (prob - y_onehot).T @ X / n
        reg = l2 * theta
        reg[:, 0] = 0.0
        theta -= lr * (grad + reg)
    return theta


def save_theta(theta: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"theta": theta.tolist()}, f, indent=2)
