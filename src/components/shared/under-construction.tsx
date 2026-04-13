import { useTranslations } from "next-intl";

const UnderConstruction: React.FC = () => {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-lg">{t("comingSoon")}</p>
    </div>
  );
};

export default UnderConstruction;
