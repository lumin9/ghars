const menuBtn = document.querySelector(".menu-btn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const open = document.querySelector(".navbar").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
}
