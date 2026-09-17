const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle && menu) {
  const closeMenu = () => {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
