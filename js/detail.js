/* =============================================================================
 * detail.js —— 车辆详情页脚本
 * -----------------------------------------------------------------------------
 * 模块：
 *   1) 大图轮播（左右切换 / 缩略图 / 点击全屏看图）
 *   2) 核心报价（全款价、分期首付、月供明细）
 *   3) 车辆档案参数表
 *   4) Tabs（检测报告 / 质保服务 / 车况描述 / 看车门店）
 *   5) 第三方检测报告（可折叠分组）
 *   6) 金融分期计算器（首付比例 + 贷款年限，实时运算）
 *   7) 同款推荐 / 同价位代步车推荐
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.AppData, App = window.App;
  var car = null, images = [];

  /* =========================================================================
   * 0. 获取车辆（URL 参数 id，缺失时兜底展示第一台车）
   * ====================================================================== */
  function pickCar() {
    var id = new URLSearchParams(location.search).get('id');
    var c = id ? D.getCarById(id) : null;
    if (!c) c = D.CARS[0];
    return c;
  }

  /* =========================================================================
   * 1. 基础信息 / 报价面板
   * ====================================================================== */
  function renderBase() {
    document.title = car.name + ' ' + App.money(car.price) + '万 - 优车汇二手车';
    App.qs('#crumbBrand').textContent = car.brand + '二手车';
    App.qs('#crumbBrand').href = 'list.html?brand=' + encodeURIComponent(car.brand);
    App.qs('#crumbName').textContent = car.name;

    App.qs('#carName').textContent = car.name;
    App.qs('#carSubMeta').innerHTML =
      '<span>' + car.year + ' 年 ' + car.regDate.split('-')[1] + ' 月上牌</span>' +
      '<span>' + App.money1(car.mileage) + ' 万公里</span>' +
      '<span>' + App.esc(car.city) + ' 上牌</span>' +
      '<span>' + App.esc(car.fuel) + '</span>' +
      '<span>过户 ' + car.transfer + ' 次</span>';

    App.qs('#carPrice').textContent = App.money(car.price);
    var save = car.guide - car.price;
    App.qs('#carGuide').innerHTML =
      '新车指导价 <s>' + App.money(car.guide) + ' 万</s>' +
      (save > 0 ? '<span class="pp-save">比新车省 ' + App.money(save) + ' 万</span>' : '') +
      '<span class="tag tag-green">车况评分 ' + car.score + ' 分</span>';

    App.qs('#carTags').innerHTML = car.tags.map(App.tagHtml).join('') +
      (car.warranty ? App.tagHtml('原厂质保') : '') +
      '<span class="tag tag-grey">' + App.listedText(car.createdAt) + '</span>';

    /* 分期默认方案（首付 3 成 / 36 期） */
    App.qs('#finFirst').innerHTML = App.money(car.firstPay) + '<em>万</em>';
    App.qs('#finMonth').innerHTML = Math.round(car.monthly * 10000) + '<em>元</em>';

    /* 预约 / 收藏按钮携带车辆 ID */
    App.qs('#bookBtn').setAttribute('data-book', car.id);
    App.qs('#floatBook').setAttribute('data-book', car.id);
    App.qs('#favBtn').setAttribute('data-fav', car.id);
    App.qs('#floatFav').setAttribute('data-fav', car.id);
    syncFavUI();

    /* 浏览历史入栈 */
    App.store.addHistory(car.id);
  }

  /* 收藏状态同步（含文案） */
  function syncFavUI() {
    var fav = App.store.isFav(car.id);
    var btn = App.qs('#favBtn');
    btn.textContent = fav ? '已收藏该车' : '收藏该车';
    App.qs('#floatFav').classList.toggle('active', fav);
  }

  /* =========================================================================
   * 2. 大图轮播 + 全屏看图
   * ====================================================================== */
  function renderGallery() {
    images = D.carImages(car);
    var idx = 0;
    var mainImg = App.qs('#galleryImg'), counter = App.qs('#galleryCounter');

    /* 缩略图 */
    App.qs('#galleryThumbs').innerHTML = images.map(function (src, i) {
      return '<div class="gallery-thumb' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
        '<img src="' + src + '" alt="车辆图 ' + (i + 1) + '"></div>';
    }).join('');

    function show(i) {
      idx = (i + images.length) % images.length;
      mainImg.style.opacity = 0;
      var next = new Image();
      next.onload = function () { mainImg.src = images[idx]; mainImg.style.opacity = 1; };
      next.onerror = function () { mainImg.src = images[idx]; mainImg.style.opacity = 1; };
      next.src = images[idx];
      counter.textContent = (idx + 1) + ' / ' + images.length;
      App.qsa('.gallery-thumb').forEach(function (t, ti) { t.classList.toggle('active', ti === idx); });
    }
    show(0);

    App.qs('#galleryPrev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    App.qs('#galleryNext').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    App.qs('#galleryThumbs').addEventListener('click', function (e) {
      var t = e.target.closest('[data-idx]');
      if (t) show(+t.getAttribute('data-idx'));
    });
    /* 点击主图 → 全屏看图 */
    App.qs('#galleryMain').addEventListener('click', function () { App.openLightbox(images, idx); });
    /* 键盘左右切换（全屏看图时由 lightbox 自身处理，避免冲突） */
    document.addEventListener('keydown', function (e) {
      var lb = App.qs('#lightbox');
      if (lb && lb.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* =========================================================================
   * 3. 车辆档案参数
   * ====================================================================== */
  function renderParams() {
    var gi = App.money(car.guide);
    var rows = [
      ['上牌日期', car.regDate, false],
      ['表显里程', App.money1(car.mileage) + ' 万公里', false],
      ['排量', car.disp, false],
      ['驱动方式', car.drive, false],
      ['变速箱', car.gear + '挡', false],
      ['车身颜色', car.color, false],
      ['过户次数', car.transfer + ' 次', car.transfer > 0],
      ['年检有效期', car.inspectValid, false],
      ['保险剩余', car.insuranceLeft, false],
      ['燃料类型', car.fuel, false],
      ['车身形式', car.body, false],
      ['座位数', car.seats + ' 座', false],
      ['车辆级别', car.body, false],
      ['上牌地', car.city, false],
      ['车架号', car.vin.replace(/^(\w{3})\w+(\w{4})$/, '$1********$2'), false],
      ['新车指导价', gi + ' 万', false],
      ['是否含质保', car.warranty ? '含一年质保' : '不含质保', !car.warranty],
      ['检测评分', car.score + ' 分', false]
    ];
    App.qs('#paramTable').innerHTML = rows.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span>' +
        '<span class="v' + (r[2] ? ' accent' : '') + '">' + App.esc(r[1]) + '</span></div>';
    }).join('');
    App.qs('#vinHint').textContent = '车架号 ' + car.vin.replace(/^(\w{3})\w+(\w{4})$/, '$1********$2') + '（到店可查看完整信息）';
  }

  /* =========================================================================
   * 4. 检测报告 / 质保 / 描述 / 门店
   * ====================================================================== */
  function renderTabs() {
    /* —— 检测报告 —— */
    var s = D.INSPECT_SUMMARY;
    App.qs('#inspectSummary').innerHTML =
      '<div class="inspect-stat"><div class="num">' + s.total + '</div><div class="label">检测项目总数</div></div>' +
      '<div class="inspect-stat"><div class="num green">' + s.pass + '</div><div class="label">检测正常项</div></div>' +
      '<div class="inspect-stat"><div class="num orange">' + s.minor + '</div><div class="label">轻微修复项</div></div>' +
      '<div class="inspect-stat"><div class="num">' + s.fail + '</div><div class="label">重大异常项</div></div>';

    App.qs('#inspectGroups').innerHTML = D.INSPECT_ITEMS.map(function (g, i) {
      return '<div class="inspect-group' + (i === 0 ? ' open' : '') + '" data-group="' + i + '">' +
        '<div class="inspect-group-head"><h4>' + App.esc(g.group) +
          ' <span class="tag tag-green">' + g.items.length + ' 项检测通过</span></h4>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
        '</div>' +
        '<div class="inspect-items">' + g.items.map(function (it) {
          var ok = it[1] === '正常' || it[1] === '无' || it[1] === '未弹开';
          return '<div class="inspect-item"><span>' + App.esc(it[0]) + '</span>' +
            '<span class="st ' + (ok ? 'ok' : 'minor') + '">' +
            (ok
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>') +
            App.esc(it[1]) + '</span></div>';
        }).join('') + '</div>' +
      '</div>';
    }).join('');

    /* 检测分组折叠 */
    App.qs('#inspectGroups').addEventListener('click', function (e) {
      var head = e.target.closest('.inspect-group-head');
      if (head) head.parentElement.classList.toggle('open');
    });

    /* —— 质保服务 —— */
    var warrantyRows = [
      ['质保类型', car.warranty ? '平台一年质保' : '可选加购质保'],
      ['质保期限', '1 年或 2 万公里（以先到为准）'],
      ['质保范围', '发动机 / 变速箱 / 电控系统核心部件'],
      ['服务网点', '全国 300+ 家联保网点'],
      ['生效时间', '过户完成当日 00:00 起'],
      ['退车政策', '7 天无理由退车'],
      ['检测保障', '259 项检测，车况不符全额退']
    ];
    App.qs('#warrantyTable').innerHTML = warrantyRows.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span><span class="v">' + App.esc(r[1]) + '</span></div>';
    }).join('');

    /* —— 车况描述 —— */
    var desc = [
      '<p><b>' + App.esc(car.name) + '</b>，' + car.year + ' 年 ' + car.regDate.split('-')[1] + ' 月上牌，表显里程 ' + App.money1(car.mileage) +
      ' 万公里，' + car.color + '车身搭配' + car.fuel + '动力（' + car.disp + '），' + car.gear + '挡变速箱，' + car.drive + '驱动。车况综合评分 ' + car.score + ' 分。</p>',
      '<p>车辆经 259 项第三方专业检测，检测结论为：<b>' + (car.score >= 88 ? '车况精品，无重大事故、无泡水、无火烧' : '车况良好，无重大事故、无泡水、无火烧') +
      '</b>。外观漆面' + (car.tags.indexOf('原版原漆') > -1 ? '保持原厂状态，无钣金修复痕迹' : '局部存在轻微补漆，不影响使用') + '；内饰整洁，功能按键均正常。</p>',
      '<p>手续情况：车辆登记证书、行驶证、购车发票齐全，' + (car.transfer === 0 ? '为一手车未过户' : '共过户 ' + car.transfer + ' 次，过户记录清晰可查') +
      '，年检有效期至 ' + car.inspectValid + '，支持异地过户与全国提档。</p>',
      '<p>推荐理由：' + (car.fuel === '纯电' ? '纯电车型用车成本极低，百公里电费约 8 元，电池组健康度经专业设备检测合格，三电质保可随车转移。'
        : (car.price <= 8 ? '万元级代步首选，油耗经济、保养便宜、保值率稳定，适合通勤代步与新手练手。'
          : '主流热销车型，保有量大、配件便宜、保值率高，空间与动力兼顾家用需求。')) + '</p>'
    ].join('');
    App.qs('#carDesc').innerHTML = desc;

    /* —— 看车门店 —— */
    var st = D.getStore(car.storeId);
    App.qs('#storeDetail').innerHTML =
      '<div class="store-detail-img img-wrap"><img data-src="' + D.storeImage(st) + '" alt="' + App.esc(st.name) + '"></div>' +
      '<div class="store-detail-body">' +
        '<h3>' + App.esc(st.name) + '</h3>' +
        '<div class="store-line">' + App.icon('location') + '<span>' + App.esc(st.address) + '</span></div>' +
        '<div class="store-line phone">' + App.icon('phone') + '<span>' + App.esc(st.phone) + '</span></div>' +
        '<div class="store-line">' + App.icon('clock') + '<span>营业时间：' + App.esc(st.hours) + '</span></div>' +
        '<div class="store-line">' + App.icon('car') + '<span>车辆当前停放于该门店，建议提前预约，以免车辆被他人预定或调拨</span></div>' +
        '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
          '<button class="btn btn-primary" data-book="' + car.id + '">预约到店看车</button>' +
          '<button class="btn btn-outline" data-action="call">拨打门店电话</button>' +
        '</div>' +
      '</div>';
    App.bindLazyImages(App.qs('#storeDetail'));

    /* —— Tab 切换 —— */
    App.qs('#detailTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]');
      if (!btn) return;
      var key = btn.getAttribute('data-tab');
      App.qsa('.tab-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      App.qsa('.tab-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + key); });
    });
  }

  /* =========================================================================
   * 5. 金融分期计算器（可复用工厂：内联 + 弹窗）
   * ====================================================================== */
  function createCalc(rootSel, out) {
    var root = App.qs(rootSel);
    if (!root) return null;
    var downPct = 30;         // 首付比例 %
    var years = 3;            // 贷款年限
    var rate = D.FINANCE.rate;

    root.innerHTML =
      '<div class="calc-field">' +
        '<div class="calc-field-head"><span class="lbl">首付比例</span>' +
          '<span class="val" data-out="downPct">' + downPct + '<em>%</em></span></div>' +
        '<input type="range" class="calc-slider" min="10" max="70" step="5" value="' + downPct + '" data-role="downPct">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted-2);margin-top:6px">' +
          '<span>10%（最低首付）</span><span>70%</span></div>' +
        '<div class="calc-field-head" style="margin-top:12px;margin-bottom:0">' +
          '<span class="lbl">首付金额</span><span class="val" data-out="downMoney">0.00<em>万</em></span></div>' +
      '</div>' +
      '<div class="calc-field">' +
        '<div class="calc-field-head"><span class="lbl">贷款年限</span>' +
          '<span class="val" data-out="yearsTxt">3<em>年（36 期）</em></span></div>' +
        '<div class="calc-years">' + [1, 2, 3, 4, 5].map(function (y) {
          return '<span class="radio-pill' + (y === years ? ' active' : '') + '" data-year="' + y + '">' + y + ' 年</span>';
        }).join('') + '</div>' +
      '</div>';

    function paint() {
      var down = car.price * downPct / 100;
      var loan = car.price - down;
      var monthly = D.monthlyPayment(loan, rate, years);
      var totalPay = monthly * years * 12;
      var interest = Math.max(0, totalPay - loan);

      root.querySelector('[data-out="downPct"]').innerHTML = downPct + '<em>%</em>';
      root.querySelector('[data-out="downMoney"]').innerHTML = App.money(down) + '<em>万</em>';
      root.querySelector('[data-out="yearsTxt"]').innerHTML = years + '<em>年（' + (years * 12) + ' 期）</em>';
      App.qsa('[data-year]', root).forEach(function (p) {
        p.classList.toggle('active', +p.getAttribute('data-year') === years);
      });

      out.month.innerHTML = Math.round(monthly * 10000) + '<em>元</em>';
      out.plan.textContent = '首付 ' + downPct + '% · 贷款 ' + years + ' 年';
      out.total.textContent = App.money(car.price) + ' 万';
      out.down.textContent = App.money(down) + ' 万';
      out.loan.textContent = App.money(loan) + ' 万';
      out.terms.textContent = (years * 12) + ' 期';
      if (out.interest) out.interest.textContent = App.money(interest) + ' 万';
    }

    root.querySelector('[data-role="downPct"]').addEventListener('input', function (e) {
      downPct = +e.target.value;
      paint();
    });
    root.addEventListener('click', function (e) {
      var pill = e.target.closest('[data-year]');
      if (pill) { years = +pill.getAttribute('data-year'); paint(); }
    });
    paint();
    return paint;
  }

  function renderCalc() {
    var p1 = createCalc('#calcInline', {
      month: App.qs('#rMonth'), plan: App.qs('#rPlan'), total: App.qs('#rTotal'),
      down: App.qs('#rDown'), loan: App.qs('#rLoan'), terms: App.qs('#rTerms'), interest: App.qs('#rInterest')
    });
    createCalc('#calcModalBody', {
      month: App.qs('#mMonth'), plan: App.qs('#mPlan'), total: App.qs('#mTotal'),
      down: App.qs('#mDown'), loan: App.qs('#mLoan'), terms: App.qs('#mTerms')
    });
    App.qs('#calcModalSub').textContent = car.name + ' · 全款 ' + App.money(car.price) + ' 万，拖动滑块实时计算月供';
  }

  /* =========================================================================
   * 6. 同款 / 同价位推荐
   * ====================================================================== */
  function renderRecommend() {
    /* 同款：同车系优先，其次同品牌 */
    var same = D.CARS.filter(function (c) {
      return c.id !== car.id && c.series === car.series;
    });
    if (same.length < 4) {
      same = same.concat(D.CARS.filter(function (c) {
        return c.id !== car.id && c.series !== car.series && c.brand === car.brand;
      }));
    }
    same = same.slice(0, 4);
    App.qs('#recTitle').textContent = '同款车源推荐（' + car.brand + ' ' + car.series + '）';
    App.qs('#recMore').href = 'list.html?brand=' + encodeURIComponent(car.brand) + '&series=' + encodeURIComponent(car.series);
    App.renderCars(App.qs('#recSame'), same);

    /* 同价位（±25% 预算，排除同车系） */
    var priceRec = D.CARS.filter(function (c) {
      return c.id !== car.id && c.series !== car.series && Math.abs(c.price - car.price) <= car.price * 0.25;
    }).sort(function (a, b) { return Math.abs(a.price - car.price) - Math.abs(b.price - car.price); }).slice(0, 4);
    App.renderCars(App.qs('#recPrice'), priceRec);
  }

  /* =========================================================================
   * 7. 悬浮操作栏
   * ====================================================================== */
  function renderFloatBar() {
    App.qs('#floatTop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    App.qs('#shareBtn').addEventListener('click', function () {
      var text = '【优车汇】' + car.name + '，' + car.year + ' 年上牌 / ' + App.money1(car.mileage) + ' 万公里，售价 ' + App.money(car.price) + ' 万，车况评分 ' + car.score + ' 分';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text + ' ' + location.href).then(function () {
          App.toast('车辆信息已复制，快去分享给好友吧');
        }).catch(function () { App.okDialog('分享给好友', text); });
      } else { App.okDialog('分享给好友', text); }
    });
    /* 收藏状态变化时同步按钮文案 */
    document.addEventListener('fav:change', function (e) {
      if (e.detail.id === car.id) syncFavUI();
    });
  }

  /* =========================================================================
   * 初始化
   * ====================================================================== */
  function init() {
    car = pickCar();
    renderBase();
    renderGallery();
    renderParams();
    renderTabs();
    renderCalc();
    renderRecommend();
    renderFloatBar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
