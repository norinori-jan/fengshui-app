import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { fetchDirectionInfo, saveToSpreadsheet, getMapUrl } from './api'
import CameraView from './CameraView'

const MOUNTAIN_LABELS = ['午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙']

function App() {
  const videoRef = useRef(null)
  const [heading, setHeading] = useState(0)
  const [laserPos, setLaserPos] = useState(window.innerWidth / 2)
  const [viewMode, setViewMode] = useState('camera') 
  const [mapUrl, setMapUrl] = useState('')
  const [directionInfo, setDirectionInfo] = useState(null)
  const [note, setNote] = useState('')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [selectedCameraId, setSelectedCameraId] = useState('')

  const combinedAngle = useMemo(() => {
    const rel = (laserPos - window.innerWidth / 2) / window.innerWidth
    return (heading + (rel * 90) + 360) % 360
  }, [heading, laserPos])

  useEffect(() => {
    fetchDirectionInfo(combinedAngle).then(d => setDirectionInfo(d.result))
  }, [combinedAngle])

  useEffect(() => {
    const handleOrientation = (e) => {
      const h = e.webkitCompassHeading || (360 - e.alpha) % 360
      if (h !== undefined) setHeading(h)
    }
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  // 標高取得 & 保存処理
  const handleSave = async () => {
    setSaveStatus('loading')
    let elevation = "取得失敗"
    
    try {
      const pos = await new Promise((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
      )
      const { latitude, longitude } = pos.coords
      
      const elevRes = await fetch(`https://cyberjapandata2.gsi.go.jp/visno/cgi-bin/query/getelevation.php?lon=${longitude}&lat=${latitude}&outtype=JSON`)
      const elevData = await elevRes.json()
      elevation = (elevData.elevation !== "-----") ? `${elevData.elevation}m` : "計測不能"

      const success = await saveToSpreadsheet({
        angle: combinedAngle.toFixed(1),
        mountain: directionInfo?.mountain || "不明",
        elevation: elevation,
        note: note
      })
      
      if (success) {
        setSaveStatus('success')
        setTimeout(() => { setSaveStatus('idle'); setNote(''); }, 2000)
      }
    } catch (err) {
      alert("位置情報の取得に失敗しました。iPhoneの設定でブラウザの位置情報を許可してください。")
      setSaveStatus('idle')
    }
  }

  return (
    <div className="app-root">
      <div className="camera-layer">
        {viewMode === 'camera' ? (
          <CameraView videoRef={videoRef} deviceId={selectedCameraId} />
        ) : (
          <iframe src={mapUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
        )}
      </div>

      <div className="center-overlay">
        <p className="overlay-mountain">{directionInfo?.mountain || '--'}</p>
        <p className="overlay-degree">{combinedAngle.toFixed(1)}°</p>
      </div>

      <div className="control-top">
        <button className="primary-btn" onClick={() => setViewMode('camera')}>📸</button>
        <button className="primary-btn" onClick={async () => { setMapUrl(await getMapUrl('gsi')); setViewMode('gsi'); }}>🗾</button>
        <button className="primary-btn" onClick={() => setIsPanelOpen(true)}>⚙️</button>
      </div>

      <div className={`guide-panel ${isPanelOpen ? 'open' : ''}`}>
        <button className="guide-toggle" onClick={() => setIsPanelOpen(!isPanelOpen)}>
          {isPanelOpen ? '▶' : '◀'}
        </button>
        <div className="guide-content">
          <h2 className="guide-state">鑑定メニュー</h2>
          
          <div style={{marginBottom: '15px'}}>
            <label style={{fontSize: '10px', opacity: 0.7}}>カメラ切り替え:</label>
            <CameraSelector onSelect={setSelectedCameraId} currentId={selectedCameraId} />
          </div>

          <div className="strength-row">
            <input placeholder="備考（氏名など）" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          
          <button className="panel-btn" onClick={handleSave} disabled={saveStatus === 'loading'}>
            {saveStatus === 'loading' ? '標高取得中...' : saveStatus === 'success' ? '✅ 保存完了' : '💾 標高込みで保存'}
          </button>
        </div>
      </div>

      {/* 羅盤オーバーレイ */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${-heading}deg)`, pointerEvents: 'none', zIndex: 2, opacity: 0.4 }}>
        <svg width="500" height="500">
          <circle cx="250" cy="250" r="230" fill="none" stroke="gold" strokeWidth="1" strokeDasharray="4 4" />
          {MOUNTAIN_LABELS.map((label, i) => {
            const a = (i * 15 - 90) * (Math.PI / 180)
            return <text key={i} x={250 + Math.cos(a)*200} y={250 + Math.sin(a)*200 + 7} fill="gold" fontSize="18" textAnchor="middle">{label}</text>
          })}
        </svg>
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