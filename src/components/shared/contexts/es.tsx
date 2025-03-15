"use client";
import { CensusStats } from "@/lib/types/census";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ESContextType = {
  openCensusForm: Dispatch<SetStateAction<boolean>>;
  censusFormIsOpened: boolean;
  censusStats?: CensusStats;
  updateCensusStats: () => void;
};

export const EsContext = createContext<ESContextType>({
  openCensusForm: () => {},
  censusFormIsOpened: false,
  updateCensusStats: () => {},
  censusStats: {},
});

export const useEsyrian = (): ESContextType => useContext(EsContext);

const EsyrianProvider = ({ children }: { children: ReactNode }) => {
  const {data: session, status} = useSession();
  const locale = useLocale();
  const [censusFormIsOpened, openCensusForm] = useState(false);
  const [censusStats, setCensusStats] = useState<undefined | CensusStats>(
    undefined
  );

  // Update user language preference on language change
  useEffect(() => {
    const updateLanguage = async () => {
      if (status !== 'authenticated' || locale === session?.user.language) {
        return;
      }
      fetch(`/api/account/profile/update/language`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ language: locale, }),
      });
    }
    void updateLanguage();
  }, [locale, session?.user, status]);

  // after registration, update the census statistics
  const updateCensusStats = () => {
    fetch("/api/census/stats")
      .then((res) => res.json())
      .then((stats) => {
        if (!stats.success) {
          console.error(stats.messages);
          return;
        }
        setCensusStats(stats.data);
      })
      .catch((error) => console.error(error));
  };

  const esyrian: ESContextType = useMemo(
    () => ({
      openCensusForm,
      censusFormIsOpened,
      censusStats,
      updateCensusStats,
    }),
    [censusFormIsOpened, censusStats]
  );
  return <EsContext.Provider value={esyrian}>
    {children}
  </EsContext.Provider>;
};

export default EsyrianProvider;
