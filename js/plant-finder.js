const IMG_PATH = "../images/products/";
const finderForm = document.getElementById("finderForm");

const PLACE_TEXT = { inside: "داخل البيت", outside: "خارج البيت" };
const LIGHT_TEXT = { low: "إضاءة قليلة", medium: "إضاءة متوسطة", high: "إضاءة عالية" };
const SPACE_TEXT = { small: "مساحة صغيرة", medium: "مساحة متوسطة", large: "مساحة كبيرة" };

const REASONS = {
  place: { indoor: "نبتة داخلية تتحمل جو البيت والمكيف", outdoor: "تتحمل حر وشمس الرياض برا البيت" },
  light: {
    low: "تعيش في الإضاءة القليلة بعيد عن النافذة",
    medium: "تحب الضوء غير المباشر قرب النافذة",
    high: "تحتاج شمس قوية، ومكانك فيه شمس مباشرة",
    lowInMedium: "تتحمل الإضاءة القليلة، فقرب النافذة يكون مريح لها"
  },
  size: { small: "حجمها صغير يناسب المكتب أو الرف", medium: "حجمها متوسط يناسب ركن الغرفة", large: "حجمها كبير يملأ الصالة أو الحديقة" }
};

function getAnswers() {
  const data = new FormData(finderForm);
  return { place: data.get("place"), light: data.get("light"), size: data.get("size") };
}

function checkPlant(p, a) {
  const reasons = [];
  let lightScore = 0;

  if (a.place) {
    const want = a.place === "inside" ? "indoor" : "outdoor";
    if (p.cat !== want) return null;
    reasons.push(REASONS.place[p.cat]);
  }

  if (a.light) {
    if (p.light === a.light) { reasons.push(REASONS.light[a.light]); lightScore = 2; }
    else if (a.light === "medium" && p.light === "low") { reasons.push(REASONS.light.lowInMedium); lightScore = 1; }
    else return null;
  }

  let sizeOk = true;
  if (a.size) {
    if (p.size === a.size) reasons.push(REASONS.size[p.size]);
    else sizeOk = false;
  }

  return { plant: p, reasons, sizeOk, lightScore };
}

function cardHTML(r, a) {
  const p = r.plant;
  const pot = PRODUCTS.find(x => x.id === suggestPot(p));
  const reasons = r.reasons.map(t => `<li>${t}</li>`).join("");
  const note = r.sizeOk ? "" :
    `<li class="diff">حجمها ${SIZE_NAMES[p.size]}، وأنتِ اخترتي ${SPACE_TEXT[a.size]}</li>`;
  return `
    <article class="finder-card">
      <a href="products.html?id=${p.id}" class="finder-img"><img src="${IMG_PATH}${p.id}.jpg" alt="${p.name}" loading="lazy" width="400" height="400"></a>
      <div class="finder-body">
        <div class="finder-top">
          <h3><a href="products.html?id=${p.id}">${p.name}</a></h3>
          <strong class="price">${formatPrice(p.price)}</strong>
        </div>
        <ul class="why-list">${reasons}${note}</ul>
        <p class="care-tip">${p.care[0]}</p>
        <p class="pot-tip">أصيص مقترح: <a href="products.html?id=${pot.id}">${pot.name}</a> (${formatPrice(pot.price)})</p>
        <div class="finder-actions">
          <button type="button" class="btn btn-small add-btn" data-id="${p.id}">أضيفي للسلة</button>
          <a href="care-kit.html?plant=${p.id}&pot=${pot.id}" class="btn btn-small btn-outline">ضمن باقة</a>
        </div>
      </div>
    </article>`;
}

function render() {
  const a = getAnswers();
  const answered = Object.values(a).filter(Boolean).length;

  document.getElementById("finderStart").hidden = answered > 0;
  document.getElementById("finderResults").hidden = answered === 0;
  writeUrl(a);
  if (!answered) return;

  const chips = [];
  if (a.place) chips.push(PLACE_TEXT[a.place]);
  if (a.light) chips.push(LIGHT_TEXT[a.light]);
  if (a.size) chips.push(SPACE_TEXT[a.size]);
  document.getElementById("answers").innerHTML =
    `<span>اخترتي:</span>` + chips.map(c => `<span class="answer-chip">${c}</span>`).join("");

  const plants = PRODUCTS.filter(p => p.cat === "indoor" || p.cat === "outdoor");
  const checked = plants.map(p => checkPlant(p, a)).filter(Boolean);
  const matches = checked.filter(r => r.sizeOk).sort((x, y) => y.lightScore - x.lightScore);
  const near = checked.filter(r => !r.sizeOk);

  document.getElementById("matchTitle").textContent =
    matches.length ? `تناسب مكانك تماماً (${matches.length})` : "تناسب مكانك تماماً";
  document.getElementById("matchGrid").innerHTML = matches.map(r => cardHTML(r, a)).join("");
  const noMatch = document.getElementById("noMatch");
  noMatch.hidden = matches.length > 0;
  if (a.place === "outside" && a.light && a.light !== "high")
    noMatch.textContent = "النباتات الخارجية تحتاج شمس مباشرة. جربي «إضاءة عالية»، أو اختاري «داخل البيت» لو المكان مظلل.";
  else if (near.length)
    noMatch.textContent = "ما فيه نبتة تطابق كل اختياراتك، شوفي الخيارات القريبة تحت أو غيري إجابة.";
  else
    noMatch.textContent = "ما فيه نبتة تطابق اختياراتك، جربي تغيرين إجابة وحدة.";

  const showNear = near.length > 0 && matches.length < 4;
  document.getElementById("nearBox").hidden = !showNear;
  document.getElementById("nearGrid").innerHTML = showNear ? near.map(r => cardHTML(r, a)).join("") : "";
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  ["place", "light", "size"].forEach(name => {
    const v = params.get(name);
    const input = v && finderForm.querySelector(`input[name="${name}"][value="${v}"]`);
    if (input) input.checked = true;
  });
}
function writeUrl(a) {
  const p = new URLSearchParams();
  Object.entries(a).forEach(([k, v]) => { if (v) p.set(k, v); });
  const qs = p.toString();
  history.replaceState(null, "", qs ? "?" + qs : location.pathname);
}

finderForm.addEventListener("change", render);
finderForm.addEventListener("reset", () => setTimeout(render));
finderForm.addEventListener("submit", e => {
  e.preventDefault();
  render();
  const results = document.getElementById("results");
  results.scrollIntoView({ behavior: "smooth" });
  results.focus({ preventScroll: true });
});
document.getElementById("results").addEventListener("click", e => {
  const add = e.target.closest(".add-btn");
  if (add) addToCart(add.dataset.id);
});

readUrl();
render();
