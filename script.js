let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem("lumi_cart") || "[]");

const money = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB"
  }).format(n);

async function loadProducts() {
  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error("ไม่สามารถโหลด products.json ได้");
    }

    PRODUCTS = await response.json();

    renderProducts();
    updateCartCount();

  } catch (error) {
    console.error(error);
  }
}


/* =========================
   PRODUCT CARD
========================= */

function card(p) {

  const imageHTML = p.image
    ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
    : "";

  const fallbackHTML = `
    <div
      class="mini-candle"
      style="background:${p.color || "#eee"}"
    >
      ${p.mood}
    </div>
  `;

  return `
    <article class="product-card" data-mood="${p.mood}">

      <div class="product-visual">

        ${imageHTML}

        <div
          class="image-fallback"
          style="
            background:${p.color || "#eee"};
            ${p.image ? "display:none;" : "display:flex;"}
          "
        >
          ${fallbackHTML}
        </div>

      </div>

      <div class="product-info">

        <div class="eyebrow">
          ${p.mood}
        </div>

        <h3>
          ${p.name}
        </h3>

        <p>
          ${p.desc}
        </p>

        <div class="price-row">

          <span class="price">
            ${money(p.price)}
          </span>

          <button
            class="add"
            data-id="${p.id}"
          >
            เพิ่มลงตะกร้า
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

  const container =
    document.querySelector("#productGrid") ||
    document.querySelector(".product-grid") ||
    document.querySelector("#products");

  if (!container) {
    console.warn("ไม่พบพื้นที่แสดงสินค้า");
    return;
  }

  container.innerHTML =
    PRODUCTS.map(card).join("");

  document
    .querySelectorAll(".add")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id = button.dataset.id;

        addToCart(id);

      });

    });
}


/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

  const product =
    PRODUCTS.find(p => p.id === id);

  if (!product) return;

  const existing =
    CART.find(item => item.id === id);

  if (existing) {

    existing.quantity += 1;

  } else {

    CART.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });

  }

  saveCart();

  updateCartCount();

  alert(`${product.name} เพิ่มลงตะกร้าแล้ว 🕯️`);
}


/* =========================
   SAVE CART
========================= */

function saveCart() {

  localStorage.setItem(
    "lumi_cart",
    JSON.stringify(CART)
  );

}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

  const count =
    CART.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const elements =
    document.querySelectorAll(
      "[data-cart-count], .cart-count"
    );

  elements.forEach(el => {

    el.textContent = count;

  });

}


/* =========================
   SEARCH
========================= */

function setupSearch() {

  const input =
    document.querySelector(
      "#searchInput, .search-input"
    );

  if (!input) return;

  input.addEventListener(
    "input",
    () => {

      const keyword =
        input.value
          .toLowerCase()
          .trim();

      const filtered =
        PRODUCTS.filter(product =>

          product.name
            .toLowerCase()
            .includes(keyword)

          ||

          product.mood
            .toLowerCase()
            .includes(keyword)

          ||

          product.desc
            .toLowerCase()
            .includes(keyword)

        );

      const container =
        document.querySelector(
          "#productGrid"
        ) ||
        document.querySelector(
          ".product-grid"
        ) ||
        document.querySelector(
          "#products"
        );

      if (!container) return;

      container.innerHTML =
        filtered.map(card).join("");

      document
        .querySelectorAll(".add")
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              addToCart(
                button.dataset.id
              );

            }
          );

        });

    }
  );

}


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProducts();

    setupSearch();

    updateCartCount();

  }
);
