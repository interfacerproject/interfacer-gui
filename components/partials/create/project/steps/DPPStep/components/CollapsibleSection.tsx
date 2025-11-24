import { Collapsible, Icon } from "@bbtgnn/polaris-interfacer";
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
  children: ReactNode;
}

export const CollapsibleSection = ({ title, isOpen, onToggle, id, children }: CollapsibleSectionProps) => {
  return (
    <>
      <div className="h-px bg-gray-300 w-full" />
      <div>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
        >
          <span className="font-medium text-sm">{title}</span>
          <div>
            <Icon source={isOpen ? ChevronUpMinor : ChevronDownMinor} />
          </div>
        </button>

        <Collapsible open={isOpen} id={id}>
          <div className="pt-4 pb-2">{children}</div>
        </Collapsible>
      </div>
    </>
  );
};
