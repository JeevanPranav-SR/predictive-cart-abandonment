# Predictive Cart Abandonment Using Micro-Behavioral Movement and Real-Time Mouse Tracking

College prototype that watches **anonymous shopping interactions**, turns them into numbers, and estimates **how likely a shopper is to leave without buying**.

This is a working local demo, not a production analytics product.

## Problem statement

Online stores lose many carts after a shopper has already shown interest. The interesting question for this project is:

> Based on the user's current micro-behavior while shopping, how likely are they to abandon their cart?

## Objective

Build an understandable end-to-end pipeline:

1. A small e-commerce website
2. Consented mouse / scroll / click / timing tracking
3. Feature extraction in the browser
4. A Random Forest model in Python
5. A live risk indicator and a gentle intervention
6. An admin dashboard that reads **real** SQLite and model files

## How the system works

```
User shops on Northline
        ↓
Optional demo tracking (mouse, scroll, clicks, page time)
        ↓
Browser aggregates features every few seconds
        ↓
POST /api/predict
        ↓
Random Forest → abandonment probability
        ↓
LOW / MEDIUM / HIGH
        ↓
Optional help popup if risk is HIGH
        ↓
Purchase or simulated abandonment stored in SQLite
        ↓
Admin dashboard
```

The model is **predictive**. It does **not** measure a person's thoughts or psychological state. Interaction patterns are only behavioral signals.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Flask REST API
- **Database:** SQLite (`backend/data/cartt.db`)
- **ML:** scikit-learn Random Forest, saved with Joblib

The Vite dev server proxies `/api` to Flask on port `5001` (port `5000` is often taken on macOS).

## Features

- 12-product shop with cart, checkout, and success pages
- Privacy notice before any tracking
- Throttled mouse sampling and aggregated feature upload
- Checkout hover / leave hesitation scoring
- Real-time risk indicator
- High-risk intervention with cooldown
- Synthetic training dataset (clearly labeled as demo data)
- Random Forest training + real accuracy / precision / recall / F1
- Feature importance from the trained model
- Admin overview, live session monitor, session table, model page
- Demo simulator that still calls the real prediction API

## Technology stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, Tailwind, React Router, Recharts |
| Backend | Python, Flask, flask-cors |
| ML | pandas, NumPy, scikit-learn, Joblib |
| Data | SQLite |

## Project structure

```
backend/
  app.py
  config.py
  database.py
  models.py
  tracking.py
  prediction.py
  routes/
  ml/
    generate_dataset.py
    train_model.py
    predict.py
    feature_engineering.py
    model.pkl          (created after training)
    metrics.json       (created after training)
  data/
    sessions.csv       (created by the generator)
    cartt.db           (created when the API starts)
  tests/
frontend/
  src/
    components/
    pages/
    context/
    services/
    utils/
README.md
```

## Installation

Use two terminals. Python 3.10+ and Node 18+ are enough.

### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Dataset generation

The first model is trained on **synthetic demonstration data**, not real customers.

```bash
python ml/generate_dataset.py
```

This writes `data/sessions.csv` with 1,200 simulated sessions.

### Model training

```bash
python ml/train_model.py
```

This writes:

- `ml/model.pkl` — Random Forest
- `ml/metrics.json` — real test-set metrics and feature importance

### Frontend setup

```bash
cd frontend
npm install
```

## Running the project

Terminal 1:

```bash
cd backend
source venv/bin/activate
python app.py
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Backend and model status |
| POST | `/api/session/start` | Create a session |
| POST | `/api/session/events` | Store summarized activity |
| POST | `/api/session/features` | Store a feature snapshot |
| POST | `/api/predict` | Score abandonment risk |
| POST | `/api/session/purchase` | Outcome = 0 |
| POST | `/api/session/abandon` | Outcome = 1 |
| GET | `/api/dashboard/summary` | Overview cards and chart data |
| GET | `/api/dashboard/sessions` | Filterable session history |
| GET | `/api/dashboard/live` | Latest updated session |
| GET | `/api/model/metrics` | Real evaluation metrics |
| GET | `/api/model/features` | Feature list + importance |
| POST | `/api/demo/simulate` | Demo feature vectors → real model |

Risk bands (configurable in `backend/config.py` or env vars):

- 0–39% LOW
- 40–69% MEDIUM
- 70–100% HIGH

## Demo instructions

### Scenario A — normal purchase

1. Open the shop and choose **Allow Demo Tracking**
2. Open a product and click **Add to Cart**
3. Go to checkout and click **Complete Purchase**
4. Open **Admin → Session history** and confirm outcome **Purchased**

### Scenario B — high abandonment risk

1. Allow tracking and add a product
2. Open the cart
3. Hover the green **Checkout** button, move away, repeat
4. Scroll and pause for several seconds
5. Wait for the risk indicator to refresh (about 6 seconds)
6. A help popup may appear when risk is HIGH
7. Click **Simulate Abandonment**
8. Confirm the abandoned row in the admin dashboard

### Scenario C — simulator

Open `/demo` and use **Simulate Low / Medium / High Risk**. Those buttons still call `/api/predict`.

## Machine-learning methodology

1. Generate noisy synthetic sessions with a hidden abandon tendency
2. Split 80/20, stratified
3. Train Random Forest (main model)
4. Compare Logistic Regression and Decision Tree
5. Evaluate accuracy, precision, recall, F1, and confusion matrix
6. Save the forest and the real metrics

Synthetic data can look **too accurate**. The dashboard shows a disclaimer for that reason. Retrain with ethically collected, consented sessions before any real deployment.

## Privacy considerations

- Tracking starts only after **Allow Demo Tracking**
- The shop still works if the visitor chooses **Continue Without Tracking**
- No passwords, payment data, names, or typed secrets are stored
- Checkout form fields never leave the browser
- Mouse coordinates are aggregated locally; the API receives summaries

## Testing

```bash
cd backend
source venv/bin/activate
python -m pytest tests/test_app.py -q
```

Manual checks:

1. Website loads
2. Add to cart
3. Tracking updates mouse / scroll / click counts
4. `/api/predict` returns a probability
5. Risk indicator changes
6. Intervention appears on HIGH (with cooldown)
7. Purchase and abandonment rows appear in Admin

## Known limitations

- The first model is trained on synthetic data
- Hovering a checkout button is only a **project signal**, not proof of intent
- A single local session is a tiny sample; live metrics start sparse
- There is no user-account system and no real payment processor
- Feature importance can change every time the model is retrained

## Suggested future improvements

- Collect a consented classroom dataset and retrain
- Calibrate probabilities and add confidence intervals
- A/B test interventions instead of a single popup
- Sequence models over time windows, not only session totals
- Stronger bot / spoofing checks on uploaded features

## Important files

- `frontend/src/context/TrackingContext.jsx` — real-time tracking
- `backend/tracking.py` — server-side feature checks
- `backend/ml/generate_dataset.py` — synthetic data
- `backend/ml/train_model.py` — model training
- `backend/prediction.py` — inference and risk labels
- `backend/database.py` — SQLite access
