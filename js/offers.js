// نسخ كود الخصم
const codeButtons = document.querySelectorAll(".offers-code");

codeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        navigator.clipboard.writeText(code);
        btn.textContent="تم النسخ";
        setTimeout(() => { btn.textContent= code; }, 1500);
    });
});

const IMG = location.pathname.includes("/pages/")?"../images/products/":"images/products/";

// المنتجات الي عليها عرض
const SALE = [
    { id:"monstera", off: 20},
    { id:"fiddle-leaf-fig", off: 15},
    { id:"snake-plant", off: 10},
    { id:"peace-lily", off: 10},
];

const saleGrid = document.getElementById("saleGrid");

SALE.forEach(s => {
    const p = PRODUCTS.find(x => x.id === s.id);
    const newPrice = Math.round(p.price * (100-s.off)/100);

    saleGrid.innerHTML += ` <article class="product-card">
    <img src="${IMG}${p.id}.jpg" alt="${p.name}">
    <div class="card-body">
        <span class="sale-badge">خصم ${s.off}%</span>
        <h3>${p.name}</h3>
        <div class="card-foot">
            <strong class="price">${formatPrice(newPrice)} <del>${formatPrice(p.price)}</del></strong>
            <button type="button" class="btn btn-small add-btn" data-id="${p.id}" data-name="${p.name}" data-price="${newPrice}">أضيفي للسلة</button>
        </div>
    </div>
    </article>`;
});

// زر الاضافه للسله بالسعر الجديد
saleGrid.addEventListener("click",e =>{
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    addItemToCart({
        id: btn.dataset.id + "-sale",
        name: btn.dataset.name + " (عرض)",
        price: Number(btn.dataset.price),
        image: `images/products/${btn.dataset.id}.jpg`,
    });
});
