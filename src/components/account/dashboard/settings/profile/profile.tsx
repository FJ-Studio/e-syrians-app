"use client";
import { Button, Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useState } from "react";
import AccountAvatar from "./avatar";
import AccountCensus from "./census";
import AccountAddress from "./country";
import AccountSocialLinks from "./social-links";
import UpdateBasicProfileData from "./update-basic";

type SectionId = "avatar" | "basic" | "address" | "links" | "census";

const sectionIds: SectionId[] = ["avatar", "basic", "address", "links", "census"];

const AccountProfile: FC = () => {
  const t = useTranslations("account.settings");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState();

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/profile/general");
      if (response.ok) {
        const data = await response.json();
        if (data?.success) setProfile(data?.data);
      }
    } catch {
      // Error handled by loading/profile state — retry button shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const scrollTo = (id: SectionId) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {!loading && !profile && (
        <Button onPress={() => getProfile()} color="danger" className="mb-4">
          {t("error.tryAgain")}
        </Button>
      )}

      {/* Section jump nav */}
      <nav className="mb-6 flex flex-wrap gap-2" aria-label={t("sections.nav")}>
        {sectionIds.map((id) => (
          <Chip
            key={id}
            as="button"
            variant="flat"
            className="cursor-pointer transition-colors hover:bg-primary-100"
            onClick={() => scrollTo(id)}
          >
            {t(`sections.${id}`)}
          </Chip>
        ))}
      </nav>

      <div className="space-y-8">
        {/* Personal info */}
        <section id="section-avatar" className="scroll-mt-24">
          <h3 className="text-default-700 mb-3 text-lg font-semibold">{t("sections.avatar")}</h3>
          <AccountAvatar user={profile} onUpdated={getProfile} />
        </section>

        <section id="section-basic" className="scroll-mt-24">
          <h3 className="text-default-700 mb-3 text-lg font-semibold">{t("sections.basic")}</h3>
          <UpdateBasicProfileData user={profile} />
        </section>

        <section id="section-address" className="scroll-mt-24">
          <h3 className="text-default-700 mb-3 text-lg font-semibold">{t("sections.address")}</h3>
          <AccountAddress user={profile} />
        </section>

        {/* Social */}
        <section id="section-links" className="scroll-mt-24">
          <h3 className="text-default-700 mb-3 text-lg font-semibold">{t("sections.links")}</h3>
          <AccountSocialLinks user={profile} />
        </section>

        {/* Census */}
        <section id="section-census" className="scroll-mt-24">
          <h3 className="text-default-700 mb-3 text-lg font-semibold">{t("sections.census")}</h3>
          <AccountCensus user={profile} />
        </section>
      </div>
    </>
  );
};

export default AccountProfile;
