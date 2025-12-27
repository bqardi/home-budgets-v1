"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  validateCSVRows,
  ParsedCSVRow,
  CSVValidationResult,
} from "@/lib/csv/validate";

interface ImportCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawCSVData: Record<string, string | number>[];
  onCancel?: () => void;
  onConfirm: (validRows: ParsedCSVRow[], missingCategories: string[]) => void;
  existingCategoryNames: string[];
}

export function ImportCSVModal({
  open,
  onOpenChange,
  rawCSVData,
  onCancel,
  onConfirm,
  existingCategoryNames,
}: ImportCSVModalProps) {
  const [validation, setValidation] = useState<CSVValidationResult | null>(
    null
  );

  // Validate on mount or when data changes
  useEffect(() => {
    if (open && rawCSVData.length > 0) {
      const result = validateCSVRows(rawCSVData, existingCategoryNames);
      setValidation(result);
    }
  }, [open, rawCSVData, existingCategoryNames]);

  if (!validation) {
    return null;
  }

  const canProceed = validation.errors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import CSV - Validation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valid rows */}
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {validation.validRows.length} valid row
                {validation.validRows.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">Ready to import</p>
            </div>
          </div>

          {/* Missing categories */}
          {validation.missingCategories.length > 0 && (
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                  {validation.missingCategories.length} new categor
                  {validation.missingCategories.length !== 1 ? "ies" : "y"}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  These will be created:
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {validation.missingCategories.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-red-900 dark:text-red-100">
                  {validation.errors.length} validation error
                  {validation.errors.length !== 1 ? "s" : ""}
                </p>
                <ul className="mt-2 space-y-1">
                  {validation.errors.map((error, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-red-700 dark:text-red-300"
                    >
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm(validation.validRows, validation.missingCategories);
                onOpenChange(false);
              }}
              disabled={!canProceed}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
