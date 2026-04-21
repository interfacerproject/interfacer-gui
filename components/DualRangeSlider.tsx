// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import React, { useCallback, useRef } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  valueLow: number;
  valueHigh: number;
  step?: number;
  unit?: string;
  onChange: (low: number, high: number) => void;
}

export default function DualRangeSlider({
  min,
  max,
  valueLow,
  valueHigh,
  step = 1,
  unit = "",
  onChange,
}: DualRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)) / step) * step;

  const pctLow = ((valueLow - min) / (max - min)) * 100;
  const pctHigh = ((valueHigh - min) / (max - min)) * 100;

  const handlePointerDown = useCallback(
    (handle: "low" | "high") => (e: React.PointerEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;

      const onMove = (ev: PointerEvent) => {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        const raw = min + pct * (max - min);
        const val = clamp(raw);
        if (handle === "low") {
          onChange(Math.min(val, valueHigh - step), valueHigh);
        } else {
          onChange(valueLow, Math.max(val, valueLow + step));
        }
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, step, valueLow, valueHigh, onChange]
  );

  const formatVal = (v: number) => `${v}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="flex flex-col gap-2">
      {/* Track */}
      <div ref={trackRef} className="relative h-4 flex items-center select-none touch-none">
        {/* Background track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ backgroundColor: "var(--ifr-border)" }} />

        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            left: `${pctLow}%`,
            right: `${100 - pctHigh}%`,
            backgroundColor: "var(--ifr-green)",
          }}
        />

        {/* Low handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 rounded-full shadow-sm cursor-grab active:cursor-grabbing"
          style={{
            left: `${pctLow}%`,
            transform: "translateX(-50%)",
            borderColor: "var(--ifr-green)",
          }}
          onPointerDown={handlePointerDown("low")}
        />

        {/* High handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 rounded-full shadow-sm cursor-grab active:cursor-grabbing"
          style={{
            left: `${pctHigh}%`,
            transform: "translateX(-50%)",
            borderColor: "var(--ifr-green)",
          }}
          onPointerDown={handlePointerDown("high")}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        <span
          className="text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {formatVal(valueLow)}
        </span>
        <span
          className="text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {formatVal(valueHigh)}
        </span>
      </div>
    </div>
  );
}
