import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/api/auth.api";
import type { VoiceLanguageCode } from "@/features/voice/types/voice.types";
import { getTranslation } from "@/locales/translations";

interface LanguageContextValue {
  language: VoiceLanguageCode;
  shortLang: string;
  setLanguage: (code: VoiceLanguageCode) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: Array<{
    code: VoiceLanguageCode;
    name: string;
    nativeName: string;
  }>;
}

export const SUPPORTED_LANGUAGES_LIST: Array<{
  code: VoiceLanguageCode;
  name: string;
  nativeName: string;
}> = [
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  { code: "en-IN", name: "English", nativeName: "English" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  { code: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ne-IN", name: "Nepali", nativeName: "नेपाली" },
  { code: "mni-IN", name: "Manipuri", nativeName: "মৈতৈলোন্" },
  { code: "brx-IN", name: "Bodo", nativeName: "बड़ो" },
];

const STORAGE_KEY = "smritisetu_preferred_language";

function normalizeLanguageCode(raw: string | undefined | null): VoiceLanguageCode {
  if (!raw) return "en-IN";
  const lower = raw.trim().toLowerCase();
  if (lower.startsWith("hi")) return "hi-IN";
  if (lower.startsWith("te")) return "te-IN";
  if (lower.startsWith("ta")) return "ta-IN";
  if (lower.startsWith("mr")) return "mr-IN";
  if (lower.startsWith("gu")) return "gu-IN";
  if (lower.startsWith("bn")) return "bn-IN";
  if (lower.startsWith("as")) return "as-IN";
  if (lower.startsWith("ne")) return "ne-IN";
  if (lower.startsWith("mn")) return "mni-IN";
  if (lower.startsWith("br")) return "brx-IN";
  if (lower.startsWith("en")) return "en-IN";
  return "en-IN";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, refetchMe } = useAuth();

  const [language, setLanguageState] = useState<VoiceLanguageCode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return normalizeLanguageCode(stored);
    }
    return "en-IN";
  });

  // Sync from user profile when user logs in or profile changes
  useEffect(() => {
    if (user?.preferred_language) {
      const normalized = normalizeLanguageCode(user.preferred_language);
      setLanguageState(normalized);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, normalized);
        } catch {
          // ignore
        }
      }
    }
  }, [user?.preferred_language]);

  const shortLang = language.slice(0, 2);

  const setLanguage = useCallback(
    async (code: VoiceLanguageCode) => {
      const normalized = normalizeLanguageCode(code);
      setLanguageState(normalized);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, normalized);
          window.dispatchEvent(
            new CustomEvent("smritisetu:language-change", { detail: { language: normalized } }),
          );
        } catch {
          // ignore
        }
      }

      // Persist to backend database for authenticated patient
      if (isAuthenticated && user?.id) {
        try {
          await authApi.updateProfile({ preferred_language: normalized });
          await refetchMe();
        } catch (err) {
          console.warn("Could not save language preference to backend profile:", err);
        }
      }
    },
    [isAuthenticated, refetchMe, user?.id],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params),
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        shortLang,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES_LIST,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      language: "en-IN" as VoiceLanguageCode,
      shortLang: "en",
      setLanguage: async () => {},
      t: (key: string, params?: Record<string, string | number>) => getTranslation("en-IN", key, params),
      supportedLanguages: SUPPORTED_LANGUAGES_LIST,
    };
  }
  return ctx;
}
