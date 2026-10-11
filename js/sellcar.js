/* =============================================================================
 * sellcar.js —— 车主卖车页脚本
 * -----------------------------------------------------------------------------
 * 模块：
 *   1) 品牌 / 车系联动下拉、年份 / 月份 / 城市选项填充
 *   2) 车辆配置多选（标签式）
 *   3) 期望售价智能参考区间（依据平台同款车源成交数据）
 *   4) 图片上传模拟框（本地预览 / 删除 / 最多 10 张）
 *   5) 表单校验 + 提交成功提示
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.AppData, App = window.App;
  var uploads = [];           // 已上传图片（dataURL）
  var MAX_IMG = 10;
  var SLOTS = 5;              // 每行展示 5 个格子

  /* =========================================================================
   * 1. 下拉选项填充与联动
   * ====================================================================== */
  function fillSelect(sel, list, placeholder) {
    var box = App.qs(sel);
    box.innerHTML = '<option value="">' + placeholder + '</option>' +
      list.map(function (v) { return '<option value="' + App.esc(v.value) + '">' + App.esc(v.label) + '</option>'; }).join('');
    return box;
  }

  function fillSeries() {
    var brand = App.qs('#sellBrand').value;
    var box = App.qs('#sellSeries');
    if (!brand) { box.innerHTML = '<option value="">请先选择品牌</option>'; return; }
    var map = D.SERIES_MAP[brand] || {};
    box.innerHTML = '<option value="">请选择车系</option>' +
      Object.keys(map).map(function (s) { return '<option value="' + App.esc(s) + '">' + App.esc(s) + '</option>'; }).join('');
  }

  function initSelects() {
    fillSelect('#sellBrand', D.BRANDS.map(function (b) { return { label: b.name, value: b.name }; }), '请选择品牌');
    fillSelect('#sellCity', D.CITY_LIST.map(function (c) { return { label: c, value: c }; }), '请选择城市');
    var years = [];
    for (var y = 2026; y >= 2012; y--) years.push({ label: y + ' 年', value: y });
    fillSelect('#sellYear', years, '请选择上牌年份');
    var months = [];
    for (var m = 1; m <= 12; m++) months.push({ label: m + ' 月', value: m });
    fillSelect('#sellMonth', months, '请选择月份');

    App.qs('#sellBrand').addEventListener('change', function () { fillSeries(); updatePriceHint(); });
    App.qs('#sellSeries').addEventListener('change', updatePriceHint);
    App.qs('#sellYear').addEventListener('change', updatePriceHint);

    /* 默认选中一个合理年份，减少填写成本 */
    App.qs('#sellYear').value = '2020';
    App.qs('#sellMonth').value = '6';
  }

  /* =========================================================================
   * 2. 车辆配置多选
   * ====================================================================== */
  function initConfigs() {
    var box = App.qs('#sellConfigs');
    box.innerHTML = D.SELL_CONFIG_OPTIONS.map(function (c) {
      return '<label class="radio-pill" style="min-width:auto"><input type="checkbox" value="' + App.esc(c) + '">' + App.esc(c) + '</label>';
    }).join('');
    box.addEventListener('change', function (e) {
      if (e.target.type !== 'checkbox') return;
      e.target.closest('.radio-pill').classList.toggle('active', e.target.checked);
    });
  }

  /* =========================================================================
   * 3. 期望售价参考区间（同品牌同车系的平台车源价格区间）
   * ====================================================================== */
  function updatePriceHint() {
    var brand = App.qs('#sellBrand').value, series = App.qs('#sellSeries').value;
    var hint = App.qs('#priceHint');
    if (!brand) { hint.textContent = '—'; return; }
    var list = D.CARS.filter(function (c) {
      return c.brand === brand && (!series || c.series === series);
    });
    if (!list.length) { hint.textContent = '暂无同款参考数据'; return; }
    var prices = list.map(function (c) { return c.price; });
    var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
    hint.textContent = App.money(min) + ' 万 ~ ' + App.money(max) + ' 万';
  }

  /* =========================================================================
   * 4. 图片上传模拟框
   * ====================================================================== */
  function renderUpload() {
    var grid = App.qs('#uploadGrid');
    var html = uploads.map(function (src, i) {
      return '<div class="upload-box has-img" data-img="' + i + '">' +
        '<img src="' + src + '" alt="车辆实拍 ' + (i + 1) + '">' +
        '<span class="up-del" title="删除">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>' +
        '</span></div>';
    }).join('');

    /* 剩余空格子（含一个"点击上传"提示位） */
    var remain = Math.max(SLOTS - uploads.length, uploads.length < MAX_IMG ? 1 : 0);
    for (var i = 0; i < remain && (uploads.length + i) < MAX_IMG; i++) {
      html += '<div class="upload-box" data-add>' +
        '<span class="up-inner">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>' +
          '<span>' + (i === 0 ? '点击上传' : '') + '</span>' +
        '</span></div>';
    }
    grid.innerHTML = html;
  }

  function initUpload() {
    renderUpload();
    var input = App.qs('#fileInput');

    App.qs('#uploadGrid').addEventListener('click', function (e) {
      var del = e.target.closest('.up-del');
      if (del) {
        var idx = +del.closest('[data-img]').getAttribute('data-img');
        uploads.splice(idx, 1);
        renderUpload();
        return;
      }
      if (e.target.closest('[data-add]')) input.click();
    });

    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      files.forEach(function (f) {
        if (uploads.length >= MAX_IMG) return;
        if (!/^image\//.test(f.type)) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          uploads.push(ev.target.result);
          renderUpload();
        };
        reader.readAsDataURL(f);
      });
      input.value = '';
    });
  }

  /* =========================================================================
   * 5. 提交
   * ====================================================================== */
  function collectConfigs() {
    return App.qsa('#sellConfigs input:checked').map(function (i) { return i.value; });
  }

  function submit() {
    var form = App.qs('#sellForm');
    if (!App.validateForm(form)) return;
    /* 里程区间额外校验 */
    var mileage = parseFloat(form.mileage.value);
    if (isNaN(mileage) || mileage <= 0 || mileage > 60) {
      App.toast('请输入正确的行驶里程（0.1 - 60 万公里）', 'error');
      return;
    }
    var price = parseFloat(form.price.value);
    if (isNaN(price) || price <= 0) {
      App.toast('请输入正确的期望售价', 'error');
      return;
    }

    var user = App.store.getUser();
    var record = {
      id: 'SL' + Date.now(),
      brand: form.brand.value,
      series: form.series.value,
      model: form.model.value,
      year: form.year.value,
      month: form.month.value,
      mileage: mileage,
      fuel: form.fuel.value,
      gear: form.gear.value,
      city: form.city.value,
      configs: collectConfigs(),
      price: price,
      transfer: form.transfer.value,
      name: form.name.value,
      phone: form.phone.value,
      phone2: form.phone2.value,
      remark: form.remark.value,
      imageCount: uploads.length,
      cover: uploads[0] || '',
      createdAt: Date.now(),
      ownerPhone: user ? user.phone : '',
      status: '待评估'
    };
    /* 图片体积较大，仅保存首图缩略用于展示（避免超出本地存储配额） */
    try { App.store.addSale(record); } catch (e) { record.cover = ''; App.store.addSale(record); }

    App.okDialog('提交成功，评估师将尽快联系您',
      '车辆：<b>' + App.esc(record.brand + ' ' + record.series + ' ' + record.year + ' 年') + '</b><br>' +
      '期望售价：<b>' + App.money(record.price) + ' 万</b>　已上传图片：<b>' + record.imageCount + ' 张</b><br>' +
      '评估师将在 <b>2 小时内</b>致电 ' + App.esc(record.phone) + ' 预约上门验车。');

    /* 重置表单与上传区 */
    form.reset();
    uploads = [];
    renderUpload();
    App.qsa('#sellConfigs .radio-pill').forEach(function (p) { p.classList.remove('active'); });
    App.qs('#sellYear').value = '2020';
    App.qs('#sellMonth').value = '6';
    fillSeries();
    updatePriceHint();
    prefillUser();
  }

  /* 登录用户信息预填 */
  function prefillUser() {
    var u = App.store.getUser();
    if (!u) return;
    var form = App.qs('#sellForm');
    if (!form.name.value) form.name.value = u.name || '';
    if (!form.phone.value) form.phone.value = u.phone || '';
    if (!form.city.value && u.city) form.city.value = u.city;
  }

  /* =========================================================================
   * 初始化
   * ====================================================================== */
  function init() {
    /* Hero 卖车优势 */
    App.qs('#sellAdv').innerHTML = D.SELL_ADVANTAGES.map(function (a) {
      return '<div class="sell-adv-item"><h5>' + App.esc(a.title) + '</h5><p>' + App.esc(a.desc) + '</p></div>';
    }).join('');
    /* 侧栏优势列表 */
    App.qs('#sellWhy').innerHTML = D.SELL_ADVANTAGES.map(function (a, i) {
      return '<div class="side-step"><span class="n">' + (i + 1) + '</span><div><h5>' + App.esc(a.title) + '</h5><p>' + App.esc(a.desc) + '</p></div></div>';
    }).join('');

    initSelects();
    initConfigs();
    initUpload();
    prefillUser();
    updatePriceHint();

    App.qs('#sellForm').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    App.qs('#resetBtn').addEventListener('click', function () {
      setTimeout(function () {
        uploads = [];
        renderUpload();
        App.qsa('#sellConfigs .radio-pill').forEach(function (p) { p.classList.remove('active'); });
        fillSeries();
        updatePriceHint();
      }, 0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
