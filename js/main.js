/* =============================================================================
 * main.js —— 全站公共运行时（头部/页脚骨架、弹窗、收藏、搜索、提示等）
 * -----------------------------------------------------------------------------
 * 提供能力：
 *   · App.icon()          统一 SVG 图标
 *   · App.store           本地存储（模拟后端：登录态/收藏/预约/浏览历史/卖车记录）
 *   · App.renderCarCard() 全站统一车辆卡片
 *   · App.toast()         轻提示
 *   · 头部导航吸顶、搜索联想、移动端抽屉、登录弹窗、预约看车弹窗、图片全屏预览
 *   · 收藏切换、浏览历史记录、返回顶部、表单校验工具
 * ========================================================================== */
(function (global) {
  'use strict';

  var D = global.AppData;

  /* =========================================================================
   * 1. 图标库（线性图标，颜色由 CSS 的 stroke 控制）
   * ====================================================================== */
  var SVG_HEAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
  var SVG = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    heartFill: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z" fill="currentColor"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 18l6-6-6-6"/>',
    arrowUp: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    arrowRight: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
    close: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
    menu: '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
    location: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/>',
    badge: '<path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="M8.2 13.9 7 22l5-3 5 3-1.2-8.1"/>',
    gauge: '<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M13.4 10.6 19 5"/><path d="M3.5 18a10 10 0 1 1 17 0"/>',
    wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 12h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 11h18"/>',
    car: '<path d="M5 17h14"/> <path d="M6.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M21.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M3 17v-6l2-5h14l2 5v6"/><path d="M3 11h18"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>',
    star: '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z"/>',
    filter: '<path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/><path d="M11 8v6"/><path d="M8 11h6"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    wechat: '<path d="M9 11a7 7 0 1 1 5 6.7L9.5 19l.8-3A7 7 0 0 1 9 11Z"/><path d="M17 8.5A5.5 5.5 0 0 1 22 14l-.5 2.6 2 .9-2.2 1.2"/>',
    message: '<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.4-4.6A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
    edit: '<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    tag: '<path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8L13.8 21a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6Z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9 9a2.8 2.8 0 1 1-4-4l9-9a4 4 0 0 0-1-1Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 9 5-5 5 5"/><path d="M12 4v12"/>',
    fire: '<path d="M12 22c4 0 6.5-2.6 6.5-6.2 0-4.4-4.3-6-4.3-9.8 0 0-2.2 1.2-2.2 3.6 0 1.4-.9 2.2-1.9 2.2-1 0-1.6-.8-1.6-1.8C7 11 5.5 12.7 5.5 15.8 5.5 19.4 8 22 12 22Z"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (SVG[name] || '') + '</svg>';
  }

  /* =========================================================================
   * 2. 本地存储（模拟服务端数据）
   * ====================================================================== */
  var KEYS = {
    user: 'uc_user', fav: 'uc_favs', appt: 'uc_appointments',
    history: 'uc_history', sales: 'uc_sales', city: 'uc_city'
  };
  function read(key, def) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? def : v; }
    catch (e) { return def; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式忽略 */ }
  }

  var store = {
    /* —— 登录用户 —— */
    getUser: function () { return read(KEYS.user, null); },
    setUser: function (u) { write(KEYS.user, u); },
    logout: function () { localStorage.removeItem(KEYS.user); },
    /* —— 收藏 —— */
    getFavs: function () { return read(KEYS.fav, []); },
    isFav: function (id) { return this.getFavs().indexOf(id) > -1; },
    toggleFav: function (id) {
      var list = this.getFavs(), i = list.indexOf(id);
      if (i > -1) list.splice(i, 1); else list.unshift(id);
      write(KEYS.fav, list);
      return i === -1;   // true = 已收藏
    },
    /* —— 预约看车 —— */
    getAppts: function () { return read(KEYS.appt, []); },
    addAppt: function (a) { var l = this.getAppts(); l.unshift(a); write(KEYS.appt, l); },
    removeAppt: function (id) { write(KEYS.appt, this.getAppts().filter(function (x) { return x.id !== id; })); },
    /* —— 浏览历史 —— */
    getHistory: function () { return read(KEYS.history, []); },
    addHistory: function (carId) {
      var l = this.getHistory().filter(function (x) { return x.carId !== carId; });
      l.unshift({ carId: carId, time: Date.now() });
      write(KEYS.history, l.slice(0, 50));
    },
    clearHistory: function () { write(KEYS.history, []); },
    /* —— 卖车记录 —— */
    getSales: function () { return read(KEYS.sales, []); },
    addSale: function (s) { var l = this.getSales(); l.unshift(s); write(KEYS.sales, l); },
    removeSale: function (id) { write(KEYS.sales, this.getSales().filter(function (x) { return x.id !== id; })); },
    /* —— 城市 —— */
    getCity: function () { return read(KEYS.city, '全国'); },
    setCity: function (c) { write(KEYS.city, c); }
  };

  /* =========================================================================
   * 3. 通用工具
   * ====================================================================== */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function isPhone(v) { return /^1[3-9]\d{9}$/.test(String(v).trim()); }
  function isCode(v) { return /^\d{4,6}$/.test(String(v).trim()); }
  function money(n) { return Number(n || 0).toFixed(2); }          // 万元两位小数
  function money1(n) { return Number(n || 0).toFixed(1); }
  function intWan(n) { return Math.round(Number(n) * 10000).toLocaleString('en-US'); }  // 万元 → 元（千分位）
  function dateStr(ts) {
    var d = new Date(ts || Date.now());
    var p = function (x) { return x < 10 ? '0' + x : x; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function todayStr() { return dateStr(Date.now()); }
  function timeAgo(ts) {
    var diff = Date.now() - ts, day = Math.floor(diff / 86400000);
    if (day <= 0) return '今天';
    if (day === 1) return '昨天';
    if (day < 30) return day + ' 天前';
    return dateStr(ts);
  }
  /* 上架时间文案（0 天 = 今天上架） */
  function listedText(days) {
    if (days <= 0) return '今天上架';
    if (days === 1) return '昨天上架';
    if (days < 30) return days + ' 天前上架';
    return Math.floor(days / 30) + ' 个月前上架';
  }
  /* 车辆卡片上的车况标签样式映射 */
  function tagClass(t) {
    if (t === '无事故' || t === '绝无泡水' || t === '原版原漆') return 'tag-green';
    if (t === '精品一手' || t === '个人一手车' || t === '准新车') return 'tag-red';
    if (t === '原厂质保' || t === '支持全国联保' || t === '可置换') return 'tag-orange';
    return 'tag-blue';
  }

  /* =========================================================================
   * 4. 页面骨架：头部 / 页脚 / 抽屉 / 全局弹窗
   * ====================================================================== */
  var NAV = [
    { label: '首页', href: 'index.html', key: 'index' },
    {
      label: '买车', href: 'list.html', key: 'list', children: [
        { label: '全部车源', href: 'list.html' },
        { label: '精品准新车', href: 'list.html?sections=精品准新车' },
        { label: '万元代步车', href: 'list.html?sections=万元代步车' },
        { label: '新能源二手车', href: 'list.html?sections=新能源二手车' },
        { label: '豪华车专区', href: 'list.html?sections=豪华车专区' }
      ]
    },
    { label: '我要卖车', href: 'sellcar.html', key: 'sellcar' },
    {
      label: '服务保障', href: 'service.html', key: 'service', children: [
        { label: '第三方检测', href: 'service.html#inspect' },
        { label: '一年质保', href: 'service.html#warranty' },
        { label: '分期金融', href: 'service.html#finance' },
        { label: '线下门店', href: 'store.html' }
      ]
    },
    { label: '购车指南', href: 'guide.html', key: 'guide' },
    { label: '关于我们', href: 'about.html', key: 'about' }
  ];

  var LOGO_MARK = '<span class="logo-mark"><svg viewBox="0 0 24 24"><path d="M5 15h14l-.9-4.2A2 2 0 0 0 16.1 9H7.9a2 2 0 0 0-2 1.8L5 15Zm0 0v3.2c0 .5.4.8.8.8h1.4c.5 0 .8-.3.8-.8V17h8v1.2c0 .5.4.8.8.8h1.4c.5 0 .8-.3.8-.8V15M7 12.4h.01M17 12.4h.01"/></svg></span>';

  function cityListHtml() {
    var cur = store.getCity();
    var list = ['全国'].concat(D.CITY_LIST);
    return list.map(function (c) {
      return '<button data-city="' + esc(c) + '" class="' + (c === cur ? 'active' : '') + '">' + esc(c) + '</button>';
    }).join('');
  }

  function renderHeader() {
    var host = qs('#siteHeader');
    if (!host) return;
    var page = document.body.getAttribute('data-page') || '';
    var user = store.getUser();
    var favCount = store.getFavs().length;

    var menuHtml = NAV.map(function (n) {
      var active = n.key === page ? ' active' : '';
      var caret = n.children ? icon('chevronDown', 'caret') : '';
      var drop = n.children
        ? '<div class="dropdown">' + n.children.map(function (c) { return '<a href="' + c.href + '">' + c.label + '</a>'; }).join('') + '</div>'
        : '';
      return '<div class="nav-item' + active + '"><a href="' + n.href + '">' + n.label + caret + '</a>' + drop + '</div>';
    }).join('');

    var userHtml = user
      ? '<a class="nav-user" href="user.html"><span class="nav-avatar">' + esc(user.name.charAt(0)) + '</span><span class="nav-username">' + esc(user.name) + '</span>' + icon('chevronDown', 'caret') + '</a>'
      : '<a href="javascript:;" class="btn btn-outline btn-sm" data-login>登录 / 注册</a>';

    host.className = 'app-header';
    host.innerHTML =
      /* —— 顶部细栏 —— */
      '<div class="topbar"><div class="container">' +
        '<div class="topbar-left">' +
          '<span class="topbar-item">优车汇 · 全国二手车严选平台，259 项检测 · 一年质保 · 7 天可退</span>' +
        '</div>' +
        '<div class="topbar-right">' +
          '<span class="hotline topbar-item">' + icon('phone') + '客服热线 400-800-1668</span>' +
          '<span class="divider"></span>' +
          '<span class="topbar-item city" id="cityPicker">' + icon('location') + '<span id="cityLabel">' + esc(store.getCity()) + '</span>切换' + icon('chevronDown', 'caret') +
            '<div class="city-pop" id="cityPop">' + cityListHtml() + '</div>' +
          '</span>' +
          '<span class="divider"></span>' +
          '<a href="user.html" class="topbar-item">' + icon('history') + '我的收藏（<span id="favCount">' + favCount + '</span>）</a>' +
        '</div>' +
      '</div></div>' +
      /* —— 主导航 —— */
      '<div class="navbar"><div class="container">' +
        '<a class="logo" href="index.html">' + LOGO_MARK +
          '<span class="logo-text"><strong>优车汇</strong><span>UCAR HUB</span></span></a>' +
        '<nav class="nav-menu">' + menuHtml + '</nav>' +
        '<div class="nav-search">' +
          '<div class="search-box">' + icon('search', 'search-icon') +
            '<input type="text" id="navSearchInput" placeholder="搜索品牌 / 车系 / 车型，如：宝马 3系" autocomplete="off">' +
            '<button class="search-submit" id="navSearchBtn">搜索</button>' +
          '</div>' +
          '<div class="suggest-list" id="suggestList"></div>' +
        '</div>' +
        '<div class="nav-actions">' +
          '<a href="sellcar.html" class="btn btn-accent btn-sm">' + icon('tag') + '我要卖车</a>' +
          userHtml +
          '<button class="mobile-toggle" id="mobileToggle">' + icon('menu') + '</button>' +
        '</div>' +
      '</div></div>';

    /* —— 移动端抽屉 —— */
    if (!qs('#drawer')) {
      var drawer = document.createElement('div');
      drawer.innerHTML =
        '<div class="drawer-mask" id="drawerMask"></div>' +
        '<aside class="drawer" id="drawer">' +
          '<div class="drawer-head"><a class="logo" href="index.html">' + LOGO_MARK +
            '<span class="logo-text"><strong>优车汇</strong><span>UCAR HUB</span></span></a>' +
            '<button class="drawer-close" id="drawerClose">' + icon('close') + '</button></div>' +
          '<div class="drawer-search"><div class="search-box" style="height:42px">' + icon('search', 'search-icon') +
            '<input type="text" id="drawerSearchInput" placeholder="搜索品牌 / 车系 / 车型"></div></div>' +
          '<nav class="drawer-menu">' +
            NAV.map(function (n) {
              var sub = n.children ? '<div class="sub">' + n.children.map(function (c) { return '<a href="' + c.href + '">' + c.label + '</a>'; }).join('') + '</div>' : '';
              return '<a href="' + n.href + '" class="' + (n.key === page ? 'active' : '') + '">' + n.label + '</a>' + sub;
            }).join('') +
            '<a href="user.html">个人中心</a>' +
          '</nav>' +
        '</aside>';
      document.body.appendChild(drawer);
    }
    bindHeaderEvents();   // 绑定头部交互（搜索联想 / 城市切换 / 移动端菜单）
  }

  function renderFooter() {
    var host = qs('#siteFooter');
    if (!host) return;
    host.className = 'app-footer';
    var year = new Date().getFullYear();
    host.innerHTML = '<div class="container">' +
      '<div class="footer-main">' +
        '<div class="footer-col">' +
          '<div class="footer-brand">' + LOGO_MARK + '<span class="logo-text"><strong>优车汇</strong><span>UCAR HUB</span></span></div>' +
          '<p class="footer-desc">优车汇（UCAR HUB）成立于 2015 年，是覆盖全国 200+ 城市的二手车严选交易平台，专注为消费者提供"检测透明、车况真实、售后无忧"的二手车交易服务。</p>' +
          '<div class="footer-contact-item">' + icon('award') + '<span>二手车经营许可证：京二手车经营备字第 2015-0886 号</span></div>' +
          '<div class="footer-contact-item">' + icon('badge') + '<span>营业执照统一社会信用代码：91110105MA0****L8X</span></div>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>买车服务</h5>' +
          '<a href="list.html">全部车源</a><a href="list.html?sections=精品准新车">精品准新车</a>' +
          '<a href="list.html?sections=万元代步车">万元代步车</a><a href="list.html?sections=新能源二手车">新能源二手车</a>' +
          '<a href="list.html?sections=豪华车专区">豪华车专区</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>卖车服务</h5>' +
          '<a href="sellcar.html">免费上门估价</a><a href="sellcar.html">高价收车</a>' +
          '<a href="sellcar.html">置换服务</a><a href="service.html#finance">分期金融</a><a href="store.html">门店地址</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>服务保障</h5>' +
          '<a href="service.html#inspect">第三方检测</a><a href="service.html#warranty">一年质保</a>' +
          '<a href="service.html#finance">购车金融</a><a href="guide.html">购车指南</a>' +
          '<a href="about.html">关于我们</a><a href="javascript:;">隐私政策</a><a href="javascript:;">用户协议</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>联系我们</h5>' +
          '<div class="footer-hotline">400-800-1668</div>' +
          '<div class="footer-contact-item">' + icon('clock') + '<span>服务时间：09:00 - 21:00（全年无休）</span></div>' +
          '<div class="footer-contact-item">' + icon('mail') + '<span>service@ucarhub.com</span></div>' +
          '<div class="footer-contact-item">' + icon('location') + '<span>北京市朝阳区东四环中路 78 号优车汇汽车广场 A 座</span></div>' +
          '<div class="qr-box" style="margin-top:14px"><div class="qr-img">' +
            '<img src="' + D.sceneImage('qr code of wechat official account for a used car platform, black and white, square, high contrast, no text', 'square') + '" alt="微信公众号二维码"></div>' +
            '<span>扫码关注公众号 · 每日上新</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-links">' +
        '<span>友情链接：</span>' +
        '<a href="javascript:;">中国汽车流通协会</a><a href="javascript:;">全国二手车信息平台</a>' +
        '<a href="javascript:;">北京汽车交易市场</a><a href="javascript:;">上海二手车行业协会</a>' +
        '<a href="javascript:;">汽车之家</a><a href="javascript:;">懂车帝</a>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<div>' +
          '<span>© 2015-' + year + ' 优车汇（北京）汽车服务有限公司 版权所有　京ICP备 2015886688 号-1</span><br>' +
          '<span class="license-tag">' + icon('shield') + '本站已通过 ISO9001 服务质量体系认证 · 全国二手车流通行业协会理事单位</span>' +
        '</div>' +
        '<div style="display:flex;gap:18px;flex-wrap:wrap">' +
          '<a href="javascript:;">隐私政策</a><a href="javascript:;">用户协议</a><a href="javascript:;">免责声明</a><a href="about.html">关于我们</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* 全局弹窗（登录 / 预约看车 / 图片预览 / 成功提示） */
  function renderGlobalModals() {
    if (qs('#authModal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      /* —— 登录 / 注册弹窗 —— */
      '<div class="modal-mask" id="authModal"><div class="modal">' +
        '<div class="modal-head"><div><div class="modal-title">欢迎登录优车汇</div>' +
          '<div class="modal-sub">登录后可收藏车辆、预约看车、管理卖车信息</div></div>' +
          '<button class="modal-close" data-close>' + icon('close') + '</button></div>' +
        '<div class="modal-body">' +
          '<div class="auth-tabs"><div class="auth-tab active" data-auth-tab="login">账号登录</div>' +
            '<div class="auth-tab" data-auth-tab="reg">注册新账号</div></div>' +
          /* 登录面板 */
          '<form class="auth-panel active" id="loginForm">' +
            '<div class="form-item"><input class="form-control" name="phone" placeholder="请输入手机号" maxlength="11" data-rule="phone"></div>' +
            '<div class="form-item" style="position:relative"><input class="form-control" type="password" name="pwd" placeholder="请输入密码（6-20 位）" maxlength="20" data-rule="required">' +
              '<a href="javascript:;" class="code-send" data-fake-link>忘记密码？</a></div>' +
            '<div class="form-item" style="margin-bottom:12px"><label class="checkbox"><input type="checkbox" checked name="agree">我已阅读并同意《用户协议》与《隐私政策》</label></div>' +
            '<button type="submit" class="btn btn-primary btn-lg btn-block">登 录</button>' +
            '<div class="form-tip" style="text-align:center;margin-top:14px">演示账号：任意 11 位手机号 + 任意 6 位以上密码即可登录</div>' +
          '</form>' +
          /* 注册面板 */
          '<form class="auth-panel" id="regForm">' +
            '<div class="form-item"><input class="form-control" name="phone" placeholder="请输入手机号" maxlength="11" data-rule="phone"></div>' +
            '<div class="form-item input-affix"><input class="form-control" name="code" placeholder="请输入短信验证码" maxlength="6" data-rule="code">' +
              '<button type="button" class="code-send" data-send-code>获取验证码</button></div>' +
            '<div class="form-item"><input class="form-control" type="password" name="pwd" placeholder="设置登录密码（6-20 位）" maxlength="20" data-rule="required"></div>' +
            '<div class="form-item" style="margin-bottom:12px"><label class="checkbox"><input type="checkbox" checked name="agree">我已阅读并同意《用户协议》与《隐私政策》</label></div>' +
            '<button type="submit" class="btn btn-accent btn-lg btn-block">注册并登录</button>' +
          '</form>' +
        '</div>' +
      '</div></div>' +

      /* —— 预约看车弹窗 —— */
      '<div class="modal-mask" id="bookModal"><div class="modal">' +
        '<div class="modal-head"><div><div class="modal-title">预约到店看车</div>' +
          '<div class="modal-sub" id="bookCarName">填写信息后，专属顾问将在 30 分钟内与您联系</div></div>' +
          '<button class="modal-close" data-close>' + icon('close') + '</button></div>' +
        '<div class="modal-body"><form id="bookForm">' +
          '<input type="hidden" name="carId">' +
          '<div class="form-row">' +
            '<div class="form-item"><label class="form-label">您的称呼<span class="req">*</span></label><input class="form-control" name="name" placeholder="请输入姓名" data-rule="required"></div>' +
            '<div class="form-item"><label class="form-label">手机号码<span class="req">*</span></label><input class="form-control" name="phone" placeholder="用于接收看车通知" maxlength="11" data-rule="phone"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-item"><label class="form-label">到店日期<span class="req">*</span></label><input class="form-control" type="date" name="date" data-rule="required"></div>' +
            '<div class="form-item"><label class="form-label">到店时间</label><select class="form-control" name="time">' +
              '<option>09:00 - 11:00</option><option>11:00 - 13:00</option><option selected>13:00 - 15:00</option>' +
              '<option>15:00 - 17:00</option><option>17:00 - 19:00</option></select></div>' +
          '</div>' +
          '<div class="form-item"><label class="form-label">看车门店</label><select class="form-control" name="storeId">' +
            D.STORES.map(function (s) { return '<option value="' + s.id + '">' + s.name + '（' + s.city + '）</option>'; }).join('') +
          '</select></div>' +
          '<div class="form-item" style="margin-bottom:8px"><label class="form-label">备注</label><textarea class="form-control" name="remark" placeholder="如：希望预留车辆 / 需要安排试驾 / 咨询分期方案"></textarea></div>' +
          '<label class="checkbox" style="font-size:12.5px"><input type="checkbox" checked name="agree">我同意优车汇通过电话/短信与我联系</label>' +
        '</form></div>' +
        '<div class="modal-foot"><button class="btn btn-light" data-close>取消</button><button class="btn btn-primary" id="bookSubmit">提交预约</button></div>' +
      '</div></div>' +

      /* —— 成功提示弹窗 —— */
      '<div class="modal-mask" id="okModal"><div class="modal" style="max-width:400px">' +
        '<div class="modal-body" style="text-align:center;padding:36px 28px">' +
          '<div style="width:72px;height:72px;border-radius:50%;background:var(--success-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#12A15E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:38px;height:38px"><path d="M20 6 9 17l-5-5"/></svg></div>' +
          '<h3 id="okTitle" style="font-size:19px;margin-bottom:10px">提交成功</h3>' +
          '<p id="okDesc" style="color:var(--muted);font-size:14px;line-height:1.7">我们已收到您的信息</p>' +
          '<button class="btn btn-primary btn-block mt24" data-close>我知道了</button>' +
        '</div>' +
      '</div></div>' +

      /* —— 图片全屏预览 —— */
      '<div class="lightbox" id="lightbox">' +
        '<button class="lightbox-close" id="lbClose">' + icon('close') + '</button>' +
        '<button class="lightbox-nav lightbox-prev" id="lbPrev">' + icon('chevronLeft') + '</button>' +
        '<img id="lbImg" src="" alt="车辆实拍图">' +
        '<button class="lightbox-nav lightbox-next" id="lbNext">' + icon('chevronRight') + '</button>' +
        '<div class="lightbox-counter" id="lbCounter">1 / 1</div>' +
      '</div>' +

      '<div class="toast-wrap" id="toastWrap"></div>' +
      '<button class="back-top" id="backTop">' + icon('arrowUp') + '</button>';
    document.body.appendChild(wrap);
  }

  /* =========================================================================
   * 5. 图片懒加载（含加载失败兜底 + 骨架屏关闭）
   * ====================================================================== */
  var FALLBACK_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">' +
    '<rect width="800" height="520" fill="#EEF2F7"/>' +
    '<g fill="none" stroke="#C6D0DE" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(316,196) scale(7)">' +
    '<path d="M5 15h14l-.9-4.2A2 2 0 0 0 16.1 9H7.9a2 2 0 0 0-2 1.8L5 15Zm0 0v2.5c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5V17h10v.5c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5V15"/></g>' +
    '<text x="400" y="360" font-family="sans-serif" font-size="20" fill="#94A0B2" text-anchor="middle">车辆实拍图加载中…</text></svg>'
  );

  function bindLazyImages(root) {
    var imgs = qsa('img[data-src]', root || document);
    function load(img) {
      img.addEventListener('load', function () {
        img.classList.add('loaded');
        if (img.parentElement) img.parentElement.classList.add('ready');
      });
      img.addEventListener('error', function () {
        img.src = FALLBACK_IMG;
        img.classList.add('loaded');
        if (img.parentElement) img.parentElement.classList.add('ready');
      });
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    }
    if (!('IntersectionObserver' in window)) { imgs.forEach(load); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { load(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(function (i) { io.observe(i); });
  }

  /* =========================================================================
   * 6. 全站统一车辆卡片
   * ====================================================================== */
  function tagHtml(t) { return '<span class="tag ' + tagClass(t) + '">' + esc(t) + '</span>'; }

  function renderCarCard(car) {
    if (!car) return '';
    var faved = store.isFav(car.id);
    var badges = car.tags.slice(0, 2).map(tagHtml).join('');
    if (car.warranty && car.tags.indexOf('原厂质保') === -1) badges += tagHtml('原厂质保');
    var guideSave = car.guide > car.price ? (car.guide - car.price) : 0;
    return '' +
      '<article class="car-card" data-car="' + car.id + '">' +
        '<div class="car-thumb img-wrap">' +
          '<a href="detail.html?id=' + car.id + '" class="thumb-link" aria-label="' + esc(car.name) + '">' +
            '<img data-src="' + D.carImage(car) + '" alt="' + esc(car.name) + '实拍图" loading="lazy">' +
          '</a>' +
          '<div class="car-badge">' + badges + '</div>' +
          '<button class="car-fav' + (faved ? ' active' : '') + '" data-fav="' + car.id + '" title="收藏该车" aria-label="收藏">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            (faved ? SVG.heartFill.replace('fill="currentColor"', 'fill="#E94560"') : SVG.heart) + '</svg></button>' +
        '</div>' +
        '<div class="car-body">' +
          '<a href="detail.html?id=' + car.id + '"><h3 class="car-title">' + esc(car.name) + '</h3></a>' +
          '<div class="car-meta">' +
            '<span>' + car.year + ' 年上牌</span><span class="sep">|</span>' +
            '<span>' + money1(car.mileage) + ' 万公里</span><span class="sep">|</span>' +
            '<span>' + esc(car.city) + '</span>' +
          '</div>' +
          '<div class="car-tags">' +
            '<span class="tag tag-grey">' + esc(car.fuel) + '</span>' +
            '<span class="tag tag-line">' + esc(car.gear) + '</span>' +
            '<span class="tag tag-line">' + esc(car.color) + '</span>' +
          '</div>' +
          '<div class="car-foot">' +
            '<div class="car-price-wrap">' +
              '<div class="price-main"><span class="num">' + money(car.price) + '</span><span class="unit">万</span></div>' +
              (guideSave > 0
                ? '<div class="price-old">新车指导价 <s>' + money(car.guide) + ' 万</s> 省 ' + money(guideSave) + ' 万</div>'
                : '<div class="price-old">' + listedText(car.createdAt) + '</div>') +
              '<div class="price-sub">首付 <em>' + money(car.firstPay) + ' 万</em> · 月供 ' + Math.round(car.monthly * 10000) + ' 元</div>' +
            '</div>' +
            '<button class="btn btn-accent" data-book="' + car.id + '">立即预约</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* 渲染一组车辆卡片到容器 */
  function renderCars(container, cars) {
    if (!container) return;
    if (!cars || !cars.length) {
      container.innerHTML = emptyHtml('暂无符合条件的车源', '试试减少筛选条件，或浏览全部车源');
      return;
    }
    container.innerHTML = cars.map(renderCarCard).join('');
    bindLazyImages(container);
  }

  function emptyHtml(title, desc) {
    return '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">' + icon('car') + '</div>' +
      '<div class="empty-title">' + esc(title) + '</div><div>' + esc(desc || '') + '</div></div>';
  }

  /* =========================================================================
   * 7. 弹窗 / 提示 控件
   * ====================================================================== */
  function openModal(id) {
    var m = qs('#' + id);
    if (!m) return;
    m.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(el) {
    var m = typeof el === 'string' ? qs('#' + el) : el;
    if (!m) return;
    m.classList.remove('show');
    if (!qsa('.modal-mask.show').length && !qs('.lightbox.show')) document.body.style.overflow = '';
  }
  function toast(msg, type) {
    var wrap = qs('#toastWrap');
    if (!wrap) return;
    type = type || 'success';
    var ico = type === 'error' ? 'alert' : (type === 'info' ? 'info' : 'checkCircle');
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = icon(ico) + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 320);
    }, 2200);
  }
  function okDialog(title, desc) {
    qs('#okTitle').textContent = title || '提交成功';
    qs('#okDesc').innerHTML = desc || '我们已收到您的信息，专属顾问将尽快与您联系。';
    openModal('okModal');
  }

  /* —— 登录态校验：未登录先弹登录框，登录成功后执行回调 —— */
  var pendingAction = null;
  function requireLogin(cb) {
    var u = store.getUser();
    if (u) { if (cb) cb(u); return true; }
    pendingAction = cb || null;
    openModal('authModal');
    toast('请先登录后再进行操作', 'info');
    return false;
  }

  /* —— 图片全屏预览 —— */
  var lbImages = [], lbIndex = 0;
  function openLightbox(images, index) {
    lbImages = images || []; lbIndex = index || 0;
    var box = qs('#lightbox');
    if (!box || !lbImages.length) return;
    qs('#lbImg').src = lbImages[lbIndex];
    qs('#lbCounter').textContent = (lbIndex + 1) + ' / ' + lbImages.length;
    box.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function lbGo(step) {
    if (!lbImages.length) return;
    lbIndex = (lbIndex + step + lbImages.length) % lbImages.length;
    qs('#lbImg').src = lbImages[lbIndex];
    qs('#lbCounter').textContent = (lbIndex + 1) + ' / ' + lbImages.length;
  }

  /* —— 预约看车 —— */
  function openBook(carId) {
    var car = carId ? D.getCarById(carId) : null;
    var form = qs('#bookForm');
    form.reset();
    qsa('.form-item', form).forEach(function (f) { f.classList.remove('has-error'); });
    qs('[name="carId"]', form).value = car ? car.id : '';
    qs('#bookCarName').textContent = car
      ? car.name + '（' + money(car.price) + ' 万）· 填写信息后专属顾问 30 分钟内联系您'
      : '填写信息后，专属顾问将在 30 分钟内与您联系';
    if (car) qs('[name="storeId"]', form).value = car.storeId;
    qs('[name="date"]', form).min = todayStr();
    qs('[name="date"]', form).value = todayStr();
    var u = store.getUser();
    if (u) { qs('[name="name"]', form).value = u.name || ''; qs('[name="phone"]', form).value = u.phone || ''; }
    openModal('bookModal');
  }

  /* =========================================================================
   * 8. 表单校验（通用）
   * ====================================================================== */
  function validateField(input) {
    var rule = input.getAttribute('data-rule');
    if (!rule) return true;
    var v = String(input.value || '').trim();
    var ok = true, msg = '';
    if (rule === 'required') { ok = v.length > 0; msg = '该项为必填'; }
    else if (rule === 'phone') { ok = isPhone(v); msg = '请输入正确的 11 位手机号'; }
    else if (rule === 'code') { ok = isCode(v); msg = '请输入 4-6 位验证码'; }
    else if (rule === 'checked') { ok = input.checked; msg = '请先勾选并同意相关协议'; }
    else if (rule.indexOf('min:') === 0) { ok = v.length >= +rule.split(':')[1]; msg = '内容长度不足'; }
    var item = input.closest('.form-item');
    if (item) {
      item.classList.toggle('has-error', !ok);
      if (!ok) {
        var err = qs('.form-error', item);
        if (!err) { err = document.createElement('div'); err.className = 'form-error'; item.appendChild(err); }
        err.textContent = msg;
      }
    }
    return ok;
  }
  function validateForm(form) {
    var fields = qsa('[data-rule]', form);
    var ok = true;
    fields.forEach(function (f) { if (!validateField(f)) ok = false; });
    if (!ok) {
      var first = qs('.has-error input, .has-error select, .has-error textarea', form);
      if (first) first.focus();
      toast('请检查表单中标红的内容', 'error');
    }
    return ok;
  }
  /* 聚焦即清除错误态、失焦即校验 */
  document.addEventListener('focusout', function (e) {
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-rule')) validateField(e.target);
  }, true);
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.form-item.has-error')) {
      var item = t.closest('.form-item');
      if (item) { item.classList.remove('has-error'); }
    }
  });

  /* =========================================================================
   * 9. 搜索联想
   * ====================================================================== */
  function searchCars(keyword) {
    var kw = String(keyword || '').trim().toLowerCase();
    if (!kw) return [];
    var parts = kw.split(/\s+/);
    return D.CARS.filter(function (c) {
      var hay = (c.brand + c.series + c.model + c.fuel + c.city + c.year + '年').toLowerCase().replace(/\s/g, '');
      return parts.every(function (p) { return hay.indexOf(p) > -1; });
    });
  }
  function bindSearch(inputSel, listSel, onEnter) {
    var input = qs(inputSel), list = qs(listSel);
    if (!input || !list) return;
    var activeIdx = -1, results = [];

    function close() { list.classList.remove('show'); activeIdx = -1; }
    function render(kw) {
      results = searchCars(kw).slice(0, 8);
      if (!kw.trim()) { close(); return; }
      if (!results.length) {
        list.innerHTML = '<div class="suggest-label">没有找到「' + esc(kw) + '」相关车源</div>' +
          '<div class="suggest-item" data-goto="list.html?kw=' + encodeURIComponent(kw) + '"><span class="s-name">查看全部车源</span></div>';
      } else {
        list.innerHTML = '<div class="suggest-label">为你找到 ' + searchCars(kw).length + ' 台相关车源</div>' +
          results.map(function (c, i) {
            var hl = esc(c.name).replace(new RegExp('(' + esc(kw.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<em>$1</em>');
            return '<div class="suggest-item' + (i === activeIdx ? ' active' : '') + '" data-id="' + c.id + '">' +
              '<span class="s-name">' + hl + ' <span class="s-tag">' + c.year + '款 · ' + money1(c.mileage) + '万公里</span></span>' +
              '<span class="s-price">' + money(c.price) + ' 万</span></div>';
          }).join('') +
          '<div class="suggest-item" data-goto="list.html?kw=' + encodeURIComponent(kw) + '"><span class="s-name" style="color:var(--primary);font-weight:600">查看全部「' + esc(kw) + '」车源 →</span></div>';
      }
      list.classList.add('show');
    }
    input.addEventListener('input', function () { activeIdx = -1; render(input.value); });
    input.addEventListener('focus', function () { if (input.value.trim()) render(input.value); });
    input.addEventListener('keydown', function (e) {
      var items = qsa('.suggest-item[data-id]', list);
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); render(input.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, -1); render(input.value); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx > -1 && results[activeIdx]) location.href = 'detail.html?id=' + results[activeIdx].id;
        else if (onEnter) onEnter(input.value.trim());
        else location.href = 'list.html?kw=' + encodeURIComponent(input.value.trim());
      } else if (e.key === 'Escape') { close(); }
    });
    list.addEventListener('mousedown', function (e) {
      var item = e.target.closest('.suggest-item');
      if (!item) return;
      e.preventDefault();
      if (item.getAttribute('data-id')) location.href = 'detail.html?id=' + item.getAttribute('data-id');
      else if (item.getAttribute('data-goto')) location.href = item.getAttribute('data-goto');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-search') && !e.target.closest('.drawer-search')) close();
    });
  }

  /* =========================================================================
   * 10. 全局事件绑定
   * ====================================================================== */
  function bindGlobal() {
    /* —— 顶部导航滚动置顶阴影 + 返回顶部 —— */
    var header = qs('#siteHeader'), backTop = qs('#backTop');
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle('is-stuck', y > 10);
      if (backTop) backTop.classList.toggle('show', y > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* —— 抽屉 / 搜索 / 城市 等头部交互：见 bindHeaderEvents() 与 bindDrawer() —— */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#cityPicker')) { var cp = qs('#cityPop'); if (cp) cp.classList.remove('show'); }
    });

    /* —— 弹窗关闭（遮罩 / 关闭按钮 / ESC） —— */
    document.addEventListener('click', function (e) {
      var closeBtn = e.target.closest('[data-close]');
      if (closeBtn) { closeModal(closeBtn.closest('.modal-mask')); return; }
      if (e.target.classList && e.target.classList.contains('modal-mask')) { closeModal(e.target); return; }
      var loginBtn = e.target.closest('[data-login]');
      if (loginBtn) { openModal('authModal'); return; }
      var fl = e.target.closest('[data-fake-link]');
      if (fl) { e.preventDefault(); toast('演示环境暂不支持该功能', 'info'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        qsa('.modal-mask.show').forEach(function (m) { closeModal(m); });
        var lb = qs('#lightbox'); if (lb && lb.classList.contains('show')) { lb.classList.remove('show'); document.body.style.overflow = ''; }
        if (qs('#drawer') && qs('#drawer').classList.contains('show')) { closeDrawer(); }
      }
      var lb2 = qs('#lightbox');
      if (lb2 && lb2.classList.contains('show')) {
        if (e.key === 'ArrowLeft') lbGo(-1);
        if (e.key === 'ArrowRight') lbGo(1);
      }
    });

    /* —— 登录 / 注册 Tab —— */
    qsa('[data-auth-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-auth-tab');
        qsa('[data-auth-tab]').forEach(function (t) { t.classList.toggle('active', t === tab); });
        qsa('.auth-panel').forEach(function (p) { p.classList.toggle('active', p.id === (key === 'login' ? 'loginForm' : 'regForm')); });
      });
    });

    /* —— 短信验证码倒计时 —— */
    var sendBtn = qs('[data-send-code]');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        var phone = qs('#regForm [name="phone"]').value;
        if (!isPhone(phone)) { toast('请先输入正确的手机号', 'error'); return; }
        var n = 60;
        sendBtn.classList.add('disabled');
        sendBtn.textContent = n + 's 后重发';
        var t = setInterval(function () {
          n--;
          if (n <= 0) { clearInterval(t); sendBtn.classList.remove('disabled'); sendBtn.textContent = '获取验证码'; }
          else sendBtn.textContent = n + 's 后重发';
        }, 1000);
        toast('验证码已发送（演示：任意 4-6 位数字即可）', 'info');
      });
    }

    /* —— 登录提交 —— */
    var loginForm = qs('#loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(loginForm)) return;
        var phone = qs('[name="phone"]', loginForm).value;
        doLogin({ name: '用户' + phone.slice(-4), phone: phone });
        toast('登录成功，欢迎回来！');
      });
    }
    /* —— 注册提交 —— */
    var regForm = qs('#regForm');
    if (regForm) {
      regForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(regForm)) return;
        var phone = qs('[name="phone"]', regForm).value;
        doLogin({ name: '优车汇用户' + phone.slice(-4), phone: phone, isNew: true });
        toast('注册成功，已自动登录');
      });
    }

    /* —— 预约看车提交 —— */
    var bookSubmit = qs('#bookSubmit');
    if (bookSubmit) {
      bookSubmit.addEventListener('click', function () {
        var form = qs('#bookForm');
        if (!validateForm(form)) return;
        var carId = qs('[name="carId"]', form).value;
        var car = carId ? D.getCarById(carId) : null;
        store.addAppt({
          id: 'AP' + Date.now(),
          carId: carId,
          carName: car ? car.name : '',
          carPrice: car ? car.price : 0,
          carImage: car ? D.carImage(car) : '',
          name: qs('[name="name"]', form).value,
          phone: qs('[name="phone"]', form).value,
          date: qs('[name="date"]', form).value,
          time: qs('[name="time"]', form).value,
          storeId: qs('[name="storeId"]', form).value,
          remark: qs('[name="remark"]', form).value,
          createdAt: Date.now(),
          status: '待确认'
        });
        closeModal('bookModal');
        okDialog('预约提交成功', '顾问将在 30 分钟内致电 <b>' + esc(qs('[name="phone"]', form).value) + '</b> 与您确认看车时间，请保持电话畅通。');
      });
    }

    /* —— 图片全屏预览 —— */
    var lbClose = qs('#lbClose'); if (lbClose) lbClose.addEventListener('click', function () { qs('#lightbox').classList.remove('show'); document.body.style.overflow = ''; });
    var lbPrev = qs('#lbPrev'); if (lbPrev) lbPrev.addEventListener('click', function () { lbGo(-1); });
    var lbNext = qs('#lbNext'); if (lbNext) lbNext.addEventListener('click', function () { lbGo(1); });
    var lb = qs('#lightbox');
    if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) { lb.classList.remove('show'); document.body.style.overflow = ''; } });

    /* —— 事件委托：收藏 / 预约（全站通用，动态渲染也生效） —— */
    document.addEventListener('click', function (e) {
      var favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        e.preventDefault();
        var id = favBtn.getAttribute('data-fav');
        var nowFav = store.toggleFav(id);
        favBtn.classList.toggle('active', nowFav);
        var svg = favBtn.querySelector('svg');
        if (svg) svg.innerHTML = nowFav ? SVG.heartFill.replace('fill="currentColor"', 'fill="#E94560"') : SVG.heart;
        var fc = qs('#favCount'); if (fc) fc.textContent = store.getFavs().length;
        toast(nowFav ? '已加入收藏，可在个人中心查看' : '已取消收藏', nowFav ? 'success' : 'info');
        document.dispatchEvent(new CustomEvent('fav:change', { detail: { id: id, fav: nowFav } }));
        return;
      }
      var bookBtn = e.target.closest('[data-book]');
      if (bookBtn) {
        e.preventDefault();
        openBook(bookBtn.getAttribute('data-book'));
        return;
      }
      /* 电话咨询 / 在线留资 / 统一拦截演示链接 */
      var act = e.target.closest('[data-action]');
      if (act) {
        e.preventDefault();
        var a = act.getAttribute('data-action');
        if (a === 'call') okDialog('电话咨询', '正在为你接通客服热线 <b>400-800-1668</b><br>服务时间 09:00 - 21:00，请保持电话畅通。');
        if (a === 'book') openBook(act.getAttribute('data-car') || '');
        if (a === 'lead') okDialog('留资成功', '我们已记录你的联系方式，专属顾问将在 30 分钟内与你联系。');
        if (a === 'calc') { var cm = qs('#calcModal'); if (cm) openModal('calcModal'); }
      }
    });
  }

  /* —— 执行登录：写入本地存储 + 刷新头部 + 执行挂起动作 —— */
  function doLogin(user) {
    store.setUser(user);
    closeModal('authModal');
    renderHeader();                   // 重渲染头部（内部会重新绑定头部交互）
    document.dispatchEvent(new CustomEvent('user:login', { detail: user }));
    if (typeof pendingAction === 'function') { var cb = pendingAction; pendingAction = null; cb(user); }
  }

  /* —— 头部内部交互绑定（头部 DOM 每次重渲染后都会重新调用，旧节点已销毁不会重复绑定） —— */
  function bindHeaderEvents() {
    bindSearch('#navSearchInput', '#suggestList');
    var cityPicker = qs('#cityPicker');
    if (cityPicker) {
      cityPicker.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-city]');
        if (btn) {
          var c = btn.getAttribute('data-city');
          store.setCity(c);
          qs('#cityLabel').textContent = c;
          qsa('#cityPop [data-city]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-city') === c); });
          qs('#cityPop').classList.remove('show');
          toast('已切换到「' + c + '」', 'info');
          return;
        }
        qs('#cityPop').classList.toggle('show');
      });
    }
    var mt = qs('#mobileToggle');
    if (mt) mt.addEventListener('click', openDrawer);
  }

  /* —— 移动端抽屉开关 —— */
  function openDrawer() {
    var d = qs('#drawer'), m = qs('#drawerMask');
    if (!d) return;
    d.classList.add('show'); m.classList.add('show'); document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    var d = qs('#drawer'), m = qs('#drawerMask');
    if (!d) return;
    d.classList.remove('show'); m.classList.remove('show'); document.body.style.overflow = '';
  }
  /* —— 抽屉仅初始化一次 —— */
  function bindDrawer() {
    if (!qs('#drawer')) return;
    var dc = qs('#drawerClose'); if (dc) dc.addEventListener('click', closeDrawer);
    var m = qs('#drawerMask'); if (m) m.addEventListener('click', closeDrawer);
    bindSearch('#drawerSearchInput', '#suggestList');
  }

  /* =========================================================================
   * 11. 对外 API 与初始化
   * ====================================================================== */
  var App = {
    D: D,
    icon: icon,
    SVG: SVG,
    qs: qs, qsa: qsa, esc: esc,
    store: store,
    money: money, money1: money1, intWan: intWan,
    dateStr: dateStr, todayStr: todayStr, timeAgo: timeAgo, listedText: listedText,
    tagClass: tagClass, tagHtml: tagHtml,
    isPhone: isPhone, isCode: isCode,
    validateForm: validateForm, validateField: validateField,
    renderCarCard: renderCarCard, renderCars: renderCars, emptyHtml: emptyHtml,
    bindLazyImages: bindLazyImages,
    openModal: openModal, closeModal: closeModal, toast: toast, okDialog: okDialog,
    requireLogin: requireLogin, openBook: openBook,
    openLightbox: openLightbox, searchCars: searchCars,
    doLogin: doLogin,
    /* 供其他页面重渲染头部（登录状态变化后） */
    refreshHeader: function () { renderHeader(); }
  };
  global.App = App;

  /* 页面初始化：渲染骨架 + 绑定全局事件（main.js 必须早于页面脚本引入） */
  function init() {
    renderHeader();            // 渲染头部（内部会自动绑定头部交互事件）
    renderFooter();            // 渲染页脚
    renderGlobalModals();      // 渲染全局弹窗（登录/预约/成功/图片预览/提示）
    bindDrawer();              // 移动端抽屉（仅一次）
    bindGlobal();              // 全局事件（滚动、弹窗关闭、收藏、预约等）
    bindLazyImages(document);  // 首屏静态图片懒加载
    /* 动态插入图片的加载失败兜底 */
    document.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && !t.getAttribute('data-fallback')) {
        t.setAttribute('data-fallback', '1');
        t.src = FALLBACK_IMG;
      }
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
