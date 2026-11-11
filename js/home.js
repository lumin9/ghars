const BEST = ["monstera", "fiddle-leaf-fig", "snake-plant", "pothos", "olive-tree", "bougainvillea", "peace-lily", "gift-set"];

document.getElementById("bestSellers").innerHTML = BEST.map(id => {
  const p = PRODUCTS.find(x => x.id === id);
  const link = `pages/products.html?id=${p.id}`;
  return `
    <article class="product-card">
      <a href="${link}"><img src="images/products/${p.id}.jpg" alt="${p.name}" loading="lazy" width="400" height="400"></a>
      <div class="card-body">
        <span class="card-cat">${CATEGORY_NAMES[p.cat]}</span>
        <h3><a class="card-title" href="${link}">${p.name}</a></h3>
        <div class="card-foot">
          <strong class="price">${p.giftFee ? "<small>من</small> " : ""}${formatPrice(p.price)}</strong>
          ${p.giftFee
            ? `<a class="btn btn-small" href="${link}">اختاري النبتة</a>`
            : `<button type="button" class="btn btn-small add-btn" data-id="${p.id}">أضيفي للسلة</button>`}
        </div>
      </div>
    </article>`;
}).join("");

document.getElementById("bestSellers").addEventListener("click", e => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(btn.dataset.id);
});
