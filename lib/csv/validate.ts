export interface ParsedCSVRow {
  description: string;
  category: string;
  type: "income" | "expense";
  monthlyAmounts: Record<number, number>; // { 1: 1000, 2: 1000, ... }
}

export interface CSVValidationResult {
  validRows: ParsedCSVRow[];
  missingCategories: string[];
  errors: string[];
}

export function validateCSVRows(
  rawRows: Record<string, string | number>[],
  existingCategoryNames: string[] = []
): CSVValidationResult {
  const validRows: ParsedCSVRow[] = [];
  const missingCategories = new Set<string>();
  const errors: string[] = [];
  const existingCategorySet = new Set(existingCategoryNames);

  if (rawRows.length === 0) {
    errors.push("CSV file is empty");
    return { validRows, missingCategories: [], errors };
  }

  rawRows.forEach((row, index) => {
    const rowNum = index + 1;
    const columns = Object.values(row).map((v) => String(v || "").trim());

    // Expect exactly 15 columns: Description, Category, Type, + 12 months
    if (columns.length < 15) {
      errors.push(
        `Row ${rowNum}: Expected 15 columns (Description, Category, Type, + 12 months), got ${columns.length}`
      );
      return;
    }

    const description = columns[0];
    const category = columns[1];
    const type = columns[2].toLowerCase();
    const monthValues = columns.slice(3, 15); // 12 month values

    // Validate required fields
    if (!description) {
      errors.push(`Row ${rowNum}: Missing description (column 1)`);
      return;
    }

    if (description.length > 500) {
      errors.push(`Row ${rowNum}: Description too long (max 500 characters)`);
      return;
    }

    if (!category) {
      errors.push(`Row ${rowNum}: Missing category (column 2)`);
      return;
    }

    if (category.length > 100) {
      errors.push(`Row ${rowNum}: Category too long (max 100 characters)`);
      return;
    }

    if (!["income", "expense"].includes(type)) {
      errors.push(
        `Row ${rowNum}: Type must be 'income' or 'expense', got '${type}' (column 3)`
      );
      return;
    }

    // Parse monthly amounts
    const monthlyAmounts: Record<number, number> = {};
    let hasValidAmount = false;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthNum = monthIndex + 1;
      const amountStr = monthValues[monthIndex];
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) {
        errors.push(
          `Row ${rowNum}: Invalid amount for month ${monthNum}: '${amountStr}'`
        );
        return;
      }

      if (amount < 0) {
        errors.push(
          `Row ${rowNum}: Amount for month ${monthNum} cannot be negative`
        );
        return;
      }

      monthlyAmounts[monthNum] = amount;
      if (amount > 0) hasValidAmount = true;
    }

    // Reject rows with no valid amounts
    if (!hasValidAmount) {
      errors.push(`Row ${rowNum}: At least one month must have an amount > 0`);
      return;
    }

    // Track missing categories only if they don't already exist
    if (!existingCategorySet.has(category)) {
      missingCategories.add(category);
    }

    validRows.push({
      description,
      category,
      type: type as "income" | "expense",
      monthlyAmounts,
    });
  });

  return {
    validRows,
    missingCategories: Array.from(missingCategories),
    errors,
  };
}
