function unlockAdmin() {
  document.body.classList.remove("admin-locked");
  document.querySelector("#admin-login-gate").hidden = true;
  document.querySelector("#admin-user").value = "";
  document.querySelector("#admin-password").value = "";
}
async function checkAdminSession() {
  const response = await fetch("/.netlify/functions/admin-verifications", {
    credentials: "same-origin",
  });
  if (!response.ok) return false;
  unlockAdmin();
  await renderRemoteVerifications(await response.json());
  return true;
}
checkAdminSession().catch(() => {});
document
  .querySelector("#admin-login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.querySelector("#admin-user").value.trim(),
      password = document.querySelector("#admin-password").value,
      error = document.querySelector("#admin-login-error");
    error.textContent = "A verificar…";
    const response = await fetch("/.netlify/functions/admin-verifications", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    if (response.ok) {
      error.textContent = "";
      unlockAdmin();
      await renderRemoteVerifications(await response.json());
    } else {
      error.textContent = "Login ou senha incorretos.";
    }
  });
document.querySelector("#admin-logout").addEventListener("click", async () => {
  await fetch("/.netlify/functions/admin-verifications", {
    method: "DELETE",
    credentials: "same-origin",
  }).catch(() => {});
  location.reload();
});
const seeds = window.VF_SEEDED_PRODUCTS || [];
function loadRecords() {
  if (localStorage.getItem("vf-catalog-version") !== "catalog-100-v1") {
    localStorage.setItem("sc-admin-serials", JSON.stringify(seeds));
    localStorage.setItem("vf-catalog-version", "catalog-100-v1");
    return [...seeds];
  }
  const saved = JSON.parse(localStorage.getItem("sc-admin-serials") || "[]"),
    map = new Map(saved.filter((x) => x && x.serial).map((x) => [x.serial, x]));
  seeds.forEach((x) => {
    if (!map.has(x.serial)) map.set(x.serial, x);
  });
  const rows = [...map.values()];
  localStorage.setItem("sc-admin-serials", JSON.stringify(rows));
  return rows;
}
let records = loadRecords(),
  lang = localStorage.getItem("vf-admin-language") || "pt",
  filter = "",
  customerFilter = "";
let remoteVerifications = [],
  verificationFilter = "";
const words = {
  pt: {
    back: "Portal público",
    eyebrow: "GESTÃO DE AUTENTICIDADE",
    title: "Painel administrativo",
    intro: "100 produtos com dosagens verificadas já estão validados.",
    badge: "Base local",
    newLabel: "NOVO PRODUTO",
    generateTitle: "Gerar produto e serial",
    product: "Produto",
    dose: "Dosagem",
    maker: "Farmácia / marca",
    lot: "Lote",
    length: "Tamanho do serial",
    generate: "Gerar e validar produto",
    total: "Total",
    valid: "Validados",
    invalid: "Invalidados",
    search: "Pesquisar por serial, produto ou farmácia",
    productTable: "Produto / farmácia",
    actions: "Ações",
    validState: "Validado",
    invalidState: "Invalidado",
    validate: "Validar",
    invalidate: "Invalidar",
    generated: "Produto e serial gerados e validados:",
    security:
      "As alterações são refletidas imediatamente nas verificações feitas neste navegador.",
    customersEyebrow: "CLIENTES E BENEFÍCIOS",
    customersTitle: "Dashboard de clientes",
    customersIntro:
      "Perfis ativos neste portal, respetivos seriais, níveis e benefícios.",
    refreshCustomers: "Atualizar dados",
    customersTotal: "Perfis ativos",
    customersCoupons: "Benefícios ativados",
    customersNear: "Perto do próximo prémio",
    customerSearch: "Pesquisar por ID, serial, nível ou benefício",
    customerId: "ID / última atividade",
    customerSerials: "Seriais ativos",
    customerLevel: "Pontos e nível",
    customerBenefits: "Benefícios ativos",
    customerNext: "Próximo prémio",
    noCustomers: "Nenhum perfil ativo neste navegador.",
    noBenefits: "Nenhum benefício ativado",
    rewardsComplete: "Recompensas iniciais completas",
    bottlesFor: (count, reward) =>
      `${count} frasco${count === 1 ? "" : "s"} para ${reward}`,
  },
  en: {
    back: "Public portal",
    eyebrow: "AUTHENTICITY MANAGEMENT",
    title: "Admin panel",
    intro: "100 products with verified dosages are already validated.",
    badge: "Local database",
    newLabel: "NEW PRODUCT",
    generateTitle: "Generate product and serial",
    product: "Product",
    dose: "Dosage",
    maker: "Pharmacy / brand",
    lot: "Batch",
    length: "Serial length",
    generate: "Generate and validate product",
    total: "Total",
    valid: "Validated",
    invalid: "Invalidated",
    search: "Search by serial, product or pharmacy",
    productTable: "Product / pharmacy",
    actions: "Actions",
    validState: "Validated",
    invalidState: "Invalidated",
    validate: "Validate",
    invalidate: "Invalidate",
    generated: "Product and serial generated and validated:",
    security:
      "Changes are reflected immediately in checks made in this browser.",
    customersEyebrow: "CUSTOMERS AND BENEFITS",
    customersTitle: "Customer dashboard",
    customersIntro:
      "Active profiles in this portal, with serials, levels and benefits.",
    refreshCustomers: "Refresh data",
    customersTotal: "Active profiles",
    customersCoupons: "Activated benefits",
    customersNear: "Close to next reward",
    customerSearch: "Search by ID, serial, level or benefit",
    customerId: "ID / last activity",
    customerSerials: "Active serials",
    customerLevel: "Points and level",
    customerBenefits: "Active benefits",
    customerNext: "Next reward",
    noCustomers: "No active profile in this browser.",
    noBenefits: "No activated benefits",
    rewardsComplete: "Initial rewards completed",
    bottlesFor: (count, reward) =>
      `${count} bottle${count === 1 ? "" : "s"} to ${reward}`,
  },
};
const ids = {
  back: "back-label",
  eyebrow: "admin-eyebrow",
  title: "admin-title",
  intro: "admin-intro",
  badge: "admin-badge",
  newLabel: "new-label",
  generateTitle: "generate-title",
  product: "product-label",
  dose: "dose-label",
  maker: "maker-label",
  lot: "lot-label",
  length: "length-label",
  generate: "generate-button",
  total: "total-label",
  valid: "valid-label",
  invalid: "invalid-label",
  search: "search-label",
  productTable: "product-table-label",
  actions: "actions-label",
  security: "admin-security",
  customersEyebrow: "customers-eyebrow",
  customersTitle: "customers-title",
  customersIntro: "customers-intro",
  refreshCustomers: "refresh-customers",
  customersTotal: "customers-total-label",
  customersCoupons: "customers-coupons-label",
  customersNear: "customers-near-label",
  customerSearch: "customer-search-label",
  customerId: "customer-id-heading",
  customerSerials: "customer-serials-heading",
  customerLevel: "customer-level-heading",
  customerBenefits: "customer-benefits-heading",
  customerNext: "customer-next-heading",
};
function save() {
  localStorage.setItem("sc-admin-serials", JSON.stringify(records));
  render();
  renderCustomers();
}
function setLanguage(next) {
  lang = next;
  localStorage.setItem("vf-admin-language", lang);
  document.documentElement.lang = lang === "en" ? "en-GB" : "pt-PT";
  Object.entries(ids).forEach(
    ([key, id]) => (document.getElementById(id).textContent = words[lang][key]),
  );
  document
    .querySelectorAll("[data-admin-lang]")
    .forEach((b) => b.classList.toggle("active", b.dataset.adminLang === lang));
  render();
}
function render() {
  const q = filter.toLowerCase(),
    rows = records.filter(
      (x) =>
        !q ||
        [x.serial, x.name, x.maker, x.lot].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q),
        ),
    );
  document.querySelector("#admin-total").textContent = records.length;
  document.querySelector("#admin-active").textContent = records.filter(
    (x) => x.status === "authentic",
  ).length;
  document.querySelector("#admin-blocked").textContent = records.filter(
    (x) => x.status === "invalid",
  ).length;
  document.querySelector("#admin-body").innerHTML = rows
    .map(
      (x) =>
        `<tr><td><strong>${x.serial}</strong></td><td>${x.name}<small style="display:block;color:#718095">${x.maker} · ${x.lot}</small></td><td><span class="status-pill ${x.status}">${x.status === "authentic" ? words[lang].validState : words[lang].invalidState}</span></td><td><div class="admin-actions"><button class="qr-action" data-qr="${x.serial}" type="button">QR Code</button><button data-serial="${x.serial}" data-state="${x.status === "authentic" ? "invalid" : "authentic"}" type="button">${x.status === "authentic" ? words[lang].invalidate : words[lang].validate}</button></div></td></tr>`,
    )
    .join("");
}
function safeParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}
function loadCustomers() {
  const profiles = safeParse(localStorage.getItem("vf-customer-registry"), []);
  return Array.isArray(profiles)
    ? profiles.filter((item) => item && item.id)
    : [];
}
function nextReward(serialCount) {
  if (serialCount < 3)
    return {
      remaining: 3 - serialCount,
      title: lang === "en" ? "free shipping" : "envio grátis",
    };
  if (serialCount < 5) return { remaining: 5 - serialCount, title: "50% OFF" };
  if (serialCount < 10)
    return {
      remaining: 10 - serialCount,
      title: lang === "en" ? "Buy 1, get 2" : "Pague 1, leve 2",
    };
  return null;
}
function renderCustomers() {
  const profiles = loadCustomers().sort(
    (a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0),
  );
  const q = customerFilter.trim().toLowerCase();
  const rows = profiles.filter(
    (profile) =>
      !q ||
      [
        profile.id,
        profile.levelName,
        ...(profile.serials || []),
        ...(profile.benefits || []).flatMap((benefit) => [
          benefit.title,
          benefit.code,
        ]),
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      ),
  );
  document.querySelector("#customers-total").textContent = profiles.length;
  document.querySelector("#customers-coupons").textContent = profiles.reduce(
    (total, profile) => total + (profile.benefits || []).length,
    0,
  );
  document.querySelector("#customers-near").textContent = profiles.filter(
    (profile) => {
      const next = nextReward((profile.serials || []).length);
      return next && next.remaining <= 2;
    },
  ).length;
  document.querySelector("#customer-search").placeholder =
    words[lang].customerSearch;
  document.querySelector("#customers-body").innerHTML = rows.length
    ? rows
        .map((profile) => {
          const serials = Array.isArray(profile.serials) ? profile.serials : [];
          const benefits = Array.isArray(profile.benefits)
            ? profile.benefits
            : [];
          const next = nextReward(serials.length);
          const index = Math.max(0, Number(profile.level || 1) - 1);
          const localizedLevel = (
            lang === "en"
              ? ["Essential", "Silver", "Gold", "Platinum", "Diamond"]
              : ["Essencial", "Prata", "Ouro", "Platina", "Diamante"]
          )[index];
          return `<tr><td><strong>${escapeHtml(profile.id)}</strong><small class="customer-date">${new Date(profile.lastActive || Date.now()).toLocaleString(lang === "en" ? "en-GB" : "pt-PT")}</small></td><td><div class="serial-tags">${serials
            .slice(0, 4)
            .map((serial) => `<span>${escapeHtml(serial)}</span>`)
            .join(
              "",
            )}${serials.length > 4 ? `<b>+${serials.length - 4}</b>` : ""}</div><small>${serials.length} ${lang === "en" ? "validated" : "validados"}</small></td><td><span class="customer-level-pill">${escapeHtml(localizedLevel || profile.levelName)}</span><strong class="customer-points">${Number(profile.points || 0).toLocaleString(lang === "en" ? "en-GB" : "pt-PT")} pts</strong></td><td><div class="customer-benefits-list">${benefits.length ? benefits.map((benefit) => `<span><strong>${escapeHtml(benefit.title)}</strong><code>${escapeHtml(benefit.code)}</code></span>`).join("") : `<small>${words[lang].noBenefits}</small>`}</div></td><td><span class="next-reward ${next ? "" : "complete"}">${next ? words[lang].bottlesFor(next.remaining, next.title) : words[lang].rewardsComplete}</span></td></tr>`;
        })
        .join("")
    : `<tr class="empty-row"><td colspan="5">${words[lang].noCustomers}</td></tr>`;
}
document.querySelector("#product-suggestions").innerHTML = [
  ...new Set(seeds.map((x) => x.name)),
]
  .map((x) => `<option value="${x.replace(/"/g, "&quot;")}"></option>`)
  .join("");
document
  .querySelectorAll("[data-admin-lang]")
  .forEach((b) =>
    b.addEventListener("click", () => setLanguage(b.dataset.adminLang)),
  );
document.querySelector("#admin-search").addEventListener("input", (e) => {
  filter = e.target.value;
  render();
});
document.querySelector("#customer-search").addEventListener("input", (e) => {
  customerFilter = e.target.value;
  renderCustomers();
});
document
  .querySelector("#refresh-customers")
  .addEventListener("click", renderCustomers);
window.addEventListener("storage", (event) => {
  if (event.key === "vf-customer-registry") renderCustomers();
});
function renderRemoteVerifications(payload) {
  if (payload && Array.isArray(payload.records))
    remoteVerifications = payload.records;
  const q = verificationFilter.trim().toLowerCase();
  const rows = remoteVerifications.filter(
    (entry) =>
      !q ||
      [
        entry.profileId,
        entry.serial,
        entry.product,
        entry.ip,
        entry.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      ),
  );
  document.querySelector("#verification-total").textContent =
    remoteVerifications.length;
  document.querySelector("#verification-valid").textContent =
    remoteVerifications.filter((entry) => entry.status === "authentic").length;
  document.querySelector("#verification-ips").textContent = new Set(
    remoteVerifications.map((entry) => entry.ip).filter(Boolean),
  ).size;
  document.querySelector("#verification-log-body").innerHTML = rows.length
    ? rows
        .map(
          (entry) =>
            `<tr><td><time datetime="${escapeHtml(entry.activatedAt)}">${new Date(entry.activatedAt).toLocaleString(lang === "en" ? "en-GB" : "pt-PT")}</time></td><td><strong>${escapeHtml(entry.profileId || "anonymous")}</strong></td><td><strong>${escapeHtml(entry.serial)}</strong><small class="customer-date">${escapeHtml(entry.product || "—")}</small></td><td><span class="status-pill ${entry.status === "authentic" ? "authentic" : entry.status === "invalid" ? "invalid" : "warning"}">${escapeHtml(entry.status)}</span></td><td><code>${escapeHtml(entry.ip || "—")}</code></td></tr>`,
        )
        .join("")
    : '<tr class="empty-row"><td colspan="5">Nenhum registo encontrado.</td></tr>';
}
async function loadRemoteVerifications() {
  const response = await fetch("/.netlify/functions/admin-verifications", {
    credentials: "same-origin",
  });
  if (response.status === 401) return location.reload();
  if (!response.ok) throw new Error("remote verification unavailable");
  renderRemoteVerifications(await response.json());
}
document
  .querySelector("#verification-search")
  .addEventListener("input", (event) => {
    verificationFilter = event.target.value;
    renderRemoteVerifications();
  });
document
  .querySelector("#refresh-verifications")
  .addEventListener("click", () => loadRemoteVerifications().catch(() => {}));
document.querySelector("#serial-generator").addEventListener("submit", (e) => {
  e.preventDefault();
  const length = Number(document.querySelector("#serial-length").value);
  let serial;
  do {
    serial = Array.from(
      { length },
      () => crypto.getRandomValues(new Uint32Array(1))[0] % 10,
    ).join("");
  } while (records.some((x) => x.serial === serial));
  const product = document.querySelector("#product-name").value.trim(),
    dose = document.querySelector("#product-dose").value.trim();
  const row = {
    serial,
    name: `${product} ${dose}`,
    maker: document.querySelector("#product-maker").value.trim(),
    lot: document.querySelector("#product-lot").value.trim(),
    expiry: "12/2027",
    status: "authentic",
  };
  records.unshift(row);
  save();
  const out = document.querySelector("#generated-output");
  out.className = "generated-output show";
  out.innerHTML = `${words[lang].generated}<strong>${serial}</strong>`;
  e.target.reset();
});
document.querySelector("#admin-body").addEventListener("click", (e) => {
  const qr = e.target.closest("[data-qr]");
  if (qr) {
    showQr(qr.dataset.qr);
    return;
  }
  const button = e.target.closest("[data-serial]");
  if (!button) return;
  const row = records.find((x) => x.serial === button.dataset.serial);
  if (row) {
    row.status = button.dataset.state;
    save();
  }
});
const dialog = document.querySelector("#qr-dialog"),
  canvas = document.querySelector("#qr-canvas");
let current = "";
function showQr(serial) {
  const row = records.find((x) => x.serial === serial);
  current = serial;
  document.querySelector("#qr-serial").textContent = serial;
  document.querySelector("#qr-product").textContent = row
    ? `${row.name} · ${row.maker}`
    : "";
  dialog.showModal();
  canvas.innerHTML = "";
  if (window.QRCode)
    new QRCode(canvas, {
      text: `${location.origin}${location.pathname.replace(/admin\.html$/, "")}?serial=${serial}`,
      width: 230,
      height: 230,
      colorDark: "#071b42",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H,
    });
}
document
  .querySelector("#close-qr")
  .addEventListener("click", () => dialog.close());
document.querySelector("#download-qr").addEventListener("click", () => {
  const source = canvas.querySelector("canvas"),
    image = canvas.querySelector("img"),
    link = document.createElement("a");
  link.download = `save-concept-${current}.png`;
  link.href = source ? source.toDataURL("image/png") : image?.src;
  if (link.href) link.click();
});
setLanguage(lang);
