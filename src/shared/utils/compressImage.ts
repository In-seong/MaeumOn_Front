/**
 * 클라이언트 이미지 압축 유틸리티
 * - 모바일 고해상도 사진(10MB+)을 자동 압축
 * - Canvas API로 리사이즈 + JPEG 변환
 * - PDF는 압축 없이 통과
 */

interface CompressOptions {
  /** 긴 변 최대 픽셀 (기본: 1920) */
  maxDimension?: number
  /** JPEG 품질 0~1 (기본: 0.8) */
  quality?: number
  /** 압축 대상 최소 크기 bytes (기본: 1MB) — 이보다 작으면 원본 유지 */
  minSizeToCompress?: number
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 1920,
  quality: 0.8,
  minSizeToCompress: 1 * 1024 * 1024, // 1MB
}

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

function isCompressibleImage(file: File): boolean {
  return IMAGE_TYPES.includes(file.type.toLowerCase())
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob 실패'))
      },
      'image/jpeg',
      quality,
    )
  })
}

/**
 * 이미지 파일을 압축하여 반환
 * - 이미지가 아니거나 minSizeToCompress 미만이면 원본 반환
 * - 압축 후 오히려 커지면 원본 반환
 */
export async function compressImage(file: File, options?: CompressOptions): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // PDF 등 이미지가 아닌 파일은 그대로
  if (!isCompressibleImage(file)) return file

  // 작은 파일은 압축 불필요
  if (file.size < opts.minSizeToCompress) return file

  try {
    const dataUrl = await fileToDataUrl(file)
    const img = await loadImage(dataUrl)

    // 리사이즈 계산
    let { width, height } = img
    if (width > opts.maxDimension || height > opts.maxDimension) {
      if (width > height) {
        height = Math.round(height * (opts.maxDimension / width))
        width = opts.maxDimension
      } else {
        width = Math.round(width * (opts.maxDimension / height))
        height = opts.maxDimension
      }
    }

    // Canvas에 그리기
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(img, 0, 0, width, height)

    // JPEG Blob 생성
    const blob = await canvasToBlob(canvas, opts.quality)

    // 압축 후 오히려 커지면 원본 유지
    if (blob.size >= file.size) return file

    // 파일명 확장자를 .jpg로 변경
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const compressedFile = new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    return compressedFile
  } catch {
    // 압축 실패 시 원본 반환
    return file
  }
}

/**
 * 여러 파일을 병렬 압축
 */
export async function compressImages(files: File[], options?: CompressOptions): Promise<File[]> {
  return Promise.all(files.map(f => compressImage(f, options)))
}
