"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const MIN_THUMB_PX = 20;
const GOLD = "#d6a84f";

export function CatalogFiltersScrollArea({
  children,
  className,
  contentClassName,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{
    visible: boolean;
    height: number;
    top: number;
  }>({ visible: false, height: 0, top: 0 });
  const [active, setActive] = useState(false);
  const activeTimeoutRef = useRef<number | null>(null);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight - clientHeight;
    const trackInset = 8;
    const trackHeight = Math.max(0, clientHeight - trackInset * 2);

    if (overflow <= 1 || trackHeight <= 0) {
      setThumb({ visible: false, height: 0, top: 0 });
      return;
    }

    const height = Math.max(
      MIN_THUMB_PX,
      (clientHeight / scrollHeight) * trackHeight,
    );
    const maxTop = Math.max(0, trackHeight - height);
    const top = (scrollTop / overflow) * maxTop;

    setThumb({ visible: true, height, top });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateThumb();

    const onScroll = () => {
      updateThumb();
      setActive(true);
      if (activeTimeoutRef.current) {
        window.clearTimeout(activeTimeoutRef.current);
      }
      activeTimeoutRef.current = window.setTimeout(() => {
        setActive(false);
      }, 450);
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateThumb());
    resizeObserver.observe(el);
    const inner = el.firstElementChild;
    if (inner) resizeObserver.observe(inner);

    const mutationObserver = new MutationObserver(() => updateThumb());
    mutationObserver.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "style"],
    });

    window.addEventListener("resize", updateThumb);

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateThumb);
      if (activeTimeoutRef.current) {
        window.clearTimeout(activeTimeoutRef.current);
      }
    };
  }, [updateThumb]);

  return (
    <div className={`relative flex min-h-0 flex-col ${className ?? ""}`}>
      <div
        ref={scrollRef}
        className={`catalog-filters-scroll min-h-0 flex-1 overflow-y-auto ${contentClassName ?? ""}`}
      >
        <div>{children}</div>
      </div>

      {thumb.visible ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-1.5 top-2 w-[3px] overflow-hidden"
        >
          <div
            className="absolute left-0 top-0 w-full rounded-full"
            style={{
              height: thumb.height,
              transform: `translateY(${thumb.top}px)`,
              backgroundColor: GOLD,
              opacity: active ? 0.9 : 0.45,
              transition: "opacity 160ms ease",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
