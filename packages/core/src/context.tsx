import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { WeddingConfig } from './types';
import { createFormatters, type Formatters } from './utils/date';

/** Identity helper that gives autocompletion and type checking for a config object. */
export function defineWedding<T extends WeddingConfig>(config: T): T {
  return config;
}

interface WeddingContextValue {
  config: WeddingConfig;
  fmt: Formatters;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ config, children }: { config: WeddingConfig; children: ReactNode }) {
  const value = useMemo(() => ({ config, fmt: createFormatters(config.locale, config.timeZone, config.timeFormat) }), [config]);
  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding(): WeddingContextValue {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding() must be used inside <WeddingProvider>.');
  return ctx;
}
