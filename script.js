(function(){
 const panel=document.getElementById('seoky-social-panel');
 const toggles=Array.from(document.querySelectorAll('.seoky-social-rail button'));
 const close=panel&&panel.querySelector('.seoky-social-close');
 if(!panel||!toggles.length||!close)return;
 function setOpen(open){panel.classList.toggle('is-open',open);panel.setAttribute('aria-hidden',String(!open));panel.inert=!open;toggles.forEach(b=>b.setAttribute('aria-expanded',String(open)));if(open)close.focus();}
 toggles.forEach(b=>b.addEventListener('click',()=>setOpen(!panel.classList.contains('is-open'))));
 close.addEventListener('click',()=>{setOpen(false);toggles[0].focus();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('is-open')){setOpen(false);toggles[0].focus();}});
 document.addEventListener('click',e=>{if(panel.classList.contains('is-open')&&!panel.contains(e.target)&&!e.target.closest('.seoky-social-rail'))setOpen(false);});
})();

/* Extracted from original inline <script> blocks in original order */

/* =====================================================
   GLOBAL STATE
===================================================== */

/* =====================================================
   SAFE STORAGE PARSING
   Prevents broken/corrupt localStorage from crashing the site.
===================================================== */

function safeParse(value, fallback){

  try{

    const parsed=JSON.parse(value);

    return parsed;

  }catch{

    return fallback;

  }

}

// Browser storage can be unavailable in private/file contexts or when its quota is full.
// Keep the storefront usable for the current session even when persistence fails.
function storageGet(key){
  try { return localStorage.getItem(key); }
  catch (error) { return undefined; }
}

function storageSet(key, value){
  try { localStorage.setItem(key, value); return true; }
  catch (error) { return false; }
}

function storageRemove(key){
  try { localStorage.removeItem(key); return true; }
  catch (error) { return false; }
}

let selectedSize="M";
const PROMO_CODES = Object.freeze({ "SEOKY10": 10, "SYK55": 55 });
let promoDiscount=0;
let activePromoCode="";
let wishlistMemory=[];

let viewedProducts = safeParse(
  storageGet("seokyViewed") || "[]"
);
if (!Array.isArray(viewedProducts)) viewedProducts = [];

const PRODUCTS={

  "black-tee":{
    id:"black-tee",
    name:"SEOKY BLACK TEE",
    price:1500,
    image:"black-tee.png",
    image2:"black-2.png",
    color:"Black",
    stock:10
  },

  "gray-tee":{
    id:"gray-tee",
    name:"SEOKY GRAY TEE",
    price:1500,
    image:"gray-tee.png",
    image2:"gray-2.png",
    color:"Gray",
    stock:10
  },

  "white-tee":{
    id:"white-tee",
    name:"SEOKY WHITE TEE",
    price:1500,
    image:"white-tee.png",
    image2:"white-2.png",
    color:"White",
    stock:10
  },

  "navy-blue-tee":{
    id:"navy-blue-tee",
    name:"SEOKY NAVY BLUE TEE",
    price:1500,
    image:"navy-blue-tee.png",
    image2:"navy-blue-2.png",
    color:"Navy Blue",
    stock:10
  },

  "olive-green-tee":{
    id:"olive-green-tee",
    name:"SEOKY OLIVE GREEN TEE",
    price:1500,
    image:"olive-green-tee.png",
    image2:"olive-green-2.png",
    color:"Olive Green",
    stock:10
  },

  "sand-tee":{
    id:"sand-tee",
    name:"SEOKY SAND TEE",
    price:1500,
    image:"sand-tee.png",
    image2:"sand-2.png",
    color:"Sand",
    stock:10
  },

  "burgundy-tee":{
    id:"burgundy-tee",
    name:"SEOKY BURGUNDY TEE",
    price:1500,
    image:"burgundy-tee.png",
    image2:"burgundy-2.png",
    color:"Burgundy",
    stock:10
  },

  "faded-blue-tee":{
    id:"faded-blue-tee",
    name:"SEOKY FADED BLUE TEE",
    price:1500,
    image:"faded-blue-tee.png",
    image2:"faded-blue-2.png",
    color:"Faded Blue",
    stock:10
  },

  "chocolate-brown-tee":{
    id:"chocolate-brown-tee",
    name:"SEOKY CHOCOLATE BROWN TEE",
    price:1500,
    image:"chocolate-brown-tee.png",
    image2:"chocolate-brown-2.png",
    color:"Chocolate Brown",
    stock:10
  }

};

// Keep only known product IDs from storage; malformed but valid JSON should not break the modal.
viewedProducts = viewedProducts.filter(
  id => typeof id === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, id)
);

const WHATSAPP_NUMBER="94762240238";

/* =====================================================
   HELPERS
===================================================== */

function formatMoney(value){

  return Number(value || 0)
    .toLocaleString("en-LK");

}

function getCartSubtotal(){

  return cart.reduce(
    (sum,item)=>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );

}

function getDiscountAmount(){

  const subtotal=
    getCartSubtotal();

  return subtotal*
    (promoDiscount/100);

}

function getCartTotal(){

  const subtotal=
    getCartSubtotal();

  const discount=
    getDiscountAmount();

  return Math.max(
    0,
    subtotal-discount
  );

}

function getWishlist(){
  const raw = storageGet("seokyWishlist");
  if (raw === undefined) return wishlistMemory;

  const list = safeParse(raw || "[]", null);
  if (!Array.isArray(list)) return wishlistMemory;

  wishlistMemory = Array.from(new Set(
    list.filter(
      id => typeof id === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, id)
    )
  ));
  return wishlistMemory;
}

function saveWishlist(list){

  wishlistMemory = Array.isArray(list)
    ? list.filter(id => typeof id === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, id))
    : [];

  const saved = storageSet("seokyWishlist", JSON.stringify(wishlistMemory));
  if (!saved) showToast("Saved items are available for this session only");

}

function normalizeCart(){

  const original = JSON.stringify(cart);
  const validSizes = ["S", "M", "L", "XL"];

  const normalized = cart
    .filter(item => item && typeof item === "object" && !Array.isArray(item) && PRODUCTS[item.id])
    .map(item => {
      const product = PRODUCTS[item.id];
      const size = validSizes.includes(item.size) ? item.size : "M";
      const rawQty = Number(item.qty);
      const qty = Number.isFinite(rawQty) ? Math.max(1, Math.floor(rawQty)) : 1;
      return {
        key: `${product.id}-${size}`,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        qty
      };
    });

  const merged = new Map();
  normalized.forEach(item => {
    const existing = merged.get(item.key);
    if (existing) existing.qty += item.qty;
    else merged.set(item.key, item);
  });
  cart = Array.from(merged.values());

  if (JSON.stringify(cart) !== original) {
    storageSet("seokyCart", JSON.stringify(cart));
  }
}

/* =====================================================
   HERO SLIDER
===================================================== */

let currentSlide=0;
let slideTimer;

const slides=
  document.querySelectorAll(".hero-slide");

const dots=
  document.querySelectorAll(".dot");

function goToSlide(index){

  if(index<0)
    index=slides.length-1;

  if(index>=slides.length)
    index=0;

  slides.forEach((slide,i)=>{

    slide.classList.toggle(
      "active",
      i===index
    );

  });

  dots.forEach((dot,i)=>{

    dot.classList.toggle(
      "active",
      i===index
    );

  });

  currentSlide=index;

}

function nextSlide(){

  goToSlide(
    currentSlide+1
  );

}

function startSlider(){

  clearInterval(slideTimer);

  // Avoid background work in hidden tabs and respect the visitor's motion setting.
  if (document.hidden || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;

  slideTimer = setInterval(nextSlide, 5000);

}

startSlider();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(slideTimer);
  else startSlider();
});

/* =====================================================
   HERO SWIPE
===================================================== */

const hero=
  document.getElementById(
    "heroSlider"
  );

let touchStartX=0;
let touchEndX=0;

hero.addEventListener(
  "touchstart",
  e=>{
    touchStartX=
      e.changedTouches[0].screenX;
  },
  {passive:true}
);

hero.addEventListener(
  "touchend",
  e=>{

    touchEndX=
      e.changedTouches[0].screenX;

    const distance=
      touchEndX-touchStartX;

    if(Math.abs(distance)<50)
      return;

    if(distance<0)
      nextSlide();
    else
      goToSlide(
        currentSlide-1
      );

    startSlider();

  },
  {passive:true}
);

/* =====================================================
   CART
===================================================== */

let cart = safeParse(
  storageGet("seokyCart") || "[]"
);
if (!Array.isArray(cart)) cart = [];

normalizeCart();

// Restore a valid promo code alongside the saved cart. Discounts are always
// recalculated from the current subtotal rather than storing a stale amount.
const savedPromoCode = (storageGet("seokyPromoCode") || "").trim().toUpperCase();
if (cart.length > 0 && Object.prototype.hasOwnProperty.call(PROMO_CODES, savedPromoCode)) {
  activePromoCode = savedPromoCode;
  promoDiscount = PROMO_CODES[savedPromoCode];
} else {
  activePromoCode = "";
  promoDiscount = 0;
  storageRemove("seokyPromoCode");
}

function clearPromo(){
  promoDiscount = 0;
  activePromoCode = "";
  storageRemove("seokyPromoCode");
}

function saveCart(){

  if (!storageSet("seokyCart", JSON.stringify(cart))) {
    showToast("Cart is active for this session only");
  }

  updateCartCount();

}

function updateCartCount(){

  const total=
    cart.reduce(
      (sum,item)=>
        sum+
        Number(item.qty || 0),
      0
    );

  const topCount=
    document.getElementById(
      "cartCount"
    );

  const bottomCount=
    document.getElementById(
      "bottomCount"
    );

  if(topCount){

    topCount.textContent=total;

    topCount.classList.remove(
      "bump"
    );

    void topCount.offsetWidth;

    if(total>0){

      topCount.classList.add(
        "bump"
      );

    }

  }

  if(bottomCount)
    bottomCount.textContent=total;

}

function addToCart(
  id,
  name,
  price,
  image,
  size="M"
){

  const product = PRODUCTS[id];
  if (!product) return;

  const validSizes = ["S", "M", "L", "XL"];
  const safeSize = validSizes.includes(size) ? size : "M";
  const key = `${product.id}-${safeSize}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: safeSize,
      qty: 1
    });
  }

  saveCart();

  const addButton =
    document.activeElement &&
    document.activeElement.classList &&
    document.activeElement.classList.contains("add")
      ? document.activeElement
      : null;

  if (addButton) {
    const originalText =
      addButton.dataset.originalText ||
      addButton.textContent.trim() ||
      "ADD TO CART";

    addButton.dataset.originalText = originalText;
    addButton.classList.remove("cart-added");
    void addButton.offsetWidth;
    addButton.classList.add("cart-added");
    addButton.textContent = "ADDED";

    clearTimeout(addButton._addedTimer);
    addButton._addedTimer = setTimeout(() => {
      addButton.classList.remove("cart-added");
      addButton.textContent = originalText;
    }, 1400);
  }
}

function changeQty(
  key,
  amount
){

  const item=
    cart.find(
      p=>p.key===key
    );

  if(!item)
    return;

  item.qty+=amount;

  if(item.qty<=0){

    cart=
      cart.filter(
        p=>p.key!==key
      );

  }

  if (cart.length === 0) {
    clearPromo();
  }

  saveCart();

  renderCart();

}

function removeItem(key){

  cart = cart.filter(item => item.key !== key);

  if (cart.length === 0) {
    clearPromo();
  }

  saveCart();

  renderCart();

}

/* =====================================================
   CART RENDER
===================================================== */

function renderCart(){

  const cartItems=
    document.getElementById(
      "cartItems"
    );

  const cartBottom=
    document.getElementById(
      "cartBottom"
    );

  if(cart.length===0){

    cartItems.innerHTML=
      `
      <div class="empty">
        Your cart is empty.
        <br><br>
        Pick a tee and come back here 👕
      </div>
      `;

    cartBottom.innerHTML="";

    return;

  }

  const subtotal=
    getCartSubtotal();

  const discount=
    getDiscountAmount();

  const total=
    getCartTotal();

  const remaining=
    Math.max(
      0,
      3000-subtotal
    );

  const pct=
    Math.min(
      100,
      subtotal/3000*100
    );

  cartItems.innerHTML=
    cart.map(item=>{
      const color = PRODUCTS[item.id]?.color || "Color not specified";
      return `

      <div class="cart-item">

        <img
          src="${item.image}"
          alt="${item.name}"
        >

        <div class="cart-meta">

          <h4>
            ${item.name}
          </h4>

          <div class="cart-item-variant">
            Color: ${color} · Size: ${item.size || "M"}
          </div>

          <div>
            Rs. ${formatMoney(item.price)} each · Item total: Rs. ${formatMoney(item.price*item.qty)}
          </div>

          <div class="qty">

            <button
              type="button"
              onclick="changeQty('${item.key}',-1)"
            >
              −
            </button>

            <b>${item.qty}</b>

            <button
              type="button"
              onclick="changeQty('${item.key}',1)"
            >
              +
            </button>

            <button
              type="button"
              class="remove-btn"
              onclick="removeItem('${item.key}')"
            >
              Remove
            </button>

          </div>

        </div>

      </div>

    `;
    }).join("");

  cartBottom.innerHTML=
    `
    <div class="shipping-progress">

      ${
        remaining>0
        ?
        `Add Rs. ${formatMoney(remaining)} more for FREE SHIPPING 🚚`
        :
        `FREE SHIPPING UNLOCKED 🚚`
      }

      <div class="shipping-bar">
        <i style="width:${pct}%"></i>
      </div>

    </div>

    <div class="promo-row">

      <input
        id="promoInput"
        value="${activePromoCode}"
        placeholder="Promo code"
        onkeydown="if(event.key==='Enter'){event.preventDefault();applyPromo()}"
      >

      <button
        type="button"
        onclick="applyPromo()"
      >
        APPLY
      </button>

    </div>

    <div
      id="promoMsg"
      style="
        font-size:12px;
        margin-top:7px;
        color:${promoDiscount>0 ? '#4bd477' : '#777'}
      "
    >
      ${
        promoDiscount>0
        ?
        `${promoDiscount}% discount applied`
        :
        ""
      }
    </div>

    <div
      style="
        display:flex;
        justify-content:space-between;
        padding-top:22px;
        font-weight:800
      "
    >

      <span>Subtotal</span>

      <span>
        Rs. ${formatMoney(subtotal)}
      </span>

    </div>

    ${
      discount>0
      ?
      `
      <div
        style="
          display:flex;
          justify-content:space-between;
          padding-top:10px;
          color:#4bd477;
          font-weight:800
        "
      >

        <span>Discount (${promoDiscount}%)</span>

        <span>
          − Rs. ${formatMoney(discount)}
        </span>

      </div>
      `
      :
      ""
    }

    <div
      style="
        display:flex;
        justify-content:space-between;
        padding-top:12px;
        font-size:18px;
        font-weight:900
      "
    >

      <span>Total</span>

      <span>
        Rs. ${formatMoney(total)}
      </span>

    </div>

    <button
      class="checkout"
      type="button"
      onclick="openCheckout()"
    >
      ORDER ON WHATSAPP
    </button>
    `;

}

/* =====================================================
   CART OPEN / CLOSE
===================================================== */

function openCart(){

  renderCart();

  document
    .getElementById(
      "cartDrawer"
    )
    .classList.add("open");

}

function closeCart(){

  document
    .getElementById(
      "cartDrawer"
    )
    .classList.remove("open");

}

/* =====================================================
   SEARCH
===================================================== */

function openSearch(){

  document
    .getElementById(
      "searchPanel"
    )
    .classList.add("open");

  setTimeout(
    ()=>{
      document
        .getElementById(
          "searchInput"
        )
        .focus();
    },
    100
  );

  searchProducts();

}

function closeSearch(){

  document
    .getElementById(
      "searchPanel"
    )
    .classList.remove("open");

}

function searchProducts(){

  const input=
    document.getElementById(
      "searchInput"
    );

  const resultsBox=
    document.getElementById(
      "searchResults"
    );

  const query=
    input.value
      .toLowerCase()
      .trim();

  const results=
    Object.values(PRODUCTS)
      .filter(
        p=>
          p.name
            .toLowerCase()
            .includes(query) ||
          p.color
            .toLowerCase()
            .includes(query)
      );

  if(results.length===0){

    resultsBox.innerHTML=
      `
      <div
        style="
          color:#777;
          padding:20px 0
        "
      >
        No products found.
      </div>
      `;

    return;

  }

  resultsBox.innerHTML=
    results.map(p=>`

      <div
        style="
          display:flex;
          gap:15px;
          align-items:center;
          padding:12px 0;
          border-bottom:1px solid #292929
        "
      >

        <img
          src="${p.image}"
          alt="${p.name}"
          style="
            width:65px;
            height:70px;
            object-fit:cover;
            background:#eee;
            border-radius:7px
          "
        >

        <div style="flex:1">

          <b>${p.name}</b>

          <div
            style="
              color:#777;
              margin-top:5px
            "
          >
            Rs. ${formatMoney(p.price)}
          </div>

        </div>

        <button
          class="add"
          style="
            width:auto;
            margin:0
          "
          onclick="
            addToCart(
              '${p.id}',
              '${p.name}',
              ${p.price},
              '${p.image}',
              'M'
            );
            closeSearch()
          "
        >
          ADD
        </button>

      </div>

    `).join("");

}

/* =====================================================
   PROMO
===================================================== */

function applyPromo(){
  const input = document.getElementById("promoInput");
  const code = (input?.value || "").trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(PROMO_CODES, code)) {
    promoDiscount = PROMO_CODES[code];
    activePromoCode = code;
    if (!storageSet("seokyPromoCode", code)) {
      showToast("Promo applied for this session only");
    }
    renderCart();
    showToast(`${code} applied · ${promoDiscount}% OFF`);
  } else {
    clearPromo();
    renderCart();
    if (code) showToast("Invalid promo code");
  }
}

/* =====================================================
   SIZE GUIDE
===================================================== */

function openSizeGuide(){

  document
    .getElementById(
      "sizeGuideModal"
    )
    .classList.add("open");

}

function closeSizeGuide(){

  document
    .getElementById(
      "sizeGuideModal"
    )
    .classList.remove("open");

}

/* =====================================================
   MENU
===================================================== */

function toggleMenu(){

  document
    .getElementById(
      "menuCard"
    )
    .classList.toggle("open");

}

/* =====================================================
   WISHLIST
===================================================== */

function updateWishlistCards(){

  const wishlist=
    getWishlist();

  document
    .querySelectorAll(
      ".heart[data-product-id]"
    )
    .forEach(button=>{

      const id=
        button.dataset.productId;

      const liked=
        wishlist.includes(id);

          button.textContent="＋";

      button.classList.toggle(
        "liked",
        liked
      );

      let note=button.parentElement.querySelector(".wishlist-saved-note");
      if(!note){
        note=document.createElement("span");
        note.className="wishlist-saved-note";
        note.textContent="SAVED";
        button.parentElement.appendChild(note);
      }
      note.classList.toggle("show",liked);

    });

}

function toggleWishlistCard(
  id,
  button
){

  let wishlist=
    getWishlist();

  if(wishlist.includes(id)){

    wishlist=
      wishlist.filter(
        x=>x!==id
      );

    button.textContent="＋";

    button.classList.remove(
      "liked"
    );
    const note=button.parentElement.querySelector(".wishlist-saved-note");
    if(note) note.classList.remove("show");

    showToast(
      "Removed from wishlist"
    );

  }else{

    wishlist=[
      ...wishlist,
      id
    ];

    button.textContent="＋";

    button.classList.add(
      "liked"
    );
    let note=button.parentElement.querySelector(".wishlist-saved-note");
    if(!note){
      note=document.createElement("span");
      note.className="wishlist-saved-note";
      note.textContent="SAVED";
      button.parentElement.appendChild(note);
    }
    note.classList.remove("show");
    void note.offsetWidth;
    note.classList.add("show");
    button.classList.remove("wishlist-burst");
    void button.offsetWidth;
    button.classList.add("wishlist-burst");

    showToast(
      "Saved to wishlist"
    );

  }

  saveWishlist(wishlist);

  updateWishlistCards();

  updateProductModalWishlist(id);

}

function like(button){

  const id=
    button.dataset.productId;

  if(id){

    toggleWishlistCard(
      id,
      button
    );

    return;

  }

  if(
    button.textContent.trim()==="＋"
  ){

    button.textContent="SAVED";

    button.classList.add(
      "liked"
    );

  }else{

    button.textContent="SAVE";

    button.classList.remove(
      "liked"
    );

  }

}

function updateProductModalWishlist(id){

  const wb=
    document.getElementById(
      "seokyWishlist"
    );

  if(!wb)
    return;

  const wishlist=
    getWishlist();

  wb.textContent=
    wishlist.includes(id)
    ?
    "SAVED"
    :
    "SAVE";

}

/* =====================================================
   TOAST
===================================================== */

let toastTimer;

function showToast(message){

  const toast=
    document.getElementById(
      "toast"
    );

  toast.textContent=message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer=
    setTimeout(
      ()=>{
        toast.classList.remove("show");
      },
      1800
    );

}

/* =====================================================
   PRODUCT MODAL
===================================================== */

let activeProductId=null;

function setSeokyGalleryImage(src,alt,index){
  const image=document.getElementById("seokyModalImage");

  image.classList.remove("gallery-swap");
  void image.offsetWidth;

  image.src=src;
  image.alt=alt;
  image.classList.add("gallery-swap");

  document
    .querySelectorAll("#seokyGalleryThumbs button")
    .forEach((button,i)=>{
      button.classList.toggle("active",i===index);
    });
}

function openSeokyProductModal(id){

  const product=
    PRODUCTS[id];

  if(!product)
    return;

  activeProductId=id;

  document.getElementById(
    "seokyModalImage"
  ).src=product.image;

  document.getElementById(
    "seokyModalImage"
  ).alt=product.name;

  document.getElementById(
    "seokyModalName"
  ).textContent=product.name;

  document.getElementById(
    "seokyModalPrice"
  ).textContent=
    "Rs. "+
    formatMoney(product.price);

  document.getElementById(
    "seokyModalDetailPrice"
  ).textContent=
    "Rs. "+
    formatMoney(product.price);

  document.getElementById(
    "seokyModalColor"
  ).textContent=product.color;

  selectedSize="M";

  document
    .querySelectorAll(
      "#seokySizes .size-btn"
    )
    .forEach(button=>{

      button.classList.toggle(
        "active",
        button.dataset.size===
        selectedSize
      );

    });

  document
    .querySelectorAll(
      "#seokySizes .size-btn"
    )
    .forEach(button=>{

      button.onclick=()=>{

        selectedSize=
          button.dataset.size;

        document
          .querySelectorAll(
            "#seokySizes .size-btn"
          )
          .forEach(x=>{

            x.classList.toggle(
              "active",
              x===button
            );

          });

      };

    });

  updateProductModalWishlist(id);

  const wb=
    document.getElementById(
      "seokyWishlist"
    );

  wb.onclick=()=>{

    let wishlist=
      getWishlist();

    if(wishlist.includes(id)){

      wishlist=
        wishlist.filter(
          x=>x!==id
        );

      wb.textContent="SAVE";
      wb.classList.remove("liked","wishlist-burst");

      showToast(
        "Removed from wishlist"
      );

    }else{

      wishlist=[
        ...wishlist,
        id
      ];

      wb.textContent="SAVED";
      wb.classList.add("liked");
      wb.classList.remove("wishlist-burst");
      void wb.offsetWidth;
      wb.classList.add("wishlist-burst");

      showToast(
        "Saved to wishlist"
      );

    }

    saveWishlist(wishlist);

    updateWishlistCards();

  };

  const galleryImages=[
    product.image,
    product.image2
  ].filter(Boolean);

  galleryImages.forEach(src=>{
    const preload=new Image();
    preload.src=src;
  });

  document.getElementById(
    "seokyGalleryThumbs"
  ).innerHTML=
    galleryImages.map((src,index)=>`
      <button
        type="button"
        class="${index===0 ? "active" : ""}"
        aria-label="${product.name} image ${index+1}"
      >
        <img
          src="${src}"
          alt="${product.name} image ${index+1}"
        >
      </button>
    `).join("");

  document
    .querySelectorAll("#seokyGalleryThumbs button")
    .forEach((button,index)=>{
      button.onclick=()=>{
        setSeokyGalleryImage(
          galleryImages[index],
          product.name,
          index
        );
      };
    });

  document.getElementById(
    "seokyModalCart"
  ).onclick=function(){

    addToCart(
      product.id,
      product.name,
      product.price,
      product.image,
      selectedSize
    );

    closeSeokyProductModal();

  };

  viewedProducts=
    [
      id,
      ...viewedProducts.filter(
        x=>x!==id
      )
    ].slice(0,4);

  storageSet(
    "seokyViewed",
    JSON.stringify(
      viewedProducts
    )
  );

  document
    .getElementById(
      "seokyProductModal"
    )
    .classList.add("open");

}

function closeSeokyProductModal(){

  document
    .getElementById(
      "seokyProductModal"
    )
    .classList.remove("open");

  activeProductId=null;

}

/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout(){

  if(cart.length===0){

    showToast(
      "Your cart is empty"
    );

    return;

  }

  const itemsBox=
    document.getElementById(
      "checkoutItems"
    );

  itemsBox.innerHTML=
    cart.map(item=>{
      const color = PRODUCTS[item.id]?.color || "Color not specified";
      return `

      <div class="checkout-item-line" style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #292929">
        <strong>${item.name}</strong>
        <div style="color:#999;font-size:13px;margin-top:4px">
          Color: ${color} · Size: ${item.size || "M"} · Qty: ${item.qty}
        </div>
        <div style="margin-top:5px;font-weight:700">
          Rs. ${formatMoney(item.price)} each · Rs. ${formatMoney(item.price*item.qty)} total
        </div>
      </div>

    `;
    }).join("");

  const subtotal=
    getCartSubtotal();

  const discount=
    getDiscountAmount();

  const total=
    getCartTotal();

  const totalsBox=
    document.getElementById(
      "checkoutTotals"
    );

  totalsBox.innerHTML=
    `
    <div
      style="
        display:flex;
        justify-content:space-between;
        margin-bottom:8px
      "
    >
      <span>Subtotal</span>
      <span>
        Rs. ${formatMoney(subtotal)}
      </span>
    </div>

    ${
      discount>0
      ?
      `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#4bd477">
        <span>Promo code (${activePromoCode})</span>
        <span>${promoDiscount}% OFF</span>
      </div>
      <div
        class="checkout-discount"
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:8px
        "
      >
        <span>
          Discount (${promoDiscount}%)
        </span>

        <span>
          − Rs. ${formatMoney(discount)}
        </span>

      </div>
      `
      :
      ""
    }
    `;

  document.getElementById(
    "checkoutTotal"
  ).textContent=
    (subtotal >= 3000 ? "Product total (free delivery): Rs. " : "Product total before delivery: Rs. ") +
    formatMoney(total);

  const deliveryNote = document.getElementById("checkoutDeliveryNote");
  if (deliveryNote) {
    deliveryNote.textContent = subtotal >= 3000
      ? "Delivery: Free shipping threshold reached (Rs. 3,000 subtotal)."
      : "Delivery fee: To be confirmed with SEOKY on WhatsApp.";
  }

  document
    .getElementById(
      "checkoutModal"
    )
    .classList.add("open");

  closeCart();

}

function closeCheckout(){

  document
    .getElementById(
      "checkoutModal"
    )
    .classList.remove("open");

}

function submitCheckout(event){

  event.preventDefault();

  if(cart.length===0){

    showToast(
      "Your cart is empty"
    );

    return;

  }

  const name=
    document
      .getElementById(
        "checkoutName"
      )
      .value
      .trim();

  const phone=
    document
      .getElementById(
        "checkoutPhone"
      )
      .value
      .trim();

  const address=
    document
      .getElementById(
        "checkoutAddress"
      )
      .value
      .trim();

  const orderLines=
    cart.map(item=>{
      const color = PRODUCTS[item.id]?.color || "Color not specified";
      return `• ${item.name} · Color: ${color} · Size ${item.size || "M"} x${item.qty} — Rs. ${formatMoney(item.price*item.qty)}`;
    }).join("\n");

  const subtotal=
    getCartSubtotal();

  const discount=
    getDiscountAmount();

  const total=
    getCartTotal();

  const discountLine=
    discount>0
    ?
    `\nPromo code: ${activePromoCode} (${promoDiscount}% OFF)\nDiscount: - Rs. ${formatMoney(discount)}`
    :
    "";

  const message=
`Hi SEOKY! 👋

I'd like to place an order.

Name: ${name}
Phone: ${phone}
Address: ${address}

ORDER:
${orderLines}

Subtotal: Rs. ${formatMoney(subtotal)}
${discountLine}
Product total: Rs. ${formatMoney(total)}
Delivery: ${subtotal >= 3000 ? "Free shipping threshold reached (Rs. 3,000 subtotal)" : "Fee to be confirmed with SEOKY"}

Please confirm stock, delivery fee (if applicable), and final order details before treating this as confirmed.

Thank you!`;

  window.open(
    "https://wa.me/"+
    WHATSAPP_NUMBER+
    "?text="+
    encodeURIComponent(message),
    "_blank"
  );

  closeCheckout();

}

/* =====================================================
   CINEMATIC AUTH SYSTEM
===================================================== */

let authMode="login";
let authLightOn=false;

function openAuthScene(
  mode="login"
){

  authMode=mode;
  authLightOn=false;

  const scene=
    document.getElementById(
      "authScene"
    );

  const wallSwitch=
    document.getElementById(
      "wallSwitch"
    );

  const status=
    document.getElementById(
      "switchStatus"
    );

  setAuthMode(mode);

  scene.classList.add(
    "open"
  );

  scene.classList.remove(
    "lit"
  );

  wallSwitch.classList.remove(
    "on"
  );

  status.textContent="OFF";

  document.body.style.overflow=
    "hidden";

}

function toggleAuthLight(){

  authLightOn=
    !authLightOn;

  const scene=
    document.getElementById(
      "authScene"
    );

  const wallSwitch=
    document.getElementById(
      "wallSwitch"
    );

  const status=
    document.getElementById(
      "switchStatus"
    );

  if(authLightOn){

    wallSwitch.classList.add(
      "on"
    );

    status.textContent="ON";

    setTimeout(
      ()=>{
        if(authLightOn){

          scene.classList.add(
            "lit"
          );

        }
      },
      120
    );

  }else{

    scene.classList.remove(
      "lit"
    );

    setTimeout(
      ()=>{

        if(!authLightOn){

          wallSwitch.classList.remove(
            "on"
          );

          status.textContent="OFF";

        }

      },
      250
    );

  }

}

function closeAuthScene(){

  const scene=
    document.getElementById(
      "authScene"
    );

  const wallSwitch=
    document.getElementById(
      "wallSwitch"
    );

  const status=
    document.getElementById(
      "switchStatus"
    );

  authLightOn=false;

  scene.classList.remove(
    "lit"
  );

  setTimeout(
    ()=>{

      scene.classList.remove(
        "open"
      );

      wallSwitch.classList.remove(
        "on"
      );

      status.textContent="OFF";

      document.body.style.overflow="";

    },
    350
  );

}

function setAuthMode(mode){

  authMode=mode;

  const signup=
    mode==="signup";

  document
    .getElementById(
      "loginTab"
    )
    .classList.toggle(
      "active",
      !signup
    );

  document
    .getElementById(
      "signupTab"
    )
    .classList.toggle(
      "active",
      signup
    );

  document
    .getElementById(
      "authTabSlider"
    )
    .classList.toggle(
      "signup",
      signup
    );

  document
    .getElementById(
      "loginForm"
    )
    .classList.toggle(
      "active",
      !signup
    );

  document
    .getElementById(
      "signupForm"
    )
    .classList.toggle(
      "active",
      signup
    );

  document.getElementById(
    "authTitle"
  ).textContent=
    signup
    ?
    "JOIN SEOKY."
    :
    "WELCOME BACK.";

  document.getElementById(
    "authSubtitle"
  ).textContent=
    signup
    ?
    "Create your SEOKY account."
    :
    "Sign in to your SEOKY account.";

}

/* =====================================================
   SIGN UP
===================================================== */

function submitSignup(event){
  event.preventDefault();
  showToast("Accounts are coming later — this is a demo store.");
}

/* =====================================================
   LOGIN
===================================================== */

function submitLogin(event){
  event.preventDefault();
  showToast("Login is not enabled in this demo yet.");
}

/* =====================================================
   SIGN OUT
===================================================== */

function signOut(){

  storageRemove(
    "seokyLoggedIn"
  );

  updateAccountMenu();

  showToast(
    "Signed out"
  );

}

/* =====================================================
   ACCOUNT MENU
===================================================== */

function updateAccountMenu(){

  const logged=
    storageGet(
      "seokyLoggedIn"
    )==="true";

  const signOutItem=
    document.getElementById(
      "signOutMenuItem"
    );

  if(signOutItem){

    signOutItem.style.display=
      logged
      ?
      "flex"
      :
      "none";

  }

}

/* =====================================================
   OUTSIDE CLICK
===================================================== */

document.addEventListener(
  "click",
  event=>{

    const menu=
      document.getElementById(
        "menuCard"
      );

    const menuButton=
      event.target.closest(
        ".header .icon-btn"
      );

    if(
      menu &&
      menu.classList.contains("open") &&
      !menu.contains(event.target) &&
      !menuButton
    ){

      menu.classList.remove(
        "open"
      );

    }

  }
);

/* =====================================================
   SCROLL REVEAL
===================================================== */

function initRevealAnimations(){

  const revealItems=
    document.querySelectorAll(
      ".section,.campaign,.seoky-shop-details,.footer-brand,.footer-links,.footer-contact,.product"
    );

  if(!("IntersectionObserver" in window)){

    revealItems.forEach(
      el=>el.classList.add("revealed")
    );

    return;

  }

  const observer=
    new IntersectionObserver(
      entries=>{

        entries.forEach(entry=>{

          if(entry.isIntersecting){

            entry.target.classList.add(
              "revealed"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold:.12,
        rootMargin:"0px 0px -40px 0px"
      }
    );

  revealItems.forEach(
    el=>observer.observe(el)
  );

}

/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
  "keydown",
  e=>{

    if(e.key!=="Escape")
      return;

    closeCart();
    closeSearch();
    closeCheckout();
    closeSeokyProductModal();
    closeSizeGuide();

    const menu=
      document.getElementById(
        "menuCard"
      );

    if(menu)
      menu.classList.remove(
        "open"
      );

    closeAuthScene();

  }
);

/* =====================================================
   INITIALIZE
===================================================== */

updateCartCount();

updateAccountMenu();

updateWishlistCards();

initRevealAnimations();

/* Extracted from original inline <script> blocks in original order */

/* SEOKY cursor glow — one pointer handler to avoid conflicting positions. */
(function(){
  const glow=document.getElementById('seokyCursorGlow');
  if(!glow || !window.matchMedia('(hover:hover)').matches) return;
  window.addEventListener('pointermove',e=>{
    document.body.style.setProperty('--mx',e.clientX+'px');
    document.body.style.setProperty('--my',e.clientY+'px');
    glow.style.left=e.clientX+'px';
    glow.style.top=e.clientY+'px';
    document.body.classList.add('seoky-ready','seoky-pointer-active');
  },{passive:true});
  window.addEventListener('pointerleave',()=>{
    document.body.classList.remove('seoky-ready','seoky-pointer-active');
  });
})();

/* Extracted from original inline <script> blocks in original order */

/* =====================================================
   SEOKY — PREMIUM INTERACTION ENGINE
===================================================== */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch=window.matchMedia('(hover:none) and (pointer:coarse)').matches;

  /* scroll progress + header depth */
  const bar=document.createElement('div');
  bar.id='seokyScrollProgress';
  document.body.prepend(bar);
  let ticking=false;
  function scrollFX(){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const pct=max>0 ? (window.scrollY/max)*100 : 0;
    bar.style.width=pct+'%';
    document.body.classList.toggle('seoky-scrolled',window.scrollY>18);
    ticking=false;
  }
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollFX);ticking=true}},{passive:true});
  scrollFX();

  if(reduce) return;

  /* smooth cinematic pointer tilt — desktop only */
  if(!touch){
    document.querySelectorAll('.product').forEach(card=>{
      let raf=0;
      card.addEventListener('pointermove',e=>{
        if(e.pointerType==='touch') return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          card.style.transform=`perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.8).toFixed(2)}deg) translateY(-4px)`;
        });
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        cancelAnimationFrame(raf);
        card.style.transform='';
      });
    });
  }

  /* premium touch/click ripple without blocking clicks */
  const rippleTargets='.cta,.add,.checkout,.auth-submit,.outline,.icon-btn,.heart';
  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest(rippleTargets);
    if(!el) return;
    if(e.pointerType==='mouse' && !touch) return;
    if(getComputedStyle(el).position==='static') el.style.position='relative';
    el.style.overflow='hidden';
    const r=el.getBoundingClientRect();
    const rip=document.createElement('span');
    rip.className='seoky-ripple';
    rip.style.left=(e.clientX-r.left)+'px';
    rip.style.top=(e.clientY-r.top)+'px';
    el.appendChild(rip);
    setTimeout(()=>rip.remove(),700);
  },{passive:true});

  /* subtle hero pointer parallax on desktop */
  const hero=document.querySelector('.hero');
  const heroContent=hero?.querySelector('.hero-content');
  if(hero && heroContent && !touch){
    let raf=0;
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>heroContent.style.transform=`translate3d(${(x*7).toFixed(1)}px,${(y*5).toFixed(1)}px,0)`);
    },{passive:true});
    hero.addEventListener('pointerleave',()=>heroContent.style.transform='');
  }

  /* section reveal for content that wasn't covered by the original observer */
  const candidates=document.querySelectorAll('.campaign,.section-head,.seoky-info-grid,.footer-grid');
  candidates.forEach(el=>el.classList.add('seoky-reveal'));
  if(!("IntersectionObserver" in window)){
    candidates.forEach(el=>el.classList.add('seoky-visible'));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('seoky-visible');io.unobserve(entry.target)}})
  },{threshold:.12,rootMargin:'0px 0px -30px 0px'});
  candidates.forEach(el=>io.observe(el));
})();

/* Extracted from original inline <script> blocks in original order */

(function(){
  const products = {
    "black-tee": {name:"SEOKY BLACK TEE", color:"Black", price:1500},
    "gray-tee": {name:"SEOKY GRAY TEE", color:"Gray", price:1500},
    "white-tee": {name:"SEOKY WHITE TEE", color:"White", price:1500},
    "navy-blue-tee": {name:"SEOKY NAVY BLUE TEE", color:"Navy Blue", price:1500},
    "olive-green-tee": {name:"SEOKY OLIVE GREEN TEE", color:"Olive Green", price:1500},
    "sand-tee": {name:"SEOKY SAND TEE", color:"Sand", price:1500},
    "burgundy-tee": {name:"SEOKY BURGUNDY TEE", color:"Burgundy", price:1500},
    "faded-blue-tee": {name:"SEOKY FADED BLUE TEE", color:"Faded Blue", price:1500},
    "chocolate-brown-tee": {name:"SEOKY CHOCOLATE BROWN TEE", color:"Chocolate Brown", price:1500}
  };
  const colorFilter = document.getElementById('seokyColorFilter');
  const sortSelect = document.getElementById('seokySortProducts');
  const resetButton = document.getElementById('seokyResetFilters');
  const wishlistFilter = document.getElementById('seokyWishlistFilter');
  const savedCount = document.getElementById('seokySavedCount');
  const count = document.getElementById('seokyProductCount');
  const grid = document.querySelector('#shop .products');
  if (!grid || !colorFilter || !sortSelect) return;
  const cards = Array.from(grid.querySelectorAll('.product'));
  cards.forEach(card => {
    const id = card.dataset.productId;
    const price = card.querySelector('.price');
    if (price && !card.querySelector('.seoky-availability')) {
      const note = document.createElement('span');
      note.className = 'seoky-availability';
      note.textContent = 'Confirm availability on WhatsApp';
      price.insertAdjacentElement('afterend', note);
    }
    if (!products[id]) card.dataset.productId = '';
  });
  let savedOnly = false;
  function readSavedProducts(){
    return typeof getWishlist === 'function' ? getWishlist() : [];
  }
  function updateSavedCount(){
    const saved = readSavedProducts();
    if (savedCount) savedCount.textContent = String(saved.length);
    if (wishlistFilter) {
      wishlistFilter.classList.toggle('active', savedOnly);
      wishlistFilter.setAttribute('aria-pressed', String(savedOnly));
    }
  }
  function updateProducts(){
    const chosenColor = colorFilter.value;
    const sort = sortSelect.value;
    const saved = readSavedProducts();
    const ordered = cards.slice().sort((a,b) => {
      const pa = products[a.dataset.productId] || {name:'',color:'',price:0};
      const pb = products[b.dataset.productId] || {name:'',color:'',price:0};
      if (sort === 'price-low') return pa.price - pb.price;
      if (sort === 'price-high') return pb.price - pa.price;
      if (sort === 'name') return pa.name.localeCompare(pb.name);
      return cards.indexOf(a) - cards.indexOf(b);
    });
    ordered.forEach(card => grid.appendChild(card));
    let visible = 0;
    ordered.forEach(card => {
      const product = products[card.dataset.productId];
      const show = !!product && (chosenColor === 'all' || product.color === chosenColor) && (!savedOnly || saved.includes(card.dataset.productId));
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = visible + (visible === 1 ? ' product' : ' products');
  }
  colorFilter.addEventListener('change', updateProducts);
  sortSelect.addEventListener('change', updateProducts);
  wishlistFilter?.addEventListener('click', () => { savedOnly = !savedOnly; updateProducts(); updateSavedCount(); });
  resetButton?.addEventListener('click', () => {colorFilter.value='all';sortSelect.value='featured';savedOnly=false;updateProducts();updateSavedCount();});
  document.querySelectorAll('footer .footer-links a[data-seoky-color]').forEach(link => {
    link.addEventListener('click', () => {
      if (resetButton) resetButton.click();
      colorFilter.value = link.dataset.seokyColor;
      colorFilter.dispatchEvent(new Event('change', {bubbles:true}));
    });
  });
  window.addEventListener('storage', () => { updateProducts(); updateSavedCount(); });
  window.addEventListener('seoky:catalog-updated', () => {
    Object.keys(products).forEach(id => { if (typeof PRODUCTS !== 'undefined' && PRODUCTS[id]) products[id].price = PRODUCTS[id].price; });
    updateProducts();
    updateSavedCount();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.heart, .wishlist-btn, #seokyWishlist')) {
      setTimeout(() => { updateProducts(); updateSavedCount(); }, 80);
    }
  });
  updateProducts();
  updateSavedCount();
  // Remove any old demo password left by an earlier version; accounts are postponed.
  try {
    const oldUser = JSON.parse(storageGet('seokyUser') || 'null');
    if (oldUser && Object.prototype.hasOwnProperty.call(oldUser, 'password')) {
      delete oldUser.password;
      storageSet('seokyUser', JSON.stringify(oldUser));
    }
  } catch (e) { /* Ignore malformed demo data; the storefront should still load. */ }
})();

/* Extracted from original inline <script> blocks in original order */

(function(){
  const DEFAULT_PRICE=1500, DEFAULT_STOCK=10, ADMIN_PIN="2468";
  const saved=safeParse(storageGet("seokyAdminCatalog")||"{}",{});
  Object.values(PRODUCTS).forEach(product=>{
    product.stock=Number.isInteger(product.stock)?product.stock:DEFAULT_STOCK;
    const row=saved && saved[product.id];
    if(row && Number.isInteger(Number(row.price)) && Number(row.price)>=0 && Number(row.price)<=100000000) product.price=Number(row.price);
    if(row && Number.isInteger(Number(row.stock)) && Number(row.stock)>=0 && Number(row.stock)<=1000000) product.stock=Number(row.stock);
  });
  function updateStorefront(){
    cart=cart.map(item=>({...item,price:PRODUCTS[item.id]?.price??item.price,name:PRODUCTS[item.id]?.name??item.name,image:PRODUCTS[item.id]?.image??item.image}));
    saveCart();
    document.querySelectorAll("#shop .product[data-product-id]").forEach(card=>{
      const product=PRODUCTS[card.dataset.productId], price=card.querySelector(".price");
      if(product&&price) price.textContent="Rs. "+formatMoney(product.price);
    });
    if(typeof activeProductId!=="undefined"&&activeProductId&&PRODUCTS[activeProductId]){
      const price="Rs. "+formatMoney(PRODUCTS[activeProductId].price);
      const a=document.getElementById("seokyModalPrice"), b=document.getElementById("seokyModalDetailPrice");
      if(a)a.textContent=price;if(b)b.textContent=price;
    }
    if(typeof renderCart==="function")renderCart();
    window.dispatchEvent(new Event("seoky:catalog-updated"));
  }
  // Apply saved prices on page load, including any cart restored from storage.
  updateStorefront();
  function renderRows(){
    document.getElementById("seokyAdminRows").innerHTML=Object.values(PRODUCTS).map(p=>`<tr><td><strong>${p.color}</strong><br><span style="color:#888">${p.name}</span></td><td><input type="number" min="0" max="100000000" step="1" data-admin-price="${p.id}" aria-label="${p.color} price" value="${p.price}"></td><td><input type="number" min="0" max="1000000" step="1" data-admin-stock="${p.id}" aria-label="${p.color} demo stock" value="${p.stock}"></td></tr>`).join("");
  }
  window.openSeokyAdmin=function(){
    const pin=window.prompt("Demo admin PIN (not secure authentication):");
    if(pin!==ADMIN_PIN){if(pin!==null)showToast("Admin PIN not accepted");return;}
    renderRows();document.getElementById("seokyAdminStatus").textContent="";
    document.getElementById("seokyAdminOverlay").classList.add("open");document.body.style.overflow="hidden";
  };
  window.closeSeokyAdmin=function(){document.getElementById("seokyAdminOverlay")?.classList.remove("open");document.body.style.overflow="";};
  window.saveSeokyAdminSettings=function(){
    const updated={};
    for(const p of Object.values(PRODUCTS)){
      const pi=document.querySelector(`[data-admin-price="${p.id}"]`), si=document.querySelector(`[data-admin-stock="${p.id}"]`);
      const price=Number(pi?.value), stock=Number(si?.value);
      if(!Number.isInteger(price)||price<0||price>100000000){document.getElementById("seokyAdminStatus").textContent=`Enter a whole-number price for ${p.color}.`;pi?.focus();return;}
      if(!Number.isInteger(stock)||stock<0||stock>1000000){document.getElementById("seokyAdminStatus").textContent=`Enter a whole-number stock for ${p.color}.`;si?.focus();return;}
      updated[p.id]={price,stock};
    }
    if(!storageSet("seokyAdminCatalog",JSON.stringify(updated))){document.getElementById("seokyAdminStatus").textContent="Could not save settings in this browser.";return;}
    Object.keys(updated).forEach(id=>{PRODUCTS[id].price=updated[id].price;PRODUCTS[id].stock=updated[id].stock;});
    updateStorefront();document.getElementById("seokyAdminStatus").textContent="Saved in this browser. Demo stock is not shared or live.";showToast("Demo catalogue saved");
  };
  window.resetSeokyAdminSettings=function(){
    const defaults={};Object.values(PRODUCTS).forEach(p=>{p.price=DEFAULT_PRICE;p.stock=DEFAULT_STOCK;defaults[p.id]={price:DEFAULT_PRICE,stock:DEFAULT_STOCK};});
    if(!storageSet("seokyAdminCatalog",JSON.stringify(defaults))){document.getElementById("seokyAdminStatus").textContent="Could not save reset in this browser.";return;}
    renderRows();updateStorefront();document.getElementById("seokyAdminStatus").textContent="Defaults restored: Rs. 1,500 and 10 demo units per color.";showToast("Demo catalogue reset");
  };
  // Enforce the browser-local demo stock for cart adds and quantity increments.
  const originalAdd=window.addToCart;
  window.addToCart=function(id,name,price,image,size){
    const p=PRODUCTS[id], inCart=cart.filter(row=>row.id===id).reduce((n,row)=>n+Number(row.qty||0),0);
    if(!p||Number(p.stock||0)<=inCart){showToast(Number(p?.stock||0)<=0?"This item is out of stock":"Demo stock limit reached");return;}
    return originalAdd.call(this,id,name,price,image,size);
  };
  const originalChangeQty=window.changeQty;
  window.changeQty=function(key,amount){
    const item=cart.find(row=>row.key===key);
    if(item&&amount>0){const p=PRODUCTS[item.id], qty=cart.filter(row=>row.id===item.id).reduce((n,row)=>n+Number(row.qty||0),0);if(!p||qty>=Number(p.stock||0)){showToast("Demo stock limit reached");return;}}
    return originalChangeQty.call(this,key,amount);
  };
  const originalCheckout=window.openCheckout;
  window.openCheckout=function(){
    const bad=Object.values(PRODUCTS).find(p=>cart.filter(item=>item.id===p.id).reduce((n,item)=>n+Number(item.qty||0),0)>Number(p.stock||0));
    if(bad){showToast("Please review cart: demo stock changed");return;}
    return originalCheckout.call(this);
  };
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&document.getElementById("seokyAdminOverlay")?.classList.contains("open"))window.closeSeokyAdmin();});
})();

/* =====================================================
   SEOKY LEVEL-UP — find-your-size helper (added Oct 2026)
===================================================== */
window.seokyFindMySize = function(){
  const input = document.getElementById("seokyChestInput");
  const result = document.getElementById("seokySizeResult");
  if (!input || !result) return;
  const chest = parseFloat(input.value);
  if (!Number.isFinite(chest)) { result.textContent = "Type your chest size in inches first."; return; }
  let size = null;
  if (chest < 38) size = "S";
  else if (chest < 40) size = "M";
  else if (chest < 42) size = "L";
  else if (chest <= 44) size = "XL";
  if (!size){
    result.textContent = chest < 36
      ? "Below the guide — S is your closest fit, with the oversized drape doing the rest."
      : "Above the guide — XL is your closest fit. Confirm with SEOKY on WhatsApp.";
    return;
  }
  result.textContent = "Your size: " + size + " — for a clean regular fit. Size down if you want it less oversized.";
};

/* =====================================================
   SEOKY — smooth product entrance stagger (added Oct 2026)
===================================================== */
(function(){
  const cards = Array.from(document.querySelectorAll("#shop .products .product"));
  cards.forEach((card, i)=>{
    const delay = (i % 3) * 90 + Math.floor(i / 3) * 70;
    card.style.setProperty("--enter-delay", delay + "ms");
    card.addEventListener("animationend", event=>{
      if (event.animationName === "seokyCardIn") card.classList.add("entered");
    });
  });
})();

/* =====================================================
   SEOKY WOW PACK — fly-to-cart, ticker marquee build,
   per-card pointer glare (added Oct 2026)
===================================================== */
(function(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- ticker marquee: duplicate the line so it can loop ---- */
  const ticker = document.querySelector(".ticker");
  if (ticker && !ticker.querySelector(".seoky-ticker-track")){
    const text = ticker.textContent.trim();
    if (text){
      const half = '<span>' + text + '</span><span>' + text + '</span>';
      ticker.innerHTML = '<div class="seoky-ticker-track">' + half + half + '</div>';
    }
  }

  /* ---- pointer glare position on product photos ---- */
  if (!reduceMotion){
    document.querySelectorAll("#shop .product").forEach(card=>{
      const imgWrap = card.querySelector(".product-img");
      if (!imgWrap) return;
      card.addEventListener("pointermove", e=>{
        const r = imgWrap.getBoundingClientRect();
        imgWrap.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        imgWrap.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      }, {passive:true});
    });
  }

  /* ---- fly-to-cart dot ---- */
  if (!reduceMotion && typeof window.addToCart === "function"){
    const originalAddToCart = window.addToCart;
    window.addToCart = function(){
      const result = originalAddToCart.apply(this, arguments);
      try {
        const from = document.activeElement;
        const target = document.querySelector(".header .cart-wrap") || document.getElementById("cartCount");
        if (from && target && from.classList && from.classList.contains("add")){
          const a = from.getBoundingClientRect();
          const b = target.getBoundingClientRect();
          const dot = document.createElement("span");
          dot.className = "seoky-fly-dot";
          dot.style.left = (a.left + a.width / 2 - 7) + "px";
          dot.style.top = (a.top + a.height / 2 - 7) + "px";
          document.body.appendChild(dot);
          const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
          const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
          const anim = dot.animate([
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: "translate(" + dx * .55 + "px," + (dy - 90) + "px) scale(.85)", opacity: 1, offset: .55 },
            { transform: "translate(" + dx + "px," + dy + "px) scale(.35)", opacity: .7 }
          ], { duration: 750, easing: "cubic-bezier(.22,.8,.3,1)" });
          anim.onfinish = ()=> dot.remove();
          setTimeout(()=> dot.remove(), 900);
        }
      } catch (e) { /* the dot is decoration; the cart already worked */ }
      return result;
    };
  }
})();

/* =====================================================
   SEOKY PREMIUM PACK — preloader, marquee, scroll cue,
   cursor ring, magnetic buttons, image settle
   (added Oct 2026)
===================================================== */
(function(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* ---- brand preloader (once per session) ---- */
  if (!reduceMotion && !sessionStorage.getItem("seokyPreSeen")){
    sessionStorage.setItem("seokyPreSeen", "1");
    const pre = document.createElement("div");
    pre.id = "seokyPreloader";
    pre.innerHTML = '<div class="seoky-pre-word">'
      + "SEOKY".split("").map((ch, i)=> '<span style="animation-delay:' + (i * 0.07) + 's">' + ch + '</span>').join("")
      + '</div><div class="seoky-pre-sub">Ambalangoda — Sri Lanka</div>'
      + '<div class="seoky-pre-bar"><i></i></div>';
    document.body.appendChild(pre);
    const hide = ()=> pre.classList.add("done");
    window.addEventListener("load", ()=> setTimeout(hide, 650), { once:true });
    setTimeout(hide, 2400);
    setTimeout(()=> pre.remove(), 4200);
  }

  /* ---- outlined marquee strip after the shop section ---- */
  const shop = document.getElementById("shop");
  if (shop && !document.querySelector(".seoky-marquee")){
    const phrase = '<span>SEOKY</span><span class="fill">SIMPLE. BOLD. EVERYDAY.</span>';
    const half = '<div style="display:flex">' + phrase + phrase + '</div>';
    const strip = document.createElement("div");
    strip.className = "seoky-marquee";
    strip.setAttribute("aria-hidden", "true");
    strip.innerHTML = '<div class="seoky-marquee-track">' + half + half + '</div>';
    shop.insertAdjacentElement("afterend", strip);
  }

  /* ---- image settle cleanup (so hover zoom stays free) ---- */
  document.addEventListener("animationend", e=>{
    if (e.animationName === "seokyImgSettle") e.target.classList.add("seoky-settled");
  });

  if (!finePointer || reduceMotion) return;

  /* ---- trailing cursor ring ---- */
  const ring = document.createElement("div");
  ring.id = "seokyCursorRing";
  document.body.appendChild(ring);
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener("pointermove", e=>{
    mx = e.clientX; my = e.clientY;
    ring.classList.add("on");
    ring.classList.toggle("big", !!e.target.closest("a,button,.product"));
  }, { passive:true });
  (function follow(){
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(follow);
  })();

  /* ---- magnetic pull on the big buttons ---- */
  document.querySelectorAll(".campaign .cta, .checkout, .auth-submit").forEach(btn=>{
    btn.addEventListener("pointermove", e=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = "translate(" + (x * 10).toFixed(1) + "px," + (y * 7).toFixed(1) + "px)";
    });
    btn.addEventListener("pointerleave", ()=>{ btn.style.transform = ""; });
  });
})();

/* =====================================================
   SEOKY WOW PACK 2 — cart-open cascade trigger
   (added Oct 2026)
===================================================== */
(function(){
  if (typeof window.openCart === "function"){
    const originalOpenCart = window.openCart;
    window.openCart = function(){
      const result = originalOpenCart.apply(this, arguments);
      const drawer = document.querySelector(".cart-drawer");
      if (drawer){
        drawer.classList.remove("seoky-just-opened");
        void drawer.offsetWidth;
        drawer.classList.add("seoky-just-opened");
        setTimeout(()=> drawer.classList.remove("seoky-just-opened"), 800);
      }
      return result;
    };
  }
})();
