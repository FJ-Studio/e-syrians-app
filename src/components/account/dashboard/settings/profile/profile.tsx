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
            className="hover:bg-primary-100 cursor-pointer transition-colors"
            onClick={() => scrollTo(id)}
          >
            {t(`sections.${id}`)}
          </Chip>
        ))}
      </nav>

      <div className="space-y-8">
        <section id="section-avatar" className="scroll-mt-24">
          <AccountAvatar user={profile} onUpdated={getProfile} />
        </section>

        <section id="section-basic" className="scroll-mt-24">
          <UpdateBasicProfileData user={profile} />
        </section>

        <section id="section-address" className="scroll-mt-24">
          <AccountAddress user={profile} />
        </section>

        <section id="section-links" className="scroll-mt-24">
          <AccountSocialLinks user={profile} />
        </section>

        <section id="section-census" className="scroll-mt-24">
          <AccountCensus user={profile} />
        </section>
      </div>
    </>
  );
};

export default AccountProfile;
