# 📤 Bulk Upload Guide for PotluckPartys

## Quick Start

1. Click **"Bulk Upload"** on your event page
2. **Download the Excel template** (Category column has a **dropdown**—select from the list)
3. Fill in your items in Excel
4. Save and upload the .xlsx file (or use CSV)
5. Review results and confirm!

## Excel Template (Recommended)

The **Excel template** (.xlsx) has a **dropdown** on the **Category** column. Open it in Excel or Google Sheets, click a Category cell, and choose from the list—no typos, no guessing. You can also upload CSV if you prefer.

## CSV Template Format

If using CSV, the template includes a reference row with all valid categories. Rows that start with `>>` are skipped during upload.

The file should have these columns (in this exact order):

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| Item Name | ✅ Yes | Name of the item | "Pasta Salad" |
| Category | ✅ Yes | Item category (see list below) | "Side Dishes" |
| Quantity | No | Number of servings/items (default: 1) | "2" |
| Brought By | No | Person bringing this item | "John Doe" |
| Notes | No | Additional details or instructions | "Vegetarian option" |

## Valid Categories

Use one of these exact categories (case-sensitive):

- Appetizers
- Main Dishes
- Side Dishes
- Salads
- Desserts
- Drinks
- Snacks
- Bread & Rolls
- Utensils & Plates
- Other

## Example CSV Content

```csv
Item Name,Category,Quantity,Brought By,Notes
">> Valid categories (use exactly): Appetizers | Main Dishes | Side Dishes | Salads | Desserts | Drinks | Snacks | Bread & Rolls | Utensils & Plates | Other",,,,
Pasta Salad,Side Dishes,1,John Doe,Vegetarian option available
Grilled Chicken,Main Dishes,2,Jane Smith,BBQ sauce on the side
Fruit Platter,Desserts,1,,Fresh seasonal fruits
Iced Tea,Drinks,3,,Unsweetened and sweetened options
Paper Plates,Utensils & Plates,1,,50 count package
```

The first data row lists all valid categories; you can keep or delete it. Rows starting with `>>` are skipped on upload.

## Tips for Success

### ✅ DO:
- Use the exact category names from the list above
- Leave "Brought By" empty if item is unclaimed
- Use commas only as column separators
- Keep item names under 100 characters
- Test with a small file first (5-10 items)

### ❌ DON'T:
- Don't use special characters in item names (like quotes within names)
- Don't skip required columns (Item Name, Category)
- Don't use negative quantities
- Don't exceed 100 items per upload

## What Happens During Upload

1. **Validation**: Each row is checked for required fields and valid categories
2. **Error Reporting**: Invalid rows are skipped with specific error messages
3. **Bulk Insert**: Valid items are added to your event
4. **Real-time Update**: All guests see the new items immediately
5. **Summary**: You see how many items succeeded/failed

## Common Errors

| Error Message | Solution |
|---------------|----------|
| "Item name is required" | Add a name in the Item Name column |
| "Invalid category" | Use exact category name from the list |
| "Quantity must be at least 1" | Enter a positive number |
| "Failed to parse CSV" | Check for formatting issues, use template |

## Excel Users

**Use the Excel template** for the best experience:
1. Download the **Excel template** (.xlsx) from the Bulk Upload modal
2. Open in Excel—the **Category** column has a **dropdown** in each cell
3. Click a Category cell → use the dropdown to pick a category
4. Fill in Item Name, Quantity, Brought By, Notes
5. **Save** and upload the .xlsx file

You can also use CSV: open the CSV template in Excel, edit, **Save As** → "CSV (Comma delimited) (*.csv)", then upload.

## Limits

- **Maximum items per upload**: 100
- **File size limit**: 5MB
- **File formats**: Excel (.xlsx, .xls) or CSV (.csv)

## Example Workflow

### Scenario: Planning Office Potluck

1. Download template
2. Open in Excel/Google Sheets
3. Add your items:
   ```
   Pizza,Main Dishes,3,Tom,Hawaiian and Pepperoni
   Garden Salad,Salads,2,Lisa,With vinaigrette dressing
   Cookies,Desserts,4,,Homemade chocolate chip
   Soda,Drinks,6,Mike,Assorted flavors
   Napkins,Utensils & Plates,1,Sarah,100 count
   ```
4. Save as CSV
5. Upload to event
6. Done! All items added instantly

## Need Help?

- Use the template as a starting point
- Test with 2-3 items first
- Check the upload results for specific error messages
- Contact support if you encounter issues

---

Happy bulk uploading! 🎉
