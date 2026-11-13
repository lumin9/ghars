// التقييمات و التعليقات
const REVIEW_KEY = "ghars-reviews";
let reviewId = null;
let pickedStars = 0;

// يجيب كل التقييمات المحفوظه بالمتصفح
function getReviews(){
    return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {};
}

function starsText(n){
    return "★".repeat(n)+"☆".repeat(5-n);
}

function renderReviews(id){
    reviewId = id;
    const list = getReviews()[id] || [];
    const avgEl = document.getElementById("ratingAvg");
    const listEl = document.getElementById("reviewList");

    if (list.length === 0){
        avgEl.textContent = "لا يوجد تعليقات سابقة، كوني أول من يقيم";
        listEl.innerHTML="";
        return;
    }

    const sum = list.reduce((total,r)=> total + r.stars, 0);
    const avg = (sum/list.length).toFixed(1);
    avgEl.innerHTML = `<span class="stars">${starsText(Math.round(avg))}</span>${avg} (${list.length} تقييم)`;

    listEl.innerHTML = list.map(r => `
        <li>
            <div class="review-head">
                <strong>${r.name}</strong>
                <span class="stars">${starsText(r.stars)}
                </span>
            </div>
            <p>${r.text}</p>
            </li>`).join("");
}

const starButton = document.querySelectorAll("#starPick button");
starButton.forEach(btn => {
    btn.addEventListener("click", () => {
        pickedStars = Number(btn.dataset.star);
        starButton.forEach(b => {
            b.classList.toggle("on",Number(b.dataset.star) <= pickedStars);

        });

    });
});

document.getElementById("reviewForm").addEventListener("submit", e => {
    e.preventDefault();
    if (pickedStars === 0){
        showToast("اختاري عدد النجوم ⭐");
        return;
    }
    const all = getReviews();
    if (!all[reviewId]) all[reviewId] = [];
    all[reviewId].push({
        name: document.getElementById("reviewName").value,
        stars: pickedStars,
        text: document.getElementById("reviewText").value,
    });
    localStorage.setItem(REVIEW_KEY,JSON.stringify(all));

    e.target.reset();
    pickedStars = 0;
    starButton.forEach(b => b.classList.remove("on"));
    renderReviews(reviewId);
    showToast("شكرًا! انضاف تقييمك 🌿");
});