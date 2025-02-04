"use client";
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
};

export const EsContext = createContext<ESContextType>({
  openCensusForm: () => {},
  censusFormIsOpened: false,
});

export const useEsyrian = (): ESContextType => useContext(EsContext);

const EsyrianProvider = ({ children }: { children: ReactNode }) => {
  const [censusFormIsOpened, openCensusForm] = useState(false);

  const esyrian: ESContextType = useMemo(
    () => ({
      openCensusForm,
      censusFormIsOpened,
    }),
    [censusFormIsOpened]
  );
  return <EsContext.Provider value={esyrian}>{children}</EsContext.Provider>;
};

export default EsyrianProvider;
