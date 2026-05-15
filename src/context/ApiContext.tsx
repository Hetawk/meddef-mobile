import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STORAGE_KEY_API_BASE } from "@/config/app";

type Ctx = {
  baseUrl: string;
  ready: boolean;
  setBaseUrl: (u: string) => Promise<void>;
};

const ApiContext = createContext<Ctx | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY_API_BASE);
        if (v) setBaseUrlState(v.trim().replace(/\/+$/, ""));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setBaseUrl = useCallback(async (u: string) => {
    const t = u.trim().replace(/\/+$/, "");
    setBaseUrlState(t);
    if (t) await AsyncStorage.setItem(STORAGE_KEY_API_BASE, t);
    else await AsyncStorage.removeItem(STORAGE_KEY_API_BASE);
  }, []);

  return (
    <ApiContext.Provider value={{ baseUrl, ready, setBaseUrl }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiBase(): Ctx {
  const c = useContext(ApiContext);
  if (!c) throw new Error("useApiBase must be used within ApiProvider");
  return c;
}
