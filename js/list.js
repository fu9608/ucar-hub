/* =============================================================================
 * list.js —— 二手车列表页脚本
 * -----------------------------------------------------------------------------
 * 模块：
 *   1) 多级筛选联动（品牌 → 车系 → 车型）
 *   2) 二级筛选（上牌年份区间、里程、价格双向滑块、燃料、变速箱、过户次数、质保、城市）
 *   3) 排序（最新上架 / 低价优先 / 高价优先 / 热门推荐 / 里程最少）
 *   4) 已选条件回显、结果统计、分页
 *   5) 支持从首页/搜索携带 URL 参数进入（kw / brand / sections / fuel 等）
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.AppData, App = window.App;

  /* =========================================================================
   * 0. 筛选状态（全部筛选条件的唯一数据源）
   * ====================================================================== */
  var PRICE_MIN = 1, PRICE_MAX = 80;
  var state = {
    kw: '', brand: '', series: '', model: '',
    yearRange: '',                 // '' | '2023-2026' | '2020-2022' | '2016-2019' | '2012-2015'
    mileageKey: '',                // '' | '0-1' | '1-3' | '3-5' | '5-8' | '8-99'
    priceMin: PRICE_MIN, priceMax: PRICE_MAX,
    fuel: '', gear: '', transfer: '', warranty: '', city: '', sections: '',
    sort: 'new', page: 1, pageSize: 12
  };

  /* 燃料映射：燃油 / 纯电 / 混动 → 数据源中的具体燃料 */
  var FUEL_MAP = { '燃油': ['汽油', '油电混动'], '纯电': ['纯电'], '混动': ['油电混动', '插电混动'] };
  var YEAR_RANGES = { '2023-2026': [2023, 2026], '2020-2022': [2020, 2022], '2016-2019': [2016, 2019], '2012-2015': [2012, 2015] };
  var MILEAGE_RANGES = { '0-1': [0, 1], '1-3': [1, 3], '3-5': [3, 5], '5-8': [5, 8], '8-99': [8, 99] };

  /* =========================================================================
   * 1. 工具：生成筛选项 HTML
   * ====================================================================== */
  function opts(list, key, current) {
    return list.map(function (o) {
      var val = o.value === undefined ? o : o.value;
      var label = o.label === undefined ? o : o.label;
      var cls = 'filter-opt' + ((current || '') === val ? ' active' : '') + (o.more ? ' more' : '');
      return '<span class="' + cls + '" data-val="' + App.esc(val) + '">' + App.esc(label) + '</span>';
    }).join('');
  }

  /* =========================================================================
   * 2. 渲染各筛选区块
   * ====================================================================== */
  var brandExpanded = false;
  function renderBrand() {
    var all = D.BRANDS.map(function (b) { return { label: b.name + '（' + b.count + '）', value: b.name }; });
    var show = brandExpanded ? all : all.slice(0, 12);
    App.qs('#filterBrand').innerHTML =
      opts([{ label: '不限', value: '' }], 'brand', state.brand) +
      opts(show, 'brand', state.brand) +
      (all.length > 12
        ? '<span class="filter-opt more" id="brandMore">' + (brandExpanded ? '收起 ⌃' : '更多品牌 ⌄') + '</span>'
        : '');
  }

  function renderSeries() {
    var box = App.qs('#filterSeries');
    if (!state.brand) {
      box.innerHTML = '<span style="font-size:13px;color:var(--muted-2)">请先选择品牌，或查看不限车系</span>' +
        opts([{ label: '不限', value: '' }], 'series', state.series);
      return;
    }
    var map = D.SERIES_MAP[state.brand] || {};
    var list = Object.keys(map).map(function (s) { return { label: s + '（' + map[s] + '）', value: s }; });
    box.innerHTML = opts([{ label: '不限', value: '' }], 'series', state.series) + opts(list, 'series', state.series);
  }

  function renderModel() {
    var box = App.qs('#filterModel');
    if (!state.brand || !state.series) {
      box.innerHTML = '<span style="font-size:13px;color:var(--muted-2)">选择品牌与车系后，可进一步筛选具体车型配置</span>';
      return;
    }
    var list = (D.MODEL_MAP[state.brand + '|' + state.series] || []).map(function (m) { return { label: m, value: m }; });
    box.innerHTML = opts([{ label: '不限', value: '' }], 'model', state.model) + opts(list, 'model', state.model);
  }

  function renderYear() {
    var chips = [
      { label: '不限', value: '' },
      { label: '2023 年后', value: '2023-2026' },
      { label: '2020 - 2022 年', value: '2020-2022' },
      { label: '2016 - 2019 年', value: '2016-2019' },
      { label: '2012 - 2015 年', value: '2012-2015' }
    ];
    var y1 = App.qs('#yearFrom'), y2 = App.qs('#yearTo');
    var sel1 = '', sel2 = '';
    for (var y = 2012; y <= 2026; y++) {
      sel1 += '<option value="' + y + '"' + (y1 && +y1.value === y ? ' selected' : '') + '>' + y + '</option>';
      sel2 += '<option value="' + y + '"' + (y2 && +y2.value === y ? ' selected' : '') + '>' + y + '</option>';
    }
    App.qs('#filterYear').innerHTML =
      opts(chips, 'year', state.yearRange) +
      '<span style="display:inline-flex;align-items:center;gap:6px;margin-left:10px">' +
        '<select class="form-control" id="yearFrom" style="height:32px;width:96px;font-size:13px">' + sel1 + '</select>' +
        '<span style="color:var(--muted-2)">—</span>' +
        '<select class="form-control" id="yearTo" style="height:32px;width:96px;font-size:13px">' + sel2 + '</select>' +
        '<span class="filter-opt" id="yearApply" style="color:#fff;background:var(--primary)">确定</span>' +
      '</span>';
  }

  function renderMileage() {
    var chips = [
      { label: '不限', value: '' },
      { label: '1 万公里内', value: '0-1' },
      { label: '1 - 3 万公里', value: '1-3' },
      { label: '3 - 5 万公里', value: '3-5' },
      { label: '5 - 8 万公里', value: '5-8' },
      { label: '8 万公里以上', value: '8-99' }
    ];
    App.qs('#filterMileage').innerHTML = opts(chips, 'mileage', state.mileageKey);
  }

  function renderAdvanced() {
    App.qs('#filterFuel').innerHTML = opts([
      { label: '不限', value: '' }, { label: '燃油', value: '燃油' },
      { label: '纯电', value: '纯电' }, { label: '混动 / 插混', value: '混动' }
    ], 'fuel', state.fuel);
    App.qs('#filterGear').innerHTML = opts([
      { label: '不限', value: '' }, { label: '自动挡', value: '自动' }, { label: '手动挡', value: '手动' }
    ], 'gear', state.gear);
    App.qs('#filterTransfer').innerHTML = opts([
      { label: '不限', value: '' }, { label: '0 次过户', value: '0' },
      { label: '1 次以内', value: '1' }, { label: '2 次以内', value: '2' }, { label: '3 次以内', value: '3' }
    ], 'transfer', state.transfer);
    App.qs('#filterWarranty').innerHTML = opts([
      { label: '不限', value: '' }, { label: '含质保服务', value: '1' }
    ], 'warranty', state.warranty);
    App.qs('#filterCity').innerHTML = opts(
      [{ label: '不限', value: '' }].concat(D.CITY_LIST.map(function (c) { return { label: c, value: c }; })),
      'city', state.city);
  }

  /* =========================================================================
   * 3. 价格双向滑块
   * ====================================================================== */
  function initPriceSlider() {
    var track = App.qs('#priceTrack');
    var fill = App.qs('#priceFill');
    var tMin = App.qs('#priceThumbMin'), tMax = App.qs('#priceThumbMax');

    function pct(v) { return (v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100; }
    function paint() {
      var a = pct(state.priceMin), b = pct(state.priceMax);
      tMin.style.left = a + '%';
      tMax.style.left = b + '%';
      fill.style.left = a + '%';
      fill.style.width = Math.max(0, b - a) + '%';
      App.qs('#priceMinInput').value = state.priceMin;
      App.qs('#priceMaxInput').value = state.priceMax;
      App.qs('#priceTxt').textContent = state.priceMin + ' - ' + (state.priceMax >= PRICE_MAX ? PRICE_MAX + ' 万以上' : state.priceMax + ' 万');
    }

    var dragging = null;
    function moveTo(clientX) {
      var rect = track.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      var v = Math.round(PRICE_MIN + ratio * (PRICE_MAX - PRICE_MIN));
      if (dragging === 'min') state.priceMin = Math.min(v, state.priceMax - 1);
      else state.priceMax = Math.max(v, state.priceMin + 1);
      paint();
    }
    function onDown(e) {
      var thumb = e.target.closest('[data-thumb]');
      if (thumb) dragging = thumb.getAttribute('data-thumb');
      else {
        /* 点击轨道：移动最近的一端 */
        var rect = track.getBoundingClientRect();
        var v = Math.round(PRICE_MIN + ((e.clientX - rect.left) / rect.width) * (PRICE_MAX - PRICE_MIN));
        dragging = Math.abs(v - state.priceMin) <= Math.abs(v - state.priceMax) ? 'min' : 'max';
        moveTo(e.clientX);
      }
      tMin.classList.toggle('dragging', dragging === 'min');
      tMax.classList.toggle('dragging', dragging === 'max');
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      e.preventDefault();
    }
    function onMove(e) { if (dragging) moveTo(e.clientX); }
    function onUp() {
      if (!dragging) return;
      dragging = null;
      tMin.classList.remove('dragging'); tMax.classList.remove('dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      state.page = 1; render();
    }
    track.addEventListener('pointerdown', onDown);

    /* 手动输入价格 */
    function bindInput(sel, key, other) {
      var input = App.qs(sel);
      input.addEventListener('change', function () {
        var v = parseInt(input.value, 10);
        if (isNaN(v)) v = PRICE_MIN;
        v = Math.min(PRICE_MAX, Math.max(PRICE_MIN, v));
        if (key === 'min') state.priceMin = Math.min(v, state.priceMax - 1);
        else state.priceMax = Math.max(v, state.priceMin + 1);
        paint(); state.page = 1; render();
      });
    }
    bindInput('#priceMinInput', 'min');
    bindInput('#priceMaxInput', 'max');
    paint();
    initPriceSlider.paint = paint;
  }

  /* =========================================================================
   * 4. 过滤 + 排序
   * ====================================================================== */
  function getFiltered() {
    var yr = state.yearRange ? YEAR_RANGES[state.yearRange] : null;
    var mr = state.mileageKey ? MILEAGE_RANGES[state.mileageKey] : null;
    var fuels = state.fuel ? FUEL_MAP[state.fuel] : null;

    var list = D.CARS.filter(function (c) {
      if (state.kw && App.searchCars(state.kw).indexOf(c) === -1) return false;
      if (state.brand && c.brand !== state.brand) return false;
      if (state.series && c.series !== state.series) return false;
      if (state.model && c.model !== state.model) return false;
      if (yr && (c.year < yr[0] || c.year > yr[1])) return false;
      if (mr && (c.mileage < mr[0] || c.mileage > mr[1])) return false;
      if (c.price < state.priceMin || c.price > state.priceMax) return false;
      if (fuels && fuels.indexOf(c.fuel) === -1) return false;
      if (state.gear && c.gear !== state.gear) return false;
      if (state.transfer !== '' && c.transfer > +state.transfer) return false;
      if (state.warranty === '1' && !c.warranty) return false;
      if (state.city && c.city !== state.city) return false;
      if (state.sections && c.sections.indexOf(state.sections) === -1) return false;
      return true;
    });

    /* 排序 */
    var sorters = {
      new: function (a, b) { return a.createdAt - b.createdAt; },
      priceAsc: function (a, b) { return a.price - b.price; },
      priceDesc: function (a, b) { return b.price - a.price; },
      hot: function (a, b) { return (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || a.createdAt - b.createdAt; },
      mileageAsc: function (a, b) { return a.mileage - b.mileage; }
    };
    return list.sort(sorters[state.sort] || sorters.new);
  }

  /* =========================================================================
   * 5. 已选条件回显
   * ====================================================================== */
  function renderSelected() {
    var items = [];
    if (state.kw) items.push(['kw', '关键词：' + state.kw]);
    if (state.sections) items.push(['sections', '专区：' + state.sections]);
    if (state.brand) items.push(['brand', '品牌：' + state.brand]);
    if (state.series) items.push(['series', '车系：' + state.series]);
    if (state.model) items.push(['model', '车型：' + state.model]);
    if (state.yearRange) items.push(['year', '年份：' + state.yearRange.replace('-', ' - ') + ' 年']);
    if (state.mileageKey) items.push(['mileage', '里程：' + MILEAGE_RANGES[state.mileageKey][0] + ' - ' + MILEAGE_RANGES[state.mileageKey][1] + ' 万公里']);
    if (state.priceMin > PRICE_MIN || state.priceMax < PRICE_MAX) items.push(['price', '价格：' + state.priceMin + ' - ' + state.priceMax + ' 万']);
    if (state.fuel) items.push(['fuel', '燃料：' + state.fuel]);
    if (state.gear) items.push(['gear', '变速箱：' + state.gear + '挡']);
    if (state.transfer !== '') items.push(['transfer', '过户：' + state.transfer + ' 次以内']);
    if (state.warranty === '1') items.push(['warranty', '含质保']);
    if (state.city) items.push(['city', '城市：' + state.city]);

    var bar = App.qs('#selectedBar');
    if (!items.length) { bar.innerHTML = '<span class="label">全部车源（未使用筛选条件）</span>'; return; }
    bar.innerHTML = '<span class="label">已选条件：</span>' +
      items.map(function (it) {
        return '<span class="selected-chip">' + App.esc(it[1]) +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" data-remove="' + it[0] + '"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg></span>';
      }).join('') +
      '<span class="clear-all" id="clearAll">清空全部条件</span>';
  }

  /* =========================================================================
   * 6. 分页
   * ====================================================================== */
  function renderPagination(total) {
    var box = App.qs('#pagination');
    var pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;
    if (pages <= 1) { box.innerHTML = ''; return; }

    var html = '<button class="page-btn' + (state.page === 1 ? ' disabled' : '') + '" data-page="' + (state.page - 1) + '">上一页</button>';
    var nums = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '...') nums.push('...');
    }
    nums.forEach(function (n) {
      html += n === '...'
        ? '<span class="page-ellipsis">···</span>'
        : '<button class="page-btn' + (n === state.page ? ' active' : '') + '" data-page="' + n + '">' + n + '</button>';
    });
    html += '<button class="page-btn' + (state.page === pages ? ' disabled' : '') + '" data-page="' + (state.page + 1) + '">下一页</button>';
    html += '<span class="page-jump">共 ' + pages + ' 页，跳至 <input type="number" min="1" max="' + pages + '" id="jumpPage" value="' + state.page + '"> 页</span>';
    box.innerHTML = html;
  }

  /* =========================================================================
   * 7. 主渲染
   * ====================================================================== */
  function render() {
    var all = getFiltered();
    var total = all.length;
    var start = (state.page - 1) * state.pageSize;
    var pageCars = all.slice(start, start + state.pageSize);

    App.qs('#resultCount').textContent = total;
    App.renderCars(App.qs('#carList'), pageCars);
    renderPagination(total);
    renderSelected();

    /* 标题 / 面包屑随筛选条件变化，增强真实感 */
    var title = state.sections ? state.sections :
      (state.brand ? (state.brand + (state.series ? ' ' + state.series : '') + ' 二手车') :
        (state.kw ? '「' + state.kw + '」相关车源' : '全国严选二手车源'));
    App.qs('#pageTitle').textContent = title;
    App.qs('#crumbNow').textContent = title;
    App.qs('#pageDesc').textContent = '当前筛选条件下共 ' + total + ' 台车源，全部通过 259 项第三方检测，支持 7 天无理由退车';
    document.title = title + ' - 严选二手车源 | 优车汇二手车';
  }

  /* =========================================================================
   * 8. 事件绑定
   * ====================================================================== */
  function applyFilter(key, val) {
    if (key === 'price') return;
    state[key] = val;
    if (key === 'brand') { state.series = ''; state.model = ''; renderSeries(); renderModel(); renderBrand(); }
    else if (key === 'series') { state.model = ''; renderModel(); }
    else if (key === 'year') { renderYear(); }
    else if (['fuel', 'gear', 'transfer', 'warranty', 'city'].indexOf(key) > -1) { renderAdvanced(); }
    else if (key === 'mileage') { renderMileage(); }
    state.page = 1;
    render();
  }

  function bindEvents() {
    /* 筛选面板：统一事件委托 */
    App.qs('#filterPanel').addEventListener('click', function (e) {
      /* 品牌展开/收起 */
      if (e.target.id === 'brandMore') {
        brandExpanded = !brandExpanded; renderBrand(); applyFilter('brand', state.brand); return;
      }
      /* 年份自定义确定 */
      if (e.target.id === 'yearApply') {
        var f = +App.qs('#yearFrom').value, t = +App.qs('#yearTo').value;
        if (f > t) { var tmp = f; f = t; t = tmp; }
        state.yearRange = '';
        /* 用自定义范围：直接写入区间对象 */
        YEAR_RANGES['custom'] = [f, t];
        applyFilter('year', 'custom');
        App.qs('#yearFrom').value = f; App.qs('#yearTo').value = t;
        return;
      }
      var opt = e.target.closest('[data-val]');
      if (!opt) return;
      var row = opt.closest('[data-fkey]');
      if (!row) return;
      applyFilter(row.getAttribute('data-fkey'), opt.getAttribute('data-val'));
    });

    /* 已选条件：单个移除 / 全部清空 */
    App.qs('#selectedBar').addEventListener('click', function (e) {
      var rm = e.target.closest('[data-remove]');
      if (rm) {
        var key = rm.getAttribute('data-remove');
        if (key === 'price') { state.priceMin = PRICE_MIN; state.priceMax = PRICE_MAX; initPriceSlider.paint(); }
        else if (key === 'year') { state.yearRange = ''; renderYear(); }
        else { state[key] = ''; }
        if (key === 'brand') { state.series = ''; state.model = ''; renderBrand(); renderSeries(); renderModel(); }
        if (key === 'series') { state.model = ''; renderModel(); }
        renderAdvanced(); renderMileage();
        state.page = 1; render();
        return;
      }
      if (e.target.id === 'clearAll') {
        state.kw = ''; state.brand = ''; state.series = ''; state.model = '';
        state.yearRange = ''; state.mileageKey = ''; state.fuel = ''; state.gear = '';
        state.transfer = ''; state.warranty = ''; state.city = ''; state.sections = '';
        state.priceMin = PRICE_MIN; state.priceMax = PRICE_MAX;
        state.page = 1;
        renderBrand(); renderSeries(); renderModel(); renderYear(); renderMileage(); renderAdvanced();
        initPriceSlider.paint(); render();
        App.toast('已清空全部筛选条件', 'info');
      }
    });

    /* 高级筛选折叠 */
    App.qs('#advToggle').addEventListener('click', function () {
      var adv = App.qs('#filterAdv');
      adv.classList.toggle('show');
      this.textContent = adv.classList.contains('show') ? '收起筛选条件 ⌃' : '展开更多筛选条件 ⌄';
    });

    /* 排序 */
    App.qs('#sortList').addEventListener('click', function (e) {
      var item = e.target.closest('[data-sort]');
      if (!item) return;
      state.sort = item.getAttribute('data-sort');
      state.page = 1;
      App.qsa('.sort-item').forEach(function (s) { s.classList.toggle('active', s === item); });
      render();
    });

    /* 分页 */
    App.qs('#pagination').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (btn && !btn.classList.contains('disabled')) {
        state.page = Math.max(1, +btn.getAttribute('data-page'));
        render();
        window.scrollTo({ top: App.qs('#sortList').getBoundingClientRect().top + window.pageYOffset - 120, behavior: 'smooth' });
        return;
      }
      if (e.target.id === 'jumpPage') {
        var v = +e.target.value;
        if (v >= 1) { state.page = v; render(); }
      }
    });
    App.qs('#pagination').addEventListener('keydown', function (e) {
      if (e.target.id === 'jumpPage' && e.key === 'Enter') {
        var v = +e.target.value; if (v >= 1) { state.page = v; render(); }
      }
    });
  }

  /* =========================================================================
   * 9. URL 参数初始化（支持首页/搜索/专区入口携带条件）
   * ====================================================================== */
  function readParams() {
    var p = new URLSearchParams(location.search);
    if (p.get('kw')) state.kw = p.get('kw');
    if (p.get('brand')) state.brand = p.get('brand');
    if (p.get('series')) state.series = p.get('series');
    if (p.get('model')) state.model = p.get('model');
    if (p.get('fuel')) state.fuel = p.get('fuel');
    if (p.get('gear')) state.gear = p.get('gear');
    if (p.get('city')) state.city = p.get('city');
    if (p.get('sections')) state.sections = p.get('sections');
    if (p.get('sort')) state.sort = p.get('sort');
    if (p.get('priceMin')) state.priceMin = Math.max(PRICE_MIN, +p.get('priceMin'));
    if (p.get('priceMax')) state.priceMax = Math.min(PRICE_MAX, +p.get('priceMax'));
    if (p.get('mileage')) state.mileageKey = p.get('mileage');
  }

  /* =========================================================================
   * 初始化
   * ====================================================================== */
  function init() {
    readParams();
    renderBrand();
    renderSeries();
    renderModel();
    renderYear();
    renderMileage();
    renderAdvanced();
    initPriceSlider();
    bindEvents();
    App.qsa('.sort-item').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-sort') === state.sort);
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
