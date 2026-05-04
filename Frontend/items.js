// ── Items ──
let allItems = [];

// Random cute emojis for items
const ITEM_EMOJIS = ['🛍️','💖','✨','🌸','🎀','💝','🌷','🍓','🧁','🌺','💫','🎁','🍒','🦋','🌟'];

function getEmoji(index) {
  return ITEM_EMOJIS[index % ITEM_EMOJIS.length];
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadItems() {
  const grid    = document.getElementById('items-grid');
  const countEl = document.getElementById('items-count');

  grid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Loading cute items... 🌸</span>
    </div>`;
  countEl.textContent = 'Loading...';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res  = await fetch(`${API_BASE}/items`, { headers });
    const data = await res.json();

    if (!res.ok || !data.success) {
      grid.innerHTML = `<div class="empty-state">😢 Could not load items<br><small>${data.message || ''}</small></div>`;
      return;
    }

    allItems = data.payload || [];
    renderItems(allItems);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">🔌 Network error — is the server running?</div>`;
    countEl.textContent = '';
  }
}

function renderItems(items) {
  const grid    = document.getElementById('items-grid');
  const countEl = document.getElementById('items-count');

  countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} ✨`;

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state">🔍 No items found!</div>`;
    return;
  }

  grid.innerHTML = items.map((item, i) => {
    const stockClass = item.stock <= 0 ? 'out-stock' : item.stock <= 5 ? 'low-stock' : 'in-stock';
    const stockLabel = item.stock <= 0 ? 'Out of Stock' : item.stock <= 5 ? `Only ${item.stock} left!` : `${item.stock} in stock`;
    const price = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(item.price);

    return `
      <div class="item-card" style="animation-delay:${i * 0.05}s">
        <div class="item-emoji">${getEmoji(i)}</div>
        <div class="item-name">${escHtml(item.name)}</div>
        <div class="item-meta">
          <span class="item-price">${price}</span>
          <span class="item-stock ${stockClass}">${stockLabel}</span>
        </div>
      </div>`;
  }).join('');
}

function filterItems() {
  const q = document.getElementById('search-input').value.toLowerCase();
  renderItems(allItems.filter(item => item.name.toLowerCase().includes(q)));
}
