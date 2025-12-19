import { getSettings } from "@/lib/data/settings";
import { SettingsPreferencesForm } from "./_components/SettingsPreferencesForm";
import { Container } from "@/components/container";

export default async function SettingsPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <Container className="bg-background py-8">
        <p className="text-destructive">Error loading settings</p>
      </Container>
    );
  }

  return (
    <Container className="bg-background py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your household settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <SettingsPreferencesForm settings={settings} />
      </div>
    </Container>
  );
}
