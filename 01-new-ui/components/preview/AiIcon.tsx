/*
 * AI icon set — PREVIEW ONLY, inline SVG, no dependency.
 *
 * Authority: LRG-UI-012 §8.
 *
 * RULES IMPLEMENTED
 *  - Inline SVG only. No icon library is installed and none is imported.
 *  - `currentColor` throughout, so an icon inherits its context's colour and stays contrast-correct
 *    wherever it is placed.
 *  - Icons SUPPORT text and never replace a label. Every caller renders a visible label beside them.
 *  - Decorative by default (`aria-hidden`), because the adjacent text already carries the meaning.
 *    A caller that genuinely needs a standalone icon passes `title`, which promotes it to
 *    `role="img"` with an accessible name.
 *  - No animation of any kind — nothing continuous, nothing on load.
 *
 * DELIBERATELY AVOIDED, per §8: robot heads, brains, circuit boards, and sparkle confetti. The
 * primary mark is a single four-point spark inside a rounded container — calm, and readable at 16px.
 */

type IconProps = {
  /** Rendered size in px. Defaults suit inline use beside 14–16px text. */
  size?: number;
  /** Supplying a title makes the icon a labelled image instead of decoration. */
  title?: string;
  className?: string;
};

function svgProps({ size = 18, title }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    /* Decorative unless the caller gives it a name. */
    ...(title ? { role: "img" as const } : { "aria-hidden": true as const, focusable: false }),
  };
}

/**
 * THE primary LotteryCorner AI mark. One consistent shape used everywhere AI is identified — the
 * shell action, the value statement, the H-05 badge and the analysis areas.
 */
export function AiMark({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <rect x="2.5" y="2.5" width="19" height="19" rx="6" stroke="currentColor" strokeWidth="1.5" />
      {/*
        Four-point spark — one mark, no confetti.
        Geometry matters at 16px: the first version spanned only 7.2-16.8 with a narrow waist and read
        as a plus sign inside a box. Outer radius is now 7.4 with an inner radius of ~2.7, which is
        unmistakably a spark at inline sizes.
      */}
      <path
        d="M12 4.6L13.9 10.1L19.4 12L13.9 13.9L12 19.4L10.1 13.9L4.6 12L10.1 10.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Frequency — a bar chart. */
export function IconFrequency({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4 20V13m5 7V8m5 12v-5m5 5V5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** History and last-seen — a clock. */
export function IconHistory({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Comparison — two opposed arrows. */
export function IconCompare({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4 9h13l-3.2-3.2M20 15H7l3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Draw analysis — a magnifier over number dots. */
export function IconDrawAnalysis({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <circle cx="4" cy="19" r="1.6" fill="currentColor" />
      <circle cx="9" cy="19" r="1.6" fill="currentColor" />
      <circle cx="14" cy="19" r="1.6" fill="currentColor" />
      <circle cx="13" cy="9.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17.2 13.7L21 17.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Structural patterns, pairs and composition — connected dots. */
export function IconPattern({ size = 18, title, className }: IconProps) {
  return (
    <svg {...svgProps({ size, title })} className={className}>
      {title ? <title>{title}</title> : null}
      <path d="M6.5 7.5l11 4-11 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5.5" cy="7" r="2.2" fill="currentColor" />
      <circle cx="18.5" cy="11.5" r="2.2" fill="currentColor" />
      <circle cx="5.5" cy="16.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Maps an observation's icon hint to a component. */
export function ObservationIcon({
  kind,
  size = 16,
}: {
  kind: "composition" | "frequency" | "history" | "pattern" | "compare";
  size?: number;
}) {
  switch (kind) {
    case "frequency":
      return <IconFrequency size={size} />;
    case "history":
      return <IconHistory size={size} />;
    case "compare":
      return <IconCompare size={size} />;
    case "pattern":
      return <IconPattern size={size} />;
    default:
      return <IconDrawAnalysis size={size} />;
  }
}
