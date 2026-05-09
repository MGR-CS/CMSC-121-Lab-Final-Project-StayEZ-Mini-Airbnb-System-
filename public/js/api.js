/**
 * api.js — Shared frontend helper for making authenticated API calls
 * Import this script in every page that needs to talk to the backend.
 */

const BASE_URL = "/api";

/**
 * Get the JWT token stored in localStorage after login.
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Get the current user object stored in localStorage.
 * @returns {{ _id, name, role } | null}
 */
function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Save token and user info to localStorage after successful login.
 * @param {string} token - JWT
 * @param {object} user  - { _id, name, role }
 */
function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clear session data and redirect to login.
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/index.html";
}

/**
 * Redirect user to their role's dashboard if already logged in.
 * Call this on the login page to avoid showing it when already authenticated.
 */
function redirectIfLoggedIn() {
  const user = getUser();
  if (!user) return;
  if (user.role === "guest") window.location.href = "/guest/browse.html";
  else if (user.role === "host") window.location.href = "/host/my-listings.html";
  else if (user.role === "admin") window.location.href = "/admin/manage-listings.html";
}

/**
 * Require login: redirect to login page if no token is present.
 * Optionally restrict to specific roles.
 * @param {...string} allowedRoles - e.g. requireAuth("guest"), requireAuth("host", "admin")
 */
function requireAuth(...allowedRoles) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = "/index.html";
    return;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    alert("You are not authorized to view this page.");
    logout();
  }
}

/**
 * Generic authenticated fetch wrapper.
 * @param {string} endpoint - API path, e.g. "/listings"
 * @param {object} options  - fetch options (method, body, etc.)
 * @returns {Promise<any>}  - Parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API error");
  }

  return data;
}
