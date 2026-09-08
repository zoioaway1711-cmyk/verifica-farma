const LOCAL_ADMIN_USER_HASH =
    "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
  LOCAL_ADMIN_PASSWORD_HASH =
    "d004499ce4a898de17d6dc05dbb73221c417487e76bdae76972560b363f4ae5a";
async function digest(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
function unlockAdmin(localMode = false) {
  document.body.classList.remove("admin-locked");
  document.querySelector("#admin-login-gate").hidden = true;
  document.querySelector("#admin-user").value = "";
  document.querySelector("#admin-password").value = "";
  document.body.dataset.adminMode = localMode ? "local" : "central";
}
async function checkAdminSession() {
  if (sessionStorage.getItem("sc-local-admin-auth") === "active") {
    unlockAdmin(true);
    renderRemoteVerifications({ records: [] });
    return true;
  }
  try {
    const response = await fetch("/.netlify/functions/admin-verifications", {
      credentials: "same-origin",
    });
    if (!response.ok) return false;
    unlockAdmin();
    await renderRemoteVerifications(await response.json());
    return true;
  } catch {
    return false;
  }
}
checkAdminSession().catch(() => {});
document
  .querySelector("#admin-login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.querySelector("#admin-user").value.trim().toLowerCase(),
      password = document.querySelector("#admin-password").value.trim(),
      error = document.querySelector("#admin-login-error");
    error.textContent = "A verificar…";
    const [userHash, passwordHash] = await Promise.all([
      digest(user),
      digest(password),
    ]);
    if (
      userHash === LOCAL_ADMIN_USER_HASH &&
      passwordHash === LOCAL_ADMIN_PASSWORD_HASH
    ) {
      sessionStorage.setItem("sc-local-admin-auth", "active");
      error.textContent = "";
      unlockAdmin(true);
      renderRemoteVerifications({ records: [] });
      return;
    }
    try {
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
        return;
      }
    } catch {
      // Continua para o acesso local quando as Functions não estão disponíveis.
    }
    error.textContent = "Login ou senha incorretos.";
  });
document.querySelector("#admin-logout").addEventListener("click", async () => {
  sessionStorage.removeItem("sc-local-admin-auth");
  await fetch("/.netlify/functions/admin-verifications", {
    method: "DELETE",
    credentials: "same-origin",
  }).catch(() => {});
  location.reload();
});
const seeds = window.VF_SEEDED_PRODUCTS || [];
function loadRecords() {
  if (localStorage.getItem("vf-catalog-version") !== "catalog-200-v2") {
    localStorage.setItem("sc-admin-serials", JSON.stringify(seeds));
    localStorage.setItem("vf-catalog-version", "catalog-200-v2");
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
  verificationFilter = "",
  customerProfiles = [];
const words = {
  pt: {
    back: "Portal público",
    eyebrow: "GESTÃO DE AUTENTICIDADE",
    title: "Painel administrativo",
    intro: "200 produtos com dosagens verificadas já estão validados.",
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
    intro: "200 products with verified dosages are already validated.",
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
        `<tr><td><strong>${x.serial}</strong></td><td>${x.name}<small style="display:block;color:#718095">${x.brand ? `${x.brand} · ` : ""}${x.maker} · ${x.lot}</small></td><td><span class="status-pill ${x.status}">${x.status === "authentic" ? words[lang].validState : words[lang].invalidState}</span></td><td><div class="admin-actions"><button class="qr-action" data-qr="${x.serial}" type="button">QR Code</button><button data-serial="${x.serial}" data-state="${x.status === "authentic" ? "invalid" : "authentic"}" type="button">${x.status === "authentic" ? words[lang].invalidate : words[lang].validate}</button></div></td></tr>`,
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
const CUSTOMER_RANKS = [
  { level: 1, name: "Essencial", points: 0 },
  { level: 2, name: "Prata", points: 1000 },
  { level: 3, name: "Ouro", points: 2000 },
  { level: 4, name: "Platina", points: 3000 },
  { level: 5, name: "Diamante", points: 5000 },
];
function saveCustomers(profiles) {
  localStorage.setItem("vf-customer-registry", JSON.stringify(profiles));
}
function updateCustomer(profileId, updater) {
  const profiles = loadCustomers();
  const index = profiles.findIndex((profile) => profile.id === profileId);
  if (index < 0) return null;
  const updated = updater({ ...profiles[index] }) || profiles[index];
  updated.adminUpdatedAt = new Date().toISOString();
  profiles[index] = updated;
  saveCustomers(profiles);
  return updated;
}
function saveCustomerRewardProfile(profile) {
  const key = `vf-rewards-profile-v3-${profile.id}`;
  const saved = safeParse(localStorage.getItem(key), {
    verified: [],
    claimed: {},
    verifiedAt: {},
  });
  saved.verified = [...new Set(profile.serials || [])].filter(
    (serial) => !(profile.revokedSerials || []).includes(serial),
  );
  saved.verifiedAt = { ...(saved.verifiedAt || {}), ...(profile.verifiedAt || {}) };
  saved.claimed = saved.claimed || {};
  localStorage.setItem(key, JSON.stringify(saved));
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
function mergeCustomerProfiles() {
  const map = new Map();
  loadCustomers().forEach((profile) =>
    map.set(profile.id, {
      ...profile,
      serials: [...new Set(profile.serials || [])],
      benefits: Array.isArray(profile.benefits) ? profile.benefits : [],
      events: [],
    }),
  );
  remoteVerifications.forEach((event) => {
    const id = event.profileId || "anonymous";
    if (!map.has(id))
      map.set(id, {
        id,
        lastActive: event.activatedAt,
        serials: [],
        benefits: [],
        points: 0,
        level: 1,
        levelName: "Essencial",
        events: [],
      });
    const profile = map.get(id);
    profile.events.push(event);
    if (
      event.status === "authentic" &&
      event.serial &&
      !(profile.revokedSerials || []).includes(event.serial) &&
      !profile.serials.includes(event.serial)
    )
      profile.serials.push(event.serial);
    if (
      new Date(event.activatedAt || 0) > new Date(profile.lastActive || 0)
    )
      profile.lastActive = event.activatedAt;
  });
  return [...map.values()];
}
function productsForProfile(profile) {
  return (profile.serials || []).map((serial) => {
    const event = [...(profile.events || [])]
      .reverse()
      .find((item) => item.serial === serial);
    const catalog = records.find((item) => item.serial === serial);
    return {
      serial,
      name: event?.product || catalog?.name || "Produto não identificado",
      maker: event?.maker || catalog?.maker || "—",
      lot: event?.lot || catalog?.lot || "—",
      status: (profile.revokedSerials || []).includes(serial)
        ? "invalid"
        : event?.status || catalog?.status || "authentic",
      verifiedAt:
        event?.activatedAt ||
        profile.verifiedAt?.[serial] ||
        profile.lastActive ||
        "",
    };
  });
}
function renderCustomers() {
  const profiles = mergeCustomerProfiles().sort(
    (a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0),
  );
  customerProfiles = profiles;
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
  document.querySelector("#customers-products").textContent = new Set(
    profiles.flatMap((profile) =>
      productsForProfile(profile).map((product) => product.name),
    ),
  ).size;
  document.querySelector("#customers-activity").textContent =
    remoteVerifications.filter(
      (event) =>
        Date.now() - new Date(event.activatedAt || 0).getTime() <=
        24 * 60 * 60 * 1000,
    ).length;
  document.querySelector("#customer-search").placeholder =
    words[lang].customerSearch;
  document.querySelector("#customer-card-grid").innerHTML = rows.length
    ? rows
        .map((profile) => {
          const products = productsForProfile(profile);
          const names = [...new Set(products.map((item) => item.name))];
          const lastEvent = (profile.events || [])[0];
          return `<article class="customer-profile-card ${profile.blocked ? "customer-blocked" : ""}"><div class="customer-profile-top"><span class="customer-avatar">${escapeHtml(profile.id.slice(-2).toUpperCase())}</span><div><small>ID DO CLIENTE</small><strong>${escapeHtml(profile.id)}</strong><time datetime="${escapeHtml(profile.lastActive || "")}">${new Date(profile.lastActive || Date.now()).toLocaleString(lang === "en" ? "en-GB" : "pt-PT")}</time></div><span class="status-pill ${profile.blocked ? "invalid" : "authentic"}">${profile.blocked ? "Bloqueado" : "Ativo"}</span></div><div class="customer-profile-metrics"><span><small>Seriais</small><strong>${products.filter((item) => item.status === "authentic").length}</strong></span><span><small>Medicamentos</small><strong>${names.length}</strong></span><span><small>Rank</small><strong>${escapeHtml(profile.levelName || "Essencial")}</strong></span></div><div class="customer-medicine-tags">${names.slice(0, 3).map((name) => `<span>${escapeHtml(name)}</span>`).join("")}${names.length > 3 ? `<b>+${names.length - 3}</b>` : ""}</div><div class="customer-card-foot"><small>${escapeHtml(lastEvent?.ip || "Sem IP registado")} · ${escapeHtml(lastEvent?.metadata?.platform || "dispositivo não identificado")}</small><button type="button" data-customer-details="${escapeHtml(profile.id)}">Gerir perfil e permissões</button></div></article>`;
        })
        .join("")
    : `<div class="customer-cards-empty">${words[lang].noCustomers}</div>`;
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
function openCustomerDetail(profileId) {
  const profile = customerProfiles.find((item) => item.id === profileId);
  if (!profile) return;
  const products = productsForProfile(profile);
  const events = [...(profile.events || [])].sort(
    (a, b) => new Date(b.activatedAt || 0) - new Date(a.activatedAt || 0),
  );
  const ips = [...new Set(events.map((item) => item.ip).filter(Boolean))];
  const platforms = [
    ...new Set(
      events.map((item) => item.metadata?.platform).filter(Boolean),
    ),
  ];
  const timezones = [
    ...new Set(
      events.map((item) => item.metadata?.timezone).filter(Boolean),
    ),
  ];
  document.querySelector("#customer-detail-title").textContent =
    `Cliente ${profile.id}`;
  const rankLevel = Number(profile.rankOverride || profile.level || 1);
  const availableProducts = records
    .filter(
      (record) =>
        record.status === "authentic" &&
        !(profile.serials || []).includes(record.serial),
    )
    .slice(0, 200);
  document.querySelector("#customer-detail-content").innerHTML = `
    <section class="customer-permissions-panel">
      <div class="permissions-heading"><div><small>CONTROLO ADMINISTRATIVO</small><h3>Rank, cadastro e seriais</h3></div><span class="status-pill ${profile.blocked ? "invalid" : "authentic"}">${profile.blocked ? "Cadastro bloqueado" : "Cadastro ativo"}</span></div>
      <div class="permission-actions">
        <form id="customer-rank-form" data-profile-id="${escapeHtml(profile.id)}">
          <label for="customer-rank-select">Rank do cliente</label>
          <div><select id="customer-rank-select">${CUSTOMER_RANKS.map((rank) => `<option value="${rank.level}" ${rank.level === rankLevel ? "selected" : ""}>${rank.name} · ${rank.points.toLocaleString("pt-PT")} pts</option>`).join("")}</select><button type="submit">Aplicar rank</button></div>
        </form>
        <form id="customer-serial-form" data-profile-id="${escapeHtml(profile.id)}">
          <label for="customer-serial-select">Liberar produto para este cadastro</label>
          <div><select id="customer-serial-select" ${availableProducts.length ? "" : "disabled"}>${availableProducts.length ? availableProducts.map((record) => `<option value="${escapeHtml(record.serial)}">${escapeHtml(record.serial)} · ${escapeHtml(record.name)} · ${escapeHtml(record.maker)}</option>`).join("") : '<option>Nenhum serial disponível</option>'}</select><button type="submit" ${availableProducts.length ? "" : "disabled"}>Atribuir serial</button></div>
        </form>
        <button class="account-state-button ${profile.blocked ? "activate" : "block"}" type="button" data-account-action="${profile.blocked ? "unblock" : "block"}" data-profile-id="${escapeHtml(profile.id)}">${profile.blocked ? "Reativar cadastro" : "Bloquear cadastro"}</button>
      </div>
      <div class="admin-action-feedback" id="admin-action-feedback" aria-live="polite"></div>
    </section>
    <div class="customer-detail-summary">
      <article><small>Última atividade</small><strong>${new Date(profile.lastActive || Date.now()).toLocaleString("pt-PT")}</strong></article>
      <article><small>Seriais originais</small><strong>${products.length}</strong></article>
      <article><small>Nível e pontos</small><strong>${escapeHtml(profile.levelName || "Essencial")} · ${Number(profile.points || products.length * 100).toLocaleString("pt-PT")} pts</strong></article>
      <article><small>Benefícios ativos</small><strong>${(profile.benefits || []).length}</strong></article>
    </div>
    <section class="customer-detail-section"><div><small>MEDICAMENTOS E SERIAIS</small><h3>Produtos associados ao perfil</h3></div>
      <div class="customer-product-list">${products.length ? products.map((product) => `<article><span class="medicine-icon">Rx</span><div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.maker)} · Lote ${escapeHtml(product.lot)}</small><time datetime="${escapeHtml(product.verifiedAt)}">${product.verifiedAt ? new Date(product.verifiedAt).toLocaleString("pt-PT") : "Data indisponível"}</time></div><code>${escapeHtml(product.serial)}</code><span class="status-pill ${product.status === "authentic" ? "authentic" : "invalid"}">${product.status === "authentic" ? "Original" : "Invalidado"}</span><button class="serial-permission-button" type="button" data-serial-action="${product.status === "authentic" ? "revoke" : "restore"}" data-profile-id="${escapeHtml(profile.id)}" data-customer-serial="${escapeHtml(product.serial)}">${product.status === "authentic" ? "Invalidar neste cadastro" : "Restaurar serial"}</button></article>`).join("") : "<p>Nenhum produto associado.</p>"}</div>
    </section>
    <section class="customer-detail-section"><div><small>METADADOS DE AUDITORIA</small><h3>Acessos e dispositivo</h3></div>
      <dl class="customer-metadata-grid">
        <div><dt>Endereços IP</dt><dd>${escapeHtml(ips.join(", ") || "—")}</dd></div>
        <div><dt>Plataformas</dt><dd>${escapeHtml(platforms.join(", ") || "—")}</dd></div>
        <div><dt>Fusos horários</dt><dd>${escapeHtml(timezones.join(", ") || "—")}</dd></div>
        <div><dt>Total de eventos</dt><dd>${events.length}</dd></div>
        <div><dt>Último navegador</dt><dd>${escapeHtml(events[0]?.userAgent || "—")}</dd></div>
        <div><dt>Última origem</dt><dd>${escapeHtml(events[0]?.source || "—")} · ${escapeHtml(events[0]?.action || "—")}</dd></div>
      </dl>
    </section>
    <section class="customer-detail-section"><div><small>HISTÓRICO</small><h3>Atividade recente</h3></div>
      <div class="customer-event-list">${events.slice(0, 20).map((event) => `<article><time>${new Date(event.activatedAt).toLocaleString("pt-PT")}</time><strong>${escapeHtml(event.action || "verification")} · ${escapeHtml(event.source || "manual")}</strong><span>Serial ${escapeHtml(event.serial)} · ${escapeHtml(event.ip || "—")}</span></article>`).join("") || "<p>Nenhum evento central registado.</p>"}</div>
    </section>`;
  document.querySelector("#customer-detail-dialog").showModal();
}
document
  .querySelector("#customer-card-grid")
  .addEventListener("click", (event) => {
    const button = event.target.closest("[data-customer-details]");
    if (button) openCustomerDetail(button.dataset.customerDetails);
  });
document
  .querySelector("#close-customer-detail")
  .addEventListener("click", () =>
    document.querySelector("#customer-detail-dialog").close(),
  );
function logAdminCustomerAction(profileId, action, details = {}) {
  const audit = safeParse(localStorage.getItem("vf-admin-customer-audit"), []);
  const rows = Array.isArray(audit) ? audit : [];
  rows.unshift({ profileId, action, details, timestamp: new Date().toISOString() });
  localStorage.setItem("vf-admin-customer-audit", JSON.stringify(rows.slice(0, 500)));
}
function reopenCustomerDetail(profileId) {
  const detail = document.querySelector("#customer-detail-dialog");
  if (detail.open) detail.close();
  renderCustomers();
  openCustomerDetail(profileId);
}
const customerDetailContent = document.querySelector("#customer-detail-content");
customerDetailContent.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const profileId = form.dataset.profileId;
  if (!profileId) return;
  if (form.id === "customer-rank-form") {
    const level = Number(form.querySelector("#customer-rank-select").value);
    const rank = CUSTOMER_RANKS.find((item) => item.level === level);
    if (!rank) return;
    const updated = updateCustomer(profileId, (profile) => ({
      ...profile,
      rankOverride: rank.level,
      level: rank.level,
      levelName: rank.name,
      points: Math.max(Number(profile.points || 0), rank.points),
    }));
    if (updated) {
      saveCustomerRewardProfile(updated);
      logAdminCustomerAction(profileId, "rank_changed", { rank: rank.name });
      reopenCustomerDetail(profileId);
    }
  }
  if (form.id === "customer-serial-form") {
    const serial = form.querySelector("#customer-serial-select").value;
    const product = records.find((record) => record.serial === serial);
    if (!product) return;
    const updated = updateCustomer(profileId, (profile) => {
      const serials = [...new Set([...(profile.serials || []), serial])];
      const revokedSerials = (profile.revokedSerials || []).filter(
        (item) => item !== serial,
      );
      return {
        ...profile,
        serials,
        revokedSerials,
        verifiedAt: {
          ...(profile.verifiedAt || {}),
          [serial]: new Date().toISOString(),
        },
        points: Math.max(Number(profile.points || 0), serials.length * 100),
      };
    });
    if (updated) {
      saveCustomerRewardProfile(updated);
      logAdminCustomerAction(profileId, "serial_assigned", {
        serial,
        product: product.name,
      });
      reopenCustomerDetail(profileId);
    }
  }
});
customerDetailContent.addEventListener("click", (event) => {
  const accountButton = event.target.closest("[data-account-action]");
  if (accountButton) {
    const profileId = accountButton.dataset.profileId;
    const blocked = accountButton.dataset.accountAction === "block";
    const updated = updateCustomer(profileId, (profile) => ({
      ...profile,
      blocked,
      blockedAt: blocked ? new Date().toISOString() : null,
    }));
    if (updated) {
      logAdminCustomerAction(profileId, blocked ? "account_blocked" : "account_unblocked");
      reopenCustomerDetail(profileId);
    }
    return;
  }
  const serialButton = event.target.closest("[data-serial-action]");
  if (!serialButton) return;
  const profileId = serialButton.dataset.profileId;
  const serial = serialButton.dataset.customerSerial;
  const revoke = serialButton.dataset.serialAction === "revoke";
  const updated = updateCustomer(profileId, (profile) => {
    const revoked = new Set(profile.revokedSerials || []);
    if (revoke) revoked.add(serial);
    else revoked.delete(serial);
    return { ...profile, revokedSerials: [...revoked] };
  });
  if (updated) {
    saveCustomerRewardProfile(updated);
    logAdminCustomerAction(profileId, revoke ? "serial_revoked" : "serial_restored", { serial });
    reopenCustomerDetail(profileId);
  }
});
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
        entry.action,
        entry.source,
        entry.metadata?.platform,
        entry.metadata?.timezone,
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
            `<tr><td><time datetime="${escapeHtml(entry.activatedAt)}">${new Date(entry.activatedAt).toLocaleString(lang === "en" ? "en-GB" : "pt-PT")}</time></td><td><strong>${escapeHtml(entry.profileId || "anonymous")}</strong></td><td><strong>${escapeHtml(entry.serial)}</strong><small class="customer-date">${escapeHtml(entry.product || "—")}</small></td><td><span class="status-pill ${entry.status === "authentic" ? "authentic" : entry.status === "invalid" ? "invalid" : "warning"}">${escapeHtml(entry.status)}</span></td><td><code>${escapeHtml(entry.ip || "—")}</code><small class="customer-date">${escapeHtml(entry.country || "")}</small></td><td><strong>${escapeHtml(entry.action || "verification")} · ${escapeHtml(entry.source || "manual")}</strong><small class="customer-date">${escapeHtml(entry.metadata?.platform || "—")} · ${escapeHtml(entry.metadata?.timezone || "—")}<br>${escapeHtml(entry.userAgent || "—")}</small></td></tr>`,
        )
        .join("")
    : '<tr class="empty-row"><td colspan="6">Nenhum registo encontrado.</td></tr>';
  renderCustomers();
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

const adminSignatureVial = document.querySelector("#admin-signature-vial"),
  adminVialFlip = document.querySelector("#admin-vial-flip"),
  adminSignatureQr = document.querySelector("#admin-signature-qr");
if (window.QRCode && adminSignatureQr)
  new QRCode(adminSignatureQr, {
    text: `${location.origin}${location.pathname.replace(/admin\.html$/, "")}?serial=35172`,
    width: 150,
    height: 150,
    colorDark: "#071b42",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
adminVialFlip?.addEventListener("click", () => {
  const flipped = adminSignatureVial.classList.toggle("is-flipped");
  adminVialFlip.setAttribute("aria-pressed", String(flipped));
});
adminVialFlip?.addEventListener("pointerenter", (event) => {
  if (event.pointerType !== "mouse") return;
  adminSignatureVial.classList.add("is-flipped");
  adminVialFlip.setAttribute("aria-pressed", "true");
});
adminVialFlip?.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "mouse") return;
  adminSignatureVial.classList.remove("is-flipped");
  adminVialFlip.setAttribute("aria-pressed", "false");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("button, a, select, [role='button']")) return;
  document.body.classList.remove("ui-transitioning");
  requestAnimationFrame(() => document.body.classList.add("ui-transitioning"));
  window.setTimeout(() => document.body.classList.remove("ui-transitioning"), 520);
});

const adminReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!adminReduceMotion.matches && matchMedia("(pointer: fine)").matches) {
  document
    .querySelectorAll(".generator-card, .customer-dashboard, .admin-summary article, .customer-summary article")
    .forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const strength = card.matches("article") ? 3.2 : 1.2;
        card.style.setProperty("--depth-x", `${y * -strength}deg`);
        card.style.setProperty("--depth-y", `${x * strength}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--depth-x", "0deg");
        card.style.setProperty("--depth-y", "0deg");
      });
    });
}
