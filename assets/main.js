const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const requestedLeadTypes = {
  exclusive: "Exclusive moving leads",
  shared: "Shared moving leads",
  "live-transfer": "Live transfer leads"
};
const requestedLeadType = new URLSearchParams(window.location.search).get("lead_type");
document.querySelectorAll('form[data-netlify="true"]').forEach((form) => {
  const leadType = form.querySelector('[name="lead_type"]');
  const moveType = form.querySelector('[name="move_type"]');
  const requestedValue = Object.hasOwn(requestedLeadTypes, requestedLeadType)
    ? requestedLeadTypes[requestedLeadType]
    : null;
  if (leadType && requestedValue && [...leadType.options].some((option) => option.value === requestedValue)) {
    leadType.value = requestedValue;
  }
  const setTransferMoveType = () => {
    if (moveType) {
      const isTransfer = leadType?.value === "Live transfer leads";
      for (const option of moveType.options) {
        option.disabled = isTransfer && option.value !== "Long-distance moving leads";
      }
      if (isTransfer) moveType.value = "Long-distance moving leads";
    }
  };
  setTransferMoveType();
  leadType?.addEventListener("change", setTransferMoveType);
});

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
