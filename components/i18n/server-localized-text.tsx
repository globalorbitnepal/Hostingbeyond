import {
  getRequestPreferences,
  localizeServerText,
} from "@/lib/i18n/server-locale";

/** Server-rendered copy from the visitor language cookie. */
export async function ServerLocalizedText({ text }: { text: string }) {
  const prefs = await getRequestPreferences();
  return localizeServerText(prefs.language, text);
}
