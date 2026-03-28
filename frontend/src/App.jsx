import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { API_BASE_URL, fetchDirectionInfo, fetchElementStrength } from './api'
import CameraView from './CameraView'
import GuidePanel from './GuidePanel'

const COMPASS_SIZE = 340
const MOUNTAIN_LABELS = [
  '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
  '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'
]

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // レーザービーム
  const [laserPos, setLaserPos] = useState(window.innerWidth / 2)
  const [draggingLaser, setDraggingLaser] = useState(false)
  const laserRef = useRef(null)

  // 羅盤の中心位置はビームに連動
  const [compassPos, setCompassPos] = useState({
    x: window.innerWidth / 2 - COMPASS_SIZE / 2,
    y: window.innerHeight / 2 - COMPASS_SIZE / 2
  })

  // 画面リサイズ時に中央に
  useEffect(() => {
    const onResize = () => {
      setLaserPos(window.innerWidth / 2)
      setCompassPos({
        x: window.innerWidth / 2 - COMPASS_SIZE / 2,
        y: window.innerHeight / 2 - COMPASS_SIZE / 2
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 既存ステート
  const [heading, setHeading] = useState(0)
  const [cameraStatus, setCameraStatus] = useState('unknown')
  const [directionInfo, setDirectionInfo] = useState(null)
  const [houseInfo, setHouseInfo] = useState(null)
  const [orientationPermission, setOrientationPermission] = useState('unknown')
  const [apiError, setApiError] = useState('')
  const [captureDataUrl, setCaptureDataUrl] = useState('')
  const [zodiacInput, setZodiacInput] = useState('寅,午,戌')
  const [strengthResult, setStrengthResult] = useState(null)
  const [fatalError, setFatalError] = useState(null)

  if (fatalError) throw fatalError

  // 端末方位センサー
  useEffect(() => {
    const onOrientation = (event) => {
      let northHeading = null
      if (typeof event.webkitCompassHeading === 'number') {
        northHeading = event.webkitCompassHeading
      } else if (typeof event.alpha === 'number') {
        northHeading = (360 - event.alpha) % 360
      }
      if (northHeading !== null) setHeading(northHeading)
    }
    window.addEventListener('deviceorientation', onOrientation, true)
    return () => window.removeEventListener('deviceorientation', onOrientation, true)
  }, [])

  // 合成角度: 羅盤回転＋ビーム移動
  const combinedAngle = useMemo(() => {
    const compassCenterX = laserPos
    const screenCenterX = window.innerWidth / 2
    const rel = (compassCenterX - screenCenterX) / window.innerWidth
    const beamOffsetDeg = rel * 90 // 画面幅=90度分と仮定
    return (heading + beamOffsetDeg + 360) % 360
  }, [heading, laserPos])

  // API問い合わせ: 合成角度で
  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchDirectionInfo(combinedAngle)
        setDirectionInfo(data.result)
        setHouseInfo(data.bazhai || null)
        setApiError('')
      } catch (error) {
        const message = `API通信失敗: ${error.message}`
        setApiError(message)
        setFatalError(new Error(message))
      }
    }
    run()
  }, [combinedAngle])

  // レーザービームのドラッグ操作
  const handleLaserPointerDown = (e) => {
    e.preventDefault()
    setDraggingLaser(true)
    document.body.style.userSelect = 'none'
  }
  const handleLaserPointerMove = (e) => {
    if (!draggingLaser) return
    let clientX
    if (e.touches) {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }
    setLaserPos(clientX)
    setCompassPos(pos => ({ ...pos, x: clientX - COMPASS_SIZE / 2 }))
  }
  const handleLaserPointerUp = () => {
    setDraggingLaser(false)
    document.body.style.userSelect = ''
  }
  useEffect(() => {
    if (!draggingLaser) return
    const move = (e) => handleLaserPointerMove(e)
    const up = () => handleLaserPointerUp()
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [draggingLaser])

  // 羅盤SVG
  const compassSvg = (
    <svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
      <circle
        cx={COMPASS_SIZE / 2}
        cy={COMPASS_SIZE / 2}
        r={COMPASS_SIZE / 2 - 4}
        fill="rgba(0,0,0,0.05)"
        stroke="rgba(255,215,0,0.5)"
        strokeWidth="2"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24
        const rad = (angle - 90) * (Math.PI / 180)
        const x1 = COMPASS_SIZE / 2 + Math.cos(rad) * (COMPASS_SIZE / 2 - 8)
        const y1 = COMPASS_SIZE / 2 + Math.sin(rad) * (COMPASS_SIZE / 2 - 8)
        const x2 = COMPASS_SIZE / 2 + Math.cos(rad) * (COMPASS_SIZE / 2 - 32)
        const y2 = COMPASS_SIZE / 2 + Math.sin(rad) * (COMPASS_SIZE / 2 - 32)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,215,0,0.3)"
            strokeWidth={i % 6 === 0 ? 3 : 1.5}
          />
        )
      })}
      {MOUNTAIN_LABELS.map((label, i) => {
        const angle = (i * 360) / 24 - 90
        const rad = angle * (Math.PI / 180)
        const r = COMPASS_SIZE / 2 - 48
        const x = COMPASS_SIZE / 2 + Math.cos(rad) * r
        const y = COMPASS_SIZE / 2 + Math.sin(rad) * r + 8
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="20"
            fill="rgba(255,215,0,0.95)"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )

  // 既存: 鑑定・五行・UI
  const requestOrientationPermission = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission()
        setOrientationPermission(permission)
        if (permission !== 'granted') {
          throw new Error('方位センサーが許可されませんでした。')
        }
      } else {
        setOrientationPermission('granted')
      }
    } catch (error) {
      setOrientationPermission('denied')
      const message = `センサー許可エラー: ${error.message}`
      setApiError(message)
      setFatalError(new Error(message))
    }
  }

  const handleStrengthCheck = async () => {
    const zodiacList = zodiacInput
      .split(/[\s,、]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    try {
      const result = await fetchElementStrength(zodiacList)
      setStrengthResult(result)
      setApiError('')
    } catch (error) {
      setApiError(error.message)
      setStrengthResult(null)
    }
  }

  const handleCapture = () => {
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('カメラ映像がまだ利用できません。')
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Canvas 初期化に失敗しました。')
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const panelHeight = Math.max(180, canvas.height * 0.22)
      context.fillStyle = 'rgba(0, 0, 0, 0.55)'
      context.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight)
      context.fillStyle = '#ffffff'
      context.font = `${Math.max(24, canvas.width * 0.035)}px sans-serif`
      const mountain = directionInfo?.mountain || '未取得'
      const element = directionInfo?.element || '未取得'
      context.fillText(`方位: ${mountain} / 五行: ${element}`, 24, canvas.height - panelHeight + 52)
      context.fillText(`度数: ${combinedAngle.toFixed(1)}°`, 24, canvas.height - panelHeight + 94)
      if (strengthResult?.strengths) {
        const strengthText = `強度 木:${strengthResult.strengths['木']} 火:${strengthResult.strengths['火']} 土:${strengthResult.strengths['土']} 金:${strengthResult.strengths['金']} 水:${strengthResult.strengths['水']}`
        context.fillText(strengthText, 24, canvas.height - panelHeight + 136)
      }
      const dataUrl = canvas.toDataURL('image/png')
      setCaptureDataUrl(dataUrl)
      setApiError('')
    } catch (error) {
      setApiError(error.message)
    }
  }

  const captureFileName = useMemo(() => {
    const now = new Date()
    const pad = (value) => `${value}`.padStart(2, '0')
    return `fortune_capture_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`
  }, [captureDataUrl])

  return (
    <main className="app-root" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* カメラ映像（最下層） */}
      <CameraView
        videoRef={videoRef}
        onCameraReady={() => setCameraStatus('granted')}
        onCameraError={(error) => {
          setCameraStatus('denied')
          setFatalError(error)
        }}
        houseInfo={houseInfo}
      />

      {/* 羅盤レイヤー（中面） */}
      <div
        style={{
          position: 'absolute',
          left: compassPos.x,
          top: compassPos.y,
          width: COMPASS_SIZE,
          height: COMPASS_SIZE,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${-heading}deg)`,
            willChange: 'transform',
          }}
        >
          {compassSvg}
        </div>
      </div>

      {/* レーザービーム（前面） */}
      <div
        ref={laserRef}
        style={{
          position: 'absolute',
          left: laserPos - 1,
          top: 0,
          width: 2,
          height: '100vh',
          background: 'red',
          boxShadow: '0 0 10px 2px red',
          zIndex: 10,
          cursor: draggingLaser ? 'grabbing' : 'ew-resize',
          touchAction: 'none',
        }}
        onMouseDown={handleLaserPointerDown}
        onTouchStart={handleLaserPointerDown}
      />

      {/* 角度・鑑定パネルなど（最上層） */}
      <GuidePanel
        cameraStatus={cameraStatus}
        orientationPermission={orientationPermission}
        directionInfo={directionInfo}
        houseInfo={houseInfo}
        captureDataUrl={captureDataUrl}
        apiError={apiError}
      />

      <div className="center-overlay" style={{ zIndex: 100 }}>
        <p className="overlay-mountain">{directionInfo?.mountain || '---'}</p>
        <p className="overlay-degree">{combinedAngle.toFixed(1)}°</p>
      </div>

      <section className="control-top" style={{ zIndex: 100 }}>
        <button type="button" className="primary-btn" onClick={requestOrientationPermission}>
          センサー許可
        </button>
        <button type="button" className="primary-btn" onClick={handleCapture}>
          鑑定ボタン
        </button>
      </section>

      <section className="result-panel" style={{ zIndex: 100 }}>
        <p>API: {API_BASE_URL}</p>
        <p>センサー状態: {orientationPermission}</p>
        <p>現在方位: {directionInfo?.mountain || '未取得'} / 五行: {directionInfo?.element || '未取得'}</p>
        <p>八宅: {houseInfo?.house_name || '未取得'}（座:{houseInfo?.seat_degree?.toFixed?.(1) ?? '--'}°）</p>
        <p>角度: {combinedAngle.toFixed(1)}°</p>

        <div className="strength-row">
          <input
            value={zodiacInput}
            onChange={(event) => setZodiacInput(event.target.value)}
            placeholder="例: 寅,午,戌"
          />
          <button type="button" className="primary-btn" onClick={handleStrengthCheck}>
            五行計算
          </button>
        </div>

        {strengthResult?.strengths && (
          <p>
            強度 木:{strengthResult.strengths['木']} 火:{strengthResult.strengths['火']} 土:{strengthResult.strengths['土']} 金:{strengthResult.strengths['金']} 水:{strengthResult.strengths['水']} / 最大:{strengthResult.strongest_element}
          </p>
        )}

        {apiError && <p className="error-inline">エラー: {apiError}</p>}

        {captureDataUrl && (
          <div className="capture-preview">
            <img src={captureDataUrl} alt="鑑定キャプチャ" />
            <a href={captureDataUrl} download={captureFileName} className="primary-btn capture-link">
              キャプチャを保存
            </a>
          </div>
        )}
      </section>

      <canvas ref={canvasRef} className="hidden-canvas" />
    </main>
  )
}

export default App