import { ChevronDown } from "@carbon/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ToolbarDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function ToolbarDropdown({ label, value, options, onChange }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClose = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [handleClose]);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-2">
      <span className="text-sm text-ifr-text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-ifr-sm border border-transparent hover:border-ifr transition-colors"
      >
        {value}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-ifr-surface border border-ifr rounded-ifr-sm shadow-ifr-dropdown z-50">
          {options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-ifr-hover-light transition-colors ${
                option === value ? "font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
