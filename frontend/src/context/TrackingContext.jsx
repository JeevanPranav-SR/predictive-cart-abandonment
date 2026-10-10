import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api.js";
import { useCart } from "./CartContext.jsx";
import {
  angleChange,
  cartStatusLabel,
  distance,
  emptyFeatures,
  localHesitationScore,
  pageBucket,
} from "../utils/features.js";

const CONSENT_KEY = "cartt_tracking_consent";
const SESSION_KEY = "cartt_session_id";
const TrackingContext = createContext(null);

const MOUSE_SAMPLE_MS = 80;
const IDLE_GAP_MS = 1500;
const PREDICT_EVERY_MS = 6000;
const CHECKOUT_PREDICT_MS = 3000;
const DIRECTION_TURN_DEG = 50;

function readConsent() {
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "granted" || value === "denied") return value;
  return null;
}

function getOrCreateLocalSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = `DEMO-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

export function TrackingProvider({ children }) {
  const location = useLocation();
  const cart = useCart();
  const [consent, setConsent] = useState(readConsent);
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const startPromiseRef = useRef(null);
  const [features, setFeatures] = useState(emptyFeatures);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const [backendOk, setBackendOk] = useState(true);
  const [interventionOpen, setInterventionOpen] = useState(false);

  const startedAtRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  const lastSampleRef = useRef(0);
  const lastPointRef = useRef(null);
  const prevVectorPointRef = useRef(null);
  const idleMsRef = useRef(0);
  const pageTimesRef = useRef({ product: 0, cart: 0, checkout: 0 });
  const pageEnteredRef = useRef(Date.now());
  const currentPageRef = useRef(pageBucket(location.pathname));
  const addToCartAtRef = useRef(null);
  const firstCheckoutAtRef = useRef(null);
  const lastCartCountRef = useRef(cart.count);

  const statsRef = useRef({
    mouse_move_count: 0,
    mouse_distance: 0,
    speed_sum: 0,
    speed_samples: 0,
    maximum_mouse_speed: 0,
    direction_changes: 0,
    scroll_count: 0,
    scroll_distance: 0,
    click_count: 0,
    checkout_hover_count: 0,
    checkout_leave_count: 0,
    checkout_click_count: 0,
    checkout_approach_count: 0,
    lastCheckoutDistance: null,
    approaching: false,
    lastScrollBurst: [],
    price_hover_count: 0,
    priceBound: new WeakSet(),
  });

  const lastPredictRef = useRef(0);
  const lastInterventionRef = useRef(0);
  const interventionCountRef = useRef(0);
  const checkoutBoundRef = useRef(null);

  function buildFeatures() {
    const now = Date.now();
    const page = currentPageRef.current;
    const extraPageMs = now - pageEnteredRef.current;
    const cartTime = (pageTimesRef.current.cart + (page === "cart" ? extraPageMs : 0)) / 1000;
    const checkoutTime = (pageTimesRef.current.checkout + (page === "checkout" ? extraPageMs : 0)) / 1000;
    const idleSeconds = idleMsRef.current / 1000;
    const stats = statsRef.current;
    const avgSpeed = stats.speed_samples ? stats.speed_sum / stats.speed_samples : 0;

    const snapshot = {
      session_duration: (now - startedAtRef.current) / 1000,
      mouse_move_count: stats.mouse_move_count,
      mouse_distance: stats.mouse_distance,
      average_mouse_speed: avgSpeed,
      maximum_mouse_speed: stats.maximum_mouse_speed,
      direction_changes: stats.direction_changes,
      scroll_count: stats.scroll_count,
      scroll_distance: stats.scroll_distance,
      click_count: stats.click_count,
      cart_time: cartTime,
      checkout_time: checkoutTime,
      checkout_hover_count: stats.checkout_hover_count,
      checkout_leave_count: stats.checkout_leave_count,
      checkout_click_count: stats.checkout_click_count,
      idle_time: idleSeconds,
      checkout_hesitation_score: 0,
    };
    snapshot.checkout_hesitation_score = localHesitationScore(snapshot);
    return snapshot;
  }

  async function ensureSession(nextConsent = consent) {
    const localId = sessionId || getOrCreateLocalSessionId();
    if (localId !== sessionId) setSessionId(localId);
    if (startPromiseRef.current) return startPromiseRef.current;

    startPromiseRef.current = (async () => {
      try {
        const result = await api.startSession({
          session_id: localId,
          tracking_enabled: nextConsent === "granted",
          page: pageBucket(location.pathname),
          cart_status: cartStatusLabel(cart.count),
        });
        const id = result.session.session_id;
        sessionStorage.setItem(SESSION_KEY, id);
        setSessionId(id);
        setBackendOk(true);
        return id;
      } catch {
        startPromiseRef.current = null;
        setBackendOk(false);
        return null;
      }
    })();

    return startPromiseRef.current;
  }

  async function pushPrediction(force = false) {
    if (consent !== "granted") return;
    if (!force && cart.count === 0) return;
    const now = Date.now();
    const onDecisionPage = ["cart", "checkout"].includes(currentPageRef.current);
    const wait = onDecisionPage ? CHECKOUT_PREDICT_MS : PREDICT_EVERY_MS;
    if (!force && now - lastPredictRef.current < wait) return;
    lastPredictRef.current = now;

    const snapshot = buildFeatures();
    setFeatures(snapshot);
    const id = await ensureSession();
    if (!id) {
      setPredictionError("Prediction temporarily unavailable");
      return;
    }

    try {
      await api.sendEvents({
        session_id: id,
        page: currentPageRef.current,
        cart_status: cartStatusLabel(cart.count),
        mouse_samples: snapshot.mouse_move_count,
        scroll_events: snapshot.scroll_count,
        click_events: snapshot.click_count,
      });
      const result = await api.predict({
        session_id: id,
        page: currentPageRef.current,
        cart_status: cartStatusLabel(cart.count),
        features: snapshot,
      });
      setPrediction({
        probability: result.abandonment_probability,
        riskLevel: result.risk_level,
      });
      setPredictionError("");
      setBackendOk(true);

      const snapshotNow = snapshot;
      const onCartOrCheckout = ["cart", "checkout"].includes(currentPageRef.current);
      const hoveredThenLeft =
        snapshotNow.checkout_hover_count >= 2 && snapshotNow.checkout_leave_count >= 2;
      const noPurchaseClick = snapshotNow.checkout_click_count === 0;
      const highRisk = result.risk_level === "HIGH";
      const hesitationRescue =
        onCartOrCheckout &&
        noPurchaseClick &&
        hoveredThenLeft &&
        (highRisk || snapshotNow.checkout_hesitation_score >= 0.5 || result.risk_level === "MEDIUM");

      const canShow =
        cart.count > 0 &&
        (highRisk || hesitationRescue) &&
        interventionCountRef.current < 2 &&
        now - lastInterventionRef.current > 90_000 &&
        !["/success", "/admin", "/demo"].some((path) => location.pathname.startsWith(path));

      if (canShow) {
        cart.closeOffers?.();
        setInterventionOpen(true);
        lastInterventionRef.current = now;
        interventionCountRef.current += 1;
      }
    } catch (error) {
      if (error.status === 503 || error.status >= 500) {
        setPredictionError("Prediction temporarily unavailable");
      } else {
        setPredictionError("Prediction temporarily unavailable");
      }
      setBackendOk(false);
    }
  }

  function grantConsent() {
    localStorage.setItem(CONSENT_KEY, "granted");
    setConsent("granted");
    ensureSession("granted");
  }

  function denyConsent() {
    localStorage.setItem(CONSENT_KEY, "denied");
    setConsent("denied");
    ensureSession("denied");
  }

  function beginFreshSession() {
    sessionStorage.removeItem(SESSION_KEY);
    startPromiseRef.current = null;
    setSessionId(null);
    startedAtRef.current = Date.now();
  }

  async function completePurchase() {
    const id = await ensureSession();
    if (id) {
      try {
        await api.purchase(id);
      } catch {
        // Purchase UI still proceeds even if logging fails.
      }
    }
    beginFreshSession();
  }

  async function simulateAbandonment() {
    const snapshot = buildFeatures();
    setFeatures(snapshot);
    const id = await ensureSession();
    if (id) {
      try {
        if (consent === "granted") {
          await api.predict({ session_id: id, features: snapshot });
        }
        await api.abandon(id);
      } catch {
        setPredictionError("Could not store the simulated abandonment.");
      }
    }
    beginFreshSession();
    return snapshot;
  }

  useEffect(() => {
    const nextPage = pageBucket(location.pathname);
    const now = Date.now();
    const previous = currentPageRef.current;
    const elapsed = now - pageEnteredRef.current;
    if (previous === "product" || previous === "cart" || previous === "checkout") {
      pageTimesRef.current[previous] += elapsed;
    }
    if (nextPage === "checkout" && !firstCheckoutAtRef.current) {
      firstCheckoutAtRef.current = now;
    }
    currentPageRef.current = nextPage;
    pageEnteredRef.current = now;
  }, [location.pathname]);

  useEffect(() => {
    if (cart.count > lastCartCountRef.current && !addToCartAtRef.current) {
      addToCartAtRef.current = Date.now();
    }
    lastCartCountRef.current = cart.count;
  }, [cart.count]);

  useEffect(() => {
    if (consent !== "granted") return undefined;

    function onMouseMove(event) {
      const now = Date.now();
      if (now - lastActivityRef.current > IDLE_GAP_MS) {
        idleMsRef.current += now - lastActivityRef.current;
      }
      lastActivityRef.current = now;
      if (now - lastSampleRef.current < MOUSE_SAMPLE_MS) return;
      lastSampleRef.current = now;

      const point = { x: event.clientX, y: event.clientY, t: now };
      const stats = statsRef.current;
      const previous = lastPointRef.current;
      if (previous) {
        const dist = distance(previous, point);
        const dt = Math.max((point.t - previous.t) / 1000, 0.001);
        const speed = dist / dt;
        stats.mouse_move_count += 1;
        stats.mouse_distance += dist;
        stats.speed_sum += speed;
        stats.speed_samples += 1;
        stats.maximum_mouse_speed = Math.max(stats.maximum_mouse_speed, speed);
        if (prevVectorPointRef.current) {
          const turn = angleChange(prevVectorPointRef.current, previous, point);
          if (turn >= DIRECTION_TURN_DEG) stats.direction_changes += 1;
        }
        prevVectorPointRef.current = previous;
      }
      lastPointRef.current = point;

      const button = document.getElementById("checkout-button");
      if (button) {
        const rect = button.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const distToButton = distance(point, center);
        if (stats.lastCheckoutDistance != null) {
          const movingCloser = distToButton < stats.lastCheckoutDistance - 6;
          const movingAway = distToButton > stats.lastCheckoutDistance + 6;
          if (movingCloser && distToButton < 280 && !stats.approaching) {
            stats.approaching = true;
            stats.checkout_approach_count += 1;
            if (distToButton < 90) stats.checkout_hover_count += 1;
          }
          if (movingAway && stats.approaching && distToButton > 90) {
            stats.approaching = false;
            stats.checkout_leave_count += 1;
          }
        }
        stats.lastCheckoutDistance = distToButton;
      }
    }

    function onScroll(event) {
      const now = Date.now();
      if (now - lastActivityRef.current > IDLE_GAP_MS) {
        idleMsRef.current += now - lastActivityRef.current;
      }
      lastActivityRef.current = now;
      const stats = statsRef.current;
      stats.scroll_count += 1;
      stats.scroll_distance += Math.abs(event.deltaY || window.scrollY || 0);
      stats.lastScrollBurst.push(now);
      stats.lastScrollBurst = stats.lastScrollBurst.filter((time) => now - time < 400);
    }

    function onClick(event) {
      const now = Date.now();
      lastActivityRef.current = now;
      const stats = statsRef.current;
      stats.click_count += 1;
      const tracked = event.target.closest("[data-track]");
      const kind = tracked?.getAttribute("data-track");
      if (kind === "checkout") stats.checkout_click_count += 1;
    }

    function bindCheckoutButton() {
      const button = document.getElementById("checkout-button");
      if (!button || checkoutBoundRef.current === button) return;
      checkoutBoundRef.current = button;
      button.addEventListener("mouseenter", () => {
        statsRef.current.checkout_hover_count += 1;
      });
      button.addEventListener("mouseleave", () => {
        statsRef.current.checkout_leave_count += 1;
        statsRef.current.approaching = false;
      });
    }

    function bindPriceHovers() {
      document.querySelectorAll("[data-price]").forEach((node) => {
        if (statsRef.current.priceBound.has(node)) return;
        statsRef.current.priceBound.add(node);
        node.addEventListener("mouseenter", () => {
          statsRef.current.price_hover_count += 1;
        });
      });
    }

    const idleTicker = window.setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > IDLE_GAP_MS) {
        idleMsRef.current += 250;
      }
      bindCheckoutButton();
      bindPriceHovers();
      setFeatures(buildFeatures());
    }, 250);

    const predictTicker = window.setInterval(() => {
      pushPrediction(false);
    }, PREDICT_EVERY_MS);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("click", onClick, true);
    bindCheckoutButton();
    bindPriceHovers();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("click", onClick, true);
      window.clearInterval(idleTicker);
      window.clearInterval(predictTicker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent, cart.count, location.pathname]);

  useEffect(() => {
    if (consent) ensureSession(consent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent]);

  const value = useMemo(
    () => ({
      consent,
      grantConsent,
      denyConsent,
      sessionId,
      features,
      prediction,
      predictionError,
      backendOk,
      interventionOpen,
      closeIntervention: () => setInterventionOpen(false),
      completePurchase,
      simulateAbandonment,
      requestPrediction: () => pushPrediction(true),
      page: pageBucket(location.pathname),
    }),
    [consent, sessionId, features, prediction, predictionError, backendOk, interventionOpen, location.pathname]
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used inside TrackingProvider");
  return ctx;
}
