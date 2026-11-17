import * as XLSX from 'xlsx'

interface ExcelHeader {
  key: string
  label: string
}

interface SheetData {
  name: string
  data: Record<string, unknown>[]
  headers: ExcelHeader[]
}

function buildSheet(data: Record<string, unknown>[], headers: ExcelHeader[]): XLSX.WorkSheet {
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
  return XLSX.utils.json_to_sheet(rows)
}

export function exportToExcel(
  data: Record<string, unknown>[],
  headers: ExcelHeader[],
  fileName: string,
) {
  const ws = buildSheet(data, headers)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`)
}

export function exportToExcelMultiSheet(
  sheets: SheetData[],
  fileName: string,
) {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = buildSheet(sheet.data, sheet.headers)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }

  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`)
}
