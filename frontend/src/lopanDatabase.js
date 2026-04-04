const MOUNTAIN_LABELS = ['午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙']

// 人盤（中針）専用のマスターデータ
// 地盤から7.5度回転した独自の24山体系
const JINBAN_24_DATA = [
  { name: '壬', element: '火', star: '...', range: [330.5, 345.0] },
  { name: '子', element: '火', star: '...', range: [345.0, 360.4] }, // 360度を跨ぐ境界
  { name: '癸', element: '土', star: '...', range: [0.4, 15.0] },    // 360.4を0.4として処理
  { name: '丑', element: '金', star: '...', range: [15.0, 30.0] },
  { name: '艮', element: '木', star: '...', range: [30.0, 45.0] },
  { name: '寅', element: '水', star: '...', range: [45.0, 61.0] },
  { name: '甲', element: '火', star: '...', range: [61.0, 75.3] },
  { name: '卯', element: '火', star: '...', range: [75.3, 90.0] },
  { name: '乙', element: '土', star: '...', range: [90.0, 105.0] },
  { name: '辰', element: '金', star: '...', range: [105.0, 120.0] },
  { name: '巽', element: '木', star: '...', range: [120.0, 135.0] },
  { name: '巳', element: '水', star: '...', range: [135.0, 150.0] },
  { name: '丙', element: '火', star: '...', range: [150.0, 165.0] },
  { name: '午', element: '火', star: '...', range: [165.0, 180.0] },
  { name: '丁', element: '土', star: '...', range: [180.0, 195.0] },
  { name: '未', element: '金', star: '...', range: [195.0, 210.0] },
  { name: '坤', element: '木', star: '...', range: [210.0, 225.0] },
  { name: '申', element: '水', star: '...', range: [225.0, 240.0] },
  { name: '庚', element: '火', star: '...', range: [240.0, 255.0] },
  { name: '酉', element: '火', star: '...', range: [255.0, 270.0] },
  { name: '辛', element: '土', star: '...', range: [270.0, 285.0] },
  { name: '戌', element: '金', star: '...', range: [285.0, 300.0] },
  { name: '乾', element: '木', star: '...', range: [300.0, 315.2] },
  { name: '亥', element: '水', star: '...', range: [315.2, 330.5] }
]

const L10_LIST = [
  '辛亥', '癸亥', '甲子', '丙子', '戊子', '庚子', '壬子', '乙丑', '丁丑', '巳丑',
  '辛丑', '癸丑', '丙寅', '戊寅', '庚寅', '壬寅', '甲寅', '丁卯', '巳卯', '辛卯',
  '癸卯', '乙卯', '戊辰', '庚辰', '壬辰', '甲辰', '丙辰', '己巳', '辛巳', '癸巳',
  '乙巳', '丁巳', '庚午', '壬午', '甲午', '丙午', '戊午', '辛未', '癸未', '乙未',
  '丁未', '己未', '壬申', '甲申', '丙申', '戊申', '庚申', '癸酉', '乙酉', '丁酉',
  '己酉', '辛酉', '甲戌', '丙戌', '戊戌', '庚戌', '壬戌', '乙亥', '丁亥', '己亥'
]

const L11_LIST = [
  '正亥', '七亥三壬', '三亥七壬', '正壬', '五壬子', '正子', '七子三癸', '三子七癸', '正癸', '五癸丑',
  '正丑', '七丑三艮', '三丑七艮', '正艮', '五艮寅', '正寅', '七寅三甲', '三寅七甲', '正甲', '五甲卯',
  '正卯', '七卯三乙', '三卯七乙', '正乙', '五乙辰', '正辰', '七辰三巽', '三辰七巽', '正巽', '五巽巳',
  '正巳', '七巳三丙', '三巳七丙', '正丙', '五丙午', '正午', '七午三丁', '三午七丁', '正丁', '五丁未',
  '正未', '七未三坤', '三未七坤', '正坤', '五坤申', '正申', '七申三庚', '三申七庚', '正庚', '五庚酉',
  '正酉', '七酉三辛', '三酉七辛', '正辛', '五辛戌', '正戌', '七戌三乾', '三戌七乾', '正乾', '五乾亥'
]

const L12_LIST = [
  '3 亥(木)', '9 壬(火)', '1 子(水)', '1 癸(水)', '7 丑(金)', '8 艮(土)', 
  '9 寅(火)', '6 甲(金)', '3 卯(木)', '2 乙(土)', '1 辰(水)', '4 巽(木)', 
  '7 巳(金)', '8 丙(土)', '9 午(火)', '7 丁(金)', '3 未(木)', '2 坤(土)', 
  '1 申(水)', '3 庚(木)', '7 酉(金)', '4 辛(木)', '9 戌(火)', '6 乾(金)'
]

const L13_LIST = [
  ['空', '丁亥', '空', '辛亥', '空'], // 亥
  ['空', '丁亥', '空', '辛亥', '空'], // 壬
  ['空', '丙子', '空', '庚子', '空'], // 子
  ['空', '丙子', '空', '庚子', '空'], // 癸
  ['空', '丁丑', '空', '辛丑', '空'], // 丑
  ['空', '丁丑', '空', '辛丑', '空'], // 艮
  ['空', '丙寅', '空', '庚寅', '空'], // 寅
  ['空', '丙寅', '空', '庚寅', '空'], // 甲
  ['空', '丁卯', '空', '辛卯', '空'], // 卯
  ['空', '丁卯', '空', '辛卯', '空'], // 乙
  ['空', '丙辰', '空', '庚辰', '空'], // 辰
  ['空', '丙辰', '空', '庚辰', '空'], // 巽
  ['空', '丁巳', '空', '辛巳', '空'], // 巳
  ['空', '丁巳', '空', '辛巳', '空'], // 丙
  ['空', '丙午', '空', '庚午', '空'], // 午
  ['空', '丙午', '空', '庚午', '空'], // 丁
  ['空', '丁未', '空', '辛未', '空'], // 未
  ['空', '丁未', '空', '辛未', '空'], // 坤
  ['空', '丙申', '空', '庚申', '空'], // 申
  ['空', '丙申', '空', '庚申', '空'], // 庚
  ['空', '丁酉', '空', '辛酉', '空'], // 酉
  ['空', '丁酉', '空', '辛酉', '空'], // 辛
  ['空', '丙戌', '空', '庚戌', '空'], // 戌
  ['空', '丙戌', '空', '庚戌', '空']  // 乾
]

const LOPAN_MASTER_DATA = [
  {
    symbol: '☷', gua: '坤', range: [338.0, 22.7],
    slots: [
      { l2: '申', l3: '乾', l4: '天輔', l5: '文', l6: '壬', element: '水', is_important: true, l7: ['発亥', '正', '甲子'], l8: ['空白', '丁亥', '空白', '辛亥', '空白'] },
      { l2: '巳', l3: '空', l4: '天壘', l5: '破', l6: '子', element: '水', is_important: true, l7: ['丙子', '戊子', '庚子'], l8: ['空白', '丙子', '空白', '庚子', '空白'] },
      { l2: '巳', l3: '艮', l4: '陰光', l5: '破', l6: '発', element: '水', is_important: true, l7: ['壬子', '正', '乙丑'], l8: ['空白', '丙子', '空白', '庚子', '空白'] }
    ]
  },
  {
    symbol: '☳', gua: '震', range: [22.7, 67.7],
    slots: [
      { l2: '辰', l3: '空', l4: '天廚', l5: '武', l6: '丑', element: '土', is_important: false, l7: ['丁丑', '巳丑', '辛丑'], l8: ['空白', '丁丑', '空白', '辛丑', '空白'] },
      { l2: '丁', l3: '癸甲', l4: '天市', l5: '貧', l6: '艮', element: '土', is_important: false, l7: ['発丑', '正', '丙寅'], l8: ['空白', '丁丑', '空白', '辛丑', '空白'] },
      { l2: '未', l3: '空', l4: '天培', l5: '文', l6: '寅', element: '木', is_important: true, l7: ['戊寅', '庚寅', '壬寅'], l8: ['空白', '丙寅', '空白', '庚寅', '空白'] }
    ]
  },
  {
    symbol: '☲', gua: '離', range: [67.7, 112.7],
    slots: [
      { l2: '丙', l3: '艮', l4: '陰機', l5: '禄', l6: '甲', element: '木', is_important: true, l7: ['甲寅', '正', '丁卯'], l8: ['空白', '丙寅', '空白', '庚寅', '空白'] },
      { l2: '丁', l3: '空', l4: '天命', l5: '貞', l6: '卯', element: '木', is_important: false, l7: ['己卯', '辛卯', '発卯'], l8: ['空白', '丁卯', '空白', '辛卯', '空白'] },
      { l2: '申', l3: '巽', l4: '天官', l5: '輔', l6: '乙', element: '木', is_important: true, l7: ['乙卯', '正', '戊辰'], l8: ['空白', '丁卯', '空白', '辛卯', '空白'] }
    ]
  },
  {
    symbol: '☱', gua: '兌', range: [112.7, 157.7],
    slots: [
      { l2: '未', l3: '空', l4: '天罡', l5: '破', l6: '辰', element: '土', is_important: true, l7: ['庚辰', '壬辰', '甲辰'], l8: ['空白', '丙辰', '空白', '庚辰', '空白'] },
      { l2: '癸', l3: '丙乙', l4: '太乙', l5: '巨', l6: '巽', element: '木', is_important: false, l7: ['丙辰', '正', '己巳'], l8: ['空白', '丙辰', '空白', '庚辰', '空白'] },
      { l2: '酉', l3: '空', l4: '天屏', l5: '武', l6: '巳', element: '火', is_important: false, l7: ['辛巳', '発巳', '乙巳'], l8: ['空白', '丁巳', '空白', '辛巳', '空白'] }
    ]
  },
  {
    symbol: '☰', gua: '乾', range: [157.7, 202.7],
    slots: [
      { l2: '辛', l3: '巽', l4: '太微', l5: '貧', l6: '丙', element: '火', is_important: false, l7: ['丁巳', '正', '庚午'], l8: ['空白', '丁巳', '空白', '辛巳', '空白'] },
      { l2: '酉', l3: '空', l4: '陽懽', l5: '文', l6: '牛', element: '火', is_important: true, l7: ['壬午', '甲午', '丙午'], l8: ['空白', '丙午', '空白', '庚午', '空白'] },
      { l2: '寅', l3: '坤', l4: '南極', l5: '武', l6: '丁', element: '火', is_important: false, l7: ['戊午', '正', '辛未'], l8: ['空白', '丙午', '空白', '庚午', '空白'] }
    ]
  },
  {
    symbol: '☴', gua: '巽', range: [202.7, 247.7],
    slots: [
      { l2: '癸', l3: '空', l4: '天常', l5: '貞', l6: '未', element: '土', is_important: false, l7: ['発未', '乙未', '丁未'], l8: ['空白', '丁未', '空白', '辛未', '空白'] },
      { l2: '乙', l3: '庚丁', l4: '天鉞', l5: '輔', l6: '坤', element: '土', is_important: true, l7: ['己未', '正', '壬申'], l8: ['空白', '丁未', '空白', '辛未', '空白'] },
      { l2: '癸', l3: '空', l4: '天関', l5: '破', l6: '申', element: '金', is_important: true, l7: ['甲申', '丙申', '戊申'], l8: ['空白', '丙申', '空白', '庚申', '空白'] }
    ]
  },
  {
    symbol: '☵', gua: '坎', range: [247.7, 292.7],
    slots: [
      { l2: '午', l3: '坤', l4: '天漢', l5: '貞', l6: '庚', element: '金', is_important: false, l7: ['庚申', '正', '発酉'], l8: ['空白', '丙申', '空白', '庚申', '空白'] },
      { l2: '寅', l3: '空', l4: '少微', l5: '武', l6: '酉', element: '金', is_important: false, l7: ['乙酉', '丁酉', '己酉'], l8: ['空白', '丁酉', '空白', '辛酉', '空白'] },
      { l2: '牛', l3: '乾', l4: '天乙', l5: '巨', l6: '辛', element: '金', is_important: false, l7: ['辛酉', '正', '甲戌'], l8: ['空白', '丁酉', '空白', '辛酉', '空白'] }
    ]
  },
  {
    symbol: '☶', gua: '艮', range: [292.7, 338.0],
    slots: [
      { l2: '丑', l3: '空', l4: '天魁', l5: '文', l6: '戊', element: '土', is_important: true, l7: ['丙戌', '戊戌', '庚戌'], l8: ['空白', '丙戌', '空白', '庚戌', '空白'] },
      { l2: '卯', l3: '壬辛', l4: '天廏', l5: '禄', l6: '乾', element: '金', is_important: true, l7: ['壬戌', '正', '乙亥'], l8: ['空白', '丙戌', '空白', '庚戌', '空白'] },
      { l2: '乙', l3: '空', l4: '天皇', l5: '貞', l6: '亥', element: '水', is_important: false, l7: ['丁亥', '己亥', '辛亥'], l8: ['空白', '丁亥', '空白', '辛亥', '空白'] }
    ]
  }
]

// 層定義: 各層のメタデータとデータ
const layers = [
  {
    id: 'L1',
    name: '卦',
    origin: 338,
    divisions: 8,
    type: 'special', // 特殊計算
    data: LOPAN_MASTER_DATA
  },
  {
    id: 'L2',
    name: '二十四山',
    origin: 338,
    divisions: 24,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l2'
  },
  {
    id: 'L3',
    name: '詳細格',
    origin: 338,
    divisions: 24,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l3'
  },
  {
    id: 'L4',
    name: '天星',
    origin: 338,
    divisions: 24,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l4'
  },
  {
    id: 'L5',
    name: '九星',
    origin: 338,
    divisions: 24,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l5'
  },
  {
    id: 'L6',
    name: '五行',
    origin: 338,
    divisions: 24,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l6',
    format: (slot) => `${slot.l6}(${slot.element})`
  },
  {
    id: 'L7',
    name: '分金',
    origin: 338,
    divisions: 72,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l7'
  },
  {
    id: 'L8',
    name: '透地',
    origin: 338,
    divisions: 120,
    type: 'slot',
    data: LOPAN_MASTER_DATA,
    key: 'l8'
  },
  {
    id: 'L9',
    name: '人盤',
    origin: 345, // 人盤の起点
    divisions: 24,
    type: 'range',
    data: JINBAN_24_DATA,
    format: (item) => `${item.name}(${item.element})`
  },
  {
    id: 'L10',
    name: '六十龍',
    origin: 326,
    divisions: 60,
    type: 'list',
    data: L10_LIST
  },
  {
    id: 'L11',
    name: '分金属性',
    origin: 326,
    divisions: 60,
    type: 'list',
    data: L11_LIST
  },
  {
    id: 'L12',
    name: '天盤',
    origin: 330,
    divisions: 24,
    type: 'list',
    data: L12_LIST
  },
  {
    id: 'L13',
    name: '天盤分金',
    origin: 330,
    divisions: 120, // 24 * 5
    type: 'nested',
    data: L13_LIST
  }
]

// 汎用分析エンジン
function analyzeAllLayers(degree) {
  const result = {
    angle: `${degree.toFixed(1)}°`,
    isImportant: false,
    guaData: null,
    slotData: null,
    normalized: null,
    slotIndex: null,
    l7Index: null,
    l8Index: null
  }

  // L1 の特殊計算（基準）
  const normalized = ((degree - 338 + 360) % 360)
  const guaIndex = Math.floor(normalized / 45) % 8
  const guaData = LOPAN_MASTER_DATA[guaIndex]
  const dWithinGua = normalized % 45
  const slotIndex = Math.min(2, Math.floor(dWithinGua / 15))
  const slotData = guaData.slots[slotIndex]
  const dWithinSlot = dWithinGua % 15
  const l7Index = Math.min(2, Math.floor(dWithinSlot / 5))
  const l8Index = Math.min(4, Math.floor(dWithinSlot / 3))

  result.isImportant = slotData.is_important
  result.guaData = guaData
  result.slotData = slotData
  result.normalized = normalized
  result.slotIndex = slotIndex
  result.l7Index = l7Index
  result.l8Index = l8Index

  // 各層の計算
  layers.forEach(layer => {
    if (layer.type === 'special') {
      // L1
      result[layer.id] = `${guaData.symbol} (${guaData.gua})`
    } else if (layer.type === 'slot') {
      if (layer.key === 'l7') {
        result[layer.id] = slotData.l7[l7Index]
      } else if (layer.key === 'l8') {
        result[layer.id] = slotData.l8[l8Index]
      } else {
        const value = slotData[layer.key]
        result[layer.id] = layer.format ? layer.format(slotData) : value
      }
    } else if (layer.type === 'range') {
      // L9
      const item = layer.data.find(item => {
        const [start, end] = item.range
        if (start > end) {
          return degree >= start || degree < end
        }
        return degree >= start && degree < end
      })
      result[layer.id] = item ? layer.format(item) : '不明'
    } else if (layer.type === 'list') {
      const normalized = (degree - layer.origin + 360) % 360
      const index = Math.floor(normalized / (360 / layer.divisions)) % layer.divisions
      result[layer.id] = layer.data[index]
    } else if (layer.type === 'nested') {
      // L13
      const normalized = (degree - layer.origin + 360) % 360
      const parentIndex = Math.floor(normalized / 15) % 24
      const subIndex = Math.floor((normalized % 15) / 3) % 5
      result[layer.id] = layer.data[parentIndex][subIndex]
    }
  })

  return result
}

export { layers, analyzeAllLayers, MOUNTAIN_LABELS }