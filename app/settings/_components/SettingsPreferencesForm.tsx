"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "@/lib/data/settings";
import { updateSettingsAction } from "../_actions/updateSettings";

interface SettingsPreferencesFormProps {
  settings: Settings;
  onUpdate?: (updatedSettings: Settings) => void;
}

export function SettingsPreferencesForm({
  settings,
  onUpdate,
}: SettingsPreferencesFormProps) {
  const [currency, setCurrency] = useState(settings.currency);
  const [locale, setLocale] = useState(settings.locale);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateSettingsAction({
      currency,
      locale,
    });

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Currency Input */}
          <div>
            <label
              htmlFor="currency"
              className="text-sm font-medium text-muted-foreground"
            >
              Currency
            </label>
            <input
              id="currency"
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g., DKK, USD, EUR"
              className="mt-2 w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Locale Input */}
          <div>
            <label
              htmlFor="locale"
              className="text-sm font-medium text-muted-foreground"
            >
              Language & Region
            </label>
            <input
              id="locale"
              type="text"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="e.g., da-DK, en-US"
              className="mt-2 w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
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
            onClick={() => {
              setCurrency(settings.currency);
              setLocale(settings.locale);
              setError(null);
              setSuccess(false);
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
