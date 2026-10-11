/* =============================================================================
 * pages.js —— 辅助静态页脚本
 * -----------------------------------------------------------------------------
 * 覆盖页面（依据 body[data-page] 自动分派）：
 *   · store   —— 门店介绍 store.html
 *   · service —— 平台检测保障 service.html（#inspect / #warranty / #finance / #process）
 *   · guide   —— 购车指南 guide.html
 *   · about   —— 企业关于我们 about.html
 * 依赖：data.js（数据层）与 main.js（公共能力 App）
 * ========================================================================== */
(function () {
  'use strict';

  var D = window.AppData, App = window.App;
  var page = document.body.getAttribute('data-page');

  /* =========================================================================
   * 一、门店介绍 store.html
   * ====================================================================== */
  function initStore() {
    /* 1. 门店服务数据条 */
    var stats = [
      { num: '200', unit: '+', label: '覆盖城市' },
      { num: '300', unit: '+', label: '服务网点' },
      { num: '2', unit: '小时', label: '上门验车响应' },
      { num: '4.9', unit: '分', label: '门店服务满意度' }
    ];
    App.qs('#storeStats').innerHTML = stats.map(function (s) {
      return '<div class="about-stat"><div class="num">' + s.num + '<em>' + s.unit + '</em></div>' +
        '<div class="label">' + s.label + '</div></div>';
    }).join('');

    /* 2. 城市筛选（「全部」+ 门店所在城市） */
    var tabsBox = App.qs('#storeCityTabs');
    var cities = ['全部'].concat(D.CITY_LIST);
    tabsBox.innerHTML = cities.map(function (c, i) {
      return '<button class="zone-tab' + (i === 0 ? ' active' : '') + '" data-city="' + App.esc(c) + '">' + App.esc(c) + '</button>';
    }).join('');

    /* 3. 门店列表大卡 */
    var listBox = App.qs('#storeList');
    var STORE_TAGS = ['支持到店看车', '免费上门验车', '代办过户上牌', '官方质保车源'];
    function renderStores(city) {
      var list = city === '全部' ? D.STORES : D.STORES.filter(function (s) { return s.city === city; });
      listBox.innerHTML = list.map(function (s) {
        return '<article class="store-detail">' +
          '<div class="store-detail-img img-wrap">' +
            '<img data-src="' + D.storeImage(s) + '" alt="' + App.esc(s.name) + '">' +
            '<span class="store-city-badge">' + App.esc(s.city) + '</span>' +
          '</div>' +
          '<div class="store-detail-body">' +
            '<h3>' + App.esc(s.name) + '</h3>' +
            '<div class="store-line">' + App.icon('location') + '<span>' + App.esc(s.address) + '</span></div>' +
            '<div class="store-line phone">' + App.icon('phone') + '<span>' + App.esc(s.phone) + '</span></div>' +
            '<div class="store-line">' + App.icon('clock') + '<span>营业时间：' + App.esc(s.hours) + '</span></div>' +
            '<div class="store-tags">' + STORE_TAGS.map(function (t) {
              return '<span class="tag tag-line">' + t + '</span>';
            }).join('') + '</div>' +
            '<div class="store-actions">' +
              '<button class="btn btn-primary" data-book="">预约到店看车</button>' +
              '<button class="btn btn-outline" data-action="call">电话咨询</button>' +
              '<a class="btn btn-light" href="list.html?city=' + encodeURIComponent(s.city) + '">查看该城市车源</a>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('');
      App.bindLazyImages(listBox);
    }
    renderStores('全部');

    /* 4. 城市切换交互 */
    tabsBox.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-city]');
      if (!btn) return;
      App.qsa('.zone-tab', tabsBox).forEach(function (b) { b.classList.toggle('active', b === btn); });
      renderStores(btn.getAttribute('data-city'));
    });

    /* 5. 到店服务 */
    var services = [
      { icon: 'user', title: '专属顾问陪同', desc: '到店即安排 1 对 1 购车顾问，讲解车况、对比车源、协助议价。' },
      { icon: 'car', title: '免费试驾体验', desc: '心仪车辆可预约试驾，实地感受动力、底盘与车内空间表现。' },
      { icon: 'wallet', title: '现场金融方案', desc: '到店即可测算首付与月供，多种金融产品当场比对、快速审批。' },
      { icon: 'refresh', title: '旧车置换评估', desc: '旧车现场评估，评估价直接抵扣车款，一站式置换更省心。' }
    ];
    App.qs('#storeServices').innerHTML = services.map(function (s) {
      return '<div class="card service-card"><div class="service-icon">' + App.icon(s.icon) + '</div>' +
        '<h3>' + s.title + '</h3><p>' + s.desc + '</p></div>';
    }).join('');
  }

  /* =========================================================================
   * 二、平台检测保障 service.html
   * ====================================================================== */
  function initService() {
    var S = D.INSPECT_SUMMARY;

    /* 1. 检测结果总览 */
    App.qs('#svcInspectSummary').innerHTML =
      '<div class="inspect-stat"><div class="num">' + S.total + '</div><div class="label">检测项目总数</div></div>' +
      '<div class="inspect-stat"><div class="num green">' + S.pass + '</div><div class="label">检测合格项</div></div>' +
      '<div class="inspect-stat"><div class="num orange">' + S.minor + '</div><div class="label">轻微修复项</div></div>' +
      '<div class="inspect-stat"><div class="num green">' + S.fail + '</div><div class="label">重大故障项</div></div>';

    /* 2. 检测分组（可折叠，默认展开第一组） */
    App.qs('#svcInspectGroups').innerHTML = D.INSPECT_ITEMS.map(function (g, i) {
      return '<div class="inspect-group' + (i === 0 ? ' open' : '') + '">' +
        '<div class="inspect-group-head"><h4>' + App.esc(g.group) +
          ' <span class="tag tag-green">' + g.items.length + ' 项检测通过</span></h4>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
        '</div>' +
        '<div class="inspect-items">' + g.items.map(function (it) {
          var ok = it[1] === '正常' || it[1] === '无' || it[1] === '未弹开';
          return '<div class="inspect-item"><span>' + App.esc(it[0]) + '</span>' +
            '<span class="st ' + (ok ? 'ok' : 'minor') + '">' + App.esc(it[1]) + '</span></div>';
        }).join('') + '</div>' +
      '</div>';
    }).join('');

    /* 3. 检测分组折叠交互 */
    App.qs('#svcInspectGroups').addEventListener('click', function (e) {
      var head = e.target.closest('.inspect-group-head');
      if (head) head.parentElement.classList.toggle('open');
    });

    /* 4. 质保说明表 */
    var warrantyRows = [
      ['质保期限', '1 年'], ['质保里程', '20,000 公里'],
      ['覆盖部件', '发动机 / 变速箱 / 电控系统'], ['新能源三电', '含动力电池 / 电机 / 电控'],
      ['联保网点', '全国 300+ 服务网点'], ['质保方式', '随车转移，支持异地联保']
    ];
    App.qs('#svcWarrantyTable').innerHTML = warrantyRows.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span><span class="v">' + App.esc(r[1]) + '</span></div>';
    }).join('');

    /* 5. 质保服务卡片 */
    var warrantyCards = [
      { icon: 'shield', title: '核心部件质保', desc: '发动机、变速箱、电控系统核心部件因质量问题维修，费用全免。' },
      { icon: 'badge', title: '全国联保', desc: '300+ 服务网点异地联保，跨城市用车同样享受质保服务。' },
      { icon: 'refresh', title: '终身免费复检', desc: '交付后仍可随时到店享受免费复检，车况变化早发现早处理。' }
    ];
    App.qs('#svcWarrantyCards').innerHTML = warrantyCards.map(function (s) {
      return '<div class="card service-card"><div class="service-icon">' + App.icon(s.icon) + '</div>' +
        '<h3>' + s.title + '</h3><p>' + s.desc + '</p></div>';
    }).join('');

    /* 6. 金融方案表 */
    var financeRows = [
      ['最低首付', '1 成起（10%）'], ['贷款期限', '12 / 24 / 36 / 48 / 60 期'],
      ['年化利率', '4.8% 起（等额本息）'], ['审批时效', '最快 1 小时出结果'],
      ['申请条件', '年满 18 周岁，征信白户可申请'], ['支持车型', '全部在售车源（含新能源）']
    ];
    App.qs('#svcFinanceTable').innerHTML = financeRows.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span><span class="v">' + App.esc(r[1]) + '</span></div>';
    }).join('');

    /* 7. 服务流程 */
    App.qs('#svcProcess').innerHTML = D.PROCESS.map(function (p) {
      return '<div class="process-item"><div class="process-num">' + p.step + '</div>' +
        '<h4>' + App.esc(p.title) + '</h4><p>' + App.esc(p.desc) + '</p></div>';
    }).join('');

    /* 8. 购车服务保障 */
    App.qs('#svcServices').innerHTML = D.SERVICES.map(function (s) {
      return '<div class="card service-card"><div class="service-icon">' + App.icon(s.icon) + '</div>' +
        '<h3>' + App.esc(s.title) + '</h3><p>' + App.esc(s.desc) + '</p></div>';
    }).join('');

    /* 9. 锚点导航：滚动高亮 + 点击高亮 */
    var nav = App.qs('#svcNav');
    var links = App.qsa('.zone-tab', nav);
    var secs = ['inspect', 'warranty', 'finance', 'process'].map(function (id) { return document.getElementById(id); });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      links.forEach(function (l) { l.classList.toggle('active', l === a); });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (s) { if (s) io.observe(s); });
    }
  }

  /* =========================================================================
   * 三、购车指南 guide.html
   * ====================================================================== */
  function initGuide() {
    var listBox = App.qs('#guideList');
    var cats = ['全部'];
    D.NEWS.forEach(function (n) { if (cats.indexOf(n.cat) === -1) cats.push(n.cat); });

    /* 1. 分类筛选 */
    var tabsBox = App.qs('#guideTabs');
    tabsBox.innerHTML = cats.map(function (c, i) {
      return '<button class="zone-tab' + (i === 0 ? ' active' : '') + '" data-cat="' + App.esc(c) + '">' + App.esc(c) + '</button>';
    }).join('');

    /* 2. 资讯卡片列表 */
    function renderList(cat) {
      var list = cat === '全部' ? D.NEWS : D.NEWS.filter(function (n) { return n.cat === cat; });
      if (!list.length) { listBox.innerHTML = App.emptyHtml('该分类暂无内容', '试试切换其他分类'); return; }
      listBox.innerHTML = list.map(function (n) {
        return '<article class="card card-hover news-card">' +
          '<a href="javascript:;" class="news-thumb img-wrap" data-fake-link>' +
            '<img data-src="' + D.newsImage(n) + '" alt="' + App.esc(n.title) + '">' +
            '<span class="news-cat">' + App.esc(n.cat) + '</span>' +
          '</a>' +
          '<div class="news-body">' +
            '<h4><a href="javascript:;" data-fake-link>' + App.esc(n.title) + '</a></h4>' +
            '<p>' + App.esc(n.summary) + '</p>' +
            '<div class="news-foot"><span>' + App.esc(n.date) + '</span>' +
              '<span>' + App.icon('eye', '') + ' ' + n.views.toLocaleString('en-US') + ' 阅读</span></div>' +
          '</div>' +
        '</article>';
      }).join('');
      App.bindLazyImages(listBox);
    }
    renderList('全部');

    tabsBox.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cat]');
      if (!btn) return;
      App.qsa('.zone-tab', tabsBox).forEach(function (b) { b.classList.toggle('active', b === btn); });
      renderList(btn.getAttribute('data-cat'));
    });

    /* 3. 热门标签 */
    var tags = ['无事故', '准新车', '新能源二手车', '分期金融', '过户流程', '避坑指南', '代步车', '豪华车'];
    App.qs('#guideTags').innerHTML = tags.map(function (t) {
      return '<a class="tag tag-line" href="list.html?kw=' + encodeURIComponent(t) + '">' + App.esc(t) + '</a>';
    }).join('');

    /* 4. 热门推荐车源（优先热门车，取 4 台） */
    var hot = D.CARS.filter(function (c) { return c.hot; }).slice(0, 4);
    if (hot.length < 4) hot = D.CARS.slice(0, 4);
    var sideBox = App.qs('#guideSideCars');
    sideBox.innerHTML = hot.map(function (c) {
      return '<a class="side-car" href="detail.html?id=' + c.id + '">' +
        '<span class="side-car-thumb img-wrap"><img data-src="' + D.carImage(c) + '" alt="' + App.esc(c.name) + '"></span>' +
        '<span class="side-car-info">' +
          '<h5>' + App.esc(c.name) + '</h5>' +
          '<span class="text-muted" style="font-size:12px">' + c.year + ' 年 · ' + App.money1(c.mileage) + ' 万公里</span>' +
          '<span class="p">' + App.money(c.price) + '<em> 万</em></span>' +
        '</span>' +
      '</a>';
    }).join('');
    App.bindLazyImages(sideBox);
  }

  /* =========================================================================
   * 四、企业关于我们 about.html
   * ====================================================================== */
  function initAbout() {
    /* 1. 企业数据条 */
    var stats = [
      { num: '2015', unit: '年', label: '平台成立时间' },
      { num: '200', unit: '+', label: '覆盖城市' },
      { num: '60', unit: '万+', label: '累计服务用户' },
      { num: '2.1', unit: '万台', label: '在售严选车源' }
    ];
    App.qs('#aboutStats').innerHTML = stats.map(function (s) {
      return '<div class="about-stat"><div class="num">' + s.num + '<em>' + s.unit + '</em></div>' +
        '<div class="label">' + s.label + '</div></div>';
    }).join('');

    /* 2. 服务理念 */
    var values = [
      { icon: 'shield', title: '车况透明', desc: '259 项检测报告随车交付，每一项检测结果都可追溯、可复检，绝不隐瞒车况。' },
      { icon: 'badge', title: '售后无忧', desc: '一年或 2 万公里核心部件质保，7 天无理由退车，全国 300+ 网点联保。' },
      { icon: 'award', title: '专业可信', desc: '资深评估师团队 + 大数据定价模型，让每一台车的价格都真实合理。' }
    ];
    App.qs('#aboutValues').innerHTML = values.map(function (v) {
      return '<div class="about-value"><div class="ic">' + App.icon(v.icon) + '</div>' +
        '<h3>' + v.title + '</h3><p>' + v.desc + '</p></div>';
    }).join('');

    /* 3. 发展历程 */
    var timeline = [
      { yr: '2015 年', desc: '优车汇于北京成立，推出首个二手车在线严选平台。' },
      { yr: '2017 年', desc: '上线 259 项标准化检测体系，线下门店突破 30 城。' },
      { yr: '2019 年', desc: '完成 B 轮融资，推出一年或 2 万公里核心部件质保服务。' },
      { yr: '2021 年', desc: '全国服务网点突破 200 城，年交易量进入行业前列。' },
      { yr: '2023 年', desc: '上线新能源二手车电池健康度（SOH）检测，覆盖主流纯电车型。' },
      { yr: '2026 年', desc: '在售严选车源突破 2 万台，累计服务用户超 60 万。' }
    ];
    App.qs('#aboutTimeline').innerHTML = timeline.map(function (t) {
      return '<div class="timeline-item"><div class="yr">' + t.yr + '</div><p>' + t.desc + '</p></div>';
    }).join('');

    /* 4. 资质与荣誉 */
    var certs = [
      ['企业名称', '优车汇（北京）汽车服务有限公司'], ['成立时间', '2015 年 3 月'],
      ['二手车经营许可证', '京二手车经营备字第 2015-0886 号'], ['统一社会信用代码', '91110105MA0****L8X'],
      ['质量体系认证', 'ISO9001 服务质量体系认证'], ['行业身份', '全国二手车流通行业协会理事单位']
    ];
    App.qs('#aboutCerts').innerHTML = certs.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span><span class="v">' + App.esc(r[1]) + '</span></div>';
    }).join('');

    /* 5. 联系我们 */
    var contact = [
      ['客服热线', '400-800-1668'], ['服务时间', '09:00 - 21:00（全年无休）'],
      ['企业邮箱', 'service@ucarhub.com'], ['总部地址', '北京市朝阳区东四环中路 78 号优车汇汽车广场 A 座'],
      ['商务合作', 'bd@ucarhub.com'], ['媒体与投诉', 'press@ucarhub.com']
    ];
    App.qs('#aboutContact').innerHTML = contact.map(function (r) {
      return '<div class="param-cell"><span class="k">' + App.esc(r[0]) + '</span><span class="v">' + App.esc(r[1]) + '</span></div>';
    }).join('');
  }

  /* =========================================================================
   * 分派执行
   * ====================================================================== */
  var PAGES = { store: initStore, service: initService, guide: initGuide, about: initAbout };
  function init() { if (PAGES[page]) PAGES[page](); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
