let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem("lumi_cart") || "[]");

const money = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB"
  }).format(Number(n) || 0);


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {
  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error("โหลด products.json ไม่สำเร็จ");
    }

    PRODUCTS = await response.json();

    renderProducts(PRODUCTS);
    updateCartCount();

  } catch (error) {
    console.error("Product error:", error);
  }
}


/* =========================
   PRODUCT CARD
========================= */

function card(p) {

  const hasImage =
    p.image && p.image.trim() !== "";

  return `
    <article class="product-card" data-mood="${p.mood}">

      <div
        class="product-visual"
        style="background:${p.color || "#f5f1ed"}"
      >

        ${
          hasImage
            ? `
              <img
                src="${p.image}"
                alt="${p.name}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='flex';
                "
              >
            `
            : ""
        }

        <div
          class="image-fallback"
          style="
            display:${hasImage ? "none" : "flex"};
            width:100%;
            height:100%;
            align-items:center;
            justify-content:center;
            text-align:center;
            padding:20px;
            box-sizing:border-box;
          "
        >
          <div class="mini-candle">
            🕯️<br>
            ${p.mood}
          </div>
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
            type="button"
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

function renderProducts(products) {

  const container =
    document.querySelector("#productGrid") ||
    document.querySelector(".product-grid") ||
    document.querySelector("#products");

  if (!container) {
    console.warn("ไม่พบพื้นที่แสดงสินค้า");
    return;
  }

  container.innerHTML =
    products.map(card).join("");

  attachCartButtons();
}


/* =========================
   CART BUTTONS
========================= */

function attachCartButtons() {

  const buttons =
    document.querySelectorAll(".add");

  buttons.forEach(button => {

    button.addEventListener("click", function () {

      const id = this.dataset.id;

      addToCart(id);

    });

  });
}


/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

  const product =
    PRODUCTS.find(product => product.id === id);

  if (!product) {
    console.error("ไม่พบสินค้า:", id);
    return;
  }

  const existing =
    CART.find(item => item.id === id);

  if (existing) {

    existing.quantity += 1;

  } else {

    CART.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1
    });

  }

  saveCart();

  updateCartCount();

  alert(
    `เพิ่ม ${product.name} ลงตะกร้าแล้ว 🕯️`
  );
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
        total + Number(item.quantity || 0),
      0
    );

  const elements =
    document.querySelectorAll(
      "[data-cart-count], .cart-count"
    );

  elements.forEach(element => {

    element.textContent = count;

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
    function () {

      const keyword =
        this.value
          .toLowerCase()
          .trim();

      if (!keyword) {

        renderProducts(PRODUCTS);

        return;
      }

      const filtered =
        PRODUCTS.filter(product => {

          return (

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

        });

      renderProducts(filtered);

    }
  );
}


/* =========================
   START WEBSITE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadProducts();

    setupSearch();

    updateCartCount();

  }
);
