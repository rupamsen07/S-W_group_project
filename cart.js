document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  document.getElementById("checkout-btn")?.addEventListener("click", onCheckout);
});

function renderCartPage() {
  const wrap = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const cart = getCart();

  wrap.innerHTML = "";
  if (cart.length === 0) {
    wrap.innerHTML = `<p>Your cart is empty</p>`;
    totalEl.textContent = "$0.00";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.qty * item.price;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-img"><img src="${item.img}" /></div>
      <div class="cart-title">${item.title}</div>

      <div class="cart-qty">
        <button class="dec" data-id="${item.id}">-</button>
        <span>${item.qty}</span>
        <button class="inc" data-id="${item.id}">+</button>
      </div>

      <div class="cart-price">$${(item.price * item.qty).toFixed(2)}</div>
      <button class="remove" data-id="${item.id}">Remove</button>
    `;

    wrap.appendChild(row);
  });

  totalEl.textContent = "$" + total.toFixed(2);

  wrap.querySelectorAll(".inc").forEach(b =>
    b.addEventListener("click", () => changeQty(b.dataset.id, 1))
  );
  wrap.querySelectorAll(".dec").forEach(b =>
    b.addEventListener("click", () => changeQty(b.dataset.id, -1))
  );
  wrap.querySelectorAll(".remove").forEach(b =>
    b.addEventListener("click", () => removeItem(b.dataset.id))
  );
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }

  renderCartPage();
}

function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCartPage();
}

function onCheckout() {
  if (getCart().length === 0) {
    alert("Cart empty");
    return;
  }
  alert("Checkout complete");
  saveCart([]);
  renderCartPage();
}
