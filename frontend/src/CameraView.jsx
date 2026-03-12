import { useEffect } from 'react'

function formatDirectionSet(directionSet) {
  if (!directionSet) {
    return ''
  }

  return Object.entries(directionSet)
    .map(([label, info]) => `${label}:${info.direction}`)
    .join(' / ')
}

function CameraView({ videoRef, onCameraReady, onCameraError, houseInfo }) {
  useEffect(() => {
    let stream

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        if (onCameraReady) {
          onCameraReady()
        }
      } catch (error) {
        if (onCameraError) {
          onCameraError(new Error(`カメラ起動失敗: ${error.message}`))
        }
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoRef, onCameraReady, onCameraError])

  return (
    <div className="camera-layer">
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