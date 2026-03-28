import { useEffect, useState } from 'react'

function formatDirectionSet(directionSet) {
  if (!directionSet) return ''
  return Object.entries(directionSet)
    .map(([label, info]) => `${label}:${info.direction}`)
    .join(' / ')
}


function CameraView({ videoRef, onCameraReady, onCameraError, houseInfo }) {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [currentStream, setCurrentStream] = useState(null)

  // カメラ一覧を取得
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = deviceInfos.filter(d => d.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (e) {
        setDevices([])
      }
    }
    getDevices()
  }, [])

  // カメラ切替
  useEffect(() => {
    if (!selectedDeviceId) return
    let stream = null
    const startCamera = async () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop())
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
          audio: false
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCurrentStream(stream)
        if (onCameraReady) onCameraReady()
      } catch (error) {
        if (onCameraError) onCameraError(error)
      }
    }
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId])

  return (
    <div className="camera-layer">
      <div style={{ position: 'absolute', zIndex: 10, top: 8, right: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 4, padding: 4 }}>
        <label>カメラ選択: </label>
        <select value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)}>
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `カメラ${d.deviceId.slice(-4)}`}</option>
          ))}
        </select>
      </div>
      <video ref={videoRef} className="camera-preview" autoPlay playsInline muted />
      {houseInfo && (
        <div className="bazhai-overlay" aria-live="polite">
          <p className="bazhai-title">{houseInfo.house_name}</p>
          <p className="bazhai-row">四吉方: {formatDirectionSet(houseInfo.lucky_directions)}</p>
          <p className="bazhai-row">四凶方: {formatDirectionSet(houseInfo.unlucky_directions)}</p>
        </div>
      )}
    </div>
  )
}

export default CameraView