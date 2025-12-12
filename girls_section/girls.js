// girls.js — same system as boys.js but with girls categories

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach(f =>
    f.addEventListener("submit", e => e.preventDefault())
  );

  initGirlsPage();
});

/* --------------------- Utilities ----------------------*/

// AGE MAPPING — same as boys
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

// PRICE BUCKETS — identical to boys
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

// CATEGORY NORMALIZATION for girls
function normalizeCategory(raw) {
  const s = safeLower(raw);

  if (s.includes("doll")) return "Dolls";
  if (s.includes("plush") || s.includes("soft")) return "Soft Toys";
  if (s.includes("pretend") || s.includes("kitchen") || s.includes("mini")) return "Mini Sets";
  if (s.includes("beauty") || s.includes("makeup")) return "Beauty";
  if (s.includes("stem") || s.includes("science")) return "STEM";

  return raw;
}

/* ---------------- Gather products ----------------*/
async function gatherAllGirlProducts() {
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
function autoPopulateGirlFilters(products) {
  const catSel = document.getElementById("g-filter-category");
  const ageSel = document.getElementById("g-filter-age");
  const priceSel = document.getElementById("g-filter-price");

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

  // GIRL CATEGORY ORDER
  const categoryOrder = [
    "Dolls",
    "Soft Toys",
    "Mini Sets",
    "Beauty",
    "STEM"
  ];

  categoryOrder.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSel.appendChild(opt);
  });

  // AGE ORDER
  const ageOrder = ["Below 1", "1-3", "3-5", "5-7", "7-12", "12+"];

  ageOrder.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    ageSel.appendChild(opt);
  });

  // PRICE ORDER
  const priceOrder = ["Below 20", "20 to 40", "40 to 60", "60+"];

  priceOrder.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    priceSel.appendChild(opt);
  });
}

/* ---------------- Render ----------------*/
function renderGirlCardHTML(p) {
  return `
    <article class="product-card"
      data-id="${p.id}"
      data-category="${p.categoryNorm}"
      data-age="${p.ageRaw}"
      data-price="${p.price}">
      
      <div class="card-media">
        <img src="${p.img}" alt="">
      </div>

      <div class="card-body">
        <h3>${p.title}</h3>
        <p class="desc">${p.desc}</p>
        <div class="price">$${p.price.toFixed(2)}</div>
        <button class="add-to-cart">Add</button>
      </div>
    </article>
  `;
}

function renderGirls(list) {
  const grid = document.getElementById("girls-grid");
  if (!grid) return;

  grid.innerHTML = list.map(p => renderGirlCardHTML(p)).join("");
}

/* ---------------- Init page ----------------*/
async function initGirlsPage() {
  const girls = await gatherAllGirlProducts();
  window._girlsList = girls;

  autoPopulateGirlFilters(girls);
  renderGirls(girls);

  document.getElementById("g-apply")?.addEventListener("click", e => {
    e.preventDefault();
    applyGirlFilters();
  });

  document.getElementById("g-reset")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("g-filter-category").value = "all";
    document.getElementById("g-filter-age").value = "all";
    document.getElementById("g-filter-price").value = "all";
    renderGirls(girls);
  });
}

/* ---------------- Filters ----------------*/
function applyGirlFilters() {
  const cat = document.getElementById("g-filter-category").value;
  const age = document.getElementById("g-filter-age").value;
  const price = document.getElementById("g-filter-price").value;

  let list = window._girlsList.slice();

  list = list.filter(p => {
    const normCat = normalizeCategory(p.categoryRaw);

    if (cat !== "all" && safeLower(normCat) !== safeLower(cat)) return false;
    if (age !== "all" && p.ageBucket !== age) return false;
    if (price !== "all" && p.priceBucket !== price) return false;

    return true;
  });

  renderGirls(list);
}