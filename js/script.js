// ===== Catálogos =====
const RICE_TYPES = [
  { value: "largo",     label: "Arroz Grano Largo" },
  { value: "jasmin",    label: "Arroz Jazmín" },
  { value: "basmati",   label: "Arroz Basmati" },
  { value: "corto",     label: "Arroz Grano Corto" },
  { value: "integral",  label: "Arroz Integral" },
  { value: "salvaje",   label: "Arroz Salvaje" },
  { value: "bomba",     label: "Arroz Bomba" },
  { value: "glutinoso", label: "Arroz Glutinoso" },
];

const QUANTITIES = [
  { value: "500",   label: "500 kg",       price: 8500 },
  { value: "1000",  label: "1 Tonelada",   price: 16000 },
  { value: "5000",  label: "5 Toneladas",  price: 75000 },
  { value: "10000", label: "10 Toneladas", price: 140000 },
];

// ===== Estado =====
let productItems = [];
const newId = () => 'p_' + Math.random().toString(36).slice(2, 10);

function addProduct() {
  productItems.push({ id: newId(), tipoArroz: "", cantidad: "" });
  renderProducts();
}

function removeProduct(id) {
  if (productItems.length === 1) return;
  productItems = productItems.filter(p => p.id !== id);
  renderProducts();
  updateEstimate();
}

function updateProduct(id, field, value) {
  const item = productItems.find(p => p.id === id);
  if (item) item[field] = value;
  updateEstimate();
}

function renderProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  list.innerHTML = '';

  productItems.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'product-item';
    card.innerHTML = `
      <div class="product-item-header">
        <span class="product-item-label">Producto #${idx + 1}</span>
        ${productItems.length > 1 ? `
          <button type="button" class="btn-remove" data-remove="${item.id}" aria-label="Eliminar producto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        ` : ''}
      </div>
      <div class="product-item-grid">
        <select data-field="tipoArroz" data-id="${item.id}" required>
          <option value="">Tipo de arroz...</option>
          ${RICE_TYPES.map(r => `<option value="${r.value}" ${item.tipoArroz===r.value?'selected':''}>${r.label}</option>`).join('')}
        </select>
        <select data-field="cantidad" data-id="${item.id}" required>
          <option value="">Cantidad...</option>
          ${QUANTITIES.map(q => `<option value="${q.value}" ${item.cantidad===q.value?'selected':''}>${q.label} — $${q.price.toLocaleString('es-MX')}</option>`).join('')}
        </select>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', e => {
      updateProduct(e.target.dataset.id, e.target.dataset.field, e.target.value);
    });
  });
  list.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeProduct(btn.dataset.remove));
  });
}

function updateEstimate() {
  const panel = document.getElementById('estimatePanel');
  if (!panel) return;

  const validItems = productItems.filter(p => p.tipoArroz && p.cantidad);
  if (validItems.length === 0) {
    panel.classList.remove('visible');
    return;
  }

  let total = 0;
  const lines = validItems.map((it, i) => {
    const t = RICE_TYPES.find(r => r.value === it.tipoArroz);
    const q = QUANTITIES.find(c => c.value === it.cantidad);
    total += q.price;
    return `<div class="item-line"><span>${i+1}. ${t.label} (${q.label})</span><span class="item-price">$${q.price.toLocaleString('es-MX')}</span></div>`;
  }).join('');

  const isFree = total >= 2000;
  panel.innerHTML = `
    <h4>Resumen de tu pedido</h4>
    <div class="details">
      ${lines}
      <p class="total-line">Total: $${total.toLocaleString('es-MX')} MXN</p>
      ${isFree ? '<p class="free-tag">✓ Envío estándar gratuito</p>' : ''}
    </div>
  `;
  panel.classList.add('visible');
}

function handleOrderSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
   btn.classList.add('loading');
  const form = e.target;
  const validItems = productItems.filter(p => p.tipoArroz && p.cantidad);

  if (validItems.length === 0) {
    alert('Selecciona al menos un producto (tipo de arroz y cantidad).');
    return;
  }
  const metodoPagoEl = document.querySelector('input[name="metodoPago"]:checked');
if (!metodoPagoEl) {
  alert('Por favor selecciona un método de pago.');
  return;
}
const metodoPago = metodoPagoEl.value;

  const data = new FormData(form);
  let total = 0;
  const productosTexto = validItems.map((it, i) => {
    const t = RICE_TYPES.find(r => r.value === it.tipoArroz);
    const q = QUANTITIES.find(c => c.value === it.cantidad);
    total += q.price;
    return `  ${i+1}. ${t.label} — ${q.label} ($${q.price.toLocaleString('es-MX')} MXN)`;
  }).join('%0A');

  const mensaje =
    `*Nuevo Pedido - Arroz El Dragón Mex*%0A%0A` +
    `*Nombre:* ${data.get('nombre') || ''}%0A` +
    `*Empresa:* ${data.get('empresa') || 'N/A'}%0A` +
    `*Email:* ${data.get('email') || ''}%0A` +
    `*Teléfono:* ${data.get('telefono') || ''}%0A` +
    `*💳 Método de Pago:* ${data.get('metodoPago') || ''}%0A` +
    `*Estado:* ${data.get('estado') || ''}%0A` +
    `*C.P.:* ${data.get('codigoPostal') || ''}%0A%0A` +
    `*Productos:*%0A${productosTexto}%0A%0A` +
    `*Total Estimado:* $${total.toLocaleString('es-MX')} MXN%0A` +
    `*Mensaje:* ${data.get('mensaje') || 'Sin mensaje adicional'}`;

    setTimeout(() => {

     window.open(`https://wa.me/525510283510?text=${mensaje}`, '_blank');
  btn.classList.remove('loading');
   }, 1200);

  form.reset();
  productItems = [{ id: newId(), tipoArroz: "", cantidad: "" }];
  renderProducts();
  updateEstimate();
}

// ===== UN SOLO DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", function () {
  // Splash screen
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("hidden");
      setTimeout(() => { splash.style.display = "none"; }, 600);
    }, 2500);
  }

  // Mobile menu
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      hamburger.textContent = mobileMenu.classList.contains("open") ? "✕" : "☰";
    });
    mobileMenu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.textContent = "☰";
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  // Multi-producto
  const addBtn = document.getElementById('addProductBtn');
  const form   = document.getElementById('orderForm');
  if (addBtn) addBtn.addEventListener('click', addProduct);
  if (form)   form.addEventListener('submit', handleOrderSubmit);

  addProduct(); // arranca con un producto vacío
});

/* === MODAL AVISO DE PRIVACIDAD === */
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openPrivacy');
  const closeBtn = document.getElementById('closePrivacy');
  const modal = document.getElementById('privacyModal');
  if (!modal) return;

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
  });
  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});

/* === REVEAL ON SCROLL === */
document.addEventListener('DOMContentLoaded', () => {
  // Auto-aplicar a tarjetas y títulos
  const auto = document.querySelectorAll(
    '.product-card, .benefit-card, .testimonial, .ship-card, .stat-card, section h2'
  );
  auto.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

/* === CONTADOR ANIMADO === */
function animateCounter(el, target, suffix, duration = 2000) {
  let start = 0;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.floor(eased * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
  const nums = document.querySelectorAll('.stat-card .num');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent.trim();
        const match = raw.match(/(\d+)(.*)/);
        if (match) {
          const target = parseInt(match[1], 10);
          const suffix = match[2] || '';
          animateCounter(el, target, suffix);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
});

/* === MODO MAYORISTA === */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('wholesaleToggle');
  const fields = document.getElementById('wholesaleFields');
  if (!toggle || !fields) return;
  toggle.addEventListener('change', () => {
    fields.style.display = toggle.checked ? 'block' : 'none';
  });
});

