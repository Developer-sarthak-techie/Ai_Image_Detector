import type { VideoFrameResult } from '@/hooks/useDetection'

interface VideoFrameResultsProps {
  results: VideoFrameResult[]
}

export function VideoFrameResults({ results }: VideoFrameResultsProps) {
  const aiCount = results.filter((r) => r.result.isSynthetic).length
  const total = results.length

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">
        Frame-by-frame analysis ({aiCount} of {total} frames detected as AI)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-56 overflow-y-auto">
        {results.map(({ frameIndex, result }) => {
          const pct = Math.round(result.confidence * 100)
          const isAI = result.isSynthetic
          const isUncertain = pct >= 40 && pct <= 60
          return (
            <div
              key={frameIndex}
              className="p-2 rounded-lg bg-surface-800 border border-surface-600 flex items-center justify-between gap-2"
            >
              <span className="text-xs text-zinc-500">#{frameIndex + 1}</span>
              <span
                className={`text-xs font-medium ${
                  isUncertain ? 'text-amber-500' : isAI ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {isUncertain ? '?' : isAI ? 'AI' : 'Real'} {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
