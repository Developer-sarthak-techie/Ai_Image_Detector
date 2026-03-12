import { useState, useEffect } from 'react'
import { ConfidenceScore } from './ConfidenceScore'
import { VideoFrameResults } from './VideoFrameResults'
import type { DetectionResult } from '@/lib/detection'
import type { VideoFrameResult } from '@/hooks/useDetection'

interface FilePreviewProps {
  file: File
  result: DetectionResult | null
  videoResults: VideoFrameResult[] | null
  status: { phase: string; message: string }
  loadProgress: number
  error: string | null
  onReset: () => void
}

export function FilePreview({
  file,
  result,
  videoResults,
  status,
  loadProgress,
  error,
  onReset,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const isLoading = status.phase === 'loading-model' || status.phase === 'processing'

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="relative rounded-xl overflow-hidden bg-surface-800 border border-surface-600 w-full max-w-sm aspect-video">
            {previewUrl && isImage && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            {previewUrl && isVideo && (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
                muted
                playsInline
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-surface-900/80 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-accent-real border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-400">{status.message}</p>
                <div className="w-48 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-real transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-500 truncate max-w-sm">
            {file.name}
          </p>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          {result && !error && (
            <>
              <div className="p-4 rounded-xl bg-surface-800 border border-surface-600">
                <ConfidenceScore result={result} size="lg" />
              </div>
              <p className="text-xs text-zinc-500">
                Detection powered by Nonescape. Identifies artifacts from DALL-E, Midjourney,
                Stable Diffusion, FLUX, Adobe Firefly, and 50+ other AI generators.
              </p>
            </>
          )}

          {videoResults && videoResults.length > 0 && (
            <VideoFrameResults results={videoResults} />
          )}

          {result && (
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-zinc-300 text-sm font-medium transition-colors"
            >
              Analyze another file
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
