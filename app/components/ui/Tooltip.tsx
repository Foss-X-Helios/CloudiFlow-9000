import { type ReactNode, useCallback, useRef, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  content: {
    name: string;
    description: string;
    useCase?: string;
    icon?: ReactNode;
  };
  /** "top" shows above the element, "right" shows to the right using fixed positioning (avoids overflow clipping) */
  position?: "top" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  if (position === "right") {
    return <RightTooltip content={content}>{children}</RightTooltip>;
  }

  return (
    <div className="group/tip relative">
      {children}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 transition-all duration-200 delay-300">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 mb-1.5">
            {content.icon && (
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {content.icon}
              </div>
            )}
            <span className="text-[13px] font-semibold text-white">
              {content.name}
            </span>
          </div>
          <p className="text-[11px] text-[#aaa] leading-relaxed">
            {content.description}
          </p>
          {content.useCase && (
            <p className="text-[10px] text-[#777] leading-relaxed mt-1.5 italic">
              {content.useCase}
            </p>
          )}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-[#1a1a1a] border-r border-b border-[#333] rotate-45 -mt-1" />
      </div>
    </div>
  );
}

/** Fixed-position tooltip that appears to the right, escaping overflow containers */
function RightTooltip({
  children,
  content,
}: {
  children: ReactNode;
  content: TooltipProps["content"];
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 256;
    const tooltipHeight = 150; // approximate
    let top = rect.top + rect.height / 2 - tooltipHeight / 2;
    const left = rect.right + 8;

    // Edge-aware: clamp to viewport
    if (top < 8) top = 8;
    if (top + tooltipHeight > window.innerHeight - 8) {
      top = window.innerHeight - 8 - tooltipHeight;
    }
    // If tooltip would overflow right edge, show on left instead
    const actualLeft =
      left + tooltipWidth > window.innerWidth - 8
        ? rect.left - tooltipWidth - 8
        : left;

    setCoords({ top, left: actualLeft });
    timerRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    // biome-ignore lint/a11y/useSemanticElements: tooltip wrapper, not a fieldset
    <div role="group" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className="fixed z-50 w-64 pointer-events-none animate-in fade-in duration-150"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-1.5">
              {content.icon && (
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {content.icon}
                </div>
              )}
              <span className="text-[13px] font-semibold text-white">
                {content.name}
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] leading-relaxed">
              {content.description}
            </p>
            {content.useCase && (
              <p className="text-[10px] text-[#777] leading-relaxed mt-1.5 italic">
                {content.useCase}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
