import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { API_BASE_URL, fetchDirectionInfo, fetchElementStrength } from './api'
import CameraView from './CameraView'
import GuidePanel from './GuidePanel'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

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

  if (fatalError) {
    throw fatalError
  }

  useEffect(() => {
    const onOrientation = (event) => {
      let northHeading = null

      if (typeof event.webkitCompassHeading === 'number') {
        northHeading = event.webkitCompassHeading
      } else if (typeof event.alpha === 'number') {
        northHeading = (360 - event.alpha) % 360
      }

      if (northHeading !== null) {
        setHeading(northHeading)
      }
    }

    window.addEventListener('deviceorientation', onOrientation, true)
    return () => {
      window.removeEventListener('deviceorientation', onOrientation, true)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchDirectionInfo(heading)
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
  }, [heading])

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
      context.fillText(`度数: ${heading.toFixed(1)}°`, 24, canvas.height - panelHeight + 94)

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
    <main className="app-root">
      <CameraView
        videoRef={videoRef}
        onCameraReady={() => setCameraStatus('granted')}
        onCameraError={(error) => {
          setCameraStatus('denied')
          setFatalError(error)
        }}
        houseInfo={houseInfo}
      />

      <GuidePanel
        cameraStatus={cameraStatus}
        orientationPermission={orientationPermission}
        directionInfo={directionInfo}
        houseInfo={houseInfo}
        captureDataUrl={captureDataUrl}
        apiError={apiError}
      />

      <div className="center-overlay">
        <p className="overlay-mountain">{directionInfo?.mountain || '---'}</p>
        <p className="overlay-degree">{heading.toFixed(1)}°</p>
      </div>

      <section className="control-top">
        <button type="button" className="primary-btn" onClick={requestOrientationPermission}>
          センサー許可
        </button>
        <button type="button" className="primary-btn" onClick={handleCapture}>
          鑑定ボタン
        </button>
      </section>

      <section className="result-panel">
        <p>API: {API_BASE_URL}</p>
        <p>センサー状態: {orientationPermission}</p>
        <p>現在方位: {directionInfo?.mountain || '未取得'} / 五行: {directionInfo?.element || '未取得'}</p>
        <p>八宅: {houseInfo?.house_name || '未取得'}（座:{houseInfo?.seat_degree?.toFixed?.(1) ?? '--'}°）</p>
        <p>角度: {heading.toFixed(1)}°</p>

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
