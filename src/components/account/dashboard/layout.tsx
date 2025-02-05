"use client";
import Container from "@/components/shared/container";
import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Listbox, ListboxItem } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations("account.dashboard");
  const session = useSession();
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">
      <div className="bg-primary h-12 flex items-center">
        <Container className="flex items-center text-white justify-between">
          <span>
            {t("welcome", {
              name: session.data?.user.name,
            })}
          </span>
          <button className="bg-transparent border-0" onClick={() => signOut()}>
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white" />
          </button>
        </Container>
      </div>
      <Container className="mt-4">
        <div className="flex items-start gap-x-4">
          <div className="bg-gray-50 w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
            <Listbox>
              <ListboxItem startContent={<ChartBarIcon className="size-6" />}>
                <Link className="w-full flex" href="/account/polls">
                  {t("polls")}
                </Link>
              </ListboxItem>
              <ListboxItem startContent={<Cog6ToothIcon className="size-6" />}>
                <Link className="w-full flex" href="/account/settings">
                  {t("settings")}
                </Link>
              </ListboxItem>
            </Listbox>
          </div>
          <div>{children}</div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardLayout;
