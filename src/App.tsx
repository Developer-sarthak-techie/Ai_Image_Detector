import { useDetection } from '@/hooks/useDetection'
import { DropZone } from '@/components/DropZone'
import { FilePreview } from '@/components/FilePreview'

function App() {
  const {
    file,
    status,
    result,
    videoResults,
    loadProgress,
    error,
    detectFile,
    reset,
  } = useDetection()

  const hasFile = file !== null

  return (
    <div className="min-h-screen bg-surface-900">
      <header className="border-b border-surface-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            AI Image Detector
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Verify if images or videos are real or AI-generated. Runs entirely in your browser — no uploads to any server.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!hasFile ? (
          <DropZone
            onFileSelect={detectFile}
            disabled={status.phase === 'loading-model' || status.phase === 'processing'}
          />
        ) : file ? (
          <FilePreview
            file={file}
            result={result}
            videoResults={videoResults}
            status={status}
            loadProgress={loadProgress}
            error={error}
            onReset={reset}
          />
        ) : null}
      </main>

      <footer className="border-t border-surface-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-zinc-500">
          Powered by{' '}
          <a
            href="https://www.nonescape.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-real hover:underline"
          >
            Nonescape
          </a>
          {' '}• Detects DALL-E, Midjourney, Stable Diffusion, FLUX & 50+ generators
        </div>
      </footer>
    </div>
  )
}

export default App
