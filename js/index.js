/* =============================================================================
 * index.js —— 首页脚本
 * -----------------------------------------------------------------------------
 * 模块：
 *   1) 首屏 Banner 自动轮播（手动切换 / 指示器 / 悬停暂停）
 *   2) 品牌快捷入口（横向滚动）
 *   3) 车源分区（精品准新车 / 万元代步车 / 新能源二手车 / 豪华车专区）
 *   4) 购车服务保障 / 线下门店 / 四步流程 / 资讯
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.AppData, App = window.App;

  /* =========================================================================
   * 1. 首屏 Banner 轮播
   * ====================================================================== */
  function initBanner() {
    var track = App.qs('#bannerTrack');
    if (!track) return;

    /* 渲染轮播项 */
    track.innerHTML = D.BANNERS.map(function (b) {
      return '<div class="banner-slide">' +
        '<img src="' + b.image + '" alt="' + App.esc(b.title) + '">' +
        '<div class="banner-content">' +
          '<span class="banner-tag">● ' + App.esc(b.tag) + '</span>' +
          '<h2 class="banner-title">' + App.esc(b.title) + '</h2>' +
          '<p class="banner-desc">' + App.esc(b.desc) + '</p>' +
          '<div class="banner-actions">' +
            '<a href="' + b.link + '" class="btn btn-accent btn-lg">' + App.esc(b.btn) + '</a>' +
            '<a href="sellcar.html" class="btn btn-ghost btn-lg">我要卖车 · 免费估价</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var dots = App.qs('#bannerDots');
    dots.innerHTML = D.BANNERS.map(function (_, i) {
      return '<button class="banner-dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '" aria-label="第 ' + (i + 1) + ' 张"></button>';
    }).join('');

    var index = 0, total = D.BANNERS.length, timer = null;

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      App.qsa('.banner-dot', dots).forEach(function (d, di) {
        d.classList.toggle('active', di === index);
      });
    }
    function play() { stop(); timer = setInterval(function () { go(index + 1); }, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    App.qs('#bannerPrev').addEventListener('click', function () { go(index - 1); play(); });
    App.qs('#bannerNext').addEventListener('click', function () { go(index + 1); play(); });
    dots.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-slide]');
      if (btn) { go(+btn.getAttribute('data-slide')); play(); }
    });
    /* 鼠标悬停暂停自动播放 */
    var banner = App.qs('#banner');
    banner.addEventListener('mouseenter', stop);
    banner.addEventListener('mouseleave', play);
    /* 触摸滑动切换（移动端） */
    var startX = 0;
    banner.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    banner.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      play();
    });
    play();
  }

  /* =========================================================================
   * 2. 品牌快捷入口
   * ====================================================================== */
  function initBrands() {
    var box = App.qs('#brandScroller');
    if (!box) return;
    box.innerHTML = D.BRANDS.slice(0, 12).map(function (b) {
      return '<a class="brand-chip" href="list.html?brand=' + encodeURIComponent(b.name) + '">' +
        '<span class="brand-logo" style="background:' + b.color + '">' + App.esc(b.initial) + '</span>' +
        '<span class="b-name">' + App.esc(b.name) + '</span>' +
        '<span class="b-count">' + b.count + ' 台在售</span>' +
      '</a>';
    }).join('') +
    '<a class="brand-chip more" href="list.html">' +
      '<span class="brand-logo" style="background:#EEF2F7;color:#6B7688">＋</span>' +
      '<span class="b-name">全部品牌</span><span class="b-count">' + D.BRANDS.length + ' 个</span></a>';
  }

  /* =========================================================================
   * 3. 车源分区（Tab 切换）
   * ====================================================================== */
  function initZones() {
    var tabsBox = App.qs('#zoneTabs'), grid = App.qs('#zoneGrid');
    if (!tabsBox || !grid) return;
    var sections = D.SECTIONS;          // ['精品准新车','万元代步车','新能源二手车','豪华车专区']
    var current = sections[0];

    tabsBox.innerHTML = sections.map(function (s) {
      var n = D.CARS.filter(function (c) { return c.sections.indexOf(s) > -1; }).length;
      return '<button class="zone-tab' + (s === current ? ' active' : '') + '" data-zone="' + s + '">' + s + ' <span style="opacity:.7">(' + n + ')</span></button>';
    }).join('');

    function render(section) {
      var cars = D.CARS.filter(function (c) { return c.sections.indexOf(section) > -1; })
        .sort(function (a, b) { return a.createdAt - b.createdAt; })
        .slice(0, 8);
      App.renderCars(grid, cars);
    }
    render(current);

    tabsBox.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-zone]');
      if (!btn) return;
      current = btn.getAttribute('data-zone');
      App.qsa('.zone-tab', tabsBox).forEach(function (t) { t.classList.toggle('active', t === btn); });
      render(current);
    });
  }

  /* =========================================================================
   * 4. 购车服务保障
   * ====================================================================== */
  function initServices() {
    var box = App.qs('#serviceGrid');
    if (!box) return;
    box.innerHTML = D.SERVICES.map(function (s) {
      var link = s.key === 'valuation' ? 'sellcar.html' : (s.key === 'finance' ? 'service.html#finance' : 'service.html#' + s.key);
      return '<a class="card card-hover service-card" href="' + link + '">' +
        '<div class="service-icon">' + App.icon(s.icon) + '</div>' +
        '<h3>' + App.esc(s.title) + '</h3>' +
        '<p>' + App.esc(s.desc) + '</p>' +
      '</a>';
    }).join('');
  }

  /* =========================================================================
   * 5. 线下门店（首页展示前 4 家）
   * ====================================================================== */
  function initStores() {
    var box = App.qs('#storeGrid');
    if (!box) return;
    box.innerHTML = D.STORES.slice(0, 4).map(function (s) {
      return '<article class="card card-hover store-card">' +
        '<div class="store-thumb img-wrap"><img data-src="' + D.storeImage(s) + '" alt="' + App.esc(s.name) + '" loading="lazy">' +
          '<span class="store-city-badge">' + App.esc(s.city) + '</span></div>' +
        '<div class="store-info">' +
          '<h4>' + App.esc(s.name) + '</h4>' +
          '<div class="store-line">' + App.icon('location') + '<span>' + App.esc(s.address) + '</span></div>' +
          '<div class="store-line">' + App.icon('clock') + '<span>营业时间：' + App.esc(s.hours) + '</span></div>' +
          '<div class="store-line phone">' + App.icon('phone') + '<span>' + App.esc(s.phone) + '</span></div>' +
        '</div>' +
      '</article>';
    }).join('');
    App.bindLazyImages(box);
  }

  /* =========================================================================
   * 6. 购车四步流程
   * ====================================================================== */
  function initProcess() {
    var box = App.qs('#processWrap');
    if (!box) return;
    box.innerHTML = D.PROCESS.map(function (p) {
      return '<div class="process-item">' +
        '<div class="process-num">' + p.step + '</div>' +
        '<h4>' + App.esc(p.title) + '</h4>' +
        '<p>' + App.esc(p.desc) + '</p>' +
      '</div>';
    }).join('');
  }

  /* =========================================================================
   * 7. 资讯 / 购车攻略
   * ====================================================================== */
  function initNews() {
    var box = App.qs('#newsGrid');
    if (!box) return;
    box.innerHTML = D.NEWS.slice(0, 3).map(function (n) {
      return '<article class="card card-hover news-card">' +
        '<a href="guide.html" class="news-thumb img-wrap">' +
          '<img data-src="' + D.newsImage(n) + '" alt="' + App.esc(n.title) + '" loading="lazy">' +
          '<span class="news-cat">' + App.esc(n.cat) + '</span>' +
        '</a>' +
        '<div class="news-body">' +
          '<h4><a href="guide.html">' + App.esc(n.title) + '</a></h4>' +
          '<p>' + App.esc(n.summary) + '</p>' +
          '<div class="news-foot"><span>' + App.esc(n.date) + '</span><span>' + App.icon('eye', '') + ' ' + n.views.toLocaleString('en-US') + ' 阅读</span></div>' +
        '</div>' +
      '</article>';
    }).join('');
    App.bindLazyImages(box);
  }

  /* =========================================================================
   * 初始化
   * ====================================================================== */
  function init() {
    initBanner();
    initBrands();
    initZones();
    initServices();
    initStores();
    initProcess();
    initNews();
  }

  /* 页面脚本在 main.js 之后引入，直接执行（DOM 已就绪） */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
