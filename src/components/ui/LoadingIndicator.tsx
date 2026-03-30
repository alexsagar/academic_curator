import Icon from "@/components/ui/Icon";

interface LoadingIndicatorProps {
  label?: string;
  className?: string;
  iconClassName?: string;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function LoadingIndicator({
  label = "Loading...",
  className,
  iconClassName,
}: LoadingIndicatorProps) {
  const hasLabel = label.trim().length > 0;

  return (
    <div
      className={joinClasses(
        "inline-flex items-center justify-center gap-3 text-on-surface-variant",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon name="autorenew" className={joinClasses("icon-spin", iconClassName)} />
      {hasLabel ? <span>{label}</span> : null}
    </div>
  );
}
