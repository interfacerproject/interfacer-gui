import PLabel from "components/polaris/PLabel";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface RangeSliderFieldProps {
  label: string;
  valueName: string;
  unitName: string;
  defaultUnit: string;
  min: number;
  max: number;
  step?: number;
}

export const RangeSliderField = ({
  label,
  valueName,
  unitName,
  defaultUnit,
  min,
  max,
  step = 1,
}: RangeSliderFieldProps) => {
  const { control, setValue, watch } = useFormContext();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const valueFieldValue = watch(valueName);
  const unitFieldValue = watch(unitName);

  useEffect(() => {
    if (!unitFieldValue) {
      setValue(unitName, defaultUnit);
    }
  }, [unitFieldValue, unitName, defaultUnit, setValue]);

  const clampAndStep = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const getValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return clampAndStep(min + ratio * (max - min));
    },
    [min, max, clampAndStep]
  );

  const currentValue = typeof valueFieldValue === "number" ? valueFieldValue : Number(valueFieldValue) || min;
  const percent = ((currentValue - min) / (max - min)) * 100;

  const formatValue = (val: number) => {
    const unit = unitFieldValue || defaultUnit;
    if (unit === "%") return `${val}%`;
    return `${val} ${unit}`;
  };

  return (
    <Controller
      control={control}
      name={valueName}
      render={({ field: { onChange } }) => {
        const handlePointerDown = (e: React.PointerEvent) => {
          draggingRef.current = true;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          const newVal = getValueFromPointer(e.clientX);
          onChange(newVal);
        };

        const handlePointerMove = (e: React.PointerEvent) => {
          if (!draggingRef.current) return;
          const newVal = getValueFromPointer(e.clientX);
          onChange(newVal);
        };

        const handlePointerUp = () => {
          draggingRef.current = false;
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <PLabel label={label} />
              <span className="text-sm font-bold text-[#0b1324]">{formatValue(currentValue)}</span>
            </div>
            <div
              ref={trackRef}
              className="relative h-4 cursor-pointer select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Background track */}
              <div className="absolute top-0 left-2 right-2 h-4 rounded-full bg-[rgba(200,212,229,0.5)]" />
              {/* Filled track */}
              <div
                className="absolute top-0 left-2 h-4 rounded-full bg-[#036a53]"
                style={{ width: `calc(${percent}% - 16px)` }}
              />
              {/* Handle */}
              <div
                className="absolute top-0 w-4 h-4 bg-white border border-[#036a53] rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] touch-none"
                style={{ left: `calc(${percent}% - 8px)` }}
              />
            </div>
          </div>
        );
      }}
    />
  );
};
