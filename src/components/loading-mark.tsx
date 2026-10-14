export function LoadingMark({ className = "" }: { className?: string }) {
  return (
    <span className={`paint-wave ${className}`.trim()} aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
