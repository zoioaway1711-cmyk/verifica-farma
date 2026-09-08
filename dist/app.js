const seeded = window.VF_SEEDED_PRODUCTS || [];
function safeParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function loadRecords() {
  if (localStorage.getItem("vf-catalog-version") !== "catalog-200-v2") {
    localStorage.setItem("sc-admin-serials", JSON.stringify(seeded));
    localStorage.setItem("vf-catalog-version", "catalog-200-v2");
    return [...seeded];
  }
  const saved = safeParse(localStorage.getItem("sc-admin-serials"), []),
    map = new Map(saved.filter((x) => x?.serial).map((x) => [x.serial, x]));
  seeded.forEach((x) => {
    if (!map.has(x.serial)) map.set(x.serial, x);
  });
  const rows = [...map.values()];
  localStorage.setItem("sc-admin-serials", JSON.stringify(rows));
  return rows;
}
let records = loadRecords(),
  language = localStorage.getItem("vf-language") || "pt",
  history = safeParse(localStorage.getItem("vf-history"), []),
  session = localStorage.getItem("vf-user-session") || "",
  scanMode = "verify";
const input = document.querySelector("#serial"),
  loginInput = document.querySelector("#login-serial"),
  count = document.querySelector("#digit-count"),
  loginCount = document.querySelector("#login-count"),
  result = document.querySelector("#result"),
  historyBody = document.querySelector("#history-body");
const t = {
  pt: {
    locale: "pt-PT",
    navVerify: "Verificar",
    navHistory: "Histórico",
    navAdmin: "Painel administrativo",
    install: "Instalar app",
    heroTitle: "O seu produto.<br><em>A sua segurança.</em>",
    heroText:
      "Valide novos produtos e acumule bónus na sua conta Save Concept.",
    verifyTitle: "Verifique o seu produto",
    verifyHint:
      "Introduza o serial de 5, 6 ou 8 números indicado no selo de segurança.",
    serialLabel: "Número de série",
    serialHelp: "Apenas números: exatamente 5, 6 ou 8 dígitos.",
    checkSerial: "Consultar serial",
    scanQr: "Ler QR Code",
    share: "Partilhar ligação de convite",
    recent: "CONSULTAS RECENTES",
    historyTitle: "Histórico de verificações",
    clearHistory: "Limpar histórico",
    empty: "As suas consultas aparecerão aqui.",
    valid: "Produto original e validado",
    missing: "Serial não encontrado",
    blocked: "QR Code invalidado",
    invalid: "Introduza exatamente 5, 6 ou 8 números.",
    batch: "Lote",
    expiry: "Validade",
    loginError: "Este serial não corresponde a um produto validado.",
    duplicate: "Este serial já foi contabilizado nos seus bónus.",
    added: "Serial adicionado ao seu progresso.",
    remaining: (n) =>
      `Faltam ${n} seriais diferentes para desbloquear o cupão de 50%.`,
    ready: "O cupão de 50% já está disponível para resgate.",
    redeem: "Resgatar",
    claimed: "Resgatado",
  },
  en: {
    locale: "en-GB",
    navVerify: "Verify",
    navHistory: "History",
    navAdmin: "Admin panel",
    install: "Install app",
    heroTitle: "Your product.<br><em>Your rewards.</em>",
    heroText:
      "Validate new products and earn rewards in your Save Concept account.",
    verifyTitle: "Verify your product",
    verifyHint:
      "Enter the 5-, 6- or 8-digit serial shown on the security seal.",
    serialLabel: "Serial number",
    serialHelp: "Numbers only: exactly 5, 6 or 8 digits.",
    checkSerial: "Check serial",
    scanQr: "Scan QR Code",
    share: "Share invitation link",
    recent: "RECENT CHECKS",
    historyTitle: "Verification history",
    clearHistory: "Clear history",
    empty: "Your checks will appear here.",
    valid: "Genuine and validated product",
    missing: "Serial not found",
    blocked: "QR Code invalidated",
    invalid: "Enter exactly 5, 6 or 8 digits.",
    batch: "Batch",
    expiry: "Expiry",
    loginError: "This serial does not belong to a validated product.",
    duplicate: "This serial has already counted towards your rewards.",
    added: "Serial added to your progress.",
    remaining: (n) => `${n} different serials left to unlock the 50% coupon.`,
    ready: "Your 50% coupon is ready to redeem.",
    redeem: "Redeem",
    claimed: "Claimed",
  },
  es: {
    locale: "es-PY",
    navVerify: "Verificar",
    navHistory: "Historial",
    navAdmin: "Panel administrativo",
    install: "Instalar app",
    heroTitle: "Tu producto.<br><em>Tus beneficios.</em>",
    heroText:
      "Valida nuevos productos y acumula beneficios en tu cuenta Save Concept.",
    verifyTitle: "Verifica tu producto",
    verifyHint: "Ingresa el serial de 5, 6 u 8 números indicado en el sello.",
    serialLabel: "Número de serie",
    serialHelp: "Solo números: exactamente 5, 6 u 8 dígitos.",
    checkSerial: "Consultar serial",
    scanQr: "Escanear QR",
    share: "Compartir enlace",
    recent: "CONSULTAS RECIENTES",
    historyTitle: "Historial de verificaciones",
    clearHistory: "Limpiar historial",
    empty: "Tus consultas aparecerán aquí.",
    valid: "Producto original y validado",
    missing: "Serial no encontrado",
    blocked: "QR invalidado",
    invalid: "Ingresa exactamente 5, 6 u 8 números.",
    batch: "Lote",
    expiry: "Vencimiento",
    loginError: "Este serial no corresponde a un producto validado.",
    duplicate: "Este serial ya fue contabilizado.",
    added: "Serial agregado a tu progreso.",
    remaining: (n) =>
      `Faltan ${n} seriales diferentes para desbloquear el cupón del 50%.`,
    ready: "Tu cupón del 50% está disponible.",
    redeem: "Canjear",
    claimed: "Canjeado",
  },
};
const loginText = {
  pt: {
    kicker: "ACESSO DO CLIENTE",
    title: "Entre com um produto validado",
    copy: "Utilize o serial ou o QR Code de qualquer produto Save Concept já validado.",
    serial: "Serial do produto",
    help: "Aceita seriais de 5, 6 ou 8 dígitos.",
    button: "Entrar com serial",
    qr: "Entrar com QR Code",
    instructions: "Como faço para validar?",
    visualTitle: "Veja a parte traseira",
    visualCopy: "O QR Code encontra-se no selo e o serial aparece logo abaixo.",
  },
  en: {
    kicker: "CUSTOMER ACCESS",
    title: "Sign in with a validated product",
    copy: "Use the serial or QR Code from any validated Save Concept product.",
    serial: "Product serial",
    help: "Accepts 5-, 6- or 8-digit serials.",
    button: "Sign in with serial",
    qr: "Sign in with QR Code",
    instructions: "How do I validate?",
    visualTitle: "Check the back of the product",
    visualCopy:
      "The QR Code is on the seal and the serial appears directly below it.",
  },
  es: {
    kicker: "ACCESO DEL CLIENTE",
    title: "Ingresa con un producto validado",
    copy: "Usa el serial o QR de cualquier producto Save Concept validado.",
    serial: "Serial del producto",
    help: "Acepta seriales de 5, 6 u 8 dígitos.",
    button: "Ingresar con serial",
    qr: "Ingresar con QR",
    instructions: "¿Cómo valido mi producto?",
    visualTitle: "Mira la parte trasera",
    visualCopy: "El QR está en el sello y el serial aparece justo debajo.",
  },
};
if (!t[language]) language = "pt";
const tutorialText = {
  pt: {
    only: "SOMENTE UTILIZADORES COM PRODUTOS ORIGINAIS E VERIFICADOS TERÃO ACESSO",
    s1t: "Vire a embalagem",
    s1c: "Localize o selo branco na parte traseira.",
    s2t: "Encontre o código",
    s2c: "O QR Code fica ao centro e o serial logo abaixo.",
    s3t: "Entre com segurança",
    s3c: "Digite o serial ou use a câmara para ler o QR Code.",
  },
  en: {
    only: "ONLY USERS WITH ORIGINAL, VERIFIED PRODUCTS WILL HAVE ACCESS",
    s1t: "Turn the package over",
    s1c: "Find the white seal on the back.",
    s2t: "Find the code",
    s2c: "The QR Code is in the centre with the serial directly below.",
    s3t: "Sign in securely",
    s3c: "Enter the serial or use your camera to scan the QR Code.",
  },
  es: {
    only: "SOLO LOS USUARIOS CON PRODUCTOS ORIGINALES Y VERIFICADOS TENDRÁN ACCESO",
    s1t: "Gira el envase",
    s1c: "Localiza el sello blanco en la parte trasera.",
    s2t: "Encuentra el código",
    s2c: "El QR está en el centro y el serial justo debajo.",
    s3t: "Ingresa con seguridad",
    s3c: "Escribe el serial o usa la cámara para leer el QR.",
  },
};
Object.assign(t.pt, {
  recent: "PRODUTOS VERIFICADOS",
  historyTitle: "Todos os seus produtos",
  historyNote: "O seu histórico fica guardado e não pode ser apagado.",
  historyCountLabel: "verificados",
  productColumn: "Produto Save Concept",
  verifiedDate: "Data da verificação",
  bonusTitle: "Os seus bónus",
  bonusIntro:
    "Cada produto original soma 100 pontos e aproxima-o do próximo nível.",
  currentLevel: "NÍVEL ATUAL",
  remaining: (n) =>
    `Faltam ${n} frascos diferentes para desbloquear o frasco grátis.`,
  ready:
    "Completou as três recompensas iniciais. Continue a validar para subir de nível.",
  nextPoints: (n, name) => `${n.toLocaleString("pt-PT")} pts para ${name}`,
  maxLevel: "Nível máximo alcançado",
  walletEyebrow: "NA SUA CONTA",
  walletTitle: "Benefícios ativos",
  walletIntro:
    "Os benefícios resgatados ficam disponíveis aqui para utilizar no próximo pedido.",
  activeLabel: "ativos",
  walletEmpty: "Ainda não há benefícios ativos.",
  activated: "Ativado na conta",
  copyCode: "Copiar código",
  copied: "Código copiado",
  levelShort: "Nível",
  benefitsShort: "benefícios",
  logout: "Sair",
  supportButton: "Ajuda",
  supportTitle: "Como podemos ajudar?",
  supportStep1Title: "Encontre o selo",
  supportStep1Copy: "O QR Code e o serial estão juntos na parte traseira da embalagem.",
  supportStep2Title: "Consulte o serial",
  supportStep2Copy: "Digite 5, 6 ou 8 números, ou utilize a câmara para ler o QR Code.",
  supportStep3Title: "Confira o resultado",
  supportStep3Copy: "Produto, dosagem, farmácia, lote e estado devem aparecer na confirmação.",
  supportScan: "Abrir leitor de QR Code",
});
Object.assign(t.en, {
  recent: "VERIFIED PRODUCTS",
  historyTitle: "All your products",
  historyNote: "Your verification history is saved permanently.",
  historyCountLabel: "verified",
  productColumn: "Save Concept product",
  verifiedDate: "Verification date",
  bonusTitle: "Your rewards",
  bonusIntro:
    "Each genuine product adds 100 points and brings you closer to the next level.",
  currentLevel: "CURRENT LEVEL",
  remaining: (n) => `${n} different bottles left to unlock the free bottle.`,
  ready:
    "You completed the three starter rewards. Keep validating to level up.",
  nextPoints: (n, name) => `${n.toLocaleString("en-GB")} pts to ${name}`,
  maxLevel: "Maximum level reached",
  walletEyebrow: "IN YOUR ACCOUNT",
  walletTitle: "Active benefits",
  walletIntro: "Redeemed benefits remain available here for your next order.",
  activeLabel: "active",
  walletEmpty: "No active benefits yet.",
  activated: "Activated in account",
  copyCode: "Copy code",
  copied: "Code copied",
  levelShort: "Level",
  benefitsShort: "benefits",
  logout: "Sign out",
  supportButton: "Help",
  supportTitle: "How can we help?",
  supportStep1Title: "Find the seal",
  supportStep1Copy: "The QR Code and serial are together on the back of the package.",
  supportStep2Title: "Check the serial",
  supportStep2Copy: "Enter 5, 6 or 8 digits, or use the camera to scan the QR Code.",
  supportStep3Title: "Review the result",
  supportStep3Copy: "The product, dose, pharmacy, batch and status must appear in the confirmation.",
  supportScan: "Open QR Code scanner",
});
Object.assign(t.es, {
  recent: "PRODUCTOS VERIFICADOS",
  historyTitle: "Todos tus productos",
  historyNote: "Tu historial de verificaciones queda guardado permanentemente.",
  historyCountLabel: "verificados",
  productColumn: "Producto Save Concept",
  verifiedDate: "Fecha de verificación",
  bonusTitle: "Tus beneficios",
  bonusIntro:
    "Cada producto original suma 100 puntos y te acerca al siguiente nivel.",
  currentLevel: "NIVEL ACTUAL",
  remaining: (n) =>
    `Faltan ${n} frascos diferentes para desbloquear el frasco gratis.`,
  ready:
    "Completaste las tres recompensas iniciales. Sigue verificando para subir de nivel.",
  nextPoints: (n, name) => `${n.toLocaleString("es-PY")} pts para ${name}`,
  maxLevel: "Nivel máximo alcanzado",
  walletEyebrow: "EN TU CUENTA",
  walletTitle: "Beneficios activos",
  walletIntro:
    "Los beneficios canjeados quedan disponibles aquí para tu próximo pedido.",
  activeLabel: "activos",
  walletEmpty: "Todavía no hay beneficios activos.",
  activated: "Activado en la cuenta",
  copyCode: "Copiar código",
  copied: "Código copiado",
  levelShort: "Nivel",
  benefitsShort: "beneficios",
  logout: "Salir",
  supportButton: "Ayuda",
  supportTitle: "¿Cómo podemos ayudarte?",
  supportStep1Title: "Encuentra el sello",
  supportStep1Copy: "El QR y el serial están juntos en la parte trasera del envase.",
  supportStep2Title: "Consulta el serial",
  supportStep2Copy: "Ingresa 5, 6 u 8 números o usa la cámara para leer el QR.",
  supportStep3Title: "Revisa el resultado",
  supportStep3Copy: "Producto, dosis, farmacia, lote y estado deben aparecer en la confirmación.",
  supportScan: "Abrir lector de QR",
});
function clean(v) {
  return v.replace(/\D/g, "").slice(0, 8);
}
function validSerial(v) {
  return /^(?:\d{5}|\d{6}|\d{8})$/.test(v);
}
function findValid(serial) {
  records = loadRecords();
  return records.find((x) => x.serial === serial && x.status === "authentic");
}
function customerRecord(id = session) {
  const registry = safeParse(localStorage.getItem("vf-customer-registry"), []);
  return Array.isArray(registry)
    ? registry.find((profile) => profile?.id === id)
    : null;
}
function profileKey() {
  return `vf-rewards-profile-v3-${session || "guest"}`;
}
function loadProfile() {
  let p = safeParse(localStorage.getItem(profileKey()), null);
  if (!p) {
    const legacy = safeParse(
      localStorage.getItem("vf-rewards-profile-v2"),
      null,
    );
    const migratedTo = localStorage.getItem("vf-rewards-profile-v2-migrated-to");
    p =
      legacy && session && !migratedTo
        ? {
            verified: [...(legacy.verified || [])],
            claimed: { ...(legacy.claimed || {}) },
            verifiedAt: { ...(legacy.verifiedAt || {}) },
          }
        : { verified: [], claimed: {}, verifiedAt: {} };
    if (legacy && session && !migratedTo)
      localStorage.setItem("vf-rewards-profile-v2-migrated-to", session);
  }
  p.verified = Array.isArray(p.verified) ? p.verified : [];
  p.claimed = p.claimed || {};
  p.verifiedAt = p.verifiedAt || {};
  p.verified.forEach((serial) => {
    if (!p.verifiedAt[serial]) {
      const old = history.find((x) => x.serial === serial && x.timestamp);
      p.verifiedAt[serial] = old?.timestamp || new Date().toISOString();
    }
  });
  saveProfile(p);
  return p;
}
function saveProfile(p) {
  localStorage.setItem(profileKey(), JSON.stringify(p));
}
function showApp(serial) {
  session = serial;
  localStorage.setItem("vf-user-session", serial);
  document.querySelector("#login-gate").classList.add("hidden");
  document.querySelector("#user-serial").textContent = serial;
  renderRewards();
  renderHistory();
}
function loginWith(serial, source = "manual") {
  const item = findValid(serial);
  const customer = customerRecord(serial);
  if (customer?.blocked) {
    document.querySelector("#login-error").textContent =
      language === "en"
        ? "This account is blocked. Contact support."
        : language === "es"
          ? "Este registro está bloqueado. Contacta al soporte."
          : "Este cadastro está bloqueado. Contacte o suporte.";
    return false;
  }
  if (!item) {
    document.querySelector("#login-error").textContent = t[language].loginError;
    return false;
  }
  showApp(serial);
  const credited = creditSerial(item);
  recordRemoteVerification({
    ...item,
    status: "authentic",
    credited,
    action: "login",
    source,
  });
  return true;
}
document.querySelector("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  loginWith(clean(loginInput.value), "manual");
});
loginInput.addEventListener("input", () => {
  loginInput.value = clean(loginInput.value);
  loginCount.textContent = `${loginInput.value.length} / 8`;
  document.querySelector("#login-error").textContent = "";
});
document.querySelector("#logout").addEventListener("click", () => {
  localStorage.removeItem("vf-user-session");
  location.reload();
});
function statusText(s) {
  return s === "authentic"
    ? t[language].valid
    : s === "invalid"
      ? t[language].blocked
      : t[language].missing;
}
function renderHistory() {
  const p = session ? loadProfile() : { verified: [], verifiedAt: {} },
    items = p.verified
      .map((serial) => {
        const item = records.find((x) => x.serial === serial) || {
          serial,
          name: "—",
          maker: "",
          lot: "—",
          status: "authentic",
        };
        return { ...item, timestamp: p.verifiedAt[serial] };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  document.querySelector("#history-count").textContent = items.length;
  historyBody.innerHTML = items.length
    ? items
        .map(
          (x) =>
            `<tr><td><strong>${x.serial}</strong></td><td>${x.name}<small style="display:block;color:#718095">${x.maker || ""}</small></td><td>${x.lot || "—"}</td><td><time datetime="${x.timestamp}">${new Date(x.timestamp).toLocaleString(t[language].locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time></td><td><span class="status-pill authentic">${t[language].valid}</span></td></tr>`,
        )
        .join("")
    : `<tr class="empty-row"><td colspan="5">${t[language].empty}</td></tr>`;
}
function setLanguage(lang) {
  language = lang;
  localStorage.setItem("vf-language", lang);
  document.documentElement.lang = t[lang].locale;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (t[lang][el.dataset.i18n]) el.textContent = t[lang][el.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    if (t[lang][el.dataset.i18nHtml])
      el.innerHTML = t[lang][el.dataset.i18nHtml];
  });
  const l = loginText[lang],
    loginIds = {
      kicker: "login-kicker",
      title: "login-title",
      copy: "login-copy",
      serial: "login-serial-label",
      help: "login-help",
      button: "login-button-label",
      qr: "login-qr-label",
      instructions: "instructions-label",
      visualTitle: "visual-title",
      visualCopy: "visual-copy",
    };
  Object.entries(loginIds).forEach(
    ([key, id]) => (document.getElementById(id).textContent = l[key]),
  );
  const steps = tutorialText[lang],
    stepIds = {
      only: "original-only",
      s1t: "step1-title",
      s1c: "step1-copy",
      s2t: "step2-title",
      s2c: "step2-copy",
      s3t: "step3-title",
      s3c: "step3-copy",
    };
  Object.entries(stepIds).forEach(
    ([key, id]) => (document.getElementById(id).textContent = steps[key]),
  );
  document
    .querySelectorAll("[data-lang]")
    .forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  renderHistory();
  if (session) renderRewards();
}
document
  .querySelectorAll("[data-lang]")
  .forEach((b) =>
    b.addEventListener("click", () => setLanguage(b.dataset.lang)),
  );
input.addEventListener("input", () => {
  input.value = clean(input.value);
  count.textContent = `${input.value.length} / 8`;
  result.className = "result";
  result.innerHTML = "";
});
document.querySelector("#verify-form").addEventListener("submit", (e) => {
  e.preventDefault();
  verify(clean(input.value), "manual");
});
function verify(serial, source = "manual") {
  records = loadRecords();
  if (customerRecord()?.blocked) {
    result.className = "result show invalid";
    result.innerHTML = `<strong>${
      language === "en"
        ? "Account blocked"
        : language === "es"
          ? "Registro bloqueado"
          : "Cadastro bloqueado"
    }</strong>`;
    return;
  }
  if (!validSerial(serial)) {
    result.className = "result show invalid";
    result.innerHTML = `<strong>${t[language].invalid}</strong>`;
    input.focus();
    return;
  }
  const item = records.find((x) => x.serial === serial);
  if (!item) {
    result.className = "result show warning";
    result.innerHTML = `<strong>! ${t[language].missing}</strong>`;
    addHistory({ serial, name: "—", maker: "", lot: "—", status: "warning" });
    recordRemoteVerification({
      serial,
      status: "not_found",
      action: "verification",
      source,
    });
    return;
  }
  if (item.status === "invalid") {
    result.className = "result show invalid";
    result.innerHTML = `<strong>× ${t[language].blocked}</strong>${item.name}<br>${item.maker} · ${t[language].batch} ${item.lot}`;
    addHistory(item);
    recordRemoteVerification({
      ...item,
      status: "invalid",
      action: "verification",
      source,
    });
    return;
  }
  const wasNew = creditSerial(item);
  result.className = "result show authentic";
  result.innerHTML = `<strong>✓ ${t[language].valid}</strong>${item.name}<br>${item.maker} · ${t[language].batch} ${item.lot} · ${t[language].expiry} ${item.expiry}<br><small>${wasNew ? t[language].added : t[language].duplicate}</small>`;
  addHistory(item);
  recordRemoteVerification({
    ...item,
    status: "authentic",
    credited: wasNew,
    action: "verification",
    source,
  });
}
function auditMetadata() {
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    locale: navigator.language || "",
    languages: Array.isArray(navigator.languages)
      ? navigator.languages.slice(0, 5)
      : [],
    platform: navigator.userAgentData?.platform || navigator.platform || "",
    mobile: navigator.userAgentData?.mobile ?? null,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    },
    viewport: { width: innerWidth, height: innerHeight },
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || "",
    online: navigator.onLine,
    connection: connection
      ? {
          effectiveType: connection.effectiveType || "",
          downlink: Number(connection.downlink) || null,
          rtt: Number(connection.rtt) || null,
          saveData: Boolean(connection.saveData),
        }
      : null,
    referrer: document.referrer.slice(0, 500),
    page: location.pathname,
  };
}
async function recordRemoteVerification(item) {
  try {
    await fetch("/.netlify/functions/log-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serial: item.serial,
        product: item.name || "",
        maker: item.maker || "",
        lot: item.lot || "",
        status: item.status,
        credited: Boolean(item.credited),
        profileId: session || "anonymous",
        language,
        action: item.action || "verification",
        source: item.source || "manual",
        metadata: auditMetadata(),
      }),
      keepalive: true,
    });
  } catch {
    // A verificação local continua disponível se o serviço remoto estiver offline.
  }
}
function creditSerial(item) {
  const p = loadProfile();
  const customer = customerRecord();
  if (customer?.blocked || customer?.revokedSerials?.includes(item.serial))
    return false;
  if (p.verified.includes(item.serial)) return false;
  p.verified.push(item.serial);
  p.verifiedAt[item.serial] = new Date().toISOString();
  saveProfile(p);
  renderRewards();
  renderHistory();
  return true;
}
function addHistory(item) {
  if (item.status === "authentic") renderHistory();
}
const LEVELS = [
  {
    name: { pt: "Essencial", en: "Essential", es: "Esencial" },
    points: 0,
    prize: {
      pt: "Envio grátis, 50% OFF e 1 frasco grátis",
      en: "Free shipping, 50% off and 1 free bottle",
      es: "Envío gratis, 50% OFF y 1 frasco gratis",
    },
  },
  {
    name: { pt: "Prata", en: "Silver", es: "Plata" },
    points: 1000,
    prize: {
      pt: "Ciclos com até 2 frascos grátis",
      en: "Cycles with up to 2 free bottles",
      es: "Ciclos con hasta 2 frascos gratis",
    },
  },
  {
    name: { pt: "Ouro", en: "Gold", es: "Oro" },
    points: 2000,
    prize: {
      pt: "Ciclos com até 3 frascos grátis",
      en: "Cycles with up to 3 free bottles",
      es: "Ciclos con hasta 3 frascos gratis",
    },
  },
  {
    name: { pt: "Platina", en: "Platinum", es: "Platino" },
    points: 3000,
    prize: {
      pt: "Envio expresso e prémios premium",
      en: "Express shipping and premium rewards",
      es: "Envío exprés y premios premium",
    },
  },
  {
    name: { pt: "Diamante", en: "Diamond", es: "Diamante" },
    points: 5000,
    prize: {
      pt: "Pague 1, leve 3 e atendimento VIP",
      en: "Buy 1, get 3 and VIP support",
      es: "Paga 1, lleva 3 y atención VIP",
    },
  },
];
function getLevelIndex(points) {
  let index = 0;
  LEVELS.forEach((entry, i) => {
    if (points >= entry.points) index = i;
  });
  return index;
}
function syncCustomerProfile(p, levelIndex, points, claimed) {
  if (!session) return;
  const stored = safeParse(localStorage.getItem("vf-customer-registry"), []);
  const profiles = Array.isArray(stored) ? stored : [];
  const index = profiles.findIndex((item) => item && item.id === session);
  const existing = index >= 0 ? profiles[index] : {};
  const profile = {
    ...existing,
    id: session,
    lastActive: new Date().toISOString(),
    serials: [...new Set([...p.verified, ...(existing.revokedSerials || [])])],
    verifiedAt: { ...p.verifiedAt },
    points,
    level: levelIndex + 1,
    levelName: LEVELS[levelIndex].name.pt,
    benefits: claimed.map(([threshold, item]) => ({
      threshold: Number(threshold),
      code: item.code,
      title: item.title,
      activatedAt: item.activatedAt,
    })),
  };
  if (index >= 0) profiles[index] = profile;
  else profiles.unshift(profile);
  localStorage.setItem("vf-customer-registry", JSON.stringify(profiles));
}
function rewardCode(level) {
  return `SAVE${level === 10 ? "FRASCO" : level === 5 ? "50" : "FRETE"}-${session.slice(-4)}`;
}
function renderRewards() {
  const p = loadProfile(),
    n = p.verified.length,
    customer = customerRecord(),
    rankOverride = Number(customer?.rankOverride || 0),
    basePoints = n * 100,
    levelIndex = rankOverride
      ? Math.max(0, Math.min(LEVELS.length - 1, rankOverride - 1))
      : getLevelIndex(basePoints),
    points = Math.max(basePoints, LEVELS[levelIndex].points),
    level = LEVELS[levelIndex],
    next = LEVELS[levelIndex + 1];
  document.querySelector("#points-total").textContent = points.toLocaleString(
    t[language].locale,
  );
  document.querySelector("#level-name").textContent = level.name[language];
  document.querySelector("#header-level").textContent = level.name[language];
  document.querySelector("#level-number").textContent =
    `${language === "en" ? "Level" : language === "es" ? "Nivel" : "Nível"} ${levelIndex + 1}`;
  document.querySelector("#level-range").textContent = next
    ? `${level.points.toLocaleString(t[language].locale)}–${next.points.toLocaleString(t[language].locale)} pts`
    : `${level.points.toLocaleString(t[language].locale)}+ pts`;
  document.querySelector("#next-level-label").textContent = next
    ? t[language].nextPoints(next.points - points, next.name[language])
    : t[language].maxLevel;
  document.querySelector("#bonus-progress").style.width = next
    ? `${Math.min(100, ((points - level.points) / (next.points - level.points)) * 100)}%`
    : "100%";
  document.querySelector("#progress-message").textContent =
    n >= 10 ? t[language].ready : t[language].remaining(10 - n);
  document.querySelectorAll("[data-reward]").forEach((card) => {
    const threshold = Number(card.dataset.reward),
      button = card.querySelector("button"),
      unlocked = n >= threshold,
      claimed = p.claimed[threshold];
    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("claimed", !!claimed);
    button.disabled = !unlocked || !!claimed;
    button.textContent = claimed
      ? t[language].activated
      : unlocked
        ? t[language].redeem
        : language === "en"
          ? "Locked"
          : language === "es"
            ? "Bloqueado"
            : "Bloqueado";
  });
  document.querySelector("#level-journey").innerHTML = LEVELS.map(
    (x, i) =>
      `<article class="${i < levelIndex ? "complete" : i === levelIndex ? "current" : ""}"><span>${i < levelIndex ? "✓" : i + 1}</span><div><small>${language === "en" ? "LEVEL" : language === "es" ? "NIVEL" : "NÍVEL"} ${i + 1}</small><strong>${x.name[language]}</strong><p>${x.prize[language]}</p></div><b>${x.points.toLocaleString(t[language].locale)} pts</b></article>`,
  ).join("");
  let migrated = false;
  const claimed = Object.entries(p.claimed).map(([key, value]) => {
    const card = document.querySelector(`[data-reward="${key}"]`),
      item =
        typeof value === "string"
          ? {
              code: value,
              title: card?.querySelector("h3")?.textContent || value,
              activatedAt: new Date().toISOString(),
            }
          : value;
    if (typeof value === "string") {
      p.claimed[key] = item;
      migrated = true;
    }
    return [key, item];
  });
  if (migrated) saveProfile(p);
  syncCustomerProfile(p, levelIndex, points, claimed);
  document.querySelector("#active-benefits-count").textContent = claimed.length;
  document.querySelector("#header-benefits-count").textContent = claimed.length;
  document.querySelector("#active-benefits").innerHTML = claimed.length
    ? claimed
        .map(
          ([key, item]) =>
            `<article><span class="benefit-check">✓</span><div><small>${t[language].activated} · ${new Date(item.activatedAt).toLocaleDateString(t[language].locale)}</small><strong>${item.title}</strong><code>${item.code}</code></div><button type="button" data-copy-code="${item.code}">${t[language].copyCode}</button></article>`,
        )
        .join("")
    : `<div class="wallet-empty">${t[language].walletEmpty}</div>`;
}
document.querySelector(".rewards-grid").addEventListener("click", (e) => {
  const button = e.target.closest("button"),
    card = button?.closest("[data-reward]");
  if (!card || button.disabled) return;
  const p = loadProfile(),
    level = Number(card.dataset.reward),
    code = rewardCode(level);
  p.claimed[level] = {
    code,
    title: card.querySelector("h3").textContent,
    activatedAt: new Date().toISOString(),
  };
  saveProfile(p);
  renderRewards();
  const out = document.querySelector("#coupon-output");
  out.className = "coupon-output show";
  out.innerHTML = `<span>${t[language].activated}</span><strong>${code}</strong>`;
});
document
  .querySelector("#active-benefits")
  .addEventListener("click", async (e) => {
    const button = e.target.closest("[data-copy-code]");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copyCode);
      button.textContent = t[language].copied;
    } catch {
      button.textContent = button.dataset.copyCode;
    }
  });
const dialog = document.querySelector("#scanner-dialog"),
  video = document.querySelector("#scanner-video"),
  scannerStatus = document.querySelector("#scanner-status");
let stream, scanTimer, html5Scanner;
function openScanner(mode) {
  scanMode = mode;
  scannerStatus.textContent = "A câmara será solicitada ao iniciar.";
  dialog.showModal();
}
document
  .querySelector("#open-scanner")
  .addEventListener("click", () => openScanner("verify"));
document
  .querySelector("#mobile-scanner")
  .addEventListener("click", () => openScanner("verify"));
document
  .querySelector("#login-scanner")
  .addEventListener("click", () => openScanner("login"));
const supportDialog = document.querySelector("#support-dialog");
document.querySelector("#open-support")?.addEventListener("click", () =>
  supportDialog.showModal(),
);
document.querySelector("#close-support")?.addEventListener("click", () =>
  supportDialog.close(),
);
document.querySelector("#support-open-scanner")?.addEventListener("click", () => {
  supportDialog.close();
  openScanner("verify");
});
supportDialog?.addEventListener("click", (event) => {
  if (event.target === supportDialog) supportDialog.close();
});
async function stopCamera() {
  clearInterval(scanTimer);
  if (html5Scanner) {
    try {
      if (html5Scanner.isScanning) await html5Scanner.stop();
      html5Scanner.clear();
    } catch {}
    html5Scanner = null;
  }
  if (stream) stream.getTracks().forEach((x) => x.stop());
  stream = null;
  video.srcObject = null;
}
document.querySelector("#close-scanner").addEventListener("click", async () => {
  await stopCamera();
  dialog.close();
});
dialog.addEventListener("close", stopCamera);
async function acceptCode(raw, source = "qr-camera") {
  const match = String(raw).match(/(?:\d{8}|\d{6}|\d{5})/);
  if (!match) return false;
  await stopCamera();
  dialog.close();
  if (scanMode === "login") {
    loginInput.value = match[0];
    loginCount.textContent = `${match[0].length} / 8`;
    return loginWith(match[0], source);
  }
  input.value = match[0];
  count.textContent = `${match[0].length} / 8`;
  verify(match[0], source);
  return true;
}
document.querySelector("#start-camera").addEventListener("click", async () => {
  try {
    if (window.Html5Qrcode) {
      await stopCamera();
      html5Scanner = new Html5Qrcode("qr-reader");
      scannerStatus.textContent = "Aponte para o QR Code do selo.";
      await html5Scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => acceptCode(decodedText, "qr-camera"),
        () => {},
      );
      return;
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    await video.play();
    scannerStatus.textContent = "QR Code…";
    if (!("BarcodeDetector" in window)) {
      scannerStatus.textContent =
        "Leitura automática indisponível neste navegador.";
      return;
    }
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    scanTimer = setInterval(async () => {
      try {
        const codes = await detector.detect(video);
        if (codes[0]) await acceptCode(codes[0].rawValue);
      } catch {}
    }, 500);
  } catch {
    scannerStatus.textContent = "Não foi possível aceder à câmara.";
  }
});
document.querySelector("#qr-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (window.Html5Qrcode) {
      await stopCamera();
      html5Scanner = new Html5Qrcode("qr-reader");
      const decodedText = await html5Scanner.scanFile(file, true);
      await acceptCode(decodedText, "qr-image");
      e.target.value = "";
      return;
    }
    if (!("BarcodeDetector" in window)) throw new Error("unsupported");
    const codes = await new BarcodeDetector({ formats: ["qr_code"] }).detect(
      await createImageBitmap(file),
    );
    if (codes[0]) await acceptCode(codes[0].rawValue, "qr-image");
  } catch {
    scannerStatus.textContent = "Não foi possível ler esta imagem.";
  }
});
const helpWrap = document.querySelector(".login-help-wrap"),
  helpButton = document.querySelector("#open-instructions");
function setHelpOpen(open) {
  helpWrap.classList.toggle("open", open);
  helpButton.setAttribute("aria-expanded", String(open));
}
helpButton.addEventListener("click", (e) => {
  e.stopPropagation();
  setHelpOpen(!helpWrap.classList.contains("open"));
});
document.addEventListener("click", (e) => {
  if (!helpWrap.contains(e.target)) setHelpOpen(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setHelpOpen(false);
});
const demoQr = document.querySelector("#login-demo-qr");
if (window.QRCode && demoQr)
  new QRCode(demoQr, {
    text: `${location.origin}${location.pathname}?serial=35172`,
    width: 120,
    height: 120,
    colorDark: "#071b42",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
const serialFromUrl = new URLSearchParams(location.search).get("serial");
if (session && findValid(session) && !customerRecord(session)?.blocked)
  showApp(session);
else {
  localStorage.removeItem("vf-user-session");
  session = "";
}
if (serialFromUrl && validSerial(serialFromUrl)) {
  if (!session) {
    loginInput.value = serialFromUrl;
    loginCount.textContent = `${serialFromUrl.length} / 8`;
    loginWith(serialFromUrl, "qr-link");
  } else {
    input.value = serialFromUrl;
    count.textContent = `${serialFromUrl.length} / 8`;
    verify(serialFromUrl, "qr-link");
  }
}
let installPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
});
document.querySelector("#install-app").addEventListener("click", async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
  }
});
document.querySelector("#share-invite").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}`;
  try {
    if (navigator.share) await navigator.share({ title: "Save Concept", url });
    else await navigator.clipboard.writeText(url);
  } catch {}
});
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(() => {}),
  );

// Assinatura visual: progresso, revelação, ampola 3D e resposta ao clique.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollSignature = document.querySelector("#scroll-signature i");
const updateScrollSignature = () => {
  const available = document.documentElement.scrollHeight - innerHeight;
  const progress = available > 0 ? Math.min(100, (scrollY / available) * 100) : 0;
  scrollSignature?.style.setProperty("--scroll-progress", `${progress}%`);
};
updateScrollSignature();
addEventListener("scroll", updateScrollSignature, { passive: true });
addEventListener("resize", updateScrollSignature, { passive: true });

const revealTargets = document.querySelectorAll(
  "main > section:not(.hero), .verify-card, .product-copy, .signature-vial",
);
if (!reduceMotion.matches && "IntersectionObserver" in window) {
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal-ready");
    element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
  });
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5%" },
  );
  revealTargets.forEach((element) => revealObserver.observe(element));
}

const signatureVial = document.querySelector("#signature-vial");
const vialFlipButton = document.querySelector("#vial-flip");
const signatureQr = document.querySelector("#signature-demo-qr");
if (window.QRCode && signatureQr)
  new QRCode(signatureQr, {
    text: `${location.origin}${location.pathname}?serial=35172`,
    width: 150,
    height: 150,
    colorDark: "#071b42",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
if (signatureVial && vialFlipButton) {
  const setVialSide = (flipped) => {
    signatureVial.classList.toggle("is-flipped", flipped);
    vialFlipButton.setAttribute("aria-pressed", String(flipped));
  };
  vialFlipButton.addEventListener("click", () => {
    setVialSide(!signatureVial.classList.contains("is-flipped"));
  });
  vialFlipButton.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") setVialSide(true);
  });
  vialFlipButton.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") setVialSide(false);
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("a[href^='#'], .mobile-nav button, [data-tab]");
  if (!trigger) return;
  document.body.classList.remove("ui-transitioning");
  requestAnimationFrame(() => document.body.classList.add("ui-transitioning"));
  window.setTimeout(() => document.body.classList.remove("ui-transitioning"), 520);
  const targetId = trigger.getAttribute("href")?.slice(1);
  if (!targetId) return;
  const target = document.getElementById(targetId);
  target?.classList.remove("section-arrival");
  requestAnimationFrame(() => target?.classList.add("section-arrival"));
  window.setTimeout(() => target?.classList.remove("section-arrival"), 720);
});

if (matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
  const dot = document.createElement("span");
  const ring = document.createElement("span");
  dot.className = "brand-cursor-dot";
  ring.className = "brand-cursor-ring";
  document.body.append(dot, ring);
  let pointerX = -50;
  let pointerY = -50;
  let ringX = -50;
  let ringY = -50;
  addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    dot.style.left = `${pointerX}px`;
    dot.style.top = `${pointerY}px`;
    document.body.classList.add("brand-cursor-active");
  }, { passive: true });
  const animateCursor = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
  document.addEventListener("pointerover", (event) => {
    document.body.classList.toggle(
      "brand-cursor-hover",
      Boolean(event.target.closest("a, button, input, select, [role='button']")),
    );
  });
  document.addEventListener("pointerdown", (event) => {
    const ripple = document.createElement("span");
    ripple.className = "brand-ripple";
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    document.body.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
}

function addDepthResponse(selector) {
  if (reduceMotion.matches || !matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--depth-x", `${y * -2.2}deg`);
      card.style.setProperty("--depth-y", `${x * 2.2}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--depth-x", "0deg");
      card.style.setProperty("--depth-y", "0deg");
    });
  });
}
addDepthResponse(".verify-card");
setLanguage(language);
