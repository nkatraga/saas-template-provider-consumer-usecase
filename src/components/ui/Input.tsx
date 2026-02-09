import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

// [Template] — Input component with label, error state, and forwardRef support.

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const inputBase =
  "w-full px-4 py-2 border border-border-strong rounded-[var(--ds-radius-default)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-150 text-sm bg-surface disabled:bg-surface-hover disabled:text-muted disabled:cursor-not-allowed";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${inputBase} ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

/* ── Textarea ─────────────────────────────────────────── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${inputBase} ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
export type { InputProps, TextareaProps };
