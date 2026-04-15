/* ===================== PRODUCTS ===================== */
const products = [
  { id: 1, name: "Notebook", price: 50, desc: "Smooth pages notebook" },
  { id: 2, name: "Pen", price: 10, desc: "Blue ink pen" },
  { id: 3, name: "Pencil", price: 8, desc: "HB pencil" },
  { id: 4, name: "Eraser", price: 5, desc: "Soft eraser" },
  { id: 5, name: "Scale", price: 15, desc: "Transparent ruler" },
  { id: 6, name: "Highlighter", price: 25, desc: "Bright highlighter" },
  { id: 7, name: "Marker", price: 30, desc: "Permanent marker" },
  { id: 8, name: "Exam Pad", price: 60, desc: "Exam writing pad" },
  { id: 9, name: "Geometry Box", price: 120, desc: "Full geometry set" },
  { id: 10, name: "Sticky Notes", price: 40, desc: "Color notes" }
];

/* ===================== STORAGE ===================== */
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

/* ===================== UTIL ===================== */
function formatCurrency(amount) {
  return "₹" + Number(amount).toFixed(2);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB");
}

function generateOrderId() {
  return "ORD-" + Date.now().toString().slice(-6);
}

/* ===================== PRODUCTS UI ===================== */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const select = document.getElementById("productSelect");

  grid.innerHTML = "";
  select.innerHTML = '<option value="">-- Select --</option>';

  products.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <div class="product-top">
          <span class="product-name">${p.name}</span>
          <span class="product-price">${formatCurrency(p.price)}</span>
        </div>
        <p class="product-desc">${p.desc}</p>
      </div>
    `;

    select.innerHTML += `
      <option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>
    `;
  });
}

/* ===================== PREVIEW ===================== */
function renderPreview() {
  const id = parseInt(document.getElementById("productSelect").value);
  const qty = parseInt(document.getElementById("quantityInput").value);
  const preview = document.getElementById("selectedPreview");

  const product = products.find(p => p.id === id);

  if (product && qty > 0) {
    const total = product.price * qty;
    preview.innerHTML = `
      <strong>${product.name}</strong><br>
      ${formatCurrency(product.price)} × ${qty} = <strong>${formatCurrency(total)}</strong>
    `;
  } else {
    preview.innerText = "Select a product to see price details.";
  }
}

/* ===================== ORDER ===================== */
function placeOrder() {
  const id = parseInt(document.getElementById("productSelect").value);
  const qty = parseInt(document.getElementById("quantityInput").value);

  if (!id || qty < 1) {
    alert("Select product & quantity");
    return;
  }

  const product = products.find(p => p.id === id);

  const order = {
    orderId: generateOrderId(),
    productName: product.name,
    unitPrice: product.price,
    quantity: qty,
    totalPrice: product.price * qty,
    date: new Date().toISOString()
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  alert("✅ Order Placed!");
  renderHistory();
  renderAI();
}

/* ===================== HISTORY ===================== */
function renderHistory() {
  const list = document.getElementById("historyList");
  const orders = getOrders();

  list.innerHTML = "";

  if (orders.length === 0) {
    list.innerHTML = "<div class='empty-box'>No orders yet</div>";
    return;
  }

  orders.slice().reverse().forEach(o => {
    list.innerHTML += `
      <div class="history-item">
        <div class="history-top">
          <div>
            <div class="history-product">${o.productName}</div>
            <div class="history-id">${o.orderId}</div>
          </div>
          <div class="history-total">${formatCurrency(o.totalPrice)}</div>
        </div>

        <div class="history-details">
          <div class="detail-chip">
            <span>Date</span>
            <strong>${formatDate(o.date)}</strong>
          </div>
          <div class="detail-chip">
            <span>Qty</span>
            <strong>${o.quantity}</strong>
          </div>
          <div class="detail-chip">
            <span>Price</span>
            <strong>${formatCurrency(o.unitPrice)}</strong>
          </div>
        </div>

        <div class="history-actions">
          <button class="btn-danger small-btn" onclick="deleteOrder('${o.orderId}')">Delete</button>
        </div>
      </div>
    `;
  });
}

/* ===================== DELETE ===================== */
function deleteOrder(id) {
  let orders = getOrders();
  orders = orders.filter(o => o.orderId !== id);
  saveOrders(orders);
  renderHistory();
  renderAI();
}

function clearAllOrders() {
  localStorage.removeItem("orders");
  renderHistory();
  renderAI();
}

/* ===================== AI ANALYZER ===================== */
function renderAI() {
  const orders = getOrders();
  let weekTotal = 0;
  let total = 0;
  let count = {};

  const now = new Date();
  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 7);

  orders.forEach(o => {
    total += o.totalPrice;

    count[o.productName] = (count[o.productName] || 0) + o.quantity;

    if (new Date(o.date) >= weekStart) {
      weekTotal += o.totalPrice;
    }
  });

  let top = "None";
  let max = 0;

  for (let p in count) {
    if (count[p] > max) {
      max = count[p];
      top = p;
    }
  }

  const avg = orders.length ? total / Math.ceil(orders.length / 2) : 0;

  document.getElementById("weekSpending").innerText = formatCurrency(weekTotal);
  document.getElementById("mostBought").innerText = top;
  document.getElementById("weeklyAverage").innerText = formatCurrency(avg);

  document.getElementById("topTotalOrders").innerText = orders.length;
  document.getElementById("topTotalSpent").innerText = formatCurrency(total);
  document.getElementById("topMostBought").innerText = top;
  document.getElementById("topWeekSpent").innerText = formatCurrency(weekTotal);

  const warn = document.getElementById("warningBox");

  if (weekTotal > avg && avg > 0) {
    warn.style.display = "block";
    warn.innerText = "⚠ You are spending more than usual!";
  } else {
    warn.style.display = "none";
  }
}

/* ===================== INIT ===================== */
window.onload = () => {
  renderProducts();
  renderHistory();
  renderAI();
  renderPreview();

  document.getElementById("productSelect").addEventListener("change", renderPreview);
  document.getElementById("quantityInput").addEventListener("input", renderPreview);
};
