// ── DATOS DE PRODUCTOS ──────────────────────────
// ✏️ EDITA AQUÍ para añadir o cambiar productos
// El campo "stock" es el valor por defecto (se sobreescribe con Supabase)
const PRODUCTS = [
  {
    id: 1,
    name: "Auriculares Bluetooth Pro",
    category: "electronica",
    categoryLabel: "Electrónica",
    price: 1800,
    badge: "Popular",
    desc: "Sonido envolvente 360°, cancelación de ruido activa, batería de 30 horas. Compatibles con todos los dispositivos.",
    img: "Imagenes/dcu-tecnologic_auriculares-anc-bt-diadema-jack-neg_1.jpg",
    stock: 10
  },
  {
    id: 2,
    name: "Cafetera Espresso Italiana",
    category: "hogar",
    categoryLabel: "Hogar",
    price: 3200,
    badge: null,
    desc: "Prepara un café auténtico en minutos. Acero inoxidable, fácil limpieza, para 6 tazas.",
    img: "Imagenes/222q1037_1.jpg",
    stock: 10
  },
  {
    id: 3,
    name: "Camiseta Premium Cotton",
    category: "ropa",
    categoryLabel: "Ropa",
    price: 650,
    badge: "Nuevo",
    desc: "100% algodón peinado, corte moderno. Disponible en tallas S, M, L, XL.",
    img: "Imagenes/Camiseta-verde-silueta-centro-foto-683x1024.jpg",
    stock: 10
  },
  {
    id: 4,
    name: "Aceite de Oliva Extra Virgen",
    category: "alimentos",
    categoryLabel: "Alimentos",
    price: 950,
    badge: null,
    desc: "Importado de España. 500ml. Primera prensada en frío, ideal para cocinar y aderezos.",
    img: "Imagenes/aceite_900_ml.jpg",
    stock: 10
  },
  {
    id: 5,
    name: "Serum Vitamina C",
    category: "belleza",
    categoryLabel: "Belleza",
    price: 1200,
    badge: "Oferta",
    desc: "Ilumina y unifica el tono. Formula con 20% Vitamina C estabilizada y ácido hialurónico.",
    img: "Imagenes/1736855753-captura-de-pantalla-2025-01-14-125948-678650ba92a79.jpg",
    stock: 10
  },
  {
    id: 6,
    name: "Lámpara LED de Escritorio",
    category: "hogar",
    categoryLabel: "Hogar",
    price: 1450,
    badge: null,
    desc: "Luz cálida y fría ajustable, intensidad regulable, puerto USB integrado para cargar.",
    img: "Imagenes/61A9bee+w3L._AC_UF894,1000_QL80_.jpg",
    stock: 10
  },
  {
    id: 7,
    name: "Sneakers Urbanos",
    category: "ropa",
    categoryLabel: "Ropa",
    price: 2800,
    badge: "Nuevo",
    desc: "Diseño moderno, suela de goma antideslizante. Tallas del 36 al 45.",
    img: "Imagenes/Tenis-con-gamuza-para-hombre-e1731683674564.jpg",
    stock: 10
  },
  {
    id: 8,
    name: "Power Bank 20000mAh",
    category: "electronica",
    categoryLabel: "Electrónica",
    price: 2100,
    badge: null,
    desc: "Carga rápida 22W, doble puerto USB-A + USB-C. Indicador LED. Ideal para viajes.",
    img: "Imagenes/powerbank-1hora-20000mAh.jpg",
    stock: 10
  }
];

// ── CONFIGURACIÓN SUPABASE ───────────────────────
// ✏️ Pega aquí la URL y la "anon public key" de tu proyecto Supabase
// (Project Settings → API). Crea antes la tabla "products" (ver instrucciones
// en el archivo SUPABASE_SETUP.md incluido).
const SUPABASE_URL = "https://dytmbxpdmaadhewlfqqs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_b8nYCa-nHUtzXc1_LkX13w_adhDMvhf";

// El acceso de administrador ahora se valida con Supabase Auth (ver
// SUPABASE_SETUP.md): crea un usuario admin desde el panel de Supabase,
// no hace falta guardar ninguna contraseña aquí.

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('TU-PROYECTO')) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ── CONFIGURACIÓN EMAILJS ─────────────────────────
// ✏️ Pega aquí tus datos de https://dashboard.emailjs.com
// (ver instrucciones en EMAILJS_SETUP.md)
const EMAILJS_PUBLIC_KEY  = "A-SSQpFBnx-n5pMG6";
const EMAILJS_SERVICE_ID  = "service_f0cbiuj";
const EMAILJS_TEMPLATE_ID = "template_lmgdusb";
// ✏️ Correo donde quieres recibir los pedidos
const ORDER_NOTIFICATION_EMAIL = "ray.cerutte2005@gmail.com";

const emailjsReady = typeof emailjs !== 'undefined'
  && !EMAILJS_PUBLIC_KEY.startsWith('TU-');
if (emailjsReady) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// ✏️ CAMBIA ESTA URL por la imagen real de tu QR
const QR_IMAGE_URL = null; // Ej: "img/qr-tarjeta.png"

// ── ESTADO ──────────────────────────────────────
let cart = [];
let currentProduct = null;
let currentQty = 1;
let activeCategory = 'todos';

// ── RENDER PRODUCTOS ─────────────────────────────
function renderProducts(filter = activeCategory) {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(p => {
    const agotado = (p.stock ?? 0) <= 0;
    return `
    <div class="product-card ${agotado ? 'out-of-stock' : ''}" onclick="openProduct(${p.id})">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${agotado ? `<span class="product-badge badge-agotado">Agotado</span>` : (p.badge ? `<span class="product-badge">${p.badge}</span>` : '')}
      </div>
      <div class="product-info">
        <div class="product-category">${p.categoryLabel}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.price.toLocaleString('es-CU')} <span class="currency">CUP</span>
          </div>
          <button class="add-btn" onclick="event.stopPropagation(); quickAdd(${p.id})">+</button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

// ── MODAL PRODUCTO ───────────────────────────────
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if ((p.stock ?? 0) <= 0) {
    showToast('⚠ Producto agotado');
    return;
  }
  currentProduct = p;
  currentQty = 1;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalImg').alt = p.name;
  document.getElementById('modalCategory').textContent = p.categoryLabel;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.desc;
  document.getElementById('modalPrice').textContent = p.price.toLocaleString('es-CU') + ' CUP';
  document.getElementById('qtyNum').textContent = 1;
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeProductModal(e) {
  if (e.target === document.getElementById('productModal')) closeModal();
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qtyNum').textContent = currentQty;
}

function addToCartFromModal() {
  addToCart(currentProduct, currentQty);
  closeModal();
}

// ── CARRITO ──────────────────────────────────────
function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if ((p.stock ?? 0) <= 0) {
    showToast('⚠ Producto agotado');
    return;
  }
  addToCart(p, 1);
}

function addToCart(product, qty) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  updateCartCount();
  showToast(`${product.name} agregado al carrito ✓`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// ── MODAL CARRITO ────────────────────────────────
function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeCartModal(e) {
  if (e.target === document.getElementById('cartModal')) closeCart();
}

function renderCart() {
  const content = document.getElementById('cartContent');
  if (cart.length === 0) {
    content.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br>¡Agrega algunos productos!</p>
      </div>`;
    return;
  }

  const itemsHtml = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${i.img}" alt="${i.name}" /></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-qty">x${i.qty} · ${i.price.toLocaleString('es-CU')} CUP/u</div>
      </div>
      <div class="cart-item-price">${(i.price * i.qty).toLocaleString('es-CU')} CUP</div>
      <button class="cart-item-remove" onclick="removeFromCart(${i.id})">✕</button>
    </div>
  `).join('');

  const qrHtml = QR_IMAGE_URL
    ? `<img src="${QR_IMAGE_URL}" alt="QR de pago" style="width:140px;height:140px;" />`
    : `<div class="qr-placeholder"><span class="qr-icon">📷</span><span>Coloca aquí tu<br>código QR</span></div>`;

  content.innerHTML = `
    <div class="cart-items">${itemsHtml}</div>
    <hr class="cart-divider" />
    <div class="cart-total">
      <span class="cart-total-label">Total a pagar</span>
      <span class="cart-total-amount">${getTotal().toLocaleString('es-CU')} CUP</span>
    </div>
    <div class="qr-section">
      <div class="qr-title">Pago por transferencia</div>
      <div class="qr-img-wrap">${qrHtml}</div>
      <p class="qr-instructions">Escanea el código QR con tu app bancaria y realiza la transferencia por el monto exacto.</p>
    </div>
    <div class="comprobante-form">
      <label class="form-label">Tu nombre</label>
      <input class="form-input" type="text" placeholder="Nombre completo" id="clientName" />
      <label class="form-label">Dirección de entrega</label>
      <input class="form-input" type="text" placeholder="Municipio, calle, número..." id="clientAddress" />
      <label class="form-label">Teléfono de contacto</label>
      <input class="form-input" type="tel" placeholder="+53 5XXX XXXX" id="clientPhone" />
      <label class="form-label">Comprobante de pago</label>
      <textarea class="form-textarea" placeholder="Describe tu transferencia: banco, monto, hora, últimos 4 dígitos de tu tarjeta..." id="clientProof"></textarea>
    </div>
    <button class="send-order-btn" onclick="sendOrder()">
      Confirmar pedido ✓
    </button>
  `;
}

function sendOrder() {
  const name    = document.getElementById('clientName').value.trim();
  const address = document.getElementById('clientAddress').value.trim();
  const phone   = document.getElementById('clientPhone').value.trim();
  const proof   = document.getElementById('clientProof').value.trim();

  if (!name || !address || !phone || !proof) {
    showToast('⚠ Completa todos los campos');
    return;
  }

  const itemsText = cart.map(i =>
    `• ${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString('es-CU')} CUP`
  ).join('\n');
  const total = getTotal().toLocaleString('es-CU') + ' CUP';
  const fecha = new Date().toLocaleString('es-CU');

  if (emailjsReady) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: ORDER_NOTIFICATION_EMAIL,
      client_name: name,
      client_address: address,
      client_phone: phone,
      client_proof: proof,
      order_items: itemsText,
      order_total: total,
      order_date: fecha
    }).catch(err => console.error('Error enviando email del pedido:', err));
  } else {
    console.warn('EmailJS no está configurado: el pedido no se envió por correo (ver EMAILJS_SETUP.md).');
  }

  // ✏️ AQUÍ también puedes guardar el pedido en Supabase si lo necesitas
  const content = document.getElementById('cartContent');
  content.innerHTML = `
    <div style="text-align:center;padding:40px 0;display:flex;flex-direction:column;align-items:center;gap:16px;">
      <div style="font-size:3.5rem">🎉</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700">¡Pedido recibido!</div>
      <p style="color:var(--text-muted);font-size:0.9rem;max-width:28ch;line-height:1.6">
        Gracias ${name}. Confirmaremos tu pedido en menos de 2 horas por teléfono.
      </p>
    </div>`;
  cart = [];
  updateCartCount();
}

// ── TOAST ────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── SCROLL HEADER ────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY > 20);
});

// ── SUPABASE: SINCRONIZACIÓN DE STOCK ────────────
async function loadStockFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('products').select('id, stock');
    if (error) throw error;

    if (!data || data.length === 0) {
      // Primera vez: siembra la tabla con el stock por defecto de cada producto
      const seed = PRODUCTS.map(p => ({ id: p.id, stock: p.stock }));
      await supabaseClient.from('products').upsert(seed);
      return;
    }

    data.forEach(row => {
      const p = PRODUCTS.find(x => x.id === row.id);
      if (p) p.stock = row.stock;
    });
    renderProducts();
  } catch (err) {
    console.error('Error cargando stock de Supabase:', err);
  }
}

function subscribeToStockChanges() {
  if (!supabaseClient) return;
  supabaseClient
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
      const row = payload.new;
      if (!row) return;
      const p = PRODUCTS.find(x => x.id === row.id);
      if (p) {
        p.stock = row.stock;
        renderProducts();
        if (document.getElementById('adminPanelModal').classList.contains('open')) {
          renderAdminProductsList();
        }
      }
    })
    .subscribe();
}

async function updateProductStock(id, newStock) {
  const stock = Math.max(0, parseInt(newStock, 10) || 0);
  const p = PRODUCTS.find(x => x.id === id);
  if (p) p.stock = stock;
  renderProducts();
  renderAdminProductsList();

  if (!supabaseClient) {
    document.getElementById('adminStatus').textContent =
      '⚠ Supabase no está configurado: el cambio solo se ve en este navegador.';
    return;
  }
  document.getElementById('adminStatus').textContent = 'Guardando...';
  const { error } = await supabaseClient.from('products').upsert({ id, stock });
  document.getElementById('adminStatus').textContent = error
    ? '⚠ Error al guardar: ' + error.message
    : '✓ Cambios guardados y sincronizados para todos los usuarios.';
}

// ── PANEL DE ADMINISTRACIÓN ──────────────────────
let isAdmin = false;

async function checkExistingSession() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  isAdmin = !!data?.session;
}

function openAdminLogin() {
  if (isAdmin) {
    openAdminPanel();
    return;
  }
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPassword').value = '';
  document.getElementById('adminLoginError').textContent = '';
  document.getElementById('adminLoginModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminLogin() {
  document.getElementById('adminLoginModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeAdminLoginModal(e) {
  if (e.target === document.getElementById('adminLoginModal')) closeAdminLogin();
}

async function checkAdminPassword() {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errorEl = document.getElementById('adminLoginError');

  if (!supabaseClient) {
    errorEl.textContent = '⚠ Supabase no está configurado (ver SUPABASE_SETUP.md).';
    return;
  }
  if (!email || !password) {
    errorEl.textContent = '⚠ Completa correo y contraseña';
    return;
  }

  errorEl.textContent = 'Verificando...';
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = '⚠ Correo o contraseña incorrectos';
    return;
  }

  isAdmin = true;
  closeAdminLogin();
  openAdminPanel();
}

async function adminLogout() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  isAdmin = false;
  closeAdminPanel();
}

function openAdminPanel() {
  if (!isAdmin) {
    openAdminLogin();
    return;
  }
  document.getElementById('adminStatus').textContent = supabaseClient
    ? 'Conectado a Supabase: los cambios se ven al instante para todos los usuarios.'
    : '⚠ Supabase no está configurado (ver SUPABASE_SETUP.md). Los cambios no se compartirán.';
  renderAdminProductsList();
  document.getElementById('adminPanelModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
  document.getElementById('adminPanelModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeAdminPanelModal(e) {
  if (e.target === document.getElementById('adminPanelModal')) closeAdminPanel();
}

function renderAdminProductsList() {
  const list = document.getElementById('adminProductsList');
  list.innerHTML = PRODUCTS.map(p => {
    const agotado = (p.stock ?? 0) <= 0;
    return `
    <div class="admin-product-row">
      <img src="${p.img}" alt="${p.name}" />
      <div class="admin-product-name">
        ${p.name}
        <small>${p.categoryLabel} · ${p.price.toLocaleString('es-CU')} CUP</small>
      </div>
      <input
        class="admin-stock-input"
        type="number"
        min="0"
        value="${p.stock ?? 0}"
        onchange="updateProductStock(${p.id}, this.value)"
      />
      <button
        class="admin-toggle-btn ${agotado ? 'out-stock' : 'in-stock'}"
        onclick="updateProductStock(${p.id}, ${agotado ? 1 : 0})"
      >${agotado ? 'Marcar disponible' : 'Marcar agotado'}</button>
    </div>`;
  }).join('');
}

// ── INIT ─────────────────────────────────────────
renderProducts();
loadStockFromSupabase();
subscribeToStockChanges();
checkExistingSession();
