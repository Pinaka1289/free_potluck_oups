import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { ITEM_CATEGORIES } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'PotluckPartys'
  const ws = wb.addWorksheet('Potluck Items', { views: [{ state: 'frozen', ySplit: 1 }] })

  const headers = ['Item Name', 'Category', 'Quantity', 'Brought By', 'Notes']
  const exampleRows: (string | number)[][] = [
    ['Chicken Salad', 'Appetizers', 1, 'John Doe', 'Please make enough for 10 people'],
    ['Lemonade', 'Drinks', 2, '', 'Homemade, if possible'],
    ['Pizza', 'Main Dishes', 1, 'Jane', 'Vegetarian option needed'],
  ]

  const headerRow = ws.addRow(headers)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE87422' },
  }
  headerRow.alignment = { horizontal: 'left' }

  for (const row of exampleRows) {
    ws.addRow(row)
  }

  ws.getColumn(1).width = 22
  ws.getColumn(2).width = 18
  ws.getColumn(3).width = 10
  ws.getColumn(4).width = 14
  ws.getColumn(5).width = 28

  const categoryList = ITEM_CATEGORIES.join(',')
  const categoryFormula = `"${categoryList}"`
  const dv = (ws as { dataValidations?: { add: (addr: string, v: object) => void } }).dataValidations
  if (dv) {
    for (let r = 2; r <= 500; r++) {
      dv.add(`B${r}`, {
        type: 'list',
        allowBlank: true,
        formulae: [categoryFormula],
        showErrorMessage: true,
        errorTitle: 'Invalid category',
        error: 'Select a category from the dropdown list.',
        showInputMessage: true,
        promptTitle: 'Category',
        prompt: 'Choose from: ' + ITEM_CATEGORIES.join(', '),
      })
    }
  }

  const buf = await wb.xlsx.writeBuffer()
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="potluck-items-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}
