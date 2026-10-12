/**
 * PDF 파일을 페이지별 JPEG 이미지로 변환
 * - pdfjs-dist를 동적 import하여 번들 크기 최소화
 * - 각 페이지를 Canvas에 렌더링 후 JPEG File로 변환
 */

const PDF_RENDER_SCALE = 2 // 렌더링 해상도 배율 (2 = 고해상도)
const JPEG_QUALITY = 0.85

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }))
        } else {
          reject(new Error('Canvas toBlob 실패'))
        }
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

/**
 * PDF File → 페이지별 JPEG File 배열
 * @param pdfFile PDF 파일
 * @returns 페이지별 JPEG 이미지 File 배열
 */
export async function pdfToImages(pdfFile: File): Promise<File[]> {
  const pdfjsLib = await import('pdfjs-dist')

  // Worker 설정 (번들된 worker 사용)
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString()

  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const baseName = pdfFile.name.replace(/\.pdf$/i, '')
  const images: File[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    await page.render({ canvas, canvasContext: ctx, viewport }).promise

    const fileName = pdf.numPages === 1
      ? `${baseName}.jpg`
      : `${baseName}_p${i}.jpg`
    const file = await canvasToFile(canvas, fileName)
    images.push(file)
  }

  return images
}
