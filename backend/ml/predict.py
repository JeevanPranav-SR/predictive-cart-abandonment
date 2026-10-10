"""
Command-line helper that runs one prediction. Used by tests and demos.
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from models import empty_features  # noqa: E402
from prediction import predict_abandonment  # noqa: E402
from tracking import sanitize_features  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Predict cart abandonment from a JSON feature object.")
    parser.add_argument("--features", required=True, help="JSON object of behavioral features")
    args = parser.parse_args()
    raw = json.loads(args.features)
    features = sanitize_features({**empty_features(), **raw})
    print(json.dumps(predict_abandonment(features), indent=2))


if __name__ == "__main__":
    main()
