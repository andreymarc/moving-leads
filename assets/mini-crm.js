const crmKey = "qml-mini-crm-inquiries";
const authKey = "qml-mini-crm-unlocked";
const passwordHash = "491c59b166dacef05ab5a58dc154f4f1c727857c661cf4e16f1cf2de947aef83";
const legacyPasswordHash = "9896831a4ea6e888c5dc15ea20dc5981d3101aea828f528ef489fd46a699ef55";
const auth = document.querySelector("#crm-auth");
const authForm = document.querySelector("#crm-auth-form");
const authMessage = document.querySelector("#crm-auth-message");
const passwordInput = document.querySelector("#crm-password");
const crmShell = document.querySelector("#crm-shell");
const form = document.querySelector("#crm-form");
const list = document.querySelector("#crm-list");
const stats = document.querySelector("#crm-stats");
const search = document.querySelector("#crm-search");
const filter = document.querySelector("#crm-filter");

const fields = {
  id: document.querySelector("#crm-id"),
  company: document.querySelector("#crm-company"),
  name: document.querySelector("#crm-name"),
  email: document.querySelector("#crm-email"),
  phone: document.querySelector("#crm-phone"),
  status: document.querySelector("#crm-status"),
  leadType: document.querySelector("#crm-lead-type"),
  markets: document.querySelector("#crm-markets"),
  followUp: document.querySelector("#crm-follow-up"),
  notes: document.querySelector("#crm-notes")
};

const load = () => JSON.parse(localStorage.getItem(crmKey) || "[]");
const save = (items) => localStorage.setItem(crmKey, JSON.stringify(items));
const clean = (value) => String(value || "").trim();
const leadTypeOptions = [
  "Exclusive moving leads",
  "Shared moving leads",
  "Both exclusive and shared",
  "Live transfer leads",
  "CRM setup"
];
const coverageOptions = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC"
];
const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
};
const parseList = (value) => clean(value).split(",").map((item) => clean(item)).filter(Boolean);
const renderOptions = (options, selected) => options
  .map((option) => `<option${parseList(selected).includes(option) || option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`)
  .join("");
const selectedValues = (control) => {
  if (control.selectedOptions) return Array.from(control.selectedOptions).map((option) => option.value).join(", ");
  return Array.from(control.querySelectorAll(".is-selected")).map((button) => button.dataset.state).join(", ");
};
const renderStateButtons = (value = "", id = "") => {
  const selected = parseList(value);
  return coverageOptions.map((state) => {
    const active = selected.includes(state);
    const attrs = id ? ` data-update="${id}" data-field="markets"` : "";
    return `<button type="button" class="state-chip${active ? " is-selected" : ""}" data-state="${state}" aria-pressed="${active}"${attrs}>${state}</button>`;
  }).join("");
};
const setStateButtons = (control, value) => {
  const selected = parseList(value);
  control.querySelectorAll("[data-state]").forEach((button) => {
    const active = selected.includes(button.dataset.state);
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

const hashPassword = async (password) => {
  if (!crypto.subtle) return password;
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const showCrm = () => {
  auth.hidden = true;
  crmShell.hidden = false;
  sessionStorage.setItem(authKey, "true");
  render();
};

const lockCrm = () => {
  sessionStorage.removeItem(authKey);
  crmShell.hidden = true;
  auth.hidden = false;
  passwordInput.value = "";
  passwordInput.focus();
};

const statusClass = (status) => `status-${status.toLowerCase().replaceAll(" ", "-")}`;

const escapeHtml = (value) => clean(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const resetForm = () => {
  form.reset();
  fields.id.value = "";
  fields.status.value = "New";
  setStateButtons(fields.markets, "");
};

const getFiltered = () => {
  const term = clean(search.value).toLowerCase();
  const status = filter.value;
  return load().filter((item) => {
    const noteText = (item.noteHistory || []).map((note) => note.text).join(" ");
    const haystack = [item.company, item.name, item.email, item.phone, item.markets, item.leadType, item.notes, noteText].join(" ").toLowerCase();
    return (!term || haystack.includes(term)) && (!status || item.status === status);
  });
};

const renderStats = (items) => {
  const all = load();
  const counts = all.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  stats.innerHTML = [
    ["Total", all.length],
    ["New", counts.New || 0],
    ["Qualified", counts.Qualified || 0],
    ["Won", counts.Won || 0]
  ].map(([label, value]) => `<div class="crm-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
};

const render = () => {
  if (crmShell.hidden) return;
  const items = getFiltered();
  renderStats(items);
  if (!items.length) {
    list.innerHTML = `<div class="card"><h3>No inquiries found</h3><p>Add a new inquiry or adjust the filters.</p></div>`;
    return;
  }
  list.innerHTML = items.map((item) => `
    <article class="crm-item card">
      <div class="crm-item-head">
        <div>
          <h3>${escapeHtml(item.company)}</h3>
          <p>${escapeHtml(item.name)} ${item.phone ? `| ${escapeHtml(item.phone)}` : ""}</p>
        </div>
        <span class="crm-badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      <div class="crm-meta">
        <label class="crm-inline-control">Lead type <select data-update="${item.id}" data-field="leadType">${renderOptions(leadTypeOptions, item.leadType)}</select></label>
        <div class="crm-inline-control crm-coverage-control"><span>Coverage</span><span class="crm-state-grid crm-card-states">${renderStateButtons(item.markets, item.id)}</span></div>
        <label class="crm-inline-control">Follow-up <input data-update="${item.id}" data-field="followUp" type="date" value="${escapeHtml(item.followUp)}"></label>
      </div>
      <p>${escapeHtml(item.notes || "No notes yet.")}</p>
      <div class="crm-note-history">
        <h4>Notes</h4>
        ${(item.noteHistory || []).length
          ? item.noteHistory.map((note) => `<div class="crm-note"><strong>${escapeHtml(formatDateTime(note.createdAt))}</strong><p>${escapeHtml(note.text)}</p></div>`).join("")
          : `<p class="muted">No follow-up notes yet.</p>`}
      </div>
      <form class="crm-note-form" data-note-form="${item.id}">
        <label>Add note <textarea name="note"></textarea></label>
        <button type="submit">Add Note</button>
      </form>
      <div class="crm-actions">
        ${item.email ? `<a class="button secondary" href="mailto:${escapeHtml(item.email)}">Email</a>` : ""}
        ${item.phone ? `<a class="button secondary" href="tel:${escapeHtml(item.phone)}">Call</a><a class="button secondary" href="sms:${escapeHtml(item.phone)}">Text</a>` : ""}
        <button type="button" data-edit="${item.id}">Edit</button>
        <button class="secondary" type="button" data-delete="${item.id}">Delete</button>
      </div>
    </article>
  `).join("");
};

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authMessage.textContent = "";
  const hashed = await hashPassword(passwordInput.value);
  if (hashed === passwordHash || hashed === legacyPasswordHash) {
    showCrm();
    return;
  }
  authMessage.textContent = "Wrong password. Try again.";
  passwordInput.select();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const items = load();
  const id = fields.id.value || crypto.randomUUID();
  const record = {
    id,
    company: clean(fields.company.value),
    name: clean(fields.name.value),
    email: clean(fields.email.value),
    phone: clean(fields.phone.value),
    status: fields.status.value,
    leadType: fields.leadType.value,
    markets: selectedValues(fields.markets),
    followUp: fields.followUp.value,
    notes: clean(fields.notes.value),
    updatedAt: new Date().toISOString()
  };
  const next = items.some((item) => item.id === id)
    ? items.map((item) => item.id === id ? record : item)
    : [record, ...items];
  save(next);
  resetForm();
  render();
});

list.addEventListener("click", (event) => {
  const stateButton = event.target.closest("[data-state]");
  if (stateButton) {
    stateButton.classList.toggle("is-selected");
    stateButton.setAttribute("aria-pressed", String(stateButton.classList.contains("is-selected")));
    const id = stateButton.dataset.update;
    if (id) {
      const group = stateButton.closest(".crm-state-grid");
      save(load().map((item) => item.id === id ? {
        ...item,
        markets: selectedValues(group),
        updatedAt: new Date().toISOString()
      } : item));
      render();
    }
    return;
  }
  const editId = event.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = event.target.closest("[data-delete]")?.dataset.delete;
  if (editId) {
    const item = load().find((entry) => entry.id === editId);
    if (!item) return;
    Object.keys(fields).forEach((key) => {
      if (!fields[key]) return;
      if (key === "markets") {
        setStateButtons(fields[key], item[key] || "");
        return;
      }
      fields[key].value = item[key] || "";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (deleteId && confirm("Delete this inquiry?")) {
    save(load().filter((item) => item.id !== deleteId));
    render();
  }
});

list.addEventListener("change", (event) => {
  const field = event.target.closest("[data-update]");
  if (!field) return;
  const id = field.dataset.update;
  const key = field.dataset.field;
  const next = load().map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      [key]: field.multiple ? selectedValues(field) : field.value,
      updatedAt: new Date().toISOString()
    };
  });
  save(next);
  render();
});

list.addEventListener("submit", (event) => {
  const noteForm = event.target.closest("[data-note-form]");
  if (!noteForm) return;
  event.preventDefault();
  const id = noteForm.dataset.noteForm;
  const noteField = noteForm.querySelector("textarea");
  const text = clean(noteField.value);
  if (!text) return;
  const next = load().map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      noteHistory: [{ text, createdAt: new Date().toISOString() }, ...(item.noteHistory || [])],
      updatedAt: new Date().toISOString()
    };
  });
  save(next);
  noteField.value = "";
  render();
});

document.querySelector("#reset-crm-form").addEventListener("click", resetForm);
document.querySelector("#lock-crm").addEventListener("click", lockCrm);
fields.markets.addEventListener("click", (event) => {
  const stateButton = event.target.closest("[data-state]");
  if (!stateButton) return;
  stateButton.classList.toggle("is-selected");
  stateButton.setAttribute("aria-pressed", String(stateButton.classList.contains("is-selected")));
});
search.addEventListener("input", render);
filter.addEventListener("change", render);

document.querySelector("#clear-crm").addEventListener("click", () => {
  if (confirm("Clear every inquiry from this browser? Export CSV first if you need a backup.")) {
    save([]);
    resetForm();
    render();
  }
});

document.querySelector("#export-crm").addEventListener("click", () => {
  const rows = load();
  const headers = ["company", "name", "email", "phone", "status", "leadType", "markets", "followUp", "notes", "updatedAt"];
  const rowsForExport = rows.map((row) => ({
    ...row,
    notes: [row.notes, ...(row.noteHistory || []).map((note) => `${formatDateTime(note.createdAt)} - ${note.text}`)].filter(Boolean).join(" | ")
  }));
  const csv = [
    headers.join(","),
    ...rowsForExport.map((row) => headers.map((key) => `"${String(row[key] || "").replaceAll('"', '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qml-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

fields.markets.innerHTML = renderStateButtons("");

if (sessionStorage.getItem(authKey) === "true") {
  showCrm();
} else {
  lockCrm();
}
