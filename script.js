/* ========== CONFIG ========== */
const WA_NUMBER = "6281234567890"; // ⚠️ WAJIB diganti dengan nomor WhatsApp perusahaan (format 62xxx)

/* ========== EXPORT PACKAGE DATA (USD surcharge per kg) ========== */
const packages = {
  EXW: { label: "EXW (Ex Works)", add: 0.0 },
  FOB: { label: "FOB (Free On Board)", add: 0.5 },
  CFR: { label: "CFR (Cost & Freight)", add: 1.2 },
  CIF: { label: "CIF (Cost, Insurance & Freight)", add: 1.5 },
};

/* ========== PRODUCT DATA ========== */
/* Nilai spesifikasi di bawah adalah contoh wajar untuk kopi green bean —
   WAJIB disesuaikan dengan hasil lab / kontrak aktual sebelum dipublikasikan. */
const products = [
  {
    id: 1,
    name: "Gayo Premium Arabica",
    specs: {
      moisture: "12%",
      defect: "0.5%",
      grade: "Grade 1",
      beanSize: "Screen 16–18",
    },
    basePrice: 7.5,
    minOrder: 5,
    img: "placeholder-gambar/produk1.jpg",
  },
  {
    id: 2,
    name: "Lampung Robusta",
    specs: {
      moisture: "13%",
      defect: "1%",
      grade: "Grade 1",
      beanSize: "> 8 mm",
    },
    basePrice: 5.5,
    minOrder: 5,
    img: "placeholder-gambar/produk2.jpg",
  },
  {
    id: 3,
    name: "Toraja Arabica",
    specs: {
      moisture: "12%",
      defect: "0.5%",
      grade: "Grade 1",
      beanSize: "Screen 16–18",
    },
    basePrice: 8.5,
    minOrder: 3,
    img: "placeholder-gambar/produk3.jpg",
  },
  {
    id: 4,
    name: "Alra House Blend",
    specs: {
      moisture: "12.5%",
      defect: "0.8%",
      grade: "Premium Blend",
      beanSize: "Screen 15–18",
    },
    basePrice: 6.5,
    minOrder: 5,
    img: "placeholder-gambar/produk4.jpg",
  },
  {
    id: 5,
    name: "Flores Bajawa Arabica",
    specs: {
      moisture: "12%",
      defect: "0.5%",
      grade: "Grade 1",
      beanSize: "Screen 16–18",
    },
    basePrice: 8.0,
    minOrder: 5,
    img: "placeholder-gambar/produk5.jpg",
  },
];

let cart = [];

/* ========== CART PERSISTENCE (localStorage) ========== */
const CART_KEY = "alra-cart-v1";
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {}
}
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "null");
    if (Array.isArray(saved)) {
      cart = saved.filter((c) => c && c.qty > 0 && products.some((p) => p.id === c.id));
    }
  } catch (e) {}
}

/* ========== HELPERS ========== */
const usd = (n) =>
  "$ " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function priceOf(product, packageKey) {
  return product.basePrice + packages[packageKey].add;
}

/* ========== RENDER CATALOG ========== */
function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = products
    .map((p) => {
      const defaultPkg = "EXW";
      const defaultPrice = priceOf(p, defaultPkg);
      return `
    <div class="card">
      <div class="img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async"></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="spec-box">
          <div class="spec-label">Product Specification</div>
          <table class="spec-table">
            <tr><th>Moisture</th><td>${p.specs.moisture}</td></tr>
            <tr><th>Defect</th><td>${p.specs.defect}</td></tr>
            <tr><th>Grade</th><td>${p.specs.grade}</td></tr>
            <tr><th>Bean Size</th><td>${p.specs.beanSize}</td></tr>
          </table>
          <div class="spec-note">You can also request a custom specification.</div>
        </div>

        <div class="package-label">Select Price Term</div>
        <select class="package-select" id="pkg-${p.id}" onchange="updateCardPrice(${p.id})">
          ${Object.entries(packages)
            .map(
              ([key, val]) =>
                `<option value="${key}" ${key === defaultPkg ? "selected" : ""}>${val.label}</option>`,
            )
            .join("")}
        </select>

        <div class="price" id="price-${p.id}">${usd(defaultPrice)} <small>/kg</small></div>
        <div class="price-note" id="note-${p.id}">Price EXW (Ex Works)</div>

        <div class="min-order">Min. order: ${p.minOrder} kg</div>
        <div class="qty-control">
          <button onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button>
          <input type="number" id="qty-${p.id}" value="${p.minOrder}" min="${p.minOrder}" readonly>
          <button onclick="changeQty(${p.id},1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `;
    })
    .join("");
}

/* ========== UPDATE PRICE ON PACKAGE CHANGE ========== */
function updateCardPrice(id) {
  const p = products.find((x) => x.id === id);
  const pkgKey = document.getElementById(`pkg-${id}`).value;
  const price = priceOf(p, pkgKey);
  document.getElementById(`price-${id}`).innerHTML = `${usd(price)} <small>/kg</small>`;
  document.getElementById(`note-${id}`).textContent = `Price ${packages[pkgKey].label}`;
}

/* ========== QTY ========== */
function changeQty(id, delta) {
  const p = products.find((x) => x.id === id);
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) + delta;
  if (val < p.minOrder) val = p.minOrder;
  if (val > 9999) val = 9999;
  input.value = val;
}

/* ========== ADD TO CART ========== */
function addToCart(id) {
  const p = products.find((x) => x.id === id);
  const pkgKey = document.getElementById(`pkg-${id}`).value;
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const price = priceOf(p, pkgKey);

  const existing = cart.find((c) => c.id === id && c.package === pkgKey);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      img: p.img,
      package: pkgKey,
      packageLabel: packages[pkgKey].label,
      price: price,
      qty: qty,
    });
  }
  updateCart();
  openCart();
}

/* ========== UPDATE CART UI ========== */
function updateCart() {
  saveCart();
  const itemsEl = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  countEl.textContent = cart.reduce((s, c) => s + c.qty, 0);

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    totalEl.textContent = "$ 0.00";
    checkoutBtn.disabled = true;
    return;
  }

  itemsEl.innerHTML = cart
    .map(
      (c, i) => `
    <div class="cart-item">
      <img src="${c.img}" alt="${c.name}">
      <div class="info">
        <h4>${c.name}</h4>
        <span class="pkg">${c.package}</span>
        <div class="sub">${c.qty} kg × ${usd(c.price)} = <b>${usd(c.qty * c.price)}</b></div>
      </div>
      <button class="remove" onclick="removeItem(${i})">Remove</button>
    </div>
  `,
    )
    .join("");

  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  totalEl.textContent = usd(total);
  checkoutBtn.disabled = false;
}

/* ========== REMOVE ITEM ========== */
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

/* ========== OPEN / CLOSE CART & MENU ========== */
function openCart() {
  closeMenu();
  document.getElementById("cart-panel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
  document.body.classList.add("cart-open"); /* kunci scroll di belakang panel */
}
function closeCart() {
  document.getElementById("cart-panel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  document.body.classList.remove("cart-open");
}
function toggleMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  const open = menu.classList.toggle("open");
  btn.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", open ? "true" : "false");
}
function closeMenu() {
  document.getElementById("mobile-menu").classList.remove("open");
  const btn = document.getElementById("menu-btn");
  btn.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
}

/* ========== WHATSAPP CHECKOUT ========== */
function checkoutWA() {
  if (cart.length === 0) return;

  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  let pesan = "Hello *Alra Berjaya Abadi*, I would like to place an order:\n\n";
  cart.forEach((c, i) => {
    pesan += `${i + 1}. ${c.name}\n`;
    pesan += `   Price Term: ${c.packageLabel}\n`;
    pesan += `   Quantity: ${c.qty} kg\n`;
    pesan += `   Unit Price: ${usd(c.price)}/kg\n`;
    pesan += `   Subtotal: ${usd(c.qty * c.price)}\n\n`;
  });
  pesan += `━━━━━━━━━━━━━━\n`;
  pesan += `*TOTAL: ${usd(total)}*\n\n`;
  pesan += `Please confirm availability and the next steps. Thank you 🙏`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank", "noopener");
}

/* ========== MARQUEE: JEDA SAAT DISENTUH (di HP tidak ada hover) ========== */
const marqueeBox = document.querySelector(".marquee");
const marqueeTrack = document.querySelector(".marquee-track");
if (marqueeBox && marqueeTrack) {
  marqueeBox.addEventListener(
    "touchstart",
    () => {
      marqueeTrack.style.animationPlayState = "paused";
    },
    { passive: true },
  );
  marqueeBox.addEventListener(
    "touchend",
    () => {
      marqueeTrack.style.animationPlayState = "";
    },
    { passive: true },
  );
}

/* Init */
renderProducts();
loadCart();
updateCart();
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
