/* =============================================================================
 * data.js —— 全站数据层（模拟真实二手车平台数据源）
 * -----------------------------------------------------------------------------
 * 模块说明：
 *   1) 固定种子随机数     —— 保证每次刷新车源数据完全一致（模拟真实数据库）
 *   2) 品牌 / 车系 / 车型库 —— 覆盖燃油、油电混动、插电混动、纯电，1万~80万
 *   3) 车源生成器          —— 依据车型指导价 + 车龄折旧 + 车况系数，生成 70+ 台车
 *   4) 门店 / 资讯 / 服务 / 检测项 / 政策 等静态业务数据
 *   5) 图片地址生成器      —— 统一使用文生图接口，动态生成与车源匹配的实拍图
 * 全局出口：window.AppData
 * ========================================================================== */
(function (global) {
  'use strict';

  /* =========================================================================
   * 1. 固定种子随机数（mulberry32）—— 数据稳定，避免每次刷新价格乱跳
   * ====================================================================== */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(20261011);
  function rand(min, max) { return min + rnd() * (max - min); }          // 区间随机小数
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }  // 区间随机整数
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }         // 随机取值

  /* =========================================================================
   * 2. 车型库（真实在售主流车型 + 厂商指导价，单位：万元）
   *    字段：b 品牌 / s 车系 / m 车型 / g 指导价 / f 燃料 / d 排量
   *          t 变速箱 / w 驱动 / c 级别（车身形式）
   * ====================================================================== */
  var MODEL_LIB = [
    /* ---------- 家用燃油 / 混动（合资） ---------- */
    { b: '丰田', s: '卡罗拉', m: '1.2T S-CVT 精英版', g: 12.98, f: '汽油', d: '1.2T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '丰田', s: '凯美瑞', m: '2.0G 豪华版', g: 19.98, f: '汽油', d: '2.0L', t: '自动', w: '前驱', c: '中型车' },
    { b: '丰田', s: 'RAV4荣放', m: '2.0L CVT 四驱风尚版', g: 21.68, f: '汽油', d: '2.0L', t: '自动', w: '四驱', c: 'SUV' },
    { b: '丰田', s: '汉兰达', m: '2.0T 四驱豪华版', g: 28.98, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '丰田', s: '亚洲龙', m: '2.0L 双擎豪华版', g: 22.98, f: '油电混动', d: '2.0L', t: '自动', w: '前驱', c: '中型车' },
    { b: '本田', s: '思域', m: '240TURBO 燃动版', g: 15.99, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '本田', s: '雅阁', m: '260TURBO 豪华版', g: 20.98, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: '中型车' },
    { b: '本田', s: 'CR-V', m: '240TURBO 两驱舒适版', g: 19.58, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '本田', s: '飞度', m: '1.5L CVT 潮跑版', g: 9.78, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '小型车' },
    { b: '大众', s: '朗逸', m: '1.5L 自动舒适版', g: 12.09, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '大众', s: '帕萨特', m: '330TSI 精英版', g: 21.19, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '中型车' },
    { b: '大众', s: '途观L', m: '330TSI 两驱豪华版', g: 23.68, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '大众', s: '迈腾', m: '380TSI 尊贵版', g: 25.19, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '中型车' },
    { b: '大众', s: '速腾', m: '280TSI DSG 豪华型', g: 16.19, f: '汽油', d: '1.4T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '大众', s: '宝来', m: '1.5L 自动精英型', g: 12.79, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '日产', s: '轩逸', m: '1.6L XL 智享版', g: 13.59, f: '汽油', d: '1.6L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '日产', s: '天籁', m: '2.0L 舒适版', g: 17.98, f: '汽油', d: '2.0L', t: '自动', w: '前驱', c: '中型车' },
    { b: '日产', s: '奇骏', m: '2.0L CVT 智享版', g: 19.98, f: '汽油', d: '2.0L', t: '自动', w: '前驱', c: 'SUV' },
    { b: '别克', s: '英朗', m: '1.5L 自动精英型', g: 11.99, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '别克', s: '君威', m: '552T 豪华型', g: 18.88, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '中型车' },
    { b: '别克', s: '昂科威', m: '652T 两驱豪华型', g: 21.99, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '福特', s: '蒙迪欧', m: 'EcoBoost 245 豪华型', g: 20.98, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '中型车' },
    { b: '福特', s: '锐界', m: '2.0T 四驱尊锐型', g: 26.98, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '马自达', s: '阿特兹', m: '2.5L 尊崇版', g: 20.98, f: '汽油', d: '2.5L', t: '自动', w: '前驱', c: '中型车' },
    { b: '现代', s: '伊兰特', m: '1.5L 尊贵版', g: 12.38, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '雪佛兰', s: '科鲁泽', m: '1.3T 自动悦享版', g: 10.99, f: '汽油', d: '1.3T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '起亚', s: 'K3', m: '1.5L 智享互联版', g: 11.68, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    /* ---------- 家用燃油（自主） ---------- */
    { b: '吉利', s: '星瑞', m: '2.0T 尊贵型', g: 13.97, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '吉利', s: '博越L', m: '1.5T 尊贵型', g: 14.97, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '吉利', s: '帝豪', m: '1.5L CVT 豪华型', g: 8.89, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '长安', s: 'CS75 PLUS', m: '1.5T 尊贵型', g: 13.99, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '长安', s: '逸动PLUS', m: '1.6L 尊贵型', g: 9.39, f: '汽油', d: '1.6L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '哈弗', s: 'H6', m: '1.5T 两驱 Max', g: 13.49, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '哈弗', s: '大狗', m: '1.5T 两驱追猎版', g: 13.29, f: '汽油', d: '1.5T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '奇瑞', s: '艾瑞泽8', m: '1.6T 尊贵型', g: 11.99, f: '汽油', d: '1.6T', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '奇瑞', s: '瑞虎8', m: '1.6T 尊享型', g: 13.99, f: '汽油', d: '1.6T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '荣威', s: 'i5', m: '1.5L 自动旗舰版', g: 9.99, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '名爵', s: 'MG5', m: '1.5L 自动豪华版', g: 9.98, f: '汽油', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    /* ---------- 新能源（纯电 / 插电混动 / 增程） ---------- */
    { b: '比亚迪', s: '秦PLUS', m: 'DM-i 55KM 尊贵型', g: 12.58, f: '插电混动', d: '1.5L', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '比亚迪', s: '宋PLUS', m: 'DM-i 110KM 旗舰型', g: 16.98, f: '插电混动', d: '1.5L', t: '自动', w: '前驱', c: 'SUV' },
    { b: '比亚迪', s: '汉EV', m: '605KM 尊享型', g: 26.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: '中型车' },
    { b: '比亚迪', s: '海豚', m: '401KM 自由版', g: 11.68, f: '纯电', d: '—', t: '自动', w: '前驱', c: '小型车' },
    { b: '比亚迪', s: '唐DM-i', m: '112KM 旗舰型', g: 22.98, f: '插电混动', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '比亚迪', s: '海豹', m: '550KM 后驱尊贵版', g: 22.28, f: '纯电', d: '—', t: '自动', w: '后驱', c: '中型车' },
    { b: '特斯拉', s: 'Model 3', m: '后轮驱动版', g: 25.99, f: '纯电', d: '—', t: '自动', w: '后驱', c: '中型车' },
    { b: '特斯拉', s: 'Model Y', m: '长续航全轮驱动版', g: 30.99, f: '纯电', d: '—', t: '自动', w: '四驱', c: 'SUV' },
    { b: '蔚来', s: 'ES6', m: '75kWh 运动版', g: 36.80, f: '纯电', d: '—', t: '自动', w: '四驱', c: 'SUV' },
    { b: '蔚来', s: 'ET5', m: '75kWh 标准续航', g: 29.80, f: '纯电', d: '—', t: '自动', w: '四驱', c: '中型车' },
    { b: '小鹏', s: 'P7', m: '480G 智享版', g: 23.99, f: '纯电', d: '—', t: '自动', w: '后驱', c: '中型车' },
    { b: '小鹏', s: 'G6', m: '580 长续航 Max', g: 24.99, f: '纯电', d: '—', t: '自动', w: '后驱', c: 'SUV' },
    { b: '理想', s: 'L7', m: 'Pro 增程版', g: 33.98, f: '插电混动', d: '1.5T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '理想', s: 'ONE', m: '增程六座版', g: 34.98, f: '插电混动', d: '1.2T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '极氪', s: '001', m: 'WE 版 100kWh', g: 30.00, f: '纯电', d: '—', t: '自动', w: '四驱', c: '中大型车' },
    { b: '广汽埃安', s: 'AION S Plus', m: '70 智享版', g: 15.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: '紧凑型车' },
    { b: '广汽埃安', s: 'AION Y Plus', m: '610 智享版', g: 14.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: 'SUV' },
    { b: '哪吒', s: 'U-II', m: '500 智享版', g: 13.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: 'SUV' },
    { b: '问界', s: 'M5', m: '增程四驱智驾版', g: 27.98, f: '插电混动', d: '1.5T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '腾势', s: 'D9', m: 'DM-i 尊享型', g: 33.98, f: '插电混动', d: '1.5T', t: '自动', w: '前驱', c: 'MPV' },
    { b: '五菱', s: '宏光MINIEV', m: '马卡龙 170KM', g: 4.68, f: '纯电', d: '—', t: '自动', w: '后驱', c: '微型车' },
    { b: '五菱', s: '缤果', m: '333KM 灵犀版', g: 7.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: '小型车' },
    { b: '欧拉', s: '好猫', m: '401KM 尊享版', g: 12.98, f: '纯电', d: '—', t: '自动', w: '前驱', c: '小型车' },
    { b: '深蓝', s: 'SL03', m: '200 增程版', g: 17.19, f: '插电混动', d: '1.5L', t: '自动', w: '后驱', c: '中型车' },
    { b: '零跑', s: 'C11', m: '增程 285 智享版', g: 18.58, f: '插电混动', d: '1.2T', t: '自动', w: '后驱', c: 'SUV' },
    /* ---------- 豪华品牌（二手车专区核心车源） ---------- */
    { b: '宝马', s: '3系', m: '325Li M运动套装', g: 36.39, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中型车' },
    { b: '宝马', s: '5系', m: '530Li 尊享型', g: 48.99, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中大型车' },
    { b: '宝马', s: 'X3', m: 'xDrive30i 尊享型', g: 43.98, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '奔驰', s: 'C级', m: 'C260L 运动版', g: 35.98, f: '汽油', d: '1.5T', t: '自动', w: '后驱', c: '中型车' },
    { b: '奔驰', s: 'E级', m: 'E300L 豪华型', g: 52.18, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中大型车' },
    { b: '奔驰', s: 'GLC', m: 'GLC260L 4MATIC', g: 44.98, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '奥迪', s: 'A4L', m: '40TFSI 豪华动感型', g: 34.38, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: '中型车' },
    { b: '奥迪', s: 'A6L', m: '45TFSI 臻选动感型', g: 45.98, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: '中大型车' },
    { b: '奥迪', s: 'Q5L', m: '45TFSI 豪华动感型', g: 42.68, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '雷克萨斯', s: 'ES', m: '260 卓越版', g: 38.90, f: '汽油', d: '2.5L', t: '自动', w: '前驱', c: '中大型车' },
    { b: '沃尔沃', s: 'XC60', m: 'B5 四驱智远豪华版', g: 40.99, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '凯迪拉克', s: 'CT5', m: '28T 豪华型', g: 29.97, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中型车' },
    { b: '保时捷', s: 'Macan', m: '2.0T 标准版', g: 58.80, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '保时捷', s: '718 Cayman', m: '2.0T 硬顶跑车', g: 64.80, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '跑车' },
    { b: '路虎', s: '揽胜极光L', m: 'P250 豪华版', g: 45.58, f: '汽油', d: '2.0T', t: '自动', w: '四驱', c: 'SUV' },
    { b: '英菲尼迪', s: 'Q50L', m: '2.0T 舒适版', g: 29.98, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中型车' },
    { b: '林肯', s: '冒险家', m: '2.0T 尊享版', g: 27.98, f: '汽油', d: '2.0T', t: '自动', w: '前驱', c: 'SUV' },
    { b: '捷豹', s: 'XEL', m: '2.0T 尊享版', g: 32.98, f: '汽油', d: '2.0T', t: '自动', w: '后驱', c: '中型车' },
    { b: '特斯拉', s: 'Model S', m: '长续航双电机版', g: 78.99, f: '纯电', d: '—', t: '自动', w: '四驱', c: '中大型车' },
    { b: '特斯拉', s: 'Model X', m: '双电机全轮驱动版', g: 86.99, f: '纯电', d: '—', t: '自动', w: '四驱', c: 'SUV' }
  ];

  /* 品牌视觉标识色（用于品牌快捷入口 / 列表品牌标） */
  var BRAND_META = {
    '丰田': '#EB0A1E', '本田': '#E40521', '大众': '#0B2F6B', '日产': '#C3002F', '别克': '#D40026',
    '福特': '#003478', '马自达': '#101820', '现代': '#002C5F', '雪佛兰': '#B58B00', '起亚': '#05141F',
    '吉利': '#1B4C9C', '长安': '#005BAC', '哈弗': '#B71C1C', '奇瑞': '#C8102E', '荣威': '#B22222',
    '名爵': '#C8102E', '比亚迪': '#C8102E', '特斯拉': '#CC0000', '蔚来': '#00A3AD', '小鹏': '#00B4A0',
    '理想': '#1F9CBE', '极氪': '#0A1F44', '广汽埃安': '#1B9E4B', '哪吒': '#E60012', '问界': '#0F2F5B',
    '腾势': '#1B4C9C', '五菱': '#C8102E', '欧拉': '#F2A0B5', '深蓝': '#0B1B3A', '零跑': '#1B9C8A',
    '宝马': '#0166B1', '奔驰': '#00A19B', '奥迪': '#BB0A30', '雷克萨斯': '#1A1A1A', '沃尔沃': '#003057',
    '凯迪拉克': '#8B0000', '保时捷': '#B12B28', '路虎': '#005A2B', '英菲尼迪': '#1E2B54', '林肯': '#1B1B1B',
    '捷豹': '#9E1B32'
  };

  /* 车源所在城市 + 线下门店（地址/电话为模拟数据） */
  var STORES = [
    { id: 'BJ01', city: '北京', name: '优车汇·北京朝阳旗舰店', address: '朝阳区东四环中路78号优车汇汽车广场A座', phone: '010-8572 6688', hours: '09:00-19:00（节假日无休）' },
    { id: 'SH01', city: '上海', name: '优车汇·上海浦东体验中心', address: '浦东新区川沙路5888号优车汇二手车城2号馆', phone: '021-5886 1668', hours: '09:00-19:00（节假日无休）' },
    { id: 'GZ01', city: '广州', name: '优车汇·广州天河交车中心', address: '天河区黄埔大道东668号汽车交易产业园C区', phone: '020-3877 1668', hours: '09:00-18:30' },
    { id: 'SZ01', city: '深圳', name: '优车汇·深圳龙华旗舰店', address: '龙华区民治大道1031号优车汇汽车生活广场', phone: '0755-8266 1668', hours: '09:00-19:00' },
    { id: 'HZ01', city: '杭州', name: '优车汇·杭州滨江交付中心', address: '滨江区江陵路1588号汽车产业园区B栋', phone: '0571-8677 1668', hours: '09:00-18:30' },
    { id: 'CD01', city: '成都', name: '优车汇·成都武侯体验店', address: '武侯区武兴路18号优车汇二手车交易中心', phone: '028-8511 1668', hours: '09:00-19:00' },
    { id: 'WH01', city: '武汉', name: '优车汇·武汉汉口旗舰店', address: '江汉区常青路128号汽车贸易园A区', phone: '027-8336 1668', hours: '09:00-18:30' },
    { id: 'XA01', city: '西安', name: '优车汇·西安雁塔交车中心', address: '雁塔区丈八东路88号优车汇汽车广场', phone: '029-8822 1668', hours: '09:00-18:30' },
    { id: 'NJ01', city: '南京', name: '优车汇·南京建邺体验中心', address: '建邺区江东中路288号汽车生活广场3号馆', phone: '025-8666 1668', hours: '09:00-19:00' },
    { id: 'CQ01', city: '重庆', name: '优车汇·重庆渝北旗舰店', address: '渝北区金开大道1001号优车汇二手车城', phone: '023-6788 1668', hours: '09:00-18:30' }
  ];

  var CITY_LIST = STORES.map(function (s) { return s.city; });
  var CITIES = CITY_LIST;

  /* 车身颜色池 */
  var COLORS = ['珍珠白', '曜岩黑', '星河灰', '深海蓝', '暮光银', '香槟金', '极地白', '天际蓝', '钛金灰', '曜石红'];

  /* 车况标签池（真实二手车平台常用标签） */
  var CONDITION_TAGS = [
    '无事故', '精品一手', '原厂质保', '准新车', '保养记录全', '原版原漆',
    '个人一手车', '4S店保养', '可置换', '支持全国联保', '绝无泡水', '车况精品'
  ];

  /* =========================================================================
   * 3. 车源生成器
   *    折旧模型：售价 = 指导价 × 0.885^车龄 × 车况系数，并限制在 1 万 ~ 80 万
   * ====================================================================== */
  var CURRENT_YEAR = 2026;
  var CARS = [];

  /* 贷款利率（年化）与默认分期方案，供详情页金融计算器使用 */
  var FINANCE = { rate: 0.048, defaultDown: 0.3, defaultYears: 3, maxYears: 5 };

  function round2(n) { return Math.round(n * 100) / 100; }

  /* 等额本息月供计算：P 贷款本金（万元），annualRate 年利率，years 年限 */
  function monthlyPayment(principalWan, annualRate, years) {
    var P = principalWan * 10000;
    var r = annualRate / 12;
    var n = years * 12;
    if (r === 0) return P / n / 10000;
    var m = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return m / 10000;
  }

  /* 依据车型生成一台车的完整档案 */
  function buildCar(model, seq) {
    var brand = model.b;
    var guide = model.g;

    /* 车龄：1 ~ 14 年（对应上牌年份 2012 ~ 2025），主打 3~8 年车源 */
    var age = rnd() < 0.45 ? randInt(1, 4) : randInt(2, 12);
    var year = CURRENT_YEAR - age;
    if (year < 2012) { year = 2012; age = CURRENT_YEAR - year; }

    /* 折旧 + 车况系数 */
    var depreciation = Math.pow(0.885, age);
    var conditionFactor = rand(0.9, 1.09);
    var price = guide * depreciation * conditionFactor;
    if (price < 1) price = rand(1, 1.9);           // 老车兜底：不低于 1 万
    if (price > 80) price = rand(70, 79.9);        // 上限控制：不超过 80 万
    price = round2(price);

    /* 里程：与车龄正相关，限制在 1 ~ 15 万公里 */
    var mileage = round2(Math.min(15, Math.max(1, age * rand(1.0, 1.5) + rand(-0.4, 0.6))));

    /* 过户次数：车龄越大过户概率越高 */
    var transfer = age <= 2 ? randInt(0, 1) : (rnd() < 0.6 ? randInt(0, 1) : randInt(1, 3));

    /* 质保：3 年内车源默认带原厂质保 */
    var warranty = age <= 3 || rnd() < 0.42;

    /* 上牌月份 / 车牌 / 年检 / 保险 */
    var regMonth = randInt(1, 12);
    var regDate = year + '-' + (regMonth < 10 ? '0' + regMonth : regMonth);
    var store = pick(STORES);
    var plate = store.city + 'A·' + String.fromCharCode(65 + randInt(0, 25)) + randInt(1000, 9999);

    /* 车况评分（60 ~ 99 分，车龄越小分越高） */
    var score = Math.min(99, Math.round(99 - age * 1.6 - mileage * 0.5 + rand(-4, 4)));

    /* 车况标签：按车龄/里程智能打标，保证真实感 */
    var tags = [];
    if (age <= 2) tags.push('准新车');
    if (mileage <= 4 && rnd() < 0.7) tags.push('精品一手');
    if (score >= 85) tags.push('无事故');
    if (warranty) tags.push('原厂质保');
    if (rnd() < 0.5) tags.push('保养记录全');
    if (rnd() < 0.35) tags.push('原版原漆');
    if (rnd() < 0.3) tags.push('个人一手车');
    if (transfer === 0) tags.push('精品一手');
    /* 去重 + 限制最多 4 个标签，保证卡片排版统一 */
    tags = tags.filter(function (t, i, a) { return a.indexOf(t) === i; }).slice(0, 4);
    if (tags.length < 2) tags.push(pick(CONDITION_TAGS));

    /* 上架时间：0 ~ 45 天前（用于“最新上架”排序） */
    var createdAt = randInt(0, 45);

    /* 科目分类：一辆车可同时出现在多个专区 */
    var sections = [];
    if (price <= 5) sections.push('万元代步车');
    if (model.f === '纯电' || model.f === '插电混动') sections.push('新能源二手车');
    if (price >= 30 || ['宝马', '奔驰', '奥迪', '保时捷', '路虎', '雷克萨斯', '沃尔沃', '捷豹', '英菲尼迪', '林肯', '凯迪拉克'].indexOf(brand) > -1) {
      if (price >= 18) sections.push('豪华车专区');
    }
    if (year >= 2023 && mileage <= 3.5) sections.push('精品准新车');
    if (!sections.length) sections.push('精品准新车');

    /* 金融方案：首付三成 / 36 期等额本息 */
    var firstPay = round2(price * FINANCE.defaultDown);
    var monthly = round2(monthlyPayment(price - firstPay, FINANCE.rate, FINANCE.defaultYears));

    return {
      id: 'UC' + (100000 + seq),
      brand: brand,
      series: model.s,
      model: model.m,
      name: brand + ' ' + model.s + ' ' + model.m,
      shortName: brand + ' ' + model.s,
      year: year,
      regDate: regDate,
      mileage: mileage,               // 表显里程（万公里）
      price: price,                   // 售价（万元）
      guide: guide,                   // 新车指导价（万元）
      fuel: model.f,
      disp: model.d,
      gear: model.t,
      drive: model.w,
      body: model.c,
      color: pick(COLORS),
      transfer: transfer,
      warranty: warranty,
      tags: tags,
      sections: sections,
      city: store.city,
      storeId: store.id,
      storeName: store.name,
      plate: plate,
      score: score,
      createdAt: createdAt,
      hot: false,
      firstPay: firstPay,
      monthly: monthly,
      inspectValid: (year + (age <= 6 ? 4 : 2)) + '-' + (regMonth < 10 ? '0' + regMonth : regMonth),
      insuranceLeft: randInt(1, 12) + ' 个月',
      /* 车辆档案补充（详情页档案参数表） */
      vin: 'LSV' + randInt(10000000, 99999999) + randInt(1000, 9999),
      seats: model.c === 'MPV' ? 7 : (model.c === '微型车' ? 4 : 5)
    };
  }

  /* 生成车源：每种车型生成 1 台；热门车型额外补 1 台，形成大量真实车源 */
  var HOT_MODELS = ['宝马 3系', '丰田 卡罗拉', '大众 帕萨特', '比亚迪 秦PLUS', '特斯拉 Model 3', '本田 思域', '吉利 星瑞', '奔驰 C级', '比亚迪 汉EV', '丰田 凯美瑞', '理想 L7', '五菱 宏光MINIEV', '奥迪 A4L', '日产 轩逸', '小鹏 P7', '长安 CS75 PLUS', '极氪 001', '本田 雅阁'];
  var seq = 1;
  MODEL_LIB.forEach(function (m) {
    CARS.push(buildCar(m, seq++));
    if (HOT_MODELS.indexOf(m.b + ' ' + m.s) > -1) CARS.push(buildCar(m, seq++));
  });
  /* 打热门标记（按“曝光度”随机，模拟平台推荐位） */
  CARS.forEach(function (c) { c.hot = rnd() < 0.32; });

  /* 按上架时间升序 → 便于首页「最新上架」直接截取 */
  CARS.sort(function (a, b) { return a.createdAt - b.createdAt; });

  /* ---- 品牌聚合（快捷筛选栏 / 列表品牌筛选使用） ---- */
  var BRAND_COUNT = {};
  CARS.forEach(function (c) { BRAND_COUNT[c.brand] = (BRAND_COUNT[c.brand] || 0) + 1; });
  var BRANDS = Object.keys(BRAND_COUNT).map(function (b) {
    return {
      name: b,
      count: BRAND_COUNT[b],
      color: BRAND_META[b] || '#0F3460',
      initial: b.charAt(0)
    };
  }).sort(function (a, b) { return b.count - a.count; });

  /* ---- 车系聚合（二级筛选：品牌 → 车系） ---- */
  var SERIES_MAP = {};
  CARS.forEach(function (c) {
    if (!SERIES_MAP[c.brand]) SERIES_MAP[c.brand] = {};
    SERIES_MAP[c.brand][c.series] = (SERIES_MAP[c.brand][c.series] || 0) + 1;
  });

  /* ---- 车型聚合（三级筛选：品牌+车系 → 车型） ---- */
  var MODEL_MAP = {};
  CARS.forEach(function (c) {
    var k = c.brand + '|' + c.series;
    if (!MODEL_MAP[k]) MODEL_MAP[k] = [];
    if (MODEL_MAP[k].indexOf(c.model) === -1) MODEL_MAP[k].push(c.model);
  });

  /* =========================================================================
   * 4. 业务静态数据：服务保障 / 购车流程 / 检测项 / 资讯 / 卖车优势
   * ====================================================================== */
  var SERVICES = [
    { key: 'inspect', icon: 'shield', title: '第三方权威检测', desc: '259 项专业检测，出具可追溯检测报告，事故、泡水、火烧车一律拒收，车况不符全额退车。' },
    { key: 'warranty', icon: 'badge', title: '一年或 2 万公里质保', desc: '发动机、变速箱、电控系统核心部件质保，全国 300+ 服务网点联保，异地用车同样无忧。' },
    { key: 'valuation', icon: 'gauge', title: '免费上门评估', desc: '资深评估师 2 小时响应上门，大数据定价模型，卖车价高于市场均价 8%，当场打款。' },
    { key: 'finance', icon: 'wallet', title: '低首付分期金融', desc: '最低首付 1 成，最长 60 期，审批快至 1 小时，支持征信白户，当天可提车。' }
  ];

  var PROCESS = [
    { step: '01', title: '在线选车', desc: '2 万台严选车源，多条件精准筛选，车况透明可查，线上锁定心仪车辆。' },
    { step: '02', title: '预约看车', desc: '线上预约到店或视频看车，专属顾问一对一陪同讲解，支持异地远程看车。' },
    { step: '03', title: '专业检测', desc: '现场调取 259 项检测报告，支持第三方复检，车况、手续、里程三码合一核验。' },
    { step: '04', title: '过户交付', desc: '代办过户、上牌、保险，7 天无理由退车，交付即享 1 年质保与终身免费复检。' }
  ];

  /* 第三方检测报告条目（详情页检测板块） */
  var INSPECT_ITEMS = [
    { group: '车身外观', items: [['左前翼子板', '正常'], ['右前车门', '正常'], ['后备厢盖', '正常'], ['前保险杠', '轻微修复'], ['漆面厚度', '正常']] },
    { group: '发动机舱', items: [['发动机总成', '正常'], ['机油状态', '正常'], ['冷却系统', '正常'], ['皮带轮系', '正常'], ['发动机舱线路', '正常']] },
    { group: '变速箱', items: [['变速箱总成', '正常'], ['换挡平顺性', '正常'], ['油底壳密封', '正常']] },
    { group: '底盘系统', items: [['转向系统', '正常'], ['悬挂系统', '正常'], ['制动系统', '正常'], ['轮胎磨损', '正常']] },
    { group: '电气系统', items: [['空调系统', '正常'], ['中控多媒体', '正常'], ['车窗升降', '正常'], ['灯光系统', '正常'], ['仪表故障码', '无']] },
    { group: '内饰与安全', items: [['座椅磨损', '正常'], ['安全带', '正常'], ['安全气囊', '未弹开'], ['车内异味', '无']] }
  ];
  var INSPECT_SUMMARY = { total: 259, pass: 257, minor: 2, fail: 0 };

  /* 资讯 / 购车攻略（首页资讯板块 + 购车指南页） */
  var NEWS = [
    { id: 'N01', cat: '购车攻略', title: '二手车怎么选？2026 年最全选车避坑清单', date: '2026-09-28', views: 18642, summary: '从车龄、里程、保值率三个维度拆解，教你用 10 分钟锁定一台高性价比二手车。' },
    { id: 'N02', cat: '避坑指南', title: '事故车、泡水车如何识别？9 个细节一看一个准', date: '2026-09-21', views: 23118, summary: '漆面厚度、螺丝拆装痕迹、车内异味……资深评估师教你肉眼识破问题车。' },
    { id: 'N03', cat: '购车攻略', title: '新能源二手车能不能买？电池衰减检测全解析', date: '2026-09-15', views: 15980, summary: '三电系统质保是否随车转移？电池健康度 SOH 怎么看？一文讲清新能源二手车。' },
    { id: 'N04', cat: '金融分期', title: '二手车分期怎么算最划算？首付比例与年限对比', date: '2026-09-08', views: 12076, summary: '首付 1 成 vs 3 成、36 期 vs 60 期，用真实利率拆解每种方案的月供与总成本。' },
    { id: 'N05', cat: '避坑指南', title: '过户手续全流程：从看车到上牌只跑一趟', date: '2026-08-30', views: 9842, summary: '所需资料清单、费用明细、异地过户注意事项，手把手教你完成二手车过户。' },
    { id: 'N06', cat: '购车攻略', title: '10 万以内预算，这 6 款代步车最值得入手', date: '2026-08-22', views: 21035, summary: '燃油、纯电、混动各推荐两款，兼顾油耗、空间与保值率，新手代步首选。' }
  ];

  /* 卖车页优势说明 */
  var SELL_ADVANTAGES = [
    { title: '1 对 1 免费估价', desc: '资深评估师根据车况大数据实时定价，价格透明不吃亏。' },
    { title: '2 小时上门验车', desc: '覆盖全国 200 城，最快 2 小时上门，无需到店等待。' },
    { title: '高于市场价 8%', desc: '平台直收 + 车主竞价双通道，成交价平均高于市场 8%。' },
    { title: '当场打款过户', desc: '签订合同后当场打款，全程代办过户，最快 1 天完成。' }
  ];

  /* 卖车页 - 车辆配置多选项 */
  var SELL_CONFIG_OPTIONS = ['无钥匙进入', '一键启动', '真皮座椅', '全景天窗', '360 全景影像', '自适应巡航', '座椅加热', '座椅通风', 'BOSE 音响', '抬头显示', '自动泊车', '并线辅助'];

  /* =========================================================================
   * 5. 图片生成器（统一走文生图接口，动态匹配车型/颜色，避免图不对车）
   * ====================================================================== */
  var IMG_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=';
  function buildImg(prompt, size) {
    return IMG_API + encodeURIComponent(prompt) + '&image_size=' + (size || 'landscape_4_3');
  }

  /* 车辆主图（列表卡片 / 详情主图） */
  function carImage(car) {
    return buildImg(
      'professional automotive photography of a clean used ' + car.color + ' ' + car.brand + ' ' + car.series +
      ' ' + car.model + ' ' + car.year + ', 3/4 front view, parked in a bright modern car showroom, glossy paint, ' +
      'soft studio lighting, sharp detail, realistic photo, no text',
      'landscape_4_3'
    );
  }

  /* 车辆多角度图集（详情页大图轮播，6 张） */
  function carImages(car) {
    var base = 'realistic photo of ' + car.color + ' ' + car.brand + ' ' + car.series + ' ' + car.year + ', ';
    return [
      carImage(car),
      buildImg(base + 'rear 3/4 view showing tail lights and rear bumper, clean showroom background, professional automotive photography, no text'),
      buildImg(base + 'interior dashboard and steering wheel with touchscreen, clean black leather seats, professional automotive interior photography, no text'),
      buildImg(base + 'rear passenger seats and door panel interior detail, clean leather upholstery, automotive interior photography, no text'),
      buildImg(base + 'engine bay compartment clean and well maintained, automotive detail photography, no text'),
      buildImg(base + 'front wheel rim and tire close up detail, alloy wheel, automotive detail photography, no text')
    ];
  }

  /* Banner / 资讯 / 门店等场景图 */
  function sceneImage(prompt, size) { return buildImg(prompt, size); }

  /* ---- 首页 Banner（3 张促销轮播） ---- */
  var BANNERS = [
    {
      id: 'B1', theme: 'promo', tag: '2026 金秋购车节',
      title: '严选二手车 直降 8000 元',
      desc: '2 万台第三方检测合格车源，车况透明 · 一年质保 · 7 天可退',
      btn: '立即抢购', link: 'list.html',
      image: sceneImage('wide banner of a modern used car dealership showroom with several premium cars, blue and white color scheme, bright clean commercial photography, no text', 'landscape_16_9')
    },
    {
      id: 'B2', theme: 'ev', tag: '新能源专场',
      title: '纯电二手车 电池健康度可查',
      desc: '三电质保随车转移，电池 SOH 检测报告随车交付，最低首付 1 成',
      btn: '看新能源车源', link: 'list.html?fuel=纯电',
      image: sceneImage('wide banner of white electric cars charging at a modern charging station, clean minimal blue tone commercial photography, no text', 'landscape_16_9')
    },
    {
      id: 'B3', theme: 'luxury', tag: '豪华车专区',
      title: '准新豪华车 立省 15 万起',
      desc: 'BBA 原厂质保车内车源，1 年 2 万公里官方质保，全国联保',
      btn: '进入豪华专区', link: 'list.html?sections=豪华车专区',
      image: sceneImage('wide banner of luxury german cars black and silver inside a premium showroom, elegant dark blue lighting, high end commercial photography, no text', 'landscape_16_9')
    }
  ];

  /* 资讯配图 */
  function newsImage(n) {
    return sceneImage('editorial cover photo for a used car article about ' + n.title + ', clean modern automotive lifestyle photography, blue tone, no text');
  }

  /* 门店配图 */
  function storeImage(s) {
    return sceneImage('exterior photo of a modern used car dealership building in ' + s.city + ' china, glass facade with cars on display, daytime, commercial photography, no text');
  }

  /* =========================================================================
   * 6. 对外出口
   * ====================================================================== */
  global.AppData = {
    /* 数据 */
    CARS: CARS,
    BRANDS: BRANDS,
    BRAND_META: BRAND_META,
    SERIES_MAP: SERIES_MAP,
    MODEL_MAP: MODEL_MAP,
    STORES: STORES,
    CITY_LIST: CITY_LIST,
    CITIES: CITY_LIST,
    COLORS: COLORS,
    CONDITION_TAGS: CONDITION_TAGS,
    SERVICES: SERVICES,
    PROCESS: PROCESS,
    INSPECT_ITEMS: INSPECT_ITEMS,
    INSPECT_SUMMARY: INSPECT_SUMMARY,
    NEWS: NEWS,
    BANNERS: BANNERS,
    SELL_ADVANTAGES: SELL_ADVANTAGES,
    SELL_CONFIG_OPTIONS: SELL_CONFIG_OPTIONS,
    FINANCE: FINANCE,
    SECTIONS: ['精品准新车', '万元代步车', '新能源二手车', '豪华车专区'],
    /* 工具方法 */
    carImage: carImage,
    carImages: carImages,
    newsImage: newsImage,
    storeImage: storeImage,
    sceneImage: sceneImage,
    monthlyPayment: monthlyPayment,
    getCarById: function (id) {
      for (var i = 0; i < CARS.length; i++) { if (CARS[i].id === id) return CARS[i]; }
      return null;
    },
    getStore: function (id) {
      for (var i = 0; i < STORES.length; i++) { if (STORES[i].id === id) return STORES[i]; }
      return STORES[0];
    }
  };
})(window);
