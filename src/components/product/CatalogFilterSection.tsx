"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  showTopBorder?: boolean;
  children: ReactNode;
};

export function CatalogFilterSection({
  title,
  summary,
  defaultOpen = true,
  showTopBorder = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={showTopBorder ? "mt-3 border-t border-zinc-200 pt-3" : ""}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left text-[13px] font-bold tracking-tight text-zinc-900 transition hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
      >
        <span>{title}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-zinc-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {summary ? (
        <p className="mb-1.5 text-xs font-medium text-zinc-500">{summary}</p>
      ) : null}

      <div id={panelId} hidden={!open} className={open ? "block" : "hidden"}>
        {children}
      </div>
    </div>
  );
}
