import { ChevronDown } from "@carbon/icons-react";
import { ReactNode, useState } from "react";

interface FilterSectionProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}

export default function FilterSection({ icon, label, children, defaultOpen = false, badge }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ifr">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center w-full gap-3 px-6 py-4 text-left hover:bg-ifr-hover-light transition-colors"
      >
        <span className="text-ifr-text-secondary">{icon}</span>
        <span className="flex-1" style={{ fontSize: "var(--ifr-fs-md)", fontWeight: 500, lineHeight: "24px" }}>
          {label}
        </span>
        {badge != null && badge > 0 && (
          <span
            className="px-1.5 py-0.5 font-medium bg-ifr-yellow rounded-ifr-sm"
            style={{ fontSize: "var(--ifr-fs-xs)", lineHeight: "16px" }}
          >
            {badge}
          </span>
        )}
        <ChevronDown size={16} className={`text-ifr-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}
