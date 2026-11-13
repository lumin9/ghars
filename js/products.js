const IMG_PATH = "../images/products/";

const grid = document.getElementById("grid");
const form = document.getElementById("filterForm");
const searchInput = document.getElementById("search");
const minInput = document.getElementById("minPrice");
const maxInput = document.getElementById("maxPrice");
const sortSelect = document.getElementById("sort");
const countText = document.getElementById("resultCount");
const emptyBox = document.getElementById("empty");
const pageTitle = document.getElementById("pageTitle");
const tabs = document.querySelectorAll(".cat-tab");

let currentCat = "all";

function normalize(text) {
  return String(text).toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "").trim();
}

function checkedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
}

function readUrl() {
  const p = new URLSearchParams(location.search);
  const placeMap = { inside: "indoor", outside: "outdoor" };
  currentCat = p.get("cat") || placeMap[p.get("place")] || "all";
  if (!CATEGORY_NAMES[currentCat]) currentCat = "all";

  searchInput.value = p.get("q") || "";
  minInput.value = p.get("min") || "";
  maxInput.value = p.get("max") || "";
  sortSelect.value = p.get("sort") || "default";

  ["light", "size"].forEach(name => {
    const values = (p.get(name) || "").split(",");
    form.querySelectorAll(`input[name="${name}"]`).forEach(i => { i.checked = values.includes(i.value); });
  });
  return p.get("id");
}

function writeUrl() {
  const p = new URLSearchParams();
  if (currentCat !== "all") p.set("cat", currentCat);
  if (searchInput.value.trim()) p.set("q", searchInput.value.trim());
  if (minInput.value) p.set("min", minInput.value);
  if (maxInput.value) p.set("max", maxInput.value);
  const light = checkedValues("light"), size = checkedValues("size");
  if (light.length) p.set("light", light.join(","));
  if (size.length) p.set("size", size.join(","));
  if (sortSelect.value !== "default") p.set("sort", sortSelect.value);
  const qs = p.toString();
  history.replaceState(null, "", qs ? "?" + qs : location.pathname);
}

function getFiltered() {
  const q = normalize(searchInput.value);
  const min = parseFloat(minInput.value) || 0;
  const max = parseFloat(maxInput.value) || Infinity;
  const lights = checkedValues("light");
  const sizes = checkedValues("size");

  let list = PRODUCTS.filter(p => {
    if (currentCat !== "all" && p.cat !== currentCat) return false;
    if (p.price < min || p.price > max) return false;
    if (lights.length && !lights.includes(p.light)) return false;
    if (sizes.length && !sizes.includes(p.size)) return false;
    if (q) {
      const hay = normalize([p.name, p.en, p.desc, CATEGORY_NAMES[p.cat]].join(" "));
      if (!q.split(/\s+/).every(word => hay.includes(word))) return false;
    }
    return true;
  });

  const s = sortSelect.value;
  if (s === "price-asc") list.sort((a, b) => a.price - b.price);
  if (s === "price-desc") list.sort((a, b) => b.price - a.price);
  if (s === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  return list;
}

function cardHTML(p) {
  const tags = [];
  if (p.light) tags.push(`<span class="tag tag-light-${p.light}">${LIGHT_NAMES[p.light]}</span>`);
  tags.push(`<span class="tag">${SIZE_NAMES[p.size]}</span>`);
  return `
    <article class="product-card">
      <button type="button" class="card-open" data-id="${p.id}" aria-label="تفاصيل ${p.name}">
        <img src="${IMG_PATH}${p.id}.jpg" alt="${p.name}" loading="lazy" width="400" height="400">
      </button>
      <div class="card-body">
        <span class="card-cat">${CATEGORY_NAMES[p.cat]}</span>
        <h3><button type="button" class="card-open card-title" data-id="${p.id}">${p.name}</button></h3>
        <div class="tags">${tags.join("")}</div>
        <div class="card-foot">
          <strong class="price">${p.giftFee ? '<small>من</small> ' : ""}${formatPrice(p.price)}</strong>
          ${p.giftFee
            ? `<button type="button" class="btn btn-small gift-choose" data-id="${p.id}">اختاري النبتة</button>`
            : `<button type="button" class="btn btn-small add-btn" data-id="${p.id}">أضيفي للسلة</button>`}
        </div>
      </div>
    </article>`;
}

function render() {
  const list = getFiltered();
  grid.innerHTML = list.map(cardHTML).join("");
  emptyBox.hidden = list.length > 0;
  countText.textContent = list.length === 1 ? "منتج واحد" : `${list.length} منتج`;

  pageTitle.textContent = currentCat === "all" ? "كل المنتجات" : CATEGORY_NAMES[currentCat];
  document.title = `${pageTitle.textContent} | غرس`;
  tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.cat === currentCat));
  writeUrl();
}

const dialog = document.getElementById("productDialog");
const qtyInput = document.getElementById("qty");
let openId = null;

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  openId = id;
  document.getElementById("pdImg").src = IMG_PATH + p.id + ".jpg";
  document.getElementById("pdImg").alt = p.name;
  document.getElementById("pdCat").textContent = CATEGORY_NAMES[p.cat];
  document.getElementById("pdName").textContent = p.name;
  document.getElementById("pdPrice").textContent = formatPrice(p.price);
  const giftPick = document.getElementById("giftPick");
  giftPick.hidden = !p.giftFee;
  if (p.giftFee) {
    document.getElementById("giftPlants").innerHTML = GIFT_PLANTS.map(g => `
      <label class="pick">
        <input type="radio" name="giftPlant" value="${g.id}"${g.id === "pothos" ? " checked" : ""}>
        <span><img src="${IMG_PATH}${g.id}.jpg" alt="" loading="lazy" width="120" height="120"><strong>${g.name}</strong><small>+${g.price}</small></span>
      </label>`).join("");
    updateGiftPrice();
  }
  document.getElementById("pdDesc").textContent = p.desc;

  const specs = [`<li><span>الحجم</span>${SIZE_NAMES[p.size]}</li>`];
  if (p.light) specs.unshift(`<li><span>الإضاءة</span>${LIGHT_NAMES[p.light].replace("إضاءة ", "")}</li>`);
  const places = { indoor: "داخل البيت", outdoor: "خارج البيت", pots: "داخلي وخارجي" };
  if (places[p.cat]) specs.push(`<li><span>المكان</span>${places[p.cat]}</li>`);
  document.getElementById("pdSpecs").innerHTML = specs.join("");

  const isPlant = p.cat === "indoor" || p.cat === "outdoor";
  document.getElementById("pdCareTitle").textContent = isPlant ? "العناية" : "التفاصيل";
  document.getElementById("pdCare").innerHTML = p.care.map(c => `<li>${c}</li>`).join("");
  document.getElementById("pdLink").hidden = !p.kit;
  document.getElementById("cardMsg").hidden = !p.hasCard;
  ["msgTo", "msgFrom", "msgText"].forEach(id => { document.getElementById(id).value = ""; });
  updatePreview();
  qtyInput.value = 1;

  renderReviews(id);
  dialog.showModal();
  const p2 = new URLSearchParams(location.search); p2.set("id", id);
  history.replaceState(null, "", "?" + p2.toString());
}

function selectedGiftPlant() {
  const input = document.querySelector('input[name="giftPlant"]:checked');
  return input && PRODUCTS.find(x => x.id === input.value);
}

function updateGiftPrice() {
  const p = PRODUCTS.find(x => x.id === openId);
  const plant = selectedGiftPlant();
  document.getElementById("pdPrice").textContent = formatPrice(p.giftFee + plant.price);
  document.getElementById("giftNote").textContent = `${plant.name} ${formatPrice(plant.price)} + ${p.giftLabel} ${formatPrice(p.giftFee)}`;
}

document.getElementById("giftPlants").addEventListener("change", updateGiftPrice);

function updatePreview() {
  const to = document.getElementById("msgTo").value.trim();
  const from = document.getElementById("msgFrom").value.trim();
  const text = document.getElementById("msgText").value.trim();
  document.getElementById("pvTo").textContent = `إلى: ${to || "..."}`;
  document.getElementById("pvText").textContent = text || "رسالتك تظهر هنا";
  document.getElementById("pvFrom").textContent = `من: ${from || "..."}`;
  document.getElementById("msgCount").textContent = `${document.getElementById("msgText").value.length} / 150`;
}

function getMessage() {
  const msg = {
    to: document.getElementById("msgTo").value.trim(),
    from: document.getElementById("msgFrom").value.trim(),
    text: document.getElementById("msgText").value.trim()
  };
  return msg.to || msg.from || msg.text ? msg : null;
}

document.getElementById("cardMsg").addEventListener("input", updatePreview);

function closeProduct() {
  dialog.close();
}
dialog.addEventListener("close", () => { openId = null; writeUrl(); });
dialog.addEventListener("click", e => { if (e.target === dialog) closeProduct(); });
document.getElementById("dialogClose").addEventListener("click", closeProduct);

document.getElementById("qtyPlus").addEventListener("click", () => { qtyInput.value = Math.min(20, (+qtyInput.value || 1) + 1); });
document.getElementById("qtyMinus").addEventListener("click", () => { qtyInput.value = Math.max(1, (+qtyInput.value || 1) - 1); });
document.getElementById("pdAdd").addEventListener("click", () => {
  const qty = Math.min(20, Math.max(1, parseInt(qtyInput.value, 10) || 1));
  const p = PRODUCTS.find(x => x.id === openId);
  const item = { id: p.id, name: p.name, price: p.price, image: `images/products/${p.id}.jpg` };
  if (p.giftFee) {
    const plant = selectedGiftPlant();
    item.id = `${p.id}-${plant.id}`;
    item.name = `${p.name} (${plant.name})`;
    item.price = p.giftFee + plant.price;
  }
  const message = p.hasCard && getMessage();
  if (message) item.message = message;
  addItemToCart(item, qty);
  closeProduct();
});

grid.addEventListener("click", e => {
  const add = e.target.closest(".add-btn");
  if (add) { addToCart(add.dataset.id); return; }
  const open = e.target.closest(".card-open, .gift-choose");
  if (open) openProduct(open.dataset.id);
});

tabs.forEach(t => t.addEventListener("click", () => { currentCat = t.dataset.cat; render(); }));
form.addEventListener("input", render);
form.addEventListener("submit", e => { e.preventDefault(); render(); });
form.addEventListener("reset", () => setTimeout(render));
sortSelect.addEventListener("change", render);
document.getElementById("emptyReset").addEventListener("click", () => { form.reset(); currentCat = "all"; });

const filterToggle = document.getElementById("filterToggle");
filterToggle.addEventListener("click", () => {
  const open = document.querySelector(".filters").classList.toggle("open");
  filterToggle.setAttribute("aria-expanded", open);
});

const startId = readUrl();
render();
updateCartCount();
if (startId) openProduct(startId);
