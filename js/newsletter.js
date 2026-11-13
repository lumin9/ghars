// القائمة البريديه
const NEWSLETTER_KEY = "ghars-subscribers";

document.getElementById("newsletterForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value.trim().toLowerCase();
    const list = JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || [];
    if(list.includes(email)){
        showToast("هذا الإيميل مشترك من قبل 🌿");
        return;
    }

    list.push(email);
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
    e.target.reset();
    showToast("تم الاشتراك! بتوصلك عروضنا أول بأول 💌");
});