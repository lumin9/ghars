const IMG_PATH = "../images/products/";
const BUNDLE_DISCOUNT = 0.15;

const byId = id => PRODUCTS.find(p => p.id === id);
const kit = byId("care-kit");
const plants = PRODUCTS.filter(p => p.cat === "indoor" || p.cat === "outdoor");
const pots = PRODUCTS.filter(p => p.cat === "pots");

const separate = ["potting-soil", "fertilizer", "spray-bottle"].reduce((s, id) => s + byId(id).price, 0);
document.getElementById("kitPrice").textContent = formatPrice(kit.price);
document.getElementById("kitSave").textContent =
  `لو شريتيها منفصلة بتكلفك ${formatPrice(separate)}، وفي الباقة توفرين ${formatPrice(separate - kit.price)} وبطاقة التعليمات مجاناً.`;

const kitQty = document.getElementById("kitQty");
document.getElementById("kitPlus").addEventListener("click", () => { kitQty.value = Math.min(20, (+kitQty.value || 1) + 1); });
document.getElementById("kitMinus").addEventListener("click", () => { kitQty.value = Math.max(1, (+kitQty.value || 1) - 1); });
document.getElementById("kitAdd").addEventListener("click", () => {
  addToCart("care-kit", Math.min(20, Math.max(1, parseInt(kitQty.value, 10) || 1)));
});

const form = document.getElementById("builderForm");
const plantBox = document.getElementById("plantPicks");
const potBox = document.getElementById("potPicks");

function pickHTML(p, name, extra = "") {
  return `
    <label class="pick" data-cat="${p.cat}">
      <input type="radio" name="${name}" value="${p.id}">
      <span>
        <img src="${IMG_PATH}${p.id}.jpg" alt="" loading="lazy" width="200" height="200">
        <strong>${p.name}</strong>
        <small>${formatPrice(p.price)}</small>${extra}
      </span>
    </label>`;
}

plantBox.innerHTML = plants.map(p => pickHTML(p, "plant")).join("");

function renderPots(plantId) {
  const suggested = suggestPot(byId(plantId));
  potBox.innerHTML = pots.map(p => pickHTML(p, "pot", p.id === suggested ? '<em class="suggested">مقترح لنبتتك</em>' : "")).join("");
  const pick = potBox.querySelector(`input[value="${suggested}"]`);
  if (pick) pick.checked = true;
}

function selected() {
  return {
    plant: byId(form.querySelector('input[name="plant"]:checked').value),
    pot: byId(form.querySelector('input[name="pot"]:checked').value)
  };
}

function bundleTotal(plant, pot) {
  const sum = plant.price + pot.price + kit.price;
  const discount = Math.round(sum * BUNDLE_DISCOUNT);
  return { sum, discount, total: sum - discount };
}

function renderSummary() {
  const { plant, pot } = selected();
  const t = bundleTotal(plant, pot);
  const img = document.getElementById("sumImg");
  img.src = IMG_PATH + plant.id + ".jpg";
  img.alt = plant.name;
  document.getElementById("sumLines").innerHTML = `
    <li><span>${plant.name}</span><span>${formatPrice(plant.price)}</span></li>
    <li><span>${pot.name}</span><span>${formatPrice(pot.price)}</span></li>
    <li><span>${kit.name}</span><span>${formatPrice(kit.price)}</span></li>
    <li class="sum-discount"><span>خصم الباقة 15%</span><span>&minus; ${formatPrice(t.discount)}</span></li>`;
  document.getElementById("sumTotal").textContent = formatPrice(t.total);

  const p = new URLSearchParams({ plant: plant.id, pot: pot.id });
  history.replaceState(null, "", "?" + p.toString() + location.hash);
}

form.addEventListener("change", e => {
  if (e.target.name === "plant") renderPots(e.target.value);
  renderSummary();
});

document.querySelectorAll(".pick-filter .cat-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pick-filter .cat-tab").forEach(b => b.setAttribute("aria-selected", b === btn));
    plantBox.querySelectorAll(".pick").forEach(l => {
      l.hidden = btn.dataset.type !== "all" && l.dataset.cat !== btn.dataset.type;
    });
  });
});

document.getElementById("bundleAdd").addEventListener("click", () => {
  const { plant, pot } = selected();
  addItemToCart({
    id: `bundle-${plant.id}-${pot.id}`,
    name: `باقة ${plant.name} + ${pot.name} + عناية`,
    price: bundleTotal(plant, pot).total,
    image: `images/products/${plant.id}.jpg`
  });
});

const params = new URLSearchParams(location.search);
const startPlant = byId(params.get("plant")) && plants.includes(byId(params.get("plant"))) ? params.get("plant") : "pothos";
plantBox.querySelector(`input[value="${startPlant}"]`).checked = true;
renderPots(startPlant);
const startPot = params.get("pot");
if (startPot && potBox.querySelector(`input[value="${startPot}"]`)) potBox.querySelector(`input[value="${startPot}"]`).checked = true;
renderSummary();
if (params.get("plant")) {
  document.getElementById("build").scrollIntoView();
}
