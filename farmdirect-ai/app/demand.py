import numpy as np
from typing import Tuple, Dict
from sklearn.linear_model import LinearRegression
from datetime import datetime

from app.config import DEFAULT_HISTORICAL_SALES

SEASON_MAP = {
    1: "winter", 2: "winter", 3: "summer",
    4: "summer", 5: "summer", 6: "kharif",
    7: "kharif", 8: "kharif", 9: "kharif",
    10: "rabi", 11: "rabi", 12: "winter",
}
SEASON_ONEHOT = {"kharif": [1, 0, 0], "rabi": [0, 1, 0], "summer": [0, 0, 1], "winter": [0, 0, 0]}


def _build_feature_row(history7: list) -> np.ndarray:
    today = datetime.now()
    dow = today.weekday()
    dow_oh = [1.0 if i == dow else 0.0 for i in range(7)]
    season = SEASON_MAP[today.month]
    season_oh = SEASON_ONEHOT[season]
    month_oh = [1.0 if m == today.month else 0.0 for m in range(1, 13)]
    return np.array(list(history7) + dow_oh + season_oh + month_oh, dtype=float).reshape(1, -1)


def predict_demand(crop: str) -> Tuple[float, list]:
    history7 = DEFAULT_HISTORICAL_SALES.get(crop, [80, 82, 85, 88, 90, 92, 95])
    X_train_rows = []
    y_train_rows = []
    n = len(history7)
    F = 7 + 7 + 3 + 12  # sales7 + dow7 + season3 + month12 = 29

    for i in range(max(1, n - 3)):
        window = history7[i : i + 4]
        padded_window = list(window) + [window[-1]] * (7 - len(window))
        dow_oh = [0.0] * 7
        dow_oh[i % 7] = 1.0
        season_oh = [0.0] * 3
        month_oh = [0.0] * 12
        month_oh[(i % 12)] = 1.0
        feature = padded_window + dow_oh + season_oh + month_oh
        if len(feature) < F:
            feature = feature + [0.0] * (F - len(feature))
        tgt = history7[min(i + 4, n - 1)] + history7[min(i + 5, n - 1)]
        X_train_rows.append(feature)
        y_train_rows.append(tgt)

    scale_up = 1.0
    while len(X_train_rows) < 4:
        noise_len = len(X_train_rows)
        noise_hist = [max(30.0, h * (1.0 + 0.02 * noise_len * ((-1) ** noise_len))) for h in history7]
        base = [float(h) for h in noise_hist] + [0.0] * (7 + 3 + 12)
        X_train_rows.append(base[:F])
        y_train_rows.append(sum(noise_hist[-2:]) * scale_up)
        scale_up += 0.05

    X = np.array(X_train_rows, dtype=float)
    y = np.array(y_train_rows, dtype=float)

    if X.shape[0] >= 2 and X.shape[1] >= F:
        model = LinearRegression()
        model.fit(X[:, :F], y)
        X_now_raw = _build_feature_row(history7)
        cols = min(X_now_raw.shape[1], F)
        padded_X_now = np.zeros((1, F))
        padded_X_now[0, :cols] = X_now_raw[0, :cols]
        raw_pred = float(model.predict(padded_X_now)[0])
    else:
        raw_pred = float(np.mean(history7) * 7 * 0.95)

    trend = history7
    forecast3day = max(150.0, raw_pred * 1.1)
    return round(forecast3day), trend
