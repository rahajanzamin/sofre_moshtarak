// — ساده‌ترین منطقِ سمتِ کاربر برای فیلتر/مرتب‌سازی/ثبت (در عمل باید با سرور هماهنگ شود)

/**
 * فیلترها و جستجو را بر اساس ورودی‌ها اعمال می‌کند.
 */
function filterCards(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const priceSel = document.getElementById('priceFilter').value;
  const container = document.getElementById('cardsContainer');
  // انتخاب همه ستون های کارت
  const cardColumns = Array.from(container.querySelectorAll('.col-md-6'));
  let visibleCount = 0;

  cardColumns.forEach(col => {
    const card = col.querySelector('.card.food-card');
    // اگر کارتی در داخل ستون نبود، ادامه نده
    if (!card) return; 

    const title = card.querySelector('.card-title').innerText.toLowerCase();
    const desc = card.querySelector('.card-text').innerText.toLowerCase();
    const type = card.dataset.type || '';
    // از یک فیلد مخفی برای دسترسی به قیمت استفاده می‌کنیم
    const price = Number(card.dataset.price || 0);

    let show = true;

    // ۱. فیلتر جستجوی متنی
    if (q && !(title.includes(q) || desc.includes(q) || type.includes(q))) {
        show = false;
    }

    // ۲. فیلتر نوع (فیلتر اعمال شده از دکمه‌های قهرمان)
    if (window._appliedType && window._appliedType !== '' && window._appliedType !== type) {
        show = false;
    }

    // ۳. فیلتر قیمت
    if (show && priceSel) {
      if (priceSel === '0-0' && price !== 0) show = false;
      else if (priceSel === '1-20' && !(price > 0 && price <= 20)) show = false;
      else if (priceSel === '20-50' && !(price > 20 && price <= 50)) show = false;
      else if (priceSel === '50+' && !(price > 50)) show = false;
    }
    
    // اعمال نمایش/پنهان‌سازی
    if (show) { 
        col.classList.remove('d-none'); 
        visibleCount++; 
    } else { 
        col.classList.add('d-none'); 
    }
  });

  document.getElementById('noResults').classList.toggle('d-none', visibleCount > 0);
  
  // پس از فیلتر، مرتب سازی را اعمال کن
  sortCards(); 
}

/**
 * فیلتر نوع از دکمه‌های هیرو را اعمال می‌کند و فیلتر اصلی را اجرا می‌کند.
 */
function applyFilter(type){
  document.getElementById('searchInput').value = '';
  // ریست کردن فیلتر قیمت هنگام استفاده از دکمه‌های نوع
  if (type !== 'sell' && type !== 'buy') {
    document.getElementById('priceFilter').value = type === 'free' ? '0-0' : '';
  } else {
    document.getElementById('priceFilter').value = '';
  }
  
  window._appliedType = type;
  filterCards();
}


/**
 * کارت‌های قابل مشاهده را مرتب‌سازی می‌کند.
 */
function sortCards(){
  const container = document.getElementById('cardsContainer');
  // فقط ستون های قابل مشاهده را برای مرتب سازی انتخاب کنید
  const cards = Array.from(container.querySelectorAll('.col-md-6:not(.d-none)'));
  const sort = document.getElementById('sortBy').value;

  cards.sort((a,b) => {
    const ca = a.querySelector('.card.food-card'), cb = b.querySelector('.card.food-card');
    
    // جلوگیری از خطا اگر کارت اصلی پیدا نشد
    if (!ca || !cb) return 0; 
    
    // مرتب سازی بر اساس تاریخ ایجاد (جدیدترین)
    if(sort === 'newest') return new Date(cb.dataset.created) - new Date(ca.dataset.created);
    
    // مرتب سازی بر اساس قیمت
    const priceA = Number(ca.dataset.price || 0);
    const priceB = Number(cb.dataset.price || 0);
    if(sort === 'price-asc') return priceA - priceB;
    if(sort === 'price-desc') return priceB - priceA;
    
    return 0;
  });

  // چیدن دوباره کارت‌های مرتب شده در کانتینر
  cards.forEach(c => container.appendChild(c));
}

/**
 * یک کارت جدید ایجاد کرده و به ابتدای لیست اضافه می‌کند.
 */
function submitPost(){
  // خواندن ورودی‌ها
  const title = document.getElementById('postTitle').value.trim();
  const type = document.getElementById('postType').value;
  const desc = document.getElementById('postDesc').value.trim();
  const price = Number(document.getElementById('postPrice').value || 0);
  const qty = Number(document.getElementById('postQty').value || 1);
  const pickup = document.getElementById('postPickup').value.trim();
  const img = document.getElementById('postImage').value.trim() || 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800&auto=format&fit=crop&s=placeholder';
  const owner = "شما"; // فرض بر این است که کاربر لاگین کرده است

  // ساخت نمونهٔ کارت 
  const container = document.getElementById('cardsContainer');
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';
  
  const priceText = price === 0 ? 'رایگان' : price.toLocaleString() + ' تومان';
  let typeText = '';
  let btnClass = 'btn-primary';
  let btnAction = 'buy';
  let btnLabel = 'خرید';

  if (type === 'free') {
    typeText = 'اهدایی';
    btnClass = 'btn-success';
    btnAction = 'claim';
    btnLabel = 'ادخال';
  } else if (type === 'sell') {
    typeText = 'برای فروش';
    btnAction = 'buy';
  } else if (type === 'buy') {
    typeText = 'درخواست خرید';
    btnAction = 'request';
    btnLabel = 'درخواست';
    btnClass = 'btn-warning';
  }
  
  // تنظیم تاریخ ایجاد برای مرتب سازی (امروز)
  const today = new Date().toISOString().slice(0,10);

  col.innerHTML = `
    <div class="card food-card h-100" data-type="${type}" data-price="${price}" data-created="${today}">
      <img src="${img}" class="card-img-top" alt="${title}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${title} (${qty} عدد)</h5>
        <p class="card-text text-muted small">صاحب: ${owner} ${pickup ? ' — ' + pickup : ''}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <span class="fw-bold">${priceText}</span>
            <div class="small text-muted">${typeText}</div>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-primary btn-sm" onclick="openChat('${owner}')"><i class="bi bi-chat-dots"></i></button>
            <button class="btn ${btnClass} btn-sm" onclick="claimItem(this)" data-action="${btnAction}">${btnLabel}</button>
          </div>
        </div>
      </div>
    </div>`;
    
  // اضافه کردن المان جدید به ابتدای کانتینر
  container.insertBefore(col, container.firstChild);

  // بستن مودال و پاک‌سازی فرم
  const modalEl = document.getElementById('postModal');
  const bsModal = bootstrap.Modal.getInstance(modalEl);
  bsModal.hide();
  document.getElementById('postForm').reset();
  
  // فیلتر و مرتب سازی مجدد برای قرار دادن آیتم جدید در جای صحیح
  filterCards();
}

function openChat(name){
  // نمونه: در نسخهٔ کامل اینجا پنل چت یا شماره تماس باز می‌شود
  alert('برای گفتگو با ' + name + ' از طریق پیام‌رسان دانشگاه/چت داخلی پیغام بده.');
}

function claimItem(btn){
  const action = btn.dataset.action;
  // تداعیٔ اقدام ساده 
  if(action === 'claim' || action === 'buy' || action === 'request'){
    btn.innerHTML = '<i class="bi bi-check-circle"></i> در حال پردازش';
    btn.disabled = true;
    setTimeout(()=> {
      btn.innerHTML = 'درخواست ارسال شد';
    }, 900);
  }
}
/**
 * مدیریت فرم ورود کاربر (به‌روز شده برای استفاده از کد ملی)
 */
function handleLogin() {
    // تغییر ID فیلد از loginEmail به loginNationalCode
    const nationalCode = document.getElementById('loginNationalCode').value; 
    const password = document.getElementById('loginPassword').value;

    console.log('Attempting login for National Code:', nationalCode);

    const modalEl = document.getElementById('authModal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    bsModal.hide();
    
    alert(`خوش آمدید، ورود با کد ملی ${nationalCode} موفقیت آمیز بود. (در آینده به سرور متصل شود)`);
}

/**
 * مدیریت فرم ثبت نام کاربر (به‌روز شده برای استفاده از کد ملی)
 */
function handleRegister() {
    const name = document.getElementById('registerName').value;
    // تغییر ID فیلد از registerEmail به registerNationalCode
    const nationalCode = document.getElementById('registerNationalCode').value; 
    const password = document.getElementById('registerPassword').value;
    
    console.log('Attempting register for:', name, 'National Code:', nationalCode);

    const modalEl = document.getElementById('authModal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    bsModal.hide();

    alert(`کاربر ${name} عزیز، ثبت‌نام شما با کد ملی ${nationalCode} انجام شد. (در آینده به سرور متصل شود)`);
}
// ... بقیه توابع شما (filterCards, sortCards, submitPost و ...) باید در این فایل حفظ شوند.
document.addEventListener('DOMContentLoaded', () => {
  filterCards();
});