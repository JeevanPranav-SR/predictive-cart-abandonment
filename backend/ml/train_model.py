"""
Train the cart-abandonment classifier.

Main model: Random Forest
Also compared: Logistic Regression and Decision Tree

Metrics are written to metrics.json so the admin dashboard can display the
real evaluation numbers instead of placeholders.
"""

import json
import os
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

sys.path.append(str(Path(__file__).resolve().parents[1]))

from config import DATASET_PATH, METRICS_PATH, MODEL_PATH  # noqa: E402
from models import FEATURE_COLUMNS  # noqa: E402
from ml.feature_engineering import feature_matrix  # noqa: E402


def evaluate(name, estimator, x_test, y_test):
    pred = estimator.predict(x_test)
    return {
        "name": name,
        "accuracy": round(float(accuracy_score(y_test, pred)), 4),
        "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, pred, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, pred).tolist(),
    }


def main():
    if not os.path.exists(DATASET_PATH):
        raise SystemExit("Dataset missing. Run: python ml/generate_dataset.py")

    frame = pd.read_csv(DATASET_PATH)
    x = feature_matrix(frame)
    y = frame["abandoned"]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )

    forest = RandomForestClassifier(
        n_estimators=180,
        max_depth=10,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )
    forest.fit(x_train, y_train)

    logreg = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=400, random_state=42)),
        ]
    )
    logreg.fit(x_train, y_train)

    tree = DecisionTreeClassifier(max_depth=7, min_samples_leaf=6, random_state=42)
    tree.fit(x_train, y_train)

    forest_metrics = evaluate("RandomForest", forest, x_test, y_test)
    comparisons = [
        forest_metrics,
        evaluate("LogisticRegression", logreg, x_test, y_test),
        evaluate("DecisionTree", tree, x_test, y_test),
    ]

    importances = [
        {"feature": name, "importance": round(float(value), 4)}
        for name, value in zip(FEATURE_COLUMNS, forest.feature_importances_)
    ]
    importances.sort(key=lambda item: item["importance"], reverse=True)

    joblib.dump(forest, MODEL_PATH)

    payload = {
        "model_type": "RandomForestClassifier",
        "training_samples": int(len(x_train)),
        "test_samples": int(len(x_test)),
        "features": FEATURE_COLUMNS,
        "metrics": forest_metrics,
        "comparisons": comparisons,
        "feature_importance": importances,
        "data_source": "synthetic demonstration dataset",
        "disclaimer": (
            "These scores come from a held-out split of synthetic data. "
            "Synthetic data can overstate real-world performance. Retrain with "
            "ethically collected sessions before any production use."
        ),
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")
    print(
        "Random Forest  acc={accuracy}  prec={precision}  rec={recall}  f1={f1}".format(
            **forest_metrics
        )
    )


if __name__ == "__main__":
    main()
