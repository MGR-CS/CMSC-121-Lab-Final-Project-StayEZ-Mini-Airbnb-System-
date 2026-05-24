/**
 * common.js — Shared utilities, UI components, and mock data fallback
 */

// ─── Header & Navigation ──────────────────────────────────────────────────────
const ROLE_BADGE_CONFIG = {
  guest: { label: 'Guest', bg: '#DBEAFE', color: '#1D4ED8', icon: 'fa-user' },
  host:  { label: 'Host',  bg: '#D1FAE5', color: '#065F46', icon: 'fa-key' },
  admin: { label: 'Admin', bg: '#EDE9FE', color: '#5B21B6', icon: 'fa-shield-alt' }
};

function renderHeader(activeViewId = '') {
  const user = getUser(); // from api.js
  const headerHtml = `
    <header style="background: white; border-bottom: 1px solid var(--gray-100); position: sticky; top: 0; z-index: 40; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); display: flex; height: 64px; align-items: center; justify-content: space-between; padding: 0 24px;">
      <div style="display:flex; align-items:center; gap: 24px; flex: 1;">
        <!-- Logo -->
        <a href="/" style="text-decoration:none; font-size: 24px; color: var(--gray-900); letter-spacing: -0.025em; font-weight: 700; user-select: none; cursor: pointer;" class="font-serif" title="Go to home">
          Stay<span style="color:var(--brand)">EZ</span>
        </a>
        
        <!-- Main Nav -->
        <nav id="main-nav" style="display:flex; gap: 24px; align-items: center; font-size: 14px;">
          ${buildNavLinks(user, activeViewId)}
        </nav>
      </div>

      <!-- Right Actions -->
      <div style="display:flex; align-items:center; gap: 12px; flex-shrink: 0;">
        ${buildUserActions(user)}
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHtml);
}

function buildNavLinks(user, activeViewId) {
  if (!user) return '';
  const links = [];
  const add = (id, url, label, iconHtml = '') => {
    const active = id === activeViewId ? 'active-link' : '';
    links.push(`<a href="${url}" class="nav-link ${active}">${iconHtml}${label}</a>`);
  };

  if (user.role === 'guest') {
    add('browse', '/guest/browse.html', 'Browse');
    add('my-bookings', '/guest/my-bookings.html', 'My Bookings');
    add('ratings', '/guest/ratings.html', 'Ratings', '<i class="fas fa-star" style="font-size:11px;margin-right:4px;color:#F59E0B;"></i>');
    add('favorites', '/guest/favorites.html', 'Favorites', '<i class="fas fa-heart" style="font-size:11px;margin-right:4px;color:#EF4444;"></i>');
  } else if (user.role === 'host') {
    add('my-listings', '/host/my-listings.html', 'My Properties');
    add('booking-requests', '/host/booking-requests.html', 'Booking Requests');
    add('ratings', '/host/ratings.html', 'Ratings', '<i class="fas fa-star" style="font-size:11px;margin-right:4px;color:#F59E0B;"></i>');
  } else if (user.role === 'admin') {
    add('dashboard', '/admin/manage-listings.html', 'Dashboard', '<i class="fas fa-tachometer-alt" style="margin-right:5px;font-size:11px;"></i>');
    add('all-listings', '/admin/all-listings.html', 'All Listings', '<i class="fas fa-home" style="margin-right:5px;font-size:11px;"></i>');
    add('all-bookings', '/admin/all-bookings.html', 'All Bookings', '<i class="fas fa-calendar-alt" style="margin-right:5px;font-size:11px;"></i>');
    add('all-users', '/admin/all-users.html', 'All Users', '<i class="fas fa-users" style="margin-right:5px;font-size:11px;"></i>');
  }
  return links.join('');
}

function buildUserActions(user) {
  if (!user) return '';
  const cfg = ROLE_BADGE_CONFIG[user.role];
  return `
    <div id="role-badge" style="display:inline-flex; align-items:center; gap:8px; background:${cfg.bg}; color:${cfg.color}; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600;">
      <i class="fas ${cfg.icon}"></i> ${cfg.label}
    </div>
    <button onclick="handleLogout()" class="btn btn-secondary btn-sm" style="display:inline-flex; gap:6px; margin-left: 8px;">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
  `;
}

function handleLogout() {
  clearSession(); // from api.js
  showToast('👋 Logged out successfully', 'success');
  setTimeout(() => window.location.href = '/', 1000);
}

// ─── UI Utilities ─────────────────────────────────────────────────────────────
function injectToastContainer() {
  if (!document.getElementById('toast')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="toast" class="toast">
        <i id="toast-icon" class="fas fa-check-circle"></i>
        <span id="toast-msg">Action completed</span>
      </div>
    `);
  }
}
document.addEventListener('DOMContentLoaded', injectToastContainer);

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');
  if (!toast) return;

  msgEl.textContent = msg;
  toast.className = 'toast show ' + type;

  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-times-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>'
  };
  iconEl.innerHTML = icons[type] || icons.success;

  setTimeout(() => toast.classList.remove('show'), 4000);
}

// UI Confirm Modal
let _uiConfirmCallback = null;
function injectConfirmModal() {
  if (!document.getElementById('ui-confirm-modal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="ui-confirm-modal" style="display:none;position:fixed;inset:0;z-index:2000;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);">
        <div style="background:white;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.25);animation:slideUp 0.25s ease-out;">
          <div id="ui-confirm-header" style="padding:24px 24px 0;text-align:center;">
            <div id="ui-confirm-icon" style="width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;"></div>
            <h3 id="ui-confirm-title" style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px;"></h3>
            <p id="ui-confirm-body" style="font-size:14px;color:#6B7280;line-height:1.6;margin:0;"></p>
          </div>
          <div style="padding:24px;display:flex;gap:10px;">
            <button id="ui-confirm-cancel" onclick="closeUIConfirm()" style="flex:1;padding:12px;border-radius:10px;font-size:14px;font-weight:600;background:#F3F4F6;border:none;cursor:pointer;color:#374151;transition:background 0.15s;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">Cancel</button>
            <button id="ui-confirm-ok" style="flex:1;padding:12px;border-radius:10px;font-size:14px;font-weight:600;border:none;cursor:pointer;color:white;transition:all 0.15s;"></button>
          </div>
        </div>
      </div>
    `);
  }
}
document.addEventListener('DOMContentLoaded', injectConfirmModal);

function showUIConfirm({ icon, iconBg, title, body, confirmLabel, confirmBg, onConfirm }) {
  document.getElementById('ui-confirm-icon').innerHTML = icon;
  document.getElementById('ui-confirm-icon').style.background = iconBg || '#FEE2E2';
  document.getElementById('ui-confirm-title').textContent = title;
  document.getElementById('ui-confirm-body').textContent = body;
  const okBtn = document.getElementById('ui-confirm-ok');
  okBtn.textContent = confirmLabel || 'Confirm';
  okBtn.style.background = confirmBg || 'var(--danger)';
  _uiConfirmCallback = onConfirm;
  okBtn.onclick = () => { closeUIConfirm(); if (_uiConfirmCallback) _uiConfirmCallback(); };
  document.getElementById('ui-confirm-modal').style.display = 'flex';
}
function closeUIConfirm() {
  document.getElementById('ui-confirm-modal').style.display = 'none';
  _uiConfirmCallback = null;
}

function renderStars(n, size = 14) {
  return [1,2,3,4,5].map(i =>
    `<i class="${i <= n ? 'fas' : 'far'} fa-star" style="color:${i <= n ? '#F59E0B' : '#D1D5DB'};font-size:${size}px;"></i>`
  ).join('');
}
