import * as XLSX from 'xlsx'

interface ExcelHeader {
  key: string
  label: string
}

export function exportToExcel(
  data: Record<string, unknown>[],
  headers: ExcelHeader[],
  fileName: string,
) {
  const rows = data.map((row, index) => {
    const obj: Record<string, unknown> = {}
    for (const h of headers) {
      if (h.key === '__index__') {
        obj[h.label] = index + 1
      } else {
        obj[h.label] = row[h.key] ?? ''
      }
    }
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`)
}
