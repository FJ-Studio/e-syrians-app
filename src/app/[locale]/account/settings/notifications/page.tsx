import { redirect } from "next/navigation";

export default function SettingsNotificationsRedirect() {
  redirect("/account/notifications/settings");
}
