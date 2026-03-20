import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

// PUBLIC_INTERFACE
export function cn(...classes: Array<string | undefined | false>) {
  /** Utility for joining class names safely. */
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
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
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
    primary: "bg-gray-900 text-white shadow-sm hover:bg-gray-800 active:bg-gray-900",
    secondary:
      "bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-white",
    ghost: "bg-transparent text-gray-700 hover:bg-white/70 active:bg-white/80",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-600",
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
  hint,
  error,
  leftAdornment,
  rightAdornment,
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
  /** Optional helper text */
  hint?: string;
  /** Optional error text */
  error?: string | null;
  /** Optional left adornment element (icon) */
  leftAdornment?: React.ReactNode;
  /** Optional right adornment element (icon) */
  rightAdornment?: React.ReactNode;
}) {
  /** Labeled input with accessible semantics and optional adornments. */
  const describedByIds: string[] = [];
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = error ? `${name}-error` : undefined;
  if (hintId) describedByIds.push(hintId);
  if (errId) describedByIds.push(errId);

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-gray-800">{label}</span>
      <div className="relative">
        {leftAdornment ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftAdornment}
          </span>
        ) : null}
        {rightAdornment ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightAdornment}
          </span>
        ) : null}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedByIds.length ? describedByIds.join(" ") : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-4",
            "focus:border-blue-400 focus:ring-blue-500/10",
            leftAdornment ? "pl-10" : undefined,
            rightAdornment ? "pr-10" : undefined,
            error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200"
          )}
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-gray-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="text-xs leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Card({
  children,
  className,
}: {
  /** Card contents */
  children: React.ReactNode;
  /** Optional className overrides */
  className?: string;
}) {
  /** Surface card used throughout the SaaS shell. */
  return (
    <section className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>
      {children}
    </section>
  );
}

// PUBLIC_INTERFACE
export function CardHeader({
  title,
  subtitle,
  right,
  className,
}: {
  /** Header title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional right-side content */
  right?: React.ReactNode;
  /** Optional className overrides */
  className?: string;
}) {
  /** Standard card header with title + optional actions. */
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold tracking-tight text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-gray-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex flex-none items-center gap-2">{right}</div> : null}
    </header>
  );
}

// PUBLIC_INTERFACE
export function CardBody({
  children,
  className,
}: {
  /** Body content */
  children: React.ReactNode;
  /** Optional className overrides */
  className?: string;
}) {
  /** Standard card body padding. */
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

// PUBLIC_INTERFACE
export function PageHeader({
  title,
  subtitle,
  actions,
  crumb,
}: {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional action buttons */
  actions?: React.ReactNode;
  /** Optional breadcrumb element */
  crumb?: React.ReactNode;
}) {
  /** Consistent page header used across main app pages. */
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200/70 bg-white/60 px-4 py-4 backdrop-blur sm:px-6">
      {crumb ? <div className="text-xs font-medium text-gray-500">{crumb}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm leading-relaxed text-gray-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Separator({ className }: { /** Optional className overrides */ className?: string }) {
  /** Thin separator line. */
  return <div className={cn("h-px w-full bg-gray-200/80", className)} />;
}
