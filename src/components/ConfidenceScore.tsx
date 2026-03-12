import type { DetectionResult } from '@/lib/detection'

interface ConfidenceScoreProps {
  result: DetectionResult
  size?: 'sm' | 'md' | 'lg'
}

export function ConfidenceScore({ result, size = 'md' }: ConfidenceScoreProps) {
  const { isSynthetic, confidence } = result
  const percent = Math.round(confidence * 100)

  const isUncertain = percent >= 40 && percent <= 60
  const verdictColorClass = isUncertain
    ? 'text-amber-500'
    : isSynthetic
      ? 'text-rose-500'
      : 'text-emerald-500'

  const barColor = isUncertain
    ? 'bg-amber-500'
    : isSynthetic
      ? 'bg-rose-500'
      : 'bg-emerald-500'

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const barSizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className={`space-y-3 ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-300">Confidence</span>
        <span className={`font-bold ${verdictColorClass}`}>
          {percent}%
        </span>
      </div>
      <div className={`w-full bg-surface-700 rounded-full overflow-hidden ${barSizes[size]}`}>
        <div
          className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`${verdictColorClass} font-semibold`}>
        {isUncertain
          ? 'Uncertain — manual review recommended'
          : isSynthetic
            ? 'AI Generated'
            : 'Real / Human-Created'}
      </p>
    </div>
  )
}
