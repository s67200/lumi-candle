const APPS_SCRIPT_URL = ""; // ใส่ Web App URL จาก Google Apps Script ตรงนี้ได้

let PRODUCTS = [];
async function loadProducts(){
  try{ const r=await fetch('products.json'); PRODUCTS=await r.json(); }
  catch(e){ console.error(e); }
  initPage();
}
function money(n){return new Intl.NumberFormat('th-TH').format(n)+" บาท"}
function card(p){
  return `<article class="product-card" data-mood="${p.mood}">
    <div class="product-visual"><div class="mini-candle">${p.mood.replace(' ','<br>')}</div></div>
    <div class="product-info"><p class="eyebrow">${p.type} · ${p.size}</p><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="price-row"><span class="price">${money(p.price)}</span><button class="add" data-id="${p.id}">สั่งซื้อ</button></div></div>
  </article>`;
}
function initPage(){
  const grid=document.getElementById('productGrid');
  if(grid){
    const params=new URLSearchParams(location.search), mood=params.get('mood');
    grid.innerHTML=PRODUCTS.filter(p=>!mood||p.mood===mood).map(card).join('');
    document.querySelectorAll('.filter').forEach(b=>{
      if(mood && b.dataset.filter===mood){document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active')}
      b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');grid.innerHTML=(b.dataset.filter==='all'?PRODUCTS:PRODUCTS.filter(p=>p.mood===b.dataset.filter)).map(card).join('');bindAddButtons()}
    }); bindAddButtons();
  }
  const select=document.getElementById('productSelect');
  if(select){
    select.innerHTML=PRODUCTS.map(p=>`<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join('');
    const chosen=localStorage.getItem('lumiSelected'); if(chosen) select.value=chosen;
    updateSummary();
    select.onchange=updateSummary;
    document.querySelector('[name="quantity"]').oninput=updateSummary;
    document.getElementById('orderForm').onsubmit=submitOrder;
  }
  renderOrders();
  const refresh=document.getElementById('refreshOrders'); if(refresh) refresh.onclick=renderOrders;
  const clear=document.getElementById('clearOrders'); if(clear) clear.onclick=()=>{if(confirm('ลบข้อมูลคำสั่งซื้อเดโมทั้งหมด?')){localStorage.removeItem('lumiOrders');renderOrders()}};
}
function bindAddButtons(){
  document.querySelectorAll('.add').forEach(btn=>btn.onclick=()=>{localStorage.setItem('lumiSelected',btn.dataset.id);location.href='order.html'});
}
function updateSummary(){
  const box=document.getElementById('summary'), select=document.getElementById('productSelect'), qty=document.querySelector('[name="quantity"]');
  if(!box||!select)return;
  const p=PRODUCTS.find(x=>x.id===select.value), q=Number(qty?.value||1);
  box.innerHTML=`<div class="summary-item"><strong>${p.name}</strong><span>${p.desc}</span></div><div class="summary-price">${money(p.price*q)}</div>`;
}
async function submitOrder(e){
  e.preventDefault();
  const fd=new FormData(e.target), p=PRODUCTS.find(x=>x.id===fd.get('product'));
  const order={id:'LUMI-'+Date.now().toString().slice(-6),createdAt:new Date().toLocaleString('th-TH'),name:fd.get('name'),phone:fd.get('phone'),address:fd.get('address'),product:p.name,quantity:Number(fd.get('quantity')),note:fd.get('note')};
  const orders=JSON.parse(localStorage.getItem('lumiOrders')||'[]'); orders.push(order);localStorage.setItem('lumiOrders',JSON.stringify(orders));
  if(APPS_SCRIPT_URL){
    try{await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)})}catch(err){console.log(err)}
  }
  localStorage.removeItem('lumiSelected'); location.href='thankyou.html';
}
function renderOrders(){
  const body=document.getElementById('ordersBody'); if(!body)return;
  const orders=JSON.parse(localStorage.getItem('lumiOrders')||'[]');
  if(!orders.length){body.innerHTML='<tr><td colspan="6" class="empty">ยังไม่มีคำสั่งซื้อ</td></tr>';return}
  body.innerHTML=orders.slice().reverse().map(o=>`<tr><td>${o.createdAt}</td><td><strong>${o.name}</strong><br>${o.note||''}</td><td>${o.product}</td><td>${o.quantity}</td><td>${o.phone}</td><td>${o.address}</td></tr>`).join('');
}
loadProducts();
