"use client";

import { useEffect } from "react";
import { useLocalStorage } from "./storage";

export const FONT_SCALES = [0.875, 1, 1.125, 1.25, 1.4, 1.6] as const;
export type FontScale = (typeof FONT_SCALES)[number];

export function useReaderFontScale(): {
  scale: FontScale;
  setScale: (s: FontScale) => void;
  index: number;
  inc: () => void;
  dec: () => void;
  canInc: boolean;
  canDec: boolean;
} {
  const [scale, setScale] = useLocalStorage<FontScale>("readerScale", 1);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--reader-scale", String(scale));
    return () => {
      document.documentElement.style.removeProperty("--reader-scale");
    };
  }, [scale]);

  const index = FONT_SCALES.indexOf(scale);
  const safeIndex = index === -1 ? 1 : index;

  return {
    scale,
    setScale,
    index: safeIndex,
    inc: () => {
      const next = FONT_SCALES[Math.min(FONT_SCALES.length - 1, safeIndex + 1)];
      setScale(next);
    },
    dec: () => {
      const next = FONT_SCALES[Math.max(0, safeIndex - 1)];
      setScale(next);
    },
    canInc: safeIndex < FONT_SCALES.length - 1,
    canDec: safeIndex > 0,
  };
}
