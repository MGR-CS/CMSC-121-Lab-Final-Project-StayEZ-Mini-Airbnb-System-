/**
 * api.js — Shared frontend helper for making authenticated API calls
 * Imported by index.html (the main SPA). All real-API helpers below use
 * apiFetch() which automatically attaches the JWT from localStorage.
 */

const BASE_URL = "/api";

// ─── Core session helpers ─────────────────────────────────────────────────────

/** Return the JWT token stored after login. */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Return the current user object stored in localStorage.
 * @returns {{ _id, name, email, role } | null}
 */
function getUser() {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined") return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * Persist token + user after a successful login/register.
 * @param {string} token
 * @param {object} user  – { _id, name, email, role }
 */
function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/** Clear session and go back to login. */
function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Redirect to role dashboard if already logged in.
 * (Only used by old multi-page shells – kept for compatibility.)
 */
function redirectIfLoggedIn() {
  const user = getUser();
  if (!user) return;
  if (user.role === "guest")  window.location.href = "/guest/browse.html";
  else if (user.role === "host")  window.location.href = "/host/my-listings.html";
  else if (user.role === "admin") window.location.href = "/admin/manage-listings.html";
}

/**
 * Guard pages that require login. Redirects to / if not authenticated.
 * @param {...string} allowedRoles  e.g. requireAuth("guest"), requireAuth("host","admin")
 */
function requireAuth(...allowedRoles) {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = "/"; return; }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    alert("You are not authorised to view this page.");
    clearSession();
    window.location.href = "/";
  }
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

/**
 * Authenticated fetch wrapper used by all API helpers below.
 * Throws an Error (with message from server) if response is not OK.
 *
 * @param {string} endpoint  – e.g. "/listings"
 * @param {object} options   – standard fetch options plus an optional `body` object
 * @returns {Promise<any>}   – parsed JSON
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
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Log in via the real backend.
 * POST /api/auth/login → { token, user: { _id, name, email, role } }
 * Note: The backend does NOT filter by role – role check is done on the frontend
 * after we receive the user object.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
async function apiLogin(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/**
 * Register a new user via the real backend.
 * POST /api/auth/register → { _id, name, email, role, token }
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} role   – "guest" | "host"
 * @returns {Promise<object>}
 */
async function apiRegister(name, email, password, role) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { name, email, password, role },
  });
}

// ─── LISTINGS ─────────────────────────────────────────────────────────────────

/**
 * Fetch all listings (public). Supports search/filter/sort params.
 * GET /api/listings?search=&location=&type=&sort=
 *
 * @param {{ search?, location?, type?, sort? }} params
 * @returns {Promise<Array>}
 */
async function apiGetListings(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return apiFetch("/listings" + (qs ? "?" + qs : ""));
}

async function apiGetAllUsers(params = {}) {
    return apiFetch("/admin/users"); 
}

/** Update user role (admin only) */
async function apiUpdateUserRole(id, role) {
  return apiFetch(`/admin/users/${id}/role`, {
    method: "PUT",
    body: { role }
  });
}

/** Delete user and cascade delete listings and bookings (admin only) */
async function apiDeleteUser(id) {
  return apiFetch(`/admin/users/${id}`, {
    method: "DELETE"
  });
}

/**
 * Fetch all listings owned by the currently logged-in host.
 * GET /api/listings   (then filter client-side by hostId, since no /my route exists)
 *
 * @returns {Promise<Array>}
 */
async function apiGetMyListings() {
  // The backend returns all listings filtered to the host's ID
  // via the general GET – we filter client-side by the JWT user id.
  const user = getUser();
  const all = await apiFetch("/listings");
  return all.filter(l => String(l.hostId?._id || l.hostId) === String(user?._id));
}

/**
 * Create a new listing (host only).
 * POST /api/listings
 *
 * @param {{ name, type, location, price, description, image, contactNumber }} data
 * @returns {Promise<object>}  The newly created listing
 */
async function apiCreateListing(data) {
  return apiFetch("/listings", { method: "POST", body: data });
}

/**
 * Update an existing listing (owner host or admin).
 * PUT /api/listings/:id
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<{ message, listing }>}
 */
async function apiUpdateListing(id, data) {
  return apiFetch(`/listings/${id}`, { method: "PUT", body: data });
}

/**
 * Delete a listing (owner host or admin).
 * DELETE /api/listings/:id
 *
 * @param {string} id
 * @returns {Promise<{ message }>}
 */
async function apiDeleteListing(id) {
  return apiFetch(`/listings/${id}`, { method: "DELETE" });
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

/**
 * Get bookings for the logged-in guest.
 * GET /api/bookings/my
 * The server already strips contactNumber for non-approved bookings.
 *
 * @returns {Promise<Array>}
 */
async function apiGetMyBookings() {
  return apiFetch("/bookings/my");
}

/**
 * Get all booking requests for the logged-in host's listings.
 * GET /api/bookings/host
 *
 * @returns {Promise<Array>}
 */
async function apiGetHostBookings() {
  return apiFetch("/bookings/host");
}

/**
 * Get ALL bookings (admin only).
 * GET /api/bookings
 *
 * @returns {Promise<Array>}
 */
async function apiGetAllBookings() {
  return apiFetch("/bookings");
}

/**
 * Create a new booking (guest).
 * POST /api/bookings
 *
 * @param {{ listingId, startDate, endDate }} data
 * @returns {Promise<object>}  The newly created booking
 */
async function apiCreateBooking(data) {
  return apiFetch("/bookings", { method: "POST", body: data });
}

/**
 * Approve or reject a booking (host).
 * PUT /api/bookings/:id/status
 *
 * @param {string} id      – booking _id
 * @param {string} status  – "approved" | "rejected"
 * @returns {Promise<{ message, booking }>}
 */
async function apiUpdateBookingStatus(id, status) {
  return apiFetch(`/bookings/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}

/**
 * Get all of guest's favorites
 * GET /api/favorites
 *
 * @returns {Promise<Array>}
 */
async function apiGetFavorites() {
  return apiFetch("/favorites");
}

/**
 * Add to user's favorites a listing by their Id
 * POST /api/favorites/${listingId}
 *
 * @returns {Promise<Array>}
 */
async function apiAddFavorite(listingId) {
  return apiFetch(`/favorites/${listingId}`, {
    method: "POST",
    body: { listingId },
  });
}

/**
 * Delete to user's favorites a listing by their Id
 * DELETE /api/favorites/${listingId}
 *
 * @returns {Promise<Array>}
 */
async function apiRemoveFavorite(listingId) {
  return apiFetch(`/favorites/${listingId}`, {
    method: "DELETE",
    body: { listingId },
  });
}

/**
 * Gets all ratings (ngl bad idea, but it works for now)
 * GET /api/favorites
 *
 * @returns {Promise<Array>}
 */
async function apiGetAllRatings() {
  return apiFetch("/ratings");
}

/**
 * Gets guest's ratings
 * GET /api/favorites
 *
 * @returns {Promise<Array>}
 */
async function apiGetMyRatings() {
  return apiFetch("/ratings/my");
}

/**
 * Submit or update a property review
 * POST /api/ratings
 * @param {Object} data - { bookingId, stars, comment }
 */
async function apiSubmitRating(data) {
  return apiFetch("/ratings", {
    method: "POST",
    body: data
  });
}

/**
 * Submit or update a property review
 * POST /api/ratings
 * @param {Object} data - { bookingId, stars, comment }
 */
async function apiGetMyRatingsHost() {
  return apiFetch("/ratings/host");
}

