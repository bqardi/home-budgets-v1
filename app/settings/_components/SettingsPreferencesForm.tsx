"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "@/lib/data/settings";
import { updateSettingsAction } from "../_actions/updateSettings";
import {
  useConstraintValidation,
  type FormValues,
} from "@/hooks/constraint-validation";

interface SettingsPreferencesFormProps {
  settings: Settings;
  onUpdate?: (updatedSettings: Settings) => void;
}

export function SettingsPreferencesForm({
  settings,
  onUpdate,
}: SettingsPreferencesFormProps) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useConstraintValidation({
      currency: settings.currency,
      locale: settings.locale,
    });
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (formData: FormValues & Partial<Settings>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateSettingsAction(formData);

    if (result.success && result.data) {
      setSuccess(true);
      onUpdate?.(result.data);
      // Hide success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError(result.error || "Failed to update settings");
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setError(null);
    setSuccess(false);
  };

  return (
    <form ref={formRef} noValidate onSubmit={(e) => handleSubmit(e, onSubmit)}>
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Currency Input */}
          <div className="relative flex flex-col">
            <label
              htmlFor="currency"
              className="text-sm font-medium text-muted-foreground"
            >
              Currency
            </label>
            <input
              id="currency"
              type="text"
              name="currency"
              required
              minLength={1}
              maxLength={3}
              placeholder="e.g., DKK, USD, EUR"
              value={values.currency}
              onChange={handleChange}
              onBlur={handleBlur}
              data-value-missing="Currency is required"
              data-too-short="Currency code should be at least 1 character"
              data-too-long="Currency code should be at most 3 characters"
              className={`mt-2 w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                touched.currency && errors.currency
                  ? "border-destructive outline-destructive"
                  : "border-input"
              }`}
              aria-invalid={!!(touched.currency && errors.currency)}
              aria-describedby={errors.currency ? "currency-error" : undefined}
              disabled={isLoading}
            />
            {touched.currency && errors.currency && (
              <span
                id="currency-error"
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive mt-1"
              >
                {errors.currency}
              </span>
            )}
          </div>

          {/* Locale Input */}
          <div className="relative flex flex-col">
            <label
              htmlFor="locale"
              className="text-sm font-medium text-muted-foreground"
            >
              Language & Region
            </label>
            <input
              id="locale"
              type="text"
              name="locale"
              required
              pattern="[a-z]{2}-[A-Z]{2}"
              placeholder="e.g., da-DK, en-US"
              value={values.locale}
              onChange={handleChange}
              onBlur={handleBlur}
              data-value-missing="Language & Region is required"
              data-pattern-mismatch="Please use format: xx-XX (e.g., da-DK)"
              className={`mt-2 w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                touched.locale && errors.locale
                  ? "border-destructive outline-destructive"
                  : "border-input"
              }`}
              aria-invalid={!!(touched.locale && errors.locale)}
              aria-describedby={errors.locale ? "locale-error" : undefined}
              disabled={isLoading}
            />
            {touched.locale && errors.locale && (
              <span
                id="locale-error"
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive mt-1"
              >
                {errors.locale}
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
            Settings updated successfully!
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
