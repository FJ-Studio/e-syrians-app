import NotificationsTabs from "@/components/account/dashboard/notifications/notifications-tabs";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotificationsTabs>{children}</NotificationsTabs>;
}
