import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { STORAGE_KEY_API_BASE } from "@/config/app";

type Ctx = {
  baseUrl: string;
  ready: boolean;
  setBaseUrl: (u: string) => Promise<void>;
};

const ApiContext = createContext<Ctx | null>(null);

function normalizeBaseInput(u: string): string {
  return u.trim().replace(/\/+$/, "");
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState(API_BASE_URL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_API_BASE);
        const t = raw != null ? normalizeBaseInput(raw) : "";
        setBaseUrlState(t || API_BASE_URL);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setBaseUrl = useCallback(async (u: string) => {
    const t = normalizeBaseInput(u);
    if (!t) {
      setBaseUrlState(API_BASE_URL);
      await AsyncStorage.removeItem(STORAGE_KEY_API_BASE);
      return;
    }
    setBaseUrlState(t);
    await AsyncStorage.setItem(STORAGE_KEY_API_BASE, t);
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
