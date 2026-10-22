"use strict";

/* =====================================
   FINPILOT — FRONTEND APPLICATION
   Demo data only. No bank integration.
===================================== */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const STORAGE_KEY = "finpilot_demo_v1";

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Business",
  "Other"
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other"
];

const categoryIcons = {
  Food: "🍽",
  Transport: "↗",
  Shopping: "◇",
  Bills: "▤",
  Health: "✚",
  Entertainment: "♫",
  Education: "▣",
  Business: "▥",
  Salary: "₹",
  Freelance: "✎",
  Investment: "↗",
  Gift: "♡",
  Other: "•"
};

const defaultBudgets = {
  Food: 5000,
  Transport: 2000,
  Shopping: 3000,
  Bills: 2500,
  Health: 1500,
  Entertainment: 1500,
  Education: 2500,
  Business: 5000,
  Other: 1500
};

const defaultTransactions = [
  {
    id: "t1",
    description: "Monthly Salary",
    category: "Salary",
    type: "income",
    amount: 45000,
    date: "2026-10-01"
  },
  {
    id: "t2",
    description: "Freelance Project",
    category: "Freelance",
    type: "income",
    amount: 8500,
    date: "2026-10-04"
  },
  {
    id: "t3",
    description: "Grocery Shopping",
    category: "Food",
    type: "expense",
    amount: 1250,
    date: "2026-10-05"
  },
  {
    id: "t4",
    description: "Monthly Electricity",
    category: "Bills",
    type: "expense",
    amount: 950,
    date: "2026-10-06"
  },
  {
    id: "t5",
    description: "Bus and Cab",
    category: "Transport",
    type: "expense",
    amount: 420,
    date: "2026-10-08"
  },
  {
    id: "t6",
    description: "Online Course",
    category: "Education",
    type: "expense",
    amount: 1200,
    date: "2026-10-09"
  },
  {
    id: "t7",
    description: "Client Payment",
    category: "Freelance",
    type: "income",
    amount: 6000,
    date: "2026-10-10"
  },
  {
    id: "t8",
    description: "Dinner",
    category: "Food",
    type: "expense",
    amount: 650,
    date: "2026-10-11"
  },
  {
    id: "t9",
    description: "Office Supplies",
    category: "Business",
    type: "expense",
    amount: 900,
    date: "2026-10-12"
  },
  {
    id: "t10",
    description: "Clothing",
    category: "Shopping",
    type: "expense",
    amount: 1800,
    date: "2026-10-14"
  },
  {
    id: "t11",
    description: "Medicine",
    category: "Health",
    type: "expense",
    amount: 350,
    date: "2026-10-15"
  }
];

const defaultGoals = [
  {
    id: "g1",
    name: "Emergency Fund",
    target: 50000,
    saved: 18000
  },
  {
    id: "g2",
    name: "New Laptop",
    target: 60000,
    saved: 25000
  },
  {
    id: "g3",
    name: "Education",
    target: 30000,
    saved: 12000
  }
];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function todayString() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function dateOffset(monthOffset, day = 5) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function getDefaultState() {
  const transactions = defaultTransactions.map(t => ({ ...t }));

  // Add sample transactions for recent months so the charts
  // show a useful trend without pretending to use bank data.
  const historical = [
    { month: -5, income: 38000, expense: 25000 },
    { month: -4, income: 42000, expense: 28000 },
    { month: -3, income: 40000, expense: 26000 },
    { month: -2, income: 44000, expense: 31000 },
    { month: -1, income: 43000, expense: 29000 }
  ];

  historical.forEach((item, index) => {
    transactions.push({
      id: `history-income-${index}`,
      description: "Historical Salary (Demo)",
      category: "Salary",
      type: "income",
      amount: item.income,
      date: dateOffset(item.month, 1)
    });

    transactions.push({
      id: `history-expense-${index}`,
      description: "Historical Expenses (Demo)",
      category: "Other",
      type: "expense",
      amount: item.expense,
      date: dateOffset(item.month, 12)
    });
  });

  return {
    startingBalance: 55000,
    transactions,
    budgets: { ...defaultBudgets },
    goals: defaultGoals.map(g => ({ ...g })),
    currency: "INR",
    reducedMotion: false
  };
}

function validState(s) {
  return s &&
    typeof s === "object" &&
    Array.isArray(s.transactions) &&
    s.transactions.every(t =>
      t &&
      typeof t.description === "string" &&
      Number.isFinite(Number(t.amount)) &&
      Number(t.amount) > 0 &&
      ["income", "expense"].includes(t.type) &&
      /^\d{4}-\d{2}-\d{2}$/.test(t.date)
    ) &&
    s.budgets &&
    typeof s.budgets === "object" &&
    Array.isArray(s.goals) &&
    Number.isFinite(Number(s.startingBalance));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw);

    if (validState(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Could not load saved demo data.", error);
  }

  return getDefaultState();
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("Could not save demo data.", error);
    showToast("Browser storage is unavailable. Changes may not persist.", true);
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  const amount = Number(value) || 0;

  const currency = state.currency || "INR";
  const locale = currency === "INR" ? "en-IN" : "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function shortMoney(value) {
  const amount = Number(value) || 0;

  if (Math.abs(amount) >= 100000) {
    return `${money(amount / 100000)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `${money(amount / 1000)}k`;
  }

  return money(amount);
}

function formatDate(dateString) {
  const d = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(d.getTime())) {
    return dateString;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function monthTransactions(month) {
  return state.transactions.filter(t => t.date.startsWith(month));
}

function sumType(transactions, type) {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function totalsForMonth(month) {
  const tx = monthTransactions(month);

  const income = sumType(tx, "income");
  const expenses = sumType(tx, "expense");

  return {
    income,
    expenses,
    savings: income - expenses,
    transactions: tx
  };
}

function totalBalance() {
  const net = state.transactions.reduce((sum, t) => {
    return sum + (
      t.type === "income"
        ? Number(t.amount)
        : -Number(t.amount)
    );
  }, 0);

  return Number(state.startingBalance) + net;
}

function selectedMonth(inputId) {
  return $(inputId)?.value || currentMonth();
}


/* =====================================
   TOASTS
===================================== */

function showToast(message, error = false) {
  const container = $("#toastContainer");

  if (!container) return;

  const toast = document.createElement("div");
  toast.className = error ? "toast error" : "toast";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}


/* =====================================
   LANDING PAGE
===================================== */

$("#landingYear").textContent = new Date().getFullYear();

const landingMenuBtn = $("#landingMenuBtn");
const landingLinks = $("#landingLinks");

landingMenuBtn.addEventListener("click", () => {
  const isOpen = landingLinks.classList.toggle("open");
  landingMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

$$(".landing-links a").forEach(link => {
  link.addEventListener("click", () => {
    landingLinks.classList.remove("open");
    landingMenuBtn.setAttribute("aria-expanded", "false");
  });
});

let yearlyBilling = false;

$("#billingToggle").addEventListener("click", () => {
  yearlyBilling = !yearlyBilling;

  const button = $("#billingToggle");
  button.setAttribute("aria-pressed", String(yearlyBilling));

  $$("[data-monthly][data-yearly]").forEach(element => {
    const value = yearlyBilling
      ? element.dataset.yearly
      : element.dataset.monthly;

    element.textContent = `₹${value}`;
  });
});


/* =====================================
   VIEW NAVIGATION
===================================== */

const viewTitles = {
  overview: "Overview",
  transactions: "Transactions",
  budgets: "Budgets",
  savings: "Savings Goals",
  analytics: "Analytics",
  settings: "Settings"
};

let currentView = "overview";

function showView(name) {
  if (!viewTitles[name]) return;

  currentView = name;

  $$(".app-view").forEach(view => {
    view.classList.toggle("hidden", view.id !== `view-${name}`);
  });

  $$(".nav-item[data-view]").forEach(button => {
    const active = button.dataset.view === name;

    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  $("#breadcrumbTitle").textContent = viewTitles[name];

  closeSidebar();

  if (name === "overview") {
    renderOverview();
  } else if (name === "transactions") {
    renderTransactions();
  } else if (name === "budgets") {
    renderBudgets();
  } else if (name === "savings") {
    renderSavings();
  } else if (name === "analytics") {
    renderAnalytics();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

$$("[data-show-view]").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.showView);
  });
});

function openDashboard() {
  $("#landingPage").classList.add("hidden");
  $("#dashboardApp").classList.remove("hidden");

  showView("overview");
}

$$("[data-open-dashboard]").forEach(button => {
  button.addEventListener("click", openDashboard);
});

$("#backToSite").addEventListener("click", () => {
  $("#dashboardApp").classList.add("hidden");
  $("#landingPage").classList.remove("hidden");
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* =====================================
   MOBILE SIDEBAR
===================================== */

const sidebar = $("#sidebar");
const sidebarOverlay = $("#sidebarOverlay");
const sidebarToggle = $("#sidebarToggle");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.remove("hidden");
  sidebarToggle.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.add("hidden");
  sidebarToggle.setAttribute("aria-expanded", "false");
}

sidebarToggle.addEventListener("click", () => {
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarOverlay.addEventListener("click", closeSidebar);


/* =====================================
   TRANSACTION CATEGORY OPTIONS
===================================== */

function populateTransactionCategories() {
  const select = $("#transactionCategory");

  const update = () => {
    const type = $('input[name="transactionType"]:checked').value;

    const categories = type === "income"
      ? incomeCategories
      : expenseCategories;

    select.innerHTML = categories
      .map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
      .join("");
  };

  $$('input[name="transactionType"]').forEach(radio => {
    radio.addEventListener("change", update);
  });

  update();
}

populateTransactionCategories();


/* =====================================
   TRANSACTION MODAL
===================================== */

const transactionModal = $("#transactionModal");
const transactionForm = $("#transactionForm");

function openTransactionModal() {
  transactionForm.reset();

  $("#transactionDate").value = todayString();
  $('input[name="transactionType"][value="expense"]').checked = true;

  populateTransactionCategories();

  transactionModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  setTimeout(() => $("#transactionDescription").focus(), 50);
}

function closeTransactionModal() {
  transactionModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

$$("[data-open-transaction]").forEach(button => {
  button.addEventListener("click", openTransactionModal);
});

$("#closeTransactionModal").addEventListener("click", closeTransactionModal);
$("#cancelTransaction").addEventListener("click", closeTransactionModal);

transactionModal.addEventListener("click", event => {
  if (event.target === transactionModal) {
    closeTransactionModal();
  }
});

transactionForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!transactionForm.reportValidity()) return;

  const description = $("#transactionDescription").value.trim();
  const amount = Number($("#transactionAmount").value);
  const category = $("#transactionCategory").value;
  const date = $("#transactionDate").value;

  const type = $('input[name="transactionType"]:checked').value;

  if (!description || description.length > 80) {
    showToast("Enter a valid transaction description.", true);
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) {
    showToast("Enter an amount greater than zero.", true);
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    showToast("Select a valid transaction date.", true);
    return;
  }

  const validCategories = type === "income"
    ? incomeCategories
    : expenseCategories;

  if (!validCategories.includes(category)) {
    showToast("Select a valid category.", true);
    return;
  }

  state.transactions.push({
    id: makeId(),
    description,
    amount,
    category,
    type,
    date
  });

  saveState();
  closeTransactionModal();
  renderAll();

  showToast("Transaction added successfully.");
});


/* =====================================
   TRANSACTION MANAGEMENT
===================================== */

function makeId() {
  return `fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function renderCategoryFilter() {
  const select = $("#transactionCategoryFilter");
  const previous = select.value;

  const categories = [...new Set(
    state.transactions.map(t => t.category)
  )].sort();

  select.innerHTML =
    '<option value="all">All Categories</option>' +
    categories.map(category =>
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    ).join("");

  if (categories.includes(previous)) {
    select.value = previous;
  }
}

function getFilteredTransactions() {
  const query = $("#transactionSearch").value.trim().toLowerCase();
  const type = $("#transactionTypeFilter").value;
  const category = $("#transactionCategoryFilter").value;
  const sort = $("#transactionSort").value;

  let result = [...state.transactions];

  if (query) {
    result = result.filter(t =>
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.date.includes(query)
    );
  }

  if (type !== "all") {
    result = result.filter(t => t.type === type);
  }

  if (category !== "all") {
    result = result.filter(t => t.category === category);
  }

  result.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.date.localeCompare(b.date);

      case "highest":
        return Number(b.amount) - Number(a.amount);

      case "lowest":
        return Number(a.amount) - Number(b.amount);

      default:
        return b.date.localeCompare(a.date);
    }
  });

  return result;
}

function transactionRow(t) {
  const income = t.type === "income";
  const icon = categoryIcons[t.category] || "•";

  return `
    <tr>
      <td>
        <div class="transaction-name">
          <span class="transaction-symbol">${escapeHTML(icon)}</span>
          <div>
            <strong>${escapeHTML(t.description)}</strong>
            <small>${escapeHTML(t.category)}</small>
          </div>
        </div>
      </td>

      <td>${escapeHTML(t.category)}</td>

      <td>${escapeHTML(formatDate(t.date))}</td>

      <td>
        <span class="type-pill ${income ? "type-income" : "type-expense"}">
          ${income ? "INCOME" : "EXPENSE"}
        </span>
      </td>

      <td class="${income ? "amount-income" : "amount-expense"}">
        ${income ? "+" : "−"}${money(t.amount)}
      </td>

      <td>
        <button class="delete-transaction"
          data-delete-transaction="${escapeHTML(t.id)}"
          aria-label="Delete ${escapeHTML(t.description)}">
          Delete
        </button>
      </td>
    </tr>
  `;
}

function renderTransactions() {
  renderCategoryFilter();

  const filtered = getFilteredTransactions();

  $("#transactionTableBody").innerHTML =
    filtered.map(transactionRow).join("");

  $("#transactionEmpty").classList.toggle("hidden", filtered.length > 0);

  const income = sumType(filtered, "income");
  const expenses = sumType(filtered, "expense");

  $("#transactionCount").textContent = filtered.length;
  $("#filteredIncome").textContent = money(income);
  $("#filteredExpenses").textContent = money(expenses);
}

["transactionSearch", "transactionTypeFilter",
 "transactionCategoryFilter", "transactionSort"].forEach(id => {
  $(`#${id}`).addEventListener("input", renderTransactions);
  $(`#${id}`).addEventListener("change", renderTransactions);
});

$("#transactionTableBody").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-transaction]");

  if (!button) return;

  const id = button.dataset.deleteTransaction;
  const transaction = state.transactions.find(t => t.id === id);

  if (!transaction) return;

  if (!confirm(`Delete "${transaction.description}"?`)) return;

  state.transactions = state.transactions.filter(t => t.id !== id);

  saveState();
  renderAll();

  showToast("Transaction deleted.");
});


/* =====================================
   CSV EXPORT
===================================== */

function csvEscape(value) {
  let text = String(value ?? "");

  // Avoid interpreting exported text as a spreadsheet formula.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

$("#exportCSV").addEventListener("click", () => {
  const rows = getFilteredTransactions();

  if (!rows.length) {
    showToast("There are no transactions to export.", true);
    return;
  }

  const header = [
    "Description",
    "Category",
    "Type",
    "Amount",
    "Date",
    "Currency"
  ];

  const csvRows = [
    header.map(csvEscape).join(","),
    ...rows.map(t => [
      t.description,
      t.category,
      t.type,
      Number(t.amount).toFixed(2),
      t.date,
      state.currency
    ].map(csvEscape).join(","))
  ];

  const blob = new Blob(
    ["\uFEFF" + csvRows.join("\r\n")],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "finpilot-transactions.csv";

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showToast("CSV exported successfully.");
});


/* =====================================
   BUDGET MANAGEMENT
===================================== */

function spentInCategory(category, month) {
  return monthTransactions(month)
    .filter(t => t.type === "expense" && t.category === category)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function budgetCard(category, month) {
  const budget = Number(state.budgets[category]) || 0;
  const spent = spentInCategory(category, month);

  const remaining = budget - spent;
  const percent = budget > 0 ? spent / budget * 100 : 0;

  const width = Math.min(100, percent);
  const over = spent > budget;

  return `
    <article class="budget-card">

      <div class="budget-card-top">
        <div class="transaction-name">
          <span class="category-icon">${escapeHTML(categoryIcons[category] || "•")}</span>
          <div>
            <h3>${escapeHTML(category)}</h3>
            <p>${over ? "Budget exceeded" : "Monthly spending limit"}</p>
          </div>
        </div>

        <span class="${over ? "negative" : "positive"} small">
          ${Math.round(percent)}%
        </span>
      </div>

      <div class="goal-amounts">
        <strong>${money(spent)}</strong>
        <span>of ${money(budget)}</span>
      </div>

      <div class="progress-track">
        <div class="progress-fill ${over ? "over-budget" : ""}"
          style="width:${width}%"></div>
      </div>

      <div class="budget-meta">
        <span>${over ? "Over by" : "Remaining"}</span>
        <strong class="${over ? "negative" : ""}">
          ${money(Math.abs(remaining))}
        </strong>
      </div>

      ${over ? `<p class="budget-warning">You have exceeded this budget.</p>` : ""}

      <div class="budget-edit">
        <label for="budget-${escapeHTML(category)}">Budget limit</label>
        <input
          id="budget-${escapeHTML(category)}"
          type="number"
          min="0"
          max="1000000000"
          step="0.01"
          value="${budget}"
          data-budget-input="${escapeHTML(category)}"
          aria-label="${escapeHTML(category)} budget limit"
        >
      </div>

    </article>
  `;
}

function renderBudgets() {
  const month = selectedMonth("#budgetMonth");

  const categories = [...new Set([
    ...expenseCategories,
    ...Object.keys(state.budgets)
  ])];

  const totalBudget = categories.reduce(
    (sum, c) => sum + (Number(state.budgets[c]) || 0), 0
  );

  const totalSpent = monthTransactions(month)
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  $("#budgetTotal").textContent = money(totalBudget);
  $("#budgetSpent").textContent = money(totalSpent);
  $("#budgetRemaining").textContent = money(totalBudget - totalSpent);

  $("#budgetCards").innerHTML = categories
    .map(c => budgetCard(c, month))
    .join("");
}

$("#budgetMonth").value = currentMonth();

$("#budgetMonth").addEventListener("change", renderBudgets);

$("#budgetCards").addEventListener("change", event => {
  const input = event.target.closest("[data-budget-input]");

  if (!input) return;

  const category = input.dataset.budgetInput;
  const value = Number(input.value);

  if (!Number.isFinite(value) || value < 0 || value > 1000000000) {
    showToast("Enter a valid budget amount.", true);
    renderBudgets();
    return;
  }

  state.budgets[category] = value;

  saveState();
  renderBudgets();
  renderOverview();

  showToast(`${category} budget updated.`);
});


/* =====================================
   SAVINGS GOALS
===================================== */

const goalModal = $("#goalModal");
const goalForm = $("#goalForm");

function openGoalModal() {
  goalForm.reset();
  $("#goalInitial").value = "0";

  goalModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  setTimeout(() => $("#goalName").focus(), 50);
}

function closeGoalModal() {
  goalModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

$("#addGoalBtn").addEventListener("click", openGoalModal);

$("#closeGoalModal").addEventListener("click", closeGoalModal);
$("#cancelGoal").addEventListener("click", closeGoalModal);

goalModal.addEventListener("click", event => {
  if (event.target === goalModal) {
    closeGoalModal();
  }
});

goalForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!goalForm.reportValidity()) return;

  const name = $("#goalName").value.trim();
  const target = Number($("#goalTarget").value);
  const saved = Number($("#goalInitial").value);

  if (!name || name.length > 60) {
    showToast("Enter a valid goal name.", true);
    return;
  }

  if (
    !Number.isFinite(target) ||
    !Number.isFinite(saved) ||
    target <= 0 ||
    saved < 0 ||
    target > 1000000000 ||
    saved > 1000000000
  ) {
    showToast("Enter valid savings amounts.", true);
    return;
  }

  state.goals.push({
    id: makeId(),
    name,
    target,
    saved
  });

  saveState();
  closeGoalModal();
  renderAll();

  showToast("Savings goal created.");
});

function savingsCard(goal) {
  const target = Number(goal.target);
  const saved = Number(goal.saved);

  const percent = target > 0 ? saved / target * 100 : 0;
  const width = Math.min(100, percent);
  const completed = saved >= target;

  return `
    <article class="savings-card">

      <div class="savings-card-top">
        <div class="transaction-name">
          <span class="category-icon">◎</span>
          <div>
            <h3>${escapeHTML(goal.name)}</h3>
            <p>${completed ? "Goal completed" : "Keep moving forward"}</p>
          </div>
        </div>

        <span class="${completed ? "positive" : "muted"} small">
          ${Math.round(percent)}%
        </span>
      </div>

      <div class="goal-amounts">
        <strong>${money(saved)}</strong>
        <span>of ${money(target)}</span>
      </div>

      <div class="progress-track">
        <div class="progress-fill"
          style="width:${width}%"></div>
      </div>

      <div class="goal-progress-label">
        <span>${completed ? "Target reached" : "Still needed"}</span>
        <strong>${money(Math.max(0, target - saved))}</strong>
      </div>

      <div class="goal-actions">
        <button class="contribute-goal"
          data-contribute-goal="${escapeHTML(goal.id)}"
          ${completed ? "disabled" : ""}>
          + Add Contribution
        </button>

        <button class="delete-goal"
          data-delete-goal="${escapeHTML(goal.id)}">
          Delete
        </button>
      </div>

    </article>
  `;
}

function renderSavings() {
  const saved = state.goals.reduce(
    (sum, goal) => sum + Number(goal.saved), 0
  );

  const target = state.goals.reduce(
    (sum, goal) => sum + Number(goal.target), 0
  );

  const completed = state.goals.filter(
    goal => Number(goal.saved) >= Number(goal.target)
  ).length;

  $("#savedTotal").textContent = money(saved);
  $("#goalTargetTotal").textContent = money(target);
  $("#completedGoals").textContent = completed;

  $("#savingsCards").innerHTML = state.goals.length
    ? state.goals.map(savingsCard).join("")
    : `
      <div class="panel empty-state">
        <h3>No savings goals yet</h3>
        <p>Create a goal to start tracking your progress.</p>
      </div>
    `;
}

$("#savingsCards").addEventListener("click", event => {
  const contributeButton = event.target.closest("[data-contribute-goal]");
  const deleteButton = event.target.closest("[data-delete-goal]");

  if (contributeButton) {
    const id = contributeButton.dataset.contributeGoal;
    const goal = state.goals.find(g => g.id === id);

    if (!goal) return;

    const remaining = Math.max(
      0,
      Number(goal.target) - Number(goal.saved)
    );

    const input = prompt(
      `How much would you like to contribute to "${goal.name}"?\nRemaining: ${money(remaining)}`
    );

    if (input === null) return;

    const amount = Number(input);

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) {
      showToast("Enter a valid contribution amount.", true);
      return;
    }

    goal.saved = Number(goal.saved) + amount;

    saveState();
    renderAll();

    showToast("Savings contribution recorded.");
  }

  if (deleteButton) {
    const id = deleteButton.dataset.deleteGoal;
    const goal = state.goals.find(g => g.id === id);

    if (!goal) return;

    if (!confirm(`Delete the "${goal.name}" savings goal?`)) return;

    state.goals = state.goals.filter(g => g.id !== id);

    saveState();
    renderAll();

    showToast("Savings goal deleted.");
  }
});


/* =====================================
   ANALYTICS AND FINANCIAL INSIGHTS
===================================== */

function monthLabel(monthString) {
  const [year, month] = monthString.split("-").map(Number);

  return new Date(year, month - 1, 1)
    .toLocaleDateString("en-IN", { month: "short" });
}

function lastSixMonths() {
  const result = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    result.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  return result;
}

function drawBarChart(canvasId, months) {
  const canvas = $(`#${canvasId}`);

  if (!canvas || canvas.clientWidth === 0) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const width = Math.max(260, rect.width);
  const height = 240;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const values = months.map(month => {
    const totals = totalsForMonth(month);

    return {
      month,
      income: totals.income,
      expenses: totals.expenses
    };
  });

  const maxValue = Math.max(
    1000,
    ...values.flatMap(v => [v.income, v.expenses])
  );

  const left = 45;
  const right = 12;
  const top = 20;
  const bottom = 40;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i++) {
    const y = top + chartHeight * i / 4;
    const amount = maxValue * (1 - i / 4);

    ctx.strokeStyle = "#293a35";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();

    ctx.fillStyle = "#91a49b";
    ctx.fillText(
      shortMoney(amount),
      left - 7,
      y
    );
  }

  const groupWidth = chartWidth / values.length;
  const barWidth = Math.min(17, groupWidth * 0.25);
  const gap = Math.max(3, barWidth * 0.2);

  values.forEach((item, index) => {
    const center = left + groupWidth * (index + 0.5);

    const incomeHeight = item.income / maxValue * chartHeight;
    const expenseHeight = item.expenses / maxValue * chartHeight;

    ctx.fillStyle = "#48e0a0";
    ctx.fillRect(
      center - barWidth - gap / 2,
      top + chartHeight - incomeHeight,
      barWidth,
      incomeHeight
    );

    ctx.fillStyle = "#ff8f93";
    ctx.fillRect(
      center + gap / 2,
      top + chartHeight - expenseHeight,
      barWidth,
      expenseHeight
    );

    ctx.fillStyle = "#91a49b";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillText(
      monthLabel(item.month),
      center,
      height - bottom + 12
    );
  });
}

function categorySpending(month) {
  const totals = {};

  monthTransactions(month)
    .filter(t => t.type === "expense")
    .forEach(t => {
      totals[t.category] =
        (totals[t.category] || 0) + Number(t.amount);
    });

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1]);
}

function insightCards(month) {
  const totals = totalsForMonth(month);
  const categories = categorySpending(month);

  const savingsRate = totals.income > 0
    ? totals.savings / totals.income * 100
    : 0;

  const topCategory = categories[0];

  const cards = [];

  cards.push({
    icon: "↗",
    title: "Net monthly cash flow",
    text: totals.savings >= 0
      ? `You recorded ${money(totals.savings)} more income than expenses this month.`
      : `Your recorded expenses exceeded income by ${money(Math.abs(totals.savings))}.`
  });

  cards.push({
    icon: "◎",
    title: "Savings rate",
    text: totals.income > 0
      ? `${Math.round(savingsRate)}% of recorded income remains after recorded expenses.`
      : "Record income to calculate a meaningful savings rate."
  });

  if (topCategory) {
    const share = totals.expenses > 0
      ? topCategory[1] / totals.expenses * 100
      : 0;

    cards.push({
      icon: "▥",
      title: "Largest expense category",
      text: `${topCategory[0]} represents ${Math.round(share)}% of your recorded expenses.`
    });
  } else {
    cards.push({
      icon: "▥",
      title: "Spending categories",
      text: "Add expense transactions to discover your biggest spending categories."
    });
  }

  const budgetTotal = Object.values(state.budgets)
    .reduce((sum, value) => sum + Number(value || 0), 0);

  const overBudget = Object.keys(state.budgets).filter(category => {
    return spentInCategory(category, month) >
      Number(state.budgets[category] || 0);
  });

  cards.push({
    icon: "◷",
    title: "Budget check",
    text: overBudget.length
      ? `${overBudget.length} categories are over their current budget limits.`
      : `No category is currently over budget. Total planned limits: ${money(budgetTotal)}.`
  });

  return cards.map(card => `
    <article class="insight-card">
      <span>${escapeHTML(card.icon)}</span>
      <strong>${escapeHTML(card.title)}</strong>
      <p>${escapeHTML(card.text)}</p>
    </article>
  `).join("");
}

function renderCategoryBreakdown(month) {
  const entries = categorySpending(month);
  const total = entries.reduce((sum, item) => sum + item[1], 0);

  if (!entries.length) {
    $("#categoryBreakdown").innerHTML = `
      <div class="empty-state">
        <p>No expense data for this month.</p>
      </div>
    `;
    return;
  }

  $("#categoryBreakdown").innerHTML = entries.map(([category, amount]) => {
    const percent = total > 0 ? amount / total * 100 : 0;

    return `
      <div class="breakdown-row">
        <div class="budget-row-head">
          <span>${escapeHTML(category)}</span>
          <strong>${money(amount)}</strong>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>

        <div class="budget-meta">
          <span>${Math.round(percent)}% of spending</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderAnalytics() {
  const month = selectedMonth("#analyticsMonth");
  const totals = totalsForMonth(month);

  const savingsRate = totals.income > 0
    ? totals.savings / totals.income * 100
    : 0;

  $("#analyticsIncome").textContent = money(totals.income);
  $("#analyticsExpenses").textContent = money(totals.expenses);
  $("#analyticsSavingsRate").textContent = `${Math.round(savingsRate)}%`;

  renderCategoryBreakdown(month);

  $("#analyticsInsights").innerHTML = insightCards(month);

  drawBarChart("analyticsChart", lastSixMonths());
}

$("#analyticsMonth").value = currentMonth();

$("#analyticsMonth").addEventListener("change", renderAnalytics);


/* =====================================
   OVERVIEW
===================================== */

function renderOverview() {
  const month = selectedMonth("#overviewMonth");
  const totals = totalsForMonth(month);

  $("#totalBalance").textContent = money(totalBalance());
  $("#totalIncome").textContent = money(totals.income);
  $("#totalExpenses").textContent = money(totals.expenses);
  $("#netSavings").textContent = money(totals.savings);

  const categories = [...new Set([
    ...expenseCategories,
    ...Object.keys(state.budgets)
  ])];

  $("#overviewBudgets").innerHTML = categories
    .filter(c => Number(state.budgets[c]) > 0)
    .slice(0, 4)
    .map(category => {
      const budget = Number(state.budgets[category]);
      const spent = spentInCategory(category, month);
      const percent = spent / budget * 100;

      return `
        <div>
          <div class="budget-row-head">
            <span>${escapeHTML(category)}</span>
            <strong>${money(spent)}</strong>
          </div>

          <div class="progress-track">
            <div class="progress-fill ${percent > 100 ? "over-budget" : ""}"
              style="width:${Math.min(100, percent)}%"></div>
          </div>

          <div class="budget-meta">
            <span>${Math.round(percent)}% used</span>
            <span>${money(budget)} limit</span>
          </div>
        </div>
      `;
    }).join("");

  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  $("#recentTransactions").innerHTML = recent.length
    ? `
      <div class="transaction-table-wrap">
        <table class="transaction-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(t => `
              <tr>
                <td>
                  <div class="transaction-name">
                    <span class="transaction-symbol">
                      ${escapeHTML(categoryIcons[t.category] || "•")}
                    </span>
                    <div>
                      <strong>${escapeHTML(t.description)}</strong>
                      <small>${escapeHTML(t.category)}</small>
                    </div>
                  </div>
                </td>
                <td>${escapeHTML(formatDate(t.date))}</td>
                <td>
                  <span class="type-pill ${t.type === "income" ? "type-income" : "type-expense"}">
                    ${t.type === "income" ? "INCOME" : "EXPENSE"}
                  </span>
                </td>
                <td class="${t.type === "income" ? "amount-income" : "amount-expense"}">
                  ${t.type === "income" ? "+" : "−"}${money(t.amount)}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `
    : `<div class="empty-state"><p>No transactions yet.</p></div>`;

  $("#overviewInsights").innerHTML = insightCards(month);

  drawBarChart("overviewChart", lastSixMonths());
}

$("#overviewMonth").value = currentMonth();

$("#overviewMonth").addEventListener("change", renderOverview);


/* =====================================
   SETTINGS
===================================== */

$("#currencySelect").value = state.currency || "INR";
$("#reducedMotion").checked = Boolean(state.reducedMotion);

$("#currencySelect").addEventListener("change", event => {
  state.currency = event.target.value;

  saveState();
  renderAll();

  showToast("Currency display updated.");
});

$("#reducedMotion").addEventListener("change", event => {
  state.reducedMotion = event.target.checked;

  document.documentElement.style.scrollBehavior =
    state.reducedMotion ? "auto" : "";

  saveState();

  showToast("Motion preference updated.");
});

function resetDemoData() {
  if (!confirm("Reset all demo changes to the original sample data?")) {
    return;
  }

  state = getDefaultState();

  saveState();

  $("#overviewMonth").value = currentMonth();
  $("#budgetMonth").value = currentMonth();
  $("#analyticsMonth").value = currentMonth();

  $("#currencySelect").value = state.currency;
  $("#reducedMotion").checked = false;

  renderAll();

  showToast("Demo data reset.");
}

$("#resetDemo").addEventListener("click", resetDemoData);

$("#clearDemo").addEventListener("click", () => {
  if (!confirm("Clear all transactions, budgets and savings goals? This cannot be undone.")) {
    return;
  }

  state.transactions = [];
  state.budgets = Object.fromEntries(
    expenseCategories.map(category => [category, 0])
  );
  state.goals = [];
  state.startingBalance = 0;

  saveState();
  renderAll();

  showToast("Demo data cleared.");
});


/* =====================================
   MODAL KEYBOARD ACCESSIBILITY
===================================== */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!transactionModal.classList.contains("hidden")) {
      closeTransactionModal();
    }

    if (!goalModal.classList.contains("hidden")) {
      closeGoalModal();
    }

    closeSidebar();
  }
});


/* =====================================
   RENDER ALL VIEWS
===================================== */

function renderAll() {
  renderOverview();
  renderTransactions();
  renderBudgets();
  renderSavings();
  renderAnalytics();
}

window.addEventListener("resize", () => {
  if (currentView === "overview") {
    drawBarChart("overviewChart", lastSixMonths());
  }

  if (currentView === "analytics") {
    drawBarChart("analyticsChart", lastSixMonths());
  }
});


/* =====================================
   INITIALIZE APPLICATION
===================================== */

if (state.reducedMotion) {
  document.documentElement.style.scrollBehavior = "auto";
}

renderAll();
showView("overview");