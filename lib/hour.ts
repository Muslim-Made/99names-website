export type Hour = "fajr" | "morning" | "dhuhr" | "asr" | "maghrib" | "isha";
export const HOURS: Hour[] = ["fajr", "morning", "dhuhr", "asr", "maghrib", "isha"];
export const HOUR_LABEL: Record<Hour, string> = {
  fajr: "Fajr", morning: "Morning", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
};
export const isDark = (h: Hour) => h === "maghrib" || h === "isha";

/** Fallback when we have no location: a reasonable clock-based day. */
export function hourFromClock(d = new Date()): Hour {
  const m = d.getHours() * 60 + d.getMinutes();
  if (m < 4 * 60 + 30) return "isha";
  if (m < 6 * 60 + 30) return "fajr";
  if (m < 12 * 60) return "morning";
  if (m < 15 * 60 + 30) return "dhuhr";
  if (m < 18 * 60) return "asr";
  if (m < 19 * 60 + 45) return "maghrib";
  return "isha";
}

export async function hourFromLocation(lat: number, lng: number, d = new Date()): Promise<Hour> {
  const adhan = await import("adhan");
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  const t = new adhan.PrayerTimes(new adhan.Coordinates(lat, lng), d, params);
  if (d < t.fajr) return "isha";
  if (d < t.sunrise) return "fajr";
  if (d < t.dhuhr) return "morning";
  if (d < t.asr) return "dhuhr";
  if (d < t.maghrib) return "asr";
  if (d < t.isha) return "maghrib";
  return "isha";
}

/** Hour palette for a name by its number (used on cards/grids regardless of the live hour). */
export function hourForName(n: number): Hour {
  if (n <= 17) return "fajr";
  if (n <= 34) return "morning";
  if (n <= 50) return "dhuhr";
  if (n <= 66) return "asr";
  if (n <= 82) return "maghrib";
  return "isha";
}
