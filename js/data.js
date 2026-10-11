/* =============================================================================
 * data.js —— 全站数据层（模拟真实二手车平台数据源）
 * -----------------------------------------------------------------------------
 * 模块说明：
 *   1) 固定种子随机数     —— 保证每次刷新车源数据完全一致（模拟真实数据库）
 *   2) 品牌 / 车系 / 车型库 —— 覆盖燃油、油电混动、插电混动、纯电，1万~80万
 *   3) 车源生成器          —— 依据车型指导价 + 车龄折旧 + 车况系数，生成 70+ 台车
 *   4) 门店 / 资讯 / 服务 / 检测项 / 政策 等静态业务数据
 *   5) 图片地址           —— 车型专属实拍图（按「品牌+车系」精确匹配）+ 通用平台配图；
 *                           门店配图为项目内本地图片（1.png ~ 10.png），与门店信息一一对应
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
   * 5. 图片地址（全部使用公开在线实拍汽车图片，无文生图 / 无 AI 配图）
   *    - 车源图：CAR_IMGS 按「品牌|车系」绑定该车型专属实拍图，图与文字车型一一对应
   *    - 通用图：Unsplash / Pexels 公开图库，用于首页 Banner / 资讯 / 门店等非车源位
   *    - 全部为 https 直链，本地打开与线上部署均可正常加载
   * ====================================================================== */
  var UNSPLASH = 'https://images.unsplash.com/photo-';
  var PEXELS = 'https://images.pexels.com/photos/';

  /* 精选实拍汽车图库：u: = Unsplash，p: = Pexels（外观为主，含夜色 / 展厅 / 细节图） */
  var PHOTOS = [
    'u:1503376780353-7e6692767b70', // 夜间轿跑
    'u:1552519507-da3b142c6e3d',    // 蓝色运动轿跑
    'u:1494976388531-d1058494cdd8', // 肌肉跑车前脸
    'u:1541899481282-d53bffe3c35d', // 蓝色轿车
    'u:1549317661-bd32c8ce0db2',    // 都市小型车
    'u:1550355291-bbee04a92027',    // 红色轿车
    'u:1502877338535-766e1452684a', // 展厅蓝色轿跑
    'u:1533473359331-0135ef1b58bf', // 白色 SUV
    'u:1568605117036-5fe5e7bab0b7', // 公路行驶
    'u:1583121274602-3e2820c69888', // 展厅红色跑车
    'u:1492144534655-ae79c964c9d7', // 展厅多车
    'u:1511919884226-fd3cad34687c', // 黄色超跑
    'u:1503736334956-4c8f8e92946d', // 橙色跑车
    'u:1542282088-fe8426682b8f',    // 车灯细节
    'u:1553440569-bcc63803a83d',    // 公路红色轿车
    'u:1517672651691-24622a91b550', // 夜景红色小车
    'u:1580273916550-e323be2ae537', // 灰色豪华轿跑
    'u:1526726538690-5cbf956ae2fd', // 展厅经典车
    'u:1502161254066-6c74afbf07aa', // 深红肌肉车
    'u:1544829099-b9a0c07fad1a',    // 白色超跑
    'u:1605559424843-9e4c228bf1c2', // 黄色运动车
    'u:1617531653332-bd46c24f2068', // 红色性能车
    'u:1580414057403-c5f451f30e1c', // 白色跑车
    'u:1621007947382-bb3c3994e3fb', // 银色豪华车
    'p:170811',                     // 蓝色宝马
    'p:116675',                     // 白色 SUV
    'p:120049',                     // 蓝色奔驰
    'p:112460',                     // 黑色奔驰
    'p:210019',                     // 红色跑车
    'p:1149137'                     // 越野 SUV
  ];

  /* 车型专属实拍图库：key = "品牌|车系"，value = 该车型同车实拍图（列表主图取第 1 张，详情轮播取前 6 张） */
  var CAR_IMGS = {
    "比亚迪|秦PLUS": ["https://auto5.sinaimg.cn/autoimg/car/77/89/132198977_950.jpg","https://auto3.sinaimg.cn/autoimg/car/57/41/131894157_950.jpg","https://img2.bitautoimg.com/autoalbum/files/20230512/40/202305123647386212004085773_10660137_6.jpg","https://car3.autoimg.cn/cardfs/product/g26/M00/7A/CC/autohomecar__ChtlxWTHESeAexzUABBoYnc0vLk488.jpg","https://car3.autoimg.cn/cardfs/product/g31/M04/15/4F/autohomecar__ChtlyGewoRqAFw5PACNBkDoR32A721.jpg","https://car3.autoimg.cn/cardfs/product/g31/M09/6E/F2/autohomecar__ChxoHWfTDUeAF1c0ACh3UF-03h8140.jpg"],
    "小鹏|P7": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/13/c17/463268471_1731480381011.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2410/10/c8/454887748_1728525560040.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/03/c16/550574030_1756881916313.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/25/c3/466419151_1732506005993.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2407/10/c33/432733157_1720594742344.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2603/24/c50/647861647_1774341304465.jpg"],
    "五菱|宏光MINIEV": ["https://auto1.sinaimg.cn/autoimg/car/87/58/131555887_src.JPG","https://auto2.sinaimg.cn/autoimg/car/50/36/132093650_950.jpg","https://2d.zol-img.com.cn/product/261_800x600/937/ce8NxRkgV2kI.jpg","https://car2.autoimg.cn/cardfs/product/g32/M02/F7/D5/1400x1050_autohomecar__ChxkPmduUomAZyA6ADFsccTD4Do351.jpg","https://2e.zol-img.com.cn/product/271_800x600/962/cedF2FXTXl2q.jpg","https://car3.autoimg.cn/cardfs/product/g30/M09/C4/87/autohomecar__CjIFU2dydFaAWbm1ACTDbjJeHeA221.jpg"],
    "大众|途观L": ["https://auto2.sinaimg.cn/autoimg/car/32/14/132161432_950.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/08/c10/577651299_1765176003313.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2508/20/c13/547013943_1755680463652.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/27/c11/414480717_1711520866454.jpg","https://image.bitautoimg.com/appimage-1267-w1/mapi/news/2024/04/13/e102a08830e04ac79fd8fe4c781e134d.jpeg","https://www2.autoimg.cn/chejiahaodfs/g8/M15/AB/60/autohomecar__ChsEwGEGSuWAeLzOAAP1aLG3K5k928.png"],
    "特斯拉|Model 3": ["https://n.sinaimg.cn/sinakd20230913s/333/w680h453/20230913/a2a3-4fb2a4224ac01de78290833c0af0c87d.png","https://n.sinaimg.cn/sinakd20210111ac/400/w1200h800/20210111/f1a2-khmynua4079971.jpg","https://n.sinaimg.cn/sinakd20230901ac/600/w800h600/20230901/0909-f26819719c4db09e13e3acfff007b61d.jpg","https://image.bitautoimg.com/appimage-800-w1/news/2023/09/01/d59af355-9df9-40f9-afc1-f9b7c73385ef.jpg","https://www2.autoimg.cn/chejiahaodfs/g28/M02/C6/91/autohomecar__ChsEfWAJU_-ASPLtAANtXcYEjPU972.jpg","https://s3.xchuxing.com/xchuxing/article/2022/08/16/11a5f202208161718058441.jpeg"],
    "奔驰|C级": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/09/c54/446127711_1725878679767.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/01/c19/575789673_1764559452855.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/30/c32/452543734_1727664474149.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/01/c22/575796347_1764560825679.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/01/c6/575698637_1764556296719.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/30/c32/452543732_1727664458217.jpg"],
    "保时捷|Macan": ["https://x0.ifengimg.com/res/2022/F94B99A9453E2D60DB8BB2569B6964D51F6828BC_size187_w1200_h800.jpg","https://x0.ifengimg.com/res/2022/2C0FA3B56A530263F6552E67D37B39C3C6ACC6D2_size232_w1200_h800.jpg","https://p0.ifengimg.com/pmop/2018/0810/E3529D5852E2B933983766AFD3C675F615FEAF71_size53_w550_h560.jpeg","https://x0.ifengimg.com/res/2022/15C27BA712DD45CAFB619C181D0004DE561A68C0_size212_w1200_h800.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M02/DA/AE/autohomecar__Chtk3WDJmQiAbu-cAAbj83SZrwQ552.png","https://car2.autoimg.cn/cardfs/product/g26/M02/36/8E/autohomecar__ChcCP1tZNM6AIcZZAAYOaSOdXyQ839.jpg"],
    "丰田|凯美瑞": ["https://n.sinaimg.cn/sinakd10017/395/w1197h798/20221124/4577-7f04e83347995877490b77f083f5f504.jpg","https://n.sinaimg.cn/sinakd20231208s/320/w640h480/20231208/6f75-7506131b846f8ce2448750e63f27c10a.jpg","https://doc-fd.zol-img.com.cn/t_s2000x2000/g7/M00/0F/00/ChMkK2agtl2IDMZVAANW-RXUcx8AAg8wgDe2REAA1cR008.jpg","https://car2.autoimg.cn/cardfs/product/g32/M0B/03/3B/autohomecar__Chtk2WdWoAmAC8LDADoYcpgz2yI174.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t019090cc8a83bd826f.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M02/9B/13/autohomecar__Chtk3WPJQNaAXSbVABADDShQly8982.png"],
    "宝马|X3": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/16/c21/525586919_1750059264901.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/1903/04/c11/135701413_1551680870968.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2601/28/c29/601956969_1769594177712.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/07/c43/655501579_1775534987811.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2601/24/c3/599134915_1769264339456.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/07/c43/655501593_1775534988811.jpg"],
    "哈弗|H6": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/04/c19/520825725_1749026052445.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2303/27/c34/356193240_1679890822880.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/04/c19/520825727_1749026055550.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/11/c14/446734992_1726029295503.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/04/c20/520825742_1749026058258.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2210/24/c28/338898298_1666591719529.jpg"],
    "奇瑞|艾瑞泽8": ["https://n.sinaimg.cn/sinakd10013/600/w1920h1080/20220826/569e-72e3b7ce859646d627207cea65dcaf3e.jpg","https://car3.autoimg.cn/cardfs/product/g31/M00/B1/DB/autohomecar__ChxoHme4CweAbaDvABPDxBL1zgY794.jpg","https://car3.autoimg.cn/cardfs/product/g31/M07/8A/53/autohomecar__ChtlyGfJmYKAbRbYADCtuex-tsE968.jpg","https://ugc-img.ifengimg.com/img/2022/8/28/8IpSmSgVkM4/61cce33e-1379-417b-be4c-786736e31d3d_w1897_h1264.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/02/c0/486449513_1740886626589.png","https://img3.bitautoimg.com/autoalbum/files/20250610/464/202506102118952674046494314_13030146_6.jpg"],
    "奇瑞|瑞虎8": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/20/c39/449386865_1726822028870_1024.jpg","https://car2.autoimg.cn/cardfs/product/g32/M09/8B/22/autohomecar__ChxkPWb3qQ-AJv_UACaym7MiD60274.jpg","https://2a.zol-img.com.cn/product/269_800x600/628/cekHIwzM19MNo.jpg","https://n.sinaimg.cn/sinakd10013/0/w2048h1152/20231112/1030-45076447e3d3c7e06806716d51bb00ed.jpg","https://car2.autoimg.cn/cardfs/product/g31/M07/75/F5/autohomecar__ChxoHmg5ZKaAGmC7AC6ihDe-L9Y681.jpg","https://doc-fd.zol-img.com.cn/t_s2000x2000/g7/M00/04/0B/ChMkLGZsLBiIJ3eBAAMxSlUEy1MAAfTngCN6C8AAzFi364.jpg"],
    "丰田|卡罗拉": ["https://n.sinaimg.cn/sinakd10013/400/w1280h720/20230131/e3c1-469b4f5c927e535f04916fbdc081a9f9.jpg","https://e0.ifengimg.com/01/2019/0711/24754239F7E3AAF8F07220A01309D3E184421BA7_size67_w1009_h722.jpeg","https://car2.autoimg.cn/cardfs/product/g33/M00/06/9A/autohomecar__Chto52lDmb6Aas5HAD58PaOGYv0304.jpg","https://ugc-img.ifengimg.com/img/2022/2/17/8DgnuqbwiU5/5b857879-902d-4d54-a888-5afc04a10812_w900_h600.jpeg","https://img2.bitautoimg.com/autoalbum/files/20220720/119/20220720425_9850901_3.jpg","https://cjh2.autoimg.cn/cjh2.autoimg.cn/chejiahaodfs/g31/M06/23/4D/630x0_q100_autohomecar__ChxoHWd3gmWAICh4AAHfaYHi9GE158.jpg?x_image_process=text/5pmT55Sf6K-06L2m/fontSize/12"],
    "别克|英朗": ["https://n.sinaimg.cn/sinacn/20171107/a7d2-fynnnsc9079456.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2011/25/c6/242302798_1606267283338_400x300.jpg","https://e0.ifengimg.com/10/2019/0615/C4B284806918809A051395AF4C5E897F19FB7731_size167_w640_h459.jpeg","https://www2.autoimg.cn/chejiahaodfs/g30/M01/7A/3C/autohomecar__ChwFlGIvTPuAENOyAHkA0UGZkfA287.jpg","https://www2.autoimg.cn/youchuang/g28/M03/48/87/autohomecar__ChsEfVy9dSyAALTVACNF5CHOU_4267.jpg","https://www2.autoimg.cn/chejiahaodfs/g27/M0B/A2/5F/autohomecar__ChxkmWGE20yAZgfdABWwvPf9tRY948.jpg"],
    "福特|蒙迪欧": ["https://n.sinaimg.cn/www/585/w1706h1279/20251120/0933-3c4bc8f0d23a3c27b8b4f2971e40de9e.jpg","https://n.sinaimg.cn/sinakd20210801s/390/w680h510/20210801/9bec-1293f94c3e0d308f6ffd8e7339c84bb8.jpg","https://n.sinaimg.cn/sinacn20122/213/w2048h1365/20190102/2bde-hqzxptn7749863.jpg","https://e0.ifengimg.com/11/2019/0614/B191776A8CF84BFDE530CA97F55299C9775581FA_size83_w640_h480.jpeg","https://n.sinaimg.cn/sinakd20116/432/w1200h832/20251123/aa53-abb8d86ab231559c7b0aef1343e5342c.jpg","https://www2.autoimg.cn/chejiahaodfs/g30/M06/D5/98/autohomecar__ChxknGInM5aAUsIoAAY1NY-IQnk551.jpg"],
    "极氪|001": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2301/03/c43/346866820_1672730570970.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2408/14/c19/438941014_1723612363706.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/03/c13/559374043_1759502431072.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/03/c0/559369400_1759500163324.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/03/c13/559374045_1759502435900.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/03/c0/559368061_1759500159613.jpg"],
    "林肯|冒险家": ["https://n.sinaimg.cn/sinakd20230913s/266/w640h426/20230913/fa7d-c52b638a1512889baddd84fbd0ced7f2.jpg","https://www2.autoimg.cn/chejiahaodfs/g27/M06/7B/3F/autohomecar__ChxkmWMf7DaAdkK_AAIx45IAG0M489.jpg","https://n.sinaimg.cn/sinakd10020/92/w1495h997/20200921/334c-izmihnt9969734.jpg","https://www2.autoimg.cn/chejiahaodfs/g27/M01/A9/A8/autohomecar__ChsEfF-9tjKAZFfjAApxpJZmrI0111.jpg","https://k.sinaimg.cn/n/sinakd20120/107/w1024h683/20230628/26b3-47201ff4b723bfeeaf61667d34188df7.jpg/w700d1q75cms.jpg","https://image.bitautoimg.com/appimage-1200-w1/mapi/news/2023/04/16/779311dcaf63485f8cc30ac2193d0dd6.jpeg"],
    "长安|CS75 PLUS": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/24/c25/565299969_1761288155266.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/06/c25/568731721_1762403089262.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/28/c48/669060410_1777368545071.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/24/c25/565300092_1761288152214.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/24/c25/565300082_1761288151823.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/17/c24/538463311_1752731836907.jpg"],
    "腾势|D9": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2508/29/c33/549392242_1756434697897.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2412/23/c7/470644080_1734922128365.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/06/c20/410062604_1709692860780.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/02/c36/550371390_1756800126551.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/25/c24/414089627_1711351051290.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2412/20/c5/470273212_1734689361392.jpg"],
    "奥迪|A4L": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2112/23/c0/288247996_1640223884183.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/20/c25/491482348_1742450284600.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/13/c3/524089199_1749778822068.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/13/c3/524089222_1749778825412.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/20/c25/491482088_1742450285700.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2305/12/c36/363110326_1683882265998.jpg"],
    "零跑|C11": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/01/c13/532505607_1751362296747.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/01/c15/532518101_1751365149794.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2406/05/c8/426701090_1717552248364.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/24/c0/424602183_1716514775660.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2508/11/c17/544522636_1754892895262.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2302/06/c48/349656790_1675696848600.jpg"],
    "保时捷|718 Cayman": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2307/16/c2/371250180_1689517702279.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2307/16/c2/371250181_1689517705191.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2206/14/c21/318823090_1655194967086.jpg","https://www2.autoimg.cn/youchuang/g1/M00/47/21/autohomecar__ChsEj1zyZFKAKINvAAkQvj1BKt0154.JPG","https://www2.autoimg.cn/youchuang/g2/M00/1C/2B/autohomecar__ChcCRFzyZTWAXLHRAAYwZlzvlcw220.JPG","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2307/16/c2/371251303_1689517704828.jpg"],
    "本田|CR-V": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/10/c36/561446266_1760091535930.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/10/c25/561442640_1760087134665.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2210/26/c24/339151591_1666758243931.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/1707/13/c8/52616888_1499914616871.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/12/c33/570419134_1762929478321.jpg","https://img3.autoimg.cn/chejiahaodfs/g33/M0A/58/D8/ChxpVmmnFZuAFPJOAALsAEa-QaM482.jpg"],
    "英菲尼迪|Q50L": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2203/17/c27/302583212_1647505135663.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2203/30/c58/304925072_1648633811229.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2203/17/c27/302583235_1647505140836.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2203/30/c58/304924801_1648633803476.jpeg","https://p0.ifengimg.com/pmop/2018/0212/548D83382BFD67075557BCBAF440A2865CA9C31B_size80_w1000_h750.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2204/12/c10/306875968_1649734099417.jpeg"],
    "丰田|亚洲龙": ["https://n.sinaimg.cn/sinacn20191003ac/50/w1400h1050/20191003/29cb-ifmectk8066761.png","https://image.bitautoimg.com/appimage-844-w1/mapi/media/2020/08/04/0b5d6ce863e648f58f83531f653285df.jpeg","https://img2.bitautoimg.com/autoalbum/files/20230430/334/202304301003283251433486457_10626741_6.jpg","https://car2.autoimg.cn/cardfs/product/g32/M06/DB/4F/autohomecar__Chtk2WbumKCADqkjADYjPEhXNww447.jpg","https://car2.autoimg.cn/cardfs/product/g32/M03/7F/4E/1400x1050_autohomecar__ChxkPmc5jyqAUpqLAB92zTQYE28238.jpg","https://car3.autoimg.cn/cardfs/product/g32/M08/3E/DC/autohomecar__Chtk2WbIosGAEYCdAENxWh2fwMw763.jpg"],
    "理想|L7": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/01/c0/409275728_1709260569875.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/01/c30/409332415_1709282191390.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/01/c0/409275727_1709260565934.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2505/26/c66/517343938_1748246415440.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2505/16/c51/514024603_1747383318370.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/06/c37/410091470_1709707968433.jpg"],
    "宝马|5系": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2402/27/c10/408745527_1709004646953.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/23/c46/556128866_1758613783277.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/31/c41/583589124_1767173497919.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2302/13/c32/350280946_1676258375283.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/15/c32/554036672_1757943618876.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/07/c63/410261795_1709792876424.jpg"],
    "名爵|MG5": ["https://n.sinaimg.cn/sinakd10012/0/w2048h1152/20240923/252e-e5920d33bec4f4f91c7f9ff212d001e7.jpg","https://image.bitautoimg.com/appimage-982-w1/mapi/news/2023/07/03/66313d258f514a2ab908b95839f13950.png","https://n.sinaimg.cn/sinakd20201105ac/486/w1280h806/20201105/4f48-kcpxnwv5649863.jpg","https://img2.bitautoimg.com/bitauto/2022/03/03/2dacbb24-3897-4bfb-a13e-035f5e151504_630_w1.jpg","https://www2.autoimg.cn/chejiahaodfs/g26/M06/D5/3F/autohomecar__ChtlxWhaF06AWF6MAAy40pm-RvI012.png","https://doc-fd.zol-img.com.cn/t_s2000x2000/g7/M00/08/02/ChMkLGbV-MuIcLuuAAOqOZ-HKaAAAihEQP7BEoAA6pR275.png"],
    "特斯拉|Model S": ["https://www.sinaimg.cn/qc/autoimg/car/23/73/129617323_src.JPG","https://www.sinaimg.cn/qc/autoimg/car/22/73/129617322_src.JPG","https://www.sinaimg.cn/qc/autoimg/car/21/73/129617321_src.JPG","https://p0.ifengimg.com/2019_12/88ED177E3EBC436FC5E2D393EF69623E2F6E28C9_w1269_h714.jpg","https://n.sinaimg.cn/sinakd20210708ac/0/w2048h1152/20210708/0a33-7c7cdd9f509522e01ef38cc9dd1a366c.jpg","https://www.sinaimg.cn/qc/autoimg/car/20/73/129617320_src.JPG"],
    "别克|昂科威": ["https://auto1.sinaimg.cn/autoimg/car/87/51/132165187_950.jpg","https://p0.ifengimg.com/pmop/2017/1207/3C81066A803F859F96C1CFCC5BE84415CADB62B9_size99_w629_h509.jpeg","https://n.sinaimg.cn/sinakd2021711s/390/w680h510/20210711/3b53-ksmehzt2128489.jpg","https://img0.pcauto.com.cn/pcauto/1408/29/5037319_dsc_0933.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M09/DB/F7/autohomecar__Chtk3WC-3MWAWg39AB3Po1RAMfc711.png","https://img4.bitautoimg.com/autoalbum/files/20230110/946/202301101138333007194612000_10294723_6.jpg"],
    "凯迪拉克|CT5": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2304/24/c36/361851294_1682309731320.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2502/18/c14/482941380_1739875501214.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2401/29/c16/404578139_1706511895167.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2401/29/c16/404579274_1706511899389.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/20/c44/527300655_1750404541866.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/14/c18/411529527_1710386058295.jpg"],
    "本田|思域": ["https://www2.autoimg.cn/chejiahaodfs/g25/M05/01/D6/autohomecar__ChtliGOqtraAFkQgABp1qQ-hOPQ375.jpg","https://www2.autoimg.cn/chejiahaodfs/g30/M01/2E/75/autohomecar__ChwFlGLL8PGAFYZsAAS6ApkUvnY984.png","https://img4.bitautoimg.com/autoalbum/files/20221202/341/202212023100_10202987_6.jpg","https://img1.xcarimg.com/b163/s15377/20221003211811925782868410754.jpg","https://image.bitautoimg.com/appimage-1265-w1/mapi/media/2022/09/05/9112ecce0e8c41c98bba1f2978f49f3b.jpeg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t01caa49e5ae516e79b.jpg"],
    "吉利|星瑞": ["https://n.sinaimg.cn/auto/transform/355/w660h495/20251208/57b1-21f271b1c594587c52cee5ad534a2c0e.jpg","https://n.sinaimg.cn/sinakd20201013ac/200/w1080h720/20201013/e6d7-kakmcxe3740104.jpg","https://car3.autoimg.cn/cardfs/product/g32/M02/C6/2B/autohomecar__Chtk2WcJO3uAcc8jAEciMg_N1xs027.jpg","https://n.sinaimg.cn/auto/transform/354/w660h494/20240421/88d8-3b3ff6ae722987b6d3681bc8ae79fa22.jpg","https://x0.ifengimg.com/ucms/2022_30/FB44D2D8EB905C6C702D6340759DAF9AE023A0AC_size673_w1500_h1000.jpg","https://auto1.sinaimg.cn/autoimg/car/65/82/131568265_src.JPG"],
    "吉利|博越L": ["https://car3.autoimg.cn/cardfs/product/g26/M07/85/A8/1400x1050_autohomecar__ChxkjmgO7zKAZzgmACKdwtwuu4c728.jpg","https://car2.autoimg.cn/cardfs/product/g27/M06/DC/D9/1400x1050_autohomecar__ChxkmWgKAnKAHuP6ABoBIgoeEgA778.jpg","https://car2.autoimg.cn/cardfs/product/g32/M03/B6/03/autohomecar__ChxkPmf2RO-AeHjbABKAbLa9MXg077.jpg","https://2c.zol-img.com.cn/product/263_800x600/490/ceXDlhUvEP7E.jpg","https://car2.autoimg.cn/cardfs/product/g32/M0A/02/FC/1400x1050_autohomecar__Chtk2WgKAlmAYBoEAB3vZ1HZjT4933.jpg","https://car2.autoimg.cn/cardfs/product/g32/M01/B5/CC/1400x1050_autohomecar__Chtk2Wf2N52AFVdsAC54ZsTIv7Q722.jpg"],
    "比亚迪|汉EV": ["https://n.sinaimg.cn/sinakd20201001ac/384/w2048h1536/20201001/9d62-izwfpyt2002669.jpg","https://n.sinaimg.cn/sinakd20201001ac/384/w2048h1536/20201001/d435-izwfpyt2002689.jpg","https://n.sinaimg.cn/sinakd20117/762/w1000h562/20220806/eb83-7df36c9d8ef5ab6dee204cd8b7c5b8c1.jpg","https://n.sinaimg.cn/sinakd20122/650/w900h1350/20230328/3a3f-ac6c53b44ba94232465002ac03bc3f27.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2305/11/c23/363040904_1683779686883_1024.jpg","https://n.sinaimg.cn/sinakd20201001ac/496/w745h551/20201001/9822-izwfpyt2002608.png"],
    "蔚来|ET5": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2505/22/c11/516072379_1747915080861.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2505/21/c31/515700277_1747816206172.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c7/652673417_1775094148379.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2505/22/c11/516072372_1747915060382.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c7/652673408_1775094145225.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/28/c11/425294216_1716862644363.jpg"],
    "大众|速腾": ["https://img.pcauto.com.cn/images/ttauto/2025/06/14/7515457622406677011/cover/241f8ecab5114758b65891cbcf449952tplvresize00.png","https://www2.autoimg.cn/chejiahaodfs/g27/M03/A1/43/autohomecar__ChwFkWGKKt6AO_4KAALI0iw2Vpc859.jpg","https://n.sinaimg.cn/sinacn/20171113/e127-fynstfh7707700.jpg","https://n.sinaimg.cn/sinacn/20171113/8a50-fynstfh7708109.jpg","https://n.sinaimg.cn/sinakd20200928ac/295/w640h455/20200928/4185-izrvxmh7142549.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2504/28/c0/507658889_1745803770405.jpg"],
    "日产|奇骏": ["https://x0.ifengimg.com/ucms/2020_34/29D2A26378AA5F3DD864CF9A14C57406E457896E_w1200_h800.jpg","https://n.sinaimg.cn/sinacn16/213/w2048h1365/20180824/7e76-hicsiaw4493424.jpg","https://n.sinaimg.cn/sinakd10015/600/w1920h1080/20210219/eb67-kkciesr5626373.jpg","https://n.sinaimg.cn/sinakd20210419ac/377/w1000h1777/20210419/fbde-knvsnuh4928818.jpg","https://www2.autoimg.cn/chejiahaodfs/g18/M13/C4/0A/autohomecar__ChsE2GEEEkmAZQK1AAjAxStmd70113.png","https://n.sinaimg.cn/sinacn16/213/w2048h1365/20180824/489e-hicsiaw4496854.jpg"],
    "雪佛兰|科鲁泽": ["https://e0.ifengimg.com/04/2019/0106/1A7AF861F815126BCF6563A80E99E3AA2CBD8F74_size86_w908_h605.jpeg","https://x0.ifengimg.com/res/2022/F80BE2675AAD76E869E49EB51F047A9A7209F6FB_size1449_w942_h667.png","https://img4.pcauto.com.cn/pcauto/images/auto_hj/20221208/3915067.jpg","https://car2.autoimg.cn/cardfs/product/g25/M03/23/C8/autohomecar__ChxkqWUpWxGAWBsdADPMDmT5iLk049.jpg","https://m1.autoimg.cn/cardfs/product/g25/M05/A0/8A/1024x0_q87_autohomecar__ChtliGMIWbOAdD9_ABrysu7hrHU328.jpg","https://img1.xcarimg.com/news/3/36976/846_634_20200410113415362720849567538.jpg"],
    "欧拉|好猫": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2404/30/c23/420545003_1714448072180.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/13/c41/524352063_1749805693534.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/20/c27/423945858_1716191628865.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/11/c43/446768078_1726042487586.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/12/c0/523617628_1749694866879.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2406/11/c0/427760648_1718091228878.jpg"],
    "特斯拉|Model X": ["https://n.sinaimg.cn/sinakd10011/743/w1500h843/20230301/cc92-4dbc28b10d19ca96309c3c26108b3426.jpg","https://n.sinaimg.cn/sinakd10011/600/w1920h1080/20221202/abba-f8dd298bcb4b6d27587d76f3a500b45d.jpg","https://ugc-img.ifengimg.com/img/2022/11/16/8Kz60kPQA2w/969cd8c5-e2e6-4d43-80a5-d50d5b9c0bff_w1620_h1080.jpeg","https://img1.bitautoimg.com/autoalbum/files/20201027/270/202010271963_8218652_3.jpg","https://img3.bitautoimg.com/autoalbum/files/20221101/199/202211013435728781519950415_10124386_3.JPG","https://car3.autoimg.cn/cardfs/product/g32/M01/71/C0/1400x1050_autohomecar__ChxkPmdEFoGADHuGACA8ZpI4okw941.jpg"],
    "本田|雅阁": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2208/30/c85/331363381_1661853971605.jpeg","https://n.sinaimg.cn/sinakd20110/762/w1000h562/20230730/b45d-4c624d92c9b8d8c4dafeed224ad450e4.jpg","https://www2.autoimg.cn/chejiahaodfs/g32/M0A/BC/5D/750x0_autohomecar__Chtk2Wbs5f2AaordABErj-BVw3o037.png","https://car2.autoimg.cn/cardfs/product/g31/M05/5B/19/autohomecar__ChxoHWfR1cKAOtn_ACDuDiX4ifg751.jpg","https://www2.autoimg.cn/chejiahaodfs/g33/M02/81/16/750x0_autohomecar__ChxpVmjSafCAJ6luAA-eF72J4cU843.png","https://img8.bitautoimg.com/usercenter/news/2025/05/23/w800_m1_yichecar_a5aa28a04bd442ed8e252e2b8ddd8be9.jpg.webp"],
    "长安|逸动PLUS": ["https://d.ifengimg.com/q100/img1.ugc.ifeng.com/newugc/20210226/18/wemedia/42eab1976f17e69afb53e988f0a71fa43341d867_size94_w787_h525.jpg","https://k.sinaimg.cn/n/sinakd20220707ac/495/w1258h837/20220707/33b0-fb910b6734b64c7c1f53e0e22a5005b9.jpg/w700d1q75cms.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2404/17/c47/418055642_1713326956838_1024.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2208/10/c39/328198127_1660126349765.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2407/29/c31/436006661_1722237859113.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2307/04/c66/368283335_1688478995556_1024.jpg"],
    "大众|迈腾": ["https://x0.ifengimg.com/res/2019/88F82720EF069D077BC314EB75A457A0E86166BA_size271_w550_h451.jpeg","https://n.sinaimg.cn/sinakd10012/0/w2048h1152/20240704/627d-6af9aeb67da2494abf22d55b4dc26262.jpg","https://x0.ifengimg.com/res/2019/A82AA5868310F4E6B3CEA166F63B212F6EC8FF4D_size269_w550_h580.jpeg","https://www2.autoimg.cn/chejiahaodfs/g25/M07/71/8F/autohomecar__ChxkqWIaWdWAdIGbAAsYnBZjWs0498.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t01b115e14b212e9b66.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t01de886eeff6694b80.jpg"],
    "别克|君威": ["https://n.sinaimg.cn/sinakd10017/600/w1920h1080/20220325/1950-99f48983931547ec477518a47c5e6e0e.jpg","https://www2.autoimg.cn/chejiahaodfs/g6/M0F/F0/FA/autohomecar__ChwEmGFF0juAAqUxABubEKXAeZs792.jpg","https://n.sinaimg.cn/sinakd20122/579/w1264h915/20250227/8b03-c863bc0ae5a4d1d8939060ec8a515bb5.jpg","https://www2.autoimg.cn/chejiahaodfs/g30/M06/00/76/0x0_c42_autohomecar__CjIFU2WA8LOAWIVUAAG7XFHeuK4684.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t0189fa02f0f5caf399.jpg","https://cjh2.autoimg.cn/chejiahaodfs/g27/M00/6F/89/1000x0_q100_autohomecar__ChwFkV74O-qAXjKOAE2rwAWSSS4697.jpg?x_image_process=text/5Lic5pa56L2m6JCl/fontSize/13"],
    "起亚|K3": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/27/c21/414502998_1711532511319.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/27/c21/414509514_1711532506193.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2212/16/c28/345370595_1671196917916.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2403/27/c21/414509562_1711532509856.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2308/31/c66/379131957_1693471739078.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2212/16/c27/345370653_1671196914192.jpg"],
    "比亚迪|海豚": ["https://n.sinaimg.cn/sinakd10113/600/w1920h1080/20230420/711c-329137761cdd01c3c07820ac545f9344.jpg","https://www2.autoimg.cn/chejiahaodfs/g4/M15/60/1B/autohomecar__Chxkl2EnBAyASmgEAAuVZ2Ruv0M229.jpg","https://www2.autoimg.cn/chejiahaodfs/g4/M0D/E0/7F/autohomecar__ChwElmEnAwSAbEvfAAKFBXxmWwU713.jpg","https://n.sinaimg.cn/sinakd10008/600/w1920h1080/20240408/1373-77c671ca0c188393316297df133f4cdb.jpg","https://car2.autoimg.cn/cardfs/product/g32/M00/98/8D/autohomecar__ChxkPmfs1vWAOZCrAC4zB1cB9aI480.jpg","https://s3.xchuxing.com/xchuxing/article/2021/08/16/94d8a202108161536515566.jpg"],
    "大众|帕萨特": ["https://n.sinaimg.cn/sinakd202134s/390/w680h510/20210304/f669-kkxpczc3913105.jpg","https://www2.autoimg.cn/chejiahaodfs/g28/M04/C0/86/autohomecar__ChwFkmG7Wy2ASPcnABGKeLfOxec331.jpg","https://img.pcauto.com.cn/images/ttauto/2023/01/14/7188052210356912698/0fb60cb79076427ba2aee489e0566e86.png","https://n.sinaimg.cn/sinakd20210116ac/390/w1279h711/20210116/b356-khstaxs5960704.jpg","https://n.sinaimg.cn/auto/transform/300/w660h440/20240831/ff0b-f7ae22b40160bae3a10cd7e76902e2bc.jpg","https://car2.autoimg.cn/cardfs/product/g2/M01/39/6F/1400x1050_autohomecar__ChsEkFyBzAyAS7VGAApMlkpn6ok505.jpg"],
    "特斯拉|Model Y": ["https://n.sinaimg.cn/sinakd20231030s/573/w800h573/20231030/ba1f-b78f208ae5242a974f5112c452d4dcfb.jpg","https://n.sinaimg.cn/sinakd20111/177/w1024h753/20241025/28aa-c33e284dac8617e15aa37a54cc326505.jpg","https://k.sinaimg.cn/n/sinakd20250113s/144/w1026h718/20250113/92eb-b47d992b980e80c82ec6a37dd1671eb6.jpg/w700d1q75cms.jpg?by=cms_fixed_width","https://s3.xchuxing.com/xchuxing/article/2025/01/22/541aa202501221517479711.jpg","https://n.sinaimg.cn/sinacn20114/30/w1080h1350/20190315/2cb9-hufnxfn7821083.jpg","https://car3.autoimg.cn/cardfs/product/g31/M09/DF/5A/autohomecar__ChxoHWetZAOAIGCJACQZlt2E8iw487.jpg"],
    "哪吒|U-II": ["https://x0.ifengimg.com/res/2022/F60751E9B2535764E9275E27224AF7B3C2DC8F99_size76_w800_h739.jpeg","https://x0.ifengimg.com/res/2022/786C9572CC07BD3995B42C787BA6CA0944230B78_size95_w800_h910.jpeg","https://x0.ifengimg.com/res/2022/9BC8DAA77D97DC16F29EB14A7278EF5D5F06D36E_size115_w800_h974.jpeg","https://x0.ifengimg.com/ucms/2023_10/14845848F0DA9FA2242D6D217E674182656BC09C_size74_w698_h392.jpg","https://x0.ifengimg.com/res/2022/CDE09012C58EC51DB243AE04F45C3911DB4A9ED2_size365_w800_h1142.jpeg","https://n.sinaimg.cn/sinakd20221010s/178/w846h932/20221010/8fb4-e7b9cd4442aeb21ff1efe8bfb997a4b1.jpg"],
    "吉利|帝豪": ["https://www.sinaimg.cn/qc/photo_auto/photo/95/89/79779589/79779589.jpg","https://www.sinaimg.cn/qc/autoimg/car/34/10/130531034_src.JPG","https://x0.ifengimg.com/res/2021/18BB97CF7385A9B739FD75C41DCFF97E1CF4F250_size292_w800_h772.jpeg","https://p0.ifengimg.com/pmop/2018/0206/94F6ADD73E178911E1B84491065E2F85BA11F758_size153_w1024_h683.jpeg","https://auto.sinaimg.cn/autoimg/car/09/33/131323309_src.JPG","https://p0.ifengimg.com/pmop/2018/0206/2E41107985BCF81E36243E2B0B8542AE50265A71_size157_w1024_h683.jpeg"],
    "哈弗|大狗": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/11/c3/536224258_1752198163542.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2302/26/c26/351935595_1677419259263.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2207/14/c30/323894087_1657778987593.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2303/24/c27/355798784_1679637569349.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/10/c21/536040682_1752142208336.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/10/c19/536040148_1752142067169.jpg"],
    "蔚来|ES6": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c27/652759114_1775097130376.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c26/652755281_1775097126905.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c38/652790792_1775098032648.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/02/c16/443878290_1725263063778.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/02/c26/652755280_1775097126037.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2208/12/c10/328509279_1660290205410_1024.jpg"],
    "本田|飞度": ["https://www2.autoimg.cn/chejiahaodfs/g24/M04/48/49/autohomecar__Chtk3WPCH5uAIIUPAATe3dHBnRc262.png","https://n.sinaimg.cn/sinakd20109/337/w1156h781/20251225/25c2-6529a2d9f04cf35cd311892f6c1450b1.jpg","https://n.sinaimg.cn/sinakd/sni/228/w1556h1072/20250923/adc6-c9add8ecd859d0762b26105afc78fa7d.jpg","https://e0.ifengimg.com/05/2019/0618/5A3E1945F36C20AC2B2DC41C54CE43BA167FB64B_size81_w640_h480.jpeg","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g28/M08/C8/7C/752x0_q100_autohomecar__ChxkmmRJ2faAYQdPAAMbNB1uCJI050.png?text/5pyJ54K56L2m5LqL/fontSize/13","https://www2.autoimg.cn/chejiahaodfs/g24/M03/31/DE/autohomecar__Chxky2S3VtCAAkFFAAILPpZHrPU583.png"],
    "日产|轩逸": ["https://auto2.sinaimg.cn/autoimg/car/56/69/132156956_950.jpg","https://www2.autoimg.cn/youchuang/g1/M08/0F/6E/autohomecar__ChsEmV0iyXqAIQsZAAJQuuzSHoE412.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/01/c53/550162929_1756718977903.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2509/10/c16/552589811_1757493614606.jpg","https://www2.autoimg.cn/chejiahaodfs/g31/M06/EB/FE/autohomecar__ChxoHWWydoyAMpJUAA6ICmL7_U4645.png","https://car2.autoimg.cn/cardfs/product/g33/M04/D9/84/autohomecar__ChxpVmiq8C6AKPqGAD-HdWYx_uI216.jpg"],
    "奥迪|Q5L": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2311/09/c0/391077298_1699497126939.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/10/c4/488566004_1741575753163.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2311/28/c12/394327825_1701143229562.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/15/c12/579509822_1765788088351.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/20/c61/491520540_1742464040548.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2601/05/c6/585121368_1767578626259.jpg"],
    "比亚迪|海豹": ["https://car2.autoimg.cn/cardfs/product/g32/M00/09/05/autohomecar__Chtk2WdW66-AY5I_ADKpnrflixo959.jpg","https://cjh2.autoimg.cn/chejiahaodfs/g31/M03/7E/D9/1000x0_q100_autohomecar__ChtlyGg8cCyALGUAAALll6t1yFg86.jpeg?x_image_process=text/5Yez5a2Q6K-06L2m/fontSize/13","https://x0.ifengimg.com/res/2022/CD571038FC8F338EDFFFC7C331F1569E5C601D83_size117_w1080_h608.jpeg","https://n.sinaimg.cn/sinakd10011/412/w1800h1012/20220812/87b3-089bb630c6008f6f83b13f168824a972.jpg","https://n.sinaimg.cn/sinakd10011/719/w1996h1123/20240808/e60d-0d37094dd934ae17640fd2d4626f5630.jpg","https://car3.autoimg.cn/cardfs/product/g27/M07/22/D6/autohomecar__CjIFVWg_7M-AY4MRAC3vi5vleUw684.jpg"],
    "五菱|缤果": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2303/30/c36/356729605_1680166267826.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2605/03/c49/671741899_1777784097262.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/01/c11/652220973_1775014189642.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/19/c31/449119512_1726757762759.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/16/c40/661229077_1776334130120.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/25/c0/493121119_1742865450250.jpg"],
    "荣威|i5": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/09/c0/560998035_1759974652030.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/31/c26/567151675_1761900491602.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/31/c23/567149920_1761899515193.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/31/c23/567149967_1761899516400.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/09/c0/560998056_1759974651385.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/05/c39/487242239_1741166159556.jpg"],
    "小鹏|G6": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/03/c0/486600538_1740966053993.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2306/25/c17/366846091_1687676017165.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/05/c61/487275065_1741187240444.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2603/05/c10/632409889_1772704546937.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2604/07/c55/655502391_1775535199165.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2603/05/c12/632600454_1772725633991.jpg"],
    "马自达|阿特兹": ["https://n.sinaimg.cn/sinakd10114/600/w1920h1080/20221129/90b0-ff4da3d6b29e0174d911483b2d094bf7.jpg","https://n.sinaimg.cn/sinakd20210421ac/600/w1920h1080/20210421/88ab-kpamyih7972947.jpg","https://car2.autoimg.cn/cardfs/product/g17/M11/F1/53/autohomecar__ChsEu2BB7PiANMFuAAxNeuiQ3f4785.jpg","https://e0.ifengimg.com/09/2019/0711/0C6260B046DC280658EBD8EB94A5BCBB91F9272B_size166_w800_h525.jpeg","https://x0.ifengimg.com/res/2020/4F923D57CA96EA6CCAAF89288CA175FB3AD4BEEA_size197_w850_h621.jpeg","https://www2.autoimg.cn/chejiahaodfs/g30/M07/E2/6A/autohomecar__ChxknGJx7C2ACt-aABujSaYrWsc886.jpg"],
    "雷克萨斯|ES": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/22/c3/465616378_1732242200151.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2211/23/c30/342763673_1669195719617.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/22/c3/465616427_1732242205818.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2412/31/c3/471805107_1735612038709.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2408/12/c41/438599434_1723451533514.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/28/c7/574985743_1764300442242.jpg"],
    "沃尔沃|XC60": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/07/c0/521868075_1749275918913.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/01/c0/532115112_1751299612263.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2507/01/c0/532115115_1751299615438.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2506/07/c0/521868082_1749275919998.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2508/11/c6/544509344_1754879946589.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2307/07/c5/370221541_1688691959862.jpg"],
    "现代|伊兰特": ["https://n.sinaimg.cn/sinakd20200927ac/213/w2048h1365/20200927/fca6-izrvxmh4082467.jpg","https://n.sinaimg.cn/sinakd10020/600/w1920h1080/20230421/246c-57b522913da65060cd465ebf1dcc5c18.jpg","https://www2.autoimg.cn/chejiahaodfs/g29/M0B/5D/40/autohomecar__ChwFk2HO3t2AVkXOAA-_KezFjSg353.jpg","https://car2.autoimg.cn/cardfs/product/g34/M04/11/4E/autohomecar__ChxpWGivyJ2AOLbrABT9ORXUfpM779.jpg","https://n.sinaimg.cn/sinakd20200927ac/213/w2048h1365/20200927/4894-izrvxmh4082450.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t01c9c0c47c769b2000.jpg"],
    "丰田|汉兰达": ["https://www2.autoimg.cn/chejiahaodfs/g32/M02/FB/7B/autohomecar__Chtk2WhKmRaAZXAoAAryiTHpXkE446.png","https://n.sinaimg.cn/sinakd2020511s/390/w680h510/20200511/15e3-itmiwry9581123.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/22/c6/581105532_1766369002598.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/22/c6/581103414_1766369002717.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/08/c16/577655101_1765178224638.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t012084488d87be62e5.jpg"],
    "奔驰|GLC": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2412/03/c0/467805119_1733206666618.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/19/c1/572183121_1763516501896.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/25/c26/574148851_1764042417512.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/18/c51/572121244_1763461739846.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/19/c1/572183886_1763516502497.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/19/c14/572311143_1763521087878.jpg"],
    "大众|宝来": ["https://cjh2.autoimg.cn/chejiahaodfs/g27/M0A/26/91/1000x0_q100_autohomecar__ChxkmWGzaJ6Abls-AF5qWtiRD54433.jpg?x_image_process=text/5pel54Wn6L2m5biC/fontSize/13","https://n.sinaimg.cn/sinakd2020121s/314/w680h434/20201201/4964-ketnnap9750464.jpg","https://p1.ifengimg.com/auto/dealer/85742_news_1554197376503.jpg","https://img4.bitautoimg.com/autoalbum/files/20220824/724/2022082452_9941067_6.jpg","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g25/M00/03/B0/752x0_q100_autohomecar__ChtliGO1FoWAVqnOAAd1CCh-sSk832.png?text/5o2i5oyh5bCP6L6-5Lq6/fontSize/13","https://www2.autoimg.cn/chejiahaodfs/g2/M05/C5/46/autohomecar__ChwFql-P7QmAN49tAAVUBc9EcSk430.jpg"],
    "福特|锐界": ["https://car2.autoimg.cn/cardfs/product/g32/M04/7F/5C/1400x1050_autohomecar__ChxkPWc5j4eAI-5zACv6kTcrJjA321.jpg","https://p0.ssl.img.360kuai.com/dmfd/1840_1380_/t01ea04e4129f0dd109.jpg","https://cjh2.autoimg.cn/chejiahaodfs/g31/M08/24/43/autohomecar__ChtlyGhsfvuANxDEAAQax4ZzJB8447.jpg?x_image_process=text/6L2m6Ze756S-/fontSize/12","https://car2.autoimg.cn/cardfs/product/g24/M07/24/08/autohomecar__ChsEeV9XPTiAX69BACIipYY-cok334.jpg","https://img2.bitautoimg.com/autoalbum/files/20230425/18/2023042512619241527201821402_10607753_3.jpg","https://car2.autoimg.cn/cardfs/series/g34/M08/CD/A6/autohomecar__ChtpWGknsVeAVKprAAq1JmjQczU213.jpg"],
    "广汽埃安|AION S Plus": ["https://n.sinaimg.cn/sinakd2021615s/610/w846h564/20210615/342f-krpikqf0337705.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M01/89/CD/autohomecar__ChwFjmC4i16AZt5lABpdunEFCa8844.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M08/C3/6D/autohomecar__Chtk3WC4kj6AKBhfACp0Zl4T-w0282.jpg","https://n.sinaimg.cn/sinakd2021615s/610/w846h564/20210615/e5cc-krpikqf0337854.jpg","https://x0.ifengimg.com/res/2021/AD8382B1E2F52D9E28607788DD952FC510C3CD93_size1252_w1200_h1525.jpeg","https://www2.autoimg.cn/chejiahaodfs/g24/M00/8B/C1/autohomecar__ChwFjmC4kyaAD5S7AAKAad_O51Q894.jpg"],
    "奔驰|E级": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2310/16/c4/387110438_1697443626456.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2209/22/c47/334720025_1663830127740.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/12/c6/578547039_1765504983939.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2502/05/c8/478970382_1738751190364.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/18/c45/448817176_1726652788456.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/26/c23/493859676_1742979048816.jpg"],
    "比亚迪|唐DM-i": ["https://n.sinaimg.cn/sinakd20120/740/w986h554/20241029/5ee5-7122069169e09d9c7fb799315baa58e1.jpg","https://n.sinaimg.cn/sinakd10009/600/w1920h1080/20240310/e7a4-047b76a5957732a5c8f5e4777a1b4647.jpg","https://n.sinaimg.cn/sinakd10015/600/w1080h1920/20240314/6ecc-2272e0c89fe4e8124bfe5c32e72aaa76.jpg","https://n.sinaimg.cn/sinakd20250407ac/200/w640h360/20250407/eeee-ccbeca2bee829a5ad6e9276d51c283de.jpg","https://n.sinaimg.cn/sinakd20116/33/w1000h633/20250917/96d9-36519d1764fd9f4f7069822f54d1e53a.jpg","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g26/M01/57/06/752x0_q100_autohomecar__CjIFVmQZVZOADAL7AAFzh_i8E2U538.png?text/5paw6IO95rqQ6L2m5aSn5ZKW/fontSize/13"],
    "比亚迪|宋PLUS": ["https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g26/M0A/A5/34/960x0_q100_autohomecar__ChtlxWSQUBCAD6l_AAbSA7h8WXk773.jpg?text/6L2mMzE05rG96L2m572R/fontSize/12","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g30/M07/BF/40/752x0_q100_autohomecar__ChxknGRd1zSAA1SXAAIIUbOjNvQ211.png?text/5p6B6YCf6LaF6L2m/fontSize/13","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g26/M03/74/EE/960x0_q100_autohomecar__CjIFVmSQUASAAxQuAAgKkqZdHSs160.jpg?text/6L2mMzE05rG96L2m572R/fontSize/12","https://twm.autohome.com.cn/cjh.autoimg.cn/chejiahaodfs/g28/M06/85/C9/960x0_q100_autohomecar__Chtlx2SQUAOAOe7YAAlfc874npM258.jpg?text/6L2mMzE05rG96L2m572R/fontSize/12","https://car2.autoimg.cn/cardfs/product/g12/M10/CA/FC/1400x1050_autohomecar__ChsFJ2BtnuiACBqNAAmb07AfRaU845.jpg","https://s3.xchuxing.com/xchuxing/article/2023/06/14/4db62202306142149194784.jpg"],
    "宝马|3系": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2208/27/c55/330854202_1661581349583.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2410/08/c3/454351211_1728352717485.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/04/c38/444507854_1725429451438.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2601/28/c10/601825007_1769581594027.jpg","https://x0.ifengimg.com/res/2022/838A1B185892077B6C14B647F657F08F78B59969_size224_w800_h533.jpeg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/04/c38/444508235_1725429451298.jpg"],
    "路虎|揽胜极光L": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/28/c9/566283372_1761620947030.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2512/19/c41/580527621_1766128815896.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/28/c9/566283156_1761620944536.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2510/28/c9/566282999_1761620949191.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/10/c28/422271849_1715324618967.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/08/c10/421851055_1715132906234.jpg"],
    "捷豹|XEL": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2107/22/c56/272216093_1626938443898.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2107/22/c56/272215967_1626938444727.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2106/25/c26/269451118_1624626023129.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2311/02/c9/389920161_1698897661055.jpg","https://www2.autoimg.cn/chejiahaodfs/g29/M08/5D/DF/autohomecar__ChwFk2HtWNmAUuMYAAn7HGU3evk281.png","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2311/02/c9/389919320_1698897663993.jpg"],
    "深蓝|SL03": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/30/c78/452586739_1727677680500.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2310/30/c45/389444970_1698670608497.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2310/30/c45/389445794_1698670609138.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/21/c29/465294250_1732170188333.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2408/01/c19/436573805_1722482188634.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2411/21/c29/465294377_1732170184083.jpg"],
    "丰田|RAV4荣放": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/24/c4/450453513_1727144553610.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2305/05/c43/362689850_1683268706708.jpeg","https://www2.autoimg.cn/chejiahaodfs/g33/M06/FB/7F/autohomecar__Chto52lcz0CAN5yoAAKZPS3emDk012.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/24/c4/450437909_1727144551433.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2410/12/c29/455492825_1728721018249.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2409/18/c11/448768565_1726630164741.jpg"],
    "大众|朗逸": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/25/c6/574027942_1764036474990.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/25/c65/574180074_1764055946735.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2309/21/c19/382876245_1695269249076.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2601/26/c0/600354891_1769407332739.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/1707/30/c10/54194038_1501423935899.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/10/c29/569854025_1762765976123.jpg"],
    "日产|天籁": ["https://n.sinaimg.cn/sinakd20221111ac/400/w1280h720/20221111/6479-fe68cf01e05568b92762b5347d14f4c2.jpg","https://p0.ifengimg.com/pmop/2018/1018/CDA8DBC252C453F7524A582C4855CAC93B6E93A3_size100_w640_h780.jpeg","https://x0.ifengimg.com/res/2022/EDC45AFC4843C8E052B88F6C13550106EEC688F8_size153_w680_h470.jpeg","https://k.sinaimg.cn/n/sinakd20115/99/w1419h1080/20251112/b6b7-1637087ad8ab85916fbe1a4734b20493.jpg/w700d1q75cms.jpg","https://k.sinaimg.cn/n/sinakd20115/120/w1080h1440/20251112/66e0-63550fae51e119a5cfe2c3a75e4611e6.jpg/w700d1q75cms.jpg","https://k.sinaimg.cn/n/sinakd20115/120/w1440h1080/20251112/057f-dd9a521254286e5470f0f5a169504f13.png/w700d1q75cms.jpg"],
    "理想|ONE": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2105/25/c44/266103776_1621950754784.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2105/29/c9/266555183_1622300889470.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/1904/26/c43/144417036_1556250322843.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2107/28/c10/272841824_1627461257833.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2107/28/c10/272841804_1627461254278.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2105/25/c44/266103084_1621950757583.jpg"],
    "广汽埃安|AION Y Plus": ["https://www2.autoimg.cn/chejiahaodfs/g32/M03/D1/19/autohomecar__ChxkPWhBEyeAZYRfAAzGKjskJMI00.jpeg","https://img5.bitautoimg.com/usercenter/news/2024/04/26/w800_m0_yichecar_22ca7b3d-2f70-4f70-9b9d-add1e582b1dd.jpg.webp","https://image.bitautoimg.com/appimage-800-w1/news/2022/09/26/3f20c8f2-f495-4658-a98a-5e8e1e14b473.jpg","https://www2.autoimg.cn/chejiahaodfs/g31/M02/08/27/autohomecar__ChtlyGX4HumAeStoAB4UpPgXEeA898.png","https://img1.xcarimg.com/b371/s15461/20221028104713507542829566921.jpg","https://www2.autoimg.cn/chejiahaodfs/g24/M07/C4/A5/750x0_autohomecar__Chxky2hBEb6AY1uZAAmnZd6DZos423.png"],
    "问界|M5": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2304/19/c47/361422017_1681871966944.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2304/19/c47/361422104_1681871964280.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2304/19/c47/361422255_1681871963445.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2405/23/c7/424497212_1716451872586.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2503/27/c77/494385412_1743090431314.jpg","https://n.sinaimg.cn/sinakd10009/600/w1920h1080/20240523/8ed6-93c6711adce0987f6965bbd3383c3ed8.jpg"],
    "奥迪|A6L": ["https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/03/c17/567905837_1762139140292.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2412/18/c18/469966630_1734493692803.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2310/27/c40/388960384_1698393582297.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2310/27/c43/388960870_1698395025503.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/03/c17/567905570_1762139142932.jpg","https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2511/06/c43/568748922_1762417937341.jpg"]
  };

  /* 资讯 / 编辑类配图 */
  var NEWS_IDX = [1, 8, 12, 14, 16, 20, 21, 22, 25, 27, 28, 29];

  /* 拼接图片地址（w 为宽度，按 CDN 规则附加尺寸参数） */
  function photoUrl(key, w) {
    var p = key.split(':'), id = p[1];
    if (p[0] === 'p') {
      return PEXELS + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=' + w;
    }
    return UNSPLASH + id + '?w=' + w + '&q=75&auto=format&fit=crop';
  }
  /* 按序号取图（循环取模，序号可为负） */
  function photoAt(n, w) {
    var i = ((n % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;
    return photoUrl(PHOTOS[i], w || 800);
  }
  /* 字符串稳定哈希（FNV-1a）：把车型 id 映射为固定图片，避免每次刷新跳动 */
  function hashKey(str) {
    var h = 2166136261, i, s = String(str);
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* 取该车型专属实拍图集；无匹配时回退到通用池（保证不空白） */
  function carImgs(car) {
    var list = CAR_IMGS[car.brand + '|' + car.series];
    if (list && list.length) return list;
    var h = hashKey(car.id), fb = [], k;
    for (k = 0; k < 6; k++) { fb.push(photoAt(h + k * 7, 1000)); }
    return fb;
  }

  /* 车辆主图（列表卡片 / 推荐位 / 个人中心）：车型对应的第一张实拍图 */
  function carImage(car) { return carImgs(car)[0]; }

  /* 车辆多角度图集（详情页大图轮播，6 张，全部为同车型实拍素材） */
  function carImages(car) {
    var list = carImgs(car), out = [], k;
    for (k = 0; k < 6; k++) { out.push(list[k % list.length]); }
    return out;
  }

  /* 场景图：保留原接口，供页脚二维码等位置调用 */
  function sceneImage(prompt, size) {
    return photoAt(hashKey(prompt || 'scene'), size === 'square' ? 600 : 1400);
  }

  /* ---- 首页 Banner（6 张促销轮播，含新增素材） ---- */
  var BANNERS = [
    {
      id: 'B1', theme: 'promo', tag: '2026 金秋购车节',
      title: '严选二手车 直降 8000 元',
      desc: '2 万台第三方检测合格车源，车况透明 · 一年质保 · 7 天可退',
      btn: '立即抢购', link: 'list.html',
      image: photoAt(24, 1600)   // 蓝色宝马
    },
    {
      id: 'B2', theme: 'ev', tag: '新能源专场',
      title: '纯电二手车 电池健康度可查',
      desc: '三电质保随车转移，电池 SOH 检测报告随车交付，最低首付 1 成',
      btn: '看新能源车源', link: 'list.html?fuel=纯电',
      image: photoAt(4, 1600)    // 都市小型电车
    },
    {
      id: 'B3', theme: 'luxury', tag: '豪华车专区',
      title: '准新豪华车 立省 15 万起',
      desc: 'BBA 原厂质保车内车源，1 年 2 万公里官方质保，全国联保',
      btn: '进入豪华专区', link: 'list.html?sections=豪华车专区',
      image: photoAt(11, 1600)   // 黄色超跑
    },
    {
      id: 'B4', theme: 'inspect', tag: '259 项第三方检测',
      title: '每台车都过检测 车况透明可查',
      desc: '复检合格才上架，检测报告随车交付，事故 / 泡水 / 火烧车一律不收',
      btn: '查看检测标准', link: 'service.html#inspect',
      image: photoAt(9, 1600)    // 展厅红色跑车
    },
    {
      id: 'B5', theme: 'suv', tag: '家用 SUV 专场',
      title: '大空间家用 SUV 低至 6 折',
      desc: '7 座 / 5 座多车型可选，家庭出行一步到位，支持 0 首付方案',
      btn: '看 SUV 车源', link: 'list.html',
      image: photoAt(25, 1600)   // 白色 SUV
    },
    {
      id: 'B6', theme: 'finance', tag: '低首付金融',
      title: '首付 1 成起 当天可提车',
      desc: '合作银行直贷，最长 60 期，审批快 · 放款快 · 多种方案任选',
      btn: '算一算月供', link: 'service.html#finance',
      image: photoAt(26, 1600)   // 蓝色奔驰
    }
  ];

  /* 资讯配图 */
  function newsImage(n) {
    var h = hashKey((n && (n.id || n.title)) || 'news');
    return photoUrl(PHOTOS[NEWS_IDX[h % NEWS_IDX.length]], 640);
  }

  /* 门店配图：使用项目内本地图片文件（1.png ~ 10.png），按门店 id 一一对应，与门店城市 / 名称严格匹配，无需联网 */
  var STORE_IMG = {
    BJ01: '1.png',   // 北京 · 朝阳旗舰店
    SH01: '2.png',   // 上海 · 浦东体验中心
    GZ01: '3.png',   // 广州 · 天河交车中心
    SZ01: '4.png',   // 深圳 · 龙华旗舰店
    HZ01: '5.png',   // 杭州 · 滨江交付中心
    CD01: '6.png',   // 成都 · 武侯体验店
    WH01: '7.png',   // 武汉 · 汉口旗舰店
    XA01: '8.png',   // 西安 · 雁塔交车中心
    NJ01: '9.png',   // 南京 · 建邺体验中心
    CQ01: '10.png'   // 重庆 · 渝北旗舰店
  };
  function storeImage(s) {
    var id = (s && s.id) || 'BJ01';
    return STORE_IMG[id] || '1.png';
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
