import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

// [Template] — Button component with variant system (primary, secondary, outline, ghost, danger) and size props.

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50",
  secondary:
    "border border-border-strong text-foreground hover:bg-surface-hover active:bg-surface-hover disabled:opacity-50",
  danger:
    "bg-danger text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50",
  ghost:
    "text-foreground hover:bg-surface-hover active:bg-surface-hover disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1 text-sm rounded-[var(--ds-radius-sm)]",
  default: "px-6 py-2 text-sm rounded-[var(--ds-radius-default)]",
  lg: "px-8 py-2.5 text-base rounded-[var(--ds-radius-default)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
