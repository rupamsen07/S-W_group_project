// // special_loader.js

// async function fetchProductsFrom(url) {
//   const res = await fetch(url);
//   const html = await res.text();
//   const div = document.createElement("div");
//   div.innerHTML = html;
//   return [...div.querySelectorAll("article.product-card")];
// }

// async function gatherAllProducts() {
//   const boys = await fetchProductsFrom("boys_section/boys.html");
//   const girls = await fetchProductsFrom("girls_section/girls.html");
//   return [...boys, ...girls];
// }

// function cloneCard(article) {
//   return article.cloneNode(true); // NO CLICK BINDS — global handler handles it
// }

// async function loadSpecialPage(type, targetId) {
//   const container = document.getElementById(targetId);
//   const products = await gatherAllProducts();

//   const filtered = products.filter(p => p.dataset[type] === "true").slice(0, 4);

//   container.innerHTML = "";
//   filtered.forEach(p => container.appendChild(cloneCard(p)));
// }
