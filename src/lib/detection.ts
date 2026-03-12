import { LocalClassifier } from '@aedilic/nonescape'

const MINI_MODEL_URL = 'https://nonescape.sfo2.cdn.digitaloceanspaces.com/nonescape-mini-v0.onnx'

let classifierInstance: LocalClassifier | null = null
let initPromise: Promise<void> | null = null

export interface DetectionResult {
  isSynthetic: boolean
  confidence: number
}

export interface LoadingProgress {
  current: number
  total: number
  percent: number
}

export async function getClassifier(
  onProgress?: (progress: LoadingProgress) => void
): Promise<LocalClassifier> {
  if (classifierInstance) return classifierInstance

  if (initPromise) {
    await initPromise
    return classifierInstance!
  }

  initPromise = (async () => {
    classifierInstance = new LocalClassifier({
      modelPath: MINI_MODEL_URL,
      threshold: 0.5,
      onProgress: onProgress
        ? (p) => onProgress({ current: p.current, total: p.total, percent: Math.round((p.current / p.total) * 100) })
        : undefined,
    })
    await classifierInstance.initialize()
  })()

  await initPromise
  return classifierInstance!
}

export async function predict(
  input: File | Blob | HTMLImageElement,
  onProgress?: (progress: LoadingProgress) => void
): Promise<DetectionResult> {
  const classifier = await getClassifier(onProgress)

  const raw =
    input instanceof HTMLImageElement
      ? await classifier.predict(input)
      : input instanceof File || input instanceof Blob
        ? await classifier.predict(input as File)
        : (() => {
            throw new Error('Unsupported input type')
          })()

  if (!raw || typeof raw !== 'object' || !('isSynthetic' in raw)) {
    throw new Error('Detection failed')
  }
  return { isSynthetic: raw.isSynthetic, confidence: raw.confidence }
}

export async function predictBatch(
  inputs: (File | Blob)[],
  onProgress?: (progress: LoadingProgress) => void
): Promise<DetectionResult[]> {
  const classifier = await getClassifier(onProgress)
  const raw = await classifier.predict(inputs as File[])
  const arr = Array.isArray(raw) ? raw : [raw]
  return arr
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) => ({ isSynthetic: r.isSynthetic, confidence: r.confidence }))
}
