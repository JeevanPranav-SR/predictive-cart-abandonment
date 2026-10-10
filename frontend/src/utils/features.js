/**
 * Local micro-behavior feature extraction.
 *
 * Mouse points stay in the browser. Only these summarized numbers are sent
 * to the backend every few seconds.
 */

export function emptyFeatures() {
  return {
    session_duration: 0,
    mouse_move_count: 0,
    mouse_distance: 0,
    average_mouse_speed: 0,
    maximum_mouse_speed: 0,
    direction_changes: 0,
    scroll_count: 0,
    scroll_distance: 0,
    click_count: 0,
    cart_time: 0,
    checkout_time: 0,
    checkout_hover_count: 0,
    checkout_leave_count: 0,
    checkout_click_count: 0,
    idle_time: 0,
    checkout_hesitation_score: 0,
  };
}

export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angleChange(prev, current, next) {
  const v1 = { x: current.x - prev.x, y: current.y - prev.y };
  const v2 = { x: next.x - current.x, y: next.y - current.y };
  const n1 = Math.hypot(v1.x, v1.y);
  const n2 = Math.hypot(v2.x, v2.y);
  if (n1 < 2 || n2 < 2) return 0;
  const dot = (v1.x * v2.x + v1.y * v2.y) / (n1 * n2);
  const clamped = Math.min(1, Math.max(-1, dot));
  return (Math.acos(clamped) * 180) / Math.PI;
}

export function localHesitationScore(stats) {
  const hover = stats.checkout_hover_count || 0;
  const leave = stats.checkout_leave_count || 0;
  const clicks = stats.checkout_click_count || 0;
  const idle = stats.idle_time || 0;
  const cartTime = stats.cart_time || 0;
  const leaveRatio = hover > 0 ? leave / hover : 0;
  const score =
    0.38 * Math.min(leaveRatio, 1.2) +
    0.18 * Math.min(hover / 8, 1) +
    0.14 * Math.min(idle / 90, 1) +
    0.12 * Math.min(cartTime / 180, 1) +
    (hover >= 2 && clicks === 0 ? 0.28 : 0) -
    Math.min(clicks * 0.22, 0.45);
  return Number(Math.min(1, Math.max(0, score)).toFixed(4));
}

export function pageBucket(pathname) {
  if (pathname.startsWith("/products/")) return "product";
  if (pathname === "/products") return "products";
  if (pathname === "/cart") return "cart";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/success") return "success";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/demo") return "demo";
  return "home";
}

export function cartStatusLabel(count) {
  if (!count) return "empty";
  return count === 1 ? "1 item" : `${count} items`;
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

export function formatSeconds(value) {
  const seconds = Math.max(0, Math.round(value || 0));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest}s`;
}
