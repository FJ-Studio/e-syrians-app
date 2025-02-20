import { useTranslations } from "next-intl";
import { FC } from "react";
type Props = {
  success: boolean;
};
const EmailVerification: FC<Props> = ({ success }) => {
  const t = useTranslations("emailVerification");
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-gray-500">{success ? t("success") : t("error")}</p>
    </div>
  );
};

export default EmailVerification;
