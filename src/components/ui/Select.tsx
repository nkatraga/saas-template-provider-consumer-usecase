import { forwardRef, type SelectHTMLAttributes } from "react";

// [Template] — Select dropdown with label and error state support.

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const selectBase =
  "w-full px-4 py-2 border border-border-strong rounded-[var(--ds-radius-default)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-150 text-sm bg-surface disabled:bg-surface-hover disabled:text-muted disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b5c4f%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10";

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = "", id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${selectBase} ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };
