/* script.js - global logic */

// ---------- CONFIG ----------
const CART_KEY = 'toyworld_cart_v4';
const PAGES_TO_FETCH = ['boys_section/boys.html','girls_section/girls.html'];

// ---------- CART HELPERS ----------
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCountUI(); }
function updateCartCountUI(){ const el = document.getElementById('cart-count'); if(!el) return; const total = getCart().reduce((s,i)=> s + (i.qty || 1),0); el.textContent = total; }

// merge quantities (Option A)
function addToCart(product){
  if(!product || !product.id) return;
  const cart = getCart();
  const found = cart.find(i=> i.id === product.id);
  if(found) found.qty = (found.qty||1) + 1;
  else cart.push({ id: String(product.id), title: product.title || 'Product', price: Number(product.price)||0, img: product.img||'', qty: 1});
  saveCart(cart);
  showToast(`${product.title || 'Item'} added`);
  if(product.img) flyToCart(product.img);
}

// ---------- TOAST ----------
function showToast(msg, ms=1000){
  let t = document.getElementById('global-toast'); if(t) t.remove();
  t = document.createElement('div'); t.id='global-toast'; t.textContent = msg;
  Object.assign(t.style,{position:'fixed',right:'16px',bottom:'16px',background:'#0b7280',color:'#fff',padding:'10px 12px',borderRadius:'8px',zIndex:99999,fontWeight:700});
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), ms);
}

// ---------- FLY-TO-CART ANIM ----------
function flyToCart(imgSrc){
  const cartEl = document.querySelector('.cart-link') || document.querySelector('#cart-count');
  if(!cartEl) return;
  const clone = document.createElement('img');
  clone.src = imgSrc;
  Object.assign(clone.style,{position:'fixed',width:'120px',height:'120px',objectFit:'cover',borderRadius:'10px',zIndex:99999,left:window.innerWidth/2+'px',top:window.innerHeight/2+'px',transition:'transform 700ms cubic-bezier(.2,.9,.3,1),opacity 700ms'});
  document.body.appendChild(clone);
  requestAnimationFrame(()=> {
    const rect = cartEl.getBoundingClientRect();
    const tx = rect.left - (window.innerWidth/2) + (rect.width/2);
    const ty = rect.top - (window.innerHeight/2) + (rect.height/2);
    clone.style.transform = `translate(${tx}px, ${ty}px) scale(.15)`;
    clone.style.opacity = '0.9';
  });
  setTimeout(()=> clone.remove(),760);
  // badge pop
  const badge = document.querySelector('#cart-count'); if(badge) badge.animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],{duration:300});
}

// ---------- FETCH & PARSE PRODUCTS ----------
async function fetchPageHTML(url){
  try{
    const res = await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error(url+' '+res.status);
    return await res.text();
  }catch(e){ console.warn('fetch error', e); return ''; }
}

function parseArticlesFromHTML(html){
  const container = document.createElement('div'); container.innerHTML = html;
  const articles = Array.from(container.querySelectorAll('article.product-card'));
  return articles.map(a=>{
    const id = a.dataset.id || Date.now().toString();
    const category = a.dataset.category || '';
    const age = a.dataset.age || '';
    const price = parseFloat(a.dataset.price || (a.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,'')) || 0;
    const isNew = String(a.dataset.new || '').toLowerCase() === 'true';
    const featured = String(a.dataset.featured || '').toLowerCase() === 'true';
    const popular = String(a.dataset.popular || '').toLowerCase() === 'true';
    const best = String(a.dataset.best || '').toLowerCase() === 'true';
    const title = a.querySelector('h3') ? a.querySelector('h3').textContent.trim() : '';
    const desc = a.querySelector('.desc') ? a.querySelector('.desc').textContent.trim() : '';
    const img = a.querySelector('img') ? a.querySelector('img').src : '';
    return { id, category, age, price, isNew, featured, popular, best, title, desc, img, outerHTML: a.outerHTML };
  });
}

async function gatherAllProducts(){
  const all = [];
  for(const p of PAGES_TO_FETCH){
    const html = await fetchPageHTML(p);
    if(!html) continue;
    const parsed = parseArticlesFromHTML(html);
    parsed.forEach(item => all.push(item));
  }
  return all;
}

// ---------- RENDER HELPERS ----------
function renderCardHTML(product){
  const priceText = product.price !== undefined ? `$${Number(product.price).toFixed(2)}` : '';
  return `<article class="product-card" data-id="${escapeHtml(product.id)}" data-category="${escapeHtml(product.category)}" data-age="${escapeHtml(product.age)}" data-price="${escapeHtml(String(product.price))}" ${product.isNew ? 'data-new="true"':''} ${product.featured ? 'data-featured="true"':''} ${product.popular ? 'data-popular="true"':''} ${product.best ? 'data-best="true"':''}>
    <div class="card-media"><img src="${escapeHtml(product.img)}" alt=""></div>
    <div class="card-body">
      <h3>${escapeHtml(product.title)}</h3>
      <p class="desc">${escapeHtml(product.desc)}</p>
      <div class="price">${priceText}</div>
      <button class="add-to-cart">Add</button>
    </div></article>`;
}

function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

function renderHTMLInto(container, htmlList){
  if(!container) return;
  container.innerHTML = '';
  if(htmlList.length === 0){ container.innerHTML = '<p>No items</p>'; return; }
  const wrapper = container.closest('.scroll-wrapper');
  if(htmlList.length > 4 && wrapper){
    // horizontal display with limit 4 on homepage
    container.classList.remove('h-grid');
    container.classList.add('h-scroll');
    const limited = htmlList.slice(0,4);
    container.innerHTML = limited.join('');
    const leftBtn = wrapper.querySelector('.scroll-btn.left');
    const rightBtn = wrapper.querySelector('.scroll-btn.right');
    if(leftBtn) leftBtn.style.display = 'flex';
    if(rightBtn) rightBtn.style.display = 'flex';
    enableScrollControls(container,leftBtn,rightBtn);
  } else {
    // grid display (all)
    container.classList.remove('h-scroll');
    container.classList.add('h-grid');
    container.innerHTML = htmlList.join('');
    const leftBtn = wrapper ? wrapper.querySelector('.scroll-btn.left') : null;
    const rightBtn = wrapper ? wrapper.querySelector('.scroll-btn.right') : null;
    if(leftBtn) leftBtn.style.display = 'none';
    if(rightBtn) rightBtn.style.display = 'none';
  }
  // wireAddButtons(container);
}

// function wireAddButtons(root=document){
//   root.querySelectorAll('.add-to-cart').forEach(btn=>{
//     btn.removeEventListener('click', localAddHandler);
//     btn.addEventListener('click', localAddHandler);
//   });
// }
// function localAddHandler(ev){
//   ev.preventDefault();
//   const btn = ev.currentTarget;
//   const article = btn.closest('article.product-card');
//   if(!article) return;
//   const prod = {
//     id: article.dataset.id,
//     title: (article.querySelector('h3')?.textContent || '').trim(),
//     price: parseFloat(article.dataset.price || (article.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,'')) || 0,
//     img: article.querySelector('img') ? article.querySelector('img').src : ''
//   };
//   addToCart(prod);
// }

// ---------- HORIZONTAL SCROLL CONTROLS ----------
function enableScrollControls(container,leftBtn,rightBtn){
  if(!container) return;
  const card = container.querySelector('.product-card');
  let cardWidth = card ? Math.round(card.getBoundingClientRect().width) : 240;
  setTimeout(()=>{ const f = container.querySelector('.product-card'); if(f) cardWidth = Math.round(f.getBoundingClientRect().width); },120);
  if(leftBtn) leftBtn.onclick = ()=> container.scrollBy({left: -(cardWidth + 18), behavior:'smooth'});
  if(rightBtn) rightBtn.onclick = ()=> container.scrollBy({left: (cardWidth + 18), behavior:'smooth'});
  // pointer drag
  let isDown=false, startX=0, scrollLeft=0;
  container.addEventListener('pointerdown', e=>{ isDown=true; startX=e.clientX; scrollLeft=container.scrollLeft; container.setPointerCapture && container.setPointerCapture(e.pointerId); });
  container.addEventListener('pointermove', e=>{ if(!isDown) return; const walk = (e.clientX - startX) * 1.4; container.scrollLeft = scrollLeft - walk; });
  container.addEventListener('pointerup', e=>{ isDown=false; try{ container.releasePointerCapture(e.pointerId); }catch{} });
  container.addEventListener('pointercancel', ()=> isDown=false);
}

// ---------- HOME SECTION LOADER ----------
async function loadHomeSections(targets){
  const all = await gatherAllProducts();
  // build arrays
  const newList = all.filter(p=> p.isNew).map(renderCardHTML);
  const bestList = all.filter(p=> p.best).map(renderCardHTML);
  const popularList = all.filter(p=> p.popular).map(renderCardHTML);
  const featuredList = all.filter(p=> p.featured).map(renderCardHTML);
  renderHTMLInto(document.querySelector(targets.newTarget), newList);
  renderHTMLInto(document.querySelector(targets.bestTarget), bestList);
  renderHTMLInto(document.querySelector(targets.popularTarget), popularList);
  renderHTMLInto(document.querySelector(targets.featuredTarget), featuredList);
}
// ---------- SPECIAL PAGE LOADER (injecting former special_loader.js but FIXED) ----------
async function fetchProductsRaw(url) {
  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  return [...div.querySelectorAll("article.product-card")];
}

async function getAllRawArticles() {
  const boys = await fetchProductsRaw("boys_section/boys.html");
  const girls = await fetchProductsRaw("girls_section/girls.html");
  return [...boys, ...girls];
}

function cloneRawArticle(a) {
  const c = a.cloneNode(true);
  // REMOVE any previously bound add handlers
  c.querySelectorAll(".add-to-cart").forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  return c;
}

/** type → "new", "best", "featured", "popular" */
async function loadSpecialPage(type, targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  const allRaw = await getAllRawArticles();

  const filtered = allRaw.filter(p => p.dataset[type] === "true").slice(0, 20);

  container.innerHTML = "";
  filtered.forEach(p => container.appendChild(cloneRawArticle(p)));

  // Use your global add-to-cart handler
}


// ---------- SLIDESHOW (slide-from-left -> center -> slide-right) ----------
let __slideTimer = null;
function initSlideshow({images=[], holdMs=2500, transitionMs=700} = {}){
  const imgEl = document.getElementById('slideshow-img');
  if(!imgEl) return;
  let idx = 0;
  function showNext(){
    const src = images[idx % images.length];
    imgEl.style.transition = `none`;
    imgEl.style.opacity = '0';
    imgEl.style.transform = `translateX(-40px)`;
    imgEl.src = src;
    // allow reflow
    requestAnimationFrame(()=> {
      imgEl.style.transition = `transform ${transitionMs}ms ease, opacity ${transitionMs}ms ease`;
      imgEl.style.opacity = '1';
      imgEl.style.transform = `translateX(0)`;
      // hold then exit
      setTimeout(()=> {
        imgEl.style.opacity = '0';
        imgEl.style.transform = `translateX(40px)`;
        setTimeout(()=> {
          idx = (idx+1) % images.length;
          showNext();
        }, transitionMs);
      }, holdMs);
    });
  }
  if(__slideTimer) clearTimeout(__slideTimer);
  showNext();
}

// ---------- GLOBAL INIT ----------
document.addEventListener('DOMContentLoaded', ()=> {
  // delegated Add buttons (for any .add-btn like elements or .add-to-cart)
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('.add-to-cart, .add-btn, .add-to-cart-btn');
    if(!btn) return;
    ev.preventDefault();
    // try parse product from closest article
    const article = btn.closest('article.product-card') || btn.closest('.product-card');
    if(article){
      const prod = {
        id: article.dataset.id || article.getAttribute('data-id'),
        title: article.querySelector('h3') ? article.querySelector('h3').textContent.trim() : (article.dataset.name || ''),
        price: parseFloat(article.dataset.price || (article.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,'')) || 0,
        img: article.querySelector('img') ? article.querySelector('img').src : (article.dataset.img || '')
      };
      addToCart(prod);
    } else {
      // fallback: use data attributes on button
      const prod = { id: btn.dataset.id || btn.getAttribute('data-id'), title: btn.dataset.name || btn.getAttribute('data-name'), price: parseFloat(btn.dataset.price||0) || 0, img: btn.dataset.img || '' };
      if(prod.id) addToCart(prod);
      else console.warn('Cannot determine product for add-to-cart', btn);
    }
  });

  updateCartCountUI();
});
