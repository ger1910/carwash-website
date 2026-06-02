/* CleanWash — Car Wash Management System (Vanilla JS + LocalStorage) */

(() => {
  "use strict";

  const LS_KEYS = {
    seeded: "cleanwash_seeded_v1",
    profile: "cleanwash_profile_v1",
    customers: "cleanwash_customers_v1",
    services: "cleanwash_services_v1",
    transactions: "cleanwash_transactions_v1",
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(n || 0));

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
    } catch {
      return iso || "-";
    }
  };

  const isoDateOnly = (d = new Date()) => {
    const x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  };

  const uid = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const readJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const seeded = () => localStorage.getItem(LS_KEYS.seeded) === "1";

  const defaultProfile = () => ({
    displayName: "Geraldo",
    greetingName: "Gerald",
    role: "Manager",
    title: "Operations Manager",
    email: "geraldo@cleanwash.com",
    phone: "+62 812-0000-1111",
    location: "Jakarta HQ",
  });

  const getProfile = () => readJSON(LS_KEYS.profile, null) || defaultProfile();
  const setProfile = (p) => writeJSON(LS_KEYS.profile, p);

  const initialsFromName = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "CW";
    const a = parts[0]?.[0] || "";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  };

  const seedDemoData = () => {
    const now = new Date();
    const daysAgo = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d.toISOString();
    };

    const customers = [
      {
        id: uid(),
        name: "Ariana Putra",
        phone: "+62 812-3456-7890",
        email: "ariana.putra@example.com",
        vehicle: "Toyota Avanza",
        plate: "B 1234 CW",
        createdAt: daysAgo(32),
      },
      {
        id: uid(),
        name: "Daniel Wong",
        phone: "+62 811-0001-2200",
        email: "daniel.wong@example.com",
        vehicle: "Honda CR-V",
        plate: "B 9921 DX",
        createdAt: daysAgo(18),
      },
      {
        id: uid(),
        name: "Siti Rahma",
        phone: "+62 813-7788-9900",
        email: "siti.rahma@example.com",
        vehicle: "Suzuki Ertiga",
        plate: "D 5511 SR",
        createdAt: daysAgo(9),
      },
      {
        id: uid(),
        name: "Kevin Santoso",
        phone: "+62 812-9087-1122",
        email: "kevin.santoso@example.com",
        vehicle: "Tesla Model 3",
        plate: "B 3000 EV",
        createdAt: daysAgo(4),
      },
    ];

    const services = [
      {
        id: uid(),
        name: "Express Exterior",
        durationMins: 20,
        price: 8,
        description: "High-pressure rinse, foam wash, and quick dry.",
      },
      {
        id: uid(),
        name: "Premium Full Wash",
        durationMins: 45,
        price: 18,
        description: "Exterior + interior vacuum, dashboard wipe, and tire shine.",
      },
      {
        id: uid(),
        name: "Ultimate Detail",
        durationMins: 120,
        price: 75,
        description: "Deep interior clean, wax polish, and trim restoration.",
      },
      {
        id: uid(),
        name: "Engine Bay Cleaning",
        durationMins: 35,
        price: 22,
        description: "Safe degreasing and dressing for a clean engine bay.",
      },
    ];

    const byName = (arr, name) => arr.find((x) => x.name === name)?.id;

    const transactions = [
      {
        id: uid(),
        date: daysAgo(0),
        customerId: byName(customers, "Kevin Santoso"),
        serviceId: byName(services, "Premium Full Wash"),
        status: "Completed",
        paymentMethod: "Card",
        amount: 18,
        notes: "Customer requested extra attention on wheels.",
      },
      {
        id: uid(),
        date: daysAgo(1),
        customerId: byName(customers, "Siti Rahma"),
        serviceId: byName(services, "Express Exterior"),
        status: "Completed",
        paymentMethod: "Cash",
        amount: 8,
        notes: "Quick wash before commute.",
      },
      {
        id: uid(),
        date: daysAgo(2),
        customerId: byName(customers, "Daniel Wong"),
        serviceId: byName(services, "Ultimate Detail"),
        status: "Pending",
        paymentMethod: "Transfer",
        amount: 75,
        notes: "Schedule pickup tomorrow 10:00.",
      },
      {
        id: uid(),
        date: daysAgo(5),
        customerId: byName(customers, "Ariana Putra"),
        serviceId: byName(services, "Engine Bay Cleaning"),
        status: "Completed",
        paymentMethod: "Card",
        amount: 22,
        notes: "Engine bay was dusty; finished with protectant.",
      },
      {
        id: uid(),
        date: daysAgo(7),
        customerId: byName(customers, "Ariana Putra"),
        serviceId: byName(services, "Premium Full Wash"),
        status: "Canceled",
        paymentMethod: "Cash",
        amount: 18,
        notes: "Customer rescheduled.",
      },
    ];

    writeJSON(LS_KEYS.customers, customers);
    writeJSON(LS_KEYS.services, services);
    writeJSON(LS_KEYS.transactions, transactions);
    localStorage.setItem(LS_KEYS.seeded, "1");
  };

  const db = {
    customers() {
      return readJSON(LS_KEYS.customers, []);
    },
    services() {
      return readJSON(LS_KEYS.services, []);
    },
    transactions() {
      return readJSON(LS_KEYS.transactions, []);
    },
    setCustomers(list) {
      writeJSON(LS_KEYS.customers, list);
    },
    setServices(list) {
      writeJSON(LS_KEYS.services, list);
    },
    setTransactions(list) {
      writeJSON(LS_KEYS.transactions, list);
    },
    resetDemo() {
      localStorage.removeItem(LS_KEYS.customers);
      localStorage.removeItem(LS_KEYS.services);
      localStorage.removeItem(LS_KEYS.transactions);
      localStorage.removeItem(LS_KEYS.seeded);
      seedDemoData();
    },
  };

  // DOM refs
  const sidebar = $("#sidebar");
  const overlay = $("#overlay");
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const modalTitle = $("#modalTitle");
  const modalSub = $("#modalSub");
  const pageTitle = $("#pageTitle");
  const pageSubtitle = $("#pageSubtitle");

  // Profile / greeting
  const userProfileBtn = $("#userProfileBtn");
  const userAvatar = $("#userAvatar");
  const userName = $("#userName");
  const userRole = $("#userRole");
  const greetingName = $("#greetingName");
  const greetingRole = $("#greetingRole");
  const greetingDisplayName = $("#greetingDisplayName");

  const views = $$(".view");
  const navItems = $$(".nav__item[data-section]");

  // Dashboard refs
  const statCustomers = $("#statCustomers");
  const statServices = $("#statServices");
  const statTransactions = $("#statTransactions");
  const kpiTotalRevenue = $("#kpiTotalRevenue");
  const kpiAvgTicket = $("#kpiAvgTicket");
  const kpiCompletionRate = $("#kpiCompletionRate");
  const kpiTodayRevenue = $("#kpiTodayRevenue");
  const kpiTodayMeta = $("#kpiTodayMeta");
  const recentTransactions = $("#recentTransactions");
  const revenueSpark = $("#revenueSpark");

  // Tables
  const customersTableBody = $("#customersTable tbody");
  const servicesTableBody = $("#servicesTable tbody");
  const transactionsTableBody = $("#transactionsTable tbody");

  // Search/filter
  const customerSearch = $("#customerSearch");
  const serviceSearch = $("#serviceSearch");
  const transactionSearch = $("#transactionSearch");
  const transactionStatusFilter = $("#transactionStatusFilter");
  const globalSearch = $("#globalSearch");
  const clearGlobalSearch = $("#clearGlobalSearch");

  // Buttons
  const addCustomerBtn = $("#addCustomerBtn");
  const addServiceBtn = $("#addServiceBtn");
  const addTransactionBtn = $("#addTransactionBtn");

  // State
  const state = {
    activeView: "dashboard",
    q: { customers: "", services: "", transactions: "" },
    transactionStatus: "",
    globalQ: "",
  };

  const toast = (icon, title, text) => {
    if (!window.Swal) {
      alert(`${title}\n\n${text || ""}`);
      return;
    }
    Swal.fire({
      icon,
      title,
      text: text || "",
      timer: 1600,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  const confirmDialog = async ({ title, text, confirmText = "Confirm", icon = "warning" }) => {
    if (!window.Swal) return confirm(`${title}\n\n${text}`);
    const res = await Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      focusCancel: true,
    });
    return res.isConfirmed;
  };

  const setOverlay = (on) => overlay.classList.toggle("is-visible", Boolean(on));

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    setOverlay(true);
  };
  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    setOverlay(false);
  };

  const openModal = ({ title, sub, html }) => {
    modalTitle.textContent = title;
    modalSub.textContent = sub || "";
    modalBody.innerHTML = html;
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    setOverlay(true);
    // focus first field
    const first = modalBody.querySelector("input, select, textarea, button");
    if (first) setTimeout(() => first.focus(), 50);
  };

  const closeModal = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
    if (!sidebar.classList.contains("is-open")) setOverlay(false);
  };

  const setActiveView = (name) => {
    state.activeView = name;

    const subtitles = {
      dashboard: "Overview and performance",
      customers: "Create, edit, and search customers",
      services: "Manage service catalog and pricing",
      transactions: "Track jobs, payments, and status",
    };
    pageTitle.textContent = name[0].toUpperCase() + name.slice(1);
    pageSubtitle.textContent = subtitles[name] || "";

    views.forEach((v) => v.classList.toggle("view--active", v.dataset.view === name));
    navItems.forEach((i) => i.classList.toggle("is-active", i.dataset.section === name));
    closeSidebar();
  };

  const escapeHtml = (str) =>
    String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const findById = (arr, id) => arr.find((x) => x.id === id);

  const toSearchText = (obj) => JSON.stringify(obj).toLowerCase();

  const statusBadgeClass = (status) => {
    if (status === "Completed") return "badge--ok";
    if (status === "Pending") return "badge--warn";
    if (status === "Canceled") return "badge--danger";
    return "";
  };

  const statusChipClass = (status) => {
    if (status === "Completed") return "chip chip--ok";
    if (status === "Pending") return "chip chip--warn";
    if (status === "Canceled") return "chip chip--danger";
    return "chip";
  };

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

  const validateRequired = (label, value) => {
    if (String(value || "").trim().length === 0) return `${label} is required.`;
    return null;
  };

  const validatePositiveNumber = (label, value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return `${label} must be a valid number.`;
    return null;
  };

  const withLookups = () => {
    const customers = db.customers();
    const services = db.services();
    const customerNameById = new Map(customers.map((c) => [c.id, c.name]));
    const serviceNameById = new Map(services.map((s) => [s.id, s.name]));
    return { customers, services, customerNameById, serviceNameById };
  };

  // ---------------------------
  // Renderers
  // ---------------------------
  const renderProfile = () => {
    const p = getProfile();
    if (userAvatar) userAvatar.textContent = initialsFromName(p.displayName);
    if (userName) userName.textContent = p.displayName || "User";
    if (userRole) userRole.textContent = p.role || "Manager";
    if (greetingRole) greetingRole.textContent = p.role || "Manager";
    if (greetingDisplayName) greetingDisplayName.textContent = p.displayName || "User";
    if (greetingName) {
      const g = String(p.greetingName || "").trim();
      const fallback = String(p.displayName || "").trim().split(/\s+/)[0] || "there";
      greetingName.textContent = g || fallback;
    }
  };

  const renderCustomers = () => {
    const customers = db.customers();
    const q = (state.q.customers || "").toLowerCase().trim();
    const filtered = q ? customers.filter((c) => toSearchText(c).includes(q)) : customers;

    customersTableBody.innerHTML = filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((c) => {
        return `
          <tr>
            <td>
              <div class="row-title">${escapeHtml(c.name)}</div>
              <div class="row-sub">ID: <span class="mono">${escapeHtml(c.id.slice(0, 8))}</span></div>
            </td>
            <td>${escapeHtml(c.phone || "-")}</td>
            <td>${escapeHtml(c.email || "-")}</td>
            <td>${escapeHtml(c.vehicle || "-")}</td>
            <td><span class="mono">${escapeHtml(c.plate || "-")}</span></td>
            <td>${escapeHtml(fmtDate(c.createdAt))}</td>
            <td>
              <div class="actions">
                <button class="icon-btn icon-btn--sm" data-action="edit-customer" data-id="${escapeHtml(c.id)}" title="Edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn icon-btn--sm" data-action="delete-customer" data-id="${escapeHtml(c.id)}" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!filtered.length) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 20px 16px; color: rgba(255,255,255,0.7);">
            No customers found. Try a different search, or add a new customer.
          </td>
        </tr>
      `;
    }
  };

  const renderServices = () => {
    const services = db.services();
    const q = (state.q.services || "").toLowerCase().trim();
    const filtered = q ? services.filter((s) => toSearchText(s).includes(q)) : services;

    servicesTableBody.innerHTML = filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => {
        return `
          <tr>
            <td>
              <div class="row-title">${escapeHtml(s.name)}</div>
              <div class="row-sub">ID: <span class="mono">${escapeHtml(s.id.slice(0, 8))}</span></div>
            </td>
            <td>${escapeHtml(`${Number(s.durationMins || 0)} mins`)}</td>
            <td>${escapeHtml(fmtMoney(s.price))}</td>
            <td>${escapeHtml(s.description || "-")}</td>
            <td>
              <div class="actions">
                <button class="icon-btn icon-btn--sm" data-action="edit-service" data-id="${escapeHtml(s.id)}" title="Edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn icon-btn--sm" data-action="delete-service" data-id="${escapeHtml(s.id)}" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!filtered.length) {
      servicesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 20px 16px; color: rgba(255,255,255,0.7);">
            No services found. Add a new service to start building your catalog.
          </td>
        </tr>
      `;
    }
  };

  const renderTransactions = () => {
    const { customers, services, customerNameById, serviceNameById } = withLookups();
    const transactions = db.transactions();

    const q = (state.q.transactions || "").toLowerCase().trim();
    const statusFilter = state.transactionStatus || "";

    const enriched = transactions.map((t) => ({
      ...t,
      customerName: customerNameById.get(t.customerId) || "Unknown customer",
      serviceName: serviceNameById.get(t.serviceId) || "Unknown service",
    }));

    const filtered = enriched.filter((t) => {
      const hitsQuery = q ? toSearchText(t).includes(q) : true;
      const hitsStatus = statusFilter ? t.status === statusFilter : true;
      return hitsQuery && hitsStatus;
    });

    transactionsTableBody.innerHTML = filtered
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t) => {
        return `
          <tr>
            <td>${escapeHtml(fmtDate(t.date))}</td>
            <td>${escapeHtml(t.customerName)}</td>
            <td>${escapeHtml(t.serviceName)}</td>
            <td><span class="${statusChipClass(t.status)}"><i class="fa-solid fa-circle"></i>${escapeHtml(t.status)}</span></td>
            <td>${escapeHtml(t.paymentMethod || "-")}</td>
            <td>${escapeHtml(fmtMoney(t.amount))}</td>
            <td>${escapeHtml(t.notes || "-")}</td>
            <td>
              <div class="actions">
                <button class="icon-btn icon-btn--sm" data-action="edit-transaction" data-id="${escapeHtml(t.id)}" title="Edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn icon-btn--sm" data-action="delete-transaction" data-id="${escapeHtml(t.id)}" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!customers.length || !services.length) {
      transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 20px 16px; color: rgba(255,255,255,0.7);">
            You need at least 1 customer and 1 service before you can create transactions.
          </td>
        </tr>
      `;
      return;
    }

    if (!filtered.length) {
      transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 20px 16px; color: rgba(255,255,255,0.7);">
            No transactions found for the current search/filter.
          </td>
        </tr>
      `;
    }
  };

  const renderDashboard = () => {
    const customers = db.customers();
    const services = db.services();
    const transactions = db.transactions();

    statCustomers.textContent = customers.length;
    statServices.textContent = services.length;
    statTransactions.textContent = transactions.length;

    const completed = transactions.filter((t) => t.status === "Completed");
    const totalRevenue = completed.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    kpiTotalRevenue.textContent = fmtMoney(totalRevenue);

    const avg = transactions.length ? totalRevenue / Math.max(1, completed.length) : 0;
    kpiAvgTicket.textContent = fmtMoney(avg);

    const completionRate = transactions.length ? Math.round((completed.length / transactions.length) * 100) : 0;
    kpiCompletionRate.textContent = `${completionRate}%`;

    const today = isoDateOnly(new Date());
    const todays = transactions.filter((t) => isoDateOnly(new Date(t.date)) === today && t.status === "Completed");
    const todayRevenue = todays.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    kpiTodayRevenue.textContent = fmtMoney(todayRevenue);
    kpiTodayMeta.textContent = `${todays.length} transactions`;

    // recent list
    const { customerNameById, serviceNameById } = withLookups();
    const recent = transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((t) => ({
        ...t,
        customer: customerNameById.get(t.customerId) || "Unknown customer",
        service: serviceNameById.get(t.serviceId) || "Unknown service",
      }));

    if (!recent.length) {
      recentTransactions.innerHTML = `<div style="color: rgba(255,255,255,0.7);">No transactions yet. Create one to see activity here.</div>`;
    } else {
      recentTransactions.innerHTML = recent
        .map((t) => {
          const cls = statusBadgeClass(t.status);
          return `
            <div class="list-item">
              <div>
                <div class="list-item__title">${escapeHtml(t.customer)} • ${escapeHtml(t.service)}</div>
                <div class="list-item__sub">${escapeHtml(fmtDate(t.date))} • ${escapeHtml(t.paymentMethod || "—")}</div>
              </div>
              <div class="list-item__right">
                <div class="list-item__amount">${escapeHtml(fmtMoney(t.amount))}</div>
                <div class="list-item__badge ${cls}">${escapeHtml(t.status)}</div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    drawRevenueSpark();
  };

  const renderAll = () => {
    renderProfile();
    renderDashboard();
    renderCustomers();
    renderServices();
    renderTransactions();
  };

  // ---------------------------
  // Canvas sparkline
  // ---------------------------
  const drawRevenueSpark = () => {
    if (!revenueSpark) return;
    const ctx = revenueSpark.getContext("2d");
    if (!ctx) return;

    const width = revenueSpark.width;
    const height = revenueSpark.height;
    ctx.clearRect(0, 0, width, height);

    const transactions = db.transactions().filter((t) => t.status === "Completed");
    const points = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = isoDateOnly(day);
      const sum = transactions
        .filter((t) => isoDateOnly(new Date(t.date)) === key)
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      points.push(sum);
    }

    const max = Math.max(10, ...points);
    const pad = 14;
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;

    // grid
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + (innerH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }

    const xAt = (i) => pad + (innerW * i) / (points.length - 1);
    const yAt = (v) => pad + innerH - (innerH * v) / max;

    // area fill
    const grad = ctx.createLinearGradient(0, pad, 0, height - pad);
    grad.addColorStop(0, "rgba(75,179,255,0.26)");
    grad.addColorStop(1, "rgba(43,107,255,0.00)");

    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(points[0]));
    for (let i = 1; i < points.length; i++) ctx.lineTo(xAt(i), yAt(points[i]));
    ctx.lineTo(xAt(points.length - 1), height - pad);
    ctx.lineTo(xAt(0), height - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(points[0]));
    for (let i = 1; i < points.length; i++) ctx.lineTo(xAt(i), yAt(points[i]));
    ctx.strokeStyle = "rgba(207,234,255,0.95)";
    ctx.lineWidth = 2.25;
    ctx.shadowColor = "rgba(43,107,255,0.35)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // points
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(points[i]), 3.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(75,179,255,0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // ---------------------------
  // Forms (modal templates)
  // ---------------------------
  const customerFormHTML = (mode, customer) => `
    <form class="form" id="customerForm" data-mode="${escapeHtml(mode)}" data-id="${escapeHtml(customer?.id || "")}">
      <div class="form__grid">
        <div class="field">
          <div class="label">Full Name</div>
          <input class="input" name="name" placeholder="e.g., John Doe" value="${escapeHtml(customer?.name || "")}" required />
          <div class="help">Used for receipts and search.</div>
        </div>
        <div class="field">
          <div class="label">Phone</div>
          <input class="input" name="phone" placeholder="e.g., +62 812-xxxx-xxxx" value="${escapeHtml(customer?.phone || "")}" />
        </div>
        <div class="field">
          <div class="label">Email</div>
          <input class="input" name="email" type="email" placeholder="e.g., name@example.com" value="${escapeHtml(customer?.email || "")}" />
        </div>
        <div class="field">
          <div class="label">Vehicle</div>
          <input class="input" name="vehicle" placeholder="e.g., Honda Civic" value="${escapeHtml(customer?.vehicle || "")}" />
        </div>
        <div class="field">
          <div class="label">Plate</div>
          <input class="input" name="plate" placeholder="e.g., B 1234 CW" value="${escapeHtml(customer?.plate || "")}" />
        </div>
        <div class="field">
          <div class="label">Created</div>
          <input class="input" name="createdAt" type="date" value="${escapeHtml(isoDateOnly(customer?.createdAt ? new Date(customer.createdAt) : new Date()))}" />
          <div class="help">You can backdate imports if needed.</div>
        </div>
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--ghost" data-modal-cancel>Cancel</button>
        <button class="btn btn--primary" type="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          ${mode === "create" ? "Create Customer" : "Save Changes"}
        </button>
      </div>
    </form>
  `;

  const serviceFormHTML = (mode, service) => `
    <form class="form" id="serviceForm" data-mode="${escapeHtml(mode)}" data-id="${escapeHtml(service?.id || "")}">
      <div class="form__grid">
        <div class="field">
          <div class="label">Service Name</div>
          <input class="input" name="name" placeholder="e.g., Premium Full Wash" value="${escapeHtml(service?.name || "")}" required />
        </div>
        <div class="field">
          <div class="label">Duration (mins)</div>
          <input class="input" name="durationMins" type="number" min="0" step="1" placeholder="e.g., 45" value="${escapeHtml(service?.durationMins ?? "")}" required />
        </div>
        <div class="field">
          <div class="label">Price</div>
          <input class="input" name="price" type="number" min="0" step="0.01" placeholder="e.g., 18" value="${escapeHtml(service?.price ?? "")}" required />
          <div class="help">Currency is displayed in USD (browser locale).</div>
        </div>
        <div class="field">
          <div class="label">Description</div>
          <textarea class="textarea" name="description" placeholder="Short description…">${escapeHtml(service?.description || "")}</textarea>
        </div>
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--ghost" data-modal-cancel>Cancel</button>
        <button class="btn btn--primary" type="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          ${mode === "create" ? "Create Service" : "Save Changes"}
        </button>
      </div>
    </form>
  `;

  const transactionFormHTML = (mode, transaction) => {
    const { customers, services, customerNameById, serviceNameById } = withLookups();
    const selectedCustomer = transaction?.customerId || customers[0]?.id || "";
    const selectedService = transaction?.serviceId || services[0]?.id || "";

    const servicePrice = findById(services, selectedService)?.price ?? "";
    const defaultAmount = transaction?.amount ?? servicePrice ?? "";
    const dateVal = isoDateOnly(transaction?.date ? new Date(transaction.date) : new Date());

    const customerOptions = customers
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === selectedCustomer ? "selected" : ""}>${escapeHtml(c.name)}</option>`)
      .join("");

    const serviceOptions = services
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => `<option value="${escapeHtml(s.id)}" ${s.id === selectedService ? "selected" : ""}>${escapeHtml(s.name)} — ${escapeHtml(fmtMoney(s.price))}</option>`)
      .join("");

    const knownCustomer = customerNameById.get(selectedCustomer);
    const knownService = serviceNameById.get(selectedService);

    return `
      <form class="form" id="transactionForm" data-mode="${escapeHtml(mode)}" data-id="${escapeHtml(transaction?.id || "")}">
        <div class="form__grid">
          <div class="field">
            <div class="label">Date</div>
            <input class="input" name="date" type="date" value="${escapeHtml(dateVal)}" required />
          </div>
          <div class="field">
            <div class="label">Status</div>
            <select class="input" name="status" required>
              ${["Completed", "Pending", "Canceled"]
                .map((s) => `<option value="${s}" ${(transaction?.status || "Completed") === s ? "selected" : ""}>${s}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <div class="label">Customer</div>
            <select class="input" name="customerId" required>
              ${customerOptions}
            </select>
            <div class="help">${knownCustomer ? `Selected: ${escapeHtml(knownCustomer)}` : "Select a customer"}</div>
          </div>
          <div class="field">
            <div class="label">Service</div>
            <select class="input" name="serviceId" required>
              ${serviceOptions}
            </select>
            <div class="help">${knownService ? `Selected: ${escapeHtml(knownService)}` : "Select a service"}</div>
          </div>
          <div class="field">
            <div class="label">Payment Method</div>
            <select class="input" name="paymentMethod" required>
              ${["Cash", "Card", "Transfer", "E-Wallet"]
                .map((p) => `<option value="${p}" ${(transaction?.paymentMethod || "Cash") === p ? "selected" : ""}>${p}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <div class="label">Amount</div>
            <input class="input" name="amount" type="number" min="0" step="0.01" value="${escapeHtml(defaultAmount)}" required />
            <div class="help">Tip: choose a service to auto-fill.</div>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <div class="label">Notes</div>
            <textarea class="textarea" name="notes" placeholder="Optional notes…">${escapeHtml(transaction?.notes || "")}</textarea>
          </div>
        </div>
        <div class="form__actions">
          <button type="button" class="btn btn--ghost" data-modal-cancel>Cancel</button>
          <button class="btn btn--primary" type="submit">
            <i class="fa-solid fa-floppy-disk"></i>
            ${mode === "create" ? "Create Transaction" : "Save Changes"}
          </button>
        </div>
      </form>
    `;
  };

  const openCreateCustomer = () => {
    openModal({
      title: "Add Customer",
      sub: "Create a new customer profile",
      html: customerFormHTML("create", null),
    });
  };

  const openEditCustomer = (id) => {
    const customer = findById(db.customers(), id);
    if (!customer) return toast("error", "Customer not found");
    openModal({
      title: "Edit Customer",
      sub: "Update customer information",
      html: customerFormHTML("edit", customer),
    });
  };

  const openCreateService = () => {
    openModal({
      title: "Add Service",
      sub: "Create a new service in your catalog",
      html: serviceFormHTML("create", null),
    });
  };

  const openEditService = (id) => {
    const service = findById(db.services(), id);
    if (!service) return toast("error", "Service not found");
    openModal({
      title: "Edit Service",
      sub: "Update service pricing and details",
      html: serviceFormHTML("edit", service),
    });
  };

  const openCreateTransaction = () => {
    const { customers, services } = withLookups();
    if (!customers.length) return toast("warning", "Add a customer first", "Transactions require at least one customer.");
    if (!services.length) return toast("warning", "Add a service first", "Transactions require at least one service.");
    openModal({
      title: "Add Transaction",
      sub: "Record a new service transaction",
      html: transactionFormHTML("create", null),
    });
  };

  const openEditTransaction = (id) => {
    const transaction = findById(db.transactions(), id);
    if (!transaction) return toast("error", "Transaction not found");
    openModal({
      title: "Edit Transaction",
      sub: "Update job status, amount, and notes",
      html: transactionFormHTML("edit", transaction),
    });
  };

  // ---------------------------
  // CRUD handlers
  // ---------------------------
  const createCustomer = (payload) => {
    const customers = db.customers();
    const item = {
      id: uid(),
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      vehicle: payload.vehicle.trim(),
      plate: payload.plate.trim(),
      createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : new Date().toISOString(),
    };
    customers.push(item);
    db.setCustomers(customers);
    toast("success", "Customer created");
  };

  const updateCustomer = (id, payload) => {
    const customers = db.customers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Customer not found");
    customers[idx] = {
      ...customers[idx],
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      vehicle: payload.vehicle.trim(),
      plate: payload.plate.trim(),
      createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : customers[idx].createdAt,
    };
    db.setCustomers(customers);
    toast("success", "Customer updated");
  };

  const deleteCustomer = async (id) => {
    const transactions = db.transactions();
    const linked = transactions.filter((t) => t.customerId === id);
    const ok = await confirmDialog({
      title: "Delete customer?",
      text:
        linked.length > 0
          ? `This customer has ${linked.length} linked transaction(s). They will be kept but shown as “Unknown customer”. Continue?`
          : "This action cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;

    db.setCustomers(db.customers().filter((c) => c.id !== id));
    toast("success", "Customer deleted");
  };

  const createService = (payload) => {
    const services = db.services();
    const item = {
      id: uid(),
      name: payload.name.trim(),
      durationMins: Number(payload.durationMins),
      price: Number(payload.price),
      description: payload.description.trim(),
    };
    services.push(item);
    db.setServices(services);
    toast("success", "Service created");
  };

  const updateService = (id, payload) => {
    const services = db.services();
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Service not found");
    services[idx] = {
      ...services[idx],
      name: payload.name.trim(),
      durationMins: Number(payload.durationMins),
      price: Number(payload.price),
      description: payload.description.trim(),
    };
    db.setServices(services);
    toast("success", "Service updated");
  };

  const deleteService = async (id) => {
    const transactions = db.transactions();
    const linked = transactions.filter((t) => t.serviceId === id);
    const ok = await confirmDialog({
      title: "Delete service?",
      text:
        linked.length > 0
          ? `This service has ${linked.length} linked transaction(s). They will be kept but shown as “Unknown service”. Continue?`
          : "This action cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;

    db.setServices(db.services().filter((s) => s.id !== id));
    toast("success", "Service deleted");
  };

  const createTransaction = (payload) => {
    const transactions = db.transactions();
    const item = {
      id: uid(),
      date: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString(),
      customerId: payload.customerId,
      serviceId: payload.serviceId,
      status: payload.status,
      paymentMethod: payload.paymentMethod,
      amount: Number(payload.amount),
      notes: payload.notes.trim(),
    };
    transactions.push(item);
    db.setTransactions(transactions);
    toast("success", "Transaction created");
  };

  const updateTransaction = (id, payload) => {
    const transactions = db.transactions();
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Transaction not found");
    transactions[idx] = {
      ...transactions[idx],
      date: payload.date ? new Date(payload.date).toISOString() : transactions[idx].date,
      customerId: payload.customerId,
      serviceId: payload.serviceId,
      status: payload.status,
      paymentMethod: payload.paymentMethod,
      amount: Number(payload.amount),
      notes: payload.notes.trim(),
    };
    db.setTransactions(transactions);
    toast("success", "Transaction updated");
  };

  const deleteTransaction = async (id) => {
    const ok = await confirmDialog({
      title: "Delete transaction?",
      text: "This action cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    db.setTransactions(db.transactions().filter((t) => t.id !== id));
    toast("success", "Transaction deleted");
  };

  // ---------------------------
  // Form submit handling
  // ---------------------------
  const formDataToObj = (form) => Object.fromEntries(new FormData(form).entries());

  const handleCustomerSubmit = async (form) => {
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    const data = formDataToObj(form);

    const errors = [];
    errors.push(validateRequired("Full Name", data.name));
    if (data.email && !validateEmail(data.email)) errors.push("Email is not valid.");
    const err = errors.filter(Boolean)[0];
    if (err) return Swal.fire({ icon: "error", title: "Validation error", text: err });

    if (mode === "create") createCustomer(data);
    else updateCustomer(id, data);

    closeModal();
    renderAll();
  };

  const handleServiceSubmit = async (form) => {
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    const data = formDataToObj(form);

    const errors = [];
    errors.push(validateRequired("Service Name", data.name));
    errors.push(validatePositiveNumber("Duration", data.durationMins));
    errors.push(validatePositiveNumber("Price", data.price));
    const err = errors.filter(Boolean)[0];
    if (err) return Swal.fire({ icon: "error", title: "Validation error", text: err });

    if (mode === "create") createService(data);
    else updateService(id, data);

    closeModal();
    renderAll();
  };

  const handleTransactionSubmit = async (form) => {
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    const data = formDataToObj(form);

    const errors = [];
    errors.push(validateRequired("Date", data.date));
    errors.push(validateRequired("Customer", data.customerId));
    errors.push(validateRequired("Service", data.serviceId));
    errors.push(validateRequired("Payment Method", data.paymentMethod));
    errors.push(validateRequired("Status", data.status));
    errors.push(validatePositiveNumber("Amount", data.amount));
    const err = errors.filter(Boolean)[0];
    if (err) return Swal.fire({ icon: "error", title: "Validation error", text: err });

    if (mode === "create") createTransaction(data);
    else updateTransaction(id, data);

    closeModal();
    renderAll();
  };

  const updateAmountFromService = (form) => {
    const serviceId = form.querySelector('[name="serviceId"]')?.value;
    if (!serviceId) return;
    const service = findById(db.services(), serviceId);
    if (!service) return;
    const amountInput = form.querySelector('[name="amount"]');
    if (!amountInput) return;
    const current = Number(amountInput.value);
    if (!amountInput.value || current === 0 || Number.isNaN(current)) {
      amountInput.value = String(service.price ?? 0);
    }
  };

  // ---------------------------
  // Profile
  // ---------------------------
  const profileFormHTML = (profile) => `
    <form class="form" id="profileForm">
      <div class="form__grid">
        <div class="field">
          <div class="label">Display Name</div>
          <input class="input" name="displayName" placeholder="e.g., Geraldo" value="${escapeHtml(profile.displayName || "")}" required />
          <div class="help">Shown on the top-right profile chip.</div>
        </div>
        <div class="field">
          <div class="label">Welcome Name</div>
          <input class="input" name="greetingName" placeholder="e.g., Gerald" value="${escapeHtml(profile.greetingName || "")}" />
          <div class="help">Used for the dashboard greeting.</div>
        </div>

        <div class="field">
          <div class="label">Role</div>
          <select class="input" name="role" required>
            ${["Admin", "Manager"].map((r) => `<option value="${r}" ${String(profile.role) === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <div class="label">Title</div>
          <input class="input" name="title" placeholder="e.g., Operations Manager" value="${escapeHtml(profile.title || "")}" />
        </div>

        <div class="field">
          <div class="label">Email</div>
          <input class="input" name="email" type="email" placeholder="e.g., geraldo@cleanwash.com" value="${escapeHtml(profile.email || "")}" />
        </div>
        <div class="field">
          <div class="label">Phone</div>
          <input class="input" name="phone" placeholder="e.g., +62 812-0000-1111" value="${escapeHtml(profile.phone || "")}" />
        </div>

        <div class="field" style="grid-column: 1 / -1;">
          <div class="label">Location</div>
          <input class="input" name="location" placeholder="e.g., Jakarta HQ" value="${escapeHtml(profile.location || "")}" />
        </div>
      </div>

      <div class="form__actions">
        <button type="button" class="btn btn--ghost" data-modal-cancel>Close</button>
        <button class="btn btn--primary" type="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          Save Profile
        </button>
      </div>
    </form>
  `;

  const openProfileModal = () => {
    const p = getProfile();
    openModal({
      title: "Profile",
      sub: "Update your manager/admin details (saved to LocalStorage)",
      html: profileFormHTML(p),
    });
  };

  const handleProfileSubmit = async (form) => {
    const data = formDataToObj(form);
    const errors = [];
    errors.push(validateRequired("Display Name", data.displayName));
    if (data.email && !validateEmail(data.email)) errors.push("Email is not valid.");
    const err = errors.filter(Boolean)[0];
    if (err) return Swal.fire({ icon: "error", title: "Validation error", text: err });

    const next = {
      ...getProfile(),
      displayName: String(data.displayName || "").trim(),
      greetingName: String(data.greetingName || "").trim(),
      role: String(data.role || "").trim() || "Manager",
      title: String(data.title || "").trim(),
      email: String(data.email || "").trim(),
      phone: String(data.phone || "").trim(),
      location: String(data.location || "").trim(),
    };

    setProfile(next);
    renderProfile();
    toast("success", "Profile saved");
    closeModal();
  };

  // ---------------------------
  // Global search (quick jump)
  // ---------------------------
  const applyGlobalSearch = (q) => {
    const query = String(q || "").trim().toLowerCase();
    state.globalQ = query;
    if (!query) return;

    const customers = db.customers();
    const services = db.services();
    const { customerNameById, serviceNameById } = withLookups();
    const transactions = db.transactions().map((t) => ({
      ...t,
      customerName: customerNameById.get(t.customerId) || "Unknown customer",
      serviceName: serviceNameById.get(t.serviceId) || "Unknown service",
    }));

    const hitsCustomers = customers.filter((c) => toSearchText(c).includes(query)).length;
    const hitsServices = services.filter((s) => toSearchText(s).includes(query)).length;
    const hitsTransactions = transactions.filter((t) => toSearchText(t).includes(query)).length;

    const best = [
      { view: "customers", hits: hitsCustomers, setter: () => (state.q.customers = query) },
      { view: "services", hits: hitsServices, setter: () => (state.q.services = query) },
      { view: "transactions", hits: hitsTransactions, setter: () => (state.q.transactions = query) },
    ].sort((a, b) => b.hits - a.hits)[0];

    if (!best.hits) {
      toast("info", "No matches", "Try a different search term.");
      return;
    }

    best.setter();
    if (best.view === "customers") customerSearch.value = query;
    if (best.view === "services") serviceSearch.value = query;
    if (best.view === "transactions") transactionSearch.value = query;

    setActiveView(best.view);
    renderAll();
  };

  // ---------------------------
  // Event wiring
  // ---------------------------
  const wireEvents = () => {
    // Navigation
    navItems.forEach((btn) => {
      btn.addEventListener("click", () => setActiveView(btn.dataset.section));
    });

    // Sidebar open/close (mobile)
    $("#sidebarOpen")?.addEventListener("click", openSidebar);
    $("#sidebarClose")?.addEventListener("click", closeSidebar);

    overlay.addEventListener("click", () => {
      if (modal.classList.contains("is-visible")) closeModal();
      if (sidebar.classList.contains("is-open")) closeSidebar();
    });

    // Quick add from dashboard banner
    $$("[data-quick-add]").forEach((b) => {
      b.addEventListener("click", () => {
        const type = b.dataset.quickAdd;
        if (type === "customer") {
          setActiveView("customers");
          openCreateCustomer();
        } else {
          setActiveView("transactions");
          openCreateTransaction();
        }
      });
    });

    // "View all" button on dashboard
    $$("[data-section-link]").forEach((b) => {
      b.addEventListener("click", () => setActiveView(b.dataset.sectionLink));
    });

    // Add buttons
    addCustomerBtn.addEventListener("click", openCreateCustomer);
    addServiceBtn.addEventListener("click", openCreateService);
    addTransactionBtn.addEventListener("click", openCreateTransaction);

    // Profile
    userProfileBtn?.addEventListener("click", openProfileModal);

    // Searches
    customerSearch.addEventListener("input", (e) => {
      state.q.customers = e.target.value || "";
      renderCustomers();
    });
    serviceSearch.addEventListener("input", (e) => {
      state.q.services = e.target.value || "";
      renderServices();
    });
    transactionSearch.addEventListener("input", (e) => {
      state.q.transactions = e.target.value || "";
      renderTransactions();
    });
    transactionStatusFilter.addEventListener("change", (e) => {
      state.transactionStatus = e.target.value || "";
      renderTransactions();
    });

    // Global search (Enter to apply)
    globalSearch?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyGlobalSearch(globalSearch.value);
    });
    clearGlobalSearch?.addEventListener("click", () => {
      globalSearch.value = "";
      state.globalQ = "";
    });

    // Modal close
    $("#modalClose").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-visible")) closeModal();
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) closeSidebar();
    });

    // Table actions (event delegation)
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      try {
        if (action === "edit-customer") openEditCustomer(id);
        if (action === "delete-customer") {
          await deleteCustomer(id);
          renderAll();
        }
        if (action === "edit-service") openEditService(id);
        if (action === "delete-service") {
          await deleteService(id);
          renderAll();
        }
        if (action === "edit-transaction") openEditTransaction(id);
        if (action === "delete-transaction") {
          await deleteTransaction(id);
          renderAll();
        }
      } catch (err) {
        Swal.fire({ icon: "error", title: "Error", text: err?.message || String(err) });
      }
    });

    // Modal form events (delegation)
    modalBody.addEventListener("click", (e) => {
      const cancel = e.target.closest("[data-modal-cancel]");
      if (cancel) closeModal();
    });

    modalBody.addEventListener("submit", async (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      e.preventDefault();
      try {
        if (form.id === "customerForm") await handleCustomerSubmit(form);
        if (form.id === "serviceForm") await handleServiceSubmit(form);
        if (form.id === "transactionForm") await handleTransactionSubmit(form);
        if (form.id === "profileForm") await handleProfileSubmit(form);
      } catch (err) {
        Swal.fire({ icon: "error", title: "Error", text: err?.message || String(err) });
      }
    });

    // Transaction amount auto-fill
    modalBody.addEventListener("change", (e) => {
      const form = e.target.closest("#transactionForm");
      if (!form) return;
      if (e.target && e.target.name === "serviceId") updateAmountFromService(form);
    });

    // Keep sparkline responsive on window resize (repaint only)
    window.addEventListener("resize", () => {
      // canvas is fixed dimension; still repaint for crispness if device pixel ratio changes
      drawRevenueSpark();
    });
  };

  const ensureSweetAlert = () => {
    if (!window.Swal) return;
    Swal.mixin({
      customClass: {
        confirmButton: "btn btn--primary",
        cancelButton: "btn",
      },
      buttonsStyling: false,
    });
  };

  const init = () => {
    ensureSweetAlert();
    if (!localStorage.getItem(LS_KEYS.profile)) setProfile(defaultProfile());
    if (!seeded()) seedDemoData();
    wireEvents();
    renderAll();
    setActiveView("dashboard");
  };

  // Start
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
