import { useState, useCallback } from 'react'
import { predict, predictBatch } from '@/lib/detection'
import { extractVideoFrames } from '@/lib/videoFrames'
import type { DetectionResult } from '@/lib/detection'

export type DetectionStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

export interface UseDetectionReturn {
  file: File | null
  status: Status
  result: DetectionResult | null
  videoResults: VideoFrameResult[] | null
  loadProgress: number
  error: string | null
  detectFile: (file: File) => Promise<void>
  reset: () => void
}

export interface Status {
  phase: DetectionStatus
  message: string
}

export interface VideoFrameResult {
  frameIndex: number
  result: DetectionResult
  thumbnail?: string
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
const VIDEO_TYPES = ['video/mp4', 'video/webm']

function isImage(file: File): boolean {
  return IMAGE_TYPES.includes(file.type)
}

function isVideo(file: File): boolean {
  return VIDEO_TYPES.includes(file.type)
}

export function useDetection(): UseDetectionReturn {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>({ phase: 'idle', message: '' })
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [videoResults, setVideoResults] = useState<VideoFrameResult[] | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setFile(null)
    setStatus({ phase: 'idle', message: '' })
    setResult(null)
    setVideoResults(null)
    setLoadProgress(0)
    setError(null)
  }, [])

  const detectFile = useCallback(async (selectedFile: File) => {
    reset()
    setError(null)
    setFile(selectedFile)

    if (isImage(selectedFile)) {
      setStatus({ phase: 'loading-model', message: 'Loading AI model...' })
      try {
        const res = await predict(selectedFile, (p) => setLoadProgress(p.percent))
        setLoadProgress(100)
        setStatus({ phase: 'done', message: 'Analysis complete' })
        setResult(res)
      } catch (err) {
        setStatus({ phase: 'error', message: 'Detection failed' })
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } else if (isVideo(selectedFile)) {
      setStatus({ phase: 'loading-model', message: 'Loading AI model...' })
      try {
        setStatus({ phase: 'processing', message: 'Extracting video frames...' })
        const frames = await extractVideoFrames(selectedFile)

        if (frames.length === 0) {
          setError('Could not extract frames from video')
          setStatus({ phase: 'error', message: 'Extraction failed' })
          return
        }

        setStatus({ phase: 'processing', message: 'Analyzing frames...' })
        const frameFiles = frames.map((blob, i) => new File([blob], `frame-${i}.jpg`, { type: 'image/jpeg' }))
        const results = await predictBatch(frameFiles, (p) => setLoadProgress(p.percent))

        setVideoResults(results.map((r, i) => ({ frameIndex: i, result: r })))
        const aiCount = results.filter((r) => r.isSynthetic).length
        const avgConf =
          results.reduce((a, r) => a + r.confidence, 0) / results.length
        setResult({
          isSynthetic: aiCount > results.length / 2,
          confidence: avgConf,
        })
        setLoadProgress(100)
        setStatus({ phase: 'done', message: 'Analysis complete' })
      } catch (err) {
        setStatus({ phase: 'error', message: 'Detection failed' })
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } else {
      setError(
        'Unsupported format. Use JPEG, PNG, WebP, GIF, BMP, MP4, or WebM.'
      )
      setStatus({ phase: 'error', message: 'Unsupported format' })
    }
  }, [reset])

  return {
    file,
    status,
    result,
    videoResults,
    loadProgress,
    error,
    detectFile,
    reset,
  }
}
