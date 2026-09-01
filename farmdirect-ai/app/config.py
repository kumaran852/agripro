from typing import Dict

BASELINE_PRICES_PER_KG: Dict[str, int] = {
    "tomato": 22,
    "potato": 28,
    "onion": 26,
    "brinjal": 30,
    "ladiesfinger": 35,
}

CROP_EMOJI: Dict[str, str] = {
    "tomato": "🍅",
    "potato": "🥔",
    "onion": "🧅",
    "brinjal": "🍆",
    "ladiesfinger": "🫛",
}

DEFAULT_HISTORICAL_SALES: Dict[str, list] = {
    "tomato": [95, 110, 102, 120, 115, 128, 150],
    "potato": [70, 78, 72, 80, 77, 82, 85],
    "onion": [88, 92, 90, 98, 95, 102, 110],
    "brinjal": [50, 55, 52, 58, 56, 60, 62],
    "ladiesfinger": [40, 44, 42, 46, 48, 50, 52],
}

AVERAGE_ROAD_SPEED_KMH = 30.0
