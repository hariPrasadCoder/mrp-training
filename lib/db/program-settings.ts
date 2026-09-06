import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { programSettings } from "./schema";

export type ScheduleSettings = {
  saturdayBookingUrl: string;
  officeHourBookingUrl: string;
};

export const emptyScheduleSettings: ScheduleSettings = {
  saturdayBookingUrl: "",
  officeHourBookingUrl: "",
};

export async function getScheduleSettings(): Promise<ScheduleSettings> {
  const [settings] = await getDb()
    .select({
      saturdayBookingUrl: programSettings.saturdayBookingUrl,
      officeHourBookingUrl: programSettings.officeHourBookingUrl,
    })
    .from(programSettings)
    .where(eq(programSettings.id, "default"))
    .limit(1);

  return {
    saturdayBookingUrl: settings?.saturdayBookingUrl ?? "",
    officeHourBookingUrl: settings?.officeHourBookingUrl ?? "",
  };
}

export async function saveScheduleSettings(settings: ScheduleSettings) {
  const [saved] = await getDb()
    .insert(programSettings)
    .values({ id: "default", ...settings, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: programSettings.id,
      set: { ...settings, updatedAt: new Date() },
    })
    .returning({
      saturdayBookingUrl: programSettings.saturdayBookingUrl,
      officeHourBookingUrl: programSettings.officeHourBookingUrl,
    });

  return {
    saturdayBookingUrl: saved.saturdayBookingUrl ?? "",
    officeHourBookingUrl: saved.officeHourBookingUrl ?? "",
  };
}
