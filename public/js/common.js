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
      <a href="/" style="text-decoration:none; font-size: 24px; color: var(--gray-900); letter-spacing: -0.025em; font-weight: 700; user-select: none; cursor: pointer;" class="font-serif" title="Go to home">
        Stay<span style="color:var(--brand)">EZ</span>
      </a>
      
      <div style="position: relative; display: inline-block;">
        ${buildUserDropdown(user, activeViewId)}
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHtml);
}

function buildUserDropdown(user, activeViewId) {
  if (!user) return '';
  const cfg = ROLE_BADGE_CONFIG[user.role];

  return `
    <button id="nav-dropdown-btn" style="background: white; border: 1px solid var(--gray-200); padding: 6px 14px; border-radius: 99px; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s;" onmouseover="this.style.borderColor='var(--gray-300)'" onmouseout="this.style.borderColor='var(--gray-200)'">
      <i class="fas fa-bars" style="color: var(--gray-600); font-size: 14px;"></i>
      <div style="display:inline-flex; align-items:center; gap:6px; background:${cfg.bg}; color:${cfg.color}; padding:4px 10px; border-radius:99px; font-size:12px; font-weight:600;">
        <i class="fas ${cfg.icon}"></i> ${cfg.label}
      </div>
    </button>
    
    <div id="nav-dropdown-content" style="display: none; position: absolute; right: 0; top: 125%; background: white; min-width: 220px; border: 1px solid var(--gray-100); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); z-index: 100; overflow: hidden; padding: 6px 0;">
      <div style="padding: 8px 16px 4px; font-size: 11px; color: var(--gray-400); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
        Manage Account
      </div>
      
      ${buildDropdownLinks(user, activeViewId)}
      
      <hr style="border: 0; border-top: 1px solid var(--gray-100); margin: 6px 0;">
      
      <button onclick="handleLogout()" style="width: 100%; text-align: left; background: none; border: none; padding: 10px 16px; color: #EF4444; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='none'">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  `;
}

function buildDropdownLinks(user, activeViewId) {
  const links = [];
  const add = (id, url, label, iconHtml) => {
    const isActive = id === activeViewId;
    const itemStyle = isActive 
      ? 'background-color: var(--gray-50); font-weight: 600; color: var(--brand);' 
      : 'color: var(--gray-700);';
      
    links.push(`
      <a href="${url}" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; text-decoration: none; font-size: 14px; ${itemStyle} transition: background 0.15s;" onmouseover="this.style.backgroundColor='var(--gray-50)'" onmouseout="this.style.backgroundColor='${isActive ? 'var(--gray-50)' : 'transparent'}'">
        <div style="width: 16px; text-align: center; display: flex; justify-content: center; align-items: center;">${iconHtml}</div>
        <span>${label}</span>
      </a>
    `);
  };

  if (user.role === 'guest') {
    add('browse', '/guest/browse.html', 'Browse', '<i class="fas fa-search" style="font-size:13px;"></i>');
    add('my-bookings', '/guest/my-bookings.html', 'My Bookings', '<i class="fas fa-suitcase" style="font-size:13px;"></i>');
    add('ratings', '/guest/ratings.html', 'Ratings', '<i class="fas fa-star" style="font-size:13px;color:#F59E0B;"></i>');
    add('favorites', '/guest/favorites.html', 'Favorites', '<i class="fas fa-heart" style="font-size:13px;color:#EF4444;"></i>');
  } else if (user.role === 'host') {
    add('my-listings', '/host/my-listings.html', 'My Properties', '<i class="fas fa-home" style="font-size:13px;"></i>');
    add('booking-requests', '/host/booking-requests.html', 'Booking Requests', '<i class="fas fa-calendar-check" style="font-size:13px;"></i>');
    add('ratings', '/host/ratings.html', 'Ratings', '<i class="fas fa-star" style="font-size:13px;color:#F59E0B;"></i>');
  } else if (user.role === 'admin') {
    add('dashboard', '/admin/manage-listings.html', 'Dashboard', '<i class="fas fa-tachometer-alt" style="font-size:13px;"></i>');
    add('all-listings', '/admin/all-listings.html', 'All Listings', '<i class="fas fa-building" style="font-size:13px;"></i>');
    add('all-bookings', '/admin/all-bookings.html', 'All Bookings', '<i class="fas fa-calendar-alt" style="font-size:13px;"></i>');
    add('all-users', '/admin/all-users.html', 'All Users', '<i class="fas fa-users" style="font-size:13px;"></i>');
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

document.addEventListener('click', function(e) {
  const btn = e.target.closest('#nav-dropdown-btn');
  const content = document.getElementById('nav-dropdown-content');
  
  if (!content) return;
  
  if (btn) {
    const isHidden = content.style.display === 'none' || content.style.display === '';
    content.style.display = isHidden ? 'block' : 'none';
  } else if (!e.target.closest('#nav-dropdown-content')) {
    content.style.display = 'none';
  }
});

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
  okBtn.onclick = async () => { 
  if (_uiConfirmCallback) await _uiConfirmCallback(); // 1. Run the action first 
  closeUIConfirm();                                   // 2. Hide the modal after it finishes
  };
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
