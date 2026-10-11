/* =============================================================================
 * user.js —— 个人中心脚本
 * -----------------------------------------------------------------------------
 * 模块：
 *   1) 登录态判断（未登录弹出登录弹窗，登录后展示个人中心）
 *   2) 个人概览统计
 *   3) 我的收藏 / 看车预约记录 / 浏览历史 / 我发布的卖车信息
 *   4) 修改个人资料
 *   5) 退出登录
 * 说明：所有数据均保存在浏览器本地存储（localStorage），模拟后端数据。
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.AppData, App = window.App;

  /* =========================================================================
   * 1. 登录态判断
   * ====================================================================== */
  function checkLogin() {
    var user = App.store.getUser();
    var guest = App.qs('#guestPanel'), layout = App.qs('#userLayout');
    if (!user) {
      guest.style.display = 'block';
      layout.style.display = 'none';
      App.openModal('authModal');                 // 未登录自动弹出登录弹窗
      return false;
    }
    guest.style.display = 'none';
    layout.style.display = 'grid';
    return true;
  }

  /* =========================================================================
   * 2. 侧栏资料 + 统计
   * ====================================================================== */
  function renderProfileBar(user) {
    App.qs('#userAva').textContent = (user.name || 'U').charAt(0);
    App.qs('#userName').textContent = user.name || '优车汇用户';
    App.qs('#userPhone').textContent = (user.phone || '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
  }

  function renderCounts() {
    var favs = App.store.getFavs().length;
    var appts = App.store.getAppts().length;
    var his = App.store.getHistory().length;
    var sales = App.store.getSales().length;
    App.qs('#ovFav').textContent = favs;
    App.qs('#ovAppt').textContent = appts;
    App.qs('#ovHis').textContent = his;
    App.qs('#ovSale').textContent = sales;
    App.qs('#menuFavCount').textContent = favs;
    App.qs('#menuApptCount').textContent = appts;
    App.qs('#menuHisCount').textContent = his;
    App.qs('#menuSaleCount').textContent = sales;
  }

  /* =========================================================================
   * 3. 我的收藏
   * ====================================================================== */
  function renderFavs() {
    var ids = App.store.getFavs();
    var cars = ids.map(function (id) { return D.getCarById(id); }).filter(Boolean);
    App.renderCars(App.qs('#favList'), cars);
    /* 空状态文案定制 */
    if (!cars.length) {
      App.qs('#favList').innerHTML = App.emptyHtml('还没有收藏车辆', '在车源列表点击 ♡ 即可收藏心仪车辆，随时回到这里查看');
    }
  }

  /* 记录行：车辆缩略图 + 标题 + 元信息 + 价格 + 操作 */
  function recordItem(car, actions, footLeft, status) {
    return '<article class="record-item">' +
      '<a class="record-thumb img-wrap" href="detail.html?id=' + car.id + '">' +
        '<img data-src="' + D.carImage(car) + '" alt="' + App.esc(car.name) + '" loading="lazy"></a>' +
      '<div class="record-main">' +
        '<a href="detail.html?id=' + car.id + '"><h4>' + App.esc(car.name) + '</h4></a>' +
        '<div class="record-meta">' +
          '<span>' + car.year + ' 年上牌</span><span>' + App.money1(car.mileage) + ' 万公里</span>' +
          '<span>' + App.esc(car.city) + '</span><span>' + App.esc(car.fuel) + '</span>' +
          (status ? '<span class="record-status ' + status.cls + '">' + App.esc(status.text) + '</span>' : '') +
        '</div>' +
        '<div class="record-foot">' +
          '<div class="record-price">' + App.money(car.price) + '<em> 万</em>' +
            (footLeft ? '<span style="font-size:12px;color:var(--muted);font-weight:400;margin-left:10px">' + footLeft + '</span>' : '') +
          '</div>' +
          '<div class="record-actions">' + actions + '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* =========================================================================
   * 4. 看车预约记录
   * ====================================================================== */
  function renderAppts() {
    var list = App.store.getAppts();
    var box = App.qs('#apptList');
    if (!list.length) {
      box.innerHTML = App.emptyHtml('暂无看车预约记录', '在车辆详情页点击「预约到店看车」即可预约，到店看车更放心');
      return;
    }
    box.innerHTML = list.map(function (a) {
      var car = D.getCarById(a.carId) || { id: '', name: a.carName || '车辆信息', year: '', mileage: '', city: '', fuel: '', price: a.carPrice || 0, brand: '', series: '', color: '', model: '' };
      if (!car.name) car.name = a.carName || '车辆信息';
      var st = a.status === '已确认' ? { cls: 'st-ok', text: '已确认' } : (a.status === '已完成' ? { cls: 'st-done', text: '已完成' } : { cls: 'st-wait', text: '待确认' });
      var store = D.getStore(a.storeId);
      return '<article class="record-item">' +
        '<div class="record-thumb img-wrap">' + (a.carImage ? '<img src="' + a.carImage + '" alt="车辆">' : '') + '</div>' +
        '<div class="record-main">' +
          '<a href="detail.html?id=' + a.carId + '"><h4>' + App.esc(car.name) + '</h4></a>' +
          '<div class="record-meta">' +
            '<span>预约时间：' + App.esc(a.date) + ' ' + App.esc(a.time) + '</span>' +
            '<span>看车门店：' + App.esc(store.name) + '</span>' +
            '<span class="record-status ' + st.cls + '">' + st.text + '</span>' +
          '</div>' +
          '<div class="record-meta">' +
            '<span>联系人：' + App.esc(a.name) + '</span><span>电话：' + App.esc(a.phone) + '</span>' +
            (a.remark ? '<span>备注：' + App.esc(a.remark) + '</span>' : '') +
          '</div>' +
          '<div class="record-foot">' +
            '<div style="font-size:12.5px;color:var(--muted)">提交时间：' + App.dateStr(a.createdAt) + '</div>' +
            '<div class="record-actions">' +
              '<a class="btn btn-outline btn-sm" href="detail.html?id=' + a.carId + '">查看车辆</a>' +
              '<button class="btn btn-light btn-sm" data-cancel-appt="' + a.id + '">取消预约</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    App.bindLazyImages(box);
  }

  /* =========================================================================
   * 5. 浏览历史
   * ====================================================================== */
  function renderHistory(target) {
    var list = App.store.getHistory();
    var box = App.qs(target || '#hisList');
    var items = list.map(function (h) { return { car: D.getCarById(h.carId), time: h.time }; }).filter(function (x) { return x.car; });
    if (!items.length) {
      box.innerHTML = App.emptyHtml('暂无浏览记录', '浏览过的车辆会自动记录在这里，方便随时回看对比');
      return;
    }
    box.innerHTML = items.map(function (x) {
      return recordItem(x.car,
        '<a class="btn btn-outline btn-sm" href="detail.html?id=' + x.car.id + '">再次查看</a>' +
        '<button class="btn btn-light btn-sm" data-fav="' + x.car.id + '">' + (App.store.isFav(x.car.id) ? '取消收藏' : '收藏') + '</button>',
        '浏览于 ' + App.timeAgo(x.time));
    }).join('');
    App.bindLazyImages(box);
  }

  /* 概览页：最近浏览前 3 条 */
  function renderRecent() {
    var box = App.qs('#ovRecent');
    var list = App.store.getHistory().slice(0, 3);
    var items = list.map(function (h) { return { car: D.getCarById(h.carId), time: h.time }; }).filter(function (x) { return x.car; });
    if (!items.length) {
      box.innerHTML = '<p style="color:var(--muted);font-size:13.5px;padding:10px 0">暂无浏览记录，先去 <a href="list.html" style="color:var(--primary)">车源列表</a> 逛逛吧。</p>';
      return;
    }
    box.innerHTML = items.map(function (x) {
      return recordItem(x.car, '<a class="btn btn-outline btn-sm" href="detail.html?id=' + x.car.id + '">查看详情</a>', '浏览于 ' + App.timeAgo(x.time));
    }).join('');
    App.bindLazyImages(box);
  }

  /* =========================================================================
   * 6. 我发布的卖车信息
   * ====================================================================== */
  function renderSales() {
    var list = App.store.getSales();
    var box = App.qs('#saleList');
    if (!list.length) {
      box.innerHTML = App.emptyHtml('还没有发布卖车信息', '填写车辆信息即可获得免费上门估价，成交价平均高于市场价 8%') +
        '<div class="text-center"><a class="btn btn-accent" href="sellcar.html">去发布卖车信息</a></div>';
      return;
    }
    box.innerHTML = list.map(function (s) {
      var st = s.status === '已成交' ? { cls: 'st-ok', text: '已成交' } : (s.status === '已评估' ? { cls: 'st-ok', text: '已评估' } : { cls: 'st-wait', text: '待评估' });
      return '<article class="record-item">' +
        (s.cover ? '<div class="record-thumb img-wrap"><img src="' + s.cover + '" alt="卖车图片"></div>'
                 : '<div class="record-thumb flex-center" style="background:var(--bg-soft2);color:var(--muted-2);font-size:12px">暂无图片</div>') +
        '<div class="record-main">' +
          '<h4>' + App.esc(s.brand + ' ' + s.series + (s.model ? ' ' + s.model : '')) + '</h4>' +
          '<div class="record-meta">' +
            '<span>' + s.year + ' 年 ' + (s.month ? s.month + ' 月' : '') + '上牌</span>' +
            '<span>' + App.money1(s.mileage) + ' 万公里</span>' +
            '<span>' + App.esc(s.city) + '</span><span>' + App.esc(s.fuel) + '</span>' +
            '<span>过户 ' + s.transfer + ' 次</span>' +
            '<span class="record-status ' + st.cls + '">' + st.text + '</span>' +
          '</div>' +
          '<div class="record-meta">' +
            '<span>联系人：' + App.esc(s.name) + '（' + App.esc(s.phone) + '）</span>' +
            '<span>实拍图：' + s.imageCount + ' 张</span>' +
            (s.configs && s.configs.length ? '<span>配置：' + App.esc(s.configs.slice(0, 3).join('、')) + (s.configs.length > 3 ? ' 等' : '') + '</span>' : '') +
          '</div>' +
          '<div class="record-foot">' +
            '<div class="record-price">' + App.money(s.price) + '<em> 万（期望售价）</em></div>' +
            '<div class="record-actions">' +
              '<button class="btn btn-light btn-sm" data-del-sale="' + s.id + '">删除信息</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    App.bindLazyImages(box);
  }

  /* =========================================================================
   * 7. 修改个人资料
   * ====================================================================== */
  var profileBound = false;
  function initProfileForm(user) {
    var form = App.qs('#profileForm');
    App.qs('#profileCity').innerHTML = '<option value="">请选择城市</option>' +
      D.CITY_LIST.map(function (c) { return '<option>' + c + '</option>'; }).join('');
    App.qs('#profileBrand').innerHTML = '<option value="">请选择意向品牌</option>' +
      D.BRANDS.map(function (b) { return '<option>' + b.name + '</option>'; }).join('');

    form.name.value = user.name || '';
    form.phone.value = user.phone || '';
    form.realName.value = user.realName || '';
    form.city.value = user.city || '';
    form.intentBrand.value = user.intentBrand || '';
    form.email.value = user.email || '';
    form.remark.value = user.remark || '';

    if (profileBound) return;      // 避免重复绑定提交事件
    profileBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!App.validateForm(form)) return;
      var u = App.store.getUser();
      u.name = form.name.value;
      u.realName = form.realName.value;
      u.city = form.city.value;
      u.intentBrand = form.intentBrand.value;
      u.email = form.email.value;
      u.remark = form.remark.value;
      App.store.setUser(u);
      App.refreshHeader();
      renderProfileBar(u);
      App.toast('个人资料已保存');
    });
  }

  /* =========================================================================
   * 8. 面板路由（#fav / #appt / #history / #sale / #profile / #overview）
   * ====================================================================== */
  function switchPanel(key) {
    var menu = App.qs('#userMenu');
    App.qsa('a[data-panel]', menu).forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-panel') === key);
    });
    App.qsa('.user-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + key);
    });
    if (key === 'fav') renderFavs();
    if (key === 'appt') renderAppts();
    if (key === 'history') renderHistory();
    if (key === 'sale') renderSales();
    if (key === 'overview') renderRecent();
  }

  /* =========================================================================
   * 9. 事件绑定
   * ====================================================================== */
  function bindEvents() {
    /* 侧栏菜单 */
    App.qs('#userMenu').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-panel]');
      if (!a) return;
      e.preventDefault();
      location.hash = a.getAttribute('data-panel');
    });
    /* 概览页「全部记录」 */
    App.qs('#panel-overview').addEventListener('click', function (e) {
      var j = e.target.closest('[data-jump]');
      if (j) { e.preventDefault(); location.hash = j.getAttribute('data-jump'); }
    });
    /* hash 变化切换面板 */
    window.addEventListener('hashchange', function () {
      if (App.store.getUser()) switchPanel((location.hash || '#overview').slice(1));
    });

    /* 取消预约 / 删除卖车信息 / 清空浏览记录 */
    document.addEventListener('click', function (e) {
      var cancel = e.target.closest('[data-cancel-appt]');
      if (cancel) {
        App.store.removeAppt(cancel.getAttribute('data-cancel-appt'));
        renderAppts(); renderCounts();
        App.toast('预约已取消', 'info');
        return;
      }
      var del = e.target.closest('[data-del-sale]');
      if (del) {
        App.store.removeSale(del.getAttribute('data-del-sale'));
        renderSales(); renderCounts();
        App.toast('卖车信息已删除', 'info');
        return;
      }
    });
    App.qs('#clearHis').addEventListener('click', function () {
      App.store.clearHistory();
      renderHistory(); renderCounts(); renderRecent();
      App.toast('浏览记录已清空', 'info');
    });
    /* 退出登录 */
    App.qs('#logoutBtn').addEventListener('click', function () {
      App.store.logout();
      App.refreshHeader();
      checkLogin();
      App.toast('已退出登录', 'info');
    });
    /* 收藏状态变化时刷新相关列表 */
    document.addEventListener('fav:change', function () {
      renderCounts();
      if (App.qs('#panel-fav').classList.contains('active')) renderFavs();
      if (App.qs('#panel-history').classList.contains('active')) renderHistory();
    });
    /* 登录成功后刷新个人中心 */
    document.addEventListener('user:login', function () {
      if (checkLogin()) renderAll();
    });
  }

  /* 全量渲染 */
  function renderAll() {
    var user = App.store.getUser();
    if (!user) return;
    renderProfileBar(user);
    renderCounts();
    initProfileForm(user);
    switchPanel((location.hash || '#overview').slice(1));
  }

  /* =========================================================================
   * 初始化
   * ====================================================================== */
  function init() {
    bindEvents();
    if (checkLogin()) renderAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
