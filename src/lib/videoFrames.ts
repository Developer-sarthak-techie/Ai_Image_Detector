const FRAME_INTERVAL_SEC = 2
const MAX_FRAMES = 30
const MAX_VIDEO_DURATION_SEC = 60

export async function extractVideoFrames(videoFile: File): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'

    const url = URL.createObjectURL(videoFile)
    video.src = url

    video.onloadedmetadata = () => {
      const duration = Math.min(video.duration, MAX_VIDEO_DURATION_SEC)
      const rawCount = Math.floor(duration / FRAME_INTERVAL_SEC)
      const frameCount = Math.max(1, Math.min(rawCount, MAX_FRAMES))
      const frames: Blob[] = []
      let currentFrame = 0

      if (frameCount === 1 && duration < FRAME_INTERVAL_SEC) {
        video.currentTime = 0
        const checkFrame = () => {
          if (video.readyState >= 2) {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(video, 0, 0)
              canvas.toBlob(
                (blob) => {
                  if (blob) frames.push(blob)
                  URL.revokeObjectURL(url)
                  resolve(frames.length ? frames : [])
                },
                'image/jpeg',
                0.85
              )
            } else {
              URL.revokeObjectURL(url)
              resolve([])
            }
          } else {
            requestAnimationFrame(checkFrame)
          }
        }
        video.onseeked = checkFrame
        return
      }

      const captureFrame = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          resolve(frames)
          return
        }
        ctx.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) frames.push(blob)
            currentFrame++
            if (currentFrame < frameCount) {
              video.currentTime = currentFrame * FRAME_INTERVAL_SEC
            } else {
              URL.revokeObjectURL(url)
              resolve(frames)
            }
          },
          'image/jpeg',
          0.85
        )
      }

      video.onseeked = captureFrame
      video.currentTime = 0
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video'))
    }
  })
}
