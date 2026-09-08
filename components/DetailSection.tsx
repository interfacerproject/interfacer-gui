import { ChevronDown } from "@carbon/icons-react";
import { ReactNode, useCallback, useEffect, useState } from "react";

interface DetailSectionProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  sectionId?: string;
  onOpen?: () => void;
  /** When false the section body is always visible and the header does not collapse it. */
  collapsible?: boolean;
  children: ReactNode;
}

export default function DetailSection({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  defaultOpen = false,
  sectionId,
  onOpen,
  collapsible = true,
  children,
}: DetailSectionProps) {
  const [open, setOpen] = useState(collapsible ? defaultOpen : true);

  const handleOpenEvent = useCallback(
    (e: Event) => {
      if (sectionId && (e as CustomEvent).detail === sectionId) {
        if (!open) onOpen?.();
        setOpen(true);
      }
    },
    [onOpen, open, sectionId]
  );

  useEffect(() => {
    window.addEventListener("open-section", handleOpenEvent);
    return () => window.removeEventListener("open-section", handleOpenEvent);
  }, [handleOpenEvent]);

  const headerInner = (
    <>
      <div className={`flex items-center justify-center w-10 h-10 rounded-ifr-sm shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--ifr-font-heading)" }}>
            {title}
          </h3>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-ifr-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {collapsible && (
        <ChevronDown
          size={20}
          className={`shrink-0 text-ifr-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      )}
    </>
  );

  return (
    <div id={sectionId} className="bg-ifr-surface border border-ifr rounded-ifr-md shadow-ifr-sm overflow-hidden">
      {collapsible ? (
        <button
          type="button"
          onClick={() => {
            if (!open) onOpen?.();
            setOpen(!open);
          }}
          className="flex items-center w-full gap-4 p-6 text-left"
          aria-expanded={open}
          aria-controls={sectionId ? `${sectionId}-content` : undefined}
        >
          {headerInner}
        </button>
      ) : (
        <div className="flex items-center w-full gap-4 p-6 text-left">{headerInner}</div>
      )}
      {open && (
        <>
          <div className="border-t border-ifr mx-6" />
          <div id={sectionId ? `${sectionId}-content` : undefined} className="p-6">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
