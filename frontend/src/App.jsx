import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { saveToSpreadsheet, getMapUrl } from './api'
import CameraView from './CameraView'
import { layers, analyzeAllLayers, MOUNTAIN_LABELS } from './lopanDatabase'

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
  const [activeLayer, setActiveLayer] = useState('L1')
  const headingQueueRef = useRef([])
  const rafRef = useRef(null)

  const combinedAngle = useMemo(() => {
    const rel = (laserPos - window.innerWidth / 2) / window.innerWidth
    return (heading + rel * 90 + 360) % 360
  }, [heading, laserPos])

  const analyzed = useMemo(() => analyzeAllLayers(combinedAngle), [combinedAngle])

  const getLayerText = (layer) => {
    return analyzed[layer] || analyzed.L1
  }

  useEffect(() => {
    const handleOrientation = (e) => {
      let raw = null
      if (e.webkitCompassHeading != null) {
        raw = e.webkitCompassHeading
      } else if (e.alpha != null) {
        // iOS Safariではalphaがデバイス回転を表す場合があるが、通常はデバイス回転
        // 簡易的に360 - e.alphaを使用（実際のキャリブレーションが必要）
        raw = (360 - e.alpha) % 360
      }
      if (raw != null && !isNaN(raw)) {
        headingQueueRef.current.push(raw)
        if (headingQueueRef.current.length > 5) headingQueueRef.current.shift() // レスポンス改善のためキューを短く
      }
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
        L1: analyzed.L1,
        L2: analyzed.L2,
        L3: analyzed.L3,
        L4: analyzed.L4,
        L5: analyzed.L5,
        L6: analyzed.L6,
        L7: analyzed.L7,
        L8: analyzed.L8,
        L9: analyzed.L9,
        L10: analyzed.L10,
        L11: analyzed.L11,
        L12: analyzed.L12,
        L13: analyzed.L13,
        L14_八卦: analyzed.L14,
        L15_卦名: analyzed.L15,
        L16_九星方位: analyzed.L16,
        L17_外卦: analyzed.L17,
        L19_干支: analyzed.L19,
        L20_属性九星: analyzed.L20,
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
          <text x={center} y={center - 14} fill={analyzed.isImportant ? '#ff6b6b' : '#fff'} fontSize="46" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{getLayerText(activeLayer)}</text>
          <text x={center} y={center + 24} fill="#fff" fontSize="16" textAnchor="middle" dominantBaseline="middle">{analyzed.L2_二十四山}</text>
        </svg>
      </div>

      <div className="center-overlay">
        <p className="overlay-mountain">{getLayerText(activeLayer)}</p>
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
            <label style={{ fontSize: '10px', opacity: 0.7 }}>表示層選択:</label>
            <select value={activeLayer} onChange={(e) => setActiveLayer(e.target.value)} style={{ width: '100%', background: '#333', color: '#fff', border: '1px solid #555', padding: '10px', borderRadius: '5px' }}>
              {layers.map(layer => (
                <option key={layer.id} value={layer.id}>{layer.id}（{layer.name}）</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '10px', opacity: 0.7 }}>カメラ切り替え:</label>
            <CameraSelector onSelect={setSelectedCameraId} currentId={selectedCameraId} />
          </div>

          <div className="analysis-summary">
            <p><strong>L1:</strong> {analyzed.L1}</p>
            <p><strong>L2:</strong> {analyzed.L2}</p>
            <p><strong>L3:</strong> {analyzed.L3}</p>
            <p><strong>L4:</strong> {analyzed.L4}</p>
            <p><strong>L5:</strong> {analyzed.L5}</p>
            <p><strong>L6:</strong> {analyzed.L6}</p>
            <p><strong>L7:</strong> {analyzed.L7}</p>
            <p><strong>L8:</strong> {analyzed.L8}</p>
            <p><strong>L9:</strong> {analyzed.L9}</p>
            <p><strong>L10:</strong> {analyzed.L10}</p>
            <p><strong>L11:</strong> {analyzed.L11}</p>
            <p><strong>L12:</strong> {analyzed.L12}</p>
            <p><strong>L13:</strong> {analyzed.L13}</p>
            <p><strong>L14:</strong> {analyzed.L14}</p>
            <p><strong>L15:</strong> {analyzed.L15}</p>
            <p><strong>L16:</strong> {analyzed.L16}</p>
            <p><strong>L17:</strong> {analyzed.L17}</p>
            <p><strong>L19:</strong> {analyzed.L19}</p>
            <p><strong>L20:</strong> {analyzed.L20}</p>
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