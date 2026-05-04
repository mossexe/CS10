// ── Navigation ──
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');

  updateNav(name);
  clearAlerts();
  if (name === 'items') loadItems();
}

function updateNav(page) {
  const loggedIn   = !!token;
  const loginBtn   = document.getElementById('nav-login-btn');
  const registerBtn= document.getElementById('nav-register-btn');
  const logoutBtn  = document.getElementById('nav-logout-btn');

  loginBtn.style.display    = (loggedIn || page === 'login')    ? 'none' : '';
  registerBtn.style.display = (loggedIn || page === 'register') ? 'none' : '';
  logoutBtn.style.display   = loggedIn ? '' : 'none';
}

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  showPage('items');

  // Enter key support
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('reg-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });
});
