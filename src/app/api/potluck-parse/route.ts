import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export type BulkRow = {
  'Item Name': string
  'Category': string
  'Quantity': string
  'Brought By': string
  'Notes': string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      return NextResponse.json({ error: 'Expected .xlsx or .xls file' }, { status: 400 })
    }

    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    const wb = new ExcelJS.Workbook()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buf as any)
    const ws = wb.worksheets[0]
    if (!ws) {
      return NextResponse.json({ error: 'No worksheet found' }, { status: 400 })
    }

    const data: BulkRow[] = []
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const v = row.values as (string | number | null | undefined)[]
      const a = (i: number) => (v[i] != null ? String(v[i]).trim() : '')
      if (!a(1) && !a(2) && !a(3)) return
      data.push({
        'Item Name': a(1),
        'Category': a(2),
        'Quantity': a(3) || '1',
        'Brought By': a(4),
        'Notes': a(5),
      })
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Potluck parse error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to parse Excel file' },
      { status: 500 }
    )
  }
}
