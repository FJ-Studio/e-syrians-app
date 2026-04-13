"use client";

import { Tab, Tabs } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { FC, Key, ReactNode } from "react";

export interface RouteTab {
  key: string;
  title: string;
  href: string;
}

interface RouteTabsProps {
  tabs: RouteTab[];
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * Renders HeroUI Tabs whose selection is driven by the current URL path.
 * Clicking a tab navigates to its `href`. The `children` prop renders the
 * active page content below the tab bar.
 */
const RouteTabs: FC<RouteTabsProps> = ({ tabs, children, ariaLabel }) => {
  const pathname = usePathname();
  const { push } = useRouter();

  // Find the active tab by matching the end of the pathname
  const activeKey = tabs.find((t) => pathname.endsWith(t.href) || pathname.endsWith(t.href + "/"))?.key ?? tabs[0]?.key;

  const handleSelectionChange = (key: Key) => {
    const tab = tabs.find((t) => t.key === String(key));
    if (tab) push(tab.href);
  };

  return (
    <>
      <Tabs aria-label={ariaLabel} selectedKey={activeKey} onSelectionChange={handleSelectionChange}>
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.title} />
        ))}
      </Tabs>
      <div className="mt-4">{children}</div>
    </>
  );
};

export default RouteTabs;
