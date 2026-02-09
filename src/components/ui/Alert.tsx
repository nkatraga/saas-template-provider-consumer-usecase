import type { HTMLAttributes, ReactNode } from "react";

// [Template] — Alert component with info, success, warning, and error variants.

type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  success: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-red-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
};

function Alert({
  variant = "info",
  className = "",
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={`border rounded-[var(--ds-radius-default)] p-3 text-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Alert };
export type { AlertProps };
