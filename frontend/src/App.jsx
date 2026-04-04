import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { saveToSpreadsheet, getMapUrl } from './api'
import CameraView from './CameraView'

const MOUNTAIN_LABELS = ['午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙']

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

const polarToCartesian = (cx, cy, radius, angle) => {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius }
}

const describeArcSegment = (cx, cy, innerR, outerR, startAngle, endAngle) => {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
    'Z'
  ].join(' ')
}

function analyzeLopan(degree) {
  const normalized = ((degree - 338 + 360) % 360)
  const guaIndex = Math.floor(normalized / 45) % 8
  const guaData = LOPAN_MASTER_DATA[guaIndex]
  const dWithinGua = normalized % 45
  const slotIndex = Math.min(2, Math.floor(dWithinGua / 15))
  const slotData = guaData.slots[slotIndex]
  const dWithinSlot = dWithinGua % 15
  const l7Index = Math.min(2, Math.floor(dWithinSlot / 5))
  const l8Index = Math.min(4, Math.floor(dWithinSlot / 3))
  return {
    angle: `${degree.toFixed(1)}°`,
    L1_卦: `${guaData.symbol} (${guaData.gua})`,
    L2_二十四山: slotData.l2,
    L3_詳細格: slotData.l3,
    L4_天星: slotData.l4,
    L5_九星: slotData.l5,
    L6_地盤五行: `${slotData.l6}(${slotData.element})`,
    L7_分金: slotData.l7[l7Index],
    L8_透地: slotData.l8[l8Index],
    isImportant: slotData.is_important,
    guaData,
    slotData,
    normalized,
    slotIndex,
    l7Index,
    l8Index
  }
}

function App() {
  const videoRef = useRef(null)
  const [heading, setHeading] = useState(0)
  const [laserPos, setLaserPos] = useState(window.innerWidth / 2)
  const [viewMode, setViewMode] = useState('camera')
  const [mapUrl, setMapUrl] = useState('')
  const [note, setNote] = useState('')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [compassStatus, setCompassStatus] = useState('未有効')
  const headingQueueRef = useRef([])
  const rafRef = useRef(null)

  const combinedAngle = useMemo(() => {
    const rel = (laserPos - window.innerWidth / 2) / window.innerWidth
    return (heading + rel * 90 + 360) % 360
  }, [heading, laserPos])

  const analyzed = useMemo(() => analyzeLopan(combinedAngle), [combinedAngle])

  useEffect(() => {
    const handleOrientation = (e) => {
      const raw = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha + 360) % 360 : undefined)
      if (raw == null || Number.isNaN(raw)) return
      headingQueueRef.current.push(raw)
      if (headingQueueRef.current.length > 8) headingQueueRef.current.shift()
    }

    const tick = () => {
      const values = headingQueueRef.current
      if (values.length > 0) {
        const average = values.reduce((sum, v) => sum + v, 0) / values.length
        setHeading(average)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleEnableCompass = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setCompassStatus('回転センサー有効')
        } else {
          setCompassStatus('権限が拒否されました')
        }
      } catch (err) {
        setCompassStatus('権限取得に失敗')
      }
    } else {
      setCompassStatus('センサー準備完了')
    }
  }

  const handleSave = async () => {
    setSaveStatus('loading')
    let elevation = '取得失敗'

    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
      )
      const { latitude, longitude } = pos.coords

      const elevRes = await fetch(`https://cyberjapandata2.gsi.go.jp/visno/cgi-bin/query/getelevation.php?lon=${longitude}&lat=${latitude}&outtype=JSON`)
      const elevData = await elevRes.json()
      elevation = elevData.elevation !== '-----' ? `${elevData.elevation}m` : '計測不能'

      const success = await saveToSpreadsheet({
        angle: combinedAngle.toFixed(1),
        L1_卦: analyzed.L1_卦,
        L2_二十四山: analyzed.L2_二十四山,
        L3_詳細格: analyzed.L3_詳細格,
        L4_天星: analyzed.L4_天星,
        L5_九星: analyzed.L5_九星,
        L6_地盤五行: analyzed.L6_地盤五行,
        L7_分金: analyzed.L7_分金,
        L8_透地: analyzed.L8_透地,
        isImportant: analyzed.isImportant ? '重要' : '通常',
        elevation,
        note,
      })

      if (success) {
        setSaveStatus('success')
        setTimeout(() => {
          setSaveStatus('idle')
          setNote('')
        }, 2000)
      }
    } catch (err) {
      alert('位置情報の取得に失敗しました。iPhoneの設定でブラウザの位置情報を許可してください。')
      setSaveStatus('idle')
    }
  }

  const compassSize = 440
  const center = compassSize / 2
  const activeSlotStart = Math.floor(analyzed.normalized / 15) * 15 - 90
  const activeSlotEnd = activeSlotStart + 15

  return (
    <div className="app-root">
      <div className="camera-layer">
        {viewMode === 'camera' ? (
          <CameraView videoRef={videoRef} deviceId={selectedCameraId} />
        ) : (
          <iframe src={mapUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
        )}
      </div>

      <div className="compass-graphic" style={{ transform: `translate(-50%, -50%) rotate(${-heading}deg)` }}>
        <svg width={compassSize} height={compassSize} className="compass-svg">
          <defs>
            <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(212,175,55,0.45)" />
              <stop offset="100%" stopColor="rgba(212,175,55,0.04)" />
            </radialGradient>
          </defs>
          <circle cx={center} cy={center} r={center - 8} fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" />
          <path d={describeArcSegment(center, center, 190, 230, activeSlotStart, activeSlotEnd)} fill={analyzed.isImportant ? 'rgba(255,100,100,0.15)' : 'rgba(255,255,255,0.08)'} />

          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5
            const outer = polarToCartesian(center, center, 230, angle)
            const inner = polarToCartesian(center, center, 220, angle)
            return <line key={`tick360-${i}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="rgba(212,175,55,0.7)" strokeWidth={angle % 15 === 0 ? 2 : 1} />
          })}

          {Array.from({ length: 24 }).map((_, i) => {
            const angle = i * 15
            const labelPos = polarToCartesian(center, center, 205, angle)
            return (
              <g key={`slot-${i}`}>
                <line x1={polarToCartesian(center, center, 218, angle).x} y1={polarToCartesian(center, center, 218, angle).y} x2={polarToCartesian(center, center, 230, angle).x} y2={polarToCartesian(center, center, 230, angle).y} stroke="#d4af37" strokeWidth="2" />
                <text x={labelPos.x} y={labelPos.y + 6} fill="#ffd46b" fontSize="12" fontWeight="700" textAnchor="middle">{MOUNTAIN_LABELS[i]}</text>
              </g>
            )
          })}

          {Array.from({ length: 24 }).flatMap((_, guaIdx) => {
            const gua = LOPAN_MASTER_DATA[guaIdx]
            return gua.slots.flatMap((slot, slotIdx) => {
              const baseAngle = guaIdx * 45 + slotIdx * 15
              return slot.l7.map((label, idx) => {
                const angle = baseAngle + idx * 5
                const start = polarToCartesian(center, center, 180, angle)
                const end = polarToCartesian(center, center, 190, angle)
                const labelPos = polarToCartesian(center, center, 172, angle)
                return (
                  <g key={`l7-${guaIdx}-${slotIdx}-${idx}`}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
                    <text x={labelPos.x} y={labelPos.y + 4} fill={slot.is_important ? '#ff6b6b' : '#fff'} fontSize="8" textAnchor="middle">{label}</text>
                  </g>
                )
              })
            })
          })}

          {Array.from({ length: 24 }).flatMap((_, guaIdx) => {
            const gua = LOPAN_MASTER_DATA[guaIdx]
            return gua.slots.flatMap((slot, slotIdx) => {
              const baseAngle = guaIdx * 45 + slotIdx * 15
              return slot.l8.map((label, idx) => {
                const angle = baseAngle + idx * 3
                const start = polarToCartesian(center, center, 155, angle)
                const end = polarToCartesian(center, center, 160, angle)
                const labelPos = polarToCartesian(center, center, 145, angle)
                return (
                  <g key={`l8-${guaIdx}-${slotIdx}-${idx}`}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                    {label !== '空白' && (
                      <text x={labelPos.x} y={labelPos.y + 3} fill="#c8d6ff" fontSize="7" textAnchor="middle">{label}</text>
                    )}
                  </g>
                )
              })
            })
          })}

          <circle cx={center} cy={center} r={110} fill="rgba(0,0,0,0.65)" stroke="rgba(212,175,55,0.8)" strokeWidth="2" />
          <text x={center} y={center - 14} fill={analyzed.isImportant ? '#ff6b6b' : '#fff'} fontSize="46" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{analyzed.L1_卦}</text>
          <text x={center} y={center + 24} fill="#fff" fontSize="16" textAnchor="middle" dominantBaseline="middle">{analyzed.L2_二十四山}</text>
        </svg>
      </div>

      <div className="center-overlay">
        <p className="overlay-mountain">{analyzed.L1_卦}</p>
        <p className="overlay-degree">{analyzed.angle}</p>
      </div>

      <div className="control-top">
        <button className="primary-btn" onClick={() => setViewMode('camera')}>📸</button>
        <button className="primary-btn" onClick={async () => { setMapUrl(await getMapUrl('gsi')); setViewMode('gsi') }}>🗾</button>
        <button className="primary-btn" onClick={() => setIsPanelOpen(true)}>⚙️</button>
      </div>

      <div className={`guide-panel ${isPanelOpen ? 'open' : ''}`}>
        <button className="guide-toggle" onClick={() => setIsPanelOpen(!isPanelOpen)}>
          {isPanelOpen ? '▶' : '◀'}
        </button>
        <div className="guide-content">
          <h2 className="guide-state">鑑定メニュー</h2>
          <button className="panel-btn activate-btn" onClick={handleEnableCompass}>羅盤をアクティブにする</button>
          <p className="small-note">センサー状態: {compassStatus}</p>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '10px', opacity: 0.7 }}>カメラ切り替え:</label>
            <CameraSelector onSelect={setSelectedCameraId} currentId={selectedCameraId} />
          </div>

          <div className="analysis-summary">
            <p><strong>L1:</strong> {analyzed.L1_卦}</p>
            <p><strong>L2:</strong> {analyzed.L2_二十四山}</p>
            <p><strong>L3:</strong> {analyzed.L3_詳細格}</p>
            <p><strong>L4:</strong> {analyzed.L4_天星}</p>
            <p><strong>L5:</strong> {analyzed.L5_九星}</p>
            <p><strong>L6:</strong> {analyzed.L6_地盤五行}</p>
            <p><strong>L7:</strong> {analyzed.L7_分金}</p>
            <p><strong>L8:</strong> {analyzed.L8_透地}</p>
            <p style={{ color: analyzed.isImportant ? '#ff6b6b' : '#fff' }}><strong>重要:</strong> {analyzed.isImportant ? 'はい' : 'いいえ'}</p>
          </div>

          <div className="strength-row">
            <input placeholder="備考（氏名など）" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <button className="panel-btn" onClick={handleSave} disabled={saveStatus === 'loading'}>
            {saveStatus === 'loading' ? '標高取得中...' : saveStatus === 'success' ? '✅ 保存完了' : '💾 標高込みで保存'}
          </button>
        </div>
      </div>

      <div onTouchMove={(e) => setLaserPos(e.touches[0].clientX)} style={{ position: 'absolute', left: laserPos, top: 0, width: 2, height: '100%', background: 'red', boxShadow: '0 0 10px red', zIndex: 5 }} />
    </div>
  )
}

function CameraSelector({ onSelect, currentId }) {
  const [devices, setDevices] = useState([])
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(ds => {
      setDevices(ds.filter(d => d.kind === 'videoinput'))
    })
  }, [])
  return (
    <select value={currentId} onChange={(e) => onSelect(e.target.value)} style={{width: '100%', background: '#333', color: '#fff', border: '1px solid #555', padding: '10px', borderRadius: '5px'}}>
      <option value="">（デフォルト）</option>
      {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>)}
    </select>
  )
}

export default App