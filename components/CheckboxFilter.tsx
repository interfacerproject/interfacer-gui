import { Search } from "@carbon/icons-react";
import { useMemo, useState } from "react";

interface CheckboxFilterProps {
  items: string[];
  searchPlaceholder?: string;
  selectedItems?: string[];
  onToggle?: (item: string) => void;
}

export default function CheckboxFilter({
  items,
  searchPlaceholder = "Search...",
  selectedItems = [],
  onToggle,
}: CheckboxFilterProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(
    () => (search ? items.filter(item => item.toLowerCase().includes(search.toLowerCase())) : items),
    [items, search]
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ifr-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-9 pl-9 pr-3 text-sm bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm focus:outline-none focus:border-ifr-green"
        />
      </div>
      <div className="overflow-y-auto max-h-[280px] space-y-3">
        {filteredItems.map(item => {
          const checked = selectedItems.includes(item);
          return (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <span
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onClick={() => onToggle?.(item)}
                onKeyDown={e => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onToggle?.(item);
                  }
                }}
                className={`flex items-center justify-center w-4 h-4 rounded-ifr-sm border shrink-0 transition-colors ${
                  checked ? "bg-ifr-green border-ifr-green" : "bg-white border-ifr"
                }`}
              >
                {checked && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                      stroke="white"
                      strokeWidth="1.16667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
