import { getStoreSettings } from "@/app/actions/settings"
import { SettingsClient } from "./SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const settings = await getStoreSettings()

  return <SettingsClient initialSettings={settings} />
}
