// نموذج الملاحظات
const FEEDBACK_KEY = "ghars-feedback";
let fbStars = 0;

const fbStarButton = document.querySelectorAll("#fbStars button");
fbStarButton.forEach(btn => {
    btn.addEventListener("click", () =>{
        fbStars = Number(btn.dataset.star);
        fbStarButton.forEach(b => {
            b.classList.toggle("on", Number(b.dataset.star) <= fbStars);
        });
    });
});

document.getElementById("feedbackForm").addEventListener("submit", e => {
    e.preventDefault();
    if (fbStars === 0){
        showToast("قيّمي تجربتك بالنجوم أول ⭐");
        return;
    }

    const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
    all.push({
        name: document.getElementById("fbName").value,
        email: document.getElementById("fbEmail").value,
        type: document.getElementById("fbType").value,
        stars: fbStars,
        message: document.getElementById("fbMsg").value,
        date: new Date().toLocaleDateString("ar-SA"),
    });
    localStorage.setItem(FEEDBACK_KEY,JSON.stringify(all));

    e.target.hidden = true;

    document.getElementById("feedbackDone").hidden = false;
});