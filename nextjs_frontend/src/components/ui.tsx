import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

/** Utility for joining class names safely */
function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

// PUBLIC_INTERFACE
export function Container({
  children,
  className,
}: {
  /** Inner content */
  children: React.ReactNode;
  /** Optional className overrides */
  className?: string;
}) {
  /** Centered responsive container used across marketing/auth pages. */
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Badge({
  children,
  className,
}: {
  /** Badge label */
  children: React.ReactNode;
  /** Optional className overrides */
  className?: string;
}) {
  /** Small badge used for labels like "New", "Secure", etc. */
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  );
}

// PUBLIC_INTERFACE
export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
}: {
  /** Button label/content */
  children: React.ReactNode;
  /** Variant style */
  variant?: ButtonVariant;
  /** Optional className overrides */
  className?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
}) {
  /** Accessible button component with consistent styling. */
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

  const styles: Record<ButtonVariant, string> = {
    primary:
      "bg-gray-900 text-white shadow-sm hover:bg-gray-800 active:bg-gray-900",
    secondary:
      "bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-white",
    ghost: "bg-transparent text-gray-700 hover:bg-white/70 active:bg-white/80",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, styles[variant], className)}
    >
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function Input({
  label,
  type = "text",
  name,
  placeholder,
  autoComplete,
  value,
  onChange,
  required,
}: {
  /** Visible label */
  label: string;
  /** Input type */
  type?: React.HTMLInputTypeAttribute;
  /** HTML name */
  name: string;
  /** Placeholder text */
  placeholder?: string;
  /** Autocomplete hint */
  autoComplete?: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (v: string) => void;
  /** Required flag */
  required?: boolean;
}) {
  /** Labeled input with accessible semantics. */
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-gray-800">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}
