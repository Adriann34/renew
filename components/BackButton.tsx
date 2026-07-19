import Link from "next/link";

/**
 * Icon-only circular back link. On lg+ it parks in the left margin beside the
 * page heading (the parent must be `relative` and horizontally centered);
 * below that the gutter disappears, so it stacks above the content.
 */
export function BackButton({
  href = "/",
  label = "Back to home",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="mb-8 w-10 h-10 flex items-center justify-center rounded-full border border-line text-ink-dim hover:text-ink hover:border-ink transition-colors lg:absolute lg:right-full lg:top-22 lg:mr-6 lg:mb-0"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </Link>
  );
}
