/* ========== CONFIG ========== */
const WA_NUMBER = "6281234567890"; // Replace with company WhatsApp number

/* ========== EXPORT PACKAGE DATA (USD surcharge per kg) ========== */
const packages = {
  EXW: { label: "EXW (Ex Works)",                    add: 0.00 },
  FOB: { label: "FOB (Free On Board)",               add: 0.50 },
  CFR: { label: "CFR (Cost & Freight)",              add: 1.20 },
  CIF: { label: "CIF (Cost, Insurance & Freight)",   add: 1.50 }
};

/* ========== PRODUCT DATA ========== */
const products = [
  {
    id: 1,
    name: "Gayo Premium Arabica",
    desc: "Single-origin arabica from the highlands of Gayo, Aceh. Fruity notes with a strong distinctive aroma.",
    basePrice: 7.50,
    minOrder: 5,
    img: "image/green_bean.webp"
  },
  {
    id: 2,
    name: "Lampung Robusta",
    desc: "Selected robusta from Lampung with a full body and balanced bitterness, ideal for espresso.",
    basePrice: 5.50,
    minOrder: 5,
    img: "image/roasted_coffee_bean_robusta.webp"
  },
  {
    id: 3,
    name: "Toraja Arabica",
    desc: "Toraja arabica with low acidity, spicy aroma, and a clean aftertaste.",
    basePrice: 8.50,
    minOrder: 3,
    img: "image/roasted_coffee_bean_arabica.webp"
  },
  {
    id: 4,
    name: "Alra House Blend",
    desc: "A special arabica & robusta blend crafted by Alra Berjaya Abadi — balanced and suitable for all brewing methods.",
    basePrice: 6.50,
    minOrder: 5,
    img: "image/roasted_grounded_coffee.webp"
  }
];

let cart = [];

/* ========== HELPERS ========== */
const usd = n => "$ " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function priceOf(product, packageKey){
  return product.basePrice + packages[packageKey].add;
}

/* ========== RENDER CATALOG ========== */
function renderProducts(){
  const grid = document.getElementById("product-grid");
  grid.innerHTML = products.map(p => {
    const defaultPkg = "EXW";
    const defaultPrice = priceOf(p, defaultPkg);
    return `
    <div class="card">
      <div class="img-wrap"><img src="${p.img}" alt="${p.name}"></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>

        <div class="package-label">Select Price Term</div>
        <select class="package-select" id="pkg-${p.id}" onchange="updateCardPrice(${p.id})">
          ${Object.entries(packages).map(([key,val]) =>
            `<option value="${key}" ${key===defaultPkg?"selected":""}>${val.label}</option>`
          ).join("")}
        </select>

        <div class="price" id="price-${p.id}">${usd(defaultPrice)} <small>/kg</small></div>
        <div class="price-note" id="note-${p.id}">Price EXW (Ex Works)</div>

        <div class="min-order">Min. order: ${p.minOrder} kg</div>
        <div class="qty-control">
          <button onclick="changeQty(${p.id},-1)">−</button>
          <input type="number" id="qty-${p.id}" value="${p.minOrder}" min="${p.minOrder}" readonly>
          <button onclick="changeQty(${p.id},1)">+</button>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `;
  }).join("");
}

/* ========== UPDATE PRICE ON PACKAGE CHANGE ========== */
function updateCardPrice(id){
  const p = products.find(x => x.id === id);
  const pkgKey = document.getElementById(`pkg-${id}`).value;
  const price = priceOf(p, pkgKey);
  document.getElementById(`price-${id}`).innerHTML = `${usd(price)} <small>/kg</small>`;
  document.getElementById(`note-${id}`).textContent = `Price ${packages[pkgKey].label}`;
}

/* ========== QTY ========== */
function changeQty(id, delta){
  const p = products.find(x => x.id === id);
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) + delta;
  if(val < p.minOrder) val = p.minOrder;
  input.value = val;
}

/* ========== ADD TO CART ========== */
function addToCart(id){
  const p = products.find(x => x.id === id);
  const pkgKey = document.getElementById(`pkg-${id}`).value;
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const price = priceOf(p, pkgKey);

  const existing = cart.find(c => c.id === id && c.package === pkgKey);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      img: p.img,
      package: pkgKey,
      packageLabel: packages[pkgKey].label,
      price: price,
      qty: qty
    });
  }
  updateCart();
  openCart();
}

/* ========== UPDATE CART UI ========== */
function updateCart(){
  const itemsEl = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  countEl.textContent = cart.reduce((s,c) => s + c.qty, 0);

  if(cart.length === 0){
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    totalEl.textContent = "$ 0.00";
    checkoutBtn.disabled = true;
    return;
  }

  itemsEl.innerHTML = cart.map((c,i) => `
    <div class="cart-item">
      <img src="${c.img}" alt="${c.name}">
      <div class="info">
        <h4>${c.name}</h4>
        <span class="pkg">${c.package}</span>
        <div class="sub">${c.qty} kg × ${usd(c.price)} = <b>${usd(c.qty * c.price)}</b></div>
      </div>
      <button class="remove" onclick="removeItem(${i})">Remove</button>
    </div>
  `).join("");

  const total = cart.reduce((s,c) => s + c.qty * c.price, 0);
  totalEl.textContent = usd(total);
  checkoutBtn.disabled = false;
}

/* ========== REMOVE ITEM ========== */
function removeItem(index){
  cart.splice(index, 1);
  updateCart();
}

/* ========== OPEN / CLOSE CART ========== */
function openCart(){
  document.getElementById("cart-panel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
}
function closeCart(){
  document.getElementById("cart-panel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

/* ========== WHATSAPP CHECKOUT ========== */
function checkoutWA(){
  if(cart.length === 0) return;

  const total = cart.reduce((s,c) => s + c.qty * c.price, 0);

  let pesan = "Hello *Alra Berjaya Abadi*, I would like to place an order:\n\n";
  cart.forEach((c,i) => {
    pesan += `${i+1}. ${c.name}\n`;
    pesan += `   Price Term: ${c.packageLabel}\n`;
    pesan += `   Quantity: ${c.qty} kg\n`;
    pesan += `   Unit Price: ${usd(c.price)}/kg\n`;
    pesan += `   Subtotal: ${usd(c.qty * c.price)}\n\n`;
  });
  pesan += `━━━━━━━━━━━━━━\n`;
  pesan += `*TOTAL: ${usd(total)}*\n\n`;
  pesan += `Please confirm availability and the next steps. Thank you 🙏`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
}

/* ========== INIT ========== */
renderProducts();
updateCart();
