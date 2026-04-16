"use client";
import { Button, Chip, Divider } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useState } from "react";
import AccountAvatar from "./avatar";
import AccountCensus from "./census";
import AccountAddress from "./country";
import AccountSocialLinks from "./social-links";
import UpdateBasicProfileData from "./update-basic";

type SectionId = "personal" | "address" | "links" | "census";

const sectionIds: SectionId[] = ["personal", "address", "links", "census"];

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
        {/* ── Personal info ── */}
        <section id="section-personal" className="scroll-mt-24">
          <h3 className="text-default-700 mb-4 text-lg font-semibold">{t("sections.personal")}</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AccountAvatar user={profile} onUpdated={getProfile} />
            <UpdateBasicProfileData user={profile} />
          </div>
        </section>

        <Divider />

        {/* ── Location ── */}
        <section id="section-address" className="scroll-mt-24">
          <h3 className="text-default-700 mb-4 text-lg font-semibold">{t("sections.address")}</h3>
          <AccountAddress user={profile} />
        </section>

        <Divider />

        {/* ── Social links ── */}
        <section id="section-links" className="scroll-mt-24">
          <h3 className="text-default-700 mb-4 text-lg font-semibold">{t("sections.links")}</h3>
          <AccountSocialLinks user={profile} />
        </section>

        <Divider />

        {/* ── Census ── */}
        <section id="section-census" className="scroll-mt-24">
          <h3 className="text-default-700 mb-4 text-lg font-semibold">{t("sections.census")}</h3>
          <AccountCensus user={profile} />
        </section>
      </div>
    </>
  );
};

export default AccountProfile;
