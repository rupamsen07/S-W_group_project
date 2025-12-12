// boys.js — fully updated with new categories, ages, prices, fixed Apply + Reset

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach(f => {
    f.addEventListener("submit", e => e.preventDefault());
  });

  initBoysPage();
});

/* --------------------- Utilities ----------------------*/

// AGE MAPPING
function normalizeAge(ageRaw) {
  if (!ageRaw) return null;
  const s = String(ageRaw).trim().toLowerCase();

  if (s.includes("month") || s.startsWith("0") || s.includes("0-")) {
    return "Below 1";
  }

  const num = parseInt(s, 10);
  if (isNaN(num)) return null;

  if (num < 1) return "Below 1";
  if (num <= 3) return "1-3";
  if (num <= 5) return "3-5";
  if (num <= 7) return "5-7";
  if (num <= 12) return "7-12";
  return "12+";
}

// PRICE BUCKETS (NEW)
function priceBucket(priceRaw) {
  const p = Number(priceRaw) || 0;

  if (p < 20) return "Below 20";
  if (p <= 40) return "20 to 40";
  if (p <= 60) return "40 to 60";
  return "60+";
}

function safeLower(s) {
  return String(s || "").trim().toLowerCase();
}

// CATEGORY NORMALIZATION
function normalizeCategory(raw) {
  const s = safeLower(raw);

  if (s.includes("bey")) return "Beyblades";
  if (s.includes("game")) return "Indoor Games"; // Replace Games
  if (s.includes("outdoor")) return "Outdoor Games"; // Replace Outdoor
  if (s.includes("rc") || s.includes("vehicle")) return "Cars";

  return raw; // Default
}

/* ---------------- Gather products ----------------*/
async function gatherAllProducts() {
  const articles = document.querySelectorAll("article.product-card");

  return [...articles].map(a => {
    const rawPrice =
      a.dataset.price ||
      a.querySelector(".price")?.textContent?.replace(/[^0-9.]/g, "") ||
      "0";

    const ageRaw = a.dataset.age || "";

    return {
      id: a.dataset.id || "",
      title: a.querySelector("h3")?.textContent?.trim() || "",
      desc: a.querySelector(".desc")?.textContent?.trim() || "",
      img: a.querySelector("img")?.src || "",

      categoryRaw: a.dataset.category || "",
      categoryNorm: normalizeCategory(a.dataset.category || ""),
      category: safeLower(a.dataset.category || ""),

      ageRaw: ageRaw,
      ageBucket: normalizeAge(ageRaw),

      priceRaw: rawPrice,
      price: Number(rawPrice),
      priceBucket: priceBucket(rawPrice),

      _articleEl: a
    };
  });
}

/* ---------------- Populate filters ----------------*/
function autoPopulateFilters(products) {
  const catSel = document.getElementById("filter-category");
  const ageSel = document.getElementById("filter-age");
  const priceSel = document.getElementById("filter-price");

  if (!catSel || !ageSel || !priceSel) return;

  const reset = (sel, label) => {
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "all";
    opt.textContent = label;
    sel.appendChild(opt);
  };

  reset(catSel, "All");
  reset(ageSel, "All");
  reset(priceSel, "All");

  // CATEGORY FINAL ORDER
  const categoryOrder = [
    "Action Figures",
    "Cars",
    "Building",
    "STEM",
    "Beyblades",
    "Indoor Games",
    "Outdoor Games",
    "Sports"
  ];

  categoryOrder.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSel.appendChild(opt);
  });

  // AGE FINAL ORDER
  const ageOrder = ["Below 1", "1-3", "3-5", "5-7", "7-12", "12+"];

  ageOrder.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    ageSel.appendChild(opt);
  });

  // PRICE FINAL ORDER
  const priceOrder = ["Below 20", "20 to 40", "40 to 60", "60+"];

  priceOrder.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    priceSel.appendChild(opt);
  });
}

/* ---------------- Render ----------------*/
function renderCardHTML(product) {
  return `
    <article class="product-card"
      data-id="${product.id}"
      data-category="${product.categoryNorm}"
      data-age="${product.ageRaw}"
      data-price="${product.price}">
      
      <div class="card-media">
        <img src="${product.img}" alt="">
      </div>

      <div class="card-body">
        <h3>${product.title}</h3>
        <p class="desc">${product.desc}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart">Add</button>
      </div>
    </article>
  `;
}

function renderBoys(list) {
  const grid = document.getElementById("boys-grid");
  if (!grid) return;
  grid.innerHTML = list.map(p => renderCardHTML(p)).join("");
}

/* ---------------- Init page ----------------*/
async function initBoysPage() {
  const boys = await gatherAllProducts();
  window._boysList = boys;

  autoPopulateFilters(boys);
  renderBoys(boys);

  document.getElementById("apply-filters")?.addEventListener("click", e => {
    e.preventDefault();
    applyFilters();
  });

  document.getElementById("reset-filters")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-age").value = "all";
    document.getElementById("filter-price").value = "all";
    renderBoys(boys);
  });
}

/* ---------------- Filters ----------------*/
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const age = document.getElementById("filter-age").value;
  const price = document.getElementById("filter-price").value;

  let list = window._boysList.slice();

  list = list.filter(p => {
    const normCat = normalizeCategory(p.categoryRaw);

    if (cat !== "all" && safeLower(normCat) !== safeLower(cat)) return false;
    if (age !== "all" && p.ageBucket !== age) return false;
    if (price !== "all" && p.priceBucket !== price) return false;

    return true;
  });

  renderBoys(list);
}