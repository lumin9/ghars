const CART_KEY = "ghars-cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {  }
}

function addItemToCart(item, qty = 1) {
  const cart = getCart();
  const found = !item.message && cart.find(i => i.id === item.id && !i.message);
  if (found) found.qty += qty;
  else cart.push({ ...item, id: item.message ? `${item.id}-${Date.now()}` : item.id, qty });
  saveCart(cart);
  updateCartCount();
  showToast(`تمت إضافة ${item.name} للسلة`);
}

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (p) addItemToCart({ id: p.id, name: p.name, price: p.price, image: `images/products/${p.id}.jpg` }, qty);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  el.textContent = total;
  el.hidden = total === 0;
}

let toastTimer;
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite");
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function formatPrice(n) { return n + " ر.س"; }

document.addEventListener("DOMContentLoaded", updateCartCount);
