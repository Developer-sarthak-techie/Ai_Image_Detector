import { useCallback, useState } from 'react'

const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,video/mp4,video/webm'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
      'video/mp4', 'video/webm',
    ]
    if (!validTypes.includes(file.type)) {
      return `Unsupported format. Use JPEG, PNG, WebP, GIF, BMP, MP4, or WebM.`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }, [])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const file = files[0]
      const err = validateFile(file)
      if (err) {
        setDragError(err)
        setTimeout(() => setDragError(null), 3000)
        return
      }
      onFileSelect(file)
    },
    [onFileSelect, validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      setDragError(null)
      if (disabled) return
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, disabled]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    setIsDragOver(true)
    setDragError(null)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setDragError(null)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      e.target.value = ''
    },
    [handleFiles]
  )

  return (
    <div className="relative">
      <label
        className={`
          flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 ease-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragOver
            ? 'border-accent-real bg-accent-real/5 scale-[1.01]'
            : 'border-surface-600 hover:border-zinc-500 hover:bg-surface-800'
          }
          ${dragError ? 'border-accent-ai animate-shake' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          className="hidden"
          accept={ACCEPT}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-surface-700 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-zinc-200 font-medium">
              {isDragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Images: JPEG, PNG, WebP, GIF, BMP • Videos: MP4, WebM • Max {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      </label>
      {dragError && (
        <p className="absolute -bottom-6 left-0 right-0 text-center text-sm text-accent-ai animate-fade-in">
          {dragError}
        </p>
      )}
    </div>
  )
}
