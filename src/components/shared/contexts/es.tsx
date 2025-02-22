"use client";
import { CensusStats } from "@/lib/types/census";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
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
  const [censusFormIsOpened, openCensusForm] = useState(false);
  const [censusStats, setCensusStats] = useState<undefined | CensusStats>(
    undefined
  );

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
  return <EsContext.Provider value={esyrian}>{children}</EsContext.Provider>;
};

export default EsyrianProvider;
