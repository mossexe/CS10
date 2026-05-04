// ── Config ──
// Change this to your deployed backend URL when deploying!
const API_BASE = 'http://localhost:3000';

// ── State ──
let token = localStorage.getItem('sbd_token') || null;

// ── UI Helpers ──
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

function clearAlerts() {
  document.querySelectorAll('.alert').forEach(a => {
    a.classList.remove('show');
    a.textContent = '';
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('btn-loading', loading);
  btn.disabled = loading;
}

// ── Auth Functions ──
async function handleLogin() {
  clearAlerts();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert('login-alert', '💕 Please fill in all fields!');
    return;
  }

  setLoading('login-btn', true);

  try {
    const res = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAlert('login-alert', data.message || 'Login failed. Check your credentials 🥺');
      return;
    }

    // Try auth/login for token
    const authRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const authData = await authRes.json();

    if (authData.success && authData.payload?.token) {
      token = authData.payload.token;
    } else if (data.payload?.token) {
      token = data.payload.token;
    }

    if (token) localStorage.setItem('sbd_token', token);

    showToast('Welcome back! 🎀');
    showPage('items');
  } catch (err) {
    showAlert('login-alert', 'Network error. Is the server running? 🔌');
  } finally {
    setLoading('login-btn', false);
  }
}

async function handleRegister() {
  clearAlerts();
  const name     = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!name || !username || !email || !password) {
    showAlert('register-alert', '💕 Please fill in all required fields!');
    return;
  }

  setLoading('register-btn', true);

  try {
    const body = { name, username, email, password };
    if (phone) body.phone = phone;

    const res = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAlert('register-alert', data.message || 'Registration failed 😢');
      return;
    }

    showAlert('register-success', '🎉 Account created! Taking you to login...', 'success');
    setTimeout(() => showPage('login'), 1800);
  } catch (err) {
    showAlert('register-alert', 'Network error. Is the server running? 🔌');
  } finally {
    setLoading('register-btn', false);
  }
}

function logout() {
  token = null;
  localStorage.removeItem('sbd_token');
  showPage('items');
  showToast('Logged out! See you soon 🌸');
}
