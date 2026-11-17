/* =====================================================
   shop.js  -  makes your pages interactive
   Works on BOTH index.html and menu.html.
   You do NOT need to change your food cards.
   This file finds every .menu and .menu2 card
   and adds [- 1 +]  [ADD TO CART]  [heart] to it.
   ===================================================== */


/* ---------- 1. SAVING DATA IN THE BROWSER ----------
   localStorage keeps the cart and favourites even when
   you move from index.html to menu.html or refresh.      */

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let cart = load("cart", {});              // example: { "Fried Rice-350": {name, price, qty} }
let favourites = load("favourites", []);  // example: ["Fried Rice-350", "Suya-20"]


/* ---------- 2. ADD THE CART ICON + CART PANEL TO THE PAGE ----------
   We build this with JavaScript so you don't have to
   copy the same HTML into every page.                    */

// 2a. Cart icon (and mobile menu button) inside your header
document.querySelector("header .container").insertAdjacentHTML("beforeend", `
  <div class="header-icons">
    <button id="cartBtn" type="button" aria-label="Open cart">
      <i class="fa-solid fa-cart-shopping"></i>
      <span id="cartCount">0</span>
    </button>
    <button id="menuToggle" type="button" aria-label="Open menu">
      <i class="fa-solid fa-bars"></i>
    </button>
  </div>
`);

// 2b. The cart panel that slides in from the right + a small message box
document.body.insertAdjacentHTML("beforeend", `
  <div id="cartOverlay"></div>
  <aside id="cartPanel">
    <div class="cart-head">
      <h3>Your Cart</h3>
      <button id="closeCart" type="button" aria-label="Close cart">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div id="cartItems"></div>
    <div class="cart-foot">
      <p>Total: <strong id="cartTotal">£0</strong></p>
      <button id="clearCart" type="button">Clear cart</button>
    </div>
  </aside>
  <div id="toast"></div>
`);

// 2c. Grab the elements we just created so we can use them below
const cartBtn     = document.getElementById("cartBtn");
const cartCount   = document.getElementById("cartCount");
const cartPanel   = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems   = document.getElementById("cartItems");
const cartTotal   = document.getElementById("cartTotal");
const toast       = document.getElementById("toast");


/* ---------- 3. SMALL HELPER FUNCTIONS ---------- */

// Turn 350 into "£350"
function money(amount) {
  return "£" + amount.toLocaleString("en-GB");
}

// Show a small message at the bottom of the screen for 2 seconds
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}


/* ---------- 4. THE CART ---------- */

// Redraw the cart panel + the number on the cart icon
function updateCart() {
  const ids = Object.keys(cart);
  let totalItems = 0;
  let totalPrice = 0;

  if (ids.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty</p>';
  } else {
    cartItems.innerHTML = ids.map(function (id) {
      const item = cart[id];
      totalItems += item.qty;
      totalPrice += item.price * item.qty;

      return `
        <div class="cart-row">
          <div class="cart-info">
            <strong>${item.name}</strong>
            ${item.price ? "<span>" + money(item.price) + " each</span>" : ""}
          </div>
          <div class="qty small">
            <button type="button" data-action="minus" data-id="${id}">-</button>
            <span class="qty-num">${item.qty}</span>
            <button type="button" data-action="plus" data-id="${id}">+</button>
          </div>
          <button type="button" class="remove" data-action="remove" data-id="${id}" aria-label="Remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>`;
    }).join("");
  }

  cartCount.textContent = totalItems;
  cartTotal.textContent = money(totalPrice);
}

// Add a dish to the cart
function addToCart(id, name, price, qty) {
  if (cart[id]) {
    cart[id].qty += qty;                    // already in cart: increase the number
  } else {
    cart[id] = { name: name, price: price, qty: qty };
  }
  save("cart", cart);
  updateCart();
}

// Buttons INSIDE the cart panel: minus, plus and remove
cartItems.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (!cart[id]) return;

  if (button.dataset.action === "plus") cart[id].qty++;
  if (button.dataset.action === "minus") {
    cart[id].qty--;
    if (cart[id].qty <= 0) delete cart[id];  // 0 left = remove it
  }
  if (button.dataset.action === "remove") delete cart[id];

  save("cart", cart);
  updateCart();
});

// "Clear cart" button
document.getElementById("clearCart").addEventListener("click", function () {
  cart = {};
  save("cart", cart);
  updateCart();
});


/* ---------- 5. OPEN / CLOSE THE CART PANEL ---------- */

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("show");
}
function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("show");
}

cartBtn.addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeCart();
});


/* ---------- 6. ADD [- 1 +] [ADD TO CART] [HEART] TO EVERY FOOD CARD ---------- */

document.querySelectorAll(".menu, .menu2").forEach(function (card) {

  // Read the dish name and price from the card you already wrote
  const name = card.querySelector("h3").textContent.trim();
  const priceTag = card.querySelector("h2");                 // only some cards have a price
  const price = priceTag ? parseFloat(priceTag.textContent.replace(/[^0-9.]/g, "")) || 0 : 0;
  const id = name + "-" + price;                             // a unique name for this dish

  // Build the buttons and put them at the bottom of the card
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.innerHTML = `
    <div class="qty">
      <button type="button" class="minus" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
      <span class="qty-num">1</span>
      <button type="button" class="plus" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
    </div>
    <button type="button" class="fav-btn" aria-label="Add to favourites">
      <i class="fa-regular fa-heart"></i>
    </button>
    <button type="button" class="add-btn">
      <i class="fa-solid fa-cart-plus"></i> Add to cart
    </button>
  `;
  card.appendChild(actions);

  // Find the pieces we just made
  const qtyNum   = actions.querySelector(".qty-num");
  const favBtn   = actions.querySelector(".fav-btn");
  const favIcon  = favBtn.querySelector("i");
  let quantity = 1;                                          // the number shown between - and +

  // PLUS button
  actions.querySelector(".plus").addEventListener("click", function () {
    quantity++;
    qtyNum.textContent = quantity;
  });

  // MINUS button (never goes below 1)
  actions.querySelector(".minus").addEventListener("click", function () {
    if (quantity > 1) {
      quantity--;
      qtyNum.textContent = quantity;
    }
  });

  // ADD TO CART button
  actions.querySelector(".add-btn").addEventListener("click", function () {
    addToCart(id, name, price, quantity);
    showToast(quantity + " x " + name + " added to cart");
    quantity = 1;                                            // reset the counter
    qtyNum.textContent = quantity;
  });

  // HEART button (favourites)
  function paintHeart() {
    const isFav = favourites.includes(id);
    favBtn.classList.toggle("active", isFav);
    favIcon.className = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }
  paintHeart();                                              // show saved hearts when the page opens

  favBtn.addEventListener("click", function () {
    if (favourites.includes(id)) {
      favourites = favourites.filter(function (x) { return x !== id; });
      showToast("Removed from favourites");
    } else {
      favourites.push(id);
      showToast("Added to favourites");
    }
    save("favourites", favourites);
    paintHeart();
  });
});


/* ---------- 7. MOBILE MENU (the 3-line button) ---------- */

document.getElementById("menuToggle").addEventListener("click", function () {
  document.querySelector("header nav").classList.toggle("open");
});


/* ---------- 8. START ---------- */
updateCart();   // fill the cart icon number when the page opens